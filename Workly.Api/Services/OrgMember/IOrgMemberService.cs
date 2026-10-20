using Workly.Api.Dtos.OrgMember;
using Workly.Api.Services;

namespace Workly.Api.Services.OrgMember;

public interface IOrgMemberService
{
    Task<List<OrgMemberResDto>> GetMembersAsync(Guid userId, CancellationToken cancellationToken);

    Task<ServiceResult<OrgMemberResDto>> GetMemberByIdAsync(
        Guid id,
        Guid userId,
        CancellationToken cancellationToken);

    Task<ServiceResult<OrgMemberResDto>> AddMemberAsync(
        CreateOrgMemberDto newMember,
        Guid userId,
        CancellationToken cancellationToken);

    Task<ServiceResult<bool>> UpdateMemberAsync(
        Guid id,
        UpdateOrgMemberDto update,
        Guid userId,
        CancellationToken cancellationToken);

    Task<ServiceResult<bool>> DeleteMemberAsync(
        Guid id,
        Guid userId,
        CancellationToken cancellationToken);
}
