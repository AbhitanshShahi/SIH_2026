"use client";

import React from "react";
import { ThermalEvent } from "@/types/thermal";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
} from "recharts";

interface ThermalTrendsChartProps {
  event: ThermalEvent;
}

export function ThermalTrendsChart({ event }: ThermalTrendsChartProps) {
  const data = event.historical_history && event.historical_history.length > 0
    ? event.historical_history.map((h) => ({
        date: h.date.replace("2026-", ""),
        frp: h.frp,
        passes: h.detected_passes,
        type: h.is_night ? "Night Pass" : "Day Pass",
      }))
    : [
        { date: "Day -4", frp: Math.max(event.frp * 0.7, 15), passes: 2, type: "Night" },
        { date: "Day -3", frp: Math.max(event.frp * 0.8, 20), passes: 3, type: "Night" },
        { date: "Day -2", frp: Math.max(event.frp * 0.9, 25), passes: 3, type: "Night" },
        { date: "Day -1", frp: event.frp * 0.95, passes: 4, type: "Night" },
        { date: "Today", frp: event.frp, passes: 5, type: "Night" },
      ];

  return (
    <div className="w-full h-56 pt-2">
      <div className="flex items-center justify-between text-xs mb-2">
        <span className="font-medium text-foreground">Temporal Fire Radiative Power (FRP)</span>
        <span className="font-mono text-[10px] text-muted-foreground">Unit: Megawatts (MW)</span>
      </div>

      <ResponsiveContainer width="100%" height="88%">
        <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
          <XAxis
            dataKey="date"
            tickLine={false}
            axisLine={false}
            tick={{ fill: "#64748B", fontSize: 11 }}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tick={{ fill: "#64748B", fontSize: 11 }}
            domain={[0, "auto"]}
          />
          <Tooltip
            content={({ active, payload, label }) => {
              if (active && payload && payload.length) {
                const p = payload[0].payload;
                return (
                  <div className="bg-slate-900 text-white p-2.5 rounded-lg shadow-xl text-xs space-y-1 border border-slate-700">
                    <div className="font-bold text-slate-200">{label}</div>
                    <div className="text-amber-400 font-mono">
                      FRP Intensity: {p.frp} MW
                    </div>
                    <div className="text-slate-300 text-[11px]">
                      Satellite Passes: {p.passes} ({p.type})
                    </div>
                  </div>
                );
              }
              return null;
            }}
          />
          <ReferenceLine y={100} stroke="#EF4444" strokeDasharray="3 3" label={{ value: "Industrial Baseline (100 MW)", fill: "#DC2626", fontSize: 9, position: "insideTopRight" }} />
          <Line
            type="monotone"
            dataKey="frp"
            stroke="#DC2626"
            strokeWidth={2.5}
            dot={{ r: 4, fill: "#DC2626", stroke: "#FFFFFF", strokeWidth: 2 }}
            activeDot={{ r: 6, fill: "#DC2626" }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
