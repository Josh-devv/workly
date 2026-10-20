using System.ComponentModel.DataAnnotations;

namespace Workly.Api.Dtos.OrgInvitation;

/// <summary>Data required to create an organization invitation.</summary>
public sealed record CreateOrgInvitationDto
{
    [Required]
    public Guid OrganizationId { get; init; }

    [Required, EmailAddress]
    public string Email { get; init; } = "";

    [Required]
    public string Role { get; init; } = "";

    [Required]
    public string Token { get; init; } = "";

    [Required]
    public Guid InvitedBy { get; init; }

    public DateTimeOffset? ExpiresAt { get; init; }
}
