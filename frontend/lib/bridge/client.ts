import { App, InstallQueueItem, InstallStatus } from "@/types";

export type BridgeHealth = {
  ready: boolean;
  service: string;
  bridgeVersion: string;
  apiVersion: string;
  wingetAvailable: boolean;
  activeJob: boolean;
};

export type BridgeState =
  | { kind: "checking" }
  | { kind: "connected"; health: BridgeHealth }
  | { kind: "offline" }
  | { kind: "permission-blocked" }
  | { kind: "version-mismatch"; required: string; installed: string }
  | { kind: "winget-unavailable" }
  | { kind: "unauthorized" }
  | { kind: "timed-out" }
  | { kind: "configuration-error"; code?: string };

const BRIDGE_URL = "http://127.0.0.1:4545";
const CLIENT_MARKER = "web-v1";
const REQUIRED_API_VERSION = "1";



export const bridgeClient = {
  health: async (): Promise<BridgeState> => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);
    try {
      const res = await fetch(`${BRIDGE_URL}/health`, {
        signal: controller.signal,
        cache: "no-store",
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        return { kind: "offline" };
      }

      const data = await res.json() as BridgeHealth;
      if (data.apiVersion !== REQUIRED_API_VERSION) {
        return { kind: "version-mismatch", required: REQUIRED_API_VERSION, installed: data.apiVersion };
      }

      if (!data.wingetAvailable) {
        return { kind: "winget-unavailable" };
      }



      return { kind: "connected", health: data };
    } catch (err: unknown) {
      clearTimeout(timeoutId);
      if (err instanceof Error && err.name === "AbortError") {
        return { kind: "timed-out" };
      }
      // Often indicates connection refused or CORS block
      return { kind: "offline" }; // Permission blocked checking would need more context
    }
  },



  install: async (apps: App[]): Promise<void> => {
    const res = await fetch(`${BRIDGE_URL}/install`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-BulkStoreInstaller-Client": CLIENT_MARKER
      },
      body: JSON.stringify({
        apps: apps.map(a => ({ id: a.id, wingetId: a.wingetId || a.id, name: a.name })),
      }),
    });
    
    if (res.status === 401 || res.status === 403) {
      throw new Error("UNAUTHORIZED");
    }
    if (!res.ok) throw new Error("Failed to start installation");
  },

  status: async (): Promise<InstallStatus | null> => {
    try {
      const res = await fetch(`${BRIDGE_URL}/status`, {
        headers: {
          "X-BulkStoreInstaller-Client": CLIENT_MARKER
        }
      });
      if (res.status === 401 || res.status === 403) {
        return null;
      }
      if (!res.ok) return null;
      const data = await res.json();
      if (!data.jobId) return null;

      const queue: InstallQueueItem[] = (data.queue || []).map((q: Record<string, unknown>) => {
        return {
          app: {
            id: q.id as string, name: q.name as string, wingetId: q.wingetId as string, publisher: "", description: "", category: "", version: "", iconPlaceholder: "", status: "none"
          },
          status: q.status === "success" ? "success" : q.status === "failed" ? "error" : q.status === "installing" ? "installing" : "pending",
          progress: (q.progress as number) || 0,
          statusText: q.statusText as string,
          errorMessage: q.errorMessage as string,
        };
      });

      return {
        isInstalling: data.status === "running",
        queue,
        successCount: data.completed || 0,
        failedCount: data.failed || 0,
        remainingCount: (data.total || 0) - (data.completed || 0) - (data.failed || 0) - (data.cancelled || 0),
      };
    } catch {
      return null;
    }
  },

  cancel: async (): Promise<void> => {
    const res = await fetch(`${BRIDGE_URL}/cancel`, {
      method: "POST",
      headers: {
        "X-BulkStoreInstaller-Client": CLIENT_MARKER
      }
    });
    if (!res.ok) throw new Error("Failed to cancel installation");
  },

  getInstalledApps: async (apps: {id: string, wingetId: string}[]): Promise<string[]> => {
    try {
      const res = await fetch(`${BRIDGE_URL}/verify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-BulkStoreInstaller-Client": CLIENT_MARKER
        },
        body: JSON.stringify({ apps }),
      });
      if (!res.ok) return [];
      const data = await res.json();
      if (data.success && data.installed) {
        return Object.keys(data.installed).filter(id => data.installed[id]);
      }
      return [];
    } catch {
      return [];
    }
  },
};
