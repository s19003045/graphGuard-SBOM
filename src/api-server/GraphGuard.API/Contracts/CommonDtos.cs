namespace GraphGuard.API.Contracts;

public sealed record PaginationRequest(int Page = 1, int PageSize = 20);

public sealed record ErrorEnvelope(string Code, string Message, string? Detail = null);
