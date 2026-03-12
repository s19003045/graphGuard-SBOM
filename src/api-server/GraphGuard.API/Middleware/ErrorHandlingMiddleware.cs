using System.Net;
using System.Text.Json;
using GraphGuard.API.Contracts;

namespace GraphGuard.API.Middleware;

public sealed class ErrorHandlingMiddleware
{
    private readonly RequestDelegate _next;

    public ErrorHandlingMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task Invoke(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            context.Response.StatusCode = (int)HttpStatusCode.InternalServerError;
            context.Response.ContentType = "application/json";
            var payload = new ErrorEnvelope("internal_error", "Unexpected error", ex.Message);
            await context.Response.WriteAsync(JsonSerializer.Serialize(payload));
        }
    }
}
