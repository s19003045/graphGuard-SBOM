using System.Collections.Concurrent;
using GraphGuard.Domain.Sbom;

namespace GraphGuard.Infrastructure.Sbom;

public sealed class SbomSnapshotRepository : ISbomSnapshotRepository
{
    private static readonly ConcurrentDictionary<string, SbomSnapshot> Store = new();

    public Task AddAsync(SbomSnapshot snapshot, CancellationToken cancellationToken)
    {
        Store[snapshot.SnapshotId] = snapshot;
        return Task.CompletedTask;
    }

    public Task<SbomSnapshot?> GetAsync(string snapshotId, CancellationToken cancellationToken)
    {
        Store.TryGetValue(snapshotId, out var snapshot);
        return Task.FromResult(snapshot);
    }

    public Task UpdateAsync(SbomSnapshot snapshot, CancellationToken cancellationToken)
    {
        Store[snapshot.SnapshotId] = snapshot;
        return Task.CompletedTask;
    }
}
