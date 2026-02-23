using System.Text.Json.Serialization;
using SocialCoordinationApp.Models.Enums;

namespace SocialCoordinationApp.Models.Domain;

public class HangoutAttendee
{
    [JsonPropertyName("userId")]
    public string UserId { get; set; } = string.Empty;

    [JsonPropertyName("rsvpStatus")]
    public RSVPStatus RsvpStatus { get; set; } = RSVPStatus.Pending;

    [JsonPropertyName("respondedAt")]
    public DateTime? RespondedAt { get; set; }
}