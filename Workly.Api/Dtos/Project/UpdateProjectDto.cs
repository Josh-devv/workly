using System.ComponentModel.DataAnnotations;

namespace Workly.Api.Dtos.Project;

/// <summary>Data used to update a project.</summary>
public sealed record UpdateProjectDto
{
    [Required]
    public string Name { get; init; } = "";

    [Required]
    public Guid OrganizationId { get; init; }

    [Required]
    public Guid ClientId { get; init; }

    public string Description { get; init; } = "";
    public string? Status { get; init; }
    public string? RateType { get; init; }
    public int? Rate { get; init; }
    public DateTimeOffset? Deadline { get; init; }
}
