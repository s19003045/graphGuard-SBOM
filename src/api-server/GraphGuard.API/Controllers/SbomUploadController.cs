using GraphGuard.API.Contracts;
using GraphGuard.Domain.Audit;
using GraphGuard.Domain.Sbom;
using GraphGuard.Infrastructure.Sbom;
using Microsoft.AspNetCore.Mvc;

namespace GraphGuard.API.Controllers;

[ApiController]
[Route("api/v1/sbom/uploads")]
public sealed class SbomUploadController : ControllerBase
{
    [HttpPost]
    public async Task<ActionResult<SbomUploadAcceptedResponse>> Upload(
        [FromBody] SbomUploadRequest request,
        [FromServices] ISbomSnapshotRepository repository,
        [FromServices] IIngestionQueueService queue,
        [FromServices] IAuditEventRepository auditRepository,
        CancellationToken cancellationToken)
    {
        var snapshot = new SbomSnapshot
        {
            SnapshotId = Guid.NewGuid().ToString("N"),
            ProjectId = request.ProjectId,
            SourceType = request.SourceType
        };

        await repository.AddAsync(snapshot, cancellationToken);
        queue.Enqueue(snapshot.SnapshotId);

        await auditRepository.AppendAsync(
            new AuditEvent(
                Guid.NewGuid().ToString("N"),
                "system",
                "sbom.upload.accepted",
                "SbomSnapshot",
                snapshot.SnapshotId,
                "SBOM upload accepted",
                DateTimeOffset.UtcNow),
            cancellationToken);

        return Accepted(new SbomUploadAcceptedResponse(snapshot.SnapshotId, snapshot.IngestStatus.ToString().ToLowerInvariant()));
    }
}
