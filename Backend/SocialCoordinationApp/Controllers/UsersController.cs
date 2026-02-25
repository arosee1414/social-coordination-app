using Microsoft.AspNetCore.Mvc;
using SocialCoordinationApp.Models.DTOs.Requests;
using SocialCoordinationApp.Models.DTOs.Responses;
using SocialCoordinationApp.Services;

namespace SocialCoordinationApp.Controllers;

[Route("api/users")]
public class UsersController : BaseApiController
{
    private readonly IUsersService _usersService;
    private readonly IGroupsService _groupsService;
    private readonly IHangoutsService _hangoutsService;
    private readonly IFriendsService _friendsService;

    public UsersController(IUsersService usersService, IGroupsService groupsService, IHangoutsService hangoutsService, IFriendsService friendsService)
    {
        _usersService = usersService;
        _groupsService = groupsService;
        _hangoutsService = hangoutsService;
        _friendsService = friendsService;
    }

    [HttpPost("me")]
    [ProducesResponseType(typeof(UserResponse), StatusCodes.Status200OK)]
    public async Task<ActionResult<UserResponse>> CreateOrUpdateUser([FromBody] CreateUserRequest request)
    {
        var userId = GetUserId();
        var result = await _usersService.CreateOrUpdateUserAsync(userId, request);
        return Ok(result);
    }

    [HttpGet("me")]
    [ProducesResponseType(typeof(UserResponse), StatusCodes.Status200OK)]
    public async Task<ActionResult<UserResponse>> GetCurrentUser()
    {
        var userId = GetUserId();
        var result = await _usersService.GetUserAsync(userId);
        return Ok(result);
    }

    [HttpPut("me")]
    [ProducesResponseType(typeof(UserResponse), StatusCodes.Status200OK)]
    public async Task<ActionResult<UserResponse>> UpdateCurrentUser([FromBody] UpdateUserRequest request)
    {
        var userId = GetUserId();
        var result = await _usersService.UpdateUserAsync(userId, request);
        return Ok(result);
    }

    [HttpDelete("me")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> DeleteCurrentUser()
    {
        var userId = GetUserId();
        await _usersService.DeleteUserAsync(userId);
        return NoContent();
    }

    [HttpGet("{userId}")]
    [ProducesResponseType(typeof(UserResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<UserResponse>> GetUserById(string userId)
    {
        try
        {
            var result = await _usersService.GetUserAsync(userId);
            return Ok(result);
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
    }

    [HttpGet("search")]
    [ProducesResponseType(typeof(List<UserResponse>), StatusCodes.Status200OK)]
    public async Task<ActionResult<List<UserResponse>>> SearchUsers([FromQuery] string q)
    {
        var result = await _usersService.SearchUsersAsync(q);
        return Ok(result);
    }

    [HttpGet("suggested")]
    [ProducesResponseType(typeof(List<UserResponse>), StatusCodes.Status200OK)]
    public async Task<ActionResult<List<UserResponse>>> GetSuggestedUsers()
    {
        var userId = GetUserId();
        var result = await _usersService.GetSuggestedUsersAsync(userId);
        return Ok(result);
    }

    [HttpGet("{userId}/common-groups")]
    [ProducesResponseType(typeof(List<GroupSummaryResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<ActionResult<List<GroupSummaryResponse>>> GetCommonGroups(string userId)
    {
        var currentUserId = GetUserId();

        // Allow viewing your own common groups, otherwise require accepted friendship
        if (currentUserId != userId)
        {
            var status = await _friendsService.GetFriendshipStatusAsync(currentUserId, userId);
            if (status == null || !string.Equals(status.Status, "Accepted", StringComparison.OrdinalIgnoreCase))
                return Forbid();
        }

        var result = await _groupsService.GetCommonGroupsAsync(currentUserId, userId);
        return Ok(result);
    }

    [HttpGet("{userId}/common-hangouts")]
    [ProducesResponseType(typeof(List<HangoutSummaryResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<ActionResult<List<HangoutSummaryResponse>>> GetCommonHangouts(string userId)
    {
        var currentUserId = GetUserId();

        // Allow viewing your own common hangouts, otherwise require accepted friendship
        if (currentUserId != userId)
        {
            var status = await _friendsService.GetFriendshipStatusAsync(currentUserId, userId);
            if (status == null || !string.Equals(status.Status, "Accepted", StringComparison.OrdinalIgnoreCase))
                return Forbid();
        }

        var result = await _hangoutsService.GetCommonHangoutsAsync(currentUserId, userId);
        return Ok(result);
    }
}
