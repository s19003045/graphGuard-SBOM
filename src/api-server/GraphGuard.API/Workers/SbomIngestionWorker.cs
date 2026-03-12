using GraphGuard.Domain.Sbom;
using GraphGuard.Infrastructure.Events;
using GraphGuard.Infrastructure.Sbom;

namespace GraphGuard.API.Workers;

public sealed class SbomIngestionWorker : BackgroundService
{
    private readonly ISbomSnapshotRepository _repository;
    private readonly IIngestionQueueService _queue;
    private readonly IIngestionStatusEventPublisher _publisher;

    public SbomIngestionWorker(
        ISbomSnapshotRepository repository,
        IIngestionQueueService queue,
        IIngestionStatusEventPublisher publisher)
    {
        _repository = repository;
        _queue = queue;
        _publisher = publisher;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            if (!_queue.TryDequeue(out var snapshotId))
            {
                await Task.Delay(250, stoppingToken);
                continue;
            }

            var snapshot = await _repository.GetAsync(snapshotId, stoppingToken);
            if (snapshot is null)
            {
                continue;
            }

            snapshot.TransitionTo(IngestStatus.Processing);
            await _repository.UpdateAsync(snapshot, stoppingToken);
            await _publisher.PublishAsync(snapshot.SnapshotId, "processing", stoppingToken);

            await Task.Delay(500, stoppingToken);
            snapshot.Complete(10, 2, 1);
            await _repository.UpdateAsync(snapshot, stoppingToken);
            await _publisher.PublishAsync(snapshot.SnapshotId, "completed", stoppingToken);
        }
    }
}
