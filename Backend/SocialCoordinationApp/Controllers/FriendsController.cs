using Microsoft.AspNetCore.Mvc;
using SocialCoordinationApp.Models.DTOs.Responses;
using SocialCoordinationApp.Services;

namespace SocialCoordinationApp.Controllers;

[Route("api/[controller]")]
public class FriendsController : BaseApiController
{
    private readonly IFriendsService _friendsService;

    public FriendsController(IFriendsService friendsService)
    {
        _friendsService = friendsService;
    }

    /// <summary>
    /// Get the current user's accepted friends list
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(List<FriendResponse>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetFriends()
    {
        var userId = GetUserId();
        var friends = await _friendsService.GetFriendsAsync(userId);
        return Ok(friends);
    }

    /// <summary>
    /// Get the friend count for a specific user
    /// </summary>
    [HttpGet("{userId}/count")]
    [ProducesResponseType(typeof(FriendCountResponse), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetFriendCount(string userId)
    {
        var count = await _friendsService.GetFriendCountAsync(userId);
        return Ok(new FriendCountResponse { Count = count });
    }

    /// <summary>
    /// Get the current user's pending friend requests (incoming and outgoing)
    /// </summary>
    [HttpGet("requests")]
    [ProducesResponseType(typeof(List<FriendRequestResponse>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetFriendRequests()
    {
        var userId = GetUserId();
        var requests = await _friendsService.GetFriendRequestsAsync(userId);
        return Ok(requests);
    }

    /// <summary>
    /// Get the friendship status between the current user and another user
    /// </summary>
    [HttpGet("status/{friendId}")]
    [ProducesResponseType(typeof(FriendshipStatusResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetFriendshipStatus(string friendId)
    {
        var userId = GetUserId();
        var status = await _friendsService.GetFriendshipStatusAsync(userId, friendId);
        if (status == null)
            return NotFound();
        return Ok(status);
    }

    /// <summary>
    /// Send a friend request to another user
    /// </summary>
    [HttpPost("request/{friendId}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> SendFriendRequest(string friendId)
    {
        var userId = GetUserId();
        try
        {
            await _friendsService.SendFriendRequestAsync(userId, friendId);
            return NoContent();
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Accept a pending incoming friend request
    /// </summary>
    [HttpPost("accept/{friendId}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> AcceptFriendRequest(string friendId)
    {
        var userId = GetUserId();
        try
        {
            await _friendsService.AcceptFriendRequestAsync(userId, friendId);
            return NoContent();
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Reject a pending incoming friend request
    /// </summary>
    [HttpPost("reject/{friendId}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> RejectFriendRequest(string friendId)
    {
        var userId = GetUserId();
        try
        {
            await _friendsService.RejectFriendRequestAsync(userId, friendId);
            return NoContent();
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Remove an existing friend
    /// </summary>
    [HttpDelete("{friendId}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> RemoveFriend(string friendId)
    {
        var userId = GetUserId();
        try
        {
            await _friendsService.RemoveFriendAsync(userId, friendId);
            return NoContent();
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}