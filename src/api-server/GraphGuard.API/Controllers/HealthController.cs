using Microsoft.AspNetCore.Mvc;

namespace GraphGuard.API.Controllers;

[ApiController]
[Route("")]
public sealed class HealthController : ControllerBase
{
    [HttpGet("health")]
    public IActionResult GetHealth()
    {
        return Ok(new
        {
            status = "healthy",
            service = "graphguard-api",
            timestamp = DateTimeOffset.UtcNow
        });
    }

    [HttpGet("ready")]
    public IActionResult GetReadiness()
    {
        return Ok(new
        {
            status = "ready",
            dependencies = new
            {
                sbomIngestionQueue = "ready",
                inMemoryStores = "ready"
            },
            timestamp = DateTimeOffset.UtcNow
        });
    }
}
