namespace Workly.Api.Dtos.Task;

/// <summary>Task data returned by the API.</summary>
public sealed record TaskResDto(
    Guid Id,
    string Title,
    Guid ProjectId,
    string Description,
    string? Status,
    string? Priority,
    DateTimeOffset? DueDate,
    DateTimeOffset CreatedAt,
    DateTimeOffset UpdatedAt,
    Guid AssignedTo,
    DateTimeOffset? CompletedAt
);
