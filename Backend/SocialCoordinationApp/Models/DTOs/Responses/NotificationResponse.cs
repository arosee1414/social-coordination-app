using SocialCoordinationApp.Models.Enums;

namespace SocialCoordinationApp.Models.DTOs.Responses
{
    public class NotificationResponse
    {
        public string Id { get; set; } = string.Empty;
        public string RecipientUserId { get; set; } = string.Empty;
        public string ActorUserId { get; set; } = string.Empty;
        public NotificationType Type { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
        public string? HangoutId { get; set; }
        public string? GroupId { get; set; }
        public bool IsRead { get; set; }
        public string CreatedAt { get; set; } = string.Empty;
    }
}