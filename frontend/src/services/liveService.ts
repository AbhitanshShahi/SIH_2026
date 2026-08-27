import { request } from "./apiClient";

export interface LiveSyncSummary {
  status: string;
  total_fetched: number;
  total_processed: number;
  total_inserted: number;
  total_skipped: number;
  sync_timestamp: string;
  message: string;
}

/** Starts a backend FIRMS ingestion cycle; components should refresh events after it completes. */
export function syncLiveTelemetry(days = 1): Promise<LiveSyncSummary> {
  return request<LiveSyncSummary>(`/live/sync?days=${days}`, { method: "POST" });
}
