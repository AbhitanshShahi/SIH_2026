import React from "react";
import { Button } from "@/components/ui/button";
import { Layers, Plus, Minus, Compass } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface MapControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetView: () => void;
  showHeatmap: boolean;
  onToggleHeatmap: () => void;
  showOSMIndustry: boolean;
  onToggleOSMIndustry: () => void;
}

export function MapControls({
  onZoomIn,
  onZoomOut,
  onResetView,
  showHeatmap,
  onToggleHeatmap,
  showOSMIndustry,
  onToggleOSMIndustry,
}: MapControlsProps) {
  return (
    <div className="absolute top-4 right-4 z-[400] flex flex-col gap-3">
      <div className="flex flex-col overflow-hidden rounded-xl border border-border bg-white/95 mira-shadow">
        <Button
          variant="ghost"
          size="sm"
          className="size-11 rounded-none border-b border-border p-0 hover:bg-muted"
          onClick={onZoomIn}
          title="Zoom in"
          aria-label="Zoom in"
        >
          <Plus className="size-4 text-foreground" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="size-11 rounded-none p-0 hover:bg-muted"
          onClick={onZoomOut}
          title="Zoom out"
          aria-label="Zoom out"
        >
          <Minus className="size-4 text-foreground" />
        </Button>
      </div>

      <div className="flex flex-col overflow-hidden rounded-xl border border-border bg-white/95 mira-shadow">
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                variant="ghost"
                size="sm"
                className="size-11 p-0 hover:bg-muted"
                title="Map overlays"
                aria-label="Map overlays"
              >
                <Layers className="size-4 text-foreground" />
              </Button>
            }
          />
          <DropdownMenuContent align="end" className="w-52 bg-white z-[500]">
            <DropdownMenuLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              OpenStreetMap overlays
            </DropdownMenuLabel>
            <DropdownMenuItem
              className="text-xs cursor-pointer flex items-center justify-between"
              onClick={onToggleHeatmap}
            >
              <span>Thermal Heat Glow</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${showHeatmap ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                {showHeatmap ? "ON" : "OFF"}
              </span>
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-xs cursor-pointer flex items-center justify-between"
              onClick={onToggleOSMIndustry}
            >
              <span>Industrial proximity buffers</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${showOSMIndustry ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                {showOSMIndustry ? "ON" : "OFF"}
              </span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button
          variant="ghost"
          size="sm"
          className="size-11 rounded-none border-t border-border p-0 hover:bg-muted"
          onClick={onResetView}
          title="Reset to all India bounds"
          aria-label="Reset View"
        >
          <Compass className="size-4 text-foreground" />
        </Button>
      </div>
    </div>
  );
}
