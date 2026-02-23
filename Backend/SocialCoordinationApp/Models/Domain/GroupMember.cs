using System.Text.Json.Serialization;
using SocialCoordinationApp.Models.Enums;

namespace SocialCoordinationApp.Models.Domain;

public class GroupMember
{
    [JsonPropertyName("userId")]
    public string UserId { get; set; } = string.Empty;

    [JsonPropertyName("role")]
    public GroupMemberRole Role { get; set; }

    [JsonPropertyName("joinedAt")]
    public DateTime JoinedAt { get; set; }
}