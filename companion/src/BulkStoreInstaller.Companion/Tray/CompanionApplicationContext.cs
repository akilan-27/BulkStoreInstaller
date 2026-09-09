using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.Hosting;
using System.Diagnostics;
using System.Windows.Forms;

namespace BulkStoreInstaller.Companion.Tray
{
    public class CompanionApplicationContext : ApplicationContext
    {
        private NotifyIcon _trayIcon;
        private WebApplication _app;

        public CompanionApplicationContext(WebApplication app)
        {
            _app = app;
            
            _trayIcon = new NotifyIcon()
            {
                Icon = SystemIcons.Application,
                ContextMenuStrip = new ContextMenuStrip(),
                Visible = true,
                Text = "BulkStoreInstaller Companion"
            };

            var statusItem = new ToolStripMenuItem("Companion Running");
            statusItem.Enabled = false;

            var openItem = new ToolStripMenuItem("Open BulkStoreInstaller", null, OpenApp);
            var exitItem = new ToolStripMenuItem("Exit", null, Exit);

            _trayIcon.ContextMenuStrip.Items.Add(statusItem);
            _trayIcon.ContextMenuStrip.Items.Add(new ToolStripSeparator());
            _trayIcon.ContextMenuStrip.Items.Add(openItem);
            _trayIcon.ContextMenuStrip.Items.Add(new ToolStripSeparator());
            _trayIcon.ContextMenuStrip.Items.Add(exitItem);
        }

        private void OpenApp(object? sender, EventArgs e)
        {
            Process.Start(new ProcessStartInfo
            {
                FileName = "https://bulk-store-installer.vercel.app",
                UseShellExecute = true
            });
        }

        private void Exit(object? sender, EventArgs e)
        {
            _trayIcon.Visible = false;
            
            // Stop the Kestrel server asynchronously
            Task.Run(async () => {
                await _app.StopAsync();
                Application.Exit();
            });
        }
    }
}
