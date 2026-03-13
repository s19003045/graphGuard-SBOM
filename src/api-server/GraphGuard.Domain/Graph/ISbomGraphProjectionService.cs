namespace GraphGuard.Domain.Graph;

public interface ISbomGraphProjectionService
{
    Task<ProjectDependencyGraphData> BuildProjectGraphAsync(
        string projectId,
        string sourceType,
        string sbomJson,
        CancellationToken cancellationToken);
}
