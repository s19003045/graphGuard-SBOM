using GraphGuard.Domain.Sbom;
using GraphGuard.Domain.Graph;
using GraphGuard.Infrastructure.Events;
using GraphGuard.Infrastructure.Sbom;

namespace GraphGuard.API.Workers;

public sealed class SbomIngestionWorker : BackgroundService
{
    private readonly ISbomSnapshotRepository _repository;
    private readonly IIngestionQueueService _queue;
    private readonly IIngestionStatusEventPublisher _publisher;
    private readonly ISbomGraphProjectionService _projectionService;
    private readonly IProjectDependencyGraphStore _graphStore;

    public SbomIngestionWorker(
        ISbomSnapshotRepository repository,
        IIngestionQueueService queue,
        IIngestionStatusEventPublisher publisher,
        ISbomGraphProjectionService projectionService,
        IProjectDependencyGraphStore graphStore)
    {
        _repository = repository;
        _queue = queue;
        _publisher = publisher;
        _projectionService = projectionService;
        _graphStore = graphStore;
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

            try
            {
                var graph = await _projectionService.BuildProjectGraphAsync(
                    snapshot.ProjectId,
                    snapshot.SourceType,
                    snapshot.RawSbomDocument,
                    stoppingToken);

                await _graphStore.UpsertProjectGraphAsync(graph, stoppingToken);

                var vulnerableCount = graph.Nodes.Count(node =>
                    string.Equals(node.Severity, "high", StringComparison.OrdinalIgnoreCase)
                    || string.Equals(node.Severity, "critical", StringComparison.OrdinalIgnoreCase));

                var highRiskLicenseCount = graph.Nodes.Count(node =>
                    string.Equals(node.LicenseRisk, "high", StringComparison.OrdinalIgnoreCase)
                    || string.Equals(node.LicenseRisk, "critical", StringComparison.OrdinalIgnoreCase));

                snapshot.Complete(graph.Nodes.Count, vulnerableCount, highRiskLicenseCount);
                await _repository.UpdateAsync(snapshot, stoppingToken);
                await _publisher.PublishAsync(snapshot.SnapshotId, "completed", stoppingToken);
            }
            catch (Exception ex)
            {
                snapshot.Fail($"SBOM ingestion failed: {ex.Message}");
                await _repository.UpdateAsync(snapshot, stoppingToken);
                await _publisher.PublishAsync(snapshot.SnapshotId, "failed", stoppingToken);
            }
        }
    }
}
