using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Workly.Api.Models
{
    [Table("time_entries")]
    public class TimeEntries
    {
        [Key]
        [Column("id")]
        public Guid Id { get; set; }

        [Column("organization_id")]
        public Guid OrganizationId { get; set; }

        [Column("task_id")]
        public Guid TaskId { get; set; }

        [Column("user_id")]
        public Guid UserId { get; set; }
        
        [Column("started_at")]
        public DateTimeOffset StartedAt { get; set; }

        [Column("ended_at")]
        public DateTimeOffset? EndedAt { get; set; }

        [Column("duration_seconds")]
        public int DurationSeconds {get; set;}

        [Column("description")]
        public string Description { get; set; } = "";

        [Column("entry_type")]
        public string? EntryType { get; set; }

        [Column("created_at")]
        public DateTimeOffset CreatedAt { get; set; }

        [Column("updated_at")]
        public DateTimeOffset UpdatedAt { get; set; }
    }
}