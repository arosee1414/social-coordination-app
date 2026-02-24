using System.Text.Json.Serialization;
using SocialCoordinationApp.Models.Enums;

namespace SocialCoordinationApp.Models.Domain;

public class HangoutRecord
{
    [JsonPropertyName("id")]
    public string Id { get; set; } = string.Empty;

    [JsonPropertyName("title")]
    public string Title { get; set; } = string.Empty;

    [JsonPropertyName("emoji")]
    public string Emoji { get; set; } = "🎉";

    [JsonPropertyName("description")]
    public string? Description { get; set; }

    [JsonPropertyName("location")]
    public string? Location { get; set; }

    [JsonPropertyName("startTime")]
    public DateTime StartTime { get; set; }

    [JsonPropertyName("endTime")]
    public DateTime? EndTime { get; set; }

    [JsonPropertyName("createdByUserId")]
    public string CreatedByUserId { get; set; } = string.Empty;

    [JsonPropertyName("groupId")]
    public string? GroupId { get; set; }

    [JsonPropertyName("invitedGroupIds")]
    public List<string> InvitedGroupIds { get; set; } = new();

    [JsonPropertyName("attendees")]
    public List<HangoutAttendee> Attendees { get; set; } = new();

    [JsonPropertyName("status")]
    public HangoutStatus Status { get; set; } = HangoutStatus.Active;

    [JsonPropertyName("createdAt")]
    public DateTime CreatedAt { get; set; }

    [JsonPropertyName("updatedAt")]
    public DateTime UpdatedAt { get; set; }
}