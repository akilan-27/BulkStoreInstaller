import { useQuery } from "@tanstack/react-query";
import { api } from "@/services/api";
import { SortOption } from "@/types";

/**
 * Fetch all apps with optional category filter and sort.
 */
export function useApps(options?: {
  category?: string | null;
  sort?: SortOption;
  page?: number;
  pageSize?: number;
}) {
  return useQuery({
    queryKey: ["apps", options?.category, options?.sort, options?.page, options?.pageSize],
    queryFn: () => api.getApps(options),
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Fetch all categories.
 */
export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: api.getCategories,
    staleTime: 10 * 60 * 1000,
  });
}

/**
 * Fetch app counts per category (for sidebar badges).
 */
export function useCategoryCounts() {
  return useQuery({
    queryKey: ["categoryCounts"],
    queryFn: api.getCategoryCounts,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Fetch pre-made bundles.
 */
export function useBundles() {
  return useQuery({
    queryKey: ["bundles"],
    queryFn: api.getBundles,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Fetch apps by IDs (for hydrating cart/bundle).
 */
export function useAppsByIds(ids: string[]) {
  return useQuery({
    queryKey: ["appsByIds", ids],
    queryFn: () => api.getAppsByIds(ids),
    enabled: ids.length > 0,
    staleTime: 5 * 60 * 1000,
  });
}
