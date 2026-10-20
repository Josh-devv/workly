using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Workly.Api.Models
{
    [Table("organization_invitations")]
    public class OrgInvitations
    {
        [Key]
        [Column("id")]
        public Guid Id { get; set; }


        [Column("organization_id")]
        public Guid OrganizationId { get; set; }

        [Column("email")]
        public string Email { get; set; } = "";

        [Column("role")]
        public string Role { get; set; } = "";

        [Column("token")]
        public string Token { get; set; } = "";

        [Column("status")]
        public string? Status { get; set; }

        [Column("invited_by")]
        public Guid InvitedBy { get; set; }

        [Column("expires_at")]
        public DateTimeOffset? ExpiresAt { get; set; }

        [Column("created_at")]
        public DateTimeOffset CreatedAt { get; set; }

        [Column("accepted_at")]
        public DateTimeOffset? AcceptedAt { get; set; }

        [Column("accepted_by")]
        public Guid? AcceptedBy { get; set; }
    }
}