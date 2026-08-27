import React from "react";
import { ThermalEvent, getConfidenceLevel } from "@/types/thermal";
import { Progress } from "@/components/ui/progress";
import { BrainCircuit, CheckCircle2, ShieldCheck, Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface ExplainabilityPanelProps {
  event: ThermalEvent;
}

export function ExplainabilityPanel({ event }: ExplainabilityPanelProps) {
  const confLevel = getConfidenceLevel(event.confidence);

  return (
    <div className="space-y-3">
      <div className="rounded-3xl border border-border bg-muted p-3">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-foreground">
            <BrainCircuit className="size-4 text-primary" aria-hidden="true" />
            <span>Model confidence</span>
          </div>
          <span
            className={`rounded-xl px-2 py-0.5 font-mono text-xs ${
              confLevel === "High"
                ? "bg-emerald-50 text-emerald-800"
                : confLevel === "Medium"
                ? "border border-border bg-white text-foreground"
                : "border border-border bg-white text-muted-foreground"
            }`}
          >
            {confLevel}
          </span>
        </div>
        <Progress value={event.confidence} className="h-2 bg-white" />
        <div className="mt-3 flex items-center justify-between text-[11px] text-muted-foreground">
          <span>{event.classification}</span>
          <span className="font-mono">XGBoost-FIRMS v2.4</span>
        </div>
      </div>

      <div>
        <div className="mb-3 flex items-center gap-1.5 text-xs text-foreground">
          <ShieldCheck className="size-4 text-primary" aria-hidden="true" />
          <span>Decision reasoning</span>
        </div>
        <ul className="space-y-3">
          {event.reasoning.map((reason, index) => (
            <li
              key={index}
              className="flex items-start gap-2 rounded-3xl border border-border bg-white p-3 text-xs mira-shadow"
            >
              <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
              <span className="leading-relaxed text-foreground">{reason}</span>
            </li>
          ))}
        </ul>
      </div>

      {event.feature_weights && event.feature_weights.length > 0 && (
        <TooltipProvider>
          <div>
            <div className="mb-3 flex items-center justify-between text-xs text-foreground">
              <div className="flex items-center gap-1">
                <span>Key features</span>
                <Tooltip>
                  <TooltipTrigger className="inline-flex items-center" aria-label="About SHAP weights">
                    <Info className="size-3 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs text-xs">
                    SHAP feature attribution weights calculating how each observation influenced this classification.
                  </TooltipContent>
                </Tooltip>
              </div>
              <span className="font-mono text-[11px] text-muted-foreground">SHAP</span>
            </div>

            <div className="space-y-3">
              {event.feature_weights.map((fw) => (
                <div key={fw.feature} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-foreground">{fw.feature}</span>
                    <span className="font-mono text-muted-foreground">{fw.importance}%</span>
                  </div>
                  <Progress value={fw.importance} className="h-1.5 bg-muted" />
                  <div className="text-[11px] text-muted-foreground">{fw.description}</div>
                </div>
              ))}
            </div>
          </div>
        </TooltipProvider>
      )}
    </div>
  );
}
