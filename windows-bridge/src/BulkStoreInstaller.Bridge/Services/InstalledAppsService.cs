using System.Text.RegularExpressions;

namespace BulkStoreInstaller.Bridge.Services
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
                var result = await _processRunner.RunAsync("winget", new[] { "list", "--accept-source-agreements" });
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

            if (headerIdx <= 0) return ids;

            string headerText = lines[headerIdx - 1];
            
            int idStart = headerText.IndexOf("Id");
            if (idStart == -1) idStart = headerText.IndexOf("ID");
            
            // If we can't find 'Id' or 'ID', fallback to old behavior or just return
            if (idStart == -1)
            {
                string separatorLine = lines[headerIdx];
                var match = Regex.Match(separatorLine, @"^(---+\s+)(---+\s+)(---+\s+)");
                if (match.Success)
                {
                    idStart = match.Groups[1].Length;
                    int oldIdLength = match.Groups[2].Length;
                    ExtractIds(lines, headerIdx, idStart, oldIdLength, ids);
                }
                return ids;
            }

            int versionStart = headerText.IndexOf("Version");
            if (versionStart == -1) versionStart = headerText.IndexOf("VERSION");

            int idLength = (versionStart != -1) ? (versionStart - idStart) : (headerText.Length - idStart);

            ExtractIds(lines, headerIdx, idStart, idLength, ids);
            
            return ids;
        }

        private void ExtractIds(string[] lines, int headerIdx, int idStart, int idLength, List<string> ids)
        {
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
    }
}
