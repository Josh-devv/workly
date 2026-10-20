using Workly.Api.Dtos.Project;
using Workly.Api.Services;

namespace Workly.Api.Services.Project;

public interface IProjectService
{
    Task<List<ProjectResDto>> GetProjectsAsync(
        Guid userId,
        CancellationToken cancellationToken);

    Task<ServiceResult<ProjectResDto>> GetProjectByIdAsync(
        Guid id,
        Guid userId,
        CancellationToken cancellationToken);

    Task<ServiceResult<ProjectCreatedResult>> CreateProjectAsync(
        CreateProjectDto newProject,
        Guid userId,
        CancellationToken cancellationToken);

    Task<ServiceResult<ProjectResDto>> UpdateProjectAsync(
        Guid id,
        UpdateProjectDto updatedProject,
        Guid userId,
        CancellationToken cancellationToken);

    Task<ServiceResult<bool>> DeleteProjectAsync(
        Guid id,
        Guid userId,
        CancellationToken cancellationToken);
}
