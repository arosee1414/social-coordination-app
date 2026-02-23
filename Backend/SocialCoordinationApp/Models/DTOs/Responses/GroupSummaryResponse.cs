namespace SocialCoordinationApp.Models.DTOs.Responses;

public class GroupSummaryResponse
{
    public string Id { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Emoji { get; set; } = string.Empty;
    public int MemberCount { get; set; }
}