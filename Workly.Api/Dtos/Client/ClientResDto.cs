namespace Workly.Api.Dtos.Client;

public sealed record ClientResDto(
    Guid Id,
    string Name,
    string Company,
    string? Email,
    string? Phone,
    string? Address,
    string? Notes,
    Guid OrganizationId,
    DateTimeOffset CreatedAt
);