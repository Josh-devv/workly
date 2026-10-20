using System.ComponentModel.DataAnnotations;

namespace Workly.Api.Dtos.OrgMember;

/// <summary>Data used to change an organization's member role.</summary>
public sealed record UpdateOrgMemberDto
{
    [Required]
    public string Role { get; init; } = "";
}
