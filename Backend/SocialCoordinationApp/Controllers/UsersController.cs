using Microsoft.AspNetCore.Mvc;
using SocialCoordinationApp.Models.DTOs.Requests;
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
    public async Task<IActionResult> CreateOrUpdateUser([FromBody] CreateUserRequest request)
    {
        var userId = GetUserId();
        var result = await _usersService.CreateOrUpdateUserAsync(userId, request);
        return Ok(result);
    }

    [HttpGet("me")]
    public async Task<IActionResult> GetCurrentUser()
    {
        var userId = GetUserId();
        var result = await _usersService.GetUserAsync(userId);
        return Ok(result);
    }

    [HttpPut("me")]
    public async Task<IActionResult> UpdateCurrentUser([FromBody] UpdateUserRequest request)
    {
        var userId = GetUserId();
        var result = await _usersService.UpdateUserAsync(userId, request);
        return Ok(result);
    }

    [HttpDelete("me")]
    public async Task<IActionResult> DeleteCurrentUser()
    {
        var userId = GetUserId();
        await _usersService.DeleteUserAsync(userId);
        return NoContent();
    }

    [HttpGet("search")]
    public async Task<IActionResult> SearchUsers([FromQuery] string q)
    {
        var result = await _usersService.SearchUsersAsync(q);
        return Ok(result);
    }
}