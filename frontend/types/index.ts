export interface App {
  id: string;
  name: string;
  wingetId: string;
  publisher: string;
  description: string;
  category: string;
  version?: string;
  iconPlaceholder: string;
  downloadUrl?: string; // fallback URL if the app requires admin to install via winget
  size?: string; // Approximate download size
  status?: "none" | "pending" | "installing" | "success" | "error";
}

export interface Category {
  id: string;
  name: string;
}

export interface Bundle {
  id: string;
  name: string;
  description: string;
  apps: string[];
  createdAt?: string;
  appCount?: number;
}

// Pagination
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Companion
export interface CompanionStatus {
  isConnected: boolean;
  version?: string;
  lastChecked: number;
}

// Sorting
export type SortField = "name" | "publisher" | "category";
export type SortDirection = "asc" | "desc";

export interface SortOption {
  field: SortField;
  direction: SortDirection;
  label: string;
}

export const SORT_OPTIONS: SortOption[] = [
  { field: "name", direction: "asc", label: "Name (A–Z)" },
  { field: "name", direction: "desc", label: "Name (Z–A)" },
  { field: "publisher", direction: "asc", label: "Publisher (A–Z)" },
  { field: "category", direction: "asc", label: "Category" },
];

// Filter
export interface FilterOptions {
  category: string | null;
  search: string;
  sort: SortOption;
  page: number;
  pageSize: number;
}

// Install queue
export interface InstallQueueItem {
  app: App;
  status: "pending" | "installing" | "success" | "error";
  progress: number;
  statusText?: string;
  errorMessage?: string;
}

export interface InstallStatus {
  isInstalling: boolean;
  queue: InstallQueueItem[];
  successCount: number;
  failedCount: number;
  remainingCount: number;
}
