using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Workly.Api.Models
{
    [Table("users")]
    public class Users
    {
        [Key]
        [Column("id")]
        public Guid Id { get; set; }

        [Required]
        [Column("name")]
        public string Name { get; set; } = "";

            [Column("created_at")]
            public DateTimeOffset CreatedAt { get; set; }

        [Column("upddated_at")]
        public DateTimeOffset UpdatedAt { get; set; }
    }
}