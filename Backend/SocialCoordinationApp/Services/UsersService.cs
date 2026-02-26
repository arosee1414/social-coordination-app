using Microsoft.Azure.Cosmos;
using SocialCoordinationApp.Infrastructure;
using SocialCoordinationApp.Models.Domain;
using SocialCoordinationApp.Models.DTOs.Requests;
using SocialCoordinationApp.Models.DTOs.Responses;
using SocialCoordinationApp.Models.Enums;
using UserResponse = SocialCoordinationApp.Models.DTOs.Responses.UserResponse;

namespace SocialCoordinationApp.Services;

public class UsersService : IUsersService
{
    private readonly ICosmosContext _cosmosContext;
    private readonly ILogger<UsersService> _logger;

    public UsersService(ICosmosContext cosmosContext, ILogger<UsersService> logger)
    {
        _cosmosContext = cosmosContext;
        _logger = logger;
    }

    public async Task<UserResponse> CreateOrUpdateUserAsync(string clerkUserId, CreateUserRequest request)
    {
        var existing = await _cosmosContext.UsersContainer
            .ReadItemOrDefaultAsync<UserRecord>(clerkUserId, new PartitionKey(clerkUserId));

        var now = DateTime.UtcNow;

        var user = existing ?? new UserRecord
        {
            Id = clerkUserId,
            CreatedAt = now
        };

        user.Email = request.Email;
        user.FirstName = request.FirstName;
        user.LastName = request.LastName;
        user.ProfileImageUrl = request.ProfileImageUrl;
        user.UpdatedAt = now;

        var response = await _cosmosContext.UsersContainer
            .UpsertItemAsync(user, new PartitionKey(clerkUserId));

        _logger.LogInformation("User {UserId} upserted successfully", clerkUserId);

        return MapToResponse(response.Resource);
    }

    public async Task<UserResponse> GetUserAsync(string clerkUserId)
    {
        var user = await _cosmosContext.UsersContainer
            .ReadItemOrDefaultAsync<UserRecord>(clerkUserId, new PartitionKey(clerkUserId));

        if (user == null)
            throw new KeyNotFoundException($"User {clerkUserId} not found");

        return MapToResponse(user);
    }

    public async Task<UserResponse> UpdateUserAsync(string clerkUserId, UpdateUserRequest request)
    {
        var user = await _cosmosContext.UsersContainer
            .ReadItemOrDefaultAsync<UserRecord>(clerkUserId, new PartitionKey(clerkUserId));

        if (user == null)
            throw new KeyNotFoundException($"User {clerkUserId} not found");

        if (request.FirstName != null) user.FirstName = request.FirstName;
        if (request.LastName != null) user.LastName = request.LastName;
        if (request.ProfileImageUrl != null) user.ProfileImageUrl = request.ProfileImageUrl;
        user.UpdatedAt = DateTime.UtcNow;

        var response = await _cosmosContext.UsersContainer
            .ReplaceItemAsync(user, clerkUserId, new PartitionKey(clerkUserId));

        _logger.LogInformation("User {UserId} updated successfully", clerkUserId);

        return MapToResponse(response.Resource);
    }

    public async Task DeleteUserAsync(string clerkUserId)
    {
        try
        {
            await _cosmosContext.UsersContainer
                .DeleteItemAsync<UserRecord>(clerkUserId, new PartitionKey(clerkUserId));

            _logger.LogInformation("User {UserId} deleted successfully", clerkUserId);
        }
        catch (CosmosException ex) when (ex.StatusCode == System.Net.HttpStatusCode.NotFound)
        {
            throw new KeyNotFoundException($"User {clerkUserId} not found");
        }
    }

    public async Task<List<UserResponse>> SearchUsersAsync(string query, string currentUserId)
    {
        if (string.IsNullOrWhiteSpace(query) || query.Length < 2)
            throw new ArgumentException("Search query must be at least 2 characters");

        var lowerQuery = query.ToLower();

        var queryDefinition = new QueryDefinition(
            "SELECT * FROM c WHERE c.id != @currentUserId AND (CONTAINS(LOWER(c.email), @query) OR CONTAINS(LOWER(c.firstName), @query) OR CONTAINS(LOWER(c.lastName), @query))")
            .WithParameter("@query", lowerQuery)
            .WithParameter("@currentUserId", currentUserId);

        var users = await _cosmosContext.UsersContainer
            .QueryItemsCrossPartitionAsync<UserRecord>(queryDefinition);

        return users.Select(MapToResponse).ToList();
    }

    public async Task<List<SuggestedFriendResponse>> GetSuggestedUsersAsync(string userId)
    {
        // 1. Find all groups the current user is a member of
        var groupsQuery = new QueryDefinition(
            "SELECT * FROM c WHERE ARRAY_CONTAINS(c.members, { 'userId': @userId }, true)")
            .WithParameter("@userId", userId);

        var groups = await _cosmosContext.GroupsContainer
            .QueryItemsCrossPartitionAsync<GroupRecord>(groupsQuery);

        // 2. Find all hangouts the current user is an attendee of
        var hangoutsQuery = new QueryDefinition(
            "SELECT * FROM c WHERE ARRAY_CONTAINS(c.attendees, { 'userId': @userId }, true)")
            .WithParameter("@userId", userId);

        var hangouts = await _cosmosContext.HangoutsContainer
            .QueryItemsCrossPartitionAsync<HangoutRecord>(hangoutsQuery);

        // 3. Build per-candidate mutual context
        // candidateId -> (groupNames, hangoutTitles)
        var candidateGroups = new Dictionary<string, List<string>>();
        var candidateHangouts = new Dictionary<string, List<string>>();

        foreach (var group in groups)
        {
            foreach (var member in group.Members)
            {
                if (member.UserId == userId) continue;
                if (!candidateGroups.ContainsKey(member.UserId))
                    candidateGroups[member.UserId] = new List<string>();
                candidateGroups[member.UserId].Add(group.Name);
            }
        }

        foreach (var hangout in hangouts)
        {
            foreach (var attendee in hangout.Attendees)
            {
                if (attendee.UserId == userId) continue;
                if (!candidateHangouts.ContainsKey(attendee.UserId))
                    candidateHangouts[attendee.UserId] = new List<string>();
                candidateHangouts[attendee.UserId].Add(hangout.Title);
            }
        }

        // 4. Union all candidate user IDs
        var allCandidateIds = candidateGroups.Keys
            .Union(candidateHangouts.Keys)
            .Distinct()
            .ToList();

        if (allCandidateIds.Count == 0)
            return new List<SuggestedFriendResponse>();

        // 5. Filter out existing friends and pending requests
        var friendshipsQuery = new QueryDefinition(
            "SELECT * FROM c WHERE c.userId = @userId")
            .WithParameter("@userId", userId);

        var friendships = await _cosmosContext.FriendshipsContainer
            .QueryItemsAsync<FriendshipRecord>(friendshipsQuery, userId);

        var excludedUserIds = new HashSet<string>(friendships.Select(f => f.FriendId));

        var filteredCandidateIds = allCandidateIds
            .Where(id => !excludedUserIds.Contains(id))
            .ToList();

        if (filteredCandidateIds.Count == 0)
            return new List<SuggestedFriendResponse>();

        // 6. Score and sort by total mutual connections, take top 20
        var scored = filteredCandidateIds
            .Select(id => new
            {
                UserId = id,
                GroupCount = candidateGroups.ContainsKey(id) ? candidateGroups[id].Count : 0,
                HangoutCount = candidateHangouts.ContainsKey(id) ? candidateHangouts[id].Count : 0,
                GroupNames = candidateGroups.ContainsKey(id) ? candidateGroups[id] : new List<string>(),
                HangoutNames = candidateHangouts.ContainsKey(id) ? candidateHangouts[id] : new List<string>(),
            })
            .OrderByDescending(x => x.GroupCount + x.HangoutCount)
            .Take(20)
            .ToList();

        // 7. Batch-lookup user records
        var userIdsToLookup = scored.Select(s => s.UserId).ToList();
        var parameters = new List<(string name, string value)>();
        for (int i = 0; i < userIdsToLookup.Count; i++)
        {
            parameters.Add(($"@id{i}", userIdsToLookup[i]));
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

        var userLookup = users.ToDictionary(u => u.Id);

        // 8. Build response
        return scored
            .Where(s => userLookup.ContainsKey(s.UserId))
            .Select(s =>
            {
                var user = userLookup[s.UserId];
                var displayName = $"{user.FirstName} {user.LastName}".Trim();
                if (string.IsNullOrEmpty(displayName)) displayName = user.Email;

                return new SuggestedFriendResponse
                {
                    UserId = s.UserId,
                    DisplayName = displayName,
                    AvatarUrl = user.ProfileImageUrl,
                    MutualGroupCount = s.GroupCount,
                    MutualHangoutCount = s.HangoutCount,
                    MutualGroupNames = s.GroupNames.Distinct().Take(3).ToList(),
                    MutualHangoutNames = s.HangoutNames.Distinct().Take(3).ToList(),
                };
            })
            .ToList();
    }

    private static UserResponse MapToResponse(UserRecord user)
    {
        return new UserResponse
        {
            Id = user.Id,
            Email = user.Email,
            FirstName = user.FirstName,
            LastName = user.LastName,
            ProfileImageUrl = user.ProfileImageUrl,
            CreatedAt = user.CreatedAt
        };
    }
}
