namespace Workly.Api.Dtos.Project;

/// <summary>Project data returned by the API.</summary>
public sealed record ProjectResDto(
    Guid Id,
    string Name,
    Guid OrganizationId,
    Guid ClientId,
    string Description,
    string? Status,
    string? RateType,
    decimal? Rate,
    DateTimeOffset? StartDate,
    DateTimeOffset? Deadline,
    DateTimeOffset CreatedAt,
    DateTimeOffset UpdatedAt
);
