import { InstallJob, AppInstallState } from './types';
import { stateManager } from './state';
import { getAppById } from './catalog';

export class QueueManager {
  createJob(jobId: string, appIds: string[]): InstallJob {
    const apps: Record<string, AppInstallState> = {};
    
    for (const id of appIds) {
      const catalogApp = getAppById(id);
      apps[id] = {
        id,
        name: catalogApp?.name || id,
        status: "pending",
        progress: 0,
        attempts: 0,
        startedAt: null,
        completedAt: null,
        error: null
      };
    }

    const job: InstallJob = {
      jobId,
      status: "idle",
      createdAt: new Date().toISOString(),
      total: appIds.length,
      completed: 0,
      failed: 0,
      cancelled: 0,
      currentApp: null,
      apps
    };

    stateManager.setJob(job);
    return job;
  }
  
  getNextApp(): string | null {
    const job = stateManager.getJob();
    if (!job || job.status !== "running") return null;

    const pendingApp = Object.values(job.apps).find(a => a.status === "pending" || (a.status === "failed" && a.attempts < 3));
    return pendingApp ? pendingApp.id : null;
  }
}
