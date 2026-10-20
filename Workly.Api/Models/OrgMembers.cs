using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Workly.Api.Models
{
    [Table("organization_members")]
    public class OrgMembers
    {
        [Key]
        [Column("id")]
        public Guid Id { get; set; }


        [Column("organization_id")]
        public Guid OrganizationId { get; set; }

        [Column("user_id")]
        public Guid UserId { get; set; }

        [Column("role")]
        public string Role { get; set; } = "";

        [Column("created_at")]
        public DateTimeOffset CreatedAt { get; set; }



    }
}

