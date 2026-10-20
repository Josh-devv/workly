using Workly.Api.Dtos.Task;
using Workly.Api.Services;

namespace Workly.Api.Services.Tasks;

public interface ITaskService
{
    Task<List<TaskResDto>> GetTasksAsync(Guid userId, CancellationToken cancellationToken);

    Task<ServiceResult<TaskResDto>> GetTaskByIdAsync(
        Guid id,
        Guid userId,
        CancellationToken cancellationToken);

    Task<ServiceResult<TaskResDto>> CreateTaskAsync(
        CreateTaskDto newTask,
        Guid userId,
        CancellationToken cancellationToken);

    Task<ServiceResult<TaskResDto>> UpdateTaskAsync(
        Guid id,
        UpdateTaskDto updatedTask,
        Guid userId,
        CancellationToken cancellationToken);

    Task<ServiceResult<bool>> DeleteTaskAsync(
        Guid id,
        Guid userId,
        CancellationToken cancellationToken);
}
