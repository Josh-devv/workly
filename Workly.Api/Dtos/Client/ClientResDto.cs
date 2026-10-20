using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Workly.Api.Dtos.Client;

public sealed record ClientResDto(

    
    string Name,

    string Company,

    string? Email,
    
    string? Notes,

    DateTimeOffset Created_At
    


);