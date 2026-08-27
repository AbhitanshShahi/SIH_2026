import React from "react";
import { ThermalEvent, getConfidenceLevel } from "@/types/thermal";
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
      <div className="rounded-3xl border border-border bg-white p-8 text-center mira-shadow">
        <p className="text-sm text-muted-foreground">No thermal events match the current filter criteria.</p>
      </div>
    );
  }

  return (
    <div className="w-full overflow-hidden rounded-3xl border border-border bg-white mira-shadow">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-muted">
            <TableRow>
              <TableHead className="w-[120px] text-xs font-normal">Event ID</TableHead>
              <TableHead className="text-xs font-normal">Classification</TableHead>
              <TableHead className="text-xs font-normal">Risk</TableHead>
              <TableHead className="text-right text-xs font-normal">Confidence</TableHead>
              <TableHead className="text-right text-xs font-normal">FRP (MW)</TableHead>
              <TableHead className="text-right text-xs font-normal">Persistence</TableHead>
              <TableHead className="text-xs font-normal">Location</TableHead>
              <TableHead className="text-right text-xs font-normal">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {events.map((event) => {
              const isSelected = selectedEvent?.id === event.id;
              return (
                <TableRow
                  key={event.id}
                  className={`cursor-pointer ${isSelected ? "bg-muted" : "hover:bg-muted/70"}`}
                  onClick={() => onSelectEvent(event)}
                >
                  <TableCell className="font-mono text-xs text-foreground">{event.id}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={`text-[11px] font-normal ${
                        event.classification === "Industrial Source"
                          ? "border-red-200 bg-red-50 text-red-700"
                          : event.classification === "Natural Fire"
                          ? "border-blue-200 bg-blue-50 text-blue-700"
                          : event.classification === "Gas Flare"
                          ? "border-amber-200 bg-amber-50 text-amber-700"
                          : "border-border bg-muted text-foreground"
                      }`}
                    >
                      {event.classification}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span
                      className={`rounded-xl px-2 py-0.5 text-[11px] ${
                        event.risk_level === "High"
                          ? "bg-red-50 text-red-700"
                          : event.risk_level === "Medium"
                          ? "bg-amber-50 text-amber-700"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {event.risk_level}
                    </span>
                  </TableCell>
                  <TableCell className="text-right font-mono text-xs">
                    {getConfidenceLevel(event.confidence)}
                  </TableCell>
                  <TableCell className="text-right font-mono text-xs text-foreground">
                    {event.frp}
                  </TableCell>
                  <TableCell className="text-right font-mono text-xs text-muted-foreground">
                    {event.persistence_days}d
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate text-xs text-foreground">
                    <div className="flex items-center gap-1">
                      <MapPin className="size-3 shrink-0 text-muted-foreground" aria-hidden="true" />
                      <span className="truncate">{event.nearby_facility || event.land_cover}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="size-11 rounded-xl p-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectEvent(event);
                      }}
                      title="Inspect Event"
                      aria-label="Inspect event"
                    >
                      <Eye className="size-3.5" />
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
