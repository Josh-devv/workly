using System;
using System.ComponentModel.DataAnnotations;

namespace Workly.Api.Dtos.Organization;

public class UpdateOrgDto
{
    [Required]
    [StringLength(50)]
    public string Name { get; set; } = "";
}
