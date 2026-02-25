namespace SocialCoordinationApp.Models.DTOs.Requests;

public class AddHangoutAttendeesRequest
{
    public List<string>? InvitedGroupIds { get; set; }
    public List<string>? InviteeUserIds { get; set; }
}