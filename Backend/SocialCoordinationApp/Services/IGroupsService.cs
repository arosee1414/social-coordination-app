using SocialCoordinationApp.Models.DTOs.Requests;
using SocialCoordinationApp.Models.DTOs.Responses;

namespace SocialCoordinationApp.Services;

public interface IGroupsService
{
    Task<GroupResponse> CreateGroupAsync(string userId, CreateGroupRequest request);
    Task<GroupResponse> GetGroupAsync(string groupId, string userId);
    Task<List<GroupSummaryResponse>> GetUserGroupsAsync(string userId);
    Task<GroupResponse> UpdateGroupAsync(string groupId, string userId, UpdateGroupRequest request);
    Task DeleteGroupAsync(string groupId, string userId);
    Task<GroupResponse> AddMemberAsync(string groupId, string userId, AddGroupMemberRequest request);
    Task<GroupResponse> RemoveMemberAsync(string groupId, string userId, string memberUserId);
    Task<List<GroupSummaryResponse>> GetCommonGroupsAsync(string currentUserId, string otherUserId);
}
