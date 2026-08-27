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
import { CalendarDays, Search, RotateCcw, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FilterBarProps {
  filters: FilterOptions;
  onChange: (newFilters: FilterOptions) => void;
  onReset: () => void;
  totalFiltered: number;
}

export function FilterBar({ filters, onChange, onReset, totalFiltered }: FilterBarProps) {
  const satellites: SatelliteSource[] = ["Suomi NPP / VIIRS", "NOAA-20 / VIIRS", "Terra / MODIS", "Aqua / MODIS"];
  const updateDateRange = (key: "from" | "to", value: string) => {
    onChange({ ...filters, dateRange: { ...filters.dateRange, [key]: value } });
  };
  const regions = [
    { value: "all", label: "All Regions (Pan-India)" },
    { value: "gujarat", label: "Gujarat Petrochemical Belt" },
    { value: "angul", label: "Angul-Talcher Industrial Hub" },
    { value: "mumbai", label: "Mumbai Offshore Oil & Gas" },
    { value: "forest", label: "Central Forests & Reserves" },
    { value: "punjab", label: "Punjab Agricultural Plain" },
  ];

  return (
    <div className="w-full bg-white p-3 rounded-2xl border border-border/80 shadow-xs space-y-2.5">
      <div className="flex flex-wrap items-center gap-2 flex-1 min-w-[280px]">
        {/* Search input */}
        <div className="relative flex-1 min-w-[180px] max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
          <Input
            value={filters.searchQuery}
            onChange={(e) => onChange({ ...filters, searchQuery: e.target.value })}
            placeholder="Search facility, coordinate, ID..."
            className="pl-8 h-9 text-xs rounded-xl bg-slate-50/70 border-slate-200"
          />
        </div>

        {/* Region Selector */}
        <Select
          value={filters.region}
          onValueChange={(val) => {
            if (val) onChange({ ...filters, region: val });
          }}
        >
          <SelectTrigger className="w-[180px] h-9 text-xs rounded-xl bg-slate-50/70 border-slate-200">
            <SelectValue placeholder="Select Region" />
          </SelectTrigger>
          <SelectContent className="bg-white z-[500]">
            {regions.map((r) => (
              <SelectItem key={r.value} value={r.value} className="text-xs">
                {r.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex items-center gap-1 rounded-xl border border-slate-200 bg-slate-50/70 px-2 h-9" aria-label="Detection date range">
          <CalendarDays className="size-3.5 text-muted-foreground" aria-hidden="true" />
          <Input aria-label="Start date" type="date" value={filters.dateRange?.from ?? ""} onChange={(e) => updateDateRange("from", e.target.value)} className="h-7 w-[118px] border-0 bg-transparent px-0 text-xs shadow-none focus-visible:ring-0" />
          <span className="text-xs text-muted-foreground">to</span>
          <Input aria-label="End date" type="date" value={filters.dateRange?.to ?? ""} onChange={(e) => updateDateRange("to", e.target.value)} className="h-7 w-[118px] border-0 bg-transparent px-0 text-xs shadow-none focus-visible:ring-0" />
        </div>

        {/* Classification Selector */}
        <Select
          value={filters.classification}
          onValueChange={(val) => {
            if (val) onChange({ ...filters, classification: val as ClassificationType | "All" });
          }}
        >
          <SelectTrigger className="w-[150px] h-9 text-xs rounded-xl bg-slate-50/70 border-slate-200">
            <SelectValue placeholder="Classification" />
          </SelectTrigger>
          <SelectContent className="bg-white z-[500]">
            <SelectItem value="All" className="text-xs font-semibold">
              All Types
            </SelectItem>
            <SelectItem value="Industrial Source" className="text-xs text-red-600 font-medium">
              Industrial Source
            </SelectItem>
            <SelectItem value="Natural Fire" className="text-xs text-blue-600 font-medium">
              Natural Fire
            </SelectItem>
            <SelectItem value="Gas Flare" className="text-xs text-amber-600 font-medium">
              Gas Flare
            </SelectItem>
            <SelectItem value="Crop Burning" className="text-xs text-slate-700">
              Crop Burning
            </SelectItem>
            <SelectItem value="Unknown" className="text-xs text-slate-500">
              Unknown
            </SelectItem>
          </SelectContent>
        </Select>

        <Select value={filters.satellite} onValueChange={(val) => val && onChange({ ...filters, satellite: val as SatelliteSource | "All" })}>
          <SelectTrigger className="w-[154px] h-9 text-xs rounded-xl bg-slate-50/70 border-slate-200" aria-label="Satellite source"><SelectValue placeholder="Satellite" /></SelectTrigger>
          <SelectContent className="bg-white z-[500]"><SelectItem value="All" className="text-xs font-semibold">All Satellites</SelectItem>{satellites.map((satellite) => <SelectItem key={satellite} value={satellite} className="text-xs">{satellite}</SelectItem>)}</SelectContent>
        </Select>

        {/* Risk Level Selector */}
        <Select
          value={filters.riskLevel}
          onValueChange={(val) => {
            if (val) onChange({ ...filters, riskLevel: val as RiskLevel | "All" });
          }}
        >
          <SelectTrigger className="w-[120px] h-9 text-xs rounded-xl bg-slate-50/70 border-slate-200">
            <SelectValue placeholder="Risk Level" />
          </SelectTrigger>
          <SelectContent className="bg-white z-[500]">
            <SelectItem value="All" className="text-xs font-semibold">
              All Risks
            </SelectItem>
            <SelectItem value="High" className="text-xs text-red-600 font-medium">
              High Risk
            </SelectItem>
            <SelectItem value="Medium" className="text-xs text-amber-600 font-medium">
              Medium Risk
            </SelectItem>
            <SelectItem value="Low" className="text-xs text-slate-600">
              Low Risk
            </SelectItem>
          </SelectContent>
        </Select>

        <Select value={String(filters.minConfidence)} onValueChange={(val) => val && onChange({ ...filters, minConfidence: Number(val) })}>
          <SelectTrigger className="w-[132px] h-9 text-xs rounded-xl bg-slate-50/70 border-slate-200" aria-label="Minimum confidence"><SelectValue placeholder="Confidence" /></SelectTrigger>
          <SelectContent className="bg-white z-[500]"><SelectItem value="0" className="text-xs">Any confidence</SelectItem><SelectItem value="70" className="text-xs">70% confidence</SelectItem><SelectItem value="85" className="text-xs">85% confidence</SelectItem><SelectItem value="95" className="text-xs">95% confidence</SelectItem></SelectContent>
        </Select>

        <Select value={filters.frpLevel} onValueChange={(val) => val && onChange({ ...filters, frpLevel: val as FrpLevel })}>
          <SelectTrigger className="w-[130px] h-9 text-xs rounded-xl bg-slate-50/70 border-slate-200" aria-label="Fire radiative power level"><SlidersHorizontal className="size-3.5 mr-1 text-muted-foreground" aria-hidden="true" /><SelectValue placeholder="FRP level" /></SelectTrigger>
          <SelectContent className="bg-white z-[500]"><SelectItem value="All" className="text-xs font-semibold">All FRP levels</SelectItem><SelectItem value="Low" className="text-xs">Low (&lt;50 MW)</SelectItem><SelectItem value="Moderate" className="text-xs">Moderate (50–99 MW)</SelectItem><SelectItem value="High" className="text-xs">High (100–149 MW)</SelectItem><SelectItem value="Extreme" className="text-xs">Extreme (150+ MW)</SelectItem></SelectContent>
        </Select>
      </div>

      {/* Filter status count & reset */}
      <div className="flex items-center justify-end gap-2">
        <span className="text-xs text-muted-foreground">
          Showing <strong className="text-foreground font-mono">{totalFiltered}</strong> events
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={onReset}
          className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground rounded-lg"
          title="Reset Filters"
        >
          <RotateCcw className="size-3.5 mr-1" />
          Reset
        </Button>
      </div>
    </div>
  );
}
