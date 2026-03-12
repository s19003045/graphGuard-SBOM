using GraphGuard.API.Contracts;
using GraphGuard.Domain.Sbom;
using Microsoft.AspNetCore.Mvc;

namespace GraphGuard.API.Controllers;

[ApiController]
[Route("api/v1/sbom/uploads")]
public sealed class SbomStatusController : ControllerBase
{
    [HttpGet("{snapshotId}")]
    public async Task<ActionResult<SbomStatusResponse>> GetStatus(
        string snapshotId,
        [FromServices] ISbomSnapshotRepository repository,
        CancellationToken cancellationToken)
    {
        var snapshot = await repository.GetAsync(snapshotId, cancellationToken);
        if (snapshot is null)
        {
            return NotFound();
        }

        return Ok(new SbomStatusResponse(
            snapshot.SnapshotId,
            snapshot.IngestStatus.ToString().ToLowerInvariant(),
            snapshot.PackageCount,
            snapshot.VulnerablePackageCount,
            snapshot.HighRiskLicenseCount,
            snapshot.FailureReason));
    }
}
