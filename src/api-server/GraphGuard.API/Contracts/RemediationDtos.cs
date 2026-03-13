namespace GraphGuard.API.Contracts;

public sealed record RemediationRecommendRequestDto(
    string FindingId,
    string? ProjectContext);

public sealed record RemediationOptionDto(
    int OptionRank,
    string Summary,
    string ConfidenceLevel,
    string RiskNotes);

public sealed record RemediationRecommendResponseDto(
    string FindingId,
    IReadOnlyList<RemediationOptionDto> Recommendations);
