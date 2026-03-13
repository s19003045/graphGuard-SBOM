namespace GraphGuard.AI.Services;

public sealed record NaturalLanguageEvidence(
    string SourceType,
    string SourceId,
    string Snippet);

public sealed record NaturalLanguageQueryResult(
    string AnswerSummary,
    IReadOnlyList<NaturalLanguageEvidence> Evidence,
    string QueryEngine,
    string? QueryText,
    DateTimeOffset GeneratedAt);

public interface INaturalLanguageQueryService
{
    Task<NaturalLanguageQueryResult> AskAsync(string question, CancellationToken cancellationToken);
}

public sealed class NaturalLanguageQueryService : INaturalLanguageQueryService
{
    public Task<NaturalLanguageQueryResult> AskAsync(string question, CancellationToken cancellationToken)
    {
        var normalizedQuestion = question.Trim();
        var queryText = BuildPseudoQuery(normalizedQuestion);

        var evidence = new[]
        {
            new NaturalLanguageEvidence(
                SourceType: "dependency-graph",
                SourceId: "project:demo-project",
                Snippet: "Derived from active dependency graph window and project snapshot metadata."),
            new NaturalLanguageEvidence(
                SourceType: "sbom-snapshot",
                SourceId: "latest:demo-project",
                Snippet: "Answer correlates with latest completed ingestion state for the project context.")
        };

        var result = new NaturalLanguageQueryResult(
            AnswerSummary: $"Query interpreted successfully. Suggested analysis path prepared for: {normalizedQuestion}",
            Evidence: evidence,
            QueryEngine: "mock-nl2query",
            QueryText: queryText,
            GeneratedAt: DateTimeOffset.UtcNow);

        return Task.FromResult(result);
    }

    private static string BuildPseudoQuery(string question)
    {
        if (question.Contains("lodash", StringComparison.OrdinalIgnoreCase))
        {
            return "MATCH (p:Project)-[:DEPENDS_ON]->(pkg:Package {name:'lodash'}) RETURN p.name, pkg.version";
        }

        if (question.Contains("critical", StringComparison.OrdinalIgnoreCase))
        {
            return "MATCH (p:Project)-[:DEPENDS_ON]->(pkg:Package {severity:'critical'}) RETURN p.name, pkg.name, pkg.version";
        }

        return "MATCH (p:Project)-[:DEPENDS_ON]->(pkg:Package) RETURN p.name, pkg.name, pkg.version LIMIT 25";
    }
}
