using System.Text.RegularExpressions;

namespace BulkStoreInstaller.Companion.Services
{
    public class WingetOutputParser
    {
        public static (string Stage, int? Progress, string StatusText) ParseLine(string line, string currentStage, int? currentProgress)
        {
            var cleanLine = Regex.Replace(line, @"\x1B\[[^a-zA-Z]*[a-zA-Z]", "").Trim();
            if (string.IsNullOrEmpty(cleanLine)) return (currentStage, currentProgress, "");

            string stage = currentStage;
            int? progress = currentProgress;
            string statusText = cleanLine;

            var lowerLine = cleanLine.ToLowerInvariant();

            if (lowerLine.Contains("found") || lowerLine.Contains("verifying package"))
            {
                stage = "preparing";
            }
            else if (lowerLine.Contains("downloading"))
            {
                stage = "downloading";
            }
            else if (lowerLine.Contains("extracting") || lowerLine.Contains("starting package install") || lowerLine.Contains("installing"))
            {
                stage = "installing";
            }
            else if (lowerLine.Contains("successfully installed"))
            {
                stage = "verifying";
            }

            var progressMatch = Regex.Match(cleanLine, @"(\d+)\s*%");
            if (progressMatch.Success && int.TryParse(progressMatch.Groups[1].Value, out int p))
            {
                if (p >= 0 && p <= 100)
                {
                    if (progress == null || p > progress.Value)
                    {
                        progress = p;
                    }
                }
            }

            return (stage, progress, statusText);
        }
    }
}
