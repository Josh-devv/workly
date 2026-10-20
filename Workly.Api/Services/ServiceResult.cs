namespace Workly.Api.Services;

public enum ServiceError
{
    None,
    NotFound,
    Forbidden,
    Invalid,
    Conflict
}

public sealed record ServiceResult<T>(
    T? Value,
    ServiceError Error = ServiceError.None,
    string? Message = null)
{
    public bool IsSuccess => Error == ServiceError.None;

    public static ServiceResult<T> Success(T value) =>
        new(value);

    public static ServiceResult<T> Failure(ServiceError error, string? message = null)
    {
        if (error == ServiceError.None)
            throw new ArgumentException("A failure must specify an error.", nameof(error));

        return new(default, error, message);
    }
}
