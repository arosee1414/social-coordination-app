namespace SocialCoordinationApp.Models.DTOs.Responses;

public class SuggestedFriendResponse
{
    public string UserId { get; set; } = string.Empty;
    public string DisplayName { get; set; } = string.Empty;
    public string? AvatarUrl { get; set; }
    public int MutualGroupCount { get; set; }
    public int MutualHangoutCount { get; set; }
    public List<string> MutualGroupNames { get; set; } = new();
    public List<string> MutualHangoutNames { get; set; } = new();
}