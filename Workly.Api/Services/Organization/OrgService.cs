using Microsoft.EntityFrameworkCore;
using Workly.Api.Data;
using Workly.Api.Dtos.Organization;
using Workly.Api.Models;

namespace Workly.Api.Services.Organization;

public sealed class OrgService(WorklyDbContext context) : IOrgService
{
    public Task<List<Organizations>> GetOrgAsync(
        Guid userId,
        CancellationToken cancellationToken) =>
        context.Organization
            .AsNoTracking()
            .Where(org => context.OrgMember.Any(member =>
                member.UserId == userId &&
                member.OrganizationId == org.Id))
            .ToListAsync(cancellationToken);

    public Task<Organizations?> GetOrgByIdAsync(
        Guid id,
        Guid userId,
        CancellationToken cancellationToken) =>
        context.Organization
            .AsNoTracking()
            .FirstOrDefaultAsync(org =>
                org.Id == id &&
                context.OrgMember.Any(member =>
                    member.UserId == userId &&
                    member.OrganizationId == org.Id),
                cancellationToken);

    public async Task<Organizations?> CreateOrgAsync(
        CreateOrgDto newOrg,
        Guid userId,
        CancellationToken cancellationToken)
    {
        var name = newOrg.Name?.Trim();

        if (string.IsNullOrWhiteSpace(name))
            throw new ArgumentException("Organization name is required.");

        await using var transaction =
            await context.Database.BeginTransactionAsync(cancellationToken);

        var organization = new Organizations
        {
            Name = name,
            Created_By = userId
        };

        context.Organization.Add(organization);
        await context.SaveChangesAsync(cancellationToken);

        var membership = new OrgMembers
        {
            OrganizationId = organization.Id,
            UserId = userId,
            Role = "owner",
            CreatedAt = DateTimeOffset.UtcNow
        };

        context.OrgMember.Add(membership);
        await context.SaveChangesAsync(cancellationToken);

        await transaction.CommitAsync(cancellationToken);

        return organization;
    }

    public async Task<Organizations?> UpdateOrgAsync(
        Guid id,
        Guid userId,
        UpdateOrgDto updateOrg,
        CancellationToken cancellationToken)
    {
        var name = updateOrg.Name?.Trim();

        if (string.IsNullOrWhiteSpace(name))
            throw new ArgumentException("Organization name is required.");

        var canRename = await context.OrgMember.AnyAsync(member =>
            member.OrganizationId == id &&
            member.UserId == userId &&
            (member.Role == "owner" || member.Role == "admin"),
            cancellationToken);

        if (!canRename)
            return null;

        var organization = await context.Organization
            .FirstOrDefaultAsync(org => org.Id == id, cancellationToken);

        if (organization is null)
            return null;

        organization.Name = name;

        await context.SaveChangesAsync(cancellationToken);

        return organization;
    }

    public async Task<bool> DeleteOrgAsync(
        Guid id,
        Guid userId,
        CancellationToken cancellationToken)
    {
        var isOwner = await context.OrgMember.AnyAsync(member =>
            member.OrganizationId == id &&
            member.UserId == userId &&
            member.Role == "owner",
            cancellationToken);

        if (!isOwner)
            return false;

        var organization = await context.Organization
            .FirstOrDefaultAsync(org => org.Id == id, cancellationToken);

        if (organization is null)
            return false;

        context.Organization.Remove(organization);
        await context.SaveChangesAsync(cancellationToken);

        return true;
    }
}