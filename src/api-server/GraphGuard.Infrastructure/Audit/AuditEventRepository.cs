using GraphGuard.Domain.Audit;

namespace GraphGuard.Infrastructure.Audit;

public sealed class AuditEventRepository : IAuditEventRepository
{
    private static readonly List<AuditEvent> Events = new();

    public Task AppendAsync(AuditEvent auditEvent, CancellationToken cancellationToken)
    {
        Events.Add(auditEvent);
        return Task.CompletedTask;
    }

    public Task<IReadOnlyList<AuditEvent>> GetAllAsync(CancellationToken cancellationToken)
    {
        return Task.FromResult<IReadOnlyList<AuditEvent>>(Events.ToArray());
    }
}
