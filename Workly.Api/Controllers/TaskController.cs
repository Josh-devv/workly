using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Workly.Api.Dtos.Task;
using Workly.Api.Services.Tasks;

namespace Workly.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class TaskController(
    ITaskService taskService,
    ILogger<TaskController> logger
) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IEnumerable<TaskResDto>>> GetTasks(
        CancellationToken cancellationToken)
    {
        if (!TryGetAuthenticatedUserId(out var userId))
            return Unauthorized();

        try
        {
            return Ok(await taskService.GetTasksAsync(userId, cancellationToken));
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to retrieve tasks for user {UserId}.", userId);
            return StatusCode(500, new { message = "An error occurred while retrieving tasks." });
        }
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<TaskResDto>> GetTaskById(
        Guid id,
        CancellationToken cancellationToken)
    {
        if (!TryGetAuthenticatedUserId(out var userId))
            return Unauthorized();

        try
        {
            var result = await taskService.GetTaskByIdAsync(id, userId, cancellationToken);
            return result.IsSuccess ? Ok(result.Value) : this.ToFailureResult(result);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to retrieve task {TaskId}.", id);
            return StatusCode(500, new { message = "An error occurred while retrieving the task." });
        }
    }

    [HttpPost]
    public async Task<ActionResult<TaskResDto>> PostTask(
        CreateTaskDto newTask,
        CancellationToken cancellationToken)
    {
        if (!TryGetAuthenticatedUserId(out var userId))
            return Unauthorized();

        try
        {
            var result = await taskService.CreateTaskAsync(newTask, userId, cancellationToken);

            if (!result.IsSuccess)
                return this.ToFailureResult(result);

            return CreatedAtAction(
                nameof(GetTaskById),
                new { id = result.Value!.Id },
                result.Value);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to create task.");
            return StatusCode(500, new { message = "An error occurred while creating the task." });
        }
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<TaskResDto>> EditTask(
        Guid id,
        UpdateTaskDto updatedTask,
        CancellationToken cancellationToken)
    {
        if (!TryGetAuthenticatedUserId(out var userId))
            return Unauthorized();

        try
        {
            var result = await taskService.UpdateTaskAsync(
                id,
                updatedTask,
                userId,
                cancellationToken);

            return result.IsSuccess ? Ok(result.Value) : this.ToFailureResult(result);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to update task {TaskId}.", id);
            return StatusCode(500, new { message = "An error occurred while updating the task." });
        }
    }

    [HttpPatch("{id:guid}/status")]
    public async Task<ActionResult> UpdateTaskStatus(
        Guid id,
        [FromBody] UpdateTaskStatusDto update,
        CancellationToken cancellationToken)
    {
        if (!TryGetAuthenticatedUserId(out var userId))
            return Unauthorized();

        var result = await taskService.UpdateTaskStatusAsync(
            id,
            update.Status,
            userId,
            cancellationToken);

        return result.IsSuccess
            ? NoContent()
            : this.ToFailureResult(result);
    }

    [HttpDelete("{id:guid}")]
    public async Task<ActionResult> DeleteTask(
        Guid id,
        CancellationToken cancellationToken)
    {
        if (!TryGetAuthenticatedUserId(out var userId))
            return Unauthorized();

        try
        {
            var result = await taskService.DeleteTaskAsync(id, userId, cancellationToken);
            return result.IsSuccess
                ? Ok(new { message = "Task deleted successfully." })
                : this.ToFailureResult(result);
        }

        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to delete task {TaskId}.", id);
            return StatusCode(500, new { message = "An error occurred while deleting the task." });
        }

    }

    private bool TryGetAuthenticatedUserId(out Guid userId)
    {
        var claim = User.FindFirstValue(ClaimTypes.NameIdentifier)
                    ?? User.FindFirstValue("sub");

        return Guid.TryParse(claim, out userId);
    }

    public sealed record UpdateTaskStatusDto(string Status);
}
