using GraphGuard.API.Contracts;
using GraphGuard.Domain.Graph;
using Microsoft.AspNetCore.Mvc;

namespace GraphGuard.API.Controllers;

[ApiController]
[Route("api/v1/packages")]
public sealed class PackageImpactController : ControllerBase
{
    [HttpGet("{packageVersionId}/impact")]
    public async Task<ActionResult<PackageImpactResponseDto>> GetImpact(
        string packageVersionId,
        [FromServices] IDependencyGraphQueryService graphQueryService,
        CancellationToken cancellationToken)
    {
        var result = await graphQueryService.GetPackageImpactAsync(packageVersionId, cancellationToken);

        var direct = result.DirectImpacts
            .Select(i => new PackageImpactItemDto(i.ProjectId, i.ImpactPath, i.Depth, i.IsDirect))
            .ToArray();

        var indirect = result.IndirectImpacts
            .Select(i => new PackageImpactItemDto(i.ProjectId, i.ImpactPath, i.Depth, i.IsDirect))
            .ToArray();

        return Ok(new PackageImpactResponseDto(
            result.PackageVersionId,
            direct,
            indirect,
            direct.Length + indirect.Length));
    }
}
