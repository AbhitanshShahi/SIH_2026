import { PredictRequest, PredictResponse } from "@/types/thermal";
import { request } from "./apiClient";

interface BackendPredictResponse {
  class_id: number;
  class_name: string;
  confidence: number;
  reasoning: string[];
}

function toBackendPredictRequest(params: PredictRequest) {
  const timestamp = new Date();
  const nightRatio = params.night_ratio ?? 0.5;
  const landCover = params.land_cover?.toLowerCase() ?? "";

  return {
    brightness: params.brightness_temperature ?? 330,
    scan: 0.5,
    track: 0.4,
    satellite: "SNPP",
    confidence: "nominal",
    version: 1,
    bright_t31: Math.max((params.brightness_temperature ?? 330) - 35, 0),
    frp: params.frp,
    daynight: nightRatio >= 0.5 ? "N" : "D",
    month: timestamp.getUTCMonth() + 1,
    hour: nightRatio >= 0.5 ? 18 : 12,
    landcover_class: landCover.includes("forest") ? 10 : landCover.includes("agri") || landCover.includes("crop") ? 40 : 50,
  };
}

function toFrontendPredictResponse(response: BackendPredictResponse): PredictResponse {
  const classification = response.class_id === 1 ? "Industrial Source" : response.class_id === 2 ? "Gas Flare" : "Unknown";
  return {
    classification,
    confidence: response.confidence,
    risk_level: response.class_id === 2 || response.class_id === 1 ? "High" : "Low",
    reasoning: response.reasoning,
  };
}

export async function predictThermalEvent(
  params: PredictRequest
): Promise<PredictResponse> {
  const response = await request<BackendPredictResponse>("/predict", {
    method: "POST",
    body: JSON.stringify(toBackendPredictRequest(params)),
  });
  return toFrontendPredictResponse(response);
}
