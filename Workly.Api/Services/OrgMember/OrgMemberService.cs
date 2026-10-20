using Microsoft.EntityFrameworkCore;
using Workly.Api.Data;
using Workly.Api.Dtos.OrgMember;
using Workly.Api.Models;
using Workly.Api.Services;

namespace Workly.Api.Services.OrgMember;

public sealed class OrgMemberService(WorklyDbContext context) : IOrgMemberService
{
    public Task<List<OrgMemberResDto>> GetMembersAsync(
        Guid userId,
        CancellationToken cancellationToken) =>
        context.OrgMember
            .AsNoTracking()
            .Where(member => context.OrgMember.Any(myMembership =>
                myMembership.OrganizationId == member.OrganizationId &&
                myMembership.UserId == userId))
            .Select(member => new OrgMemberResDto(
                member.Id,
                member.OrganizationId,
                member.UserId,
                member.Role,
                context.User
                    .Where(user => user.Id == member.UserId)
                    .Select(user => user.Name)
                    .FirstOrDefault() ?? "",
                member.CreatedAt))
            .ToListAsync(cancellationToken);

    public async Task<ServiceResult<OrgMemberResDto>> GetMemberByIdAsync(
        Guid id,
        Guid userId,
        CancellationToken cancellationToken)
    {
        var member = await context.OrgMember
            .AsNoTracking()
            .FirstOrDefaultAsync(member =>
                member.Id == id &&
                context.OrgMember.Any(myMembership =>
                    myMembership.OrganizationId == member.OrganizationId &&
                    myMembership.UserId == userId),
                cancellationToken);

        return member is null
            ? ServiceResult<OrgMemberResDto>.Failure(ServiceError.NotFound)
            : ServiceResult<OrgMemberResDto>.Success(await ToDtoAsync(member, cancellationToken));
    }

    public async Task<ServiceResult<OrgMemberResDto>> AddMemberAsync(
        CreateOrgMemberDto newMember,
        Guid userId,
        CancellationToken cancellationToken)
    {
        if (!await IsOrgAdmin(newMember.OrganizationId, userId, cancellationToken))
            return ServiceResult<OrgMemberResDto>.Failure(ServiceError.Forbidden);

        if (newMember.Role != "member" && newMember.Role != "admin")
        {
            return ServiceResult<OrgMemberResDto>.Failure(
                ServiceError.Invalid,
                "Only member or admin roles can be assigned here.");
        }

        var callerIsOwner = await IsOrgOwner(
            newMember.OrganizationId,
            userId,
            cancellationToken);

        if (newMember.Role == "admin" && !callerIsOwner)
            return ServiceResult<OrgMemberResDto>.Failure(ServiceError.Forbidden);

        var targetUserExists = await context.User.AnyAsync(
            user => user.Id == newMember.UserId,
            cancellationToken);

        if (!targetUserExists)
        {
            return ServiceResult<OrgMemberResDto>.Failure(
                ServiceError.Invalid,
                "The user does not exist.");
        }

        var alreadyMember = await context.OrgMember.AnyAsync(
            member =>
                member.OrganizationId == newMember.OrganizationId &&
                member.UserId == newMember.UserId,
            cancellationToken);

        if (alreadyMember)
        {
            return ServiceResult<OrgMemberResDto>.Failure(
                ServiceError.Conflict,
                "The user is already a member.");
        }

        var membership = new OrgMembers
        {
            Id = Guid.NewGuid(),
            OrganizationId = newMember.OrganizationId,
            UserId = newMember.UserId,
            Role = newMember.Role,
            CreatedAt = DateTimeOffset.UtcNow
        };

        context.OrgMember.Add(membership);
        await context.SaveChangesAsync(cancellationToken);

        return ServiceResult<OrgMemberResDto>.Success(await ToDtoAsync(membership, cancellationToken));
    }

    public async Task<ServiceResult<bool>> UpdateMemberAsync(
        Guid id,
        UpdateOrgMemberDto update,
        Guid userId,
        CancellationToken cancellationToken)
    {
        var member = await context.OrgMember
            .FirstOrDefaultAsync(member => member.Id == id, cancellationToken);

        if (member is null)
            return ServiceResult<bool>.Failure(ServiceError.NotFound);

        if (!await IsOrgAdmin(member.OrganizationId, userId, cancellationToken))
            return ServiceResult<bool>.Failure(ServiceError.Forbidden);

        if (member.Role == "owner")
        {
            return ServiceResult<bool>.Failure(
                ServiceError.Invalid,
                "Owner roles cannot be changed through this endpoint.");
        }

        if (update.Role != "member" && update.Role != "admin")
            return ServiceResult<bool>.Failure(ServiceError.Invalid, "Invalid role.");

        var callerIsOwner = await IsOrgOwner(
            member.OrganizationId,
            userId,
            cancellationToken);

        if (update.Role == "admin" && !callerIsOwner)
            return ServiceResult<bool>.Failure(ServiceError.Forbidden);

        member.Role = update.Role;
        await context.SaveChangesAsync(cancellationToken);

        return ServiceResult<bool>.Success(true);
    }

    public async Task<ServiceResult<bool>> DeleteMemberAsync(
        Guid id,
        Guid userId,
        CancellationToken cancellationToken)
    {
        var member = await context.OrgMember
            .FirstOrDefaultAsync(member => member.Id == id, cancellationToken);

        if (member is null)
            return ServiceResult<bool>.Failure(ServiceError.NotFound);

        if (!await IsOrgAdmin(member.OrganizationId, userId, cancellationToken))
            return ServiceResult<bool>.Failure(ServiceError.Forbidden);

        if (member.Role == "owner")
        {
            return ServiceResult<bool>.Failure(
                ServiceError.Invalid,
                "An owner cannot be removed through this endpoint.");
        }

        context.OrgMember.Remove(member);
        await context.SaveChangesAsync(cancellationToken);

        return ServiceResult<bool>.Success(true);
    }

    private Task<bool> IsOrgAdmin(
        Guid organizationId,
        Guid userId,
        CancellationToken cancellationToken) =>
        context.OrgMember.AnyAsync(
            member =>
                member.OrganizationId == organizationId &&
                member.UserId == userId &&
                (member.Role == "owner" || member.Role == "admin"),
            cancellationToken);

    private Task<bool> IsOrgOwner(
        Guid organizationId,
        Guid userId,
        CancellationToken cancellationToken) =>
        context.OrgMember.AnyAsync(
            member =>
                member.OrganizationId == organizationId &&
                member.UserId == userId &&
                member.Role == "owner",
            cancellationToken);

    private async Task<OrgMemberResDto> ToDtoAsync(
        OrgMembers member,
        CancellationToken cancellationToken)
    {
        var name = await context.User
            .Where(user => user.Id == member.UserId)
            .Select(user => user.Name)
            .FirstOrDefaultAsync(cancellationToken);

        return new OrgMemberResDto(
            member.Id,
            member.OrganizationId,
            member.UserId,
            member.Role,
            name ?? "",
            member.CreatedAt);
    }
}
