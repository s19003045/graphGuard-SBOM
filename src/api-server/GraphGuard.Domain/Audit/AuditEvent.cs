namespace GraphGuard.Domain.Audit;

public sealed record AuditEvent(
    string AuditEventId,
    string ActorId,
    string ActionType,
    string TargetType,
    string TargetId,
    string ChangeSummary,
    DateTimeOffset EventTimestamp);

public interface IAuditEventRepository
{
    Task AppendAsync(AuditEvent auditEvent, CancellationToken cancellationToken);

    Task<IReadOnlyList<AuditEvent>> GetAllAsync(CancellationToken cancellationToken);
}
