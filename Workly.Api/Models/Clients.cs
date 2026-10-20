using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Workly.Api.Models
{
    [Table("clients")]
    public class Clients
    {
        [Key]
        [Column("id")]
        public Guid Id { get; set; }


        [Column("user_id")]
        public Guid UserId { get; set; }

        [Column("name")]
        public string Name { get; set; } = "";

        [Column("company")]
        public string Company { get; set; } = "";

        [Column("email")]
        public string? Email { get; set; }

        [Column("phone")]
        public string? Phone { get; set; }

        [Column("address")]
        public string? Address { get; set; }

        [Column("notes")]
        public string? Notes { get; set; }

        [Column("created_at")]
        public DateTimeOffset Created_At { get; set; }

        [Column("updated_at")]
        public DateTimeOffset Updated_At { get; set; }

        [Column("organization_id")]
        public Guid OrganizationId { get; set; }
    }
}