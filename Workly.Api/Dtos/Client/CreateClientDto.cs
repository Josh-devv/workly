using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Workly.Api.Dtos.Client;

public class CreateClientDto
{
    //public Guid UserId {get; set;}


    [Required]
    [StringLength(50)]
    public string Name { get; set; } = "";


    public string Company { get; set; } = "";


    public string? Email { get; set; }


    public string? Phone { get; set; }

    public string? Address { get; set; }

    public string? Notes { get; set; }


    //OrganizationId tells Workly which organization owns a particular client.
    public Guid OrganizationId { get; set; }
}