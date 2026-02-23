using Microsoft.AspNetCore.Mvc;
using SocialCoordinationApp.Models.DTOs.Requests;
using SocialCoordinationApp.Services;

namespace SocialCoordinationApp.Controllers;

[Route("api/groups")]
public class GroupsController : BaseApiController
{
    private readonly IGroupsService _groupsService;

    public GroupsController(IGroupsService groupsService)
    {
        _groupsService = groupsService;
    }

    [HttpPost]
    public async Task<IActionResult> CreateGroup([FromBody] CreateGroupRequest request)
    {
        var userId = GetUserId();
        var result = await _groupsService.CreateGroupAsync(userId, request);
        return CreatedAtAction(nameof(GetGroup), new { id = result.Id }, result);
    }

    [HttpGet]
    public async Task<IActionResult> GetMyGroups()
    {
        var userId = GetUserId();
        var result = await _groupsService.GetUserGroupsAsync(userId);
        return Ok(result);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetGroup(string id)
    {
        var userId = GetUserId();
        var result = await _groupsService.GetGroupAsync(id, userId);
        return Ok(result);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateGroup(string id, [FromBody] UpdateGroupRequest request)
    {
        var userId = GetUserId();
        var result = await _groupsService.UpdateGroupAsync(id, userId, request);
        return Ok(result);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteGroup(string id)
    {
        var userId = GetUserId();
        await _groupsService.DeleteGroupAsync(id, userId);
        return NoContent();
    }

    [HttpPost("{id}/members")]
    public async Task<IActionResult> AddMember(string id, [FromBody] AddGroupMemberRequest request)
    {
        var userId = GetUserId();
        var result = await _groupsService.AddMemberAsync(id, userId, request);
        return Ok(result);
    }

    [HttpDelete("{id}/members/{memberUserId}")]
    public async Task<IActionResult> RemoveMember(string id, string memberUserId)
    {
        var userId = GetUserId();
        var result = await _groupsService.RemoveMemberAsync(id, userId, memberUserId);
        return Ok(result);
    }
}