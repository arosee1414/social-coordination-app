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

    public async Task<List<UserResponse>> SearchUsersAsync(string query)
    {
        if (string.IsNullOrWhiteSpace(query) || query.Length < 2)
            throw new ArgumentException("Search query must be at least 2 characters");

        var lowerQuery = query.ToLower();

        var queryDefinition = new QueryDefinition(
            "SELECT * FROM c WHERE CONTAINS(LOWER(c.email), @query) OR CONTAINS(LOWER(c.firstName), @query) OR CONTAINS(LOWER(c.lastName), @query)")
            .WithParameter("@query", lowerQuery);

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