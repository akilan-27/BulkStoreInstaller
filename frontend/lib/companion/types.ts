export type AppInstallStatus = 
  | "pending"
  | "installing"
  | "success"
  | "failed"
  | "cancelled"
  | "skipped"
  | "verifying";

export interface AppInstallState {
  id: string; // Winget ID
  name: string;
  status: AppInstallStatus;
  progress: number;
  statusText?: string;
  attempts: number;
  startedAt: string | null;
  completedAt: string | null;
  error: string | null;
}

export type JobStatus = 
  | "idle"
  | "running"
  | "completed"
  | "cancelled"
  | "failed";

export interface InstallJob {
  jobId: string;
  status: JobStatus;
  createdAt: string;
  total: number;
  completed: number;
  failed: number;
  cancelled: number;
  currentApp: string | null;
  apps: Record<string, AppInstallState>;
}

export interface CatalogApp {
  id: string;
  name: string;
  publisher: string;
  category: string;
  description: string;
  wingetId: string;
  icon: string;
  size: string;
  verified: boolean;
  featured?: boolean;
}

export type WingetEvent = 
  | { type: "job_started"; jobId: string }
  | { type: "app_started"; jobId: string; appId: string }
  | { type: "progress"; jobId: string; appId: string; progress: number }
  | { type: "stdout"; jobId: string; appId: string; data: string }
  | { type: "stderr"; jobId: string; appId: string; data: string }
  | { type: "app_completed"; jobId: string; appId: string }
  | { type: "app_failed"; jobId: string; appId: string; error: string }
  | { type: "job_completed"; jobId: string }
  | { type: "job_cancelled"; jobId: string };
