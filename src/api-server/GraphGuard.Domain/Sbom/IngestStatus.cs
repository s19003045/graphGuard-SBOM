namespace GraphGuard.Domain.Sbom;

public enum IngestStatus
{
    Queued,
    Processing,
    Completed,
    Failed
}

public static class IngestStatusTransition
{
    public static bool CanTransition(IngestStatus from, IngestStatus to)
    {
        return (from, to) switch
        {
            (IngestStatus.Queued, IngestStatus.Processing) => true,
            (IngestStatus.Processing, IngestStatus.Completed) => true,
            (IngestStatus.Processing, IngestStatus.Failed) => true,
            _ => false
        };
    }
}
