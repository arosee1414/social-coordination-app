using SocialCoordinationApp.Models.DTOs.Requests;
using SocialCoordinationApp.Models.DTOs.Responses;

namespace SocialCoordinationApp.Services;

public interface IHangoutsService
{
    Task<HangoutResponse> CreateHangoutAsync(string userId, CreateHangoutRequest request);
    Task<HangoutResponse> GetHangoutAsync(string hangoutId, string userId);
    Task<List<HangoutSummaryResponse>> GetUserHangoutsAsync(string userId);
    Task<HangoutResponse> UpdateHangoutAsync(string hangoutId, string userId, UpdateHangoutRequest request);
    Task DeleteHangoutAsync(string hangoutId, string userId);
    Task<HangoutResponse> UpdateRSVPAsync(string hangoutId, string userId, UpdateRSVPRequest request);
    Task<HangoutResponse> CancelHangoutAsync(string hangoutId, string userId);
    Task<HangoutResponse> AddAttendeesAsync(string hangoutId, string userId, AddHangoutAttendeesRequest request);
    Task<HangoutResponse> RemoveAttendeeAsync(string hangoutId, string callerUserId, string attendeeUserId);
    Task<List<HangoutSummaryResponse>> GetCommonHangoutsAsync(string currentUserId, string otherUserId);
}
