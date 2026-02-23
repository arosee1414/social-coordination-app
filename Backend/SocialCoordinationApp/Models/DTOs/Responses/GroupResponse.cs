namespace SocialCoordinationApp.Models.DTOs.Responses;

public class GroupResponse
{
    public string Id { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Emoji { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string CreatedByUserId { get; set; } = string.Empty;
    public List<GroupMemberResponse> Members { get; set; } = new();
    public DateTime CreatedAt { get; set; }
}