"use client";

import React from "react";
import { ThermalEvent, getConfidenceLevel } from "@/types/thermal";
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
        className="z-[600] flex w-full flex-col overflow-hidden bg-white p-0 sm:max-w-md md:max-w-lg"
      >
        {/* Sheet Header */}
        <SheetHeader className="border-b border-border bg-white p-3 sm:p-6">
          <div className="mb-3 flex items-center justify-between gap-2">
            <Badge variant="outline" className="bg-muted px-2.5 py-0.5 text-xs font-normal">
              {event.classification}
            </Badge>
            <div className="flex items-center gap-1.5">
              <span className="rounded-xl bg-muted px-2.5 py-0.5 font-mono text-xs text-foreground">
                {getConfidenceLevel(event.confidence)}
              </span>
              <Badge
                className={`text-xs font-normal ${
                  event.risk_level === "High"
                    ? "bg-red-600 hover:bg-red-700"
                    : event.risk_level === "Medium"
                    ? "bg-amber-600 hover:bg-amber-700"
                    : "bg-primary"
                }`}
              >
                {event.risk_level} Risk
              </Badge>
            </div>
          </div>

          <SheetTitle className="text-left text-base font-normal text-foreground sm:text-lg">
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
        <div className="flex-1 space-y-3 overflow-y-auto p-3 sm:p-6">
          <Tabs defaultValue="telemetry" className="w-full">
            <TabsList className="grid h-11 w-full grid-cols-3 rounded-xl bg-muted p-1">
              <TabsTrigger value="telemetry" className="rounded-lg text-xs font-normal">
                Telemetry
              </TabsTrigger>
              <TabsTrigger value="explainability" className="rounded-lg text-xs font-normal">
                Reasoning
              </TabsTrigger>
              <TabsTrigger value="trends" className="rounded-lg text-xs font-normal">
                Trends
              </TabsTrigger>
            </TabsList>

            <TabsContent value="telemetry" className="space-y-3 pt-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-3xl border border-border bg-muted p-3">
                  <div className="mb-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Flame className="size-3.5" aria-hidden="true" />
                    <span>Fire radiative power</span>
                  </div>
                  <div className="font-mono text-xl text-foreground">
                    {event.frp} <span className="text-xs font-normal text-muted-foreground">MW</span>
                  </div>
                </div>

                <div className="rounded-3xl border border-border bg-muted p-3">
                  <div className="mb-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Thermometer className="size-3.5" aria-hidden="true" />
                    <span>Brightness temp</span>
                  </div>
                  <div className="font-mono text-xl text-foreground">
                    {event.brightness_temperature}{" "}
                    <span className="text-xs font-normal text-muted-foreground">K</span>
                  </div>
                </div>

                <div className="rounded-3xl border border-border bg-muted p-3">
                  <div className="mb-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Clock className="size-3.5" aria-hidden="true" />
                    <span>Persistence</span>
                  </div>
                  <div className="font-mono text-xl text-foreground">
                    {event.persistence_days}{" "}
                    <span className="text-xs font-normal text-muted-foreground">days</span>
                  </div>
                </div>

                <div className="rounded-3xl border border-border bg-muted p-3">
                  <div className="mb-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Moon className="size-3.5" aria-hidden="true" />
                    <span>Night activity</span>
                  </div>
                  <div className="font-mono text-xl text-foreground">
                    {Math.round(event.night_ratio * 100)}%
                  </div>
                </div>
              </div>

              <div className="space-y-3 rounded-3xl border border-border bg-white p-3 mira-shadow">
                <div className="flex items-center gap-1.5 text-sm text-foreground">
                  <Building2 className="size-4 text-primary" aria-hidden="true" />
                  <span>Infrastructure proximity</span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="mb-1 block text-[11px] text-muted-foreground">Nearest industry</span>
                    <span className="font-mono text-foreground">{event.distance_to_industry} meters</span>
                  </div>
                  <div>
                    <span className="mb-1 block text-[11px] text-muted-foreground">Satellite cluster</span>
                    <span className="font-mono text-foreground">{event.cluster_size} pixels</span>
                  </div>
                  <div>
                    <span className="mb-1 block text-[11px] text-muted-foreground">Land cover</span>
                    <span className="text-foreground">{event.land_cover}</span>
                  </div>
                  <div>
                    <span className="mb-1 block text-[11px] text-muted-foreground">Detection time</span>
                    <span className="font-mono text-foreground">
                      {new Date(event.timestamp).toUTCString()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-1">
                {onOpenSimulator && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-11 flex-1 rounded-xl text-xs font-normal"
                    onClick={() => onOpenSimulator(event)}
                  >
                    <ExternalLink className="size-3.5" />
                    Simulate
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  className="h-11 flex-1 rounded-xl text-xs font-normal"
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
              <div className="rounded-3xl border border-border bg-muted p-3 text-xs text-muted-foreground">
                <strong>Observation Notes:</strong> Consistent daily satellite overpasses (Aqua/Terra MODIS & Suomi-NPP VIIRS) verify continuous thermal output.
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </SheetContent>
    </Sheet>
  );
}
