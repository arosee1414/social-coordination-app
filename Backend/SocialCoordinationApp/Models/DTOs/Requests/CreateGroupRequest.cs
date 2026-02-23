namespace SocialCoordinationApp.Models.DTOs.Requests;

public class CreateGroupRequest
{
    public string Name { get; set; } = string.Empty;
    public string? Emoji { get; set; }
    public string? Description { get; set; }
    public List<string>? MemberUserIds { get; set; }
}