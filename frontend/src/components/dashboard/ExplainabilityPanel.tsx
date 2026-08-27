import React from "react";
import { ThermalEvent } from "@/types/thermal";
import { Progress } from "@/components/ui/progress";
import { BrainCircuit, CheckCircle2, ShieldCheck, Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface ExplainabilityPanelProps {
  event: ThermalEvent;
}

export function ExplainabilityPanel({ event }: ExplainabilityPanelProps) {
  return (
    <div className="space-y-4">
      {/* Header with AI Confidence Meter */}
      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5 font-medium text-xs text-foreground">
            <BrainCircuit className="size-4 text-primary" />
            <span>AI Model Confidence</span>
          </div>
          <span className="text-xs font-mono font-bold text-foreground">
            {event.confidence}% Certainty
          </span>
        </div>
        <Progress value={event.confidence} className="h-2 bg-slate-200" />
        <div className="flex items-center justify-between mt-2 text-[10px] text-muted-foreground">
          <span>Threshold $\ge 75\%$ for Auto-Alert</span>
          <span className="font-semibold text-slate-700">Model: XGBoost-FIRMS v2.4</span>
        </div>
      </div>

      {/* Primary Explainable AI Reasoning Chain */}
      <div>
        <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground mb-2">
          <ShieldCheck className="size-4 text-emerald-600" />
          <span>Decision Reasoning Chain</span>
        </div>
        <ul className="space-y-2">
          {event.reasoning.map((reason, index) => (
            <li
              key={index}
              className="flex items-start gap-2 text-xs p-2.5 rounded-lg bg-white border border-border/80 shadow-xs"
            >
              <CheckCircle2 className="size-4 text-emerald-600 shrink-0 mt-0.5" />
              <span className="text-foreground leading-relaxed">{reason}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Feature Importance Attribution */}
      {event.feature_weights && event.feature_weights.length > 0 && (
        <TooltipProvider>
          <div>
            <div className="flex items-center justify-between text-xs font-semibold text-foreground mb-2">
              <div className="flex items-center gap-1">
                <span>Key Predictive Features</span>
                <Tooltip>
                  <TooltipTrigger className="cursor-help inline-flex items-center">
                    <Info className="size-3 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs text-xs">
                    SHAP feature attribution weights calculating how each observation influenced this classification.
                  </TooltipContent>
                </Tooltip>
              </div>
              <span className="text-[10px] text-muted-foreground font-mono">SHAP Weights</span>
            </div>

            <div className="space-y-2.5">
              {event.feature_weights.map((fw) => (
                <div key={fw.feature} className="space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-medium text-foreground">{fw.feature}</span>
                    <span className="font-mono text-muted-foreground">{fw.importance}%</span>
                  </div>
                  <Progress value={fw.importance} className="h-1.5 bg-slate-100" />
                  <div className="text-[10px] text-muted-foreground">{fw.description}</div>
                </div>
              ))}
            </div>
          </div>
        </TooltipProvider>
      )}
    </div>
  );
}
