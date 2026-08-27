"use client";

import React, { useEffect, useState, useMemo } from "react";
import dynamic from "next/dynamic";
import { ThermalEvent, FilterOptions } from "@/types/thermal";
import { fetchHotspots, computeDashboardStats } from "@/services/hotspotService";
import { syncLiveTelemetry } from "@/services/liveService";
import { Header } from "@/components/shared/Header";
import { FilterBar } from "@/components/shared/FilterBar";
import { Statistics } from "@/components/dashboard/Statistics";
import { AnalyticsDashboard } from "@/components/dashboard/AnalyticsDashboard";
import { ThermalEventCard } from "@/components/dashboard/ThermalEventCard";
import { HotspotDetails } from "@/components/dashboard/HotspotDetails";
import { EventTable } from "@/components/dashboard/EventTable";
import { PredictionSimulator } from "@/components/shared/PredictionSimulator";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Map as MapIcon, Table as TableIcon, BarChart3, Radio, RefreshCw, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";

// Dynamically import FireMap to prevent Leaflet SSR issues
const FireMap = dynamic(
  () => import("@/components/map/FireMap").then((mod) => mod.FireMap),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full min-h-[500px] w-full flex-col items-center justify-center rounded-3xl border border-border bg-muted">
        <div className="mb-3 size-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <span className="text-xs text-muted-foreground">Loading map…</span>
      </div>
    ),
  }
);

export default function DashboardPage() {
  const [allEvents, setAllEvents] = useState<ThermalEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<ThermalEvent | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState<boolean>(false);
  const [isSimulatorOpen, setIsSimulatorOpen] = useState<boolean>(false);
  const [simulatorInitialEvent, setSimulatorInitialEvent] = useState<ThermalEvent | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("map");

  const [filters, setFilters] = useState<FilterOptions>({
    classification: "All",
    riskLevel: "All",
    region: "angul",
    minFRP: 0,
    frpLevel: "All",
    minConfidence: 0,
    satellite: "All",
    searchQuery: "",
  });

  // Load initial hotspots
  const loadData = async () => {
    setIsLoading(true);
    setConnectionError(null);
    try {
      const collection = await fetchHotspots({
        region: filters.region,
        minFRP: filters.minFRP,
      });
      const events = collection.features.map((f) => f.properties);
      setAllEvents(events);
      if (events.length > 0 && !selectedEvent) {
        setSelectedEvent(events[0]);
      }
    } catch (err) {
      console.error("Failed to load hotspots:", err);
      setAllEvents([]);
      setConnectionError("Unable to load backend telemetry. Confirm the API is running at the configured NEXT_PUBLIC_API_URL.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Loading remote state is the intentional purpose of this synchronization effect.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.region, filters.minFRP]);

  // Client-side filtering
  const filteredEvents = useMemo(() => {
    return allEvents.filter((event) => {
      // Classification filter
      if (
        filters.classification !== "All" &&
        event.classification !== filters.classification
      ) {
        return false;
      }

      // Risk level filter
      if (filters.riskLevel !== "All" && event.risk_level !== filters.riskLevel) {
        return false;
      }

      if (filters.minConfidence > 0 && event.confidence < filters.minConfidence) return false;
      if (filters.satellite !== "All" && event.satellite !== filters.satellite) return false;
      const eventDate = event.timestamp.slice(0, 10);
      if (filters.dateRange?.from && eventDate < filters.dateRange.from) return false;
      if (filters.dateRange?.to && eventDate > filters.dateRange.to) return false;
      if (filters.frpLevel === "Low" && event.frp >= 50) return false;
      if (filters.frpLevel === "Moderate" && (event.frp < 50 || event.frp >= 100)) return false;
      if (filters.frpLevel === "High" && (event.frp < 100 || event.frp >= 150)) return false;
      if (filters.frpLevel === "Extreme" && event.frp < 150) return false;

      // Region quick coordinates filter
      if (filters.region === "gujarat") {
        if (event.location.longitude < 68 || event.location.longitude > 74) return false;
      } else if (filters.region === "angul") {
        if (event.location.longitude < 83 || event.location.longitude > 87) return false;
      } else if (filters.region === "mumbai") {
        if (event.location.longitude < 71 || event.location.longitude > 74) return false;
      } else if (filters.region === "forest") {
        if (event.classification !== "Natural Fire" && event.classification !== "Wildfire") return false;
      } else if (filters.region === "punjab") {
        if (event.location.latitude < 29 || event.location.latitude > 32) return false;
      }

      // Search Query filter
      if (filters.searchQuery.trim() !== "") {
        const q = filters.searchQuery.toLowerCase();
        const matchFacility = event.nearby_facility?.toLowerCase().includes(q);
        const matchLand = event.land_cover?.toLowerCase().includes(q);
        const matchId = event.id.toLowerCase().includes(q);
        const matchReason = event.reasoning.some((r) => r.toLowerCase().includes(q));
        if (!matchFacility && !matchLand && !matchId && !matchReason) return false;
      }

      return true;
    });
  }, [allEvents, filters]);

  const stats = useMemo(() => computeDashboardStats(filteredEvents), [filteredEvents]);

  const handleSelectEvent = (event: ThermalEvent) => {
    setSelectedEvent(event);
    setIsDetailsOpen(true);
  };

  const handleOpenSimulator = (event?: ThermalEvent) => {
    setSimulatorInitialEvent(event || null);
    setIsSimulatorOpen(true);
  };

  const handleResetFilters = () => {
    setFilters({
      classification: "All",
      riskLevel: "All",
      region: "all",
      minFRP: 0,
      frpLevel: "All",
      minConfidence: 0,
      satellite: "All",
      searchQuery: "",
    });
  };

  const handleSyncTelemetry = async () => {
    setIsLoading(true);
    setConnectionError(null);
    try {
      await syncLiveTelemetry();
      await loadData();
    } catch (err) {
      console.error("Failed to synchronize live telemetry:", err);
      setConnectionError("Telemetry sync failed. Check the backend, FIRMS configuration, and ML model status.");
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-background font-sans">
      {/* Platform Header */}
      <Header
        onOpenSimulator={() => handleOpenSimulator()}
        activeCount={filteredEvents.length}
      />

      {/* Main Workspace Container */}
      <main className="mx-auto w-full max-w-7xl flex-1 space-y-3 p-3 sm:p-6">
        {/* Top KPI Ribbon */}
        <Statistics stats={stats} />

        {/* Global Filter Bar */}
        <FilterBar
          filters={filters}
          onChange={setFilters}
          onReset={handleResetFilters}
          totalFiltered={filteredEvents.length}
        />

        {connectionError && (
          <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-3 py-3 text-sm text-red-800">
            {connectionError}
          </div>
        )}

        {/* View Switcher Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-3">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <TabsList className="h-11 rounded-xl border border-border bg-white p-1 mira-shadow">
              <TabsTrigger value="map" className="h-9 gap-1.5 rounded-lg px-3 text-xs font-normal">
                <MapIcon className="size-3.5" />
                Map
              </TabsTrigger>
              <TabsTrigger value="table" className="h-9 gap-1.5 rounded-lg px-3 text-xs font-normal">
                <TableIcon className="size-3.5" />
                Registry ({filteredEvents.length})
              </TabsTrigger>
              <TabsTrigger value="analytics" className="h-9 gap-1.5 rounded-lg px-3 text-xs font-normal">
                <BarChart3 className="size-3.5" />
                Analytics
              </TabsTrigger>
            </TabsList>

            <Button
              variant="outline"
              size="sm"
              onClick={handleSyncTelemetry}
              disabled={isLoading}
              className="h-11 rounded-xl bg-white px-3 text-xs font-normal"
            >
              <RefreshCw className={`size-3.5 ${isLoading ? "animate-spin" : ""}`} />
              Sync
            </Button>
          </div>

          {/* TAB 1: GIS Spatial Map + Live Feed (Primary Workspace) */}
          <TabsContent value="map" className="m-0 space-y-0">
            <div className="grid h-[650px] min-h-[550px] grid-cols-1 gap-3 lg:grid-cols-12">
              <div className="h-full lg:col-span-8">
                <FireMap
                  events={filteredEvents}
                  selectedEvent={selectedEvent}
                  onSelectEvent={handleSelectEvent}
                  focusedEventId={selectedEvent?.id}
                />
              </div>

              <div className="flex h-full flex-col overflow-hidden rounded-3xl border border-border bg-white mira-shadow lg:col-span-4">
                <div className="flex items-center justify-between border-b border-border px-3 py-3">
                  <div className="flex items-center gap-2">
                    <Radio className="size-3.5 text-primary" aria-hidden="true" />
                    <h3 className="text-sm text-foreground">Detections</h3>
                  </div>
                  <span className="font-mono text-xs text-muted-foreground">
                    {filteredEvents.length}
                  </span>
                </div>

                <div className="flex-1 space-y-3 overflow-y-auto p-3">
                  {filteredEvents.length === 0 ? (
                    <div className="flex h-full flex-col items-center justify-center p-6 text-center text-muted-foreground">
                      <Flame className="mb-2 size-8 text-border" aria-hidden="true" />
                      <p className="text-sm">No thermal anomalies match current filters.</p>
                    </div>
                  ) : (
                    filteredEvents.map((event) => (
                      <ThermalEventCard
                        key={event.id}
                        event={event}
                        isSelected={selectedEvent?.id === event.id}
                        onSelect={handleSelectEvent}
                      />
                    ))
                  )}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* TAB 2: Full Tabular Event Registry */}
          <TabsContent value="table" className="m-0">
            <EventTable
              events={filteredEvents}
              selectedEvent={selectedEvent}
              onSelectEvent={handleSelectEvent}
            />
          </TabsContent>

          {/* TAB 3: Aggregate Predictive Analytics */}
          <TabsContent value="analytics" className="m-0 space-y-3">
            <AnalyticsDashboard events={filteredEvents} onSelectEvent={handleSelectEvent} />
          </TabsContent>
        </Tabs>
      </main>

      {/* Investigation Details Slide-Over Sheet */}
      <HotspotDetails
        event={selectedEvent}
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        onOpenSimulator={(e) => handleOpenSimulator(e)}
      />

      {/* Live Prediction Simulator Dialog */}
      <PredictionSimulator
        isOpen={isSimulatorOpen}
        onClose={() => setIsSimulatorOpen(false)}
        initialEvent={simulatorInitialEvent}
      />
    </div>
  );
}
