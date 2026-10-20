using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Workly.Api.Dtos.OrgMember;
using Workly.Api.Services.OrgMember;

namespace Workly.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class OrgMemberController(
    IOrgMemberService memberService,
    ILogger<OrgMemberController> logger
) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult> GetMembers(CancellationToken cancellationToken)
    {
        if (!TryGetUserId(out var userId))
            return Unauthorized();

        return Ok(await memberService.GetMembersAsync(userId, cancellationToken));
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult> GetMemberById(
        Guid id,
        CancellationToken cancellationToken)
    {
        if (!TryGetUserId(out var userId))
            return Unauthorized();

        var result = await memberService.GetMemberByIdAsync(id, userId, cancellationToken);

        return result.IsSuccess
            ? Ok(result.Value)
            : this.ToFailureResult(result);
    }

    [HttpPost]
    public async Task<ActionResult> AddMember(
        CreateOrgMemberDto newMember,
        CancellationToken cancellationToken)
    {
        if (!TryGetUserId(out var userId))
            return Unauthorized();

        try
        {
            var result = await memberService.AddMemberAsync(
                newMember,
                userId,
                cancellationToken);

            if (!result.IsSuccess)
                return this.ToFailureResult(result);

            return CreatedAtAction(
                nameof(GetMemberById),
                new { id = result.Value!.Id },
                result.Value);
        }
        catch (DbUpdateException ex)
        {
            logger.LogError(ex, "Failed to add organization member.");
            return Conflict(new
            {
                message = "The membership could not be created."
            });
        }
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult> UpdateMember(
        Guid id,
        UpdateOrgMemberDto update,
        CancellationToken cancellationToken)
    {
        if (!TryGetUserId(out var userId))
            return Unauthorized();

        var result = await memberService.UpdateMemberAsync(
            id,
            update,
            userId,
            cancellationToken);

        return result.IsSuccess ? NoContent() : this.ToFailureResult(result);
    }

    [HttpDelete("{id:guid}")]
    public async Task<ActionResult> DeleteMember(
        Guid id,
        CancellationToken cancellationToken)
    {
        if (!TryGetUserId(out var userId))
            return Unauthorized();

        var result = await memberService.DeleteMemberAsync(id, userId, cancellationToken);

        return result.IsSuccess ? NoContent() : this.ToFailureResult(result);
    }

    private bool TryGetUserId(out Guid userId)
    {
        var claim = User.FindFirstValue(ClaimTypes.NameIdentifier)
                    ?? User.FindFirstValue("sub");

        return Guid.TryParse(claim, out userId);
    }
}
