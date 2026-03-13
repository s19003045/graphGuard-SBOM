using GraphGuard.API.Middleware;
using GraphGuard.API.Security;
using GraphGuard.API.Workers;
using GraphGuard.AI.Services;
using GraphGuard.Domain.Audit;
using GraphGuard.Domain.Exceptions;
using GraphGuard.Domain.Graph;
using GraphGuard.Domain.Sbom;
using GraphGuard.Infrastructure.Audit;
using GraphGuard.Infrastructure.Exceptions;
using GraphGuard.Infrastructure.Events;
using GraphGuard.Infrastructure.Graph;
using GraphGuard.Infrastructure.Sbom;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddOpenApi();
builder.Services.AddGraphGuardAuth();

builder.Services.AddSingleton<ISbomSnapshotRepository, SbomSnapshotRepository>();
builder.Services.AddSingleton<IIngestionQueueService, IngestionQueueService>();
builder.Services.AddSingleton<IIngestionStatusEventPublisher, IngestionStatusEventPublisher>();
builder.Services.AddSingleton<IAuditEventRepository, AuditEventRepository>();
builder.Services.AddSingleton<IProjectDependencyGraphStore, ProjectDependencyGraphStore>();
builder.Services.AddSingleton<ISbomGraphProjectionService, SbomGraphProjectionService>();
builder.Services.AddSingleton<IDependencyGraphQueryService, DependencyGraphQueryService>();
builder.Services.AddSingleton<IRiskExceptionService, RiskExceptionService>();
builder.Services.AddSingleton<IRemediationService, RemediationService>();
builder.Services.AddSingleton<INaturalLanguageQueryService, NaturalLanguageQueryService>();
builder.Services.AddHostedService<SbomIngestionWorker>();

var app = builder.Build();

app.UseMiddleware<ErrorHandlingMiddleware>();
app.UseAuthorization();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.MapControllers();

app.Run();
