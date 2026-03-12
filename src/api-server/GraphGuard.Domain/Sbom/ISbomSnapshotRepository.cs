namespace GraphGuard.Domain.Sbom;

public interface ISbomSnapshotRepository
{
    Task AddAsync(SbomSnapshot snapshot, CancellationToken cancellationToken);
    Task<SbomSnapshot?> GetAsync(string snapshotId, CancellationToken cancellationToken);
    Task UpdateAsync(SbomSnapshot snapshot, CancellationToken cancellationToken);
}
