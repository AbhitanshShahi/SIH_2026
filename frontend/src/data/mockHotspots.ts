import { HotspotFeatureCollection, ThermalEvent } from "@/types/thermal";

export const MOCK_THERMAL_EVENTS: ThermalEvent[] = [
  {
    id: "evt-tal-001",
    location: { latitude: 21.0944, longitude: 85.0742 },
    classification: "Industrial Source",
    confidence: 94,
    risk_level: "High",
    frp: 168.4,
    brightness_temperature: 352.6,
    persistence_days: 36,
    night_ratio: 0.94,
    cluster_size: 6,
    distance_to_industry: 120,
    land_cover: "Thermal Power & Coal Infrastructure",
    nearby_facility: "Talcher Super Thermal Power Station (NTPC Kaniha)",
    reasoning: [
      "High thermal persistence detected across 36 consecutive days",
      "Located within 120m of NTPC Kaniha 3000 MW coal power complex",
      "94% nighttime thermal signature dominance characteristic of baseline generation",
      "Intense localized thermal heat flux exceeding 165 MW"
    ],
    feature_weights: [
      { feature: "Proximity to Facility", importance: 38, description: "Direct proximity to OpenStreetMap verified power plant" },
      { feature: "Persistence Days", importance: 32, description: "Recurrent daily heat anomaly at exact coordinate" },
      { feature: "Night/Day Ratio", importance: 18, description: "Uninterrupted continuous combustion cycle" },
      { feature: "FRP Intensity", importance: 12, description: "Heavy thermal load consistent with power generation" }
    ],
    timestamp: "2026-08-27T17:30:00Z",
    historical_history: [
      { date: "2026-08-22", frp: 155.2, detected_passes: 4, is_night: true },
      { date: "2026-08-23", frp: 160.8, detected_passes: 4, is_night: true },
      { date: "2026-08-24", frp: 162.4, detected_passes: 5, is_night: true },
      { date: "2026-08-25", frp: 165.0, detected_passes: 4, is_night: true },
      { date: "2026-08-26", frp: 167.3, detected_passes: 5, is_night: true },
      { date: "2026-08-27", frp: 168.4, detected_passes: 5, is_night: true }
    ]
  },
  {
    id: "evt-ang-002",
    location: { latitude: 20.8531, longitude: 85.1938 },
    classification: "Industrial Source",
    confidence: 92,
    risk_level: "High",
    frp: 146.2,
    brightness_temperature: 348.5,
    persistence_days: 29,
    night_ratio: 0.90,
    cluster_size: 7,
    distance_to_industry: 150,
    land_cover: "Aluminium Metallurgy & Smelting",
    nearby_facility: "NALCO Smelter & Captive Power Complex, Angul",
    reasoning: [
      "Thermal radiation consistent with continuous aluminium potline smelting",
      "Persistent coordinate history for 29 days",
      "Concentrated FRP output exceeding 145 MW",
      "Proximity to OpenStreetMap verified NALCO industrial polygon"
    ],
    feature_weights: [
      { feature: "Proximity to Facility", importance: 36, description: "Inside NALCO Angul heavy industrial buffer" },
      { feature: "FRP Intensity", importance: 30, description: "Extreme thermal output characteristic of potline smelting" },
      { feature: "Persistence", importance: 24, description: "Multi-week continuous recurrence" },
      { feature: "Night Ratio", importance: 10, description: "24/7 continuous metallurgical operations" }
    ],
    timestamp: "2026-08-27T16:15:00Z",
    historical_history: [
      { date: "2026-08-22", frp: 138.1, detected_passes: 3, is_night: true },
      { date: "2026-08-23", frp: 140.5, detected_passes: 4, is_night: true },
      { date: "2026-08-24", frp: 142.0, detected_passes: 4, is_night: false },
      { date: "2026-08-25", frp: 143.5, detected_passes: 4, is_night: true },
      { date: "2026-08-26", frp: 145.0, detected_passes: 5, is_night: true },
      { date: "2026-08-27", frp: 146.2, detected_passes: 5, is_night: true }
    ]
  },
  {
    id: "evt-mcl-003",
    location: { latitude: 20.9602, longitude: 85.1480 },
    classification: "Industrial Source",
    confidence: 89,
    risk_level: "High",
    frp: 114.0,
    brightness_temperature: 341.2,
    persistence_days: 22,
    night_ratio: 0.85,
    cluster_size: 5,
    distance_to_industry: 90,
    land_cover: "Open Cast Coal Mine",
    nearby_facility: "MCL Jagannath Coal Mine, Talcher",
    reasoning: [
      "Sub-surface coal seam spontaneous heating and overburden thermal footprint",
      "Persistent satellite detections in Mahanadi Coalfields extraction zone",
      "Consistent night thermal anomalies detected over 22 days",
      "Direct match with OpenStreetMap active mining boundary"
    ],
    feature_weights: [
      { feature: "Mining Boundary", importance: 40, description: "Located inside verified Open Cast Coal Mine boundary" },
      { feature: "Persistence", importance: 30, description: "Multi-week thermal manifestation" },
      { feature: "FRP Footprint", importance: 20, description: "Moderate-high thermal intensity in coal strata" },
      { feature: "Night Detection", importance: 10, description: "Strong infrared contrast during satellite night passes" }
    ],
    timestamp: "2026-08-27T17:50:00Z",
    historical_history: [
      { date: "2026-08-22", frp: 105.0, detected_passes: 3, is_night: true },
      { date: "2026-08-23", frp: 108.5, detected_passes: 3, is_night: true },
      { date: "2026-08-24", frp: 110.0, detected_passes: 4, is_night: true },
      { date: "2026-08-25", frp: 112.5, detected_passes: 3, is_night: true },
      { date: "2026-08-26", frp: 113.0, detected_passes: 4, is_night: true },
      { date: "2026-08-27", frp: 114.0, detected_passes: 4, is_night: true }
    ]
  },
  {
    id: "evt-jsp-004",
    location: { latitude: 20.8835, longitude: 85.0489 },
    classification: "Industrial Source",
    confidence: 95,
    risk_level: "High",
    frp: 158.0,
    brightness_temperature: 350.4,
    persistence_days: 31,
    night_ratio: 0.91,
    cluster_size: 6,
    distance_to_industry: 110,
    land_cover: "Integrated Steel Plant",
    nearby_facility: "Jindal Steel & Power Ltd (JSPL) Angul Plant",
    reasoning: [
      "Intense point source heat from blast furnace and DRI steel making",
      "Persistent 31-day thermal record at JSPL industrial site",
      "91% night detection ratio verifying continuous 24/7 manufacturing",
      "High FRP (158 MW) with high satellite confidence"
    ],
    feature_weights: [
      { feature: "Proximity to Facility", importance: 37, description: "Inside JSPL Angul heavy industrial boundary" },
      { feature: "Persistence", importance: 33, description: "Persistent multi-week blast furnace thermal emission" },
      { feature: "Night Dominance", importance: 18, description: "Continuous manufacturing schedule" },
      { feature: "Thermal Radiation", importance: 12, description: "Extremely high temperature gradient" }
    ],
    timestamp: "2026-08-27T18:05:00Z",
    historical_history: [
      { date: "2026-08-22", frp: 148.0, detected_passes: 4, is_night: true },
      { date: "2026-08-23", frp: 150.2, detected_passes: 4, is_night: true },
      { date: "2026-08-24", frp: 152.0, detected_passes: 5, is_night: true },
      { date: "2026-08-25", frp: 154.5, detected_passes: 4, is_night: true },
      { date: "2026-08-26", frp: 156.8, detected_passes: 5, is_night: true },
      { date: "2026-08-27", frp: 158.0, detected_passes: 5, is_night: true }
    ]
  },
  {
    id: "evt-gmr-005",
    location: { latitude: 20.9032, longitude: 85.2915 },
    classification: "Industrial Source",
    confidence: 88,
    risk_level: "Medium",
    frp: 96.5,
    brightness_temperature: 338.0,
    persistence_days: 18,
    night_ratio: 0.82,
    cluster_size: 4,
    distance_to_industry: 220,
    land_cover: "Thermal Power Generation",
    nearby_facility: "GMR Kamalanga Thermal Power Station, Dhenkanal",
    reasoning: [
      "Combustion thermal signatures from 1050 MW coal thermal station",
      "Persistent 18-day thermal anomaly history",
      "Located within 220m of Kamalanga power infrastructure",
      "Moderate-high thermal output with low spatial dispersion"
    ],
    feature_weights: [
      { feature: "Proximity to Facility", importance: 35, description: "Proximity to GMR thermal generation site" },
      { feature: "Persistence", importance: 30, description: "Multi-week active thermal history" },
      { feature: "Land Cover", importance: 20, description: "Industrial utility designation" },
      { feature: "Night Ratio", importance: 15, description: "Baseload power operation" }
    ],
    timestamp: "2026-08-27T17:10:00Z",
    historical_history: [
      { date: "2026-08-23", frp: 90.0, detected_passes: 3, is_night: true },
      { date: "2026-08-24", frp: 92.5, detected_passes: 3, is_night: true },
      { date: "2026-08-25", frp: 94.0, detected_passes: 4, is_night: true },
      { date: "2026-08-26", frp: 95.8, detected_passes: 4, is_night: true },
      { date: "2026-08-27", frp: 96.5, detected_passes: 4, is_night: true }
    ]
  },
  {
    id: "evt-flr-006",
    location: { latitude: 20.9250, longitude: 85.1650 },
    classification: "Gas Flare",
    confidence: 96,
    risk_level: "Medium",
    frp: 82.5,
    brightness_temperature: 334.8,
    persistence_days: 42,
    night_ratio: 0.98,
    cluster_size: 1,
    distance_to_industry: 80,
    land_cover: "Chemical & Gas Processing",
    nearby_facility: "Talcher Industrial Gasification Complex",
    reasoning: [
      "Isolated single-pixel point thermal signature matching flare stack geometry",
      "Continuous flaring detected across 42 consecutive monitoring days",
      "98% night detection ratio with sharp thermal gradient",
      "Matches historical flare coordinate catalog"
    ],
    feature_weights: [
      { feature: "Historical Flare Match", importance: 45, description: "Point-source flare characteristics" },
      { feature: "Point Cluster Size", importance: 25, description: "Single pixel concentrated signature" },
      { feature: "Night Ratio", importance: 20, description: "Dominant night emission" },
      { feature: "FRP Stability", importance: 10, description: "Uniform thermal intensity" }
    ],
    timestamp: "2026-08-27T18:15:00Z",
    historical_history: [
      { date: "2026-08-22", frp: 80.0, detected_passes: 3, is_night: true },
      { date: "2026-08-23", frp: 81.2, detected_passes: 3, is_night: true },
      { date: "2026-08-24", frp: 81.8, detected_passes: 4, is_night: true },
      { date: "2026-08-25", frp: 82.0, detected_passes: 3, is_night: true },
      { date: "2026-08-26", frp: 82.3, detected_passes: 4, is_night: true },
      { date: "2026-08-27", frp: 82.5, detected_passes: 4, is_night: true }
    ]
  },
  {
    id: "evt-sim-007",
    location: { latitude: 21.9500, longitude: 86.4000 },
    classification: "Natural Fire",
    confidence: 87,
    risk_level: "High",
    frp: 195.0,
    brightness_temperature: 354.0,
    persistence_days: 2,
    night_ratio: 0.25,
    cluster_size: 22,
    distance_to_industry: 15400,
    land_cover: "Dense Deciduous Forest",
    nearby_facility: "Similipal National Park & Biosphere Reserve",
    reasoning: [
      "Broad spatial front spanning 22 adjacent satellite pixels in protected forest",
      "Low persistence (2 days) indicating active fast-moving wildfire front",
      "Dominant daytime detection peak (75% daytime activity)",
      "Located over 15 km from any industrial facility"
    ],
    feature_weights: [
      { feature: "Cluster Size", importance: 40, description: "Large expansive wildfire boundary" },
      { feature: "Distance to Industry", importance: 30, description: "Protected forest reserve location" },
      { feature: "Temporal Dynamics", importance: 20, description: "Sudden onset with high spatial spread" },
      { feature: "Daytime Activity", importance: 10, description: "Solar heating accelerating natural forest combustion" }
    ],
    timestamp: "2026-08-27T14:30:00Z",
    historical_history: [
      { date: "2026-08-26", frp: 80.0, detected_passes: 2, is_night: false },
      { date: "2026-08-27", frp: 195.0, detected_passes: 5, is_night: false }
    ]
  },
  {
    id: "evt-dhk-008",
    location: { latitude: 20.6800, longitude: 85.6000 },
    classification: "Crop Burning",
    confidence: 82,
    risk_level: "Medium",
    frp: 58.0,
    brightness_temperature: 324.5,
    persistence_days: 1,
    night_ratio: 0.10,
    cluster_size: 11,
    distance_to_industry: 5400,
    land_cover: "Agricultural Cropland",
    nearby_facility: "Dhenkanal Rural Agricultural Belt",
    reasoning: [
      "Seasonal crop residue clearing signature with rapid 1-day lifecycle",
      "Located in classified agricultural land cover",
      "90% daytime satellite pass detections",
      "Moderate individual FRP output (58 MW)"
    ],
    feature_weights: [
      { feature: "Land Cover Type", importance: 45, description: "Classified cropland in ESA WorldCover" },
      { feature: "Short Persistence", importance: 30, description: "Transient seasonal agricultural clearing" },
      { feature: "Daytime Ratio", importance: 15, description: "Afternoon agricultural field burning" },
      { feature: "Moderate FRP", importance: 10, description: "Open biomass combustion profile" }
    ],
    timestamp: "2026-08-27T13:40:00Z",
    historical_history: [
      { date: "2026-08-27", frp: 58.0, detected_passes: 3, is_night: false }
    ]
  },
  {
    id: "evt-unk-009",
    location: { latitude: 21.0200, longitude: 85.2100 },
    classification: "Unknown",
    confidence: 50,
    risk_level: "Low",
    frp: 28.5,
    brightness_temperature: 317.0,
    persistence_days: 1,
    night_ratio: 0.50,
    cluster_size: 1,
    distance_to_industry: 3200,
    land_cover: "Mixed Shrubland & Wasteland",
    nearby_facility: "Talcher-Kaniha Buffer Zone",
    reasoning: [
      "Low FRP near satellite sensor detection threshold",
      "Ambiguous spectral signature on mixed shrubland terrain",
      "Requires subsequent satellite passes to determine origin"
    ],
    feature_weights: [
      { feature: "Low Signal-to-Noise", importance: 50, description: "FRP below confident classification threshold" },
      { feature: "Mixed Terrain", importance: 30, description: "Ambiguous land cover spectral response" },
      { feature: "Single Pass", importance: 20, description: "No prior temporal history" }
    ],
    timestamp: "2026-08-27T15:20:00Z",
    historical_history: [
      { date: "2026-08-27", frp: 28.5, detected_passes: 1, is_night: false }
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
