using System;
using System.Diagnostics;
using System.Threading;
using System.Threading.Tasks;
using System.Windows.Forms;

namespace BulkStoreInstaller.Bridge
{
    internal static class Program
    {
        private static Mutex? _mutex;
        private static BridgeServer? _server;

        [STAThread]
        static void Main(string[] args)
        {
            Application.EnableVisualStyles();
            Application.SetCompatibleTextRenderingDefault(false);

            _mutex = new Mutex(true, "Local\\BulkStoreInstaller.Bridge", out bool createdNew);

            if (!createdNew)
            {
                // Another instance is already running
                MessageBox.Show("BulkStoreInstaller Bridge is already running.", "BulkStoreInstaller", MessageBoxButtons.OK, MessageBoxIcon.Information);
                return;
            }

            var cts = new CancellationTokenSource();
            _server = new BridgeServer();

            // Start Kestrel server on a background task
            Task.Run(async () =>
            {
                try
                {
                    await _server.StartAsync(cts.Token);
                }
                catch (Exception ex)
                {
                    // Log the exception or display an error
                    Debug.WriteLine($"Failed to start server: {ex.Message}");
                }
            });

            var trayContext = new TrayApplicationContext(_server, cts);
            Application.Run(trayContext);

            // Cleanup when application exits
            cts.Cancel();
            _mutex.ReleaseMutex();
        }
    }

    public class TrayApplicationContext : ApplicationContext
    {
        private NotifyIcon _trayIcon;
        private BridgeServer _server;
        private CancellationTokenSource _cts;

        public TrayApplicationContext(BridgeServer server, CancellationTokenSource cts)
        {
            _server = server;
            _cts = cts;

            System.Drawing.Icon appIcon = SystemIcons.Application;
            var iconStream = typeof(Program).Assembly.GetManifestResourceStream("BulkStoreInstaller.Bridge.icon.ico");
            if (iconStream != null)
            {
                appIcon = new System.Drawing.Icon(iconStream);
            }

            _trayIcon = new NotifyIcon()
            {
                Icon = appIcon,
                ContextMenuStrip = new ContextMenuStrip(),
                Visible = true,
                Text = "BulkStoreInstaller Bridge"
            };

            var statusItem = new ToolStripMenuItem("Bridge Running");
            statusItem.Enabled = false;

            var exitItem = new ToolStripMenuItem("Exit", null, Exit);

            _trayIcon.ContextMenuStrip.Items.Add(statusItem);
            _trayIcon.ContextMenuStrip.Items.Add(new ToolStripSeparator());
            _trayIcon.ContextMenuStrip.Items.Add(exitItem);
        }



        private void Exit(object? sender, EventArgs e)
        {
            _trayIcon.Visible = false;
            _cts.Cancel();
            Application.Exit();
        }
    }
}
