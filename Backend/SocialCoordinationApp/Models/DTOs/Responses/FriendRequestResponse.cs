namespace SocialCoordinationApp.Models.DTOs.Responses;

public class FriendRequestResponse
{
    public string UserId { get; set; } = string.Empty;
    public string DisplayName { get; set; } = string.Empty;
    public string? AvatarUrl { get; set; }
    public string Direction { get; set; } = string.Empty;
    public DateTime SentAt { get; set; }
}