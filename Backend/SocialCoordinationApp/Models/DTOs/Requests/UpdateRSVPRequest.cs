using SocialCoordinationApp.Models.Enums;

namespace SocialCoordinationApp.Models.DTOs.Requests;

public class UpdateRSVPRequest
{
    public RSVPStatus Status { get; set; }
}