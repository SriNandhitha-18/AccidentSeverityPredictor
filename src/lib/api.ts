/**
 * API service for connecting to the Flask backend.
 * Set VITE_API_URL env var to your backend URL (default: http://localhost:5000)
 */

const API_BASE = import.meta.env.VITE_API_URL || "";

export interface ApiPredictionInput {
  weather: string;
  road_condition: string;
  vehicle_type: string;
  speed: number;
  driver_age: number;
  traffic_density: string;
  time_of_day: string;
  light_condition: string;
  alcohol_involvement: boolean;
}

export interface ApiPredictionResult {
  severity: number;
  label: string;
  probability: number;
  confidence: number[];
  factors: string[];
  recommendations: string[];
  timestamp: string;
}

/**
 * Call backend /predict endpoint. Falls back to client-side engine if no backend.
 */
export async function apiPredict(input: ApiPredictionInput): Promise<ApiPredictionResult> {
  if (!API_BASE) throw new Error("NO_BACKEND");

  const res = await fetch(`${API_BASE}/predict`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Server error" }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }

  return res.json();
}

export async function apiTrain(file?: File) {
  if (!API_BASE) throw new Error("NO_BACKEND");

  const formData = new FormData();
  if (file) formData.append("file", file);

  const res = await fetch(`${API_BASE}/train`, {
    method: "POST",
    body: file ? formData : undefined,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Training failed" }));
    throw new Error(err.error);
  }

  return res.json();
}

export async function apiStats() {
  if (!API_BASE) throw new Error("NO_BACKEND");

  const res = await fetch(`${API_BASE}/stats`);
  if (!res.ok) throw new Error("Failed to fetch stats");
  return res.json();
}

export async function apiHealth() {
  if (!API_BASE) throw new Error("NO_BACKEND");

  const res = await fetch(`${API_BASE}/health`);
  if (!res.ok) throw new Error("Backend unhealthy");
  return res.json();
}
