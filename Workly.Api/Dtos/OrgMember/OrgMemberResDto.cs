namespace Workly.Api.Dtos.OrgMember;

/// <summary>Organization member data returned by the API.</summary>
public sealed record OrgMemberResDto(
    Guid Id,
    Guid OrganizationId,
    Guid UserId,
    string Role,
    string Name,
    DateTimeOffset CreatedAt
);
