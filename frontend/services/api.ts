import { App, Category, Bundle, SortOption } from "@/types";
import { config } from "@/constants/config";
import mockApps from "../mock/apps.json";
import mockCategories from "../mock/categories.json";

// Simulate network delay (mock mode only)
const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

/**
 * Sort apps client-side
 */
function sortApps(apps: App[], sort: SortOption): App[] {
  return [...apps].sort((a, b) => {
    const aVal = a[sort.field].toLowerCase();
    const bVal = b[sort.field].toLowerCase();
    const cmp = aVal.localeCompare(bVal);
    return sort.direction === "asc" ? cmp : -cmp;
  });
}

/**
 * API client — uses mock data when NEXT_PUBLIC_USE_MOCK=true,
 * otherwise makes real HTTP requests to the backend.
 */
async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`API error: ${res.status} ${res.statusText}`);
  }
  return res.json();
}

export const api = {
  /**
   * Get all apps, optionally filtered by category and sorted.
   */
  getApps: async (options?: {
    category?: string | null;
    sort?: SortOption;
    page?: number;
    pageSize?: number;
  }): Promise<App[]> => {
    if (config.useMock) {
      await delay(400);
      let apps = mockApps as App[];

      // Filter by category
      if (options?.category) {
        apps = apps.filter(
          (app) =>
            app.category.toLowerCase() === options.category!.toLowerCase()
        );
      }

      // Sort
      if (options?.sort) {
        apps = sortApps(apps, options.sort);
      }

      // Paginate
      if (options?.page !== undefined && options?.pageSize !== undefined) {
        const start = (options.page - 1) * options.pageSize;
        apps = apps.slice(start, start + options.pageSize);
      }

      return apps;
    }

    // Real API call
    const params = new URLSearchParams();
    if (options?.category) params.set("category", options.category);
    if (options?.sort) {
      params.set("sort", options.sort.field);
      params.set("order", options.sort.direction);
    }
    if (options?.page) params.set("page", String(options.page));
    if (options?.pageSize) params.set("pageSize", String(options.pageSize));

    const url = `${config.apiUrl}/api/apps?${params}`;
    return fetchJson<App[]>(url);
  },

  /**
   * Get all categories with optional app counts.
   */
  getCategories: async (): Promise<Category[]> => {
    if (config.useMock) {
      await delay(200);
      return mockCategories as Category[];
    }
    return fetchJson<Category[]>(`${config.apiUrl}/api/categories`);
  },

  /**
   * Get app count per category (mock: computed from data).
   */
  getCategoryCounts: async (): Promise<Record<string, number>> => {
    if (config.useMock) {
      await delay(100);
      const apps = mockApps as App[];
      const counts: Record<string, number> = {};
      apps.forEach((app) => {
        counts[app.category] = (counts[app.category] || 0) + 1;
      });
      return counts;
    }
    return fetchJson<Record<string, number>>(
      `${config.apiUrl}/api/categories/counts`
    );
  },

  /**
   * Search apps by name or publisher.
   */
  searchApps: async (query: string): Promise<App[]> => {
    if (config.useMock) {
      await delay(250);
      const lowerQuery = query.toLowerCase();
      return (mockApps as App[]).filter(
        (app) =>
          app.name.toLowerCase().includes(lowerQuery) ||
          app.publisher.toLowerCase().includes(lowerQuery) ||
          app.description.toLowerCase().includes(lowerQuery)
      );
    }

    const params = new URLSearchParams({ q: query });
    return fetchJson<App[]>(`${config.apiUrl}/api/search?${params}`);
  },

  /**
   * Get all bundles.
   */
  getBundles: async (): Promise<Bundle[]> => {
    if (config.useMock) {
      await delay(300);
      // Return pre-made bundles for demo
      return [
        {
          id: "bundle-dev",
          name: "Developer Starter Pack",
          description:
            "Essential tools for web and software development. Git, VS Code, Node.js, Docker and more.",
          apps: ["app-1", "app-6", "app-9", "app-14", "app-17"],
          appCount: 5,
          createdAt: "2026-08-01",
        },
        {
          id: "bundle-essentials",
          name: "Windows Essentials",
          description:
            "Must-have applications for every Windows PC. Browsers, media players, and productivity tools.",
          apps: ["app-2", "app-3", "app-7", "app-10", "app-15", "app-20"],
          appCount: 6,
          createdAt: "2026-08-01",
        },
        {
          id: "bundle-creative",
          name: "Creative Suite",
          description:
            "Design, video editing, and creative tools for artists and content creators.",
          apps: ["app-22", "app-25", "app-30"],
          appCount: 3,
          createdAt: "2026-08-03",
        },
      ];
    }
    return fetchJson<Bundle[]>(`${config.apiUrl}/api/bundles`);
  },

  /**
   * Create a new bundle.
   */
  createBundle: async (bundle: Omit<Bundle, "id">): Promise<Bundle> => {
    if (config.useMock) {
      await delay(500);
      return { ...bundle, id: `bundle-${Date.now()}` };
    }

    const res = await fetch(`${config.apiUrl}/api/bundles`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(bundle),
    });
    if (!res.ok) throw new Error("Failed to create bundle");
    return res.json();
  },

  /**
   * Get apps by IDs (for hydrating bundles/cart).
   */
  getAppsByIds: async (ids: string[]): Promise<App[]> => {
    if (config.useMock) {
      await delay(200);
      return (mockApps as App[]).filter((app) => ids.includes(app.id));
    }
    const params = new URLSearchParams({ ids: ids.join(",") });
    return fetchJson<App[]>(`${config.apiUrl}/api/apps/batch?${params}`);
  },
};
