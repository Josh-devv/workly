using Microsoft.EntityFrameworkCore;
using Workly.Api.Data;
using Workly.Api.Dtos.Project;
using Workly.Api.Models;
using Workly.Api.Services;

namespace Workly.Api.Services.Project;

public sealed class ProjectService(WorklyDbContext context) : IProjectService
{
    public Task<List<ProjectResDto>> GetProjectsAsync(
        Guid userId,
        CancellationToken cancellationToken) =>
        context.Project
            .AsNoTracking()
            .Where(project => context.OrgMember.Any(member =>
                member.UserId == userId &&
                member.OrganizationId == project.OrganizationId))
            .Select(project => ToDto(project))
            .ToListAsync(cancellationToken);

    public async Task<ServiceResult<ProjectResDto>> GetProjectByIdAsync(
        Guid id,
        Guid userId,
        CancellationToken cancellationToken)
    {
        var project = await context.Project
            .AsNoTracking()
            .FirstOrDefaultAsync(project =>
                project.Id == id &&
                context.OrgMember.Any(member =>
                    member.UserId == userId &&
                    member.OrganizationId == project.OrganizationId),
                cancellationToken);

        return project is null
            ? ServiceResult<ProjectResDto>.Failure(ServiceError.NotFound, "Project not found.")
            : ServiceResult<ProjectResDto>.Success(ToDto(project));
    }

    public async Task<ServiceResult<ProjectCreatedResult>> CreateProjectAsync(
        CreateProjectDto newProject,
        Guid userId,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(newProject.Name))
        {
            return ServiceResult<ProjectCreatedResult>.Failure(
                ServiceError.Invalid,
                "Organization and Client name are required.");
        }

        var clientBelongsToOrganization = await context.Client.AnyAsync(
            client =>
                client.Id == newProject.ClientId &&
                client.OrganizationId == newProject.OrganizationId,
            cancellationToken);

        if (!clientBelongsToOrganization)
        {
            return ServiceResult<ProjectCreatedResult>.Failure(
                ServiceError.Invalid,
                "The selected client must belong to the selected organization.");
        }

        var project = new Projects
        {
            Name = newProject.Name,
            OrganizationId = newProject.OrganizationId,
            ClientId = newProject.ClientId,
            Description = newProject.Description,
            Status = newProject.Status,
            Rate_Type = newProject.RateType,
            Rate = newProject.Rate,
            Deadline = newProject.Deadline
        };

        context.Project.Add(project);
        await context.SaveChangesAsync(cancellationToken);

        return ServiceResult<ProjectCreatedResult>.Success(
            new ProjectCreatedResult(project.Id, ToDto(project)));
    }

    public async Task<ServiceResult<ProjectResDto>> UpdateProjectAsync(
        Guid id,
        UpdateProjectDto updatedProject,
        Guid userId,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(updatedProject.Name) ||
            string.IsNullOrWhiteSpace(updatedProject.Status))
        {
            return ServiceResult<ProjectResDto>.Failure(
                ServiceError.Invalid,
                "Project name and status are required.");
        }

        var project = await context.Project
            .FirstOrDefaultAsync(project =>
                project.Id == id &&
                context.OrgMember.Any(member =>
                    member.UserId == userId &&
                    member.OrganizationId == project.OrganizationId),
                cancellationToken);

        if (project is null)
            return ServiceResult<ProjectResDto>.Failure(ServiceError.NotFound, "Project not found.");

        project.Name = updatedProject.Name;
        project.Description = updatedProject.Description;
        project.Status = updatedProject.Status;
        project.Rate_Type = updatedProject.RateType;
        project.Rate = updatedProject.Rate;
        project.Deadline = updatedProject.Deadline;

        await context.SaveChangesAsync(cancellationToken);

        return ServiceResult<ProjectResDto>.Success(ToDto(project));
    }

    public async Task<ServiceResult<bool>> DeleteProjectAsync(
        Guid id,
        Guid userId,
        CancellationToken cancellationToken)
    {
        var project = await context.Project
            .FirstOrDefaultAsync(project =>
                project.Id == id &&
                context.OrgMember.Any(member =>
                    member.UserId == userId &&
                    member.OrganizationId == project.OrganizationId),
                cancellationToken);

        if (project is null)
            return ServiceResult<bool>.Failure(ServiceError.NotFound, "Project not found.");

        context.Project.Remove(project);
        await context.SaveChangesAsync(cancellationToken);

        return ServiceResult<bool>.Success(true);
    }

    private static ProjectResDto ToDto(Projects project) =>
        new(
            project.Name,
            project.Description,
            project.Status,
            project.Rate_Type,
            project.Rate,
            project.Deadline,
            project.CreatedAt,
            project.UpdatedAt);
}
