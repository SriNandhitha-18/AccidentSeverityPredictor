import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RotateCcw, Activity, Sparkles, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PredictionForm } from "@/components/PredictionForm";
import { PredictionResultCard } from "@/components/PredictionResult";
import { AccidentMap } from "@/components/AccidentMap";
import { predict, savePrediction, getLastPrediction, clearLastPrediction, type PredictionInput, type PredictionResult } from "@/lib/prediction-engine";
import { apiPredict } from "@/lib/api";
import { PageTransition, FloatIn } from "@/components/Animations";
import { PulsingDot } from "@/components/AnimatedCounter";
import { useToast } from "@/hooks/use-toast";

export default function PredictionPage() {
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [backendConnected, setBackendConnected] = useState<boolean | null>(null);
  const [showMap, setShowMap] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const last = getLastPrediction();
    if (last) setResult(last.result);
  }, []);

  const handleSubmit = useCallback(async (input: PredictionInput) => {
    setIsLoading(true);
    try {
      const apiResult = await apiPredict({
        weather: input.weather, road_condition: input.roadCondition, vehicle_type: input.vehicleType,
        speed: input.speed, driver_age: input.driverAge, traffic_density: input.trafficDensity,
        time_of_day: input.timeOfDay, light_condition: input.lightCondition, alcohol_involvement: input.alcoholInvolvement,
      });
      setBackendConnected(true);
      const prediction: PredictionResult = {
        severity: apiResult.severity, label: apiResult.label, probability: apiResult.probability,
        factors: apiResult.factors, recommendations: apiResult.recommendations, confidence: apiResult.confidence,
      };
      savePrediction(input, prediction);
      setResult(prediction);
      setShowMap(true);
      toast({ title: "Prediction complete", description: `Severity: ${prediction.label} (${Math.round(prediction.probability * 100)}%)` });
    } catch {
      setBackendConnected(false);
      await new Promise(r => setTimeout(r, 600));
      const prediction = predict(input);
      savePrediction(input, prediction);
      setResult(prediction);
      setShowMap(true);
      toast({ title: "Prediction complete (offline)", description: `Severity: ${prediction.label} (${Math.round(prediction.probability * 100)}%)` });
    }
    setIsLoading(false);
  }, [toast]);

  const handleReset = () => {
    setResult(null);
    setShowMap(false);
    clearLastPrediction();
  };

  return (
    <PageTransition>
      <div className="min-h-screen relative">
        <div className="fixed inset-0 -z-10 bg-gradient-to-br from-background via-background to-primary/5">
          <div className="absolute top-1/4 -left-20 w-72 h-72 rounded-full bg-primary/5 blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 -right-20 w-80 h-80 rounded-full bg-severity-high/5 blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
        </div>

        <div className="max-w-7xl mx-auto px-4 py-8">
          <FloatIn>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                  <Sparkles className="h-6 w-6 text-primary" />
                  Risk Assessment
                </h1>
                <p className="text-sm text-muted-foreground mt-1">Enter accident parameters to generate a severity prediction.</p>
              </div>
              <motion.div
                className="flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-full bg-card/80 backdrop-blur-sm border border-border/50"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                {backendConnected === null ? (
                  <><span className="w-1.5 h-1.5 rounded-full bg-muted-foreground" /><span className="text-muted-foreground">Checking backend...</span></>
                ) : backendConnected ? (
                  <><PulsingDot color="hsl(var(--severity-0))" size={6} /><span className="severity-low-text">Backend connected</span></>
                ) : (
                  <><span className="w-1.5 h-1.5 rounded-full bg-severity-medium" /><span className="severity-medium-text">Client-side mode</span></>
                )}
              </motion.div>
            </div>
          </FloatIn>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <FloatIn delay={0.1}>
              <motion.div className="card-elevated p-6 backdrop-blur-sm bg-card/90" layout>
                <PredictionForm onSubmit={handleSubmit} isLoading={isLoading} />
              </motion.div>
            </FloatIn>

            <div>
              <AnimatePresence mode="wait">
                {isLoading ? (
                  <motion.div key="loading" className="space-y-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.3 }}>
                    {[1, 2, 3].map(i => (
                      <motion.div key={i} className="card-surface p-6 rounded-xl overflow-hidden relative bg-card/80 backdrop-blur-sm" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                        <div className="h-4 bg-muted rounded w-1/3 mb-3" />
                        <div className="h-8 bg-muted rounded w-2/3 mb-2" />
                        <div className="h-3 bg-muted rounded w-1/2" />
                        <motion.div className="absolute inset-0 bg-gradient-to-r from-transparent via-foreground/[0.03] to-transparent" animate={{ x: ["-100%", "200%"] }} transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }} />
                      </motion.div>
                    ))}
                  </motion.div>
                ) : result ? (
                  <motion.div key="result" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}>
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-lg font-semibold">Analysis Result</h2>
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button variant="outline" size="sm" onClick={handleReset} className="gap-1.5">
                          <RotateCcw className="h-3.5 w-3.5" /> New Prediction
                        </Button>
                      </motion.div>
                    </div>
                    <PredictionResultCard result={result} />
                  </motion.div>
                ) : (
                  <motion.div key="empty" className="card-surface p-16 text-center rounded-xl border border-dashed border-border/50 bg-card/60 backdrop-blur-sm" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ delay: 0.2 }}>
                    <motion.div animate={{ y: [0, -6, 0] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}>
                      <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                        <Activity className="h-8 w-8 text-primary" />
                      </div>
                    </motion.div>
                    <p className="text-lg font-semibold mb-1">No prediction yet</p>
                    <p className="text-sm text-muted-foreground">Fill in the form and click "Generate Risk Profile"</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Map section after prediction */}
          <AnimatePresence>
            {(showMap || result) && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 30 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="mt-8"
              >
                <FloatIn delay={0.3}>
                  <div className="flex items-center gap-2 mb-4">
                    <MapPin className="h-5 w-5 text-primary" />
                    <h2 className="text-lg font-semibold">Prediction Location</h2>
                  </div>
                  <AccidentMap />
                </FloatIn>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </PageTransition>
  );
}
