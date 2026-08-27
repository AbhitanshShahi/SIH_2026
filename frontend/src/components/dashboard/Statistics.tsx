import React from "react";
import { DashboardStats } from "@/types/thermal";
import { Card, CardContent } from "@/components/ui/card";
import { Flame, AlertTriangle, Sparkles, Activity, ShieldAlert } from "lucide-react";

interface StatisticsProps {
  stats: DashboardStats;
}

export function Statistics({ stats }: StatisticsProps) {
  const cards = [
    {
      title: "Active Thermal Hotspots",
      value: stats.totalEvents,
      subtitle: "NASA FIRMS / VIIRS detections",
      icon: Activity,
      textColor: "text-foreground",
      iconColor: "text-slate-600 bg-slate-100",
      borderAccent: "",
    },
    {
      title: "Industrial Point Sources",
      value: stats.industrialCount,
      subtitle: "Confirmed refinery/smelter heat",
      icon: Flame,
      textColor: "text-red-700",
      iconColor: "text-red-600 bg-red-50",
      borderAccent: "border-l-4 border-l-red-500",
    },
    {
      title: "Gas Flare Stacks",
      value: stats.flareCount,
      subtitle: "Continuous petroleum flaring",
      icon: Sparkles,
      textColor: "text-amber-700",
      iconColor: "text-amber-600 bg-amber-50",
      borderAccent: "border-l-4 border-l-amber-500",
    },
    {
      title: "High Risk Alerts",
      value: stats.highRiskCount,
      subtitle: "Requires immediate operator review",
      icon: ShieldAlert,
      textColor: "text-red-700",
      iconColor: "text-red-600 bg-red-50",
      borderAccent: "border-l-4 border-l-red-600",
    },
    {
      title: "Mean Fire Power (FRP)",
      value: `${stats.avgFRP} MW`,
      subtitle: `Avg AI confidence: ${stats.avgConfidence}%`,
      icon: AlertTriangle,
      textColor: "text-foreground",
      iconColor: "text-orange-600 bg-orange-50",
      borderAccent: "",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 w-full">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <Card
            key={card.title}
            className={`rounded-xl border border-border/80 bg-white shadow-[0_2px_8px_rgba(31,184,181,0.06)] hover:shadow-md transition-all ${card.borderAccent}`}
          >
            <CardContent className="p-3.5 flex flex-col justify-between h-full">
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-xs font-medium text-muted-foreground line-clamp-1">
                  {card.title}
                </span>
                <div className={`p-1.5 rounded-lg shrink-0 ${card.iconColor}`}>
                  <Icon className="size-4" />
                </div>
              </div>
              <div>
                <div className={`text-2xl font-bold font-mono tracking-tight ${card.textColor}`}>
                  {card.value}
                </div>
                <div className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1">
                  {card.subtitle}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
