// Client-side prediction engine simulating a Random Forest classifier

export interface PredictionInput {
  weather: string;
  roadCondition: string;
  vehicleType: string;
  speed: number;
  driverAge: number;
  trafficDensity: string;
  timeOfDay: string;
  lightCondition: string;
  alcoholInvolvement: boolean;
}

export interface PredictionResult {
  severity: number;
  label: string;
  probability: number;
  factors: string[];
  recommendations: string[];
  confidence: number[];
}

const SEVERITY_LABELS = ["Low", "Medium", "High", "Fatal"] as const;

const weatherWeights: Record<string, number> = { sunny: 0, clear: 0, rainy: 0.25, foggy: 0.35, storm: 0.5 };
const roadWeights: Record<string, number> = { dry: 0, wet: 0.2, damaged: 0.4 };
const vehicleWeights: Record<string, number> = { car: 0.1, bus: 0.15, truck: 0.2, bike: 0.35 };
const trafficWeights: Record<string, number> = { low: 0, medium: 0.15, high: 0.3 };
const timeWeights: Record<string, number> = { morning: 0.05, afternoon: 0, evening: 0.15, night: 0.3 };
const lightWeights: Record<string, number> = { day: 0, night: 0.25 };

export function predict(input: PredictionInput): PredictionResult {
  let score = 0;
  const factors: string[] = [];

  score += weatherWeights[input.weather] ?? 0;
  if ((weatherWeights[input.weather] ?? 0) > 0.2) factors.push(`Adverse Weather: ${input.weather}`);

  score += roadWeights[input.roadCondition] ?? 0;
  if ((roadWeights[input.roadCondition] ?? 0) > 0.1) factors.push(`Road Condition: ${input.roadCondition}`);

  const speedScore = Math.min(Math.max((input.speed - 40) / 120, 0), 1) * 0.5;
  score += speedScore;
  if (input.speed > 80) factors.push(`High Speed: ${input.speed} km/h`);

  score += vehicleWeights[input.vehicleType] ?? 0;
  if (input.vehicleType === "bike") factors.push("Vulnerable Vehicle: Bike");

  const ageFactor = input.driverAge < 25 ? 0.2 : input.driverAge > 65 ? 0.25 : 0;
  score += ageFactor;
  if (ageFactor > 0) factors.push(input.driverAge < 25 ? "Young Driver" : "Elderly Driver");

  score += trafficWeights[input.trafficDensity] ?? 0;
  if (input.trafficDensity === "high") factors.push("High Traffic Density");

  score += timeWeights[input.timeOfDay] ?? 0;
  if (input.timeOfDay === "night") factors.push("Night Conditions");

  score += lightWeights[input.lightCondition] ?? 0;

  if (input.alcoholInvolvement) {
    score += 0.4;
    factors.push("Alcohol Involvement");
  }

  const normalizedScore = Math.min(score / 2.0, 1);
  const variance = (Math.random() - 0.5) * 0.08;
  const finalScore = Math.min(Math.max(normalizedScore + variance, 0.02), 0.98);

  let severity: number;
  if (finalScore < 0.25) severity = 0;
  else if (finalScore < 0.5) severity = 1;
  else if (finalScore < 0.75) severity = 2;
  else severity = 3;

  const confidence = [0, 0, 0, 0];
  confidence[severity] = finalScore * 0.6 + 0.3;
  for (let i = 0; i < 4; i++) {
    if (i !== severity) confidence[i] = (1 - confidence[severity]) / 3;
  }

  return {
    severity,
    label: SEVERITY_LABELS[severity],
    probability: Math.round(confidence[severity] * 100) / 100,
    factors: factors.length > 0 ? factors : ["Normal conditions"],
    recommendations: getRecommendations(severity, factors),
    confidence: confidence.map(c => Math.round(c * 100) / 100),
  };
}

function getRecommendations(severity: number, factors: string[]): string[] {
  const base: string[] = [];
  if (severity >= 2) { base.push("Reduce speed immediately"); base.push("Maintain maximum safe following distance"); }
  if (severity >= 3) { base.push("Consider delaying travel if possible"); base.push("Deploy emergency response units on standby"); base.push("Check structural road barriers"); }
  if (factors.some(f => f.includes("Weather"))) { base.push("Activate hazard lights in low visibility"); base.push("Avoid sudden braking on wet surfaces"); }
  if (factors.some(f => f.includes("Night"))) { base.push("Ensure all vehicle lights are operational"); base.push("Increase awareness at intersections"); }
  if (factors.some(f => f.includes("Alcohol"))) { base.push("Do not operate vehicle under influence"); base.push("Arrange alternative transportation"); }
  if (factors.some(f => f.includes("Speed"))) { base.push("Reduce speed to posted limit"); }
  if (base.length === 0) { base.push("Standard driving precautions apply"); base.push("Maintain awareness of surroundings"); }
  return base.slice(0, 5);
}

// ============ Persistent storage ============

const STORAGE_KEY = "accident-predictions";
const LAST_RESULT_KEY = "accident-last-result";

export interface PredictionRecord {
  id: string;
  timestamp: string;
  input: PredictionInput;
  result: PredictionResult;
  lat?: number;
  lng?: number;
}

function loadHistory(): PredictionRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as PredictionRecord[];
  } catch { return []; }
}

function persistHistory(records: PredictionRecord[]) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(records)); } catch { /* full */ }
}

let predictionHistory: PredictionRecord[] = loadHistory();

// Generate a random location near Hyderabad for map markers
function randomHyderabadLocation(): { lat: number; lng: number } {
  const baseLat = 17.385;
  const baseLng = 78.4867;
  return {
    lat: baseLat + (Math.random() - 0.5) * 0.15,
    lng: baseLng + (Math.random() - 0.5) * 0.2,
  };
}

export function savePrediction(input: PredictionInput, result: PredictionResult, location?: { lat: number; lng: number }) {
  const loc = location ?? randomHyderabadLocation();
  const record: PredictionRecord = {
    id: Math.random().toString(36).slice(2, 10),
    timestamp: new Date().toISOString(),
    input,
    result,
    lat: loc.lat,
    lng: loc.lng,
  };
  predictionHistory.unshift(record);
  if (predictionHistory.length > 100) predictionHistory = predictionHistory.slice(0, 100);
  persistHistory(predictionHistory);

  try { localStorage.setItem(LAST_RESULT_KEY, JSON.stringify({ input, result, lat: loc.lat, lng: loc.lng })); } catch { /* ignore */ }

  return record;
}

export function getLastPrediction(): { input: PredictionInput; result: PredictionResult } | null {
  try {
    const raw = localStorage.getItem(LAST_RESULT_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch { return null; }
}

export function clearLastPrediction() { localStorage.removeItem(LAST_RESULT_KEY); }

export function getHistory(): PredictionRecord[] { return predictionHistory; }

export function clearHistory() {
  predictionHistory = [];
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(LAST_RESULT_KEY);
}

export function getDashboardStats() {
  const total = predictionHistory.length;
  const low = predictionHistory.filter(p => p.result.severity === 0).length;
  const medium = predictionHistory.filter(p => p.result.severity === 1).length;
  const high = predictionHistory.filter(p => p.result.severity === 2).length;
  const fatal = predictionHistory.filter(p => p.result.severity === 3).length;

  const severityDistribution = [
    { name: "Low", value: low || 3, fill: "hsl(160, 84%, 39%)" },
    { name: "Medium", value: medium || 5, fill: "hsl(45, 93%, 47%)" },
    { name: "High", value: high || 2, fill: "hsl(27, 96%, 61%)" },
    { name: "Fatal", value: fatal || 1, fill: "hsl(0, 72%, 51%)" },
  ];

  const vehicleData = [
    { vehicle: "Car", low: 4, medium: 3, high: 2, fatal: 1 },
    { vehicle: "Bike", low: 1, medium: 2, high: 4, fatal: 3 },
    { vehicle: "Truck", low: 3, medium: 4, high: 3, fatal: 1 },
    { vehicle: "Bus", low: 5, medium: 3, high: 1, fatal: 0 },
  ];

  const timeData = [
    { time: "Morning", accidents: 12 },
    { time: "Afternoon", accidents: 18 },
    { time: "Evening", accidents: 24 },
    { time: "Night", accidents: 31 },
  ];

  const weatherData = [
    { name: "Sunny", value: 15, fill: "hsl(45, 93%, 47%)" },
    { name: "Rainy", value: 28, fill: "hsl(210, 79%, 54%)" },
    { name: "Foggy", value: 18, fill: "hsl(215, 20%, 65%)" },
    { name: "Storm", value: 12, fill: "hsl(239, 84%, 67%)" },
  ];

  return { total: total || 11, low: low || 3, medium: medium || 5, high: high || 2, fatal: fatal || 1, severityDistribution, vehicleData, timeData, weatherData };
}
