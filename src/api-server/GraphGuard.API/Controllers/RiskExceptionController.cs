using GraphGuard.API.Contracts;
using GraphGuard.Domain.Exceptions;
using Microsoft.AspNetCore.Mvc;

namespace GraphGuard.API.Controllers;

[ApiController]
[Route("api/v1/vulnerabilities/{findingId}/exceptions")]
public sealed class RiskExceptionController : ControllerBase
{
    [HttpPost]
    public async Task<ActionResult<RiskExceptionResponseDto>> Create(
        string findingId,
        [FromBody] RiskExceptionCreateRequestDto request,
        [FromServices] IRiskExceptionService riskExceptionService,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.Reason))
        {
            return BadRequest(new ErrorEnvelope("validation_error", "reason is required."));
        }

        if (string.IsNullOrWhiteSpace(request.Owner))
        {
            return BadRequest(new ErrorEnvelope("validation_error", "owner is required."));
        }

        if (request.ExpiresAt <= DateTimeOffset.UtcNow)
        {
            return BadRequest(new ErrorEnvelope("validation_error", "expiresAt must be in the future."));
        }

        var result = await riskExceptionService.CreateAsync(
            findingId,
            request.Reason,
            request.Owner,
            request.ExpiresAt,
            cancellationToken);

        return Ok(new RiskExceptionResponseDto(
            result.RiskException.RiskExceptionId,
            result.RiskException.State.ToString().ToLowerInvariant(),
            result.AuditEventId));
    }

    [HttpPatch("{riskExceptionId}")]
    public async Task<ActionResult<RiskExceptionResponseDto>> Update(
        string findingId,
        string riskExceptionId,
        [FromBody] RiskExceptionUpdateRequestDto request,
        [FromServices] IRiskExceptionService riskExceptionService,
        CancellationToken cancellationToken)
    {
        if (!TryParseState(request.State, out var state))
        {
            return BadRequest(new ErrorEnvelope("validation_error", "state must be active, revoked, or expired."));
        }

        if (state == RiskExceptionState.Revoked && string.IsNullOrWhiteSpace(request.Reason))
        {
            return BadRequest(new ErrorEnvelope("validation_error", "reason is required when state is revoked."));
        }

        var result = await riskExceptionService.UpdateStateAsync(
            findingId,
            riskExceptionId,
            state,
            request.Reason,
            request.ExpiresAt,
            cancellationToken);

        if (result is null)
        {
            return NotFound();
        }

        return Ok(new RiskExceptionResponseDto(
            result.RiskException.RiskExceptionId,
            result.RiskException.State.ToString().ToLowerInvariant(),
            result.AuditEventId));
    }

    private static bool TryParseState(string state, out RiskExceptionState parsed)
    {
        if (state.Equals("active", StringComparison.OrdinalIgnoreCase))
        {
            parsed = RiskExceptionState.Active;
            return true;
        }

        if (state.Equals("revoked", StringComparison.OrdinalIgnoreCase))
        {
            parsed = RiskExceptionState.Revoked;
            return true;
        }

        if (state.Equals("expired", StringComparison.OrdinalIgnoreCase))
        {
            parsed = RiskExceptionState.Expired;
            return true;
        }

        parsed = default;
        return false;
    }
}
