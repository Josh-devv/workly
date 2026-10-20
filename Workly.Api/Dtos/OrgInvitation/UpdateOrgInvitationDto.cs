using System.ComponentModel.DataAnnotations;

namespace Workly.Api.Dtos.OrgInvitation;

/// <summary>Data used to update an organization invitation.</summary>
public sealed record UpdateOrgInvitationDto
{
    [Required]
    public string Role { get; init; } = "";

    public string? Status { get; init; }
    public DateTimeOffset? ExpiresAt { get; init; }
}
