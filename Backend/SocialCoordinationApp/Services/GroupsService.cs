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

    public GroupsService(ICosmosContext cosmosContext, ILogger<GroupsService> logger)
    {
        _cosmosContext = cosmosContext;
        _logger = logger;
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

        return MapToResponse(response.Resource);
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

        return MapToResponse(group);
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

        return MapToResponse(response.Resource);
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

        // Only members can add new members
        if (!group.Members.Any(m => m.UserId == userId))
            throw new UnauthorizedAccessException("You are not a member of this group");

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

        return MapToResponse(response.Resource);
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

        return MapToResponse(response.Resource);
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

    private static GroupResponse MapToResponse(GroupRecord group)
    {
        return new GroupResponse
        {
            Id = group.Id,
            Name = group.Name,
            Emoji = group.Emoji,
            Description = group.Description,
            CreatedByUserId = group.CreatedByUserId,
            Members = group.Members.Select(m => new GroupMemberResponse
            {
                UserId = m.UserId,
                Role = m.Role,
                JoinedAt = m.JoinedAt
            }).ToList(),
            CreatedAt = group.CreatedAt
        };
    }
}