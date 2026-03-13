using GraphGuard.AI.Services;
using GraphGuard.API.Contracts;
using Microsoft.AspNetCore.Mvc;

namespace GraphGuard.API.Controllers;

[ApiController]
[Route("api/v1/query")]
public sealed class NaturalLanguageQueryController : ControllerBase
{
    [HttpPost("natural-language")]
    public async Task<ActionResult<NaturalLanguageQueryResponseDto>> Ask(
        [FromBody] NaturalLanguageQueryRequestDto request,
        [FromServices] INaturalLanguageQueryService queryService,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.Question))
        {
            return BadRequest(new ErrorEnvelope("validation_error", "question is required."));
        }

        var result = await queryService.AskAsync(request.Question, cancellationToken);

        var response = new NaturalLanguageQueryResponseDto(
            result.AnswerSummary,
            result.Evidence
                .Select(e => new NaturalLanguageEvidenceDto(e.SourceType, e.SourceId, e.Snippet))
                .ToArray(),
            new NaturalLanguageQueryMetadataDto(result.QueryEngine, result.QueryText, result.GeneratedAt));

        return Ok(response);
    }
}
