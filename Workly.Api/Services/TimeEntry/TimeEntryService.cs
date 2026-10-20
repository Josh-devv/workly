using Microsoft.EntityFrameworkCore;
using Workly.Api.Data;
using Workly.Api.Dtos.TimeEntry;
using Workly.Api.Models;
using Workly.Api.Services;

namespace Workly.Api.Services.TimeEntry;

public sealed class TimeEntryService(WorklyDbContext context) : ITimeEntryService
{
    public Task<List<TimeEntryResDto>> GetTimeEntriesAsync(
        Guid userId,
        CancellationToken cancellationToken) =>
        AccessibleEntries(userId)
            .AsNoTracking()
            .Select(entry => ToDto(entry))
            .ToListAsync(cancellationToken);

    public async Task<ServiceResult<TimeEntryResDto>> GetTimeEntryByIdAsync(
        Guid id,
        Guid userId,
        CancellationToken cancellationToken)
    {
        var entry = await AccessibleEntries(userId)
            .AsNoTracking()
            .FirstOrDefaultAsync(entry => entry.Id == id, cancellationToken);

        return entry is null
            ? ServiceResult<TimeEntryResDto>.Failure(ServiceError.NotFound)
            : ServiceResult<TimeEntryResDto>.Success(ToDto(entry));
    }

    public async Task<ServiceResult<TimeEntryResDto>> CreateTimeEntryAsync(
        CreateTimeEntryDto newEntry,
        Guid userId,
        CancellationToken cancellationToken)
    {
        if (!await IsOrgMember(newEntry.OrganizationId, userId, cancellationToken))
            return ServiceResult<TimeEntryResDto>.Failure(ServiceError.Forbidden);

        if (!await IsValidTaskForOrganization(
                newEntry.TaskId,
                newEntry.OrganizationId,
                cancellationToken))
        {
            return ServiceResult<TimeEntryResDto>.Failure(
                ServiceError.Invalid,
                "The task must belong to a project in the selected organization.");
        }

        if (newEntry.DurationSeconds < 0)
        {
            return ServiceResult<TimeEntryResDto>.Failure(
                ServiceError.Invalid,
                "Duration cannot be negative.");
        }

        if (newEntry.EndedAt is not null &&
            newEntry.EndedAt < newEntry.StartedAt)
        {
            return ServiceResult<TimeEntryResDto>.Failure(
                ServiceError.Invalid,
                "End time cannot be earlier than start time.");
        }

        var now = DateTimeOffset.UtcNow;
        var entry = new TimeEntries
        {
            Id = Guid.NewGuid(),
            OrganizationId = newEntry.OrganizationId,
            TaskId = newEntry.TaskId,
            UserId = userId,
            StartedAt = newEntry.StartedAt,
            EndedAt = newEntry.EndedAt,
            DurationSeconds = newEntry.DurationSeconds,
            Description = newEntry.Description,
            EntryType = newEntry.EntryType,
            CreatedAt = now,
            UpdatedAt = now
        };

        context.TimeEntry.Add(entry);
        await context.SaveChangesAsync(cancellationToken);

        return ServiceResult<TimeEntryResDto>.Success(ToDto(entry));
    }

    public async Task<ServiceResult<bool>> UpdateTimeEntryAsync(
        Guid id,
        UpdateTimeEntryDto update,
        Guid userId,
        CancellationToken cancellationToken)
    {
        var entry = await AccessibleEntries(userId)
            .FirstOrDefaultAsync(entry => entry.Id == id, cancellationToken);

        if (entry is null)
            return ServiceResult<bool>.Failure(ServiceError.NotFound);

        var isOwner = entry.UserId == userId;
        var isAdmin = await CanManageEntry(
            entry.OrganizationId,
            userId,
            cancellationToken);

        if (!isOwner && !isAdmin)
            return ServiceResult<bool>.Failure(ServiceError.Forbidden);

        if (!await IsValidTaskForOrganization(
                update.TaskId,
                entry.OrganizationId,
                cancellationToken))
        {
            return ServiceResult<bool>.Failure(
                ServiceError.Invalid,
                "The task must belong to a project in the entry's organization.");
        }

        if (update.DurationSeconds < 0)
        {
            return ServiceResult<bool>.Failure(
                ServiceError.Invalid,
                "Duration cannot be negative.");
        }

        if (update.EndedAt is not null &&
            update.EndedAt < update.StartedAt)
        {
            return ServiceResult<bool>.Failure(
                ServiceError.Invalid,
                "End time cannot be earlier than start time.");
        }

        entry.TaskId = update.TaskId;
        entry.StartedAt = update.StartedAt;
        entry.EndedAt = update.EndedAt;
        entry.DurationSeconds = update.DurationSeconds;
        entry.Description = update.Description;
        entry.EntryType = update.EntryType;
        entry.UpdatedAt = DateTimeOffset.UtcNow;

        await context.SaveChangesAsync(cancellationToken);

        return ServiceResult<bool>.Success(true);
    }

    public async Task<ServiceResult<bool>> DeleteTimeEntryAsync(
        Guid id,
        Guid userId,
        CancellationToken cancellationToken)
    {
        var entry = await AccessibleEntries(userId)
            .FirstOrDefaultAsync(entry => entry.Id == id, cancellationToken);

        if (entry is null)
            return ServiceResult<bool>.Failure(ServiceError.NotFound);

        var isOwner = entry.UserId == userId;
        var isAdmin = await CanManageEntry(
            entry.OrganizationId,
            userId,
            cancellationToken);

        if (!isOwner && !isAdmin)
            return ServiceResult<bool>.Failure(ServiceError.Forbidden);

        context.TimeEntry.Remove(entry);
        await context.SaveChangesAsync(cancellationToken);

        return ServiceResult<bool>.Success(true);
    }

    private IQueryable<TimeEntries> AccessibleEntries(Guid userId) =>
        context.TimeEntry.Where(entry =>
            context.OrgMember.Any(member =>
                member.OrganizationId == entry.OrganizationId &&
                member.UserId == userId) &&
            context.Task.Any(task =>
                task.Id == entry.TaskId &&
                context.Project.Any(project =>
                    project.Id == task.ProjectId &&
                    project.OrganizationId == entry.OrganizationId)));

    private Task<bool> IsValidTaskForOrganization(
        Guid taskId,
        Guid organizationId,
        CancellationToken cancellationToken) =>
        context.Task.AnyAsync(task =>
            task.Id == taskId &&
            context.Project.Any(project =>
                project.Id == task.ProjectId &&
                project.OrganizationId == organizationId),
            cancellationToken);

    private Task<bool> IsOrgMember(
        Guid organizationId,
        Guid userId,
        CancellationToken cancellationToken) =>
        context.OrgMember.AnyAsync(member =>
            member.OrganizationId == organizationId &&
            member.UserId == userId,
            cancellationToken);

    private Task<bool> CanManageEntry(
        Guid organizationId,
        Guid userId,
        CancellationToken cancellationToken) =>
        context.OrgMember.AnyAsync(member =>
            member.OrganizationId == organizationId &&
            member.UserId == userId &&
            (member.Role == "owner" || member.Role == "admin"),
            cancellationToken);

    private static TimeEntryResDto ToDto(TimeEntries entry) =>
        new(
            entry.Id,
            entry.OrganizationId,
            entry.TaskId,
            entry.UserId,
            entry.StartedAt,
            entry.EndedAt,
            entry.DurationSeconds,
            entry.Description,
            entry.EntryType,
            entry.CreatedAt,
            entry.UpdatedAt);
}
