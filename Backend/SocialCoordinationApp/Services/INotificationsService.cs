using SocialCoordinationApp.Models.DTOs.Responses;
using SocialCoordinationApp.Models.Enums;

namespace SocialCoordinationApp.Services
{
    public interface INotificationsService
    {
        Task<PaginatedNotificationsResponse> GetNotificationsAsync(string userId, int limit = 20, string? continuationToken = null);
        Task<UnreadCountResponse> GetUnreadCountAsync(string userId);
        Task MarkAsReadAsync(string userId, string notificationId);
        Task MarkAllAsReadAsync(string userId);
        Task DeleteNotificationAsync(string userId, string notificationId);
        Task CreateNotificationAsync(
            string recipientUserId,
            string actorUserId,
            NotificationType type,
            string title,
            string message,
            string? hangoutId = null,
            string? groupId = null);
    }
}