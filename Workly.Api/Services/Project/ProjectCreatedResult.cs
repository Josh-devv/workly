using Workly.Api.Dtos.Project;

namespace Workly.Api.Services.Project;

public sealed record ProjectCreatedResult(Guid Id, ProjectResDto Project);
