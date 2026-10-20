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

    public async Task<InvitationLookupResDto?> GetInvitationByTokenAsync(
        string token,
        CancellationToken cancellationToken)
    {
        var invitation = await context.OrgInvitation
            .AsNoTracking()
            .FirstOrDefaultAsync(
                invitation => invitation.Token == token &&
                    invitation.Status == "pending" &&
                    invitation.ExpiresAt > DateTimeOffset.UtcNow,
                cancellationToken);
        if (invitation is null)
            return null;

        var organizationName = await context.Organization
            .Where(organization => organization.Id == invitation.OrganizationId)
            .Select(organization => organization.Name)
            .FirstOrDefaultAsync(cancellationToken);
        if (organizationName is null)
            return null;

        return new InvitationLookupResDto(
            organizationName,
            invitation.Email,
            invitation.Role,
            invitation.Status ?? "pending",
            invitation.ExpiresAt);
    }

    public async Task<ServiceResult<InvitationAcceptedResDto>> AcceptInvitationAsync(
        string token,
        Guid userId,
        string? email,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(email))
        {
            return ServiceResult<InvitationAcceptedResDto>.Failure(
                ServiceError.Forbidden,
                "Your account must have a verified email address to accept this invitation.");
        }

        var invitation = await context.OrgInvitation
            .FirstOrDefaultAsync(
                invitation => invitation.Token == token &&
                    invitation.Status == "pending" &&
                    invitation.ExpiresAt > DateTimeOffset.UtcNow,
                cancellationToken);
        if (invitation is null)
        {
            return ServiceResult<InvitationAcceptedResDto>.Failure(
                ServiceError.NotFound,
                "Invitation not found or expired.");
        }

        if (!string.Equals(
                invitation.Email,
                email.Trim(),
                StringComparison.OrdinalIgnoreCase))
        {
            return ServiceResult<InvitationAcceptedResDto>.Failure(
                ServiceError.Forbidden,
                "Sign in with the email address that received this invitation.");
        }

        if (await context.OrgMember.AnyAsync(
                member =>
                    member.OrganizationId == invitation.OrganizationId &&
                    member.UserId == userId,
                cancellationToken))
        {
            return ServiceResult<InvitationAcceptedResDto>.Failure(
                ServiceError.Conflict,
                "You are already a member of this organization.");
        }

        var organizationName = await context.Organization
            .Where(organization => organization.Id == invitation.OrganizationId)
            .Select(organization => organization.Name)
            .FirstOrDefaultAsync(cancellationToken);
        if (organizationName is null)
            return ServiceResult<InvitationAcceptedResDto>.Failure(ServiceError.NotFound);

        await using var transaction =
            await context.Database.BeginTransactionAsync(cancellationToken);
        context.OrgMember.Add(new OrgMembers
        {
            Id = Guid.NewGuid(),
            OrganizationId = invitation.OrganizationId,
            UserId = userId,
            Role = invitation.Role,
            CreatedAt = DateTimeOffset.UtcNow
        });

        invitation.Status = "accepted";
        invitation.AcceptedAt = DateTimeOffset.UtcNow;
        invitation.AcceptedBy = userId;
        await context.SaveChangesAsync(cancellationToken);
        await transaction.CommitAsync(cancellationToken);

        return ServiceResult<InvitationAcceptedResDto>.Success(
            new InvitationAcceptedResDto(organizationName, invitation.OrganizationId));
    }

    public async Task<ServiceResult<InvitationCreatedResDto>> CreateInvitationAsync(
        CreateOrgInvitationDto newInvitation,
        Guid userId,
        CancellationToken cancellationToken)
    {
        if (!await IsOrgAdmin(newInvitation.OrganizationId, userId, cancellationToken))
            return ServiceResult<InvitationCreatedResDto>.Failure(ServiceError.Forbidden);

        if (string.IsNullOrWhiteSpace(newInvitation.Email))
        {
            return ServiceResult<InvitationCreatedResDto>.Failure(
                ServiceError.Invalid,
                "An email address is required.");
        }

        if (newInvitation.ExpiresAt is null ||
            newInvitation.ExpiresAt <= DateTimeOffset.UtcNow)
        {
            return ServiceResult<InvitationCreatedResDto>.Failure(
                ServiceError.Invalid,
                "The expiration time must be in the future.");
        }

        if (newInvitation.Role != "member" && newInvitation.Role != "admin")
        {
            return ServiceResult<InvitationCreatedResDto>.Failure(
                ServiceError.Invalid,
                "Invitations may only assign member or admin roles.");
        }

        var callerIsOwner = await IsOrgOwner(
            newInvitation.OrganizationId,
            userId,
            cancellationToken);

        if (newInvitation.Role == "admin" && !callerIsOwner)
            return ServiceResult<InvitationCreatedResDto>.Failure(ServiceError.Forbidden);

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
            return ServiceResult<InvitationCreatedResDto>.Failure(
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
                .ToLowerInvariant()
        };

        context.OrgInvitation.Add(invitation);
        await context.SaveChangesAsync(cancellationToken);

        return ServiceResult<InvitationCreatedResDto>.Success(
            new InvitationCreatedResDto(ToDto(invitation), invitation.Token));
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
