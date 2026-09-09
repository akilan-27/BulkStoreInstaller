namespace BulkStoreInstaller.Companion.Models
{
    public class CatalogApp
    {
        public string Id { get; set; } = "";
        public string Name { get; set; } = "";
        public string WingetId { get; set; } = "";
    }

    public class InstallJob
    {
        public string JobId { get; set; } = "";
        public string Status { get; set; } = "running";
        public int Total { get; set; } = 0;
        public int Completed { get; set; } = 0;
        public int Failed { get; set; } = 0;
        public int Cancelled { get; set; } = 0;
        public int Remaining => Total - Completed - Failed - Cancelled;
        
        public List<InstallQueueItem> Queue { get; set; } = new();
    }

    public class InstallQueueItem
    {
        public string Id { get; set; } = "";
        public string WingetId { get; set; } = "";
        public string Name { get; set; } = "";
        public string Status { get; set; } = "pending";
        public string Stage { get; set; } = "";
        public int? Progress { get; set; }
        public string StatusText { get; set; } = "";
        public string? ErrorMessage { get; set; }
    }
}
