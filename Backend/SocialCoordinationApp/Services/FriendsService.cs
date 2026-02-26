using Microsoft.Azure.Cosmos;
using SocialCoordinationApp.Infrastructure;
using SocialCoordinationApp.Models.Domain;
using SocialCoordinationApp.Models.DTOs.Responses;
using SocialCoordinationApp.Models.Enums;

namespace SocialCoordinationApp.Services;

public class FriendsService : IFriendsService
{
    private readonly ICosmosContext _cosmosContext;
    private readonly IUsersService _usersService;
    private readonly ILogger<FriendsService> _logger;
    private readonly INotificationsService _notificationsService;

    public FriendsService(ICosmosContext cosmosContext, IUsersService usersService, ILogger<FriendsService> logger, INotificationsService notificationsService)
    {
        _cosmosContext = cosmosContext;
        _usersService = usersService;
        _logger = logger;
        _notificationsService = notificationsService;
    }

    public async Task<List<FriendResponse>> GetFriendsAsync(string userId)
    {
        var query = new QueryDefinition(
            "SELECT * FROM c WHERE c.userId = @userId AND c.status = @status")
            .WithParameter("@userId", userId)
            .WithParameter("@status", FriendshipStatus.Accepted.ToString());

        var friendships = await _cosmosContext.FriendshipsContainer
            .QueryItemsAsync<FriendshipRecord>(query, userId);

        var friends = new List<FriendResponse>();
        foreach (var friendship in friendships)
        {
            try
            {
                var user = await _usersService.GetUserAsync(friendship.FriendId);
                friends.Add(new FriendResponse
                {
                    UserId = user.Id,
                    DisplayName = $"{user.FirstName} {user.LastName}".Trim(),
                    AvatarUrl = user.ProfileImageUrl,
                    FriendsSince = friendship.UpdatedAt
                });
            }
            catch (KeyNotFoundException)
            {
                // User no longer exists, skip
            }
        }

        return friends;
    }

    public async Task<int> GetFriendCountAsync(string userId)
    {
        var query = new QueryDefinition(
            "SELECT VALUE COUNT(1) FROM c WHERE c.userId = @userId AND c.status = @status")
            .WithParameter("@userId", userId)
            .WithParameter("@status", FriendshipStatus.Accepted.ToString());

        var results = await _cosmosContext.FriendshipsContainer
            .QueryItemsAsync<int>(query, userId);

        return results.FirstOrDefault();
    }

    public async Task<List<FriendRequestResponse>> GetFriendRequestsAsync(string userId)
    {
        var query = new QueryDefinition(
            "SELECT * FROM c WHERE c.userId = @userId AND c.status = @status")
            .WithParameter("@userId", userId)
            .WithParameter("@status", FriendshipStatus.Pending.ToString());

        var friendships = await _cosmosContext.FriendshipsContainer
            .QueryItemsAsync<FriendshipRecord>(query, userId);

        var requests = new List<FriendRequestResponse>();
        foreach (var friendship in friendships)
        {
            try
            {
                var user = await _usersService.GetUserAsync(friendship.FriendId);
                requests.Add(new FriendRequestResponse
                {
                    UserId = user.Id,
                    DisplayName = $"{user.FirstName} {user.LastName}".Trim(),
                    AvatarUrl = user.ProfileImageUrl,
                    Direction = friendship.Direction?.ToString() ?? string.Empty,
                    SentAt = friendship.CreatedAt
                });
            }
            catch (KeyNotFoundException)
            {
                // User no longer exists, skip
            }
        }

        return requests;
    }

    public async Task<FriendshipStatusResponse?> GetFriendshipStatusAsync(string userId, string friendId)
    {
        var documentId = $"{userId}_{friendId}";
        try
        {
            var response = await _cosmosContext.FriendshipsContainer
                .ReadItemAsync<FriendshipRecord>(documentId, new PartitionKey(userId));

            return new FriendshipStatusResponse
            {
                Status = response.Resource.Status.ToString(),
                Direction = response.Resource.Direction?.ToString()
            };
        }
        catch (CosmosException ex) when (ex.StatusCode == System.Net.HttpStatusCode.NotFound)
        {
            return null;
        }
    }

    public async Task SendFriendRequestAsync(string userId, string friendId)
    {
        if (userId == friendId)
            throw new InvalidOperationException("Cannot send a friend request to yourself.");

        // Check if a friendship already exists
        var existing = await GetFriendshipStatusAsync(userId, friendId);
        if (existing != null)
            throw new InvalidOperationException("A friendship or pending request already exists between these users.");

        // Verify both users exist
        try
        {
            await _usersService.GetUserAsync(userId);
            await _usersService.GetUserAsync(friendId);
        }
        catch (KeyNotFoundException)
        {
            throw new InvalidOperationException("One or both users do not exist.");
        }

        var now = DateTime.UtcNow;

        // Create outgoing document (in sender's partition)
        var outgoing = new FriendshipRecord
        {
            Id = $"{userId}_{friendId}",
            UserId = userId,
            FriendId = friendId,
            Status = FriendshipStatus.Pending,
            Direction = FriendshipDirection.Outgoing,
            CreatedAt = now,
            UpdatedAt = now
        };

        // Create incoming document (in receiver's partition)
        var incoming = new FriendshipRecord
        {
            Id = $"{friendId}_{userId}",
            UserId = friendId,
            FriendId = userId,
            Status = FriendshipStatus.Pending,
            Direction = FriendshipDirection.Incoming,
            CreatedAt = now,
            UpdatedAt = now
        };

        await _cosmosContext.FriendshipsContainer
            .CreateItemAsync(outgoing, new PartitionKey(userId));
        await _cosmosContext.FriendshipsContainer
            .CreateItemAsync(incoming, new PartitionKey(friendId));

        _logger.LogInformation("Friend request sent from {UserId} to {FriendId}", userId, friendId);

        // Send FriendRequest notification to the recipient
        try
        {
            var senderDisplayName = await GetUserDisplayNameAsync(userId);
            await _notificationsService.CreateNotificationAsync(
                recipientUserId: friendId,
                actorUserId: userId,
                type: NotificationType.FriendRequest,
                title: $"{senderDisplayName} sent you a friend request",
                message: "Tap to respond");
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to create FriendRequest notification for user {FriendId}", friendId);
        }
    }

    public async Task AcceptFriendRequestAsync(string userId, string friendId)
    {
        // userId is the one accepting — they should have an Incoming Pending request
        var incomingId = $"{userId}_{friendId}";
        var outgoingId = $"{friendId}_{userId}";

        var now = DateTime.UtcNow;

        try
        {
            var incomingResponse = await _cosmosContext.FriendshipsContainer
                .ReadItemAsync<FriendshipRecord>(incomingId, new PartitionKey(userId));
            var incomingRecord = incomingResponse.Resource;

            if (incomingRecord.Status != FriendshipStatus.Pending || incomingRecord.Direction != FriendshipDirection.Incoming)
                throw new InvalidOperationException("No pending incoming friend request found.");

            // Update incoming document to Accepted
            incomingRecord.Status = FriendshipStatus.Accepted;
            incomingRecord.Direction = null;
            incomingRecord.UpdatedAt = now;
            await _cosmosContext.FriendshipsContainer
                .ReplaceItemAsync(incomingRecord, incomingId, new PartitionKey(userId));

            // Update outgoing document to Accepted
            var outgoingResponse = await _cosmosContext.FriendshipsContainer
                .ReadItemAsync<FriendshipRecord>(outgoingId, new PartitionKey(friendId));
            var outgoingRecord = outgoingResponse.Resource;
            outgoingRecord.Status = FriendshipStatus.Accepted;
            outgoingRecord.Direction = null;
            outgoingRecord.UpdatedAt = now;
            await _cosmosContext.FriendshipsContainer
                .ReplaceItemAsync(outgoingRecord, outgoingId, new PartitionKey(friendId));

            _logger.LogInformation("Friend request accepted: {UserId} accepted {FriendId}", userId, friendId);

            // Send FriendAccepted notification to the original sender (friendId)
            try
            {
                var accepterDisplayName = await GetUserDisplayNameAsync(userId);
                await _notificationsService.CreateNotificationAsync(
                    recipientUserId: friendId,
                    actorUserId: userId,
                    type: NotificationType.FriendAccepted,
                    title: $"{accepterDisplayName} accepted your friend request",
                    message: "You can now plan hangouts together");
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to create FriendAccepted notification for user {FriendId}", friendId);
            }
        }
        catch (CosmosException ex) when (ex.StatusCode == System.Net.HttpStatusCode.NotFound)
        {
            throw new InvalidOperationException("No pending friend request found.");
        }
    }

    public async Task CancelFriendRequestAsync(string userId, string friendId)
    {
        // userId is the one cancelling — they should have an Outgoing Pending request
        var outgoingId = $"{userId}_{friendId}";
        var incomingId = $"{friendId}_{userId}";

        try
        {
            var outgoingResponse = await _cosmosContext.FriendshipsContainer
                .ReadItemAsync<FriendshipRecord>(outgoingId, new PartitionKey(userId));
            var outgoingRecord = outgoingResponse.Resource;

            if (outgoingRecord.Status != FriendshipStatus.Pending || outgoingRecord.Direction != FriendshipDirection.Outgoing)
                throw new InvalidOperationException("No pending outgoing friend request found.");

            // Delete both documents
            await _cosmosContext.FriendshipsContainer
                .DeleteItemAsync<FriendshipRecord>(outgoingId, new PartitionKey(userId));
            await _cosmosContext.FriendshipsContainer
                .DeleteItemAsync<FriendshipRecord>(incomingId, new PartitionKey(friendId));

            _logger.LogInformation("Friend request cancelled: {UserId} cancelled request to {FriendId}", userId, friendId);
        }
        catch (CosmosException ex) when (ex.StatusCode == System.Net.HttpStatusCode.NotFound)
        {
            throw new InvalidOperationException("No pending friend request found.");
        }
    }

    public async Task RejectFriendRequestAsync(string userId, string friendId)
    {
        var incomingId = $"{userId}_{friendId}";
        var outgoingId = $"{friendId}_{userId}";

        try
        {
            // Delete both documents
            await _cosmosContext.FriendshipsContainer
                .DeleteItemAsync<FriendshipRecord>(incomingId, new PartitionKey(userId));
            await _cosmosContext.FriendshipsContainer
                .DeleteItemAsync<FriendshipRecord>(outgoingId, new PartitionKey(friendId));

            _logger.LogInformation("Friend request rejected: {UserId} rejected {FriendId}", userId, friendId);
        }
        catch (CosmosException ex) when (ex.StatusCode == System.Net.HttpStatusCode.NotFound)
        {
            throw new InvalidOperationException("No pending friend request found.");
        }
    }

    private async Task<string> GetUserDisplayNameAsync(string userId)
    {
        try
        {
            var user = await _usersService.GetUserAsync(userId);
            var fullName = $"{user.FirstName} {user.LastName}".Trim();
            return string.IsNullOrEmpty(fullName) ? user.Email : fullName;
        }
        catch
        {
            return userId;
        }
    }

    public async Task RemoveFriendAsync(string userId, string friendId)
    {
        var userDocId = $"{userId}_{friendId}";
        var friendDocId = $"{friendId}_{userId}";

        try
        {
            await _cosmosContext.FriendshipsContainer
                .DeleteItemAsync<FriendshipRecord>(userDocId, new PartitionKey(userId));
            await _cosmosContext.FriendshipsContainer
                .DeleteItemAsync<FriendshipRecord>(friendDocId, new PartitionKey(friendId));

            _logger.LogInformation("Friendship removed between {UserId} and {FriendId}", userId, friendId);
        }
        catch (CosmosException ex) when (ex.StatusCode == System.Net.HttpStatusCode.NotFound)
        {
            throw new InvalidOperationException("No friendship found to remove.");
        }
    }
}