namespace SocialCoordinationApp.Models.DTOs.Responses;

public class InvitedGroupInfoResponse
{
    public string Id { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Emoji { get; set; } = "👥";
    public int MemberCount { get; set; }
}