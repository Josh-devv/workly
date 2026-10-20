using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Workly.Api.Models
{
    [Table("projects")]
    public class Projects
    {
        [Key]
        [Column("id")]
        public Guid Id { get; set; }

        [Column("name")]
        public string Name { get; set; } = "";

        [Column("organization_id")]
        public Guid OrganizationId { get; set; }

        [Column("client_id")]
        public Guid ClientId { get; set; }

        [Column("description")]
        public string Description { get; set; } = "";

        [Column("start_date")]
        public DateTimeOffset? StartDate { get; set; }

        [Column("status")]
        public string? Status { get; set; }

        [Column("rate_type")]
        public string? Rate_Type { get; set; }

        [Column("rate")]
        public decimal? Rate { get; set; }

        [Column("deadline")]
        public DateTimeOffset? Deadline { get; set; }

        [Column("created_at")]
        public DateTimeOffset CreatedAt { get; set; }

        [Column("updated_at")]
        public DateTimeOffset UpdatedAt { get; set; }
    }
}