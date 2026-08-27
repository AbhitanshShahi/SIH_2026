import { HotspotFeatureCollection, ThermalEvent, DashboardStats } from "@/types/thermal";
import { MOCK_HOTSPOT_COLLECTION, MOCK_THERMAL_EVENTS } from "@/data/mockHotspots";
import { request } from "./apiClient";

export async function fetchHotspots(params?: {
  region?: string;
  date?: string;
  minFRP?: number;
}): Promise<HotspotFeatureCollection> {
  const queryParams = new URLSearchParams();
  if (params?.region && params.region !== "all") queryParams.append("region", params.region);
  if (params?.date) queryParams.append("date", params.date);
  if (params?.minFRP) queryParams.append("min_frp", params.minFRP.toString());

  const queryString = queryParams.toString();
  const endpoint = `/hotspots${queryString ? `?${queryString}` : ""}`;

  try {
    const data = await request<HotspotFeatureCollection>(endpoint);
    if (data && data.features && data.features.length > 0) {
      return data;
    }
    return MOCK_HOTSPOT_COLLECTION;
  } catch (error) {
    console.warn("Backend /hotspots unavailable, using contract mock dataset.", error);
    return MOCK_HOTSPOT_COLLECTION;
  }
}

export function computeDashboardStats(events: ThermalEvent[]): DashboardStats {
  if (!events.length) {
    return {
      totalEvents: 0,
      industrialCount: 0,
      naturalCount: 0,
      flareCount: 0,
      highRiskCount: 0,
      avgFRP: 0,
      avgConfidence: 0,
    };
  }

  const industrialCount = events.filter((e) => e.classification === "Industrial Source").length;
  const naturalCount = events.filter((e) => e.classification === "Natural Fire" || e.classification === "Wildfire").length;
  const flareCount = events.filter((e) => e.classification === "Gas Flare").length;
  const highRiskCount = events.filter((e) => e.risk_level === "High").length;
  const totalFRP = events.reduce((sum, e) => sum + e.frp, 0);
  const totalConfidence = events.reduce((sum, e) => sum + e.confidence, 0);

  return {
    totalEvents: events.length,
    industrialCount,
    naturalCount,
    flareCount,
    highRiskCount,
    avgFRP: Math.round((totalFRP / events.length) * 10) / 10,
    avgConfidence: Math.round(totalConfidence / events.length),
  };
}
