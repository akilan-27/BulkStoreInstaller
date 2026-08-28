// Environment-based configuration
export const config = {
  apiUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",
  companionUrl: process.env.NEXT_PUBLIC_COMPANION_URL || "/api/companion",
  useMock: process.env.NEXT_PUBLIC_USE_MOCK === "true",
} as const;

// Companion API endpoints
export const companionEndpoints = {
  health: `${config.companionUrl}/health`,
  install: `${config.companionUrl}/install`,
  status: `${config.companionUrl}/status`,
  cancel: `${config.companionUrl}/cancel`,
  installed: `${config.companionUrl}/verify`,
} as const;

// API endpoints
export const apiEndpoints = {
  apps: `${config.apiUrl}/api/apps`,
  categories: `${config.apiUrl}/api/categories`,
  search: `${config.apiUrl}/api/search`,
  bundles: `${config.apiUrl}/api/bundles`,
} as const;

// Pagination defaults
export const PAGINATION = {
  defaultPageSize: 40,
  maxPageSize: 100,
} as const;

// Search debounce
export const SEARCH_DEBOUNCE_MS = 300;

// Companion health check interval
export const COMPANION_POLL_INTERVAL_MS = 3_000;
