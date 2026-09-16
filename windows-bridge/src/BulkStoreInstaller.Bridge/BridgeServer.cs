using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using BulkStoreInstaller.Bridge.Services;

namespace BulkStoreInstaller.Bridge
{
    public class BridgeServer
    {
        private WebApplication? _app;


        public async Task StartAsync(CancellationToken cancellationToken)
        {
            var builder = WebApplication.CreateBuilder();

            // Background web host configuration
            builder.WebHost.ConfigureKestrel(serverOptions =>
            {
                serverOptions.ListenLocalhost(4545);
            });

            // Services
            builder.Services.AddSingleton<CatalogService>();
            builder.Services.AddSingleton<InstallQueueService>();
            builder.Services.AddSingleton<InstalledAppsService>();
            builder.Services.AddSingleton<ProcessRunner>();
            builder.Services.AddSingleton<WingetOutputParser>();

            builder.Services.AddCors(options =>
            {
                options.AddPolicy("ExactOrigins", policy =>
                {
                    policy.WithOrigins(
                            "http://localhost:3000",
                            "http://127.0.0.1:3000",
                            "https://bulk-store-installer.vercel.app"
                        )
                        .WithMethods("GET", "POST", "OPTIONS")
                        .WithHeaders("Content-Type", "X-BulkStoreInstaller-Client", "Authorization")
                        .WithExposedHeaders("X-BulkStoreInstaller-Bridge-Version")
                        .SetPreflightMaxAge(TimeSpan.FromMinutes(10));
                });
            });

            _app = builder.Build();

            // Exception handling & Security headers
            _app.Use(async (context, next) =>
            {
                context.Response.Headers.Append("X-Content-Type-Options", "nosniff");
                try
                {
                    await next();
                }
                catch
                {
                    if (!context.Response.HasStarted)
                    {
                        context.Response.StatusCode = 500;
                    }
                }
            });

            // Host Validation Middleware
            _app.Use(async (context, next) =>
            {
                var host = context.Request.Host.Value;
                if (host != "127.0.0.1:4545" && host != "localhost:4545")
                {
                    context.Response.StatusCode = 400;
                    return;
                }
                await next();
            });

            // Private-network preflight
            _app.Use(async (context, next) =>
            {
                if (context.Request.Method == "OPTIONS" &&
                    context.Request.Headers.ContainsKey("Access-Control-Request-Private-Network"))
                {
                    var origin = context.Request.Headers["Origin"].ToString();
                    if (origin == "http://localhost:3000" || origin == "http://127.0.0.1:3000" || origin == "https://bulk-store-installer.vercel.app")
                    {
                        context.Response.Headers["Access-Control-Allow-Private-Network"] = "true";
                    }
                }
                await next();
            });

            _app.UseCors("ExactOrigins");

            // Client/pairing validation for protected endpoints
            _app.Use(async (context, next) =>
            {
                var path = context.Request.Path.Value;
                if (path == "/install" || path == "/status" || path == "/cancel" || path == "/verify")
                {
                    // 1. Validate Client Marker
                    if (!context.Request.Headers.TryGetValue("X-BulkStoreInstaller-Client", out var clientHeader) ||
                        clientHeader != "web-v1")
                    {
                        context.Response.StatusCode = 403;
                        return;
                    }


                }
                await next();
            });

            // Endpoints
            _app.MapGet("/health", (HttpContext context, InstallQueueService queueSvc) =>
            {
                context.Response.Headers.CacheControl = "no-store";
                return Results.Ok(new
                {
                    ready = true,
                    service = "BulkStoreInstaller.Bridge",
                    bridgeVersion = "1.0.0",
                    apiVersion = "1",
                    wingetAvailable = true,
                    activeJob = queueSvc.IsInstalling
                });
            });



            _app.MapPost("/verify", async (HttpContext context, InstalledAppsService verifySvc) =>
            {
                using var document = await JsonDocument.ParseAsync(context.Request.Body);
                if (!document.RootElement.TryGetProperty("apps", out var appsProp))
                    return Results.BadRequest();

                var requestedApps = appsProp.EnumerateArray()
                    .Select(a => new {
                        Id = a.GetProperty("id").GetString() ?? "",
                        WingetId = a.GetProperty("wingetId").GetString() ?? ""
                    })
                    .ToList();

                var installedWingetIds = await verifySvc.GetInstalledWingetIdsAsync();
                
                var installedMap = new Dictionary<string, bool>();
                foreach (var req in requestedApps)
                {
                    bool isInstalled = installedWingetIds.Contains(req.WingetId, StringComparer.OrdinalIgnoreCase);
                    installedMap[req.Id] = isInstalled;
                }

                return Results.Ok(new {
                    success = true,
                    installed = installedMap,
                    installedWingetIds = installedWingetIds
                });
            });

            _app.MapPost("/install", async (HttpContext context, InstallQueueService queueSvc) =>
            {
                using var document = await JsonDocument.ParseAsync(context.Request.Body);
                if (!document.RootElement.TryGetProperty("apps", out var appsProp))
                    return Results.BadRequest();

                var requestedApps = appsProp.EnumerateArray()
                    .Select(a => new Models.CatalogApp {
                        Id = a.GetProperty("id").GetString() ?? "",
                        WingetId = a.GetProperty("wingetId").GetString() ?? "",
                        Name = a.TryGetProperty("name", out var n) ? n.GetString() : "Unknown App"
                    })
                    .ToList();

                if (queueSvc.IsInstalling)
                    return Results.Json(new { error = "JOB_ALREADY_ACTIVE" }, statusCode: 409);

                var jobId = queueSvc.StartJob(requestedApps);
                if (string.IsNullOrEmpty(jobId))
                    return Results.Json(new { error = "INVALID_QUEUE" }, statusCode: 400);

                return Results.Accepted("", new { accepted = true, jobId = jobId });
            });

            _app.MapGet("/status", (InstallQueueService queueSvc) =>
            {
                var status = queueSvc.GetStatus();
                if (status == null) return Results.Ok(new { jobId = (string?)null });
                return Results.Ok(status);
            });

            _app.MapPost("/cancel", (InstallQueueService queueSvc) =>
            {
                queueSvc.Cancel();
                return Results.Ok(new { cancelled = true, message = "Cancellation requested. Active changes may not be reverted." });
            });

            await _app.RunAsync(cancellationToken);
        }
    }
}
