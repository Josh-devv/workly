using Microsoft.EntityFrameworkCore;
using Workly.Api.Data;
using Workly.Api.Dtos.Client;
using Workly.Api.Models;

namespace Workly.Api.Services.Client;

public sealed class ClientService(WorklyDbContext context) : IClientService
{
    public Task<List<Clients>> GetClientsAsync(
        Guid userId,
        CancellationToken cancellationToken) =>
        context.Client
            .AsNoTracking()
            .Where(client => context.OrgMember.Any(member =>
                member.UserId == userId &&
                member.OrganizationId == client.OrganizationId))
            .ToListAsync(cancellationToken);

    public Task<Clients?> GetClientByIdAsync(//the ? in Clients means that the return value is allowed to be null  which lets our controller  respond with if (client is null)return NotFound();
        Guid id,
        Guid userId,
        CancellationToken cancellationToken) =>
        context.Client
            .AsNoTracking()
            .FirstOrDefaultAsync(client =>
                client.Id == id &&
                context.OrgMember.Any(member =>
                    member.UserId == userId &&
                    member.OrganizationId == client.OrganizationId),
                cancellationToken);

    public async Task<Clients?> CreateClientAsync(
        CreateClientDto newClient,
        Guid userId,
        CancellationToken cancellationToken)
    {
        var isOwner = await context.OrgMember.AnyAsync(member =>
     member.UserId == userId &&
     member.OrganizationId == newClient.OrganizationId &&
     member.Role == "owner",
     cancellationToken);

        if (!isOwner)
            return null;

        var client = new Clients
        {
            UserId = userId,
            Name = newClient.Name,
            Company = newClient.Company,
            Phone = newClient.Phone,
            Email = newClient.Email,
            Address = newClient.Address,
            Notes = newClient.Notes,
            OrganizationId = newClient.OrganizationId
        };

        context.Client.Add(client);
        await context.SaveChangesAsync(cancellationToken);

        return client;
    }

    public async Task<Clients?> UpdateClientAsync(
        Guid id,
        UpdateClientDto updateClient,
        Guid userId,
        CancellationToken cancellationToken)
    {
        var client = await context.Client.FirstOrDefaultAsync(client =>
            client.Id == id &&
            context.OrgMember.Any(member =>
    member.UserId == userId &&
    member.OrganizationId == client.OrganizationId &&
    member.Role == "owner"),
            cancellationToken);

        if (client is null)
            return null;

        client.Name = updateClient.Name;
        client.Company = updateClient.Company;
        client.Email = updateClient.Email;
        client.Phone = updateClient.Phone;
        client.Address = updateClient.Address;

        client.Updated_At = DateTimeOffset.UtcNow;

        await context.SaveChangesAsync(cancellationToken);

        return client;
    }

    public async Task<bool> DeleteClientAsync(
        Guid id,
        Guid userId,
        CancellationToken cancellationToken)
    {
        var client = await context.Client.FirstOrDefaultAsync(client =>
            client.Id == id &&
            context.OrgMember.Any(member =>
    member.UserId == userId &&
    member.OrganizationId == client.OrganizationId &&
    member.Role == "owner"),
            cancellationToken);

        if (client is null)
            return false;

        context.Client.Remove(client);
        await context.SaveChangesAsync(cancellationToken);

        return true;
    }
}
