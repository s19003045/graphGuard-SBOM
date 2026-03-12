using GraphGuard.API.Contracts;
using GraphGuard.Domain.Graph;
using Microsoft.AspNetCore.Mvc;

namespace GraphGuard.API.Controllers;

[ApiController]
[Route("api/v1/projects")]
public sealed class ProjectDependenciesController : ControllerBase
{
    [HttpGet("{projectId}/dependencies")]
    public async Task<ActionResult<DependencyGraphResponseDto>> GetDependencies(
        string projectId,
        [FromQuery] int? maxDepth,
        [FromQuery] string? severityFilter,
        [FromQuery] string? licenseRiskFilter,
        [FromServices] IDependencyGraphQueryService graphQueryService,
        CancellationToken cancellationToken)
    {
        var result = await graphQueryService.GetProjectDependencyGraphAsync(
            projectId,
            maxDepth,
            severityFilter,
            licenseRiskFilter,
            cancellationToken);

        var response = new DependencyGraphResponseDto(
            result.ProjectId,
            result.Nodes
                .Select(n => new DependencyGraphNodeDto(
                    n.PackageVersionId,
                    n.Ecosystem,
                    n.PackageName,
                    n.Version,
                    result.Edges.FirstOrDefault(e => e.ToPackageVersionId == n.PackageVersionId)?.Depth ?? 1,
                    result.Edges.FirstOrDefault(e => e.ToPackageVersionId == n.PackageVersionId)?.IsDirect ?? false,
                    n.Severity,
                    n.LicenseRisk))
                .ToArray(),
            result.Edges
                .Select(e => new DependencyGraphEdgeDto(
                    e.FromPackageVersionId,
                    e.ToPackageVersionId,
                    e.Depth,
                    e.IsDirect))
                .ToArray(),
            new DependencyGraphWindowDto(
                result.MaxDepth,
                result.SeverityFilter,
                result.LicenseRiskFilter,
                result.Nodes.Count,
                result.Edges.Count));

        return Ok(response);
    }
}
