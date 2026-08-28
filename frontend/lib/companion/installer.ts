import { stateManager } from './state';
import { companionEvents } from './events';
import { QueueManager } from './queue';
import { Winget } from './winget';
import { getAppById } from './catalog';

export class InstallerEngine {
  private queue: QueueManager;
  private winget: Winget;
  private isRunning: boolean = false;
  private cancelRequested: boolean = false;

  constructor() {
    this.queue = new QueueManager();
    this.winget = new Winget();
  }

  startJob(jobId: string, appIds: string[]) {
    const existingJob = stateManager.getJob();
    if (existingJob && existingJob.status === "running") {
      throw new Error("A job is already running");
    }

    const job = this.queue.createJob(jobId, appIds);
    stateManager.updateJob({ status: "running" });
    this.cancelRequested = false;

    companionEvents.emitEvent({ type: "job_started", jobId });

    // Fire and forget
    this.processQueue().catch(err => console.error("Process queue error:", err));
    
    return job;
  }

  cancelJob() {
    const job = stateManager.getJob();
    if (job && job.status === "running") {
      this.cancelRequested = true;
      this.winget.cancel(); // Terminate current running installation
      // Mark all remaining pending apps as skipped
      for (const appId of Object.keys(job.apps)) {
        if (job.apps[appId].status === "pending") {
          job.apps[appId].status = "cancelled";
          job.apps[appId].statusText = "Stopped";
        }
      }
    }
  }

  private async processQueue() {
    this.isRunning = true;
    let job = stateManager.getJob();

    while (job && job.status === "running" && !this.cancelRequested) {
      const nextAppId = this.queue.getNextApp();
      
      if (!nextAppId) {
        stateManager.updateJob({ status: "completed", currentApp: null });
        companionEvents.emitEvent({ type: "job_completed", jobId: job.jobId });
        break;
      }

      stateManager.updateJob({ currentApp: nextAppId });
      
      const appState = job.apps[nextAppId];
      appState.status = "installing";
      appState.startedAt = new Date().toISOString();
      appState.attempts += 1;
      
      companionEvents.emitEvent({ type: "app_started", jobId: job.jobId, appId: nextAppId });

      let lastProgress = 0;
      let lastError = "";

      const currentJobId = job.jobId;

      appState.statusText = "Initializing...";
      const simInterval = setInterval(() => {
        if (appState.progress < 85) {
          appState.progress += 1;
          companionEvents.emitEvent({ type: "progress", jobId: currentJobId, appId: nextAppId, progress: appState.progress });
        }
      }, 5000);

      const catalogApp = getAppById(nextAppId);
      const targetWingetId = catalogApp ? catalogApp.wingetId : nextAppId;

      const success = await this.winget.install(
        targetWingetId,
        (stdout) => {
          companionEvents.emitEvent({ type: "stdout", jobId: currentJobId, appId: nextAppId, data: stdout });
          
          const lower = stdout.toLowerCase();
          if (lower.includes('downloading ')) appState.statusText = "Downloading...";
          else if (lower.includes('successfully verified')) appState.statusText = "Verifying...";
          else if (lower.includes('starting package install')) {
            appState.statusText = "Installing...";
            if (appState.progress < 50) appState.progress = 50;
          }

          if (stdout.includes('%')) {
            const match = stdout.match(/(\d+)%/);
            if (match) {
              const p = parseInt(match[1]);
              if (p > lastProgress) {
                lastProgress = p;
                appState.progress = p;
                companionEvents.emitEvent({ type: "progress", jobId: currentJobId, appId: nextAppId, progress: p });
              }
            }
          }
        },
        (stderr) => {
          lastError += stderr + " ";
          companionEvents.emitEvent({ type: "stderr", jobId: currentJobId, appId: nextAppId, data: stderr });
        }
      );

      clearInterval(simInterval);

      job = stateManager.getJob();
      if (!job) break;

      if (success) {
        appState.status = "success";
        appState.progress = 100;
        appState.statusText = "Completed";
        appState.completedAt = new Date().toISOString();
        stateManager.updateJob({ completed: job.completed + 1 });
        companionEvents.emitEvent({ type: "app_completed", jobId: job.jobId, appId: nextAppId });
      } else {
        appState.status = "failed";
        appState.error = lastError.trim() || "Installation failed";
        appState.statusText = "Failed";
        appState.completedAt = new Date().toISOString();
        if (appState.attempts >= 3 || this.cancelRequested) {
          stateManager.updateJob({ failed: job.failed + 1 });
        }
        companionEvents.emitEvent({ type: "app_failed", jobId: job.jobId, appId: nextAppId, error: appState.error });
      }

      if (this.cancelRequested) {
        break;
      }
    }

    if (this.cancelRequested && job) {
      stateManager.updateJob({ status: "cancelled", currentApp: null });
      companionEvents.emitEvent({ type: "job_cancelled", jobId: job.jobId });
    }

    this.isRunning = false;
  }
}

export const installerEngine = new InstallerEngine();
