namespace SocialCoordinationApp.Models.DTOs.Responses;

public class FriendResponse
{
    public string UserId { get; set; } = string.Empty;
    public string DisplayName { get; set; } = string.Empty;
    public string? AvatarUrl { get; set; }
    public DateTime FriendsSince { get; set; }
}