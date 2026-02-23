namespace SocialCoordinationApp.Models.DTOs.Requests;

public class UpdateHangoutRequest
{
    public string? Title { get; set; }
    public string? Emoji { get; set; }
    public string? Description { get; set; }
    public string? Location { get; set; }
    public DateTime? StartTime { get; set; }
    public DateTime? EndTime { get; set; }
}