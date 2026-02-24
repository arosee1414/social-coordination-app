using SocialCoordinationApp.Models.Enums;

namespace SocialCoordinationApp.Models.DTOs.Responses;

public class HangoutSummaryResponse
{
    public string Id { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Emoji { get; set; } = string.Empty;
    public string? Location { get; set; }
    public DateTime StartTime { get; set; }
    public DateTime? EndTime { get; set; }
    public int AttendeeCount { get; set; }
    public HangoutStatus Status { get; set; }
    public RSVPStatus? CurrentUserRsvpStatus { get; set; }
    public List<string?> AttendeeAvatarUrls { get; set; } = new();
}
