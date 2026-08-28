import { useQuery } from "@tanstack/react-query";
import { localhost } from "@/services/localhost";
import { COMPANION_POLL_INTERVAL_MS } from "@/constants/config";
import { CompanionStatus } from "@/types";

/**
 * Polls the Windows Companion health endpoint.
 * Returns connection status for UI display.
 */
export function useCompanion(): CompanionStatus {
  const { data, dataUpdatedAt, error, isError } = useQuery({
    queryKey: ["companionHealth"],
    queryFn: localhost.health,
    refetchInterval: COMPANION_POLL_INTERVAL_MS,
    staleTime: COMPANION_POLL_INTERVAL_MS / 2,
    retry: 1,
  });

  console.log("useCompanion query result:", { data, error, isError, isConnected: data ?? false });

  return {
    isConnected: data ?? false,
    lastChecked: dataUpdatedAt || Date.now(),
  };
}

/**
 * Fetch list of already-installed app IDs from the Companion.
 */
export function useInstalledApps() {
  return useQuery<string[]>({
    queryKey: ["installedApps"],
    queryFn: () => localhost.getInstalledApps(),
    staleTime: 60 * 1000, // 1 minute
    retry: 1,
  });
}
