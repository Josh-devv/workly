using System.Security.Cryptography;
using Microsoft.EntityFrameworkCore;
using Workly.Api.Data;
using Workly.Api.Dtos.OrgInvitation;
using Workly.Api.Models;
using Workly.Api.Services;

namespace Workly.Api.Services.OrgInvitation;

public sealed class OrgInvitationService(WorklyDbContext context) : IOrgInvitationService
{
    public Task<List<OrgInvitationResDto>> GetInvitationsAsync(
        Guid userId,
        CancellationToken cancellationToken) =>
        context.OrgInvitation
            .AsNoTracking()
            .Where(invitation => context.OrgMember.Any(member =>
                member.OrganizationId == invitation.OrganizationId &&
                member.UserId == userId &&
                (member.Role == "owner" || member.Role == "admin")))
            .Select(invitation => ToDto(invitation))
            .ToListAsync(cancellationToken);

    public async Task<ServiceResult<OrgInvitationResDto>> GetInvitationByIdAsync(
        Guid id,
        Guid userId,
        CancellationToken cancellationToken)
    {
        var invitation = await context.OrgInvitation
            .AsNoTracking()
            .FirstOrDefaultAsync(
                invitation =>
                    invitation.Id == id &&
                    context.OrgMember.Any(member =>
                        member.OrganizationId == invitation.OrganizationId &&
                        member.UserId == userId &&
                        (member.Role == "owner" || member.Role == "admin")),
                cancellationToken);

        return invitation is null
            ? ServiceResult<OrgInvitationResDto>.Failure(ServiceError.NotFound)
            : ServiceResult<OrgInvitationResDto>.Success(ToDto(invitation));
    }

    public async Task<ServiceResult<OrgInvitationResDto>> CreateInvitationAsync(
        CreateOrgInvitationDto newInvitation,
        Guid userId,
        CancellationToken cancellationToken)
    {
        if (!await IsOrgAdmin(newInvitation.OrganizationId, userId, cancellationToken))
            return ServiceResult<OrgInvitationResDto>.Failure(ServiceError.Forbidden);

        if (string.IsNullOrWhiteSpace(newInvitation.Email))
        {
            return ServiceResult<OrgInvitationResDto>.Failure(
                ServiceError.Invalid,
                "An email address is required.");
        }

        if (newInvitation.ExpiresAt <= DateTimeOffset.UtcNow)
        {
            return ServiceResult<OrgInvitationResDto>.Failure(
                ServiceError.Invalid,
                "The expiration time must be in the future.");
        }

        if (newInvitation.Role != "member" && newInvitation.Role != "admin")
        {
            return ServiceResult<OrgInvitationResDto>.Failure(
                ServiceError.Invalid,
                "Invitations may only assign member or admin roles.");
        }

        var callerIsOwner = await IsOrgOwner(
            newInvitation.OrganizationId,
            userId,
            cancellationToken);

        if (newInvitation.Role == "admin" && !callerIsOwner)
            return ServiceResult<OrgInvitationResDto>.Failure(ServiceError.Forbidden);

        var email = newInvitation.Email.Trim().ToLowerInvariant();
        var now = DateTimeOffset.UtcNow;
        var duplicateInvitation = await context.OrgInvitation.AnyAsync(
            invitation =>
                invitation.OrganizationId == newInvitation.OrganizationId &&
                invitation.Email.ToLower() == email &&
                invitation.Status == "pending" &&
                invitation.ExpiresAt > now,
            cancellationToken);

        if (duplicateInvitation)
        {
            return ServiceResult<OrgInvitationResDto>.Failure(
                ServiceError.Conflict,
                "There is already a pending invitation for this email.");
        }

        var invitation = new OrgInvitations
        {
            Id = Guid.NewGuid(),
            OrganizationId = newInvitation.OrganizationId,
            Email = email,
            Role = newInvitation.Role,
            Status = "pending",
            InvitedBy = userId,
            ExpiresAt = newInvitation.ExpiresAt,
            CreatedAt = now,
            Token = Convert.ToHexString(RandomNumberGenerator.GetBytes(32))
        };

        context.OrgInvitation.Add(invitation);
        await context.SaveChangesAsync(cancellationToken);

        return ServiceResult<OrgInvitationResDto>.Success(ToDto(invitation));
    }

    public async Task<ServiceResult<bool>> UpdateInvitationAsync(
        Guid id,
        UpdateOrgInvitationDto update,
        Guid userId,
        CancellationToken cancellationToken)
    {
        var invitation = await context.OrgInvitation
            .FirstOrDefaultAsync(invitation => invitation.Id == id, cancellationToken);

        if (invitation is null)
            return ServiceResult<bool>.Failure(ServiceError.NotFound);

        if (!await IsOrgAdmin(invitation.OrganizationId, userId, cancellationToken))
            return ServiceResult<bool>.Failure(ServiceError.Forbidden);

        if (invitation.Status != "pending")
        {
            return ServiceResult<bool>.Failure(
                ServiceError.Invalid,
                "Only pending invitations can be updated.");
        }

        if (update.Role != "member" && update.Role != "admin")
            return ServiceResult<bool>.Failure(ServiceError.Invalid, "Invalid invitation role.");

        var callerIsOwner = await IsOrgOwner(
            invitation.OrganizationId,
            userId,
            cancellationToken);

        if (update.Role == "admin" && !callerIsOwner)
            return ServiceResult<bool>.Failure(ServiceError.Forbidden);

        if (update.ExpiresAt <= DateTimeOffset.UtcNow)
        {
            return ServiceResult<bool>.Failure(
                ServiceError.Invalid,
                "The expiration time must be in the future.");
        }

        invitation.Role = update.Role;
        invitation.ExpiresAt = update.ExpiresAt;
        await context.SaveChangesAsync(cancellationToken);

        return ServiceResult<bool>.Success(true);
    }

    public async Task<ServiceResult<bool>> DeleteInvitationAsync(
        Guid id,
        Guid userId,
        CancellationToken cancellationToken)
    {
        var invitation = await context.OrgInvitation
            .FirstOrDefaultAsync(invitation => invitation.Id == id, cancellationToken);

        if (invitation is null)
            return ServiceResult<bool>.Failure(ServiceError.NotFound);

        if (!await IsOrgAdmin(invitation.OrganizationId, userId, cancellationToken))
            return ServiceResult<bool>.Failure(ServiceError.Forbidden);

        context.OrgInvitation.Remove(invitation);
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

    private static OrgInvitationResDto ToDto(OrgInvitations invitation) =>
        new(
            invitation.Id,
            invitation.OrganizationId,
            invitation.Email,
            invitation.Role,
            invitation.Status,
            invitation.InvitedBy,
            invitation.ExpiresAt,
            invitation.CreatedAt,
            invitation.AcceptedAt,
            invitation.AcceptedBy);
}
