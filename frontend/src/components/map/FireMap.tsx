"use client";

import React, { useEffect, useRef, useState } from "react";
import { ThermalEvent, ClassificationType } from "@/types/thermal";
import { MapControls } from "./MapControls";
import { MapLegend } from "./MapLegend";
import "leaflet/dist/leaflet.css";

interface FireMapProps {
  events: ThermalEvent[];
  selectedEvent: ThermalEvent | null;
  onSelectEvent: (event: ThermalEvent) => void;
  focusedEventId?: string | null;
}

const OSM_ENGLISH_TILES = {
  // Wikimedia's international OSM style accepts the requested label language.
  url: "https://maps.wikimedia.org/osm-intl/{z}/{x}/{y}.png?lang=en",
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a> &middot; Tiles by <a href="https://maps.wikimedia.org/">Wikimedia Maps</a>',
  maxZoom: 18,
};

function getMarkerColors(classification: ClassificationType): {
  coreColor: string;
  glowColor: string;
  badgeBg: string;
  textColor: string;
} {
  switch (classification) {
    case "Industrial Source":
      return {
        coreColor: "#DC2626", // Red-600
        glowColor: "rgba(220, 38, 38, 0.35)",
        badgeBg: "#FEF2F2",
        textColor: "#991B1B",
      };
    case "Natural Fire":
    case "Wildfire":
      return {
        coreColor: "#2563EB", // Blue-600
        glowColor: "rgba(37, 99, 235, 0.35)",
        badgeBg: "#EFF6FF",
        textColor: "#1E40AF",
      };
    case "Gas Flare":
      return {
        coreColor: "#D97706", // Amber-600
        glowColor: "rgba(217, 119, 6, 0.35)",
        badgeBg: "#FFFBEB",
        textColor: "#92400E",
      };
    default:
      return {
        coreColor: "#6B7280", // Slate-500
        glowColor: "rgba(107, 114, 128, 0.25)",
        badgeBg: "#F8FAFC",
        textColor: "#374151",
      };
  }
}

export function FireMap({
  events,
  selectedEvent,
  onSelectEvent,
  focusedEventId,
}: FireMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapInstanceRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const markerGroupRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const overlayGroupRef = useRef<any>(null);

  const [showHeatmap, setShowHeatmap] = useState<boolean>(true);
  const [showOSMIndustry, setShowOSMIndustry] = useState<boolean>(true);
  const [isMapReady, setIsMapReady] = useState(false);

  // Initialize map instance
  useEffect(() => {
    let isMounted = true;

    async function initMap() {
      if (!mapContainerRef.current || mapInstanceRef.current) return;

      const L = await import("leaflet");

      if (!isMounted || !mapContainerRef.current) return;

      // Center of India overview
      const map = L.map(mapContainerRef.current, {
        center: [22.5, 78.5],
        zoom: 5,
        zoomControl: false,
        attributionControl: false,
      });

      const tileLayer = L.tileLayer(OSM_ENGLISH_TILES.url, {
        attribution: OSM_ENGLISH_TILES.attribution,
        maxZoom: OSM_ENGLISH_TILES.maxZoom,
      }).addTo(map);

      // Attribution
      L.control.attribution({ position: "bottomright", prefix: false }).addTo(map);

      const markerGroup = L.layerGroup().addTo(map);
      const overlayGroup = L.layerGroup().addTo(map);

      mapInstanceRef.current = map;
      markerGroupRef.current = markerGroup;
      overlayGroupRef.current = overlayGroup;

      setIsMapReady(true);
    }

    initMap();

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Render Hotspots & Overlays
  useEffect(() => {
    if (!isMapReady || !mapInstanceRef.current || !markerGroupRef.current) return;

    import("leaflet").then((L) => {
      const markerGroup = markerGroupRef.current;
      const overlayGroup = overlayGroupRef.current;

      markerGroup.clearLayers();
      overlayGroup.clearLayers();

      events.forEach((event) => {
        const { latitude, longitude } = event.location;
        const colors = getMarkerColors(event.classification);
        const isSelected = selectedEvent?.id === event.id || focusedEventId === event.id;

        // Thermal Heat Halo
        if (showHeatmap) {
          const radiusMeters = Math.min(Math.max(event.frp * 200, 8000), 45000);
          L.circle([latitude, longitude], {
            radius: radiusMeters,
            color: colors.coreColor,
            fillColor: colors.coreColor,
            fillOpacity: 0.12,
            weight: 1,
            dashArray: "4, 4",
          }).addTo(overlayGroup);
        }

        // Industrial Facility Proximity Ring
        if (showOSMIndustry && event.distance_to_industry <= 1000) {
          L.circle([latitude, longitude], {
            radius: Math.max(event.distance_to_industry, 300),
            color: "#475569",
            fillColor: "#94A3B8",
            fillOpacity: 0.08,
            weight: 1.5,
          }).addTo(overlayGroup);
        }

        // Custom HTML Marker Icon
        const markerHtml = `
          <div class="relative flex items-center justify-center cursor-pointer group" style="width: 44px; height: 44px;">
            <div class="absolute inset-0 rounded-full animate-ping opacity-30" style="background-color: ${colors.coreColor}; animation-duration: ${isSelected ? "1.5s" : "3s"};"></div>
            <div class="relative flex items-center justify-center rounded-full shadow-lg transition-transform transform group-hover:scale-110 ${isSelected ? "scale-125 ring-4 ring-white shadow-xl" : "ring-2 ring-white"}" style="width: 26px; height: 26px; background-color: ${colors.coreColor};">
              <span class="text-[10px] font-bold text-white tracking-tighter">${Math.round(event.confidence)}%</span>
            </div>
            ${
              isSelected
                ? `<div class="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap bg-foreground text-background text-[10px] font-semibold px-2 py-0.5 rounded-full shadow-md z-50">
                    ${event.classification} (${event.frp} MW)
                   </div>`
                : ""
            }
          </div>
        `;

        const customIcon = L.divIcon({
          html: markerHtml,
          className: "custom-thermal-marker",
          iconSize: [44, 44],
          iconAnchor: [22, 22],
        });

        const marker = L.marker([latitude, longitude], { icon: customIcon });

        marker.on("click", () => {
          onSelectEvent(event);
        });

        // Hover popup tooltip
        const popupContent = `
          <div style="font-family: inherit; min-width: 180px; padding: 4px;">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;">
              <span style="font-weight: 700; color: ${colors.textColor}; font-size: 12px;">${event.classification}</span>
              <span style="font-size: 10px; background: ${colors.badgeBg}; color: ${colors.textColor}; padding: 1px 6px; border-radius: 9999px; font-weight: 600;">${event.risk_level} Risk</span>
            </div>
            <div style="font-size: 11px; color: #4b5563; margin-bottom: 2px;">
              <strong>FRP:</strong> ${event.frp} MW | <strong>Conf:</strong> ${event.confidence}%
            </div>
            <div style="font-size: 10px; color: #6b7280;">
              ${event.nearby_facility || `${event.land_cover}`}
            </div>
          </div>
        `;

        marker.bindTooltip(popupContent, {
          direction: "top",
          offset: [0, -18],
          opacity: 0.98,
          className: "custom-map-tooltip",
        });

        marker.addTo(markerGroup);
      });
    });
  }, [events, selectedEvent, focusedEventId, isMapReady, showHeatmap, showOSMIndustry, onSelectEvent]);

  // Fly to selected event when requested
  useEffect(() => {
    if (!mapInstanceRef.current || !selectedEvent) return;
    const { latitude, longitude } = selectedEvent.location;
    mapInstanceRef.current.flyTo([latitude, longitude], 12, {
      duration: 1.2,
      easeLinearity: 0.25,
    });
  }, [selectedEvent]);

  const handleZoomIn = () => {
    if (mapInstanceRef.current) mapInstanceRef.current.zoomIn();
  };

  const handleZoomOut = () => {
    if (mapInstanceRef.current) mapInstanceRef.current.zoomOut();
  };

  const handleResetView = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([22.5, 78.5], 5, { duration: 1.0 });
    }
  };

  return (
    <div className="relative w-full h-full min-h-[480px] bg-slate-100 rounded-2xl overflow-hidden border border-border shadow-sm">
      <div ref={mapContainerRef} className="w-full h-full z-[10]" />

      <MapControls
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onResetView={handleResetView}
        showHeatmap={showHeatmap}
        onToggleHeatmap={() => setShowHeatmap((prev) => !prev)}
        showOSMIndustry={showOSMIndustry}
        onToggleOSMIndustry={() => setShowOSMIndustry((prev) => !prev)}
      />

      <MapLegend />
    </div>
  );
}
