namespace Workly.Api.Dtos.OrgInvitation;

public sealed record InvitationCreatedResDto(
    OrgInvitationResDto Invitation,
    string Token
);
