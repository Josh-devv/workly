namespace Workly.Api.Dtos.User;

public sealed record UserResDto(
    string Name,
    DateTimeOffset CreatedAt
);
