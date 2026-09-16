import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { bridgeClient } from "@/lib/bridge/client";
import { App, InstallStatus } from "@/types";

const EMPTY_STATUS: InstallStatus = {
  isInstalling: false,
  queue: [],
  successCount: 0,
  failedCount: 0,
  remainingCount: 0,
};


export function useInstallStatus(dialogOpen?: boolean) {
  const queryClient = useQueryClient();

  const { data } = useQuery({
    queryKey: ["installStatus"],
    queryFn: () => bridgeClient.status(),
    refetchInterval: (query) => {
      const isInstalling = query.state.data?.isInstalling;
      if (isInstalling) return 1000;
      if (dialogOpen) return 3000;
      return false;
    },
  });

  // Invalidate installed apps when a job completes or an item succeeds
  useEffect(() => {
    if (data?.successCount && data.successCount > 0) {
      queryClient.invalidateQueries({ queryKey: ["installedApps"] });
    }
    if (!data?.isInstalling && data?.queue && data.queue.length > 0) {
      queryClient.invalidateQueries({ queryKey: ["installedApps"] });
    }
  }, [data?.isInstalling, data?.successCount, data?.queue?.length, queryClient]);

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
      return bridgeClient.install(apps);
    },
    onSuccess: invalidate,
  });

  const cancelMutation = useMutation({
    mutationFn: () => bridgeClient.cancel(),
    onSuccess: invalidate,
  });

  const retryMutation = useMutation({
    mutationFn: async () => {
        const status = await bridgeClient.status();
        if (!status) return;
        const failedApps = status.queue.filter(q => q.status === "error").map(q => q.app);
        if (failedApps.length > 0) {
            return bridgeClient.install(failedApps);
        }
    },
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
