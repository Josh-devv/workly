using System.ComponentModel.DataAnnotations;

namespace Workly.Api.Dtos.OrgMember;

/// <summary>Data required to add a member to an organization.</summary>
public sealed record CreateOrgMemberDto
{
    [Required]
    public Guid OrganizationId { get; init; }

    [Required]
    public Guid UserId { get; init; }

    [Required]
    public string Role { get; init; } = "";
}
