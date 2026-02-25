using SocialCoordinationApp.Models.DTOs.Responses;

namespace SocialCoordinationApp.Services;

public interface IFriendsService
{
    Task<List<FriendResponse>> GetFriendsAsync(string userId);
    Task<int> GetFriendCountAsync(string userId);
    Task<List<FriendRequestResponse>> GetFriendRequestsAsync(string userId);
    Task<FriendshipStatusResponse?> GetFriendshipStatusAsync(string userId, string friendId);
    Task SendFriendRequestAsync(string userId, string friendId);
    Task AcceptFriendRequestAsync(string userId, string friendId);
    Task RejectFriendRequestAsync(string userId, string friendId);
    Task RemoveFriendAsync(string userId, string friendId);
}