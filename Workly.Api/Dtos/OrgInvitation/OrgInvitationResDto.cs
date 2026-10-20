namespace Workly.Api.Dtos.OrgInvitation;

/// <summary>Organization invitation data returned by the API.</summary>
public sealed record OrgInvitationResDto(
    Guid Id,
    Guid OrganizationId,
    string Email,
    string Role,
    string? Status,
    Guid InvitedBy,
    DateTimeOffset? ExpiresAt,
    DateTimeOffset CreatedAt,
    DateTimeOffset? AcceptedAt,
    Guid? AcceptedBy
);
