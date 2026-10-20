using System;
using Workly.Api.Dtos.Client;
using Workly.Api.Dtos.Organization;
using Workly.Api.Models;

namespace Workly.Api.Services.Organization;

public interface IOrgService
{
    Task<List<Organizations>> GetOrgAsync(Guid userId, CancellationToken cancellationToken);

    Task<Organizations?> GetOrgByIdAsync(
        Guid id,
        Guid userId,
        CancellationToken cancellationToken
    );

    Task<Organizations?> CreateOrgAsync(
        
        CreateOrgDto newOrg,
        Guid userId,
        CancellationToken cancellationToken
    );

    Task<Organizations?> UpdateOrgAsync(
        Guid id,
        Guid userId,
        UpdateOrgDto updateOrg,
        CancellationToken cancellationToken
    );

    Task<bool> DeleteOrgAsync(
        Guid id,
        Guid userId,
        CancellationToken cancellationToken
    );
}
