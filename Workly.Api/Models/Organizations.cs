using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Workly.Api.Models
{
    [Table("organizations")]
    public class Organizations
    {
        [Key]
        [Column("id")]
        public Guid Id { get; set; }

        [Column("name")]
        public string Name { get; set; } = "";

        [Column("created_at")]
        public DateTimeOffset Created_At { get; set; }

        [Column("created_by")]
        public Guid Created_By { get; set; }
    }
}