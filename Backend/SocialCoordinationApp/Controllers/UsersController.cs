using Microsoft.AspNetCore.Mvc;
using SocialCoordinationApp.Models.DTOs.Requests;
using SocialCoordinationApp.Models.DTOs.Responses;
using SocialCoordinationApp.Services;

namespace SocialCoordinationApp.Controllers;

[Route("api/users")]
public class UsersController : BaseApiController
{
    private readonly IUsersService _usersService;

    public UsersController(IUsersService usersService)
    {
        _usersService = usersService;
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
}
