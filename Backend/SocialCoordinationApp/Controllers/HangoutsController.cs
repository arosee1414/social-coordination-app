using Microsoft.AspNetCore.Mvc;
using SocialCoordinationApp.Models.DTOs.Requests;
using SocialCoordinationApp.Models.DTOs.Responses;
using SocialCoordinationApp.Services;

namespace SocialCoordinationApp.Controllers;

[Route("api/hangouts")]
public class HangoutsController : BaseApiController
{
    private readonly IHangoutsService _hangoutsService;

    public HangoutsController(IHangoutsService hangoutsService)
    {
        _hangoutsService = hangoutsService;
    }

    [HttpPost]
    [ProducesResponseType(typeof(HangoutResponse), StatusCodes.Status201Created)]
    public async Task<ActionResult<HangoutResponse>> CreateHangout([FromBody] CreateHangoutRequest request)
    {
        var userId = GetUserId();
        var result = await _hangoutsService.CreateHangoutAsync(userId, request);
        return CreatedAtAction(nameof(GetHangout), new { id = result.Id }, result);
    }

    [HttpGet]
    [ProducesResponseType(typeof(List<HangoutSummaryResponse>), StatusCodes.Status200OK)]
    public async Task<ActionResult<List<HangoutSummaryResponse>>> GetMyHangouts()
    {
        var userId = GetUserId();
        var result = await _hangoutsService.GetUserHangoutsAsync(userId);
        return Ok(result);
    }

    [HttpGet("{id}")]
    [ProducesResponseType(typeof(HangoutResponse), StatusCodes.Status200OK)]
    public async Task<ActionResult<HangoutResponse>> GetHangout(string id)
    {
        var userId = GetUserId();
        var result = await _hangoutsService.GetHangoutAsync(id, userId);
        return Ok(result);
    }

    [HttpPut("{id}")]
    [ProducesResponseType(typeof(HangoutResponse), StatusCodes.Status200OK)]
    public async Task<ActionResult<HangoutResponse>> UpdateHangout(string id, [FromBody] UpdateHangoutRequest request)
    {
        var userId = GetUserId();
        var result = await _hangoutsService.UpdateHangoutAsync(id, userId, request);
        return Ok(result);
    }

    [HttpDelete("{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> DeleteHangout(string id)
    {
        var userId = GetUserId();
        await _hangoutsService.DeleteHangoutAsync(id, userId);
        return NoContent();
    }

    [HttpPost("{id}/rsvp")]
    [ProducesResponseType(typeof(HangoutResponse), StatusCodes.Status200OK)]
    public async Task<ActionResult<HangoutResponse>> UpdateRSVP(string id, [FromBody] UpdateRSVPRequest request)
    {
        var userId = GetUserId();
        var result = await _hangoutsService.UpdateRSVPAsync(id, userId, request);
        return Ok(result);
    }

    [HttpPost("{id}/cancel")]
    [ProducesResponseType(typeof(HangoutResponse), StatusCodes.Status200OK)]
    public async Task<ActionResult<HangoutResponse>> CancelHangout(string id)
    {
        var userId = GetUserId();
        var result = await _hangoutsService.CancelHangoutAsync(id, userId);
        return Ok(result);
    }

    [HttpPost("{id}/attendees")]
    [ProducesResponseType(typeof(HangoutResponse), StatusCodes.Status200OK)]
    public async Task<ActionResult<HangoutResponse>> AddAttendees(string id, [FromBody] AddHangoutAttendeesRequest request)
    {
        var userId = GetUserId();
        var result = await _hangoutsService.AddAttendeesAsync(id, userId, request);
        return Ok(result);
    }

    [HttpDelete("{id}/attendees/{attendeeUserId}")]
    [ProducesResponseType(typeof(HangoutResponse), StatusCodes.Status200OK)]
    public async Task<ActionResult<HangoutResponse>> RemoveAttendee(string id, string attendeeUserId)
    {
        var userId = GetUserId();
        var result = await _hangoutsService.RemoveAttendeeAsync(id, userId, attendeeUserId);
        return Ok(result);
    }
}
