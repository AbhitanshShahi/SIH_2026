export type ClassificationType =
  | "Industrial Source"
  | "Gas Flare"
  | "Other Thermal Anomaly"
  | "Natural Fire"
  | "Wildfire"
  | "Crop Burning"
  | "Unknown";

export type RiskLevel = "High" | "Medium" | "Low";

export type ConfidenceLevel = "High" | "Medium" | "Low";

export function getConfidenceLevel(confidence: number | string): ConfidenceLevel {
  if (typeof confidence === "string") {
    const lower = confidence.toLowerCase();
    if (lower.includes("high")) return "High";
    if (lower.includes("med")) return "Medium";
    if (lower.includes("low")) return "Low";
    const parsed = parseFloat(confidence);
    if (!isNaN(parsed)) return getConfidenceLevel(parsed);
    return "Medium";
  }
  const val = confidence <= 1 ? confidence * 100 : confidence;
  if (val >= 85) return "High";
  if (val >= 65) return "Medium";
  return "Low";
}
export type SatelliteSource = "Suomi NPP / VIIRS" | "NOAA-20 / VIIRS" | "Terra / MODIS" | "Aqua / MODIS";
export type FrpLevel = "All" | "Low" | "Moderate" | "High" | "Extreme";

export interface GeoPoint {
  latitude: number;
  longitude: number;
}

export interface ThermalEvent {
  id: string;
  location: GeoPoint;
  classification: ClassificationType;
  confidence: number; // 0 to 100 or 0 to 1
  risk_level: RiskLevel;
  frp: number; // Fire Radiative Power (MW)
  brightness_temperature: number; // Kelvin
  persistence_days: number;
  night_ratio: number; // 0 to 1
  cluster_size: number;
  distance_to_industry: number; // meters
  land_cover: string; // e.g. "Industrial", "Forest", "Agriculture", "Barren"
  nearby_facility?: string;
  reasoning: string[];
  feature_weights?: {
    feature: string;
    importance: number; // 0 to 100
    description: string;
  }[];
  timestamp: string; // ISO 8601
  satellite?: SatelliteSource;
  historical_history?: {
    date: string;
    frp: number;
    detected_passes: number;
    is_night: boolean;
  }[];
}

export interface GeoJSONPointGeometry {
  type: "Point";
  coordinates: [number, number]; // [longitude, latitude]
}

export interface HotspotFeature {
  type: "Feature";
  geometry: GeoJSONPointGeometry;
  properties: ThermalEvent;
}

export interface HotspotFeatureCollection {
  type: "FeatureCollection";
  features: HotspotFeature[];
}

export interface PredictRequest {
  latitude: number;
  longitude: number;
  frp: number;
  brightness_temperature?: number;
  persistence_score?: number;
  night_ratio?: number;
  cluster_size?: number;
  distance_to_industry?: number;
  land_cover?: string;
}

export interface PredictResponse {
  classification: ClassificationType;
  confidence: number;
  risk_level?: RiskLevel;
  reasoning: string[];
}

export interface FilterOptions {
  classification: ClassificationType | "All";
  riskLevel: RiskLevel | "All";
  minFRP: number;
  frpLevel: FrpLevel;
  minConfidence: number;
  satellite: SatelliteSource | "All";
  searchQuery: string;
}

export interface DashboardStats {
  totalEvents: number;
  industrialCount: number;
  naturalCount: number;
  flareCount: number;
  highRiskCount: number;
  avgFRP: number;
  avgConfidence: number;
}
