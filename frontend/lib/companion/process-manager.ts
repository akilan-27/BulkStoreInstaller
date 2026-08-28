import { spawn, execSync, ChildProcessWithoutNullStreams } from 'child_process';
import * as os from 'os';

// Maximum time (ms) to wait for a single app installation before timing out.
// Covers cases where the installer silently waits for UAC or user interaction.
const INSTALL_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes

export class ProcessManager {
  private currentProcess: ChildProcessWithoutNullStreams | null = null;
  private isCancelled: boolean = false;

  spawnProcess(
    command: string,
    args: string[],
    onStdout: (data: string) => void,
    onStderr: (data: string) => void,
    timeoutMs: number = INSTALL_TIMEOUT_MS
  ): Promise<number | null> {
    this.isCancelled = false;

    return new Promise((resolve, reject) => {
      let timer: ReturnType<typeof setTimeout> | null = null;

      const cleanup = () => {
        if (timer) {
          clearTimeout(timer);
          timer = null;
        }
      };

      try {
        this.currentProcess = spawn(command, args);

        // Set a hard timeout — kill the process if it takes too long
        timer = setTimeout(() => {
          const msg = `[Timeout] Installation exceeded ${timeoutMs / 1000}s. The installer may require user interaction (e.g. UAC elevation). Killing process.`;
          onStderr(msg);
          console.error(msg);
          this.forceKill();
          resolve(1); // non-zero = failure
        }, timeoutMs);

        this.currentProcess.stdout.on('data', (data) => {
          onStdout(data.toString());
        });

        this.currentProcess.stderr.on('data', (data) => {
          onStderr(data.toString());
        });

        this.currentProcess.on('exit', (code) => {
          cleanup();
          this.currentProcess = null;
          resolve(code);
        });

        this.currentProcess.on('error', (err) => {
          cleanup();
          this.currentProcess = null;
          reject(err);
        });
      } catch (err) {
        cleanup();
        this.currentProcess = null;
        reject(err);
      }
    });
  }

  private forceKill() {
    if (this.currentProcess && this.currentProcess.pid) {
      try {
        if (os.platform() === 'win32') {
          execSync(`taskkill /pid ${this.currentProcess.pid} /T /F`);
        } else {
          this.currentProcess.kill('SIGKILL');
        }
      } catch (err) {
        console.error('Failed to kill timed-out process:', err);
      }
      this.currentProcess = null;
    }
  }

  cancelProcess() {
    this.isCancelled = true;
    this.forceKill();
  }
}
