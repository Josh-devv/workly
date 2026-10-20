using Workly.Api.Dtos.Client;
using Workly.Api.Models;

namespace Workly.Api.Services.Client;

public interface IClientService
{
    Task<List<Clients>> GetClientsAsync(Guid userId, CancellationToken cancellationToken);

    Task<Clients?> GetClientByIdAsync(
        Guid id,
        Guid userId,
        CancellationToken cancellationToken);

    Task<Clients?> CreateClientAsync(
        CreateClientDto newClient,
        Guid userId,
        CancellationToken cancellationToken);

    Task<Clients?> UpdateClientAsync(
        Guid id,
        UpdateClientDto updateClient,
        Guid userId,
        CancellationToken cancellationToken);

    Task<bool> DeleteClientAsync(
        Guid id,
        Guid userId,
        CancellationToken cancellationToken);
}
