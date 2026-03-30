import { useState } from "react";
import { motion } from "framer-motion";
import { Upload, RefreshCw, Database, FileText, CheckCircle, Terminal, Server } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { PageTransition, StaggerContainer, StaggerItem, FloatIn } from "@/components/Animations";
import { AnimatedCounter } from "@/components/AnimatedCounter";

export default function AdminPage() {
  const { toast } = useToast();
  const [isTraining, setIsTraining] = useState(false);
  const [trainingProgress, setTrainingProgress] = useState(0);
  const [modelStatus, setModelStatus] = useState({
    accuracy: 0.982,
    lastTrained: "2026-03-15 14:30:00",
    records: 50000,
    features: 9,
  });

  const handleRetrain = () => {
    setIsTraining(true);
    setTrainingProgress(0);
    
    const interval = setInterval(() => {
      setTrainingProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + Math.random() * 15;
      });
    }, 300);

    setTimeout(() => {
      clearInterval(interval);
      setTrainingProgress(100);
      setIsTraining(false);
      setModelStatus(prev => ({
        ...prev,
        accuracy: 0.978 + Math.random() * 0.02,
        lastTrained: new Date().toISOString().replace("T", " ").slice(0, 19),
      }));
      toast({ title: "Model retrained successfully", description: "RandomForest model updated with latest data." });
    }, 2500);
  };

  const handleUpload = () => {
    toast({ title: "Dataset uploaded", description: "1,247 new records added to the training set." });
    setModelStatus(prev => ({ ...prev, records: prev.records + 1247 }));
  };

  const statCards = [
    { label: "Model Accuracy", value: `${(modelStatus.accuracy * 100).toFixed(1)}%`, icon: CheckCircle, bgClass: "severity-low-bg", textClass: "severity-low-text" },
    { label: "Training Records", value: modelStatus.records.toLocaleString(), icon: Database, bgClass: "bg-primary/10", textClass: "text-primary" },
    { label: "Features", value: modelStatus.features.toString(), icon: FileText, bgClass: "severity-medium-bg", textClass: "severity-medium-text" },
    { label: "Last Trained", value: modelStatus.lastTrained.split(" ")[0], icon: Server, bgClass: "bg-muted", textClass: "text-muted-foreground" },
  ];

  return (
    <PageTransition>
      <div className="min-h-screen relative">
        <div className="fixed inset-0 -z-10 bg-gradient-to-br from-background via-background to-primary/5">
          <div className="absolute top-1/4 left-1/4 w-72 h-72 rounded-full bg-primary/3 blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto px-4 py-8">
          <FloatIn>
            <div className="mb-8">
              <h1 className="text-2xl font-bold tracking-tight">Admin Panel</h1>
              <p className="text-sm text-muted-foreground mt-1">Manage ML model, datasets, and system configuration.</p>
            </div>
          </FloatIn>

          {/* Stats */}
          <StaggerContainer className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {statCards.map((card) => (
              <StaggerItem key={card.label}>
                <motion.div
                  className={`card-elevated p-5 ${card.bgClass} rounded-xl backdrop-blur-sm bg-card/80 border border-border/20`}
                  whileHover={{ y: -2, scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <card.icon className={`h-5 w-5 ${card.textClass} mb-2`} />
                  <AnimatedCounter value={card.value} className={`mono text-xl font-bold ${card.textClass} block`} />
                  <div className="text-xs text-muted-foreground mt-1">{card.label}</div>
                </motion.div>
              </StaggerItem>
            ))}
          </StaggerContainer>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Upload Dataset */}
            <FloatIn delay={0.2}>
              <div className="card-elevated p-6 rounded-xl bg-card/90 backdrop-blur-sm">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Upload className="h-4 w-4 text-primary" /> Upload Dataset
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Upload a CSV file with accident records to expand the training set.
                </p>
                <motion.div
                  className="border-2 border-dashed border-border/50 rounded-xl p-10 text-center cursor-pointer hover:border-primary/50 transition-all duration-300 group"
                  onClick={handleUpload}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  <motion.div
                    animate={{ y: [0, -4, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <Upload className="h-10 w-10 text-muted-foreground/40 group-hover:text-primary/60 transition-colors mx-auto mb-3" />
                  </motion.div>
                  <p className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">Click to upload CSV file</p>
                  <p className="text-xs text-muted-foreground mt-1">Max 50MB</p>
                </motion.div>
              </div>
            </FloatIn>

            {/* Retrain Model */}
            <FloatIn delay={0.3}>
              <div className="card-elevated p-6 rounded-xl bg-card/90 backdrop-blur-sm">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <RefreshCw className="h-4 w-4 text-primary" /> Retrain Model
                </h3>
                <div className="space-y-3 mb-6">
                  {[
                    { k: "Algorithm", v: "RandomForestClassifier" },
                    { k: "Estimators", v: "100" },
                    { k: "Max Depth", v: "10" },
                    { k: "Accuracy", v: `${(modelStatus.accuracy * 100).toFixed(1)}%`, highlight: true },
                  ].map(row => (
                    <div key={row.k} className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{row.k}</span>
                      <span className={`mono font-medium ${row.highlight ? "severity-low-text" : ""}`}>{row.v}</span>
                    </div>
                  ))}
                </div>

                {isTraining && (
                  <motion.div
                    className="mb-4"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                  >
                    <div className="flex justify-between text-xs text-muted-foreground mb-1">
                      <span>Training progress</span>
                      <span className="mono">{Math.min(Math.round(trainingProgress), 100)}%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-primary rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(trainingProgress, 100)}%` }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                  </motion.div>
                )}

                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button className="btn-primary w-full" onClick={handleRetrain} disabled={isTraining}>
                    {isTraining ? (
                      <span className="flex items-center gap-2">
                        <RefreshCw className="h-4 w-4 animate-spin" /> Training Model...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <RefreshCw className="h-4 w-4" /> Retrain Model
                      </span>
                    )}
                  </Button>
                </motion.div>
              </div>
            </FloatIn>
          </div>

          {/* System Logs */}
          <FloatIn delay={0.4}>
            <div className="card-elevated p-6 mt-6 rounded-xl bg-card/90 backdrop-blur-sm">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Terminal className="h-4 w-4 text-primary" /> System Logs
              </h3>
              <div className="bg-foreground/[0.03] border border-border/50 rounded-lg p-4 font-mono text-xs space-y-1.5 max-h-64 overflow-y-auto">
                {[
                  { msg: "Model loaded successfully", type: "info" },
                  { msg: "Feature pipeline initialized (9 features)", type: "info" },
                  { msg: `Model accuracy: ${(modelStatus.accuracy * 100).toFixed(1)}%`, type: "success" },
                  { msg: "API endpoint /predict ready", type: "info" },
                  { msg: "API endpoint /train ready", type: "info" },
                  { msg: "System health: OK", type: "success" },
                ].map((log, i) => (
                  <motion.p
                    key={i}
                    className={log.type === "success" ? "severity-low-text" : "text-muted-foreground"}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + i * 0.08 }}
                  >
                    <span className="text-muted-foreground/50">[{modelStatus.lastTrained}]</span> {log.msg}
                  </motion.p>
                ))}
              </div>
            </div>
          </FloatIn>
        </div>
      </div>
    </PageTransition>
  );
}
