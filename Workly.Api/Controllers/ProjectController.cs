using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Workly.Api.Dtos.Project;
using Workly.Api.Services.Project;

namespace Workly.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class ProjectController(
    IProjectService projectService,
    ILogger<ProjectController> logger
) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IEnumerable<ProjectResDto>>> GetProjects(
        CancellationToken cancellationToken)
    {
        if (!TryGetAuthenticatedUserId(out var userId))
            return Unauthorized();

        try
        {
            return Ok(await projectService.GetProjectsAsync(userId, cancellationToken));
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to retrieve projects.");
            return StatusCode(500, new { message = "An error occurred while retrieving projects." });
        }
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<ProjectResDto>> GetProjectById(
        Guid id,
        CancellationToken cancellationToken)
    {
        if (!TryGetAuthenticatedUserId(out var userId))
            return Unauthorized();

        try
        {
            var result = await projectService.GetProjectByIdAsync(id, userId, cancellationToken);
            return result.IsSuccess ? Ok(result.Value) : this.ToFailureResult(result);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to retrieve project {ProjectId}.", id);
            return StatusCode(500, new { message = "An error occurred while retrieving the project." });
        }
    }

    [HttpPost]
    public async Task<ActionResult<ProjectResDto>> PostProject(
        CreateProjectDto newProject,
        CancellationToken cancellationToken)
    {
        if (!TryGetAuthenticatedUserId(out var userId))
            return Unauthorized();

        try
        {
            var result = await projectService.CreateProjectAsync(
                newProject,
                userId,
                cancellationToken);

            if (!result.IsSuccess)
                return this.ToFailureResult(result);

            return CreatedAtAction(
                nameof(GetProjectById),
                new { id = result.Value!.Id },
                result.Value.Project);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to create project.");
            return StatusCode(500, new { message = "An error occurred while creating the project." });
        }
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<ProjectResDto>> EditProject(
        Guid id,
        UpdateProjectDto updatedProject,
        CancellationToken cancellationToken)
    {
        if (!TryGetAuthenticatedUserId(out var userId))
            return Unauthorized();

        try
        {
            var result = await projectService.UpdateProjectAsync(
                id,
                updatedProject,
                userId,
                cancellationToken);

            return result.IsSuccess ? Ok(result.Value) : this.ToFailureResult(result);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to update project {ProjectId}.", id);
            return StatusCode(500, new { message = "An error occurred while updating the project." });
        }
    }

    [HttpDelete("{id:guid}")]
    public async Task<ActionResult> DeleteProject(
        Guid id,
        CancellationToken cancellationToken)
    {
        if (!TryGetAuthenticatedUserId(out var userId))
            return Unauthorized();

        try
        {
            var result = await projectService.DeleteProjectAsync(id, userId, cancellationToken);
            return result.IsSuccess
                ? Ok(new { message = "Project deleted successfully." })
                : this.ToFailureResult(result);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to delete project {ProjectId}.", id);
            return StatusCode(500, new { message = "An error occurred while deleting the project." });
        }
    }

    private bool TryGetAuthenticatedUserId(out Guid userId)
    {
        var userIdClaim =
            User.FindFirstValue(ClaimTypes.NameIdentifier) ??
            User.FindFirstValue("sub");

        return Guid.TryParse(userIdClaim, out userId);
    }
}
