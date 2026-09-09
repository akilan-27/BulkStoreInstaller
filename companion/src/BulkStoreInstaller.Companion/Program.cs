using System.Text.Json;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using System.Threading;
using System.Windows.Forms;
using BulkStoreInstaller.Companion.Tray;
using BulkStoreInstaller.Companion.Services;

namespace BulkStoreInstaller.Companion
{
    public class Program
    {
        private static Mutex? _mutex;

        [STAThread]
        public static void Main(string[] args)
        {
            Application.EnableVisualStyles();
            Application.SetCompatibleTextRenderingDefault(false);

            bool createdNew;
            _mutex = new Mutex(true, "Local\\BulkStoreInstaller.Companion", out createdNew);

            if (!createdNew)
            {
                // App is already running
                return;
            }

            var builder = WebApplication.CreateBuilder(args);
            
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
                options.AddPolicy("AllowSpecificOrigins", policy =>
                {
                    policy.WithOrigins(
                            "https://bulk-store-installer.vercel.app",
                            "http://localhost:3000",
                            "http://127.0.0.1:3000"
                        )
                        .WithMethods("GET", "POST", "OPTIONS")
                        .WithHeaders("Content-Type", "X-BulkStoreInstaller-Client")
                        .SetPreflightMaxAge(TimeSpan.FromSeconds(600));
                });
            });

            var app = builder.Build();

            // Host Validation Middleware
            app.Use(async (context, next) =>
            {
                var host = context.Request.Host.Value;
                if (host != "127.0.0.1:4545" && host != "localhost:4545")
                {
                    context.Response.StatusCode = 400;
                    return;
                }

                // Private-network preflight
                if (context.Request.Method == "OPTIONS" &&
                    context.Request.Headers.ContainsKey("Access-Control-Request-Private-Network"))
                {
                    context.Response.Headers["Access-Control-Allow-Private-Network"] = "true";
                }

                context.Response.Headers.CacheControl = "no-store";
                await next();
            });

            app.UseCors("AllowSpecificOrigins");

            // Client marker check
            app.Use(async (context, next) =>
            {
                var path = context.Request.Path.Value;
                if (path == "/verify" || path == "/install" || path == "/status" || path == "/cancel")
                {
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
            app.MapGet("/health", () =>
            {
                return Results.Ok(new
                {
                    ready = true,
                    version = "1.1.0",
                    wingetAvailable = true,
                    isInstalling = app.Services.GetRequiredService<InstallQueueService>().IsInstalling
                });
            });

            app.MapPost("/verify", async (HttpContext context, InstalledAppsService verifySvc) =>
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

            app.MapPost("/install", async (HttpContext context, InstallQueueService queueSvc) =>
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
                    return Results.Conflict();

                var jobId = queueSvc.StartJob(requestedApps);
                if (string.IsNullOrEmpty(jobId))
                    return Results.BadRequest(new { error = "Validation failed" });

                return Results.Accepted("", new { accepted = true, jobId = jobId });
            });

            app.MapGet("/status", (InstallQueueService queueSvc) =>
            {
                var status = queueSvc.GetStatus();
                if (status == null) return Results.Ok(new { jobId = (string?)null });
                return Results.Ok(status);
            });

            app.MapPost("/cancel", (InstallQueueService queueSvc) =>
            {
                queueSvc.Cancel();
                return Results.Ok(new { cancelled = true });
            });

            _ = app.RunAsync();

            var appContext = new CompanionApplicationContext(app);
            Application.Run(appContext);

            app.StopAsync().Wait();
            _mutex.ReleaseMutex();
        }
    }
}
