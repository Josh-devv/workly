using System;
using System.ComponentModel.DataAnnotations;

namespace Workly.Api.Dtos.Organization;

public class CreateOrgDto
{
    [Required]
    [StringLength(50)]
    public string Name { get; set; } = "";

}