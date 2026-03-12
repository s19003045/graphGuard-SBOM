namespace GraphGuard.API.Contracts;

public sealed record DependencyGraphNodeDto(
    string PackageVersionId,
    string Ecosystem,
    string PackageName,
    string Version,
    int Depth,
    bool IsDirect,
    string? Severity,
    string? LicenseRisk);

public sealed record DependencyGraphEdgeDto(
    string FromPackageVersionId,
    string ToPackageVersionId,
    int Depth,
    bool IsDirect);

public sealed record DependencyGraphWindowDto(
    int MaxDepth,
    string? SeverityFilter,
    string? LicenseRiskFilter,
    int NodeCount,
    int EdgeCount);

public sealed record DependencyGraphResponseDto(
    string ProjectId,
    IReadOnlyList<DependencyGraphNodeDto> Nodes,
    IReadOnlyList<DependencyGraphEdgeDto> Edges,
    DependencyGraphWindowDto Window);

public sealed record PackageImpactItemDto(
    string ProjectId,
    string ImpactPath,
    int Depth,
    bool IsDirect);

public sealed record PackageImpactResponseDto(
    string PackageVersionId,
    IReadOnlyList<PackageImpactItemDto> DirectImpacts,
    IReadOnlyList<PackageImpactItemDto> IndirectImpacts,
    int ImpactPathCount);