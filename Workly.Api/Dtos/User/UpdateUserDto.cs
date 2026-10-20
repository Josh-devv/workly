namespace Workly.Api.Dtos.User;

public sealed record UpdateUserDto(
    string Name,
    DateTimeOffset UpdatedAt
);