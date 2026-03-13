namespace GraphGuard.Domain.Sbom;

public sealed class SbomSnapshot
{
    public required string SnapshotId { get; init; }
    public required string ProjectId { get; init; }
    public required string SourceType { get; init; }
    public required string RawSbomDocument { get; init; }
    public IngestStatus IngestStatus { get; private set; } = IngestStatus.Queued;
    public int PackageCount { get; private set; }
    public int VulnerablePackageCount { get; private set; }
    public int HighRiskLicenseCount { get; private set; }
    public string? FailureReason { get; private set; }

    public void TransitionTo(IngestStatus to)
    {
        if (!IngestStatusTransition.CanTransition(IngestStatus, to))
        {
            throw new InvalidOperationException($"Invalid transition: {IngestStatus} -> {to}");
        }

        IngestStatus = to;
    }

    public void Complete(int packageCount, int vulnerablePackageCount, int highRiskLicenseCount)
    {
        TransitionTo(IngestStatus.Completed);
        PackageCount = packageCount;
        VulnerablePackageCount = vulnerablePackageCount;
        HighRiskLicenseCount = highRiskLicenseCount;
    }

    public void Fail(string reason)
    {
        TransitionTo(IngestStatus.Failed);
        FailureReason = reason;
    }
}
