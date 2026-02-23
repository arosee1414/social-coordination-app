using Microsoft.AspNetCore.Mvc;
using SocialCoordinationApp.Models.DTOs.Requests;
using SocialCoordinationApp.Models.DTOs.Responses;
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
    [ProducesResponseType(typeof(GroupResponse), StatusCodes.Status201Created)]
    public async Task<ActionResult<GroupResponse>> CreateGroup([FromBody] CreateGroupRequest request)
    {
        var userId = GetUserId();
        var result = await _groupsService.CreateGroupAsync(userId, request);
        return CreatedAtAction(nameof(GetGroup), new { id = result.Id }, result);
    }

    [HttpGet]
    [ProducesResponseType(typeof(List<GroupSummaryResponse>), StatusCodes.Status200OK)]
    public async Task<ActionResult<List<GroupSummaryResponse>>> GetMyGroups()
    {
        var userId = GetUserId();
        var result = await _groupsService.GetUserGroupsAsync(userId);
        return Ok(result);
    }

    [HttpGet("{id}")]
    [ProducesResponseType(typeof(GroupResponse), StatusCodes.Status200OK)]
    public async Task<ActionResult<GroupResponse>> GetGroup(string id)
    {
        var userId = GetUserId();
        var result = await _groupsService.GetGroupAsync(id, userId);
        return Ok(result);
    }

    [HttpPut("{id}")]
    [ProducesResponseType(typeof(GroupResponse), StatusCodes.Status200OK)]
    public async Task<ActionResult<GroupResponse>> UpdateGroup(string id, [FromBody] UpdateGroupRequest request)
    {
        var userId = GetUserId();
        var result = await _groupsService.UpdateGroupAsync(id, userId, request);
        return Ok(result);
    }

    [HttpDelete("{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> DeleteGroup(string id)
    {
        var userId = GetUserId();
        await _groupsService.DeleteGroupAsync(id, userId);
        return NoContent();
    }

    [HttpPost("{id}/members")]
    [ProducesResponseType(typeof(GroupResponse), StatusCodes.Status200OK)]
    public async Task<ActionResult<GroupResponse>> AddMember(string id, [FromBody] AddGroupMemberRequest request)
    {
        var userId = GetUserId();
        var result = await _groupsService.AddMemberAsync(id, userId, request);
        return Ok(result);
    }

    [HttpDelete("{id}/members/{memberUserId}")]
    [ProducesResponseType(typeof(GroupResponse), StatusCodes.Status200OK)]
    public async Task<ActionResult<GroupResponse>> RemoveMember(string id, string memberUserId)
    {
        var userId = GetUserId();
        var result = await _groupsService.RemoveMemberAsync(id, userId, memberUserId);
        return Ok(result);
    }
}