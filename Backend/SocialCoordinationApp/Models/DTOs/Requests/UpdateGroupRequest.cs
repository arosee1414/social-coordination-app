namespace SocialCoordinationApp.Models.DTOs.Requests;

public class UpdateGroupRequest
{
    public string? Name { get; set; }
    public string? Emoji { get; set; }
    public string? Description { get; set; }
}