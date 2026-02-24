using SocialCoordinationApp.Models.Enums;

namespace SocialCoordinationApp.Models.DTOs.Responses;

public class HangoutResponse
{
    public string Id { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Emoji { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Location { get; set; }
    public DateTime StartTime { get; set; }
    public DateTime? EndTime { get; set; }
    public string CreatedByUserId { get; set; } = string.Empty;
    public string CreatedByUserName { get; set; } = string.Empty;
    public string? GroupId { get; set; }
    public List<HangoutAttendeeResponse> Attendees { get; set; } = new();
    public HangoutStatus Status { get; set; }
    public DateTime CreatedAt { get; set; }
}