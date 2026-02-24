namespace SocialCoordinationApp.Models.DTOs.Requests;

public class CreateHangoutRequest
{
    public string Title { get; set; } = string.Empty;
    public string? Emoji { get; set; }
    public string? Description { get; set; }
    public string? Location { get; set; }
    public DateTime StartTime { get; set; }
    public DateTime? EndTime { get; set; }
    public string? GroupId { get; set; }
    public List<string>? InvitedGroupIds { get; set; }
    public List<string>? InviteeUserIds { get; set; }
}