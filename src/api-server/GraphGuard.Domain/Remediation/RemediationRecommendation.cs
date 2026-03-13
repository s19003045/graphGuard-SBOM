namespace GraphGuard.Domain.Remediation;

public sealed record RemediationRecommendation(
    string RecommendationId,
    string FindingId,
    string Summary,
    int OptionRank,
    string ConfidenceLevel,
    string RiskNotes,
    DateTimeOffset GeneratedAt);
