namespace SocialCoordinationApp.Models.DTOs.Responses;

public class FriendshipStatusResponse
{
    public string Status { get; set; } = string.Empty;
    public string? Direction { get; set; }
}