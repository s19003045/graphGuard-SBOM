using GraphGuard.API.Contracts;
using GraphGuard.Domain.Audit;
using GraphGuard.Domain.Sbom;
using GraphGuard.Infrastructure.Sbom;
using Microsoft.AspNetCore.Mvc;
using System.Text.Json;

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
        if (string.IsNullOrWhiteSpace(request.ProjectId))
        {
            return BadRequest(new ErrorEnvelope("validation_error", "projectId is required."));
        }

        if (string.IsNullOrWhiteSpace(request.SourceType))
        {
            return BadRequest(new ErrorEnvelope("validation_error", "sourceType is required."));
        }

        if (!IsAllowedSourceType(request.SourceType))
        {
            return BadRequest(new ErrorEnvelope("validation_error", "sourceType must be cyclonedx, spdx, or other."));
        }

        if (!HasValidSbomDocument(request.SbomDocument))
        {
            return BadRequest(new ErrorEnvelope("validation_error", "sbomDocument must be a valid non-empty JSON value."));
        }

        var snapshot = new SbomSnapshot
        {
            SnapshotId = Guid.NewGuid().ToString("N"),
            ProjectId = request.ProjectId,
            SourceType = request.SourceType,
            RawSbomDocument = ToRawSbomDocument(request.SbomDocument)
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

    private static bool IsAllowedSourceType(string sourceType)
    {
        return sourceType.Equals("cyclonedx", StringComparison.OrdinalIgnoreCase)
            || sourceType.Equals("spdx", StringComparison.OrdinalIgnoreCase)
            || sourceType.Equals("other", StringComparison.OrdinalIgnoreCase);
    }

    private static bool HasValidSbomDocument(object sbomDocument)
    {
        if (sbomDocument is JsonElement element)
        {
            return element.ValueKind is not JsonValueKind.Undefined and not JsonValueKind.Null;
        }

        if (sbomDocument is string sbomText)
        {
            return !string.IsNullOrWhiteSpace(sbomText);
        }

        return sbomDocument is not null;
    }

    private static string ToRawSbomDocument(object sbomDocument)
    {
        if (sbomDocument is JsonElement element)
        {
            return element.GetRawText();
        }

        if (sbomDocument is string sbomText)
        {
            return sbomText;
        }

        return JsonSerializer.Serialize(sbomDocument);
    }
}
