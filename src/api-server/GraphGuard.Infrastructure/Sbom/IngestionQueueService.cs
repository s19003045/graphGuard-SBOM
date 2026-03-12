using System.Collections.Concurrent;

namespace GraphGuard.Infrastructure.Sbom;

public interface IIngestionQueueService
{
    void Enqueue(string snapshotId);
    bool TryDequeue(out string snapshotId);
}

public sealed class IngestionQueueService : IIngestionQueueService
{
    private readonly ConcurrentQueue<string> _queue = new();

    public void Enqueue(string snapshotId) => _queue.Enqueue(snapshotId);

    public bool TryDequeue(out string snapshotId) => _queue.TryDequeue(out snapshotId!);
}
