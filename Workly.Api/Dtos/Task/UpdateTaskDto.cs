using System.ComponentModel.DataAnnotations;

namespace Workly.Api.Dtos.Task;

/// <summary>Data used to update a task.</summary>
public sealed record UpdateTaskDto
{
    [Required]
    public string Title { get; init; } = "";

    [Required]
    public Guid ProjectId { get; init; }

    public string Description { get; init; } = "";
    public string? Status { get; init; }
    public string? Priority { get; init; }
    public DateTimeOffset? DueDate { get; init; }
    public Guid AssignedTo { get; init; }
}
