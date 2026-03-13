namespace GraphGuard.Domain.Exceptions;

public sealed class RiskException
{
    public required string RiskExceptionId { get; init; }
    public required string FindingId { get; init; }
    public string Reason { get; set; } = string.Empty;
    public required string Owner { get; init; }
    public DateTimeOffset ExpiresAt { get; set; }
    public RiskExceptionState State { get; private set; } = RiskExceptionState.Active;
    public DateTimeOffset CreatedAt { get; init; } = DateTimeOffset.UtcNow;
    public DateTimeOffset UpdatedAt { get; private set; } = DateTimeOffset.UtcNow;

    public void Revoke(string reason)
    {
        if (string.IsNullOrWhiteSpace(reason))
        {
            throw new InvalidOperationException("reason is required when revoking a risk exception.");
        }

        if (State is RiskExceptionState.Revoked or RiskExceptionState.Expired)
        {
            throw new InvalidOperationException("risk exception cannot be revoked from current state.");
        }

        State = RiskExceptionState.Revoked;
        Reason = reason;
        UpdatedAt = DateTimeOffset.UtcNow;
    }

    public void Reactivate(string reason, DateTimeOffset expiresAt)
    {
        if (expiresAt <= DateTimeOffset.UtcNow)
        {
            throw new InvalidOperationException("expiresAt must be in the future when reactivating a risk exception.");
        }

        State = RiskExceptionState.Active;
        Reason = reason;
        ExpiresAt = expiresAt;
        UpdatedAt = DateTimeOffset.UtcNow;
    }

    public void Expire()
    {
        if (State != RiskExceptionState.Active)
        {
            return;
        }

        State = RiskExceptionState.Expired;
        UpdatedAt = DateTimeOffset.UtcNow;
    }
}

public enum RiskExceptionState
{
    Active,
    Revoked,
    Expired
}
