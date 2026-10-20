using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Workly.Api.Dtos.TimeEntry;
using Workly.Api.Services.TimeEntry;

namespace Workly.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class TimeEntryController(
    ITimeEntryService timeEntryService,
    ILogger<TimeEntryController> logger
) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult> GetTimeEntries(CancellationToken cancellationToken)
    {
        if (!TryGetUserId(out var userId))
            return Unauthorized();

        return Ok(await timeEntryService.GetTimeEntriesAsync(userId, cancellationToken));
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult> GetTimeEntryById(
        Guid id,
        CancellationToken cancellationToken)
    {
        if (!TryGetUserId(out var userId))
            return Unauthorized();

        var result = await timeEntryService.GetTimeEntryByIdAsync(
            id,
            userId,
            cancellationToken);

        return result.IsSuccess
            ? Ok(result.Value)
            : this.ToFailureResult(result);
    }

    [HttpPost]
    public async Task<ActionResult> CreateTimeEntry(
        CreateTimeEntryDto newEntry,
        CancellationToken cancellationToken)
    {
        if (!TryGetUserId(out var userId))
            return Unauthorized();

        try
        {
            var result = await timeEntryService.CreateTimeEntryAsync(
                newEntry,
                userId,
                cancellationToken);

            if (!result.IsSuccess)
                return this.ToFailureResult(result);

            return CreatedAtAction(
                nameof(GetTimeEntryById),
                new { id = result.Value!.Id },
                result.Value);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to create time entry.");
            return StatusCode(500, new
            {
                message = "An error occurred while creating the time entry."
            });
        }
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult> UpdateTimeEntry(
        Guid id,
        UpdateTimeEntryDto update,
        CancellationToken cancellationToken)
    {
        if (!TryGetUserId(out var userId))
            return Unauthorized();

        var result = await timeEntryService.UpdateTimeEntryAsync(
            id,
            update,
            userId,
            cancellationToken);

        return result.IsSuccess ? NoContent() : this.ToFailureResult(result);
    }

    [HttpDelete("{id:guid}")]
    public async Task<ActionResult> DeleteTimeEntry(
        Guid id,
        CancellationToken cancellationToken)
    {
        if (!TryGetUserId(out var userId))
            return Unauthorized();

        var result = await timeEntryService.DeleteTimeEntryAsync(id, userId, cancellationToken);

        return result.IsSuccess ? NoContent() : this.ToFailureResult(result);
    }

    private bool TryGetUserId(out Guid userId)
    {
        var claim = User.FindFirstValue(ClaimTypes.NameIdentifier)
                    ?? User.FindFirstValue("sub");

        return Guid.TryParse(claim, out userId);
    }
}
