"use client";

import React, { useEffect, useState, useMemo, useRef } from "react";
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
import { Switch } from "@/components/ui/switch";
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
    minFRP: 0,
    frpLevel: "All",
    minConfidence: 0,
    satellite: "All",
    searchQuery: "",
  });

  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [now, setNow] = useState<number>(() => Date.now());
  const [liveEnabled, setLiveEnabled] = useState<boolean>(true);

  // Load initial hotspots
  const loadData = async (options?: { silent?: boolean }) => {
    const silent = options?.silent;
    if (!silent) setIsLoading(true);
    setConnectionError(null);
    try {
      const collection = await fetchHotspots({ minFRP: filters.minFRP });
      const events = collection.features.map((f) => f.properties);
      setAllEvents(events);
      if (events.length > 0 && !selectedEvent) {
        setSelectedEvent(events[0]);
      }
      setLastUpdated(new Date());
    } catch (err) {
      console.error("Failed to load hotspots:", err);
      if (!silent) {
        setAllEvents([]);
        setConnectionError("Unable to load backend telemetry. Confirm the API is running at the configured NEXT_PUBLIC_API_URL.");
      }
    } finally {
      if (!silent) setIsLoading(false);
    }
  };

  useEffect(() => {
    // Loading remote state is the intentional purpose of this synchronization effect.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.minFRP]);

  // Tick the freshness clock while live mode is active.
  useEffect(() => {
    if (!liveEnabled) return;
    const id = setInterval(() => setNow(Date.now()), 5000);
    return () => clearInterval(id);
  }, [liveEnabled]);

  const loadDataRef = useRef(loadData);
  useEffect(() => {
    loadDataRef.current = loadData;
  }, [loadData]);

  // WebSocket integration for real-time updates
  useEffect(() => {
    if (!liveEnabled) return;

    let ws: WebSocket | null = null;
    let reconnectTimeoutId: NodeJS.Timeout;
    let isActive = true;

    const connect = () => {
      const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";
      const wsProtocol = apiBase.startsWith("https") ? "wss" : "ws";
      let wsBase = apiBase.replace(/^https?:\/\//, "");
      
      // Fix IPv6 localhost resolution issues for WebSockets
      if (wsBase.startsWith("localhost")) {
        wsBase = wsBase.replace("localhost", "127.0.0.1");
      }
      
      const wsUrl = `${wsProtocol}://${wsBase}/live/ws`;

      ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        if (!isActive) return;
        console.log("WebSocket connected to", wsUrl);
      };

      ws.onmessage = (event) => {
        if (!isActive) return;
        try {
          const data = JSON.parse(event.data);
          if (data.type === "data_updated") {
            loadDataRef.current({ silent: true });
          }
        } catch (err) {
          console.error("WebSocket message error:", err);
        }
      };

      ws.onclose = () => {
        if (!isActive) return;
        console.log("WebSocket disconnected");
        // Reconnect after 5 seconds
        reconnectTimeoutId = setTimeout(() => {
          if (isActive && liveEnabled) {
            connect();
          }
        }, 5000);
      };
      
      ws.onerror = (error) => {
        if (!isActive) return; // Ignore errors caused by intentional cleanup
        console.error("WebSocket error:", error);
        ws?.close();
      };
    };

    connect();

    return () => {
      isActive = false;
      clearTimeout(reconnectTimeoutId);
      if (ws) {
        // Remove all handlers to prevent race conditions during unmount
        ws.onopen = null;
        ws.onmessage = null;
        ws.onerror = null;
        ws.onclose = null;
        ws.close();
      }
    };
  }, [liveEnabled]);

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
      if (filters.frpLevel === "Low" && event.frp >= 3) return false;
      if (filters.frpLevel === "Moderate" && (event.frp < 3 || event.frp >= 8)) return false;
      if (filters.frpLevel === "High" && (event.frp < 8 || event.frp >= 20)) return false;
      if (filters.frpLevel === "Extreme" && event.frp < 20) return false;

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
      minFRP: 0,
      frpLevel: "All",
      minConfidence: 0,
      satellite: "All",
      searchQuery: "",
    });
  };

  const formatUpdated = (dt: Date | null) => {
    if (!dt) return "Waiting for data";
    const s = Math.max(0, Math.round((now - dt.getTime()) / 1000));
    if (s < 5) return "Updated just now";
    if (s < 60) return `Updated ${s}s ago`;
    const m = Math.floor(s / 60);
    if (m < 60) return `Updated ${m}m ago`;
    return `Updated ${dt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
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
          <div className="flex flex-col justify-between gap-3 lg:flex-row lg:items-center">
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

            <div className="flex flex-wrap items-center gap-2">
              <div
                className="flex h-11 items-center gap-2 rounded-xl border border-border bg-white px-3 mira-shadow"
                aria-live="polite"
              >
                <span className="relative flex size-2" aria-hidden="true">
                  <span
                    className={`absolute inline-flex size-full rounded-full opacity-75 ${
                      liveEnabled ? "animate-ping bg-emerald-400" : "bg-slate-300"
                    }`}
                  />
                  <span
                    className={`relative inline-flex size-2 rounded-full ${
                      liveEnabled ? "bg-emerald-500" : "bg-slate-400"
                    }`}
                  />
                </span>
                <span className="whitespace-nowrap text-[11px] font-medium text-foreground">
                  {liveEnabled ? "Live" : "Paused"}
                </span>
                <span className="whitespace-nowrap text-[11px] text-muted-foreground">
                  {formatUpdated(lastUpdated)}
                </span>
              </div>

              <div
                className="flex h-11 items-center gap-2 rounded-xl border border-border bg-white px-3 mira-shadow"
                title="Live updates via WebSocket"
              >
                <span className="whitespace-nowrap text-[11px] text-muted-foreground">Auto</span>
                <Switch
                  size="sm"
                  checked={liveEnabled}
                  onCheckedChange={(checked) => setLiveEnabled(checked)}
                  aria-label="Toggle live updates"
                />
              </div>

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
