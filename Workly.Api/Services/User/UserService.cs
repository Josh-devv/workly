using Microsoft.EntityFrameworkCore;
using Workly.Api.Data;
using Workly.Api.Dtos.User;
using Workly.Api.Services;

namespace Workly.Api.Services.User;

public sealed class UserService(WorklyDbContext context) : IUserService
{
    public async Task<ServiceResult<UserResDto>> GetProfileAsync(
        Guid id,
        Guid authenticatedUserId,
        CancellationToken cancellationToken)
    {
        if (id != authenticatedUserId)
        {
            return ServiceResult<UserResDto>.Failure(
                ServiceError.NotFound,
                "User profile not found.");
        }

        var user = await context.User
            .AsNoTracking()
            .FirstOrDefaultAsync(user => user.Id == authenticatedUserId, cancellationToken);

        return user is null
            ? ServiceResult<UserResDto>.Failure(ServiceError.NotFound, "User profile not found.")
            : ServiceResult<UserResDto>.Success(new UserResDto(user.Name, user.CreatedAt));
    }
}
