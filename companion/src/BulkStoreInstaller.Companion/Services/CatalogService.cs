using System.Text.Json;
using BulkStoreInstaller.Companion.Models;

namespace BulkStoreInstaller.Companion.Services
{
    public class CatalogService
    {
        private List<CatalogApp> _catalog = new();

        public CatalogService()
        {
            LoadCatalog();
        }

        private void LoadCatalog()
        {
            try
            {
                var basePath = AppContext.BaseDirectory;
                var catalogPath = Path.Combine(basePath, "Assets", "catalog.json");
                if (File.Exists(catalogPath))
                {
                    var json = File.ReadAllText(catalogPath);
                    _catalog = JsonSerializer.Deserialize<List<CatalogApp>>(json, new JsonSerializerOptions { PropertyNameCaseInsensitive = true }) ?? new();
                }
            }
            catch
            {
                // Ignore catalog load errors
            }
        }

        public bool IsValidApp(string id, string wingetId)
        {
            return _catalog.Any(a => 
                a.Id.Equals(id, StringComparison.OrdinalIgnoreCase) && 
                a.WingetId.Equals(wingetId, StringComparison.OrdinalIgnoreCase));
        }
    }
}
