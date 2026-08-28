import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { localhost } from "@/services/localhost";
import { App, InstallStatus } from "@/types";
import { config } from "@/constants/config";

const EMPTY_STATUS: InstallStatus = {
  isInstalling: false,
  queue: [],
  successCount: 0,
  failedCount: 0,
  remainingCount: 0,
};


export function useInstallStatus() {
  const queryClient = useQueryClient();

  const { data } = useQuery({
    queryKey: ["installStatus"],
    queryFn: () => localhost.status(),
    refetchInterval: (query) =>
      query.state.data?.isInstalling ? 5000 : false,
  });

  useEffect(() => {
    if (!data?.isInstalling) return;

    const eventSource = new EventSource(`${config.companionUrl}/events`);

    eventSource.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        
        if (payload.type === "progress") {
          queryClient.setQueryData(["installStatus"], (old: InstallStatus | undefined) => {
            if (!old) return old;
            return {
              ...old,
              queue: old.queue.map(q => 
                (q.app.wingetId === payload.appId || q.app.id === payload.appId)
                  ? { ...q, progress: payload.progress, status: "installing" } 
                  : q
              )
            };
          });
        } else if (payload.type === "app_started") {
          queryClient.setQueryData(["installStatus"], (old: InstallStatus | undefined) => {
            if (!old) return old;
            return {
              ...old,
              queue: old.queue.map(q => 
                (q.app.wingetId === payload.appId || q.app.id === payload.appId)
                  ? { ...q, status: "installing", statusText: "Initializing..." } 
                  : q
              )
            };
          });
          queryClient.invalidateQueries({ queryKey: ["installStatus"] });
        } else if (payload.type === "stdout") {
          const text = (payload.data || "").toLowerCase();
          let newText = "";
          if (text.includes('downloading ')) newText = "Downloading...";
          else if (text.includes('successfully verified')) newText = "Verifying...";
          else if (text.includes('starting package install')) newText = "Installing...";
          
          if (newText) {
            queryClient.setQueryData(["installStatus"], (old: InstallStatus | undefined) => {
              if (!old) return old;
              return {
                ...old,
                queue: old.queue.map(q => 
                  (q.app.wingetId === payload.appId || q.app.id === payload.appId)
                    ? { ...q, statusText: newText, status: "installing" } 
                    : q
                )
              };
            });
          }
        } else if (
          payload.type === "app_completed" || 
          payload.type === "app_failed" || 
          payload.type === "job_completed" || 
          payload.type === "job_cancelled"
        ) {
          queryClient.invalidateQueries({ queryKey: ["installStatus"] });
          if (payload.type === "app_completed" || payload.type === "job_completed") {
            queryClient.invalidateQueries({ queryKey: ["installedApps"] });
          }
        }
      } catch {}
    };

    return () => {
      eventSource.close();
    };
  }, [data?.isInstalling, queryClient]);

  return data || EMPTY_STATUS;
}

/**
 * Install, cancel, and retry actions.
 */
export function useInstall() {
  const queryClient = useQueryClient();

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["installStatus"] });
    queryClient.invalidateQueries({ queryKey: ["installedApps"] });
  };

  const installMutation = useMutation({
    mutationFn: async (apps: App[]) => {
      return localhost.install(apps);
    },
    onSuccess: invalidate,
  });

  const cancelMutation = useMutation({
    mutationFn: () => localhost.cancel(),
    onSuccess: invalidate,
  });

  const retryMutation = useMutation({
    mutationFn: () => localhost.retryFailed(),
    onSuccess: invalidate,
  });

  return {
    install: installMutation.mutateAsync,
    cancel: cancelMutation.mutateAsync,
    retryFailed: retryMutation.mutateAsync,
    isInstalling: installMutation.isPending,
    isCancelling: cancelMutation.isPending,
    isRetrying: retryMutation.isPending,
  };
}
