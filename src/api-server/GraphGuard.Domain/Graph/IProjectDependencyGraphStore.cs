namespace GraphGuard.Domain.Graph;

public sealed record ProjectDependencyGraphData(
    string ProjectId,
    IReadOnlyList<PackageVersion> Nodes,
    IReadOnlyList<DependencyEdge> Edges);

public interface IProjectDependencyGraphStore
{
    Task UpsertProjectGraphAsync(ProjectDependencyGraphData graph, CancellationToken cancellationToken);

    Task<ProjectDependencyGraphData?> GetProjectGraphAsync(string projectId, CancellationToken cancellationToken);

    Task<IReadOnlyList<ProjectDependencyGraphData>> GetAllProjectGraphsAsync(CancellationToken cancellationToken);
}
