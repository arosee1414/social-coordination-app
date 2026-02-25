using Microsoft.Azure.Cosmos;
using SocialCoordinationApp.Infrastructure;
using SocialCoordinationApp.Models.Domain;
using SocialCoordinationApp.Models.DTOs.Requests;
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

    public async Task<List<UserResponse>> GetSuggestedUsersAsync(string userId)
    {
        // Find all groups the current user is a member of
        var groupsQuery = new QueryDefinition(
            "SELECT * FROM c WHERE ARRAY_CONTAINS(c.members, { 'userId': @userId }, true)")
            .WithParameter("@userId", userId);

        var groups = await _cosmosContext.GroupsContainer
            .QueryItemsCrossPartitionAsync<GroupRecord>(groupsQuery);

        // Collect all unique member user IDs (excluding self)
        var memberUserIds = groups
            .SelectMany(g => g.Members)
            .Select(m => m.UserId)
            .Where(id => id != userId)
            .Distinct()
            .ToList();

        if (memberUserIds.Count == 0)
            return new List<UserResponse>();

        // Batch look up user records
        var parameters = new List<(string name, string value)>();
        for (int i = 0; i < memberUserIds.Count; i++)
        {
            parameters.Add(($"@id{i}", memberUserIds[i]));
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

        return users.Select(MapToResponse).ToList();
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
