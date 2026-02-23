using Microsoft.AspNetCore.Mvc;
using SocialCoordinationApp.Models.DTOs.Requests;
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
    public async Task<IActionResult> CreateHangout([FromBody] CreateHangoutRequest request)
    {
        var userId = GetUserId();
        var result = await _hangoutsService.CreateHangoutAsync(userId, request);
        return CreatedAtAction(nameof(GetHangout), new { id = result.Id }, result);
    }

    [HttpGet]
    public async Task<IActionResult> GetMyHangouts()
    {
        var userId = GetUserId();
        var result = await _hangoutsService.GetUserHangoutsAsync(userId);
        return Ok(result);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetHangout(string id)
    {
        var userId = GetUserId();
        var result = await _hangoutsService.GetHangoutAsync(id, userId);
        return Ok(result);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateHangout(string id, [FromBody] UpdateHangoutRequest request)
    {
        var userId = GetUserId();
        var result = await _hangoutsService.UpdateHangoutAsync(id, userId, request);
        return Ok(result);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteHangout(string id)
    {
        var userId = GetUserId();
        await _hangoutsService.DeleteHangoutAsync(id, userId);
        return NoContent();
    }

    [HttpPost("{id}/rsvp")]
    public async Task<IActionResult> UpdateRSVP(string id, [FromBody] UpdateRSVPRequest request)
    {
        var userId = GetUserId();
        var result = await _hangoutsService.UpdateRSVPAsync(id, userId, request);
        return Ok(result);
    }

    [HttpPost("{id}/cancel")]
    public async Task<IActionResult> CancelHangout(string id)
    {
        var userId = GetUserId();
        var result = await _hangoutsService.CancelHangoutAsync(id, userId);
        return Ok(result);
    }
}