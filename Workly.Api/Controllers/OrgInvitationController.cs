using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Workly.Api.Dtos.OrgInvitation;
using Workly.Api.Services.OrgInvitation;

namespace Workly.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class OrgInvitationController(
    IOrgInvitationService invitationService,
    ILogger<OrgInvitationController> logger
) : ControllerBase
{
    [AllowAnonymous]
    [HttpGet("token/{token}")]
    public async Task<ActionResult> GetInvitationByToken(
        string token,
        CancellationToken cancellationToken)
    {
        var invitation = await invitationService.GetInvitationByTokenAsync(
            token,
            cancellationToken);
        return invitation is null
            ? NotFound(new { message = "Invitation not found or expired." })
            : Ok(invitation);
    }

    [HttpPost("token/{token}/accept")]
    public async Task<ActionResult> AcceptInvitation(
        string token,
        CancellationToken cancellationToken)
    {
        if (!TryGetUserId(out var userId))
            return Unauthorized();

        var email = User.FindFirstValue(ClaimTypes.Email)
                    ?? User.FindFirstValue("email");
        var result = await invitationService.AcceptInvitationAsync(
            token,
            userId,
            email,
            cancellationToken);
        return result.IsSuccess
            ? Ok(result.Value)
            : this.ToFailureResult(result);
    }

    [HttpGet]
    public async Task<ActionResult> GetInvitations(CancellationToken cancellationToken)
    {
        if (!TryGetUserId(out var userId))
            return Unauthorized();

        return Ok(await invitationService.GetInvitationsAsync(userId, cancellationToken));
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult> GetInvitationById(
        Guid id,
        CancellationToken cancellationToken)
    {
        if (!TryGetUserId(out var userId))
            return Unauthorized();

        var result = await invitationService.GetInvitationByIdAsync(
            id,
            userId,
            cancellationToken);

        return result.IsSuccess
            ? Ok(result.Value)
            : this.ToFailureResult(result);
    }

    [HttpPost]
    public async Task<ActionResult> CreateInvitation(
        CreateOrgInvitationDto newInvitation,
        CancellationToken cancellationToken)
    {
        if (!TryGetUserId(out var userId))
            return Unauthorized();

        try
        {
            var result = await invitationService.CreateInvitationAsync(
                newInvitation,
                userId,
                cancellationToken);

            if (!result.IsSuccess)
                return this.ToFailureResult(result);

            return CreatedAtAction(
                nameof(GetInvitationById),
                new { id = result.Value!.Invitation.Id },
                result.Value);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to create organization invitation.");
            return StatusCode(500, new
            {
                message = "An error occurred while creating the invitation."
            });
        }
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult> UpdateInvitation(
        Guid id,
        UpdateOrgInvitationDto update,
        CancellationToken cancellationToken)
    {
        if (!TryGetUserId(out var userId))
            return Unauthorized();

        var result = await invitationService.UpdateInvitationAsync(
            id,
            update,
            userId,
            cancellationToken);

        return result.IsSuccess ? NoContent() : this.ToFailureResult(result);
    }

    [HttpDelete("{id:guid}")]
    public async Task<ActionResult> DeleteInvitation(
        Guid id,
        CancellationToken cancellationToken)
    {
        if (!TryGetUserId(out var userId))
            return Unauthorized();

        var result = await invitationService.DeleteInvitationAsync(
            id,
            userId,
            cancellationToken);

        return result.IsSuccess ? NoContent() : this.ToFailureResult(result);
    }

    private bool TryGetUserId(out Guid userId)
    {
        var claim = User.FindFirstValue(ClaimTypes.NameIdentifier)
                    ?? User.FindFirstValue("sub");

        return Guid.TryParse(claim, out userId);
    }
}
