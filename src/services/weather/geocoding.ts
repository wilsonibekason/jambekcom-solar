import type { AppLocation } from "@/types/solar";

export interface GeocodingService {
  search(query: string, signal?: AbortSignal): Promise<AppLocation[]>;
}

interface OpenMeteoGeoResult {
  name: string;
  country?: string;
  admin1?: string;
  latitude: number;
  longitude: number;
  timezone?: string;
}

/** Isolated behind GeocodingService so the provider can be swapped later. */
export const openMeteoGeocoding: GeocodingService = {
  async search(query, signal) {
    const trimmed = query.trim();
    if (trimmed.length < 2) return [];

    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
      trimmed,
    )}&count=8&language=en&format=json`;

    const response = await fetch(url, signal ? { signal } : undefined);
    if (!response.ok) throw new Error("Location search failed.");

    const json = (await response.json()) as { results?: OpenMeteoGeoResult[] };
    return (json.results ?? []).map((r) => ({
      name: r.admin1 && r.admin1 !== r.name ? `${r.name}, ${r.admin1}` : r.name,
      country: r.country,
      latitude: r.latitude,
      longitude: r.longitude,
      timezone: r.timezone,
    }));
  },
};
