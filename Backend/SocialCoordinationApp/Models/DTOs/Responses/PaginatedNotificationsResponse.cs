namespace SocialCoordinationApp.Models.DTOs.Responses
{
    public class PaginatedNotificationsResponse
    {
        public List<NotificationResponse> Notifications { get; set; } = new();
        public string? ContinuationToken { get; set; }
        public bool HasMore { get; set; }
    }
}