"use client";

import React, { useEffect, useState, useMemo } from "react";
import dynamic from "next/dynamic";
import { ThermalEvent, FilterOptions } from "@/types/thermal";
import { fetchHotspots, computeDashboardStats } from "@/services/hotspotService";
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
      <div className="w-full h-full min-h-[500px] bg-slate-100 rounded-2xl flex flex-col items-center justify-center border border-border">
        <div className="size-8 rounded-full border-2 border-primary border-t-transparent animate-spin mb-3" />
        <span className="text-xs font-semibold text-muted-foreground">
          Initializing GIS Geospatial Engine...
        </span>
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
  const [activeTab, setActiveTab] = useState<string>("map");

  const [filters, setFilters] = useState<FilterOptions>({
    classification: "All",
    riskLevel: "All",
    region: "all",
    minFRP: 0,
    frpLevel: "All",
    minConfidence: 0,
    satellite: "All",
    searchQuery: "",
  });

  // Load initial hotspots
  const loadData = async () => {
    setIsLoading(true);
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

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/60 font-sans dark:bg-slate-950">
      {/* Platform Header */}
      <Header
        onOpenSimulator={() => handleOpenSimulator()}
        activeCount={filteredEvents.length}
      />

      {/* Main Workspace Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-5 lg:p-6 space-y-4">
        {/* Top KPI Ribbon */}
        <Statistics stats={stats} />

        {/* Global Filter Bar */}
        <FilterBar
          filters={filters}
          onChange={setFilters}
          onReset={handleResetFilters}
          totalFiltered={filteredEvents.length}
        />

        {/* View Switcher Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/80 pb-2">
            <TabsList className="bg-white p-1 rounded-xl border border-border shadow-xs">
              <TabsTrigger value="map" className="text-xs font-semibold gap-1.5 rounded-lg px-3">
                <MapIcon className="size-3.5" />
                GIS Spatial Workspace
              </TabsTrigger>
              <TabsTrigger value="table" className="text-xs font-semibold gap-1.5 rounded-lg px-3">
                <TableIcon className="size-3.5" />
                Event Registry ({filteredEvents.length})
              </TabsTrigger>
              <TabsTrigger value="analytics" className="text-xs font-semibold gap-1.5 rounded-lg px-3">
                <BarChart3 className="size-3.5" />
                Analytics & Telemetry
              </TabsTrigger>
            </TabsList>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={loadData}
                disabled={isLoading}
                className="h-8 text-xs gap-1.5 rounded-xl bg-white"
              >
                <RefreshCw className={`size-3 text-slate-600 ${isLoading ? "animate-spin" : ""}`} />
                Sync Telemetry
              </Button>
            </div>
          </div>

          {/* TAB 1: GIS Spatial Map + Live Feed (Primary Workspace) */}
          <TabsContent value="map" className="m-0 space-y-0">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-[650px] min-h-[550px]">
              {/* Left/Center: Interactive GIS FireMap (8 cols) */}
              <div className="lg:col-span-8 h-full">
                <FireMap
                  events={filteredEvents}
                  selectedEvent={selectedEvent}
                  onSelectEvent={handleSelectEvent}
                  focusedEventId={selectedEvent?.id}
                />
              </div>

              {/* Right: Scannable Thermal Event Feed (4 cols) */}
              <div className="lg:col-span-4 h-full flex flex-col bg-white rounded-2xl border border-border shadow-xs overflow-hidden">
                <div className="p-3.5 border-b border-border/80 bg-slate-50/70 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Radio className="size-3.5 text-red-600 animate-pulse" />
                    <h3 className="text-xs font-bold text-foreground">
                      Active Detections Feed
                    </h3>
                  </div>
                  <span className="text-[11px] font-mono font-semibold text-muted-foreground">
                    {filteredEvents.length} Events
                  </span>
                </div>

                <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
                  {filteredEvents.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center p-6 text-center text-muted-foreground">
                      <Flame className="size-8 text-slate-300 mb-2" />
                      <p className="text-xs">No thermal anomalies match current filters.</p>
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
          <TabsContent value="analytics" className="m-0 space-y-4">
            <AnalyticsDashboard events={filteredEvents} onSelectEvent={handleSelectEvent} />
            {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="rounded-2xl border border-border shadow-xs bg-white">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-bold">
                    Thermal Events by Classification
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Distribution of active anomalies identified by the ML pipeline.
                  </CardDescription>
                </CardHeader>
                <CardContent className="h-64 pt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={classificationChartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                      <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: "#64748B", fontSize: 11 }} />
                      <YAxis tickLine={false} axisLine={false} tick={{ fill: "#64748B", fontSize: 11 }} />
                      <Tooltip />
                      <Bar dataKey="count" fill="#DC2626" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="rounded-2xl border border-border shadow-xs bg-white">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-bold">
                    Operational Intelligence Telemetry
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Aggregated physical characteristics across Indian industrial corridors.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 pt-2">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">High Persistence Events (&gt;20 days):</span>
                    <span className="font-mono font-bold text-foreground">
                      {filteredEvents.filter((e) => e.persistence_days > 20).length} / {filteredEvents.length}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Industrial Proximity (&lt;500m):</span>
                    <span className="font-mono font-bold text-foreground">
                      {filteredEvents.filter((e) => e.distance_to_industry <= 500).length} / {filteredEvents.length}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Night Activity Dominant (&gt;80%):</span>
                    <span className="font-mono font-bold text-foreground">
                      {filteredEvents.filter((e) => e.night_ratio >= 0.8).length} / {filteredEvents.length}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Mean Anomaly FRP:</span>
                    <span className="font-mono font-bold text-foreground">
                      {stats.avgFRP} MW
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div> */}
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
