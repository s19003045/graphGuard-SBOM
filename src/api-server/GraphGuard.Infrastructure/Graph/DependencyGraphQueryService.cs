using GraphGuard.Domain.Graph;

namespace GraphGuard.Infrastructure.Graph;

public sealed class DependencyGraphQueryService : IDependencyGraphQueryService
{
    private readonly IProjectDependencyGraphStore _graphStore;

    public DependencyGraphQueryService(IProjectDependencyGraphStore graphStore)
    {
        _graphStore = graphStore;
    }

    public Task<ProjectDependencyGraphResult> GetProjectDependencyGraphAsync(
        string projectId,
        int? maxDepth,
        string? severityFilter,
        string? licenseRiskFilter,
        CancellationToken cancellationToken)
    {
        var resolvedMaxDepth = Math.Clamp(maxDepth ?? 3, 1, 5);

        return GetProjectGraphResultAsync(
            projectId,
            resolvedMaxDepth,
            severityFilter,
            licenseRiskFilter,
            cancellationToken);
    }

    public async Task<PackageImpactResult> GetPackageImpactAsync(
        string packageVersionId,
        CancellationToken cancellationToken)
    {
        var allGraphs = await _graphStore.GetAllProjectGraphsAsync(cancellationToken);

        var directImpacts = new List<PackageImpact>();
        var indirectImpacts = new List<PackageImpact>();

        foreach (var graph in allGraphs)
        {
            foreach (var edge in graph.Edges.Where(e => string.Equals(e.ToPackageVersionId, packageVersionId, StringComparison.Ordinal)))
            {
                var impactPath = edge.IsDirect
                    ? $"{graph.ProjectId} -> {packageVersionId}"
                    : $"{graph.ProjectId} -> {edge.FromPackageVersionId} -> {packageVersionId}";

                var impact = new PackageImpact(
                    graph.ProjectId,
                    impactPath,
                    edge.Depth,
                    edge.IsDirect);

                if (edge.IsDirect)
                {
                    directImpacts.Add(impact);
                }
                else
                {
                    indirectImpacts.Add(impact);
                }
            }
        }

        return new PackageImpactResult(packageVersionId, directImpacts, indirectImpacts);
    }

    private async Task<ProjectDependencyGraphResult> GetProjectGraphResultAsync(
        string projectId,
        int maxDepth,
        string? severityFilter,
        string? licenseRiskFilter,
        CancellationToken cancellationToken)
    {
        var graph = await _graphStore.GetProjectGraphAsync(projectId, cancellationToken);
        if (graph is null)
        {
            return new ProjectDependencyGraphResult(
                projectId,
                Array.Empty<PackageVersion>(),
                Array.Empty<DependencyEdge>(),
                maxDepth,
                severityFilter,
                licenseRiskFilter);
        }

        var filteredNodes = graph.Nodes
            .Where(n => severityFilter is null || string.Equals(n.Severity, severityFilter, StringComparison.OrdinalIgnoreCase))
            .Where(n => licenseRiskFilter is null || string.Equals(n.LicenseRisk, licenseRiskFilter, StringComparison.OrdinalIgnoreCase))
            .ToArray();

        var filteredNodeIds = filteredNodes.Select(n => n.PackageVersionId).ToHashSet(StringComparer.Ordinal);

        var filteredEdges = graph.Edges
            .Where(e => e.Depth <= maxDepth)
            .Where(e => filteredNodeIds.Contains(e.ToPackageVersionId))
            .Where(e => e.IsDirect || filteredNodeIds.Contains(e.FromPackageVersionId))
            .ToArray();

        return new ProjectDependencyGraphResult(
            projectId,
            filteredNodes,
            filteredEdges,
            maxDepth,
            severityFilter,
            licenseRiskFilter);
    }
}
