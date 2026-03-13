using GraphGuard.Domain.Remediation;

namespace GraphGuard.AI.Services;

public interface IRemediationService
{
    Task<IReadOnlyList<RemediationRecommendation>> GenerateRecommendationsAsync(
        string findingId,
        string? projectContext,
        CancellationToken cancellationToken);
}
