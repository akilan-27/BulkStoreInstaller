import { spawn, execSync } from 'child_process';

// The installer will now wait indefinitely (up to process-manager timeout)
// for the user to accept the UAC prompt on their desktop.

export class Winget {
  private currentProcess: ReturnType<typeof spawn> | null = null;
  private cancelled = false;

  async install(
    appId: string,
    onStdout: (data: string) => void,
    onStderr: (data: string) => void
  ): Promise<boolean> {
    if (process.env.VERCEL) {
      onStderr('Winget cannot be run on Vercel.');
      return false;
    }
    this.cancelled = false;

    return new Promise((resolve) => {
      let alreadyInstalled = false;
      
      const timeoutTimer = setTimeout(() => {
        onStderr('\n[Timeout] The installation took longer than 30 minutes and was cancelled. If you believe this is an error, check your taskbar for a hidden Windows UAC prompt.\n');
        if (this.currentProcess) {
          try { this.currentProcess.kill(); } catch { /* ignore */ }
        }
        resolve(false);
      }, 30 * 60 * 1000);

      const clearTimer = () => clearTimeout(timeoutTimer);

      this.currentProcess = spawn('winget', [
        'install', '--id', appId, '-e',
        '--accept-package-agreements',
        '--accept-source-agreements',
        '--silent',
      ]);

      const proc = this.currentProcess;
      if (!proc) {
        clearTimer();
        resolve(false);
        return;
      }

      proc.stdout?.on('data', (d: Buffer) => {
        const text = d.toString();
        onStdout(text);
        if (text.includes('No available upgrade found') || text.includes('No newer package versions are available')) {
          alreadyInstalled = true;
        }
      });

      proc.stderr?.on('data', (d: Buffer) => {
        onStderr(d.toString());
      });

      proc.on('exit', (code: number | null) => {
        clearTimer();
        this.currentProcess = null;
        if (this.cancelled) { resolve(false); return; }
        resolve(code === 0 || alreadyInstalled);
      });

      this.currentProcess.on('error', (err: Error) => {
        clearTimer();
        this.currentProcess = null;
        onStderr(`Failed to run winget: ${err.message}`);
        resolve(false);
      });
    });
  }

  cancel() {
    this.cancelled = true;
    if (this.currentProcess) {
      try { this.currentProcess.kill(); } catch { /* ignore */ }
      this.currentProcess = null;
    }
    try {
      execSync('taskkill /IM winget.exe /F /T', { stdio: 'ignore' });
    } catch { /* ignore */ }
  }

  async isInstalled(): Promise<boolean> {
    if (process.env.VERCEL) return false;
    return new Promise((resolve) => {
      const p = spawn('winget', ['--version']);
      p.on('close', (code) => resolve(code === 0));
      p.on('error', () => resolve(false));
    });
  }
}
