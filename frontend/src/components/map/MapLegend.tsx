import React from "react";
import { Flame, Sparkles, Building2 } from "lucide-react";

export function MapLegend() {
  const items = [
    {
      label: "Industrial Source",
      color: "bg-red-600 border-red-200 text-red-700",
      icon: Flame,
      desc: "Refineries, smelters, mills",
    },
    {
      label: "Gas Flare",
      color: "bg-amber-500 border-amber-200 text-amber-700",
      icon: Sparkles,
      desc: "Continuous combustion",
    },
    {
      label: "Other Anomaly",
      color: "bg-slate-500 border-slate-200 text-slate-700",
      icon: Building2,
      desc: "Unclassified thermal source",
    },
  ];

  return (
    <div className="absolute bottom-4 left-4 z-[400] max-w-xs rounded-3xl border border-border bg-white/95 p-3 text-xs mira-shadow">
      <div className="mb-3 flex items-center justify-between text-foreground">
        <span>Classification</span>
        <span className="font-mono text-[10px] text-muted-foreground">FIRMS</span>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.label} className="flex items-center gap-1.5">
              <span className={`size-2.5 rounded-full ${item.color.split(" ")[0]} ring-2 ring-white shrink-0`} />
              <div className="truncate">
                <span className="font-medium text-foreground text-[11px] truncate block">{item.label}</span>
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-3 flex items-center justify-between border-t border-border pt-3 text-[10px] text-muted-foreground">
        <span>FRP Scale:</span>
        <div className="flex items-center gap-1">
          <span>Low (&lt;3 MW)</span>
          <div className="h-1.5 w-12 rounded bg-gradient-to-r from-amber-400 via-orange-500 to-red-600" />
          <span>High (20+ MW)</span>
        </div>
      </div>
    </div>
  );
}
