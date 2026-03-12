using GraphGuard.Domain.Graph;

namespace GraphGuard.Infrastructure.Graph;

public sealed class DependencyGraphQueryService : IDependencyGraphQueryService
{
    public Task<ProjectDependencyGraphResult> GetProjectDependencyGraphAsync(
        string projectId,
        int? maxDepth,
        string? severityFilter,
        string? licenseRiskFilter,
        CancellationToken cancellationToken)
    {
        var resolvedMaxDepth = Math.Clamp(maxDepth ?? 3, 1, 5);

        var nodes = new List<PackageVersion>
        {
            new("pkg-npm-react-18.3.1", "npm", "react", "18.3.1", "medium", "low"),
            new("pkg-npm-vite-5.4.21", "npm", "vite", "5.4.21", "low", "low"),
            new("pkg-npm-lodash-4.17.15", "npm", "lodash", "4.17.15", "high", "medium"),
            new("pkg-npm-ansi-regex-5.0.1", "npm", "ansi-regex", "5.0.1", "critical", "low")
        };

        var edges = new List<DependencyEdge>
        {
            new("edge-1", "project-" + projectId, "pkg-npm-react-18.3.1", 1, true),
            new("edge-2", "project-" + projectId, "pkg-npm-vite-5.4.21", 1, true),
            new("edge-3", "pkg-npm-vite-5.4.21", "pkg-npm-lodash-4.17.15", 2, false),
            new("edge-4", "pkg-npm-lodash-4.17.15", "pkg-npm-ansi-regex-5.0.1", 3, false)
        };

        var filteredNodes = nodes
            .Where(n => severityFilter is null || string.Equals(n.Severity, severityFilter, StringComparison.OrdinalIgnoreCase))
            .Where(n => licenseRiskFilter is null || string.Equals(n.LicenseRisk, licenseRiskFilter, StringComparison.OrdinalIgnoreCase))
            .ToArray();

        var filteredNodeIds = filteredNodes.Select(n => n.PackageVersionId).ToHashSet(StringComparer.Ordinal);

        var filteredEdges = edges
            .Where(e => e.Depth <= resolvedMaxDepth)
            .Where(e => filteredNodeIds.Contains(e.ToPackageVersionId))
            .ToArray();

        var result = new ProjectDependencyGraphResult(
            projectId,
            filteredNodes,
            filteredEdges,
            resolvedMaxDepth,
            severityFilter,
            licenseRiskFilter);

        return Task.FromResult(result);
    }

    public Task<PackageImpactResult> GetPackageImpactAsync(
        string packageVersionId,
        CancellationToken cancellationToken)
    {
        var directImpacts = new[]
        {
            new PackageImpact("payments-service", "payments-service -> " + packageVersionId, 1, true),
            new PackageImpact("frontend-portal", "frontend-portal -> " + packageVersionId, 1, true)
        };

        var indirectImpacts = new[]
        {
            new PackageImpact("reporting-service", "reporting-service -> lodash@4.17.15 -> " + packageVersionId, 2, false),
            new PackageImpact("inventory-service", "inventory-service -> vite@5.4.21 -> lodash@4.17.15 -> " + packageVersionId, 3, false)
        };

        var result = new PackageImpactResult(packageVersionId, directImpacts, indirectImpacts);
        return Task.FromResult(result);
    }
}
