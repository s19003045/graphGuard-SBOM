using System.Collections.Concurrent;
using GraphGuard.Domain.Audit;
using GraphGuard.Domain.Exceptions;

namespace GraphGuard.Infrastructure.Exceptions;

public sealed class RiskExceptionService : IRiskExceptionService
{
    private static readonly ConcurrentDictionary<string, List<RiskException>> ExceptionsByFinding = new(StringComparer.Ordinal);
    private readonly IAuditEventRepository _auditEventRepository;

    public RiskExceptionService(IAuditEventRepository auditEventRepository)
    {
        _auditEventRepository = auditEventRepository;
    }

    public async Task<RiskExceptionMutationResult> CreateAsync(
        string findingId,
        string reason,
        string owner,
        DateTimeOffset expiresAt,
        CancellationToken cancellationToken)
    {
        var riskException = new RiskException
        {
            RiskExceptionId = Guid.NewGuid().ToString("N"),
            FindingId = findingId,
            Reason = reason,
            Owner = owner,
            ExpiresAt = expiresAt,
            CreatedAt = DateTimeOffset.UtcNow
        };

        var list = ExceptionsByFinding.GetOrAdd(findingId, _ => new List<RiskException>());
        lock (list)
        {
            list.Add(riskException);
        }

        var auditEventId = Guid.NewGuid().ToString("N");
        await _auditEventRepository.AppendAsync(
            new AuditEvent(
                auditEventId,
                owner,
                "risk-exception.created",
                "RiskException",
                riskException.RiskExceptionId,
                $"Risk exception created for finding {findingId}",
                DateTimeOffset.UtcNow),
            cancellationToken);

        return new RiskExceptionMutationResult(riskException, auditEventId);
    }

    public async Task<RiskExceptionMutationResult?> UpdateStateAsync(
        string findingId,
        string riskExceptionId,
        RiskExceptionState state,
        string? reason,
        DateTimeOffset? expiresAt,
        CancellationToken cancellationToken)
    {
        if (!ExceptionsByFinding.TryGetValue(findingId, out var list))
        {
            return null;
        }

        RiskException? target;
        lock (list)
        {
            target = list.FirstOrDefault(item => string.Equals(item.RiskExceptionId, riskExceptionId, StringComparison.Ordinal));
        }

        if (target is null)
        {
            return null;
        }

        switch (state)
        {
            case RiskExceptionState.Revoked:
                target.Revoke(reason ?? string.Empty);
                break;
            case RiskExceptionState.Active:
                target.Reactivate(reason ?? target.Reason, expiresAt ?? target.ExpiresAt);
                break;
            case RiskExceptionState.Expired:
                target.Expire();
                break;
        }

        var auditEventId = Guid.NewGuid().ToString("N");
        await _auditEventRepository.AppendAsync(
            new AuditEvent(
                auditEventId,
                target.Owner,
                "risk-exception.updated",
                "RiskException",
                target.RiskExceptionId,
                $"Risk exception state updated to {target.State}",
                DateTimeOffset.UtcNow),
            cancellationToken);

        return new RiskExceptionMutationResult(target, auditEventId);
    }

    public Task<IReadOnlyList<RiskException>> GetByFindingAsync(string findingId, CancellationToken cancellationToken)
    {
        if (!ExceptionsByFinding.TryGetValue(findingId, out var list))
        {
            return Task.FromResult<IReadOnlyList<RiskException>>(Array.Empty<RiskException>());
        }

        lock (list)
        {
            return Task.FromResult<IReadOnlyList<RiskException>>(list.ToArray());
        }
    }
}
