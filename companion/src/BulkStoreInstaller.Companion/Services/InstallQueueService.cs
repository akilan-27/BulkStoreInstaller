using System.Collections.Concurrent;
using System.Diagnostics;
using BulkStoreInstaller.Companion.Models;

namespace BulkStoreInstaller.Companion.Services
{
    public class InstallQueueService
    {
        private readonly CatalogService _catalog;
        private readonly InstalledAppsService _installedApps;
        private InstallJob? _currentJob;
        private CancellationTokenSource? _jobCts;
        private Process? _activeProcess;
        private readonly object _lock = new();

        public bool IsInstalling
        {
            get
            {
                lock (_lock)
                {
                    return _currentJob != null && _currentJob.Status == "running";
                }
            }
        }

        public InstallQueueService(CatalogService catalog, InstalledAppsService installedApps)
        {
            _catalog = catalog;
            _installedApps = installedApps;
        }

        public string? StartJob(List<CatalogApp> apps)
        {
            lock (_lock)
            {
                if (IsInstalling) return null;

                var validApps = apps.Where(a => _catalog.IsValidApp(a.Id, a.WingetId)).ToList();
                if (!validApps.Any()) return null;

                _currentJob = new InstallJob
                {
                    JobId = Guid.NewGuid().ToString(),
                    Total = validApps.Count,
                    Queue = validApps.Select(a => new InstallQueueItem
                    {
                        Id = a.Id,
                        WingetId = a.WingetId,
                        Name = a.Name,
                        Status = "pending",
                        Stage = "preparing"
                    }).ToList()
                };

                _jobCts = new CancellationTokenSource();
                Task.Run(() => ProcessQueueAsync(_currentJob, _jobCts.Token));

                return _currentJob.JobId;
            }
        }

        public InstallJob? GetStatus()
        {
            lock (_lock)
            {
                return _currentJob;
            }
        }

        public void Cancel()
        {
            lock (_lock)
            {
                if (_currentJob != null && _currentJob.Status == "running")
                {
                    _currentJob.Status = "cancelled";
                    _jobCts?.Cancel();
                    
                    try
                    {
                        if (_activeProcess != null && !_activeProcess.HasExited)
                        {
                            _activeProcess.Kill(true);
                        }
                    }
                    catch { }

                    foreach (var item in _currentJob.Queue.Where(q => q.Status == "pending" || q.Status == "installing"))
                    {
                        item.Status = "cancelled";
                        item.ErrorMessage = "Cancelled by user";
                        _currentJob.Cancelled++;
                    }
                }
            }
        }

        private async Task ProcessQueueAsync(InstallJob job, CancellationToken token)
        {
            foreach (var item in job.Queue)
            {
                if (token.IsCancellationRequested) break;

                lock (_lock)
                {
                    item.Status = "installing";
                }

                try
                {
                    await RunWingetInstallAsync(item, token);
                    
                    if (!token.IsCancellationRequested)
                    {
                        lock (_lock)
                        {
                            if (item.Status != "failed")
                            {
                                item.Status = "success";
                                item.Stage = "success";
                                item.Progress = 100;
                                job.Completed++;
                            }
                        }
                    }
                }
                catch (OperationCanceledException)
                {
                    break;
                }
                catch (Exception ex)
                {
                    lock (_lock)
                    {
                        item.Status = "failed";
                        item.ErrorMessage = "Unexpected error occurred";
                        job.Failed++;
                    }
                }
            }

            lock (_lock)
            {
                if (job.Status == "running")
                {
                    job.Status = "completed";
                }
            }
            _installedApps.InvalidateCache();
        }

        private async Task RunWingetInstallAsync(InstallQueueItem item, CancellationToken token)
        {
            var tcs = new TaskCompletionSource<int>();
            
            _activeProcess = new Process();
            _activeProcess.StartInfo.FileName = "winget";
            _activeProcess.StartInfo.Arguments = $"install --id {item.WingetId} --exact --source winget --accept-package-agreements --accept-source-agreements --disable-interactivity";
            _activeProcess.StartInfo.UseShellExecute = false;
            _activeProcess.StartInfo.RedirectStandardOutput = true;
            _activeProcess.StartInfo.RedirectStandardError = true;
            _activeProcess.StartInfo.CreateNoWindow = true;
            _activeProcess.EnableRaisingEvents = true;

            var outputBuffer = string.Empty;

            void OutputHandler(object sender, DataReceivedEventArgs e)
            {
                if (e.Data != null)
                {
                    outputBuffer += e.Data + "\n";
                    var lines = outputBuffer.Split(new[] { '\r', '\n' }, StringSplitOptions.RemoveEmptyEntries);
                    outputBuffer = string.Empty;

                    lock (_lock)
                    {
                        foreach (var line in lines)
                        {
                            var parsed = WingetOutputParser.ParseLine(line, item.Stage, item.Progress);
                            item.Stage = parsed.Stage;
                            item.Progress = parsed.Progress;
                            item.StatusText = parsed.StatusText;
                        }
                    }
                }
            }

            _activeProcess.OutputDataReceived += OutputHandler;
            _activeProcess.ErrorDataReceived += OutputHandler;
            _activeProcess.Exited += (s, e) => tcs.TrySetResult(_activeProcess.ExitCode);

            using var reg = token.Register(() => 
            {
                try { _activeProcess.Kill(true); } catch { }
                tcs.TrySetCanceled();
            });

            try
            {
                _activeProcess.Start();
                _activeProcess.BeginOutputReadLine();
                _activeProcess.BeginErrorReadLine();

                var exitCode = await tcs.Task;

                lock (_lock)
                {
                    if (exitCode != 0)
                    {
                        item.Status = "failed";
                        item.ErrorMessage = $"Installer failed with exit code {exitCode}";
                        _currentJob!.Failed++;
                    }
                }
            }
            finally
            {
                _activeProcess = null;
            }
        }
    }
}
