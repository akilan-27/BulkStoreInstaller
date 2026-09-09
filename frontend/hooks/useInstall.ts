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


export function useInstallStatus(dialogOpen?: boolean) {
  const queryClient = useQueryClient();

  const { data } = useQuery({
    queryKey: ["installStatus"],
    queryFn: () => localhost.status(),
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
