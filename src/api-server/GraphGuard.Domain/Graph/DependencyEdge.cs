namespace GraphGuard.Domain.Graph;

public sealed record PackageVersion(
    string PackageVersionId,
    string Ecosystem,
    string PackageName,
    string Version,
    string? Severity = null,
    string? LicenseRisk = null);

public sealed record DependencyEdge(
    string DependencyEdgeId,
    string FromPackageVersionId,
    string ToPackageVersionId,
    int Depth,
    bool IsDirect);
