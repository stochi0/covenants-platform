// API integration for FastAPI backend

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";

export type StatsFilters = {
  country?: string;
  state?: string;
  city?: string;
  chemistries?: string[];
};

export type LocationLevel = "point" | "country" | "state" | "city";

export type GeoJSONFeature = {
  type: "Feature";
  properties: {
    key: string;
    count: number;
    company_id?: number;
  };
  geometry: {
    type: "Point";
    coordinates: [number, number];
  };
};

export type GeoJSONFeatureCollection = {
  type: "FeatureCollection";
  features: GeoJSONFeature[];
};

export type LocationStat = {
  key: string;
  count: number;
  geometry: null;
};

export type ChemistryStat = {
  chemistry: string;
  company_count: number;
};

export type ProductStatByCompany = {
  company_id: number;
  company_name: string;
  product_count: number;
};

export type ProductStatGlobal = {
  product_type: string;
  count: number;
};

function buildStatsQuery(filters: StatsFilters) {
  const params = new URLSearchParams();
  if (filters.country) params.set("country", filters.country);
  if (filters.state) params.set("state", filters.state);
  if (filters.city) params.set("city", filters.city);
  for (const c of filters.chemistries ?? []) {
    params.append("chemistries", c);
  }
  return params;
}

async function apiGet<T>(path: string, params?: URLSearchParams): Promise<T> {
  const url = new URL(path, API_BASE_URL);
  if (params) url.search = params.toString();
  const res = await fetch(url, { method: "GET" });
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);
  return (await res.json()) as T;
}

// Health check
export async function fetchHealth() {
  return apiGet<{ status: string }>("/health");
}

// Locations (aggregated)
export async function fetchLocationStats(
  level: LocationLevel,
  limit: number,
  filters: StatsFilters,
): Promise<GeoJSONFeatureCollection | LocationStat[]> {
  const params = buildStatsQuery(filters);
  params.set("level", level);
  params.set("limit", String(limit));
  return apiGet("/api/stats/locations", params);
}

// Chemistries
export async function fetchChemistryStats(
  limit: number,
  filters: StatsFilters,
): Promise<ChemistryStat[]> {
  const params = buildStatsQuery(filters);
  params.set("limit", String(limit));
  return apiGet<ChemistryStat[]>("/api/stats/chemistries", params);
}

// Products
export async function fetchProductStats(
  by: "company" | "global",
  limit: number,
  filters: StatsFilters,
): Promise<ProductStatByCompany[] | ProductStatGlobal[]> {
  const params = buildStatsQuery(filters);
  params.set("by", by);
  params.set("limit", String(limit));
  return apiGet("/api/stats/products", params);
}

