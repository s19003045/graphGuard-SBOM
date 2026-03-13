using System.Collections.Concurrent;
using GraphGuard.Domain.Graph;

namespace GraphGuard.Infrastructure.Graph;

public sealed class ProjectDependencyGraphStore : IProjectDependencyGraphStore
{
    private static readonly ConcurrentDictionary<string, ProjectDependencyGraphData> Store = new(StringComparer.OrdinalIgnoreCase);

    public Task UpsertProjectGraphAsync(ProjectDependencyGraphData graph, CancellationToken cancellationToken)
    {
        Store[graph.ProjectId] = graph;
        return Task.CompletedTask;
    }

    public Task<ProjectDependencyGraphData?> GetProjectGraphAsync(string projectId, CancellationToken cancellationToken)
    {
        Store.TryGetValue(projectId, out var graph);
        return Task.FromResult(graph);
    }

    public Task<IReadOnlyList<ProjectDependencyGraphData>> GetAllProjectGraphsAsync(CancellationToken cancellationToken)
    {
        var graphs = Store.Values.ToArray();
        return Task.FromResult<IReadOnlyList<ProjectDependencyGraphData>>(graphs);
    }
}
