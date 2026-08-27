import { HotspotFeatureCollection, ThermalEvent } from "@/types/thermal";

export const MOCK_THERMAL_EVENTS: ThermalEvent[] = [
  {
    id: "evt-guj-001",
    location: { latitude: 22.33, longitude: 70.05 },
    classification: "Industrial Source",
    confidence: 94,
    risk_level: "High",
    frp: 128.5,
    brightness_temperature: 342.8,
    persistence_days: 34,
    night_ratio: 0.93,
    cluster_size: 6,
    distance_to_industry: 180,
    land_cover: "Industrial / Refinery",
    nearby_facility: "Jamnagar Petroleum Refinery Complex",
    reasoning: [
      "High thermal persistence detected across 34 consecutive days",
      "Located within 180m of petrochemical refinery boundary",
      "93% nighttime thermal signature dominance",
      "Point-source concentrated thermal radiation profile"
    ],
    feature_weights: [
      { feature: "Persistence Days", importance: 38, description: "Recurrent anomaly at exact coordinate" },
      { feature: "Proximity to Facility", importance: 32, description: "Close proximity (<200m) to mapped refinery" },
      { feature: "Night/Day Ratio", importance: 20, description: "Uninterrupted 24/7 industrial heating cycle" },
      { feature: "FRP Concentration", importance: 10, description: "High intensity localized thermal flux" }
    ],
    timestamp: "2026-08-26T18:30:00Z",
    satellite: "Suomi NPP / VIIRS",
    historical_history: [
      { date: "2026-08-21", frp: 110.2, detected_passes: 3, is_night: true },
      { date: "2026-08-22", frp: 115.8, detected_passes: 4, is_night: true },
      { date: "2026-08-23", frp: 122.4, detected_passes: 3, is_night: true },
      { date: "2026-08-24", frp: 125.0, detected_passes: 4, is_night: true },
      { date: "2026-08-25", frp: 127.3, detected_passes: 4, is_night: true },
      { date: "2026-08-26", frp: 128.5, detected_passes: 5, is_night: true }
    ]
  },
  {
    id: "evt-ang-002",
    location: { latitude: 20.84, longitude: 85.15 },
    classification: "Industrial Source",
    confidence: 91,
    risk_level: "High",
    frp: 145.2,
    brightness_temperature: 348.1,
    persistence_days: 28,
    night_ratio: 0.88,
    cluster_size: 8,
    distance_to_industry: 250,
    land_cover: "Heavy Metallurgy",
    nearby_facility: "Angul-Talcher Steel & Thermal Power Zone",
    reasoning: [
      "Thermal radiation consistent with blast furnace slag dumping",
      "Persistent coordinate history for 28 days",
      "Strong localized FRP exceeding 140 MW",
      "Proximity to OpenStreetMap verified metal smelter"
    ],
    feature_weights: [
      { feature: "Proximity to Facility", importance: 35, description: "Inside Talcher heavy industrial belt" },
      { feature: "FRP Intensity", importance: 30, description: "Extreme thermal output characteristic of smelting" },
      { feature: "Persistence", importance: 25, description: "Multi-week recurrence" },
      { feature: "Night Ratio", importance: 10, description: "Consistent 24-hour manufacturing operations" }
    ],
    timestamp: "2026-08-26T17:15:00Z",
    satellite: "NOAA-20 / VIIRS",
    historical_history: [
      { date: "2026-08-21", frp: 130.1, detected_passes: 3, is_night: true },
      { date: "2026-08-22", frp: 134.5, detected_passes: 4, is_night: true },
      { date: "2026-08-23", frp: 138.0, detected_passes: 3, is_night: false },
      { date: "2026-08-24", frp: 142.1, detected_passes: 4, is_night: true },
      { date: "2026-08-25", frp: 144.0, detected_passes: 4, is_night: true },
      { date: "2026-08-26", frp: 145.2, detected_passes: 5, is_night: true }
    ]
  },
  {
    id: "evt-bom-003",
    location: { latitude: 19.12, longitude: 72.88 },
    classification: "Gas Flare",
    confidence: 96,
    risk_level: "Medium",
    frp: 85.0,
    brightness_temperature: 335.4,
    persistence_days: 45,
    night_ratio: 0.98,
    cluster_size: 2,
    distance_to_industry: 90,
    land_cover: "Offshore / Coastal Processing",
    nearby_facility: "Mumbai High Offshore Processing Terminal",
    reasoning: [
      "Flare stack spatial point signature with minimal spatial spread",
      "Continuous flaring detected across 45-day satellite monitoring",
      "98% night detection ratio",
      "Matches known historical flare coordinates catalog"
    ],
    feature_weights: [
      { feature: "Historical Flare Catalog", importance: 45, description: "Exact match in NOAA/VIIRS flare database" },
      { feature: "Point Cluster Size", importance: 25, description: "Isolated single-pixel point source" },
      { feature: "Night Dominance", importance: 20, description: "Sharp night contrast" },
      { feature: "FRP Stability", importance: 10, description: "Low variance in heat radiation" }
    ],
    timestamp: "2026-08-26T19:00:00Z",
    satellite: "Suomi NPP / VIIRS",
    historical_history: [
      { date: "2026-08-21", frp: 82.0, detected_passes: 2, is_night: true },
      { date: "2026-08-22", frp: 84.1, detected_passes: 3, is_night: true },
      { date: "2026-08-23", frp: 86.0, detected_passes: 2, is_night: true },
      { date: "2026-08-24", frp: 83.5, detected_passes: 3, is_night: true },
      { date: "2026-08-25", frp: 84.9, detected_passes: 3, is_night: true },
      { date: "2026-08-26", frp: 85.0, detected_passes: 4, is_night: true }
    ]
  },
  {
    id: "evt-sim-004",
    location: { latitude: 21.95, longitude: 86.40 },
    classification: "Natural Fire",
    confidence: 88,
    risk_level: "High",
    frp: 210.0,
    brightness_temperature: 355.6,
    persistence_days: 2,
    night_ratio: 0.25,
    cluster_size: 24,
    distance_to_industry: 14200,
    land_cover: "Dense Forest",
    nearby_facility: "Similipal Biosphere Reserve",
    reasoning: [
      "Broad spatial cluster spreading across 24 adjacent pixels",
      "Low persistence (2 days) indicating rapid active wildfire spread",
      "Dominant daytime detection peak (75% daytime activity)",
      "Located over 14 km from any registered industrial facility"
    ],
    feature_weights: [
      { feature: "Cluster Size", importance: 40, description: "Large perimeter expanding wildfire front" },
      { feature: "Distance to Industry", importance: 30, description: "Remote protected forest land cover" },
      { feature: "Temporal Dynamics", importance: 20, description: "Sudden spike with no prior month history" },
      { feature: "Daytime Activity", importance: 10, description: "Solar heating accelerating natural combustion" }
    ],
    timestamp: "2026-08-26T14:40:00Z",
    satellite: "Terra / MODIS",
    historical_history: [
      { date: "2026-08-25", frp: 75.0, detected_passes: 2, is_night: false },
      { date: "2026-08-26", frp: 210.0, detected_passes: 6, is_night: false }
    ]
  },
  {
    id: "evt-pun-005",
    location: { latitude: 30.70, longitude: 75.85 },
    classification: "Crop Burning",
    confidence: 85,
    risk_level: "Medium",
    frp: 62.4,
    brightness_temperature: 326.0,
    persistence_days: 1,
    night_ratio: 0.10,
    cluster_size: 14,
    distance_to_industry: 6800,
    land_cover: "Agricultural Land",
    nearby_facility: "Ludhiana Agricultural Belt",
    reasoning: [
      "Stubble burning signature with rapid 1-day lifecycle",
      "High concentration in WorldCover agricultural zone",
      "90% daytime satellite detection",
      "Moderate individual FRP output (62 MW)"
    ],
    feature_weights: [
      { feature: "Land Cover Type", importance: 45, description: "Classified cropland in ESA WorldCover" },
      { feature: "Short Persistence", importance: 30, description: "Transient seasonal agricultural clearing" },
      { feature: "Daytime Ratio", importance: 15, description: "Afternoon agricultural field burning" },
      { feature: "Moderate FRP", importance: 10, description: "Open biomass combustion profile" }
    ],
    timestamp: "2026-08-26T13:20:00Z",
    satellite: "Aqua / MODIS",
    historical_history: [
      { date: "2026-08-26", frp: 62.4, detected_passes: 3, is_night: false }
    ]
  },
  {
    id: "evt-unk-006",
    location: { latitude: 23.45, longitude: 87.28 },
    classification: "Unknown",
    confidence: 52,
    risk_level: "Low",
    frp: 34.0,
    brightness_temperature: 318.5,
    persistence_days: 1,
    night_ratio: 0.50,
    cluster_size: 1,
    distance_to_industry: 3100,
    land_cover: "Mixed Shrubland",
    nearby_facility: "Durgapur Outskirts",
    reasoning: [
      "Borderline FRP threshold near sensor detection limit",
      "Ambiguous land-cover classification and isolated single-pixel hit",
      "Further satellite passes required for definitive classification"
    ],
    feature_weights: [
      { feature: "Low Signal-to-Noise", importance: 50, description: "FRP below reliable threshold" },
      { feature: "Indeterminate Context", importance: 30, description: "Mixed terrain profile" },
      { feature: "Insufficient History", importance: 20, description: "Single isolated pass" }
    ],
    timestamp: "2026-08-26T16:05:00Z",
    satellite: "NOAA-20 / VIIRS",
    historical_history: [
      { date: "2026-08-26", frp: 34.0, detected_passes: 1, is_night: false }
    ]
  }
];

export const MOCK_HOTSPOT_COLLECTION: HotspotFeatureCollection = {
  type: "FeatureCollection",
  features: MOCK_THERMAL_EVENTS.map((event) => ({
    type: "Feature",
    geometry: {
      type: "Point",
      coordinates: [event.location.longitude, event.location.latitude]
    },
    properties: event
  }))
};
