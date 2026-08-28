import React from "react";
import { ThermalEvent, ClassificationType, getConfidenceLevel } from "@/types/thermal";
import { Badge } from "@/components/ui/badge";
import { Flame, Trees, Sparkles, HelpCircle, MapPin, Clock, Calendar, Building2 } from "lucide-react";

interface ThermalEventCardProps {
  event: ThermalEvent;
  isSelected: boolean;
  onSelect: (event: ThermalEvent) => void;
}

function getBadgeStyle(classification: ClassificationType) {
  switch (classification) {
    case "Industrial Source":
      return {
        badge: "bg-red-50 text-red-700 border-red-200",
        icon: Flame,
        iconColor: "text-red-600",
        indicator: "bg-red-600",
      };
    case "Natural Fire":
    case "Wildfire":
      return {
        badge: "bg-blue-50 text-blue-700 border-blue-200",
        icon: Trees,
        iconColor: "text-blue-600",
        indicator: "bg-blue-600",
      };
    case "Gas Flare":
      return {
        badge: "bg-amber-50 text-amber-700 border-amber-200",
        icon: Sparkles,
        iconColor: "text-amber-600",
        indicator: "bg-amber-500",
      };
    case "Other Thermal Anomaly":
      return {
        badge: "bg-slate-100 text-slate-700 border-slate-200",
        icon: Building2,
        iconColor: "text-slate-600",
        indicator: "bg-slate-500",
      };
    default:
      return {
        badge: "bg-muted text-foreground border-border",
        icon: HelpCircle,
        iconColor: "text-muted-foreground",
        indicator: "bg-primary",
      };
  }
}

export function ThermalEventCard({ event, isSelected, onSelect }: ThermalEventCardProps) {
  const style = getBadgeStyle(event.classification);
  const Icon = style.icon;

  return (
    <button
      type="button"
      onClick={() => onSelect(event)}
      className={`group relative w-full rounded-3xl border p-3 text-left transition-shadow ${
        isSelected
          ? "border-primary bg-white ring-2 ring-primary/20 mira-shadow"
          : "border-border bg-white hover:mira-shadow"
      }`}
    >
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-1.5">
          <span className={`size-2 shrink-0 rounded-full ${style.indicator}`} />
          <Badge variant="outline" className={`px-2 py-0.5 text-[11px] font-normal ${style.badge}`}>
            <Icon className={`mr-1 size-3 ${style.iconColor}`} aria-hidden="true" />
            <span className="truncate">{event.classification}</span>
          </Badge>
        </div>

        <div className="flex shrink-0 items-center gap-1">
          <span
            className={`rounded-xl px-1.5 py-0.5 text-[11px] ${
              getConfidenceLevel(event.confidence) === "High"
                ? "bg-emerald-50 text-emerald-700"
                : getConfidenceLevel(event.confidence) === "Medium"
                ? "border border-border bg-muted text-foreground"
                : "border border-border bg-muted text-muted-foreground"
            }`}
          >
            {getConfidenceLevel(event.confidence)}
          </span>
          <span
            className={`rounded-xl px-1.5 py-0.5 text-[11px] ${
              event.risk_level === "High"
                ? "bg-red-50 text-red-700"
                : event.risk_level === "Medium"
                ? "bg-amber-50 text-amber-700"
                : "border border-border bg-muted text-muted-foreground"
            }`}
          >
            {event.risk_level}
          </span>
        </div>
      </div>

      <div className="mb-3">
        <h4 className="truncate text-sm font-medium text-foreground">
          {event.nearby_facility || `${event.land_cover} event`}
        </h4>
        <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
          <MapPin className="size-3 shrink-0" aria-hidden="true" />
          <span className="font-mono">
            {event.location.latitude.toFixed(3)}°N, {event.location.longitude.toFixed(3)}°E
          </span>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-2 rounded-xl bg-muted/70 px-3 py-2 text-xs">
        <div>
          <span className="block text-[10px] uppercase tracking-wide text-muted-foreground">FRP</span>
          <span className="font-mono text-foreground">{event.frp}</span>
        </div>
        <div>
          <span className="block text-[10px] uppercase tracking-wide text-muted-foreground">Persistence</span>
          <span className="font-mono text-foreground">{event.persistence_days}d</span>
        </div>
        <div>
          <span className="block text-[10px] uppercase tracking-wide text-muted-foreground">Night</span>
          <span className="font-mono text-foreground">{Math.round(event.night_ratio * 100)}%</span>
        </div>
        <div>
          <span className="block text-[10px] uppercase tracking-wide text-muted-foreground">Nearest</span>
          <span className="font-mono text-foreground">
            {event.distance_to_industry >= 1000
              ? `${(event.distance_to_industry / 1000).toFixed(1)}km`
              : `${Math.round(event.distance_to_industry)}m`}
          </span>
        </div>
      </div>

      {event.reasoning && event.reasoning.length > 0 && (
        <p className="mt-3 line-clamp-1 text-xs text-muted-foreground">
          {event.reasoning[0]}
        </p>
      )}

      <div className="mt-3 flex items-center justify-between border-t border-border pt-3 font-mono text-[11px] text-muted-foreground">
        <span className="flex items-center gap-1">
          <Clock className="size-2.5" aria-hidden="true" />
          {new Date(event.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </span>
        <span className="flex items-center gap-1">
          <Calendar className="size-2.5" aria-hidden="true" />
          {new Date(event.timestamp).toLocaleDateString([], { month: "short", day: "numeric" })}
        </span>
      </div>
    </button>
  );
}
