import React from "react";
import { Flame, Trees, Sparkles, HelpCircle } from "lucide-react";

export function MapLegend() {
  const items = [
    {
      label: "Industrial Source",
      color: "bg-red-600 border-red-200 text-red-700",
      icon: Flame,
      desc: "Refineries, smelters, mills",
    },
    {
      label: "Natural Fire",
      color: "bg-blue-600 border-blue-200 text-blue-700",
      icon: Trees,
      desc: "Wildfires & forest burns",
    },
    {
      label: "Gas Flare",
      color: "bg-amber-500 border-amber-200 text-amber-700",
      icon: Sparkles,
      desc: "Petroleum flare stacks",
    },
    {
      label: "Crop / Unknown",
      color: "bg-slate-500 border-slate-200 text-slate-700",
      icon: HelpCircle,
      desc: "Agriculture & low-FRP events",
    },
  ];

  return (
    <div className="absolute bottom-4 left-4 z-[400] bg-white/95 backdrop-blur-md p-3 rounded-xl border border-border shadow-md max-w-xs text-xs">
      <div className="font-medium text-foreground mb-2 flex items-center justify-between">
        <span>Thermal Classification Key</span>
        <span className="text-[10px] text-muted-foreground font-mono">NASA FIRMS</span>
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
      <div className="mt-2 pt-2 border-t border-border/60 flex items-center justify-between text-[10px] text-muted-foreground">
        <span>FRP Scale:</span>
        <div className="flex items-center gap-1">
          <span>Low (20 MW)</span>
          <div className="h-1.5 w-12 rounded bg-gradient-to-r from-amber-400 via-orange-500 to-red-600" />
          <span>High (200+ MW)</span>
        </div>
      </div>
    </div>
  );
}
