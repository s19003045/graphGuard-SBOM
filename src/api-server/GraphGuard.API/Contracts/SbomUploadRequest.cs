namespace GraphGuard.API.Contracts;

public sealed class SbomUploadRequest
{
    public required string ProjectId { get; init; }
    public required string SourceType { get; init; }
    public required object SbomDocument { get; init; }
}
