using GraphGuard.API.Contracts;
using GraphGuard.Domain.Audit;
using Microsoft.AspNetCore.Mvc;

namespace GraphGuard.API.Controllers;

[ApiController]
[Route("api/v1/reports")]
public sealed class ComplianceReportController : ControllerBase
{
    [HttpGet("license-compliance")]
    public async Task<ActionResult<ComplianceReportResponseDto>> ExportLicenseCompliance(
        [FromServices] IAuditEventRepository auditEventRepository,
        CancellationToken cancellationToken)
    {
        var events = await auditEventRepository.GetAllAsync(cancellationToken);

        var records = events
            .OrderByDescending(evt => evt.EventTimestamp)
            .Select(evt => new ComplianceAuditRecordDto(
                evt.AuditEventId,
                evt.ActorId,
                evt.ActionType,
                evt.TargetType,
                evt.TargetId,
                evt.ChangeSummary,
                evt.EventTimestamp))
            .ToArray();

        return Ok(new ComplianceReportResponseDto(
            DateTimeOffset.UtcNow,
            records.Length,
            records));
    }
}
