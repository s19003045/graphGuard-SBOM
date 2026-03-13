namespace GraphGuard.API.Contracts;

public sealed record RiskExceptionCreateRequestDto(
    string Reason,
    string Owner,
    DateTimeOffset ExpiresAt);

public sealed record RiskExceptionUpdateRequestDto(
    string State,
    string? Reason,
    DateTimeOffset? ExpiresAt);

public sealed record RiskExceptionResponseDto(
    string RiskExceptionId,
    string State,
    string AuditEventId);

public sealed record ComplianceAuditRecordDto(
    string AuditEventId,
    string ActorId,
    string ActionType,
    string TargetType,
    string TargetId,
    string ChangeSummary,
    DateTimeOffset EventTimestamp);

public sealed record ComplianceReportResponseDto(
    DateTimeOffset GeneratedAt,
    int RecordCount,
    IReadOnlyList<ComplianceAuditRecordDto> Records);
