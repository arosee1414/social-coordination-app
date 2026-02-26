using Newtonsoft.Json;
using Newtonsoft.Json.Converters;

namespace SocialCoordinationApp.Models.Enums
{
    [JsonConverter(typeof(StringEnumConverter))]
    public enum NotificationType
    {
        HangoutCreated,
        HangoutInvite,
        Rsvp,
        GroupCreated,
        MemberAdded,
        MemberRemoved,
        FriendRequest,
        FriendAccepted
    }
}