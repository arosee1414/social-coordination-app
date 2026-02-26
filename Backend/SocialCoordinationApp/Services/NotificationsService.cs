using Microsoft.Azure.Cosmos;
using SocialCoordinationApp.Infrastructure;
using SocialCoordinationApp.Models.Domain;
using SocialCoordinationApp.Models.DTOs.Responses;
using SocialCoordinationApp.Models.Enums;

namespace SocialCoordinationApp.Services
{
    public class NotificationsService : INotificationsService
    {
        private readonly Container _container;
        private readonly ILogger<NotificationsService> _logger;

        public NotificationsService(ICosmosContext cosmosContext, ILogger<NotificationsService> logger)
        {
            _container = cosmosContext.NotificationsContainer;
            _logger = logger;
        }

        public async Task<PaginatedNotificationsResponse> GetNotificationsAsync(string userId, int limit = 20, string? continuationToken = null)
        {
            var queryDef = new QueryDefinition(
                "SELECT * FROM c WHERE c.recipientUserId = @userId ORDER BY c.createdAt DESC")
                .WithParameter("@userId", userId);

            var requestOptions = new QueryRequestOptions
            {
                MaxItemCount = limit,
                PartitionKey = new PartitionKey(userId)
            };

            var iterator = _container.GetItemQueryIterator<NotificationRecord>(
                queryDef,
                continuationToken: continuationToken,
                requestOptions: requestOptions);

            var notifications = new List<NotificationResponse>();
            string? nextContinuationToken = null;

            if (iterator.HasMoreResults)
            {
                var response = await iterator.ReadNextAsync();
                nextContinuationToken = response.ContinuationToken;

                foreach (var record in response)
                {
                    notifications.Add(MapToResponse(record));
                }
            }

            return new PaginatedNotificationsResponse
            {
                Notifications = notifications,
                ContinuationToken = nextContinuationToken,
                HasMore = nextContinuationToken != null
            };
        }

        public async Task<UnreadCountResponse> GetUnreadCountAsync(string userId)
        {
            var queryDef = new QueryDefinition(
                "SELECT VALUE COUNT(1) FROM c WHERE c.recipientUserId = @userId AND c.isRead = false")
                .WithParameter("@userId", userId);

            var requestOptions = new QueryRequestOptions
            {
                PartitionKey = new PartitionKey(userId)
            };

            var iterator = _container.GetItemQueryIterator<int>(queryDef, requestOptions: requestOptions);
            var count = 0;

            if (iterator.HasMoreResults)
            {
                var response = await iterator.ReadNextAsync();
                count = response.FirstOrDefault();
            }

            return new UnreadCountResponse { UnreadCount = count };
        }

        public async Task MarkAsReadAsync(string userId, string notificationId)
        {
            try
            {
                var response = await _container.ReadItemAsync<NotificationRecord>(
                    notificationId, new PartitionKey(userId));

                var record = response.Resource;
                record.IsRead = true;

                await _container.UpsertItemAsync(record, new PartitionKey(userId));
            }
            catch (CosmosException ex) when (ex.StatusCode == System.Net.HttpStatusCode.NotFound)
            {
                _logger.LogWarning("Notification {NotificationId} not found for user {UserId}", notificationId, userId);
                throw;
            }
        }

        public async Task MarkAllAsReadAsync(string userId)
        {
            var queryDef = new QueryDefinition(
                "SELECT * FROM c WHERE c.recipientUserId = @userId AND c.isRead = false")
                .WithParameter("@userId", userId);

            var requestOptions = new QueryRequestOptions
            {
                PartitionKey = new PartitionKey(userId)
            };

            var iterator = _container.GetItemQueryIterator<NotificationRecord>(queryDef, requestOptions: requestOptions);

            while (iterator.HasMoreResults)
            {
                var response = await iterator.ReadNextAsync();
                foreach (var record in response)
                {
                    record.IsRead = true;
                    await _container.UpsertItemAsync(record, new PartitionKey(userId));
                }
            }
        }

        public async Task DeleteNotificationAsync(string userId, string notificationId)
        {
            try
            {
                await _container.DeleteItemAsync<NotificationRecord>(
                    notificationId, new PartitionKey(userId));
            }
            catch (CosmosException ex) when (ex.StatusCode == System.Net.HttpStatusCode.NotFound)
            {
                _logger.LogWarning("Notification {NotificationId} not found for user {UserId}", notificationId, userId);
                throw;
            }
        }

        public async Task CreateNotificationAsync(
            string recipientUserId,
            string actorUserId,
            NotificationType type,
            string title,
            string message,
            string? hangoutId = null,
            string? groupId = null)
        {
            // Don't notify yourself
            if (recipientUserId == actorUserId)
            {
                return;
            }

            var record = new NotificationRecord
            {
                Id = Guid.NewGuid().ToString(),
                RecipientUserId = recipientUserId,
                ActorUserId = actorUserId,
                Type = type,
                Title = title,
                Message = message,
                HangoutId = hangoutId,
                GroupId = groupId,
                IsRead = false,
                CreatedAt = DateTime.UtcNow.ToString("o"),
                Ttl = 1296000 // 15 days
            };

            await _container.CreateItemAsync(record, new PartitionKey(recipientUserId));
            _logger.LogInformation("Created {Type} notification for user {RecipientUserId} from {ActorUserId}",
                type, recipientUserId, actorUserId);
        }

        private static NotificationResponse MapToResponse(NotificationRecord record)
        {
            return new NotificationResponse
            {
                Id = record.Id,
                RecipientUserId = record.RecipientUserId,
                ActorUserId = record.ActorUserId,
                Type = record.Type,
                Title = record.Title,
                Message = record.Message,
                HangoutId = record.HangoutId,
                GroupId = record.GroupId,
                IsRead = record.IsRead,
                CreatedAt = record.CreatedAt
            };
        }
    }
}