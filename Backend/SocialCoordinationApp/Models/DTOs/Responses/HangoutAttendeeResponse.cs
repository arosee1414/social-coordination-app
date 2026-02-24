using SocialCoordinationApp.Models.Enums;

namespace SocialCoordinationApp.Models.DTOs.Responses;

public class HangoutAttendeeResponse
{
    public string UserId { get; set; } = string.Empty;
    public string DisplayName { get; set; } = string.Empty;
    public string? ProfileImageUrl { get; set; }
    public RSVPStatus RsvpStatus { get; set; }
    public DateTime? RespondedAt { get; set; }
}
