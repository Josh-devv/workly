using Workly.Api.Dtos.OrgInvitation;
using Workly.Api.Services;

namespace Workly.Api.Services.OrgInvitation;

public interface IOrgInvitationService
{
    Task<List<OrgInvitationResDto>> GetInvitationsAsync(
        Guid userId,
        CancellationToken cancellationToken);

    Task<ServiceResult<OrgInvitationResDto>> GetInvitationByIdAsync(
        Guid id,
        Guid userId,
        CancellationToken cancellationToken);

    Task<InvitationLookupResDto?> GetInvitationByTokenAsync(
        string token,
        CancellationToken cancellationToken);

    Task<ServiceResult<InvitationAcceptedResDto>> AcceptInvitationAsync(
        string token,
        Guid userId,
        string? email,
        CancellationToken cancellationToken);

    Task<ServiceResult<InvitationCreatedResDto>> CreateInvitationAsync(
        CreateOrgInvitationDto newInvitation,
        Guid userId,
        CancellationToken cancellationToken);

    Task<ServiceResult<bool>> UpdateInvitationAsync(
        Guid id,
        UpdateOrgInvitationDto update,
        Guid userId,
        CancellationToken cancellationToken);

    Task<ServiceResult<bool>> DeleteInvitationAsync(
        Guid id,
        Guid userId,
        CancellationToken cancellationToken);
}
