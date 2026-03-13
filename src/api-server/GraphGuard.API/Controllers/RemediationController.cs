using GraphGuard.AI.Services;
using GraphGuard.API.Contracts;
using Microsoft.AspNetCore.Mvc;

namespace GraphGuard.API.Controllers;

[ApiController]
[Route("api/v1/remediation")]
public sealed class RemediationController : ControllerBase
{
    [HttpPost("recommend")]
    public async Task<ActionResult<RemediationRecommendResponseDto>> Recommend(
        [FromBody] RemediationRecommendRequestDto request,
        [FromServices] IRemediationService remediationService,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.FindingId))
        {
            return BadRequest(new ErrorEnvelope("validation_error", "findingId is required."));
        }

        var recommendations = await remediationService.GenerateRecommendationsAsync(
            request.FindingId,
            request.ProjectContext,
            cancellationToken);

        var response = new RemediationRecommendResponseDto(
            request.FindingId,
            recommendations
                .OrderBy(r => r.OptionRank)
                .Select(r => new RemediationOptionDto(
                    r.OptionRank,
                    r.Summary,
                    r.ConfidenceLevel,
                    r.RiskNotes))
                .ToArray());

        return Ok(response);
    }
}
