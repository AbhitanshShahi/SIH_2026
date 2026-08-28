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
      title: "Active detections",
      value: stats.totalEvents,
      subtitle: "NASA FIRMS · Talcher–Angul",
      icon: Activity,
      iconClass: "bg-slate-100 text-slate-700",
    },
    {
      title: "Industrial sources",
      value: stats.industrialCount,
      subtitle: "Facility-linked signatures",
      icon: Flame,
      iconClass: "bg-red-50 text-red-600",
    },
    {
      title: "Gas flares",
      value: stats.flareCount,
      subtitle: "Continuous combustion",
      icon: Sparkles,
      iconClass: "bg-amber-50 text-amber-600",
    },
    {
      title: "High risk",
      value: stats.highRiskCount,
      subtitle: "Requires review",
      icon: ShieldAlert,
      iconClass: "bg-red-50 text-red-600",
    },
    {
      title: "Mean FRP",
      value: `${stats.avgFRP} MW`,
      subtitle: `Mean confidence ${stats.avgConfidence}%`,
      icon: AlertTriangle,
      iconClass: "bg-slate-100 text-slate-700",
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
              <div className="mb-3 flex items-center justify-between gap-2">
                <span className="text-xs font-medium text-foreground">{card.title}</span>
                <div className={`shrink-0 rounded-xl p-1.5 ${card.iconClass}`}>
                  <Icon className="size-4" aria-hidden="true" />
                </div>
              </div>
              <div>
                <div className="font-mono text-2xl font-medium tracking-tight text-foreground">
                  {card.value}
                </div>
                <div className="mt-1 line-clamp-1 text-[11px] text-muted-foreground">
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
