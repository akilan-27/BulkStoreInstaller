import { useQuery } from "@tanstack/react-query";
import { bridgeClient, BridgeState } from "@/lib/bridge/client";
import { App } from "@/types";

export function useBridgeState(isDialogOpen: boolean, isJobActive: boolean): BridgeState {
  const { data } = useQuery({
    queryKey: ["bridgeHealth"],
    queryFn: bridgeClient.health,
    refetchInterval: (query) => {
      // Poll only when dialog is open or a job is active
      if (isDialogOpen || isJobActive) return 3000;
      return false; // Disable polling otherwise
    },
    refetchIntervalInBackground: false, // Don't poll when tab is hidden
    refetchOnWindowFocus: true,
    staleTime: 1500,
    retry: 1,
  });

  return data || { kind: "checking" };
}

export function useInstalledApps(apps: App[], bridgeState: BridgeState) {
  const isConnected = bridgeState.kind === "connected";
  const appRefs = apps.map(a => ({ id: a.id, wingetId: a.wingetId || a.id }));

  return useQuery<string[]>({
    queryKey: ["installedApps", appRefs],
    queryFn: () => bridgeClient.getInstalledApps(appRefs),
    staleTime: 60 * 1000, // 1 minute
    retry: 1,
    enabled: isConnected && apps.length > 0,
  });
}
