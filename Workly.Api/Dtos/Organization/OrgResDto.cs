namespace Workly.Api.Dtos.Organization;

public sealed record  OrgResDto(
    Guid Id,
    string Name,
    DateTimeOffset Created_At,
    Guid Created_By
);
