using Workly.Api.Dtos.User;
using Workly.Api.Services;

namespace Workly.Api.Services.User;

public interface IUserService
{
    Task<ServiceResult<UserResDto>> GetProfileAsync(
        Guid id,
        Guid authenticatedUserId,
        CancellationToken cancellationToken);
}
