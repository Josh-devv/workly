namespace Workly.Api.Dtos.User;

public sealed record  CreateUserDto(
     string Name,
     DateTimeOffset CreatedAt
);
