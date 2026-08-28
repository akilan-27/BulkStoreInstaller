import { useState, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/services/api";
import { SEARCH_DEBOUNCE_MS } from "@/constants/config";

export function useSearch(initialQuery = "") {
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  const { data: searchResults, isLoading } = useQuery({
    queryKey: ["search", debouncedQuery],
    queryFn: () => api.searchApps(debouncedQuery),
    enabled: debouncedQuery.length > 1,
    staleTime: 2 * 60 * 1000,
  });

  const clearSearch = useCallback(() => {
    setSearchQuery("");
    setDebouncedQuery("");
  }, []);

  return {
    searchQuery,
    setSearchQuery,
    clearSearch,
    searchResults: debouncedQuery.length > 1 ? searchResults : undefined,
    isSearching: isLoading && debouncedQuery.length > 1,
    hasQuery: debouncedQuery.length > 1,
  };
}
