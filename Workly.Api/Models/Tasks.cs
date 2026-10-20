using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Workly.Api.Models
{
    [Table("tasks")]
    public class Tasks
    {
        [Key]
        [Column("id")]
        public Guid Id { get; set; }

        [Column("title")]
        public string Title { get; set; } = "";

        [Column("project_id")]
        public Guid ProjectId { get; set; }


        [Column("description")]
        public string Description { get; set; } = "";

        [Column("status")]
        public string? Status { get; set; }

        [Column("priority")]
        public string? Priority { get; set; }

        [Column("due_date")]
        public DateTimeOffset? DueDate { get; set; }

        [Column("created_at")]
        public DateTimeOffset CreatedAt { get; set; }

        [Column("updated_at")]
        public DateTimeOffset UpdatedAt { get; set; }

        [Column("assigned_to")]
        public Guid AssignedTo { get; set; }

        [Column("completed_at")]
        public DateTimeOffset? CompletedAt { get; set; }
    }
}
