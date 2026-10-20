namespace Workly.Api.Dtos.Client;

public sealed record ClientResDto(
    Guid Id,
    string Name,
    string Company,
    string? Email,
    string? Notes,
    DateTimeOffset Created_At
);