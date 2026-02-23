using System.Text.Json.Serialization;

namespace SocialCoordinationApp.Models.Domain;

public class GroupRecord
{
    [JsonPropertyName("id")]
    public string Id { get; set; } = string.Empty;

    [JsonPropertyName("name")]
    public string Name { get; set; } = string.Empty;

    [JsonPropertyName("emoji")]
    public string Emoji { get; set; } = "👥";

    [JsonPropertyName("description")]
    public string? Description { get; set; }

    [JsonPropertyName("createdByUserId")]
    public string CreatedByUserId { get; set; } = string.Empty;

    [JsonPropertyName("members")]
    public List<GroupMember> Members { get; set; } = new();

    [JsonPropertyName("createdAt")]
    public DateTime CreatedAt { get; set; }

    [JsonPropertyName("updatedAt")]
    public DateTime UpdatedAt { get; set; }
}