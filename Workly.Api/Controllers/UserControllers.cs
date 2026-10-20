using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Workly.Api.Dtos.User;
using Workly.Api.Services.User;

namespace Workly.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class UserController(
    IUserService userService,
    ILogger<UserController> logger
) : ControllerBase
{
    [HttpGet("me")]
    public async Task<ActionResult<UserResDto>> GetMyProfile(
        CancellationToken cancellationToken)
    {
        if (!TryGetAuthenticatedUserId(out var userId))
            return Unauthorized();

        try
        {
            var result = await userService.GetProfileAsync(userId, userId, cancellationToken);
            return result.IsSuccess ? Ok(result.Value) : this.ToFailureResult(result);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to retrieve profile for user {UserId}.", userId);
            return StatusCode(500, new
            {
                message = "An error occurred while retrieving your profile."
            });
        }
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<UserResDto>> GetUserById(
        Guid id,
        CancellationToken cancellationToken)
    {
        if (!TryGetAuthenticatedUserId(out var userId))
            return Unauthorized();

        try
        {
            var result = await userService.GetProfileAsync(id, userId, cancellationToken);
            return result.IsSuccess ? Ok(result.Value) : this.ToFailureResult(result);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to retrieve profile for user {UserId}.", userId);
            return StatusCode(500, new
            {
                message = "An error occurred while retrieving the user profile."
            });
        }
    }

    private bool TryGetAuthenticatedUserId(out Guid userId)
    {
        var claim = User.FindFirstValue(ClaimTypes.NameIdentifier)
                    ?? User.FindFirstValue("sub");

        return Guid.TryParse(claim, out userId);
    }
}
