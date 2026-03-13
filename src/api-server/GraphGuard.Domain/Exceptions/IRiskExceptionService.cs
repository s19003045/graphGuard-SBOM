namespace GraphGuard.Domain.Exceptions;

public sealed record RiskExceptionMutationResult(RiskException RiskException, string AuditEventId);

public interface IRiskExceptionService
{
    Task<RiskExceptionMutationResult> CreateAsync(
        string findingId,
        string reason,
        string owner,
        DateTimeOffset expiresAt,
        CancellationToken cancellationToken);

    Task<RiskExceptionMutationResult?> UpdateStateAsync(
        string findingId,
        string riskExceptionId,
        RiskExceptionState state,
        string? reason,
        DateTimeOffset? expiresAt,
        CancellationToken cancellationToken);

    Task<IReadOnlyList<RiskException>> GetByFindingAsync(string findingId, CancellationToken cancellationToken);
}
