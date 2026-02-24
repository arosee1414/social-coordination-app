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
        var now = DateTime.UtcNow;

        var hangout = new HangoutRecord
        {
            Id = Guid.NewGuid().ToString(),
            Title = request.Title,
            Emoji = request.Emoji ?? "🎉",
            Description = request.Description,
            Location = request.Location,
            StartTime = request.StartTime,
            EndTime = request.EndTime,
            CreatedByUserId = userId,
            GroupId = request.GroupId,
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

        // Add invitees if provided
        if (request.InviteeUserIds != null)
        {
            foreach (var inviteeId in request.InviteeUserIds.Where(id => id != userId))
            {
                hangout.Attendees.Add(new HangoutAttendee
                {
                    UserId = inviteeId,
                    RsvpStatus = RSVPStatus.Pending,
                    RespondedAt = null
                });
            }
        }

        var response = await _cosmosContext.HangoutsContainer
            .CreateItemAsync(hangout, new PartitionKey(userId));

        _logger.LogInformation("Hangout {HangoutId} created by user {UserId}", hangout.Id, userId);

        return MapToResponse(response.Resource);
    }

    public async Task<HangoutResponse> GetHangoutAsync(string hangoutId, string userId)
    {
        var hangout = await GetHangoutRecordAsync(hangoutId);

        // Verify user is creator or attendee
        if (hangout.CreatedByUserId != userId && !hangout.Attendees.Any(a => a.UserId == userId))
            throw new UnauthorizedAccessException("You do not have access to this hangout");

        return MapToResponse(hangout);
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
        hangout.UpdatedAt = DateTime.UtcNow;

        var response = await _cosmosContext.HangoutsContainer
            .ReplaceItemAsync(hangout, hangoutId, new PartitionKey(hangout.CreatedByUserId));

        _logger.LogInformation("Hangout {HangoutId} updated by user {UserId}", hangoutId, userId);

        return MapToResponse(response.Resource);
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

        return MapToResponse(response.Resource);
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

        return MapToResponse(response.Resource);
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

    private static HangoutResponse MapToResponse(HangoutRecord hangout)
    {
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
            GroupId = hangout.GroupId,
            Attendees = hangout.Attendees.Select(a => new HangoutAttendeeResponse
            {
                UserId = a.UserId,
                RsvpStatus = a.RsvpStatus,
                RespondedAt = a.RespondedAt
            }).ToList(),
            Status = hangout.Status,
            CreatedAt = hangout.CreatedAt
        };
    }
}