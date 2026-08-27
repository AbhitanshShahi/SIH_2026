import React from "react";
import { ThermalEvent, ClassificationType } from "@/types/thermal";
import { Badge } from "@/components/ui/badge";
import { Flame, Trees, Sparkles, HelpCircle, MapPin, Clock, Calendar } from "lucide-react";

interface ThermalEventCardProps {
  event: ThermalEvent;
  isSelected: boolean;
  onSelect: (event: ThermalEvent) => void;
}

function getBadgeStyle(classification: ClassificationType) {
  switch (classification) {
    case "Industrial Source":
      return {
        badge: "bg-red-50 text-red-700 border-red-200 hover:bg-red-100",
        icon: Flame,
        iconColor: "text-red-600",
        indicator: "bg-red-600",
      };
    case "Natural Fire":
    case "Wildfire":
      return {
        badge: "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100",
        icon: Trees,
        iconColor: "text-blue-600",
        indicator: "bg-blue-600",
      };
    case "Gas Flare":
      return {
        badge: "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100",
        icon: Sparkles,
        iconColor: "text-amber-600",
        indicator: "bg-amber-500",
      };
    default:
      return {
        badge: "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100",
        icon: HelpCircle,
        iconColor: "text-slate-600",
        indicator: "bg-slate-500",
      };
  }
}

export function ThermalEventCard({ event, isSelected, onSelect }: ThermalEventCardProps) {
  const style = getBadgeStyle(event.classification);
  const Icon = style.icon;

  return (
    <div
      onClick={() => onSelect(event)}
      className={`group relative p-3 rounded-xl border transition-all cursor-pointer select-none ${
        isSelected
          ? "bg-white border-primary shadow-md ring-2 ring-primary/20"
          : "bg-white/90 hover:bg-white border-border/80 hover:border-border shadow-sm hover:shadow"
      }`}
    >
      {/* Top classification & confidence */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className={`size-2 rounded-full ${style.indicator} shrink-0`} />
          <Badge variant="outline" className={`text-[11px] font-semibold py-0.5 px-2 ${style.badge}`}>
            <Icon className={`size-3 mr-1 ${style.iconColor}`} />
            <span className="truncate">{event.classification}</span>
          </Badge>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <span className="text-[11px] font-mono font-bold bg-slate-100 text-slate-800 px-1.5 py-0.5 rounded">
            {event.confidence}% AI
          </span>
          <span
            className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
              event.risk_level === "High"
                ? "bg-red-100 text-red-700"
                : event.risk_level === "Medium"
                ? "bg-amber-100 text-amber-700"
                : "bg-slate-100 text-slate-700"
            }`}
          >
            {event.risk_level}
          </span>
        </div>
      </div>

      {/* Primary facility/location label */}
      <div className="mb-2">
        <h4 className="text-xs font-semibold text-foreground truncate group-hover:text-primary transition-colors">
          {event.nearby_facility || `${event.land_cover} Event`}
        </h4>
        <div className="flex items-center gap-1 text-[11px] text-muted-foreground mt-0.5">
          <MapPin className="size-3 shrink-0" />
          <span className="font-mono">
            {event.location.latitude.toFixed(2)}°N, {event.location.longitude.toFixed(2)}°E
          </span>
          {event.distance_to_industry <= 1000 && (
            <span className="text-slate-500 font-sans">
              ({event.distance_to_industry}m to facility)
            </span>
          )}
        </div>
      </div>

      {/* Metrics breakdown row */}
      <div className="grid grid-cols-3 gap-1.5 py-1.5 px-2 rounded-lg bg-slate-50 border border-slate-100 text-[11px]">
        <div>
          <span className="text-[10px] text-muted-foreground block">Power (FRP)</span>
          <span className="font-mono font-bold text-foreground">{event.frp} MW</span>
        </div>
        <div>
          <span className="text-[10px] text-muted-foreground block">Persistence</span>
          <span className="font-mono font-bold text-foreground">{event.persistence_days} days</span>
        </div>
        <div>
          <span className="text-[10px] text-muted-foreground block">Night Ratio</span>
          <span className="font-mono font-bold text-foreground">
            {Math.round(event.night_ratio * 100)}%
          </span>
        </div>
      </div>

      {/* Primary reason teaser */}
      {event.reasoning && event.reasoning.length > 0 && (
        <div className="mt-2 text-[11px] text-muted-foreground line-clamp-1 italic">
          &ldquo;{event.reasoning[0]}&rdquo;
        </div>
      )}

      {/* Timestamp footer */}
      <div className="mt-2 pt-2 border-t border-border/40 flex items-center justify-between text-[10px] text-muted-foreground font-mono">
        <span className="flex items-center gap-1">
          <Clock className="size-2.5" />
          {new Date(event.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </span>
        <span className="flex items-center gap-1">
          <Calendar className="size-2.5" />
          {new Date(event.timestamp).toLocaleDateString([], { month: "short", day: "numeric" })}
        </span>
      </div>
    </div>
  );
}
