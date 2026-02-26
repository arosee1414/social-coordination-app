using Newtonsoft.Json;
using SocialCoordinationApp.Models.Enums;

namespace SocialCoordinationApp.Models.Domain
{
    public class NotificationRecord
    {
        [JsonProperty("id")]
        public string Id { get; set; } = Guid.NewGuid().ToString();

        [JsonProperty("recipientUserId")]
        public string RecipientUserId { get; set; } = string.Empty;

        [JsonProperty("actorUserId")]
        public string ActorUserId { get; set; } = string.Empty;

        [JsonProperty("type")]
        public NotificationType Type { get; set; }

        [JsonProperty("title")]
        public string Title { get; set; } = string.Empty;

        [JsonProperty("message")]
        public string Message { get; set; } = string.Empty;

        [JsonProperty("hangoutId")]
        public string? HangoutId { get; set; }

        [JsonProperty("groupId")]
        public string? GroupId { get; set; }

        [JsonProperty("isRead")]
        public bool IsRead { get; set; } = false;

        [JsonProperty("createdAt")]
        public string CreatedAt { get; set; } = DateTime.UtcNow.ToString("o");

        [JsonProperty("ttl")]
        public int Ttl { get; set; } = 1296000; // 15 days in seconds
    }
}