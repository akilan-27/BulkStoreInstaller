using System.Diagnostics;
using System.Text;

namespace BulkStoreInstaller.Companion.Services
{
    public class ProcessRunner
    {
        public virtual async Task<(int ExitCode, string Output)> RunAsync(string fileName, string arguments, CancellationToken cancellationToken = default)
        {
            var tcs = new TaskCompletionSource<int>();
            var outputBuilder = new StringBuilder();

            using var process = new Process();
            process.StartInfo.FileName = fileName;
            process.StartInfo.Arguments = arguments;
            process.StartInfo.UseShellExecute = false;
            process.StartInfo.RedirectStandardOutput = true;
            process.StartInfo.RedirectStandardError = true;
            process.StartInfo.CreateNoWindow = true;
            process.EnableRaisingEvents = true;

            process.OutputDataReceived += (s, e) => {
                if (e.Data != null) outputBuilder.AppendLine(e.Data);
            };
            process.ErrorDataReceived += (s, e) => {
                if (e.Data != null) outputBuilder.AppendLine(e.Data);
            };

            process.Exited += (s, e) => tcs.TrySetResult(process.ExitCode);

            using var registration = cancellationToken.Register(() =>
            {
                try { process.Kill(true); } catch { }
                tcs.TrySetCanceled();
            });

            process.Start();
            process.BeginOutputReadLine();
            process.BeginErrorReadLine();

            try
            {
                int exitCode = await tcs.Task;
                return (exitCode, outputBuilder.ToString());
            }
            catch (TaskCanceledException)
            {
                return (-1, outputBuilder.ToString());
            }
        }
    }
}
