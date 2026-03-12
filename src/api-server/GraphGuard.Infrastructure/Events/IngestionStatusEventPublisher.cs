namespace GraphGuard.Infrastructure.Events;

public interface IIngestionStatusEventPublisher
{
    Task PublishAsync(string snapshotId, string status, CancellationToken cancellationToken);
}

public sealed class IngestionStatusEventPublisher : IIngestionStatusEventPublisher
{
    public Task PublishAsync(string snapshotId, string status, CancellationToken cancellationToken)
    {
        Console.WriteLine($"Ingestion status changed. SnapshotId={snapshotId}, Status={status}");
        return Task.CompletedTask;
    }
}
