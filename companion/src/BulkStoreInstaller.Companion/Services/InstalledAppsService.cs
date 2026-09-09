using System.Text.RegularExpressions;

namespace BulkStoreInstaller.Companion.Services
{
    public class InstalledAppsService
    {
        private readonly ProcessRunner _processRunner;
        private DateTime _lastUpdate = DateTime.MinValue;
        private List<string> _cachedIds = new();
        private readonly TimeSpan _cacheDuration = TimeSpan.FromSeconds(30);

        public InstalledAppsService(ProcessRunner processRunner)
        {
            _processRunner = processRunner;
        }

        public void InvalidateCache()
        {
            _lastUpdate = DateTime.MinValue;
        }

        public async Task<List<string>> GetInstalledWingetIdsAsync()
        {
            if (DateTime.UtcNow - _lastUpdate < _cacheDuration)
            {
                return _cachedIds;
            }

            try
            {
                var result = await _processRunner.RunAsync("winget", "list --accept-source-agreements");
                _cachedIds = ParseWingetList(result.Output);
                _lastUpdate = DateTime.UtcNow;
                return _cachedIds;
            }
            catch
            {
                return new List<string>();
            }
        }

        private List<string> ParseWingetList(string output)
        {
            var ids = new List<string>();
            var lines = output.Split(new[] { '\r', '\n' }, StringSplitOptions.RemoveEmptyEntries);
            
            int headerIdx = -1;
            for (int i = 0; i < lines.Length; i++)
            {
                if (lines[i].StartsWith("---"))
                {
                    headerIdx = i;
                    break;
                }
            }

            if (headerIdx == -1 || headerIdx == 0) return ids;

            string separatorLine = lines[headerIdx];
            var match = Regex.Match(separatorLine, @"^(---+\s+)(---+\s+)(---+\s+)");
            if (match.Success)
            {
                int idStart = match.Groups[1].Length;
                int idLength = match.Groups[2].Length;

                for (int i = headerIdx + 1; i < lines.Length; i++)
                {
                    var line = lines[i];
                    if (line.Length > idStart)
                    {
                        var len = Math.Min(idLength, line.Length - idStart);
                        var id = line.Substring(idStart, len).Trim();
                        if (!string.IsNullOrEmpty(id) && id != "<" && id != "…")
                        {
                            ids.Add(id);
                        }
                    }
                }
            }
            return ids;
        }
    }
}
