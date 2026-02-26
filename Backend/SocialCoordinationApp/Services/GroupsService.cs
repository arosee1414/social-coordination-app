using Microsoft.Azure.Cosmos;
using SocialCoordinationApp.Infrastructure;
using SocialCoordinationApp.Models.Domain;
using SocialCoordinationApp.Models.DTOs.Requests;
using SocialCoordinationApp.Models.DTOs.Responses;
using SocialCoordinationApp.Models.Enums;

namespace SocialCoordinationApp.Services;

public class GroupsService : IGroupsService
{
    private readonly ICosmosContext _cosmosContext;
    private readonly ILogger<GroupsService> _logger;
    private readonly INotificationsService _notificationsService;

    public GroupsService(ICosmosContext cosmosContext, INotificationsService notificationsService, ILogger<GroupsService> logger)
    {
        _cosmosContext = cosmosContext;
        _logger = logger;
        _notificationsService = notificationsService;
    }

    public async Task<GroupResponse> CreateGroupAsync(string userId, CreateGroupRequest request)
    {
        var now = DateTime.UtcNow;

        var group = new GroupRecord
        {
            Id = Guid.NewGuid().ToString(),
            Name = request.Name,
            Emoji = request.Emoji ?? "👥",
            Description = request.Description,
            CreatedByUserId = userId,
            Members = new List<GroupMember>
            {
                new GroupMember
                {
                    UserId = userId,
                    Role = GroupMemberRole.Admin,
                    JoinedAt = now
                }
            },
            CreatedAt = now,
            UpdatedAt = now
        };

        // Add initial members if provided
        if (request.MemberUserIds != null)
        {
            foreach (var memberUserId in request.MemberUserIds.Where(id => id != userId))
            {
                group.Members.Add(new GroupMember
                {
                    UserId = memberUserId,
                    Role = GroupMemberRole.Member,
                    JoinedAt = now
                });
            }
        }

        var response = await _cosmosContext.GroupsContainer
            .CreateItemAsync(group, new PartitionKey(userId));

        _logger.LogInformation("Group {GroupId} created by user {UserId}", group.Id, userId);

        // Send MemberAdded notifications to all initial members (excluding creator)
        var creatorDisplayName = await GetUserDisplayNameAsync(userId);
        foreach (var member in group.Members.Where(m => m.UserId != userId))
        {
            try
            {
                await _notificationsService.CreateNotificationAsync(
                    recipientUserId: member.UserId,
                    actorUserId: userId,
                    type: NotificationType.MemberAdded,
                    title: $"{creatorDisplayName} added you",
                    message: $"to the group \"{group.Name}\"",
                    groupId: group.Id);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to create MemberAdded notification for user {UserId}", member.UserId);
            }
        }

        return await MapToResponseAsync(response.Resource);
    }

    public async Task<GroupResponse> GetGroupAsync(string groupId, string userId)
    {
        // Cross-partition query since we don't know the creator
        var queryDefinition = new QueryDefinition(
            "SELECT * FROM c WHERE c.id = @groupId")
            .WithParameter("@groupId", groupId);

        var groups = await _cosmosContext.GroupsContainer
            .QueryItemsCrossPartitionAsync<GroupRecord>(queryDefinition);

        var group = groups.FirstOrDefault()
            ?? throw new KeyNotFoundException($"Group {groupId} not found");

        // Verify user is a member
        if (!group.Members.Any(m => m.UserId == userId))
            throw new UnauthorizedAccessException("You are not a member of this group");

        return await MapToResponseAsync(group);
    }

    public async Task<List<GroupSummaryResponse>> GetUserGroupsAsync(string userId)
    {
        // Cross-partition query: find all groups where user is a member
        var queryDefinition = new QueryDefinition(
            "SELECT * FROM c WHERE ARRAY_CONTAINS(c.members, { 'userId': @userId }, true)")
            .WithParameter("@userId", userId);

        var groups = await _cosmosContext.GroupsContainer
            .QueryItemsCrossPartitionAsync<GroupRecord>(queryDefinition);

        return groups.Select(g => new GroupSummaryResponse
        {
            Id = g.Id,
            Name = g.Name,
            Emoji = g.Emoji,
            MemberCount = g.Members.Count
        }).ToList();
    }

    public async Task<GroupResponse> UpdateGroupAsync(string groupId, string userId, UpdateGroupRequest request)
    {
        var group = await GetGroupRecordAsync(groupId);

        // Only admin can update
        var member = group.Members.FirstOrDefault(m => m.UserId == userId);
        if (member == null || member.Role != GroupMemberRole.Admin)
            throw new UnauthorizedAccessException("Only group admins can update the group");

        if (request.Name != null) group.Name = request.Name;
        if (request.Emoji != null) group.Emoji = request.Emoji;
        if (request.Description != null) group.Description = request.Description;
        group.UpdatedAt = DateTime.UtcNow;

        var response = await _cosmosContext.GroupsContainer
            .ReplaceItemAsync(group, groupId, new PartitionKey(group.CreatedByUserId));

        _logger.LogInformation("Group {GroupId} updated by user {UserId}", groupId, userId);

        return await MapToResponseAsync(response.Resource);
    }

    public async Task DeleteGroupAsync(string groupId, string userId)
    {
        var group = await GetGroupRecordAsync(groupId);

        // Only the creator (admin) can delete
        if (group.CreatedByUserId != userId)
            throw new UnauthorizedAccessException("Only the group creator can delete the group");

        await _cosmosContext.GroupsContainer
            .DeleteItemAsync<GroupRecord>(groupId, new PartitionKey(group.CreatedByUserId));

        _logger.LogInformation("Group {GroupId} deleted by user {UserId}", groupId, userId);
    }

    public async Task<GroupResponse> AddMemberAsync(string groupId, string userId, AddGroupMemberRequest request)
    {
        var group = await GetGroupRecordAsync(groupId);

        // Only admins can add new members
        var requestingMember = group.Members.FirstOrDefault(m => m.UserId == userId);
        if (requestingMember == null || requestingMember.Role != GroupMemberRole.Admin)
            throw new UnauthorizedAccessException("Only group admins can add members");

        // Check if already a member
        if (group.Members.Any(m => m.UserId == request.UserId))
            throw new ArgumentException($"User {request.UserId} is already a member of this group");

        group.Members.Add(new GroupMember
        {
            UserId = request.UserId,
            Role = GroupMemberRole.Member,
            JoinedAt = DateTime.UtcNow
        });
        group.UpdatedAt = DateTime.UtcNow;

        var response = await _cosmosContext.GroupsContainer
            .ReplaceItemAsync(group, groupId, new PartitionKey(group.CreatedByUserId));

        _logger.LogInformation("User {MemberId} added to group {GroupId} by user {UserId}",
            request.UserId, groupId, userId);

        // Send MemberAdded notification to the newly added member
        try
        {
            var adderDisplayName = await GetUserDisplayNameAsync(userId);
            await _notificationsService.CreateNotificationAsync(
                recipientUserId: request.UserId,
                actorUserId: userId,
                type: NotificationType.MemberAdded,
                title: $"{adderDisplayName} added you",
                message: $"to the group \"{group.Name}\"",
                groupId: group.Id);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to create MemberAdded notification for user {UserId}", request.UserId);
        }

        return await MapToResponseAsync(response.Resource);
    }

    public async Task<GroupResponse> RemoveMemberAsync(string groupId, string userId, string memberUserId)
    {
        var group = await GetGroupRecordAsync(groupId);

        // Only admin or the member themselves can remove
        var requestingMember = group.Members.FirstOrDefault(m => m.UserId == userId);
        if (requestingMember == null)
            throw new UnauthorizedAccessException("You are not a member of this group");

        if (userId != memberUserId && requestingMember.Role != GroupMemberRole.Admin)
            throw new UnauthorizedAccessException("Only admins can remove other members");

        // Cannot remove the creator/last admin
        if (memberUserId == group.CreatedByUserId)
            throw new ArgumentException("Cannot remove the group creator");

        var memberToRemove = group.Members.FirstOrDefault(m => m.UserId == memberUserId)
            ?? throw new KeyNotFoundException($"User {memberUserId} is not a member of this group");

        group.Members.Remove(memberToRemove);
        group.UpdatedAt = DateTime.UtcNow;

        var response = await _cosmosContext.GroupsContainer
            .ReplaceItemAsync(group, groupId, new PartitionKey(group.CreatedByUserId));

        _logger.LogInformation("User {MemberId} removed from group {GroupId} by user {UserId}",
            memberUserId, groupId, userId);

        // Send MemberRemoved notification to the removed member (if removed by someone else)
        if (memberUserId != userId)
        {
            try
            {
                var removerDisplayName = await GetUserDisplayNameAsync(userId);
                await _notificationsService.CreateNotificationAsync(
                    recipientUserId: memberUserId,
                    actorUserId: userId,
                    type: NotificationType.MemberRemoved,
                    title: $"{removerDisplayName} removed you",
                    message: $"from the group \"{group.Name}\"",
                    groupId: group.Id);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to create MemberRemoved notification for user {UserId}", memberUserId);
            }
        }

        return await MapToResponseAsync(response.Resource);
    }

    public async Task<List<GroupSummaryResponse>> GetCommonGroupsAsync(string currentUserId, string otherUserId)
    {
        // Find all groups where both users are members
        var queryDefinition = new QueryDefinition(
            "SELECT * FROM c WHERE ARRAY_CONTAINS(c.members, { 'userId': @currentUserId }, true) AND ARRAY_CONTAINS(c.members, { 'userId': @otherUserId }, true)")
            .WithParameter("@currentUserId", currentUserId)
            .WithParameter("@otherUserId", otherUserId);

        var groups = await _cosmosContext.GroupsContainer
            .QueryItemsCrossPartitionAsync<GroupRecord>(queryDefinition);

        return groups.Select(g => new GroupSummaryResponse
        {
            Id = g.Id,
            Name = g.Name,
            Emoji = g.Emoji,
            MemberCount = g.Members.Count
        }).ToList();
    }

    private async Task<string> GetUserDisplayNameAsync(string userId)
    {
        try
        {
            var response = await _cosmosContext.UsersContainer
                .ReadItemAsync<UserRecord>(userId, new PartitionKey(userId));
            var user = response.Resource;
            return GetDisplayName(user);
        }
        catch
        {
            return userId;
        }
    }

    private async Task<GroupRecord> GetGroupRecordAsync(string groupId)
    {
        var queryDefinition = new QueryDefinition(
            "SELECT * FROM c WHERE c.id = @groupId")
            .WithParameter("@groupId", groupId);

        var groups = await _cosmosContext.GroupsContainer
            .QueryItemsCrossPartitionAsync<GroupRecord>(queryDefinition);

        return groups.FirstOrDefault()
            ?? throw new KeyNotFoundException($"Group {groupId} not found");
    }

    private async Task<Dictionary<string, UserRecord>> BatchLookupUsersAsync(IEnumerable<string> userIds)
    {
        var uniqueIds = userIds.Distinct().ToList();
        var result = new Dictionary<string, UserRecord>();
        if (uniqueIds.Count == 0) return result;

        // Build IN clause
        var parameters = new List<(string name, string value)>();
        for (int i = 0; i < uniqueIds.Count; i++)
        {
            parameters.Add(($"@id{i}", uniqueIds[i]));
        }
        var inClause = string.Join(", ", parameters.Select(p => p.name));
        var sql = $"SELECT * FROM c WHERE c.id IN ({inClause})";

        var queryDefinition = new QueryDefinition(sql);
        foreach (var (name, value) in parameters)
        {
            queryDefinition = queryDefinition.WithParameter(name, value);
        }

        var users = await _cosmosContext.UsersContainer
            .QueryItemsCrossPartitionAsync<UserRecord>(queryDefinition);

        foreach (var user in users)
        {
            result[user.Id] = user;
        }

        return result;
    }

    private static string GetDisplayName(UserRecord user)
    {
        var fullName = $"{user.FirstName} {user.LastName}".Trim();
        if (!string.IsNullOrEmpty(fullName)) return fullName;
        if (!string.IsNullOrEmpty(user.Email)) return user.Email;
        return user.Id;
    }

    private async Task<GroupResponse> MapToResponseAsync(GroupRecord group)
    {
        var userLookup = await BatchLookupUsersAsync(group.Members.Select(m => m.UserId));

        return new GroupResponse
        {
            Id = group.Id,
            Name = group.Name,
            Emoji = group.Emoji,
            Description = group.Description,
            CreatedByUserId = group.CreatedByUserId,
            Members = group.Members.Select(m =>
            {
                var displayName = userLookup.TryGetValue(m.UserId, out var u)
                    ? GetDisplayName(u)
                    : m.UserId;
                var profileImageUrl = userLookup.TryGetValue(m.UserId, out var u2)
                    ? u2.ProfileImageUrl
                    : null;

                return new GroupMemberResponse
                {
                    UserId = m.UserId,
                    DisplayName = displayName,
                    ProfileImageUrl = profileImageUrl,
                    Role = m.Role,
                    JoinedAt = m.JoinedAt
                };
            }).ToList(),
            CreatedAt = group.CreatedAt
        };
    }
}