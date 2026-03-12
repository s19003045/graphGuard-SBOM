namespace GraphGuard.API.Contracts;

public sealed record SbomUploadAcceptedResponse(string SnapshotId, string IngestStatus);

public sealed record SbomStatusResponse(
    string SnapshotId,
    string IngestStatus,
    int PackageCount,
    int VulnerablePackageCount,
    int HighRiskLicenseCount,
    string? FailureReason);
