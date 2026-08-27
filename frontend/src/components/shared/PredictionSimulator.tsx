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
import { PredictRequest, PredictResponse, ThermalEvent, getConfidenceLevel } from "@/types/thermal";
import { predictThermalEvent } from "@/services/predictionService";
import { AlertCircle, BrainCircuit, CheckCircle2, Factory, Flame, Loader2, Play, Trees, Wheat } from "lucide-react";

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
  const [error, setError] = useState<string | null>(null);

  const handleRunPredict = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await predictThermalEvent(formData);
      setResult(res);
    } catch (err) {
      console.error("Predict error:", err);
      setResult(null);
      setError("Unable to reach the prediction API. Start the backend at http://localhost:8000 and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const applyPreset = (type: "refinery" | "wildfire" | "flare" | "crop") => {
    if (type === "refinery") {
      setFormData({
        latitude: 21.0944,
        longitude: 85.0742,
        frp: 168.4,
        brightness_temperature: 352.6,
        persistence_score: 0.95,
        night_ratio: 0.94,
        cluster_size: 6,
        distance_to_industry: 120,
        land_cover: "Thermal Power Station",
      });
    } else if (type === "wildfire") {
      setFormData({
        latitude: 21.95,
        longitude: 86.40,
        frp: 195.0,
        brightness_temperature: 354.0,
        persistence_score: 0.1,
        night_ratio: 0.25,
        cluster_size: 22,
        distance_to_industry: 15400,
        land_cover: "Protected Forest Reserve",
      });
    } else if (type === "flare") {
      setFormData({
        latitude: 20.9250,
        longitude: 85.1650,
        frp: 82.5,
        brightness_temperature: 334.8,
        persistence_score: 0.98,
        night_ratio: 0.98,
        cluster_size: 1,
        distance_to_industry: 80,
        land_cover: "Gasification Plant",
      });
    } else if (type === "crop") {
      setFormData({
        latitude: 20.68,
        longitude: 85.60,
        frp: 58.0,
        brightness_temperature: 324.5,
        persistence_score: 0.05,
        night_ratio: 0.1,
        cluster_size: 11,
        distance_to_industry: 5400,
        land_cover: "Agricultural Cropland",
      });
    }
    setResult(null);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="z-[700] max-h-[90vh] w-full overflow-y-auto rounded-3xl bg-white p-6 sm:max-w-2xl">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl border border-border bg-muted text-primary">
              <BrainCircuit className="size-5" aria-hidden="true" />
            </div>
            <div>
              <DialogTitle className="text-base font-normal">
                Classification simulator
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Run the backend pipeline with custom geospatial and thermal parameters.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-3 pt-3">
          <span className="text-[11px] text-muted-foreground">Odisha presets</span>
          <div className="flex flex-wrap gap-3">
            <Button
              variant="outline"
              size="sm"
              className="h-11 rounded-xl text-xs font-normal"
              onClick={() => applyPreset("refinery")}
            >
              <Factory className="size-3.5" aria-hidden="true" />
              NTPC Talcher
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-11 rounded-xl text-xs font-normal"
              onClick={() => applyPreset("wildfire")}
            >
              <Trees className="size-3.5" aria-hidden="true" />
              Similipal wildfire
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-11 rounded-xl text-xs font-normal"
              onClick={() => applyPreset("flare")}
            >
              <Flame className="size-3.5" aria-hidden="true" />
              Talcher flare
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-11 rounded-xl text-xs font-normal"
              onClick={() => applyPreset("crop")}
            >
              <Wheat className="size-3.5" aria-hidden="true" />
              Dhenkanal crop residue
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
        {error && (
          <div role="alert" className="mt-3 flex items-start gap-2 rounded-3xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">
            <AlertCircle className="mt-0.5 size-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
        {result && (
          <div className="mt-3 space-y-3 rounded-3xl border border-border bg-muted p-3">
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
              <span className="rounded-xl bg-white px-2.5 py-0.5 font-mono text-xs text-foreground">
                {getConfidenceLevel(result.confidence)} Confidence
              </span>
            </div>

            <Progress value={result.confidence * 100} className="h-2 bg-white" />

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
