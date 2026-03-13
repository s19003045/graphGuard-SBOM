using GraphGuard.Domain.Remediation;

namespace GraphGuard.AI.Services;

public sealed class RemediationService : IRemediationService
{
    public Task<IReadOnlyList<RemediationRecommendation>> GenerateRecommendationsAsync(
        string findingId,
        string? projectContext,
        CancellationToken cancellationToken)
    {
        var scopedContext = string.IsNullOrWhiteSpace(projectContext) ? "current project" : projectContext.Trim();

        var recommendations = new[]
        {
            new RemediationRecommendation(
                RecommendationId: Guid.NewGuid().ToString("N"),
                FindingId: findingId,
                Summary: $"Upgrade the affected dependency in {scopedContext} to the latest non-breaking minor release.",
                OptionRank: 1,
                ConfidenceLevel: "high",
                RiskNotes: "Lowest operational risk when semver-compatible update path is available.",
                GeneratedAt: DateTimeOffset.UtcNow),
            new RemediationRecommendation(
                RecommendationId: Guid.NewGuid().ToString("N"),
                FindingId: findingId,
                Summary: "Pin to the nearest patched version and run targeted regression tests around critical workflows.",
                OptionRank: 2,
                ConfidenceLevel: "medium",
                RiskNotes: "Moderate risk due to potential behavior changes in transitive dependencies.",
                GeneratedAt: DateTimeOffset.UtcNow),
            new RemediationRecommendation(
                RecommendationId: Guid.NewGuid().ToString("N"),
                FindingId: findingId,
                Summary: "Apply compensating controls and isolate affected runtime path until patch can be deployed.",
                OptionRank: 3,
                ConfidenceLevel: "low",
                RiskNotes: "Temporary mitigation only; residual exploitability remains if control coverage is incomplete.",
                GeneratedAt: DateTimeOffset.UtcNow)
        };

        return Task.FromResult<IReadOnlyList<RemediationRecommendation>>(recommendations);
    }
}
