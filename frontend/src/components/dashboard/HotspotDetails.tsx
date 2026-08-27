"use client";

import React from "react";
import { ThermalEvent } from "@/types/thermal";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExplainabilityPanel } from "./ExplainabilityPanel";
import { ThermalTrendsChart } from "./ThermalTrendsChart";
import {
  MapPin,
  Flame,
  Clock,
  Building2,
  Thermometer,
  Layers,
  Moon,
  ExternalLink,
  Download,
} from "lucide-react";

interface HotspotDetailsProps {
  event: ThermalEvent | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenSimulator?: (event: ThermalEvent) => void;
}

export function HotspotDetails({
  event,
  isOpen,
  onClose,
  onOpenSimulator,
}: HotspotDetailsProps) {
  if (!event) return null;

  const handleExportGeoJSON = () => {
    const geojson = {
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [event.location.longitude, event.location.latitude],
      },
      properties: event,
    };
    const blob = new Blob([JSON.stringify(geojson, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${event.id}.geojson`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-md md:max-w-lg p-0 flex flex-col bg-white overflow-hidden z-[600]"
      >
        {/* Sheet Header */}
        <SheetHeader className="p-4 sm:p-5 border-b border-border/80 bg-slate-50/70">
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <Badge
              variant="outline"
              className="text-xs font-semibold px-2.5 py-0.5 bg-white shadow-xs"
            >
              {event.classification}
            </Badge>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-mono font-bold bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                {event.confidence}% AI Confidence
              </span>
              <Badge
                className={`text-xs ${
                  event.risk_level === "High"
                    ? "bg-red-600 hover:bg-red-700"
                    : event.risk_level === "Medium"
                    ? "bg-amber-600 hover:bg-amber-700"
                    : "bg-slate-600"
                }`}
              >
                {event.risk_level} Risk
              </Badge>
            </div>
          </div>

          <SheetTitle className="text-base sm:text-lg font-bold text-foreground text-left">
            {event.nearby_facility || `${event.land_cover} Thermal Event`}
          </SheetTitle>
          <SheetDescription className="text-xs text-muted-foreground flex items-center gap-1.5 text-left">
            <MapPin className="size-3.5 shrink-0 text-slate-500" />
            <span className="font-mono">
              {event.location.latitude.toFixed(4)}°N, {event.location.longitude.toFixed(4)}°E
            </span>
            <span>&bull;</span>
            <span className="font-mono">ID: {event.id}</span>
          </SheetDescription>
        </SheetHeader>

        {/* Sheet Body with Tabs */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          <Tabs defaultValue="telemetry" className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-slate-100 p-1 rounded-xl">
              <TabsTrigger value="telemetry" className="text-xs font-medium rounded-lg">
                Telemetry
              </TabsTrigger>
              <TabsTrigger value="explainability" className="text-xs font-medium rounded-lg">
                AI Reasoning
              </TabsTrigger>
              <TabsTrigger value="trends" className="text-xs font-medium rounded-lg">
                Temporal Trends
              </TabsTrigger>
            </TabsList>

            {/* Tab 1: Telemetry */}
            <TabsContent value="telemetry" className="space-y-4 pt-3">
              <div className="grid grid-cols-2 gap-2.5">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                  <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground mb-1">
                    <Flame className="size-3.5 text-orange-500" />
                    <span>Fire Radiative Power</span>
                  </div>
                  <div className="text-xl font-bold font-mono text-foreground">
                    {event.frp} <span className="text-xs font-normal text-muted-foreground">MW</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                  <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground mb-1">
                    <Thermometer className="size-3.5 text-red-500" />
                    <span>Brightness Temp</span>
                  </div>
                  <div className="text-xl font-bold font-mono text-foreground">
                    {event.brightness_temperature}{" "}
                    <span className="text-xs font-normal text-muted-foreground">K</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                  <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground mb-1">
                    <Clock className="size-3.5 text-slate-500" />
                    <span>Persistence Record</span>
                  </div>
                  <div className="text-xl font-bold font-mono text-foreground">
                    {event.persistence_days}{" "}
                    <span className="text-xs font-normal text-muted-foreground">days</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                  <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground mb-1">
                    <Moon className="size-3.5 text-indigo-500" />
                    <span>Night Activity Ratio</span>
                  </div>
                  <div className="text-xl font-bold font-mono text-foreground">
                    {Math.round(event.night_ratio * 100)}%
                  </div>
                </div>
              </div>

              {/* Spatial Context Details */}
              <div className="p-3.5 rounded-xl border border-border bg-white shadow-xs space-y-2.5">
                <div className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <Building2 className="size-4 text-primary" />
                  <span>Infrastructure Proximity</span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-muted-foreground text-[11px] block">Nearest Industry</span>
                    <span className="font-semibold text-foreground font-mono">
                      {event.distance_to_industry} meters
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-[11px] block">Satellite Cluster</span>
                    <span className="font-semibold text-foreground font-mono">
                      {event.cluster_size} adjacent pixels
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-[11px] block">Land Cover (ESA)</span>
                    <span className="font-semibold text-foreground">{event.land_cover}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-[11px] block">Detection Time</span>
                    <span className="font-semibold text-foreground font-mono">
                      {new Date(event.timestamp).toUTCString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick Actions in Tab */}
              <div className="flex items-center gap-2 pt-1">
                {onOpenSimulator && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 text-xs gap-1.5 rounded-xl"
                    onClick={() => onOpenSimulator(event)}
                  >
                    <ExternalLink className="size-3.5" />
                    Simulate / Re-Predict
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 text-xs gap-1.5 rounded-xl"
                  onClick={handleExportGeoJSON}
                >
                  <Download className="size-3.5" />
                  Export GeoJSON
                </Button>
              </div>
            </TabsContent>

            {/* Tab 2: Explainable AI */}
            <TabsContent value="explainability" className="pt-3">
              <ExplainabilityPanel event={event} />
            </TabsContent>

            {/* Tab 3: Temporal Trends */}
            <TabsContent value="trends" className="pt-3 space-y-3">
              <ThermalTrendsChart event={event} />
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-muted-foreground">
                <strong>Observation Notes:</strong> Consistent daily satellite overpasses (Aqua/Terra MODIS & Suomi-NPP VIIRS) verify continuous thermal output.
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </SheetContent>
    </Sheet>
  );
}
