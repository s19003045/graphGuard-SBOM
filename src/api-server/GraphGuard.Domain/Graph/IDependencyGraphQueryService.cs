namespace GraphGuard.Domain.Graph;

public sealed record ProjectDependencyGraphResult(
    string ProjectId,
    IReadOnlyList<PackageVersion> Nodes,
    IReadOnlyList<DependencyEdge> Edges,
    int MaxDepth,
    string? SeverityFilter,
    string? LicenseRiskFilter);

public sealed record PackageImpactResult(
    string PackageVersionId,
    IReadOnlyList<PackageImpact> DirectImpacts,
    IReadOnlyList<PackageImpact> IndirectImpacts);

public sealed record PackageImpact(
    string ProjectId,
    string ImpactPath,
    int Depth,
    bool IsDirect);

public interface IDependencyGraphQueryService
{
    Task<ProjectDependencyGraphResult> GetProjectDependencyGraphAsync(
        string projectId,
        int? maxDepth,
        string? severityFilter,
        string? licenseRiskFilter,
        CancellationToken cancellationToken);

    Task<PackageImpactResult> GetPackageImpactAsync(
        string packageVersionId,
        CancellationToken cancellationToken);
}
