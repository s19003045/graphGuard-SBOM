namespace GraphGuard.API.Contracts;

public sealed record NaturalLanguageQueryRequestDto(string Question);

public sealed record NaturalLanguageEvidenceDto(
    string SourceType,
    string SourceId,
    string Snippet);

public sealed record NaturalLanguageQueryMetadataDto(
    string QueryEngine,
    string? QueryText,
    DateTimeOffset GeneratedAt);

public sealed record NaturalLanguageQueryResponseDto(
    string AnswerSummary,
    IReadOnlyList<NaturalLanguageEvidenceDto> Evidence,
    NaturalLanguageQueryMetadataDto QueryMetadata);
