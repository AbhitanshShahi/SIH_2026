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
    <header className="sticky top-0 z-40 w-full border-b border-border bg-white mira-shadow">
      <div className="mx-auto flex max-w-7xl flex-col justify-between gap-3 px-3 py-3 sm:flex-row sm:items-center sm:px-6">
        <div className="flex items-center gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-border bg-white text-primary">
            <Flame className="size-5" aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-base tracking-tight text-foreground sm:text-lg">
              AgniDrishti
            </h1>
            <p className="line-clamp-1 text-xs text-muted-foreground">
              Talcher, Odisha · Thermal intelligence
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:self-center">
          <ThemeToggle />
          <div className="flex min-h-11 items-center gap-1.5 rounded-xl border border-border bg-muted px-3 text-xs text-foreground">
            <Radio className="size-3 text-emerald-600" aria-hidden="true" />
            <span>FIRMS live</span>
            <span className="font-mono text-[11px] text-muted-foreground">
              {activeCount}
            </span>
          </div>

          <Button
            variant="default"
            size="sm"
            onClick={onOpenSimulator}
            className="h-11 rounded-xl px-3 text-xs font-normal"
          >
            <Sparkles className="size-3.5" aria-hidden="true" />
            Predict
          </Button>
        </div>
      </div>
    </header>
  );
}
