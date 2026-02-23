using SocialCoordinationApp.Models.Enums;

namespace SocialCoordinationApp.Models.DTOs.Responses;

public class GroupMemberResponse
{
    public string UserId { get; set; } = string.Empty;
    public GroupMemberRole Role { get; set; }
    public DateTime JoinedAt { get; set; }
}