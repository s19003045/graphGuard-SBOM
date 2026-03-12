using GraphGuard.Domain.Security;
using Microsoft.AspNetCore.Authorization;

namespace GraphGuard.API.Security;

public static class AuthConfiguration
{
    public static IServiceCollection AddGraphGuardAuth(this IServiceCollection services)
    {
        services.AddAuthorization(options =>
        {
            options.AddPolicy(Roles.SecurityAdmin, p => p.RequireAssertion(_ => true));
            options.AddPolicy(Roles.SecurityAnalyst, p => p.RequireAssertion(_ => true));
            options.AddPolicy(Roles.ComplianceOfficer, p => p.RequireAssertion(_ => true));
        });

        return services;
    }
}
