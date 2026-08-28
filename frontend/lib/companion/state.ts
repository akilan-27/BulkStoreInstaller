import { InstallJob } from './types';

class StateManager {
  private currentJob: InstallJob | null = null;

  getJob(): InstallJob | null {
    return this.currentJob;
  }

  setJob(job: InstallJob) {
    this.currentJob = job;
  }

  clearJob() {
    this.currentJob = null;
  }

  updateJob(updates: Partial<InstallJob>) {
    if (this.currentJob) {
      this.currentJob = { ...this.currentJob, ...updates };
    }
  }
}

export const stateManager = new StateManager();
