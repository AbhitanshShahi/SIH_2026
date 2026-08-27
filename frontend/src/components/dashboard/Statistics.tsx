import React from "react";
import { DashboardStats, getConfidenceLevel } from "@/types/thermal";
import { Card, CardContent } from "@/components/ui/card";
import { Flame, AlertTriangle, Sparkles, Activity, ShieldAlert } from "lucide-react";

interface StatisticsProps {
  stats: DashboardStats;
}

export function Statistics({ stats }: StatisticsProps) {
  const cards = [
    {
      title: "Active hotspots",
      value: stats.totalEvents,
      subtitle: "NASA FIRMS / VIIRS",
      icon: Activity,
      iconClass: "text-primary bg-muted",
    },
    {
      title: "Industrial sources",
      value: stats.industrialCount,
      subtitle: "Talcher & Angul plants",
      icon: Flame,
      iconClass: "text-red-600 bg-red-50",
    },
    {
      title: "Gas flares",
      value: stats.flareCount,
      subtitle: "Continuous stacks",
      icon: Sparkles,
      iconClass: "text-amber-600 bg-amber-50",
    },
    {
      title: "High risk",
      value: stats.highRiskCount,
      subtitle: "Needs review",
      icon: ShieldAlert,
      iconClass: "text-red-600 bg-red-50",
    },
    {
      title: "Mean FRP",
      value: `${stats.avgFRP} MW`,
      subtitle: `Confidence: ${getConfidenceLevel(stats.avgConfidence)}`,
      icon: AlertTriangle,
      iconClass: "text-primary bg-muted",
    },
  ];

  return (
    <div className="grid w-full grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <Card
            key={card.title}
            className="rounded-3xl border-border bg-white py-0 mira-shadow"
          >
            <CardContent className="flex h-full flex-col justify-between p-3">
              <div className="mb-3 flex items-start justify-between gap-2">
                <span className="text-xs text-muted-foreground">{card.title}</span>
                <div className={`shrink-0 rounded-xl p-1.5 ${card.iconClass}`}>
                  <Icon className="size-4" aria-hidden="true" />
                </div>
              </div>
              <div>
                <div className="font-mono text-2xl tracking-tight text-foreground">
                  {card.value}
                </div>
                <div className="mt-1 line-clamp-1 text-xs text-muted-foreground">
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
