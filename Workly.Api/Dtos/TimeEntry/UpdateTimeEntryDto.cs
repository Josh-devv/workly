using System.ComponentModel.DataAnnotations;

namespace Workly.Api.Dtos.TimeEntry;

/// <summary>Data used to update a time entry.</summary>
public sealed record UpdateTimeEntryDto
{
    [Required]
    public Guid OrganizationId { get; init; }

    [Required]
    public Guid TaskId { get; init; }

    [Required]
    public Guid UserId { get; init; }

    public DateTimeOffset StartedAt { get; init; }
    public DateTimeOffset? EndedAt { get; init; }
    public int DurationSeconds { get; init; }
    public string Description { get; init; } = "";
    public string? EntryType { get; init; }
}
