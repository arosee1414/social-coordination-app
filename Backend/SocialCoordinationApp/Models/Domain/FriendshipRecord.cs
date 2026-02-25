using Newtonsoft.Json;
using SocialCoordinationApp.Models.Enums;

namespace SocialCoordinationApp.Models.Domain;

public class FriendshipRecord
{
    [JsonProperty("id")]
    public string Id { get; set; } = string.Empty;

    [JsonProperty("userId")]
    public string UserId { get; set; } = string.Empty;

    [JsonProperty("friendId")]
    public string FriendId { get; set; } = string.Empty;

    [JsonProperty("status")]
    public FriendshipStatus Status { get; set; }

    [JsonProperty("direction")]
    public FriendshipDirection? Direction { get; set; }

    [JsonProperty("createdAt")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [JsonProperty("updatedAt")]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}