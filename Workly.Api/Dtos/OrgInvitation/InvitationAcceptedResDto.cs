namespace Workly.Api.Dtos.OrgInvitation;

public sealed record InvitationAcceptedResDto(
    string OrganizationName,
    Guid OrganizationId
);
