namespace Workly.Api.Dtos.OrgInvitation;

public sealed record InvitationLookupResDto(
    string OrganizationName,
    string Email,
    string Role,
    string Status,
    DateTimeOffset? ExpiresAt
);
