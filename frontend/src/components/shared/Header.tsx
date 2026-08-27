import React from "react";
import { Flame, Radio, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/shared/ThemeToggle";

interface HeaderProps {
  onOpenSimulator: () => void;
  activeCount: number;
}

export function Header({ onOpenSimulator, activeCount }: HeaderProps) {
  return (
    <header className="w-full bg-white dark:bg-slate-950 border-b border-border/80 sticky top-0 z-40 px-4 sm:px-6 py-3 shadow-[0_1px_4px_rgba(0,0,0,0.03)]">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Brand & Identity */}
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-xl bg-gradient-to-br from-red-500 via-orange-500 to-amber-500 flex items-center justify-center shadow-md shadow-orange-500/20 text-white shrink-0">
            <Flame className="size-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold text-foreground tracking-tight">
                AgniDrishti
              </h1>
            </div>
            <p className="text-xs text-muted-foreground line-clamp-1">
              AI Industrial Fire Detection & Thermal Intelligence Platform
            </p>
          </div>
        </div>

        {/* Status Indicators & Simulator Button */}
        <div className="flex items-center gap-2.5 sm:self-center">
          <ThemeToggle />
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium">
            <Radio className="size-3 text-emerald-600 animate-pulse" />
            <span>FIRMS Satellite Live</span>
            <span className="font-mono font-bold text-[11px] bg-emerald-100 px-1 rounded">
              {activeCount}
            </span>
          </div>

          <Button
            variant="default"
            size="sm"
            onClick={onOpenSimulator}
            className="rounded-xl text-xs gap-1.5 bg-foreground text-background hover:bg-slate-800 shadow-sm"
          >
            <Sparkles className="size-3.5 text-amber-400" />
            AI Predict Simulator
          </Button>
        </div>
      </div>
    </header>
  );
}
