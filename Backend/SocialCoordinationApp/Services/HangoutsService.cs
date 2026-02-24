using Microsoft.Azure.Cosmos;
using SocialCoordinationApp.Infrastructure;
using SocialCoordinationApp.Models.Domain;
using SocialCoordinationApp.Models.DTOs.Requests;
using SocialCoordinationApp.Models.DTOs.Responses;
using SocialCoordinationApp.Models.Enums;

namespace SocialCoordinationApp.Services;

public class HangoutsService : IHangoutsService
{
    private readonly ICosmosContext _cosmosContext;
    private readonly ILogger<HangoutsService> _logger;

    public HangoutsService(ICosmosContext cosmosContext, ILogger<HangoutsService> logger)
    {
        _cosmosContext = cosmosContext;
        _logger = logger;
    }

    public async Task<HangoutResponse> CreateHangoutAsync(string userId, CreateHangoutRequest request)
    {
        // Validate EndTime if provided
        if (request.EndTime.HasValue)
        {
            if (request.EndTime.Value <= request.StartTime)
                throw new ArgumentException("EndTime must be after StartTime");
            if ((request.EndTime.Value - request.StartTime).TotalHours > 24)
                throw new ArgumentException("Hangout duration cannot exceed 24 hours");
        }

        var now = DateTime.UtcNow;

        // Default EndTime to StartTime + 8 hours if not provided
        var endTime = request.EndTime ?? request.StartTime.AddHours(8);

        // Collect all invited group IDs from both GroupId (legacy) and InvitedGroupIds
        var allGroupIds = new List<string>();
        if (!string.IsNullOrEmpty(request.GroupId))
            allGroupIds.Add(request.GroupId);
        if (request.InvitedGroupIds != null)
            allGroupIds.AddRange(request.InvitedGroupIds);
        allGroupIds = allGroupIds.Distinct().ToList();

        var hangout = new HangoutRecord
        {
            Id = Guid.NewGuid().ToString(),
            Title = request.Title,
            Emoji = request.Emoji ?? "🎉",
            Description = request.Description,
            Location = request.Location,
            StartTime = request.StartTime,
            EndTime = endTime,
            CreatedByUserId = userId,
            GroupId = request.GroupId,
            InvitedGroupIds = allGroupIds,
            Attendees = new List<HangoutAttendee>
            {
                new HangoutAttendee
                {
                    UserId = userId,
                    RsvpStatus = RSVPStatus.Going,
                    RespondedAt = now
                }
            },
            Status = HangoutStatus.Active,
            CreatedAt = now,
            UpdatedAt = now
        };

        // Track already-added user IDs to avoid duplicates
        var addedUserIds = new HashSet<string> { userId };

        // Add individual invitees if provided
        if (request.InviteeUserIds != null)
        {
            foreach (var inviteeId in request.InviteeUserIds.Where(id => !addedUserIds.Contains(id)))
            {
                hangout.Attendees.Add(new HangoutAttendee
                {
                    UserId = inviteeId,
                    RsvpStatus = RSVPStatus.Pending,
                    RespondedAt = null
                });
                addedUserIds.Add(inviteeId);
            }
        }

        // Expand group members into attendees
        if (allGroupIds.Count > 0)
        {
            var groupRecords = await BatchLookupGroupsAsync(allGroupIds);
            foreach (var group in groupRecords.Values)
            {
                foreach (var member in group.Members)
                {
                    if (!addedUserIds.Contains(member.UserId))
                    {
                        hangout.Attendees.Add(new HangoutAttendee
                        {
                            UserId = member.UserId,
                            RsvpStatus = RSVPStatus.Pending,
                            RespondedAt = null
                        });
                        addedUserIds.Add(member.UserId);
                    }
                }
            }
        }

        var response = await _cosmosContext.HangoutsContainer
            .CreateItemAsync(hangout, new PartitionKey(userId));

        _logger.LogInformation("Hangout {HangoutId} created by user {UserId}", hangout.Id, userId);

        return await MapToResponseAsync(response.Resource);
    }

    public async Task<HangoutResponse> GetHangoutAsync(string hangoutId, string userId)
    {
        var hangout = await GetHangoutRecordAsync(hangoutId);

        // Verify user is creator or attendee
        if (hangout.CreatedByUserId != userId && !hangout.Attendees.Any(a => a.UserId == userId))
            throw new UnauthorizedAccessException("You do not have access to this hangout");

        return await MapToResponseAsync(hangout);
    }

    public async Task<List<HangoutSummaryResponse>> GetUserHangoutsAsync(string userId)
    {
        // Cross-partition query: find hangouts where user is creator or attendee
        var queryDefinition = new QueryDefinition(
            "SELECT * FROM c WHERE c.createdByUserId = @userId OR ARRAY_CONTAINS(c.attendees, { 'userId': @userId }, true)")
            .WithParameter("@userId", userId);

        var hangouts = await _cosmosContext.HangoutsContainer
            .QueryItemsCrossPartitionAsync<HangoutRecord>(queryDefinition);

        // Collect all unique attendee user IDs (up to 5 per hangout for preview)
        var allAttendeeIds = hangouts
            .SelectMany(h => h.Attendees.Take(5).Select(a => a.UserId))
            .Distinct()
            .ToList();

        // Batch-lookup user records for avatar URLs
        var avatarMap = new Dictionary<string, string?>();
        if (allAttendeeIds.Count > 0)
        {
            var userQuery = new QueryDefinition(
                "SELECT c.id, c.profileImageUrl FROM c WHERE ARRAY_CONTAINS(@userIds, c.id)")
                .WithParameter("@userIds", allAttendeeIds);

            var users = await _cosmosContext.UsersContainer
                .QueryItemsCrossPartitionAsync<UserRecord>(userQuery);

            foreach (var u in users)
            {
                avatarMap[u.Id] = u.ProfileImageUrl;
            }
        }

        return hangouts.Select(h => new HangoutSummaryResponse
        {
            Id = h.Id,
            Title = h.Title,
            Emoji = h.Emoji,
            Location = h.Location,
            StartTime = h.StartTime,
            EndTime = h.EndTime,
            AttendeeCount = h.Attendees.Count,
            Status = h.Status,
            CurrentUserRsvpStatus = h.Attendees
                .FirstOrDefault(a => a.UserId == userId)?.RsvpStatus,
            CreatedByUserId = h.CreatedByUserId,
            GroupId = h.GroupId,
            AttendeeAvatarUrls = h.Attendees
                .Take(5)
                .Select(a => avatarMap.GetValueOrDefault(a.UserId))
                .ToList()
        }).ToList();
    }

    public async Task<HangoutResponse> UpdateHangoutAsync(string hangoutId, string userId, UpdateHangoutRequest request)
    {
        var hangout = await GetHangoutRecordAsync(hangoutId);

        if (hangout.CreatedByUserId != userId)
            throw new UnauthorizedAccessException("Only the hangout creator can update it");

        if (request.Title != null) hangout.Title = request.Title;
        if (request.Emoji != null) hangout.Emoji = request.Emoji;
        if (request.Description != null) hangout.Description = request.Description;
        if (request.Location != null) hangout.Location = request.Location;
        if (request.StartTime.HasValue) hangout.StartTime = request.StartTime.Value;
        if (request.EndTime.HasValue) hangout.EndTime = request.EndTime.Value;

        // If StartTime changed but EndTime was not provided, recompute default
        if (request.StartTime.HasValue && !request.EndTime.HasValue)
        {
            hangout.EndTime = hangout.StartTime.AddHours(8);
        }

        // Validate duration does not exceed 24 hours
        if (hangout.EndTime.HasValue)
        {
            if (hangout.EndTime.Value <= hangout.StartTime)
                throw new ArgumentException("EndTime must be after StartTime");
            if ((hangout.EndTime.Value - hangout.StartTime).TotalHours > 24)
                throw new ArgumentException("Hangout duration cannot exceed 24 hours");
        }

        hangout.UpdatedAt = DateTime.UtcNow;

        var response = await _cosmosContext.HangoutsContainer
            .ReplaceItemAsync(hangout, hangoutId, new PartitionKey(hangout.CreatedByUserId));

        _logger.LogInformation("Hangout {HangoutId} updated by user {UserId}", hangoutId, userId);

        return await MapToResponseAsync(response.Resource);
    }

    public async Task DeleteHangoutAsync(string hangoutId, string userId)
    {
        var hangout = await GetHangoutRecordAsync(hangoutId);

        if (hangout.CreatedByUserId != userId)
            throw new UnauthorizedAccessException("Only the hangout creator can delete it");

        await _cosmosContext.HangoutsContainer
            .DeleteItemAsync<HangoutRecord>(hangoutId, new PartitionKey(hangout.CreatedByUserId));

        _logger.LogInformation("Hangout {HangoutId} deleted by user {UserId}", hangoutId, userId);
    }

    public async Task<HangoutResponse> UpdateRSVPAsync(string hangoutId, string userId, UpdateRSVPRequest request)
    {
        var hangout = await GetHangoutRecordAsync(hangoutId);

        var attendee = hangout.Attendees.FirstOrDefault(a => a.UserId == userId);
        if (attendee == null)
        {
            // User is not yet an attendee — add them
            hangout.Attendees.Add(new HangoutAttendee
            {
                UserId = userId,
                RsvpStatus = request.Status,
                RespondedAt = DateTime.UtcNow
            });
        }
        else
        {
            attendee.RsvpStatus = request.Status;
            attendee.RespondedAt = DateTime.UtcNow;
        }

        hangout.UpdatedAt = DateTime.UtcNow;

        var response = await _cosmosContext.HangoutsContainer
            .ReplaceItemAsync(hangout, hangoutId, new PartitionKey(hangout.CreatedByUserId));

        _logger.LogInformation("User {UserId} RSVP'd {Status} to hangout {HangoutId}",
            userId, request.Status, hangoutId);

        return await MapToResponseAsync(response.Resource);
    }

    public async Task<HangoutResponse> CancelHangoutAsync(string hangoutId, string userId)
    {
        var hangout = await GetHangoutRecordAsync(hangoutId);

        if (hangout.CreatedByUserId != userId)
            throw new UnauthorizedAccessException("Only the hangout creator can cancel it");

        hangout.Status = HangoutStatus.Cancelled;
        hangout.UpdatedAt = DateTime.UtcNow;

        var response = await _cosmosContext.HangoutsContainer
            .ReplaceItemAsync(hangout, hangoutId, new PartitionKey(hangout.CreatedByUserId));

        _logger.LogInformation("Hangout {HangoutId} cancelled by user {UserId}", hangoutId, userId);

        return await MapToResponseAsync(response.Resource);
    }

    private async Task<HangoutRecord> GetHangoutRecordAsync(string hangoutId)
    {
        var queryDefinition = new QueryDefinition(
            "SELECT * FROM c WHERE c.id = @hangoutId")
            .WithParameter("@hangoutId", hangoutId);

        var hangouts = await _cosmosContext.HangoutsContainer
            .QueryItemsCrossPartitionAsync<HangoutRecord>(queryDefinition);

        return hangouts.FirstOrDefault()
            ?? throw new KeyNotFoundException($"Hangout {hangoutId} not found");
    }

    private async Task<string> GetUserDisplayNameAsync(string userId)
    {
        try
        {
            var response = await _cosmosContext.UsersContainer
                .ReadItemAsync<UserRecord>(userId, new PartitionKey(userId));
            var user = response.Resource;
            var fullName = $"{user.FirstName} {user.LastName}".Trim();
            return string.IsNullOrEmpty(fullName) ? user.Email : fullName;
        }
        catch
        {
            return userId;
        }
    }

    private async Task<Dictionary<string, UserRecord>> BatchLookupUsersAsync(IEnumerable<string> userIds)
    {
        var uniqueIds = userIds.Distinct().ToList();
        var result = new Dictionary<string, UserRecord>();
        if (uniqueIds.Count == 0) return result;

        var queryDefinition = new QueryDefinition(
            "SELECT * FROM c WHERE ARRAY_CONTAINS(@userIds, c.id)")
            .WithParameter("@userIds", uniqueIds);

        var users = await _cosmosContext.UsersContainer
            .QueryItemsCrossPartitionAsync<UserRecord>(queryDefinition);

        foreach (var user in users)
        {
            result[user.Id] = user;
        }

        return result;
    }

    private async Task<Dictionary<string, GroupRecord>> BatchLookupGroupsAsync(IEnumerable<string> groupIds)
    {
        var uniqueIds = groupIds.Distinct().ToList();
        var result = new Dictionary<string, GroupRecord>();
        if (uniqueIds.Count == 0) return result;

        var queryDefinition = new QueryDefinition(
            "SELECT * FROM c WHERE ARRAY_CONTAINS(@groupIds, c.id)")
            .WithParameter("@groupIds", uniqueIds);

        var groups = await _cosmosContext.GroupsContainer
            .QueryItemsCrossPartitionAsync<GroupRecord>(queryDefinition);

        foreach (var group in groups)
        {
            result[group.Id] = group;
        }

        return result;
    }

    private static string GetDisplayName(UserRecord user)
    {
        var fullName = $"{user.FirstName} {user.LastName}".Trim();
        return string.IsNullOrEmpty(fullName) ? user.Email : fullName;
    }

    private async Task<HangoutResponse> MapToResponseAsync(HangoutRecord hangout)
    {
        var allUserIds = hangout.Attendees.Select(a => a.UserId)
            .Append(hangout.CreatedByUserId)
            .Distinct();

        var userLookup = await BatchLookupUsersAsync(allUserIds);

        var creatorName = userLookup.TryGetValue(hangout.CreatedByUserId, out var creator)
            ? GetDisplayName(creator)
            : hangout.CreatedByUserId;

        // Look up invited groups
        var invitedGroups = new List<InvitedGroupInfoResponse>();
        if (hangout.InvitedGroupIds.Count > 0)
        {
            var groupLookup = await BatchLookupGroupsAsync(hangout.InvitedGroupIds);
            invitedGroups = hangout.InvitedGroupIds
                .Where(id => groupLookup.ContainsKey(id))
                .Select(id => new InvitedGroupInfoResponse
                {
                    Id = groupLookup[id].Id,
                    Name = groupLookup[id].Name,
                    Emoji = groupLookup[id].Emoji,
                    MemberCount = groupLookup[id].Members.Count
                })
                .ToList();
        }

        return new HangoutResponse
        {
            Id = hangout.Id,
            Title = hangout.Title,
            Emoji = hangout.Emoji,
            Description = hangout.Description,
            Location = hangout.Location,
            StartTime = hangout.StartTime,
            EndTime = hangout.EndTime,
            CreatedByUserId = hangout.CreatedByUserId,
            CreatedByUserName = creatorName,
            GroupId = hangout.GroupId,
            InvitedGroupIds = hangout.InvitedGroupIds,
            InvitedGroups = invitedGroups,
            Attendees = hangout.Attendees.Select(a =>
            {
                var displayName = userLookup.TryGetValue(a.UserId, out var u)
                    ? GetDisplayName(u)
                    : a.UserId;
                var profileImageUrl = userLookup.TryGetValue(a.UserId, out var u2)
                    ? u2.ProfileImageUrl
                    : null;

                return new HangoutAttendeeResponse
                {
                    UserId = a.UserId,
                    DisplayName = displayName,
                    ProfileImageUrl = profileImageUrl,
                    RsvpStatus = a.RsvpStatus,
                    RespondedAt = a.RespondedAt
                };
            }).ToList(),
            Status = hangout.Status,
            CreatedAt = hangout.CreatedAt
        };
    }
}