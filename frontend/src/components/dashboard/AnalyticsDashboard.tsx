"use client";

import React, { useMemo } from "react";
import { AlertTriangle, Building2, Flame, Radar } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ThermalEvent, getConfidenceLevel } from "@/types/thermal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface AnalyticsDashboardProps { events: ThermalEvent[]; onSelectEvent: (event: ThermalEvent) => void; }
const chartAxis = { fill: "#666666", fontSize: 11 };
const classificationOrder = ["Industrial Source", "Gas Flare", "Natural Fire", "Wildfire", "Crop Burning", "Unknown"];

export function AnalyticsDashboard({ events, onSelectEvent }: AnalyticsDashboardProps) {
  const analytics = useMemo(() => {
    const byDay = new Map<string, { date: string; events: number; frp: number }>();
    const byMonth = new Map<string, number>();
    const byClassification = new Map<string, number>();
    events.forEach((event) => {
      const date = event.timestamp.slice(0, 10);
      const day = byDay.get(date) ?? { date, events: 0, frp: 0 };
      day.events += 1; day.frp += event.frp; byDay.set(date, day);
      const month = new Intl.DateTimeFormat("en", { month: "short", year: "2-digit", timeZone: "UTC" }).format(new Date(event.timestamp));
      byMonth.set(month, (byMonth.get(month) ?? 0) + 1);
      byClassification.set(event.classification, (byClassification.get(event.classification) ?? 0) + 1);
    });
    const highFrp = events.filter((event) => event.frp >= 100).sort((a, b) => b.frp - a.frp);
    const persistent = events.filter((event) => event.persistence_days >= 14).sort((a, b) => b.persistence_days - a.persistence_days);
    const zones = new Map<string, { name: string; events: ThermalEvent[]; maxFrp: number }>();
    events.filter((event) => event.classification === "Industrial Source" || event.classification === "Gas Flare" || event.distance_to_industry <= 500).forEach((event) => {
      const name = event.nearby_facility ?? event.land_cover;
      const zone = zones.get(name) ?? { name, events: [], maxFrp: 0 };
      zone.events.push(event); zone.maxFrp = Math.max(zone.maxFrp, event.frp); zones.set(name, zone);
    });
    return {
      daily: Array.from(byDay.values()).sort((a, b) => a.date.localeCompare(b.date)).map((item) => ({ ...item, date: item.date.slice(5) })),
      monthly: Array.from(byMonth.entries()).map(([month, count]) => ({ month, events: count })),
      classification: classificationOrder.filter((name) => byClassification.has(name)).map((name) => ({ name, events: byClassification.get(name) ?? 0 })),
      otherAnomalies: events.filter((event) => !["Industrial Source", "Gas Flare", "Natural Fire", "Wildfire"].includes(event.classification)).length,
      highFrp, persistent, zones: Array.from(zones.values()).sort((a, b) => b.maxFrp - a.maxFrp),
    };
  }, [events]);

  const eventStats = [
    { label: "Total detections", value: events.length, icon: Radar },
    { label: "Industrial events", value: events.filter((event) => event.classification === "Industrial Source").length, icon: Building2 },
    { label: "Flare events", value: events.filter((event) => event.classification === "Gas Flare").length, icon: Flame },
    { label: "Other anomalies", value: analytics.otherAnomalies, icon: AlertTriangle },
  ];

  return <div className="space-y-3">
    <section aria-labelledby="event-statistics-heading"><SectionHeading id="event-statistics-heading" icon={Radar} label="Event statistics" />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">{eventStats.map(({ label, value, icon: Icon }) => <Card key={label} className="rounded-3xl border-border py-0 mira-shadow"><CardContent className="flex items-center gap-3 p-3"><div className="rounded-xl bg-muted p-2"><Icon className="size-4 text-primary" aria-hidden="true" /></div><div><p className="text-[11px] text-muted-foreground">{label}</p><p className="font-mono text-xl">{value}</p></div></CardContent></Card>)}</div>
    </section>
    <section className="grid grid-cols-1 gap-3 xl:grid-cols-2" aria-label="Time analysis charts">
      <ChartCard title="Thermal events over time" description="Daily count of detections in the active filter window."><LineChart data={analytics.daily}><Grid /><XAxis dataKey="date" tickLine={false} axisLine={false} tick={chartAxis} /><YAxis allowDecimals={false} tickLine={false} axisLine={false} tick={chartAxis} /><Tooltip /><Line type="monotone" dataKey="events" name="Detections" stroke="#888888" strokeWidth={2} dot={{ r: 3 }} /></LineChart></ChartCard>
      <ChartCard title="FRP trend" description="Aggregate fire radiative power measured each day."><LineChart data={analytics.daily}><Grid /><XAxis dataKey="date" tickLine={false} axisLine={false} tick={chartAxis} /><YAxis tickLine={false} axisLine={false} tick={chartAxis} /><Tooltip /><Line type="monotone" dataKey="frp" name="Total FRP (MW)" stroke="#6e6e6e" strokeWidth={2} dot={{ r: 3 }} /></LineChart></ChartCard>
      <ChartCard title="Daily / monthly distribution" description="Detection volume by reporting month."><BarChart data={analytics.monthly}><Grid /><XAxis dataKey="month" tickLine={false} axisLine={false} tick={chartAxis} /><YAxis allowDecimals={false} tickLine={false} axisLine={false} tick={chartAxis} /><Tooltip /><Bar dataKey="events" name="Detections" fill="#888888" radius={[8, 8, 0, 0]} /></BarChart></ChartCard>
      <ChartCard title="Classification distribution" description="Event categories generated by the ML classification service."><BarChart data={analytics.classification} layout="vertical" margin={{ left: 25 }}><CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e5e5e5" /><XAxis type="number" allowDecimals={false} tickLine={false} axisLine={false} tick={chartAxis} /><YAxis type="category" dataKey="name" width={110} tickLine={false} axisLine={false} tick={chartAxis} /><Tooltip /><Legend /><Bar dataKey="events" name="Detections" fill="#aaaaaa" radius={[0, 8, 8, 0]} /></BarChart></ChartCard>
    </section>
    <section aria-labelledby="risk-monitoring-heading"><SectionHeading id="risk-monitoring-heading" icon={AlertTriangle} label="Risk monitoring" />
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
        <RiskList title="High-FRP events" description="At or above 100 MW" events={analytics.highFrp} metric={(event) => `${event.frp} MW`} empty="No high-FRP events in this view." onSelectEvent={onSelectEvent} />
        <RiskList title="Persistent hotspots" description="Detected for 14+ days" events={analytics.persistent} metric={(event) => `${event.persistence_days} days`} empty="No persistent hotspots in this view." onSelectEvent={onSelectEvent} />
        <Card className="rounded-3xl border-border mira-shadow"><CardHeader className="pb-2"><CardTitle className="text-sm font-normal">Industrial zones with activity</CardTitle><CardDescription className="text-xs">Grouped by associated facility or industrial land cover.</CardDescription></CardHeader><CardContent className="space-y-3">{analytics.zones.length ? analytics.zones.map((zone) => <div key={zone.name} className="rounded-3xl border border-border bg-muted p-3"><div className="flex items-start justify-between gap-2"><p className="text-xs leading-5">{zone.name}</p><Badge variant="outline" className="shrink-0 text-[10px] font-normal">{zone.events.length} event{zone.events.length === 1 ? "" : "s"}</Badge></div><p className="mt-1 text-[11px] text-muted-foreground">Peak FRP <span className="font-mono text-foreground">{zone.maxFrp} MW</span></p></div>) : <EmptyState text="No industrial activity matches the current filters." />}</CardContent></Card>
      </div>
    </section>
  </div>;
}

function Grid() { return <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e5e5" />; }
function SectionHeading({ id, icon: Icon, label }: { id: string; icon: typeof Radar; label: string }) { return <div className="mb-3 flex items-center gap-2"><Icon className="size-4 text-primary" aria-hidden="true" /><h2 id={id} className="text-sm font-normal">{label}</h2></div>; }
function ChartCard({ title, description, children }: { title: string; description: string; children: React.ReactElement }) { return <Card className="rounded-3xl border-border mira-shadow"><CardHeader className="pb-2"><CardTitle className="text-sm font-normal">{title}</CardTitle><CardDescription className="text-xs">{description}</CardDescription></CardHeader><CardContent className="h-64 pt-2"><ResponsiveContainer width="100%" height="100%">{children}</ResponsiveContainer></CardContent></Card>; }
function RiskList({ title, description, events, metric, empty, onSelectEvent }: { title: string; description: string; events: ThermalEvent[]; metric: (event: ThermalEvent) => string; empty: string; onSelectEvent: (event: ThermalEvent) => void }) { return <Card className="rounded-3xl border-border mira-shadow"><CardHeader className="pb-2"><CardTitle className="text-sm font-normal">{title}</CardTitle><CardDescription className="text-xs">{description}</CardDescription></CardHeader><CardContent className="space-y-3">{events.length ? events.slice(0, 4).map((event) => <Button key={event.id} variant="ghost" className="h-auto w-full justify-between rounded-3xl border border-border bg-muted p-3 text-left hover:bg-white" onClick={() => onSelectEvent(event)}><span className="min-w-0"><span className="block truncate text-xs">{event.nearby_facility ?? event.id}</span><span className="block truncate text-[11px] text-muted-foreground">{event.classification} · {getConfidenceLevel(event.confidence)} confidence</span></span><span className="ml-2 shrink-0 font-mono text-xs text-foreground">{metric(event)}</span></Button>) : <EmptyState text={empty} />}</CardContent></Card>; }
function EmptyState({ text }: { text: string }) { return <p className="rounded-3xl border border-dashed border-border px-3 py-5 text-center text-xs text-muted-foreground">{text}</p>; }
