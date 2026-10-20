using Workly.Api.Dtos.TimeEntry;
using Workly.Api.Services;

namespace Workly.Api.Services.TimeEntry;

public interface ITimeEntryService
{
    Task<List<TimeEntryResDto>> GetTimeEntriesAsync(
        Guid userId,
        CancellationToken cancellationToken);

    Task<ServiceResult<TimeEntryResDto>> GetTimeEntryByIdAsync(
        Guid id,
        Guid userId,
        CancellationToken cancellationToken);

    Task<ServiceResult<TimeEntryResDto>> CreateTimeEntryAsync(
        CreateTimeEntryDto newEntry,
        Guid userId,
        CancellationToken cancellationToken);

    Task<ServiceResult<bool>> UpdateTimeEntryAsync(
        Guid id,
        UpdateTimeEntryDto update,
        Guid userId,
        CancellationToken cancellationToken);

    Task<ServiceResult<bool>> DeleteTimeEntryAsync(
        Guid id,
        Guid userId,
        CancellationToken cancellationToken);
}
