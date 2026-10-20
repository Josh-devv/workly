namespace Workly.Api.Dtos.TimeEntry;

/// <summary>Time entry data returned by the API.</summary>
public sealed record TimeEntryResDto(
    Guid Id,
    Guid OrganizationId,
    Guid TaskId,
    Guid UserId,
    DateTimeOffset StartedAt,
    DateTimeOffset? EndedAt,
    int DurationSeconds,
    string Description,
    string? EntryType,
    DateTimeOffset CreatedAt,
    DateTimeOffset UpdatedAt
);
