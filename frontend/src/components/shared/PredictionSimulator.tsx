"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { PredictRequest, PredictResponse, ThermalEvent } from "@/types/thermal";
import { predictThermalEvent } from "@/services/predictionService";
import { Sparkles, BrainCircuit, CheckCircle2, Loader2, Play } from "lucide-react";

interface PredictionSimulatorProps {
  isOpen: boolean;
  onClose: () => void;
  initialEvent?: ThermalEvent | null;
}

export function PredictionSimulator({
  isOpen,
  onClose,
  initialEvent,
}: PredictionSimulatorProps) {
  const [formData, setFormData] = useState<PredictRequest>({
    latitude: initialEvent ? initialEvent.location.latitude : 22.33,
    longitude: initialEvent ? initialEvent.location.longitude : 70.05,
    frp: initialEvent ? initialEvent.frp : 120.0,
    brightness_temperature: initialEvent ? initialEvent.brightness_temperature : 340.0,
    persistence_score: initialEvent ? initialEvent.persistence_days / 35 : 0.9,
    night_ratio: initialEvent ? initialEvent.night_ratio : 0.9,
    cluster_size: initialEvent ? initialEvent.cluster_size : 4,
    distance_to_industry: initialEvent ? initialEvent.distance_to_industry : 250,
    land_cover: initialEvent ? initialEvent.land_cover : "Industrial",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<PredictResponse | null>(null);

  const handleRunPredict = async () => {
    setIsLoading(true);
    try {
      const res = await predictThermalEvent(formData);
      setResult(res);
    } catch (err) {
      console.error("Predict error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const applyPreset = (type: "refinery" | "wildfire" | "flare" | "crop") => {
    if (type === "refinery") {
      setFormData({
        latitude: 22.33,
        longitude: 70.05,
        frp: 135.0,
        brightness_temperature: 345.0,
        persistence_score: 0.95,
        night_ratio: 0.92,
        cluster_size: 5,
        distance_to_industry: 150,
        land_cover: "Refinery / Petrochemical",
      });
    } else if (type === "wildfire") {
      setFormData({
        latitude: 21.95,
        longitude: 86.40,
        frp: 220.0,
        brightness_temperature: 358.0,
        persistence_score: 0.1,
        night_ratio: 0.2,
        cluster_size: 28,
        distance_to_industry: 15000,
        land_cover: "Protected Dense Forest",
      });
    } else if (type === "flare") {
      setFormData({
        latitude: 19.12,
        longitude: 72.88,
        frp: 85.0,
        brightness_temperature: 334.0,
        persistence_score: 0.98,
        night_ratio: 0.99,
        cluster_size: 1,
        distance_to_industry: 50,
        land_cover: "Offshore Gas Platform",
      });
    } else if (type === "crop") {
      setFormData({
        latitude: 30.70,
        longitude: 75.85,
        frp: 65.0,
        brightness_temperature: 325.0,
        persistence_score: 0.05,
        night_ratio: 0.1,
        cluster_size: 12,
        distance_to_industry: 7500,
        land_cover: "Agricultural Wheat Field",
      });
    }
    setResult(null);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-full sm:max-w-2xl bg-white p-5 rounded-2xl z-[700] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
              <BrainCircuit className="size-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold">
                AI Thermal Classification Simulator
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Test the backend classification pipeline (<code className="font-mono">POST /predict</code>) with custom geospatial & thermal parameters.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Preset Scenarios */}
        <div className="space-y-1.5 pt-2">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
            Quick Preset Scenarios:
          </span>
          <div className="flex flex-wrap gap-1.5">
            <Button
              variant="outline"
              size="sm"
              className="text-xs h-7 rounded-lg"
              onClick={() => applyPreset("refinery")}
            >
              🏭 Jamnagar Refinery
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-xs h-7 rounded-lg"
              onClick={() => applyPreset("wildfire")}
            >
              🌲 Similipal Forest Fire
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-xs h-7 rounded-lg"
              onClick={() => applyPreset("flare")}
            >
              🔥 Mumbai High Gas Flare
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-xs h-7 rounded-lg"
              onClick={() => applyPreset("crop")}
            >
              🌾 Punjab Crop Residue
            </Button>
          </div>
        </div>

        {/* Parameter Inputs Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
          <div>
            <label className="text-[11px] font-medium text-foreground block mb-1">
              Latitude (°N)
            </label>
            <Input
              type="number"
              step="0.01"
              value={formData.latitude}
              onChange={(e) => setFormData({ ...formData, latitude: parseFloat(e.target.value) || 0 })}
              className="h-8 text-xs font-mono rounded-lg"
            />
          </div>

          <div>
            <label className="text-[11px] font-medium text-foreground block mb-1">
              Longitude (°E)
            </label>
            <Input
              type="number"
              step="0.01"
              value={formData.longitude}
              onChange={(e) => setFormData({ ...formData, longitude: parseFloat(e.target.value) || 0 })}
              className="h-8 text-xs font-mono rounded-lg"
            />
          </div>

          <div>
            <label className="text-[11px] font-medium text-foreground block mb-1">
              Fire Power FRP (MW)
            </label>
            <Input
              type="number"
              step="1"
              value={formData.frp}
              onChange={(e) => setFormData({ ...formData, frp: parseFloat(e.target.value) || 0 })}
              className="h-8 text-xs font-mono rounded-lg"
            />
          </div>

          <div>
            <label className="text-[11px] font-medium text-foreground block mb-1">
              Persistence Score (0.0 - 1.0)
            </label>
            <Input
              type="number"
              step="0.05"
              min="0"
              max="1"
              value={formData.persistence_score}
              onChange={(e) =>
                setFormData({ ...formData, persistence_score: parseFloat(e.target.value) || 0 })
              }
              className="h-8 text-xs font-mono rounded-lg"
            />
          </div>

          <div>
            <label className="text-[11px] font-medium text-foreground block mb-1">
              Night Ratio (0.0 - 1.0)
            </label>
            <Input
              type="number"
              step="0.05"
              min="0"
              max="1"
              value={formData.night_ratio}
              onChange={(e) =>
                setFormData({ ...formData, night_ratio: parseFloat(e.target.value) || 0 })
              }
              className="h-8 text-xs font-mono rounded-lg"
            />
          </div>

          <div>
            <label className="text-[11px] font-medium text-foreground block mb-1">
              Distance to Industry (m)
            </label>
            <Input
              type="number"
              step="50"
              value={formData.distance_to_industry}
              onChange={(e) =>
                setFormData({ ...formData, distance_to_industry: parseFloat(e.target.value) || 0 })
              }
              className="h-8 text-xs font-mono rounded-lg"
            />
          </div>
        </div>

        {/* Inference Results View */}
        {result && (
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/90 space-y-3 mt-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge
                  className={`text-xs font-bold px-3 py-1 ${
                    result.classification === "Industrial Source"
                      ? "bg-red-600 hover:bg-red-700 text-white"
                      : result.classification === "Natural Fire"
                      ? "bg-blue-600 hover:bg-blue-700 text-white"
                      : result.classification === "Gas Flare"
                      ? "bg-amber-600 hover:bg-amber-700 text-white"
                      : "bg-slate-700 text-white"
                  }`}
                >
                  {result.classification}
                </Badge>
                <span className="text-xs font-semibold text-foreground">
                  Prediction Output
                </span>
              </div>
              <span className="text-xs font-mono font-bold text-foreground">
                {Math.round(result.confidence * 100)}% Confidence
              </span>
            </div>

            <Progress value={result.confidence * 100} className="h-2 bg-slate-200" />

            <div className="space-y-1.5 pt-1">
              <span className="text-[11px] font-semibold text-foreground block">
                Model Reasoning (Explainable AI):
              </span>
              <ul className="space-y-1">
                {result.reasoning.map((r, i) => (
                  <li key={i} className="flex items-start gap-1.5 text-xs text-slate-700">
                    <CheckCircle2 className="size-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        <DialogFooter className="gap-2 sm:gap-0 pt-2">
          <Button variant="outline" size="sm" onClick={onClose} className="rounded-xl">
            Close
          </Button>
          <Button
            size="sm"
            onClick={handleRunPredict}
            disabled={isLoading}
            className="rounded-xl gap-1.5 bg-primary text-primary-foreground shadow-sm"
          >
            {isLoading ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Play className="size-3.5 text-amber-300" />
            )}
            Run Prediction Inference
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
