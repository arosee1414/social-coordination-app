using SocialCoordinationApp.Models.DTOs.Requests;
using SocialCoordinationApp.Models.DTOs.Responses;

namespace SocialCoordinationApp.Services;

public interface IUsersService
{
    Task<UserResponse> CreateOrUpdateUserAsync(string clerkUserId, CreateUserRequest request);
    Task<UserResponse> GetUserAsync(string clerkUserId);
    Task<UserResponse> UpdateUserAsync(string clerkUserId, UpdateUserRequest request);
    Task DeleteUserAsync(string clerkUserId);
    Task<List<UserResponse>> SearchUsersAsync(string query, string currentUserId);
    Task<List<SuggestedFriendResponse>> GetSuggestedUsersAsync(string userId);
}
