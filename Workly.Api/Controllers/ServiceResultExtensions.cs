using Microsoft.AspNetCore.Mvc;
using Workly.Api.Services;

namespace Workly.Api.Controllers;

internal static class ServiceResultExtensions
{
    public static ActionResult ToFailureResult<T>(
        this ControllerBase controller,
        ServiceResult<T> result)
    {
        if (result.IsSuccess)
            throw new InvalidOperationException("A successful service result cannot be converted to a failure response.");

        return result.Error switch
        {
            ServiceError.NotFound => result.Message is null
                ? controller.NotFound()
                : controller.NotFound(new { message = result.Message }),
            ServiceError.Forbidden => controller.Forbid(),
            ServiceError.Invalid => result.Message is null
                ? controller.BadRequest()
                : controller.BadRequest(new { message = result.Message }),
            ServiceError.Conflict => result.Message is null
                ? controller.Conflict()
                : controller.Conflict(new { message = result.Message }),
            _ => throw new InvalidOperationException($"Unsupported service error: {result.Error}.")
        };
    }
}
