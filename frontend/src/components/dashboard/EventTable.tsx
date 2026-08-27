import React from "react";
import { ThermalEvent } from "@/types/thermal";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, MapPin } from "lucide-react";

interface EventTableProps {
  events: ThermalEvent[];
  selectedEvent: ThermalEvent | null;
  onSelectEvent: (event: ThermalEvent) => void;
}

export function EventTable({ events, selectedEvent, onSelectEvent }: EventTableProps) {
  if (events.length === 0) {
    return (
      <div className="p-8 text-center bg-white rounded-xl border border-border">
        <p className="text-sm text-muted-foreground">No thermal events match the current filter criteria.</p>
      </div>
    );
  }

  return (
    <div className="w-full bg-white rounded-2xl border border-border shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-slate-50/80">
            <TableRow>
              <TableHead className="w-[120px] text-xs font-semibold">Event ID</TableHead>
              <TableHead className="text-xs font-semibold">Classification</TableHead>
              <TableHead className="text-xs font-semibold">Risk Level</TableHead>
              <TableHead className="text-xs font-semibold text-right">Confidence</TableHead>
              <TableHead className="text-xs font-semibold text-right">FRP (MW)</TableHead>
              <TableHead className="text-xs font-semibold text-right">Persistence</TableHead>
              <TableHead className="text-xs font-semibold">Location / Facility</TableHead>
              <TableHead className="text-xs font-semibold text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {events.map((event) => {
              const isSelected = selectedEvent?.id === event.id;
              return (
                <TableRow
                  key={event.id}
                  className={`cursor-pointer transition-colors ${
                    isSelected ? "bg-primary/5 font-medium" : "hover:bg-slate-50/60"
                  }`}
                  onClick={() => onSelectEvent(event)}
                >
                  <TableCell className="font-mono text-xs font-semibold text-foreground">
                    {event.id}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={`text-[11px] font-semibold ${
                        event.classification === "Industrial Source"
                          ? "bg-red-50 text-red-700 border-red-200"
                          : event.classification === "Natural Fire"
                          ? "bg-blue-50 text-blue-700 border-blue-200"
                          : event.classification === "Gas Flare"
                          ? "bg-amber-50 text-amber-700 border-amber-200"
                          : "bg-slate-50 text-slate-700 border-slate-200"
                      }`}
                    >
                      {event.classification}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        event.risk_level === "High"
                          ? "bg-red-100 text-red-700"
                          : event.risk_level === "Medium"
                          ? "bg-amber-100 text-amber-700"
                          : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {event.risk_level}
                    </span>
                  </TableCell>
                  <TableCell className="text-right font-mono text-xs font-bold text-foreground">
                    {event.confidence}%
                  </TableCell>
                  <TableCell className="text-right font-mono text-xs font-bold text-foreground">
                    {event.frp}
                  </TableCell>
                  <TableCell className="text-right font-mono text-xs text-muted-foreground">
                    {event.persistence_days}d
                  </TableCell>
                  <TableCell className="text-xs text-foreground max-w-[200px] truncate">
                    <div className="flex items-center gap-1">
                      <MapPin className="size-3 text-muted-foreground shrink-0" />
                      <span className="truncate">{event.nearby_facility || event.land_cover}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="size-7 p-0 rounded-lg"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectEvent(event);
                      }}
                      title="Inspect Event"
                    >
                      <Eye className="size-3.5 text-slate-600" />
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
