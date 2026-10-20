using Microsoft.EntityFrameworkCore;
using Workly.Api.Data;
using Workly.Api.Dtos.Task;
using Workly.Api.Models;
using Workly.Api.Services;
using TaskModel = Workly.Api.Models.Tasks;

namespace Workly.Api.Services.Tasks;

public sealed class TaskService(WorklyDbContext context) : ITaskService
{
    public Task<List<TaskResDto>> GetTasksAsync(
        Guid userId,
        CancellationToken cancellationToken) =>
        AccessibleTasks(userId)
            .AsNoTracking()
            .Select(task => ToDto(task))
            .ToListAsync(cancellationToken);

    public async Task<ServiceResult<TaskResDto>> GetTaskByIdAsync(
        Guid id,
        Guid userId,
        CancellationToken cancellationToken)
    {
        var task = await AccessibleTasks(userId)
            .AsNoTracking()
            .FirstOrDefaultAsync(task => task.Id == id, cancellationToken);

        return task is null
            ? ServiceResult<TaskResDto>.Failure(ServiceError.NotFound, "Task not found.")
            : ServiceResult<TaskResDto>.Success(ToDto(task));
    }

    public async Task<ServiceResult<TaskResDto>> CreateTaskAsync(
        CreateTaskDto newTask,
        Guid userId,
        CancellationToken cancellationToken)
    {
        if (newTask.ProjectId == Guid.Empty ||
            newTask.AssignedTo == Guid.Empty ||
            string.IsNullOrWhiteSpace(newTask.Title))
        {
            return ServiceResult<TaskResDto>.Failure(
                ServiceError.Invalid,
                "ProjectId, AssignedTo and Title are required.");
        }

        var project = await FindAccessibleProject(
            newTask.ProjectId,
            userId,
            cancellationToken);

        if (project is null)
            return ServiceResult<TaskResDto>.Failure(ServiceError.NotFound, "Project not found.");

        var assigneeIsMember = await IsMemberOfOrganization(
            project.OrganizationId,
            newTask.AssignedTo,
            cancellationToken);

        if (!assigneeIsMember)
        {
            return ServiceResult<TaskResDto>.Failure(
                ServiceError.Invalid,
                "The assigned user must belong to the project's organization.");
        }

        var task = new TaskModel
        {
            Title = newTask.Title.Trim(),
            ProjectId = project.Id,
            Description = newTask.Description,
            Status = newTask.Status,
            Priority = newTask.Priority,
            DueDate = newTask.DueDate,
            AssignedTo = newTask.AssignedTo,
            CreatedAt = DateTimeOffset.UtcNow,
            UpdatedAt = DateTimeOffset.UtcNow
        };

        context.Task.Add(task);
        await context.SaveChangesAsync(cancellationToken);

        return ServiceResult<TaskResDto>.Success(ToDto(task));
    }

    public async Task<ServiceResult<TaskResDto>> UpdateTaskAsync(
        Guid id,
        UpdateTaskDto updatedTask,
        Guid userId,
        CancellationToken cancellationToken)
    {
        if (updatedTask.ProjectId == Guid.Empty ||
            updatedTask.AssignedTo == Guid.Empty ||
            string.IsNullOrWhiteSpace(updatedTask.Title))
        {
            return ServiceResult<TaskResDto>.Failure(
                ServiceError.Invalid,
                "ProjectId, AssignedTo and Title are required.");
        }

        var task = await AccessibleTasks(userId)
            .FirstOrDefaultAsync(task => task.Id == id, cancellationToken);

        if (task is null)
            return ServiceResult<TaskResDto>.Failure(ServiceError.NotFound, "Task not found.");

        var targetProject = await FindAccessibleProject(
            updatedTask.ProjectId,
            userId,
            cancellationToken);

        if (targetProject is null)
        {
            return ServiceResult<TaskResDto>.Failure(
                ServiceError.NotFound,
                "Target project not found.");
        }

        var assigneeIsMember = await IsMemberOfOrganization(
            targetProject.OrganizationId,
            updatedTask.AssignedTo,
            cancellationToken);

        if (!assigneeIsMember)
        {
            return ServiceResult<TaskResDto>.Failure(
                ServiceError.Invalid,
                "The assigned user must belong to the target project's organization.");
        }

        task.Title = updatedTask.Title.Trim();
        task.ProjectId = targetProject.Id;
        task.Description = updatedTask.Description;
        task.Status = updatedTask.Status;
        task.Priority = updatedTask.Priority;
        task.DueDate = updatedTask.DueDate;
        task.AssignedTo = updatedTask.AssignedTo;
        task.UpdatedAt = DateTimeOffset.UtcNow;

        await context.SaveChangesAsync(cancellationToken);

        return ServiceResult<TaskResDto>.Success(ToDto(task));
    }

    public async Task<ServiceResult<bool>> DeleteTaskAsync(
        Guid id,
        Guid userId,
        CancellationToken cancellationToken)
    {
        var task = await AccessibleTasks(userId)
            .FirstOrDefaultAsync(task => task.Id == id, cancellationToken);

        if (task is null)
            return ServiceResult<bool>.Failure(ServiceError.NotFound, "Task not found.");

        context.Task.Remove(task);
        await context.SaveChangesAsync(cancellationToken);

        return ServiceResult<bool>.Success(true);
    }

    private IQueryable<TaskModel> AccessibleTasks(Guid userId) =>
        context.Task.Where(task =>
            context.Project.Any(project =>
                project.Id == task.ProjectId &&
                context.OrgMember.Any(member =>
                    member.OrganizationId == project.OrganizationId &&
                    member.UserId == userId)));

    private Task<Projects?> FindAccessibleProject(
        Guid projectId,
        Guid userId,
        CancellationToken cancellationToken) =>
        context.Project.FirstOrDefaultAsync(project =>
            project.Id == projectId &&
            context.OrgMember.Any(member =>
                member.OrganizationId == project.OrganizationId &&
                member.UserId == userId),
            cancellationToken);

    private Task<bool> IsMemberOfOrganization(
        Guid organizationId,
        Guid userId,
        CancellationToken cancellationToken) =>
        context.OrgMember.AnyAsync(member =>
            member.OrganizationId == organizationId &&
            member.UserId == userId,
            cancellationToken);

    private static TaskResDto ToDto(TaskModel task) =>
        new(
            task.Id,
            task.Title,
            task.ProjectId,
            task.Description,
            task.Status,
            task.Priority,
            task.DueDate,
            task.CreatedAt,
            task.UpdatedAt,
            task.AssignedTo,
            task.CompletedAt);
}
