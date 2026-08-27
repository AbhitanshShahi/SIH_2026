import { ClassificationType, HotspotFeatureCollection, RiskLevel, SatelliteSource, ThermalEvent, DashboardStats } from "@/types/thermal";
import { request } from "./apiClient";

const useMockData = process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true";

interface BackendGeoJSONFeature {
  type: "Feature";
  geometry: { type: "Point"; coordinates: [number, number] };
  properties: {
    id: number;
    timestamp: string;
    frp: number | null;
    brightness: number | null;
    satellite: string | null;
    prediction_class: number | null;
    class_name: string | null;
    confidence: number | null;
    risk_level: string | null;
    reasoning: string[];
  };
}

interface BackendGeoJSONCollection {
  type: "FeatureCollection";
  features: BackendGeoJSONFeature[];
}

const classificationById: Record<number, ClassificationType> = {
  0: "Unknown",
  1: "Industrial Source",
  2: "Gas Flare",
};

const satelliteByBackendValue: Record<string, SatelliteSource> = {
  SNPP: "Suomi NPP / VIIRS",
  N20: "NOAA-20 / VIIRS",
  TERRA: "Terra / MODIS",
  AQUA: "Aqua / MODIS",
};

function mapBackendFeature(feature: BackendGeoJSONFeature): ThermalEvent {
  const { properties, geometry } = feature;
  const classification = classificationById[properties.prediction_class ?? 0] ?? "Unknown";
  const isIndustrial = classification === "Industrial Source" || classification === "Gas Flare";

  return {
    id: String(properties.id),
    location: { latitude: geometry.coordinates[1], longitude: geometry.coordinates[0] },
    classification,
    confidence: Math.round((properties.confidence ?? 0) * 100),
    risk_level: (properties.risk_level as RiskLevel) ?? "Low",
    frp: properties.frp ?? 0,
    brightness_temperature: properties.brightness ?? 0,
    persistence_days: 0,
    night_ratio: 0,
    cluster_size: 1,
    distance_to_industry: isIndustrial ? 0 : 10_000,
    land_cover: isIndustrial ? "Industrial monitoring area" : "Unclassified land cover",
    reasoning: properties.reasoning ?? [],
    timestamp: properties.timestamp,
    satellite: properties.satellite ? satelliteByBackendValue[properties.satellite.toUpperCase()] : undefined,
  };
}

export async function fetchHotspots(params?: {
  region?: string;
  date?: string;
  minFRP?: number;
}): Promise<HotspotFeatureCollection> {
  const queryParams = new URLSearchParams();
  if (params?.date) queryParams.append("start_date", `${params.date}T00:00:00Z`);
  if (params?.minFRP) queryParams.append("min_frp", params.minFRP.toString());

  const queryString = queryParams.toString();
  const endpoint = `/events/geojson${queryString ? `?${queryString}` : ""}`;

  if (useMockData) {
    const { MOCK_HOTSPOT_COLLECTION } = await import("@/data/mockHotspots");
    return MOCK_HOTSPOT_COLLECTION;
  }

  const data = await request<BackendGeoJSONCollection>(endpoint);
  return {
    type: "FeatureCollection",
    features: data.features.map((feature) => ({
      type: "Feature",
      geometry: feature.geometry,
      properties: mapBackendFeature(feature),
    })),
  };
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
