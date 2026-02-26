using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SocialCoordinationApp.Services;

namespace SocialCoordinationApp.Controllers;

[ApiController]
[Route("api/[controller]")]
[AllowAnonymous]
public class SeedController : ControllerBase
{
    private readonly ISeedService _seedService;
    private readonly IWebHostEnvironment _environment;

    public SeedController(ISeedService seedService, IWebHostEnvironment environment)
    {
        _seedService = seedService;
        _environment = environment;
    }

    [HttpPost]
    public async Task<IActionResult> Seed()
    {
        if (!_environment.IsDevelopment())
        {
            return NotFound();
        }

        var result = await _seedService.SeedAsync();

        return Ok(new
        {
            message = "Seed completed successfully",
            result.UsersCreated,
            result.GroupsCreated,
            result.HangoutsCreated,
            result.FriendshipsCreated,
            result.NotificationsCreated
        });
    }
}