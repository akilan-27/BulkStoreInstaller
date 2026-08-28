import { App, InstallQueueItem, InstallStatus } from "@/types";
import { companionEndpoints } from "@/constants/config";

// Keep a local reference to apps sent to installation so we can map them back
const currentApps: Map<string, App> = new Map();

export const localhost = {
  health: async (): Promise<boolean> => {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000);
      console.log("Fetching health from:", companionEndpoints.health);
      const res = await fetch(companionEndpoints.health, {
        signal: controller.signal,
      });
      clearTimeout(timeout);
      if (!res.ok) {
        console.error("Health fetch failed with status:", res.status);
        return false;
      }
      const data = await res.json();
      console.log("Health response data:", data);
      return data.ready === true;
    } catch (error) {
      console.error("Health fetch error:", error);
      return false;
    }
  },

  install: async (apps: App[]): Promise<void> => {
    apps.forEach(a => currentApps.set(a.wingetId || a.id, a));
    const res = await fetch(companionEndpoints.install, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        appIds: apps.map((a) => a.wingetId || a.id),
      }),
    });
    if (!res.ok) throw new Error("Failed to start installation");
  },

  status: async (): Promise<InstallStatus> => {
    const res = await fetch(companionEndpoints.status);
    if (!res.ok) {
      if (res.status === 404) {
        return {
          isInstalling: false,
          queue: [],
          successCount: 0,
          failedCount: 0,
          remainingCount: 0,
        };
      }
      throw new Error("Failed to get installation status");
    }
    const data = await res.json();
    
    const queue: InstallQueueItem[] = (data.queue || []).map((q: { id: string; name: string; status: string; progress: number; statusText?: string; error?: string }) => {
      let app = currentApps.get(q.id);
      if (!app) {
        app = {
          id: q.id,
          name: q.name,
          wingetId: q.id,
          publisher: "Unknown",
          description: "",
          category: "",
          version: "",
          iconPlaceholder: `https://ui-avatars.com/api/?name=${q.name[0]}&background=random`,
          status: "none"
        };
      }
      return {
        app,
        status: q.status === "success" ? "success" : q.status === "failed" ? "error" : q.status === "installing" ? "installing" : "pending",
        progress: q.progress,
        statusText: q.statusText,
        errorMessage: q.error,
      };
    });

    return {
      isInstalling: data.status === "running",
      queue,
      successCount: data.completed,
      failedCount: data.failed,
      remainingCount: data.total - data.completed - data.failed - data.cancelled,
    };
  },

  cancel: async (): Promise<void> => {
    const res = await fetch(companionEndpoints.cancel, { method: "POST" });
    if (!res.ok) throw new Error("Failed to cancel installation");
  },

  retryFailed: async (): Promise<void> => {
    const res = await fetch(companionEndpoints.status);
    if (!res.ok) return;
    const data = await res.json();
    const failedIds = (data.queue || []).filter((q: { status: string; id: string }) => q.status === "failed").map((q: { id: string }) => q.id);
    if (failedIds.length > 0) {
      const res2 = await fetch(companionEndpoints.install, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ appIds: failedIds }),
      });
      if (!res2.ok) throw new Error("Failed to retry");
    }
  },

  getInstalledApps: async (appIds?: string[]): Promise<string[]> => {
    try {
      const res = await fetch(companionEndpoints.installed, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ appIds: appIds || [] }),
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
