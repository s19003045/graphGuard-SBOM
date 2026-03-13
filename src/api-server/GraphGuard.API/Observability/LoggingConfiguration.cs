using Microsoft.Extensions.Primitives;

namespace GraphGuard.API.Observability;

public static class LoggingConfiguration
{
    public const string CorrelationHeader = "X-Correlation-Id";

    public static IServiceCollection AddGraphGuardLogging(this IServiceCollection services)
    {
        services.AddHttpContextAccessor();
        return services;
    }

    public static IApplicationBuilder UseGraphGuardCorrelationId(this IApplicationBuilder app)
    {
        return app.Use(async (context, next) =>
        {
            var logger = context.RequestServices
                .GetRequiredService<ILoggerFactory>()
                .CreateLogger("GraphGuard.Request");

            var correlationId = ResolveCorrelationId(context.Request.Headers);
            context.Response.Headers[CorrelationHeader] = correlationId;

            using (logger.BeginScope(new Dictionary<string, object>
            {
                ["CorrelationId"] = correlationId,
                ["RequestPath"] = context.Request.Path.Value ?? string.Empty,
                ["Method"] = context.Request.Method
            }))
            {
                logger.LogInformation("Handling request {Method} {Path}", context.Request.Method, context.Request.Path);
                await next();
                logger.LogInformation("Completed request {Method} {Path} with status {StatusCode}",
                    context.Request.Method,
                    context.Request.Path,
                    context.Response.StatusCode);
            }
        });
    }

    private static string ResolveCorrelationId(IHeaderDictionary headers)
    {
        if (headers.TryGetValue(CorrelationHeader, out StringValues values)
            && !StringValues.IsNullOrEmpty(values)
            && !string.IsNullOrWhiteSpace(values[0]))
        {
            return values[0]!;
        }

        return Guid.NewGuid().ToString("N");
    }
}
