import React from "react";
import { FilterOptions, ClassificationType, FrpLevel, RiskLevel, SatelliteSource } from "@/types/thermal";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, RotateCcw, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FilterBarProps {
  filters: FilterOptions;
  onChange: (newFilters: FilterOptions) => void;
  onReset: () => void;
  totalFiltered: number;
}

function FieldLabel({ htmlFor, children }: { htmlFor?: string; children: React.ReactNode }) {
  return (
    <label htmlFor={htmlFor} className="mb-1 block text-[11px] text-muted-foreground">
      {children}
    </label>
  );
}

export function FilterBar({ filters, onChange, onReset, totalFiltered }: FilterBarProps) {
  const satellites: SatelliteSource[] = ["Suomi NPP / VIIRS", "NOAA-20 / VIIRS", "Terra / MODIS", "Aqua / MODIS"];

  const controlClass = "h-11 w-full min-w-[140px] rounded-xl border-border bg-muted/60 text-xs sm:w-auto";

  const activeFilterCount = [
    filters.classification !== "All",
    filters.riskLevel !== "All",
    filters.satellite !== "All",
    filters.frpLevel !== "All",
    filters.minConfidence > 0,
  ].filter(Boolean).length;

  return (
    <div className="w-full rounded-3xl border border-border bg-white p-3 mira-shadow">
      <div className="flex flex-wrap items-end gap-3">
        <div className="min-w-[180px] max-w-xs flex-1">
          <FieldLabel htmlFor="event-search">Search</FieldLabel>
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <Input
              id="event-search"
              value={filters.searchQuery}
              onChange={(e) => onChange({ ...filters, searchQuery: e.target.value })}
              placeholder="Facility, land cover, or event ID"
              className="h-11 rounded-xl border-border bg-muted/60 pl-8 text-xs"
            />
          </div>
        </div>

        <div>
          <FieldLabel>Type</FieldLabel>
          <Select
            value={filters.classification}
            onValueChange={(val) => {
              if (val) onChange({ ...filters, classification: val as ClassificationType | "All" });
            }}
          >
            <SelectTrigger className={controlClass} aria-label="Classification">
              <SelectValue placeholder="Classification" />
            </SelectTrigger>
            <SelectContent className="z-[500] bg-white">
              <SelectItem value="All" className="text-xs">All types</SelectItem>
              <SelectItem value="Industrial Source" className="text-xs">Industrial Source</SelectItem>
              <SelectItem value="Gas Flare" className="text-xs">Gas Flare</SelectItem>
              <SelectItem value="Other Thermal Anomaly" className="text-xs">Other Thermal Anomaly</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <FieldLabel>Satellite</FieldLabel>
          <Select value={filters.satellite} onValueChange={(val) => val && onChange({ ...filters, satellite: val as SatelliteSource | "All" })}>
            <SelectTrigger className={controlClass} aria-label="Satellite source">
              <SelectValue placeholder="Satellite" />
            </SelectTrigger>
            <SelectContent className="z-[500] bg-white">
              <SelectItem value="All" className="text-xs">All satellites</SelectItem>
              {satellites.map((satellite) => (
                <SelectItem key={satellite} value={satellite} className="text-xs">{satellite}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <FieldLabel>Risk</FieldLabel>
          <Select
            value={filters.riskLevel}
            onValueChange={(val) => {
              if (val) onChange({ ...filters, riskLevel: val as RiskLevel | "All" });
            }}
          >
            <SelectTrigger className={controlClass} aria-label="Risk level">
              <SelectValue placeholder="Risk Level" />
            </SelectTrigger>
            <SelectContent className="z-[500] bg-white">
              <SelectItem value="All" className="text-xs">All risks</SelectItem>
              <SelectItem value="High" className="text-xs">High</SelectItem>
              <SelectItem value="Medium" className="text-xs">Medium</SelectItem>
              <SelectItem value="Low" className="text-xs">Low</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <FieldLabel>Confidence</FieldLabel>
          <Select value={String(filters.minConfidence)} onValueChange={(val) => val && onChange({ ...filters, minConfidence: Number(val) })}>
            <SelectTrigger className={controlClass} aria-label="Minimum confidence level">
              <SelectValue placeholder="Confidence" />
            </SelectTrigger>
            <SelectContent className="z-[500] bg-white">
              <SelectItem value="0" className="text-xs">Any</SelectItem>
              <SelectItem value="1" className="text-xs">Low or higher</SelectItem>
              <SelectItem value="65" className="text-xs">Medium or higher</SelectItem>
              <SelectItem value="85" className="text-xs">High only</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <FieldLabel>FRP</FieldLabel>
          <Select value={filters.frpLevel} onValueChange={(val) => val && onChange({ ...filters, frpLevel: val as FrpLevel })}>
            <SelectTrigger className={controlClass} aria-label="Fire radiative power level">
              <SlidersHorizontal className="mr-1 size-3.5 text-muted-foreground" aria-hidden="true" />
              <SelectValue placeholder="FRP level" />
            </SelectTrigger>
            <SelectContent className="z-[500] bg-white">
              <SelectItem value="All" className="text-xs">All FRP</SelectItem>
              <SelectItem value="Low" className="text-xs">Low (&lt;3 MW)</SelectItem>
              <SelectItem value="Moderate" className="text-xs">Moderate (3–8 MW)</SelectItem>
              <SelectItem value="High" className="text-xs">High (8–20 MW)</SelectItem>
              <SelectItem value="Extreme" className="text-xs">Extreme (20+ MW)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-end gap-3 border-t border-border pt-3">
        {activeFilterCount > 0 && (
          <span className="rounded-xl bg-primary/5 px-2 py-1 text-[11px] text-primary">
            {activeFilterCount} active filter{activeFilterCount === 1 ? "" : "s"}
          </span>
        )}
        <span className="text-xs text-muted-foreground">
          Showing <span className="font-mono text-sm font-medium text-foreground">{totalFiltered}</span> events
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={onReset}
          className="h-11 rounded-xl px-3 text-xs font-normal text-muted-foreground hover:text-foreground"
          title="Reset Filters"
        >
          <RotateCcw className="size-3.5" />
          Reset
        </Button>
      </div>
    </div>
  );
}
