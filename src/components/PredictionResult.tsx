import { motion } from "framer-motion";
import { AlertTriangle, Shield, ShieldAlert, ShieldOff, ArrowRight } from "lucide-react";
import { SeverityGauge } from "./SeverityGauge";
import { RiskBar } from "./RiskBar";
import type { PredictionResult as PredictionResultType } from "@/lib/prediction-engine";

interface Props {
  result: PredictionResultType;
}

const severityConfig = [
  { icon: Shield, bgClass: "severity-low-bg", textClass: "severity-low-text", label: "LOW RISK" },
  { icon: AlertTriangle, bgClass: "severity-medium-bg", textClass: "severity-medium-text", label: "MEDIUM RISK" },
  { icon: ShieldAlert, bgClass: "severity-high-bg", textClass: "severity-high-text", label: "HIGH RISK" },
  { icon: ShieldOff, bgClass: "severity-fatal-bg", textClass: "severity-fatal-text", label: "FATAL RISK" },
];

export function PredictionResultCard({ result }: Props) {
  const config = severityConfig[result.severity];
  const Icon = config.icon;

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
    >
      {/* Main Result Card */}
      <div className={`card-elevated p-6 ${config.bgClass} rounded-xl`}>
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-xs uppercase tracking-widest text-muted-foreground font-medium mb-1">Predicted Severity</p>
            <h2 className={`text-2xl font-extrabold tracking-tight ${config.textClass}`}>
              {result.label.toUpperCase()}
            </h2>
          </div>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: "spring" }}
          >
            <Icon className={`h-10 w-10 ${config.textClass}`} />
          </motion.div>
        </div>

        <SeverityGauge probability={result.probability} severity={result.severity} />

        <div className="mt-6">
          <RiskBar severity={result.severity} />
        </div>
      </div>

      {/* Contributing Factors */}
      <div className="card-surface p-5">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">Contributing Factors</h3>
        <div className="flex flex-wrap gap-2">
          {result.factors.map((factor, i) => (
            <motion.span
              key={factor}
              className={`text-xs font-medium px-3 py-1.5 rounded-full ${config.bgClass} ${config.textClass}`}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 + i * 0.1 }}
            >
              {factor}
            </motion.span>
          ))}
        </div>
      </div>

      {/* Recommendations */}
      <div className="card-surface p-5">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">Safety Recommendations</h3>
        <ul className="space-y-2">
          {result.recommendations.map((rec, i) => (
            <motion.li
              key={rec}
              className="flex items-start gap-2 text-sm"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 + i * 0.1 }}
            >
              <ArrowRight className="h-4 w-4 text-primary mt-0.5 shrink-0" />
              <span>{rec}</span>
            </motion.li>
          ))}
        </ul>
      </div>

      {/* Confidence Distribution */}
      <div className="card-surface p-5">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">Confidence Distribution</h3>
        <div className="space-y-2">
          {["Low", "Medium", "High", "Fatal"].map((label, i) => (
            <div key={label} className="flex items-center gap-3">
              <span className="text-xs w-14 text-muted-foreground">{label}</span>
              <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                <motion.div
                  className={`h-full rounded-full ${
                    i === 0 ? "severity-low" : i === 1 ? "severity-medium" : i === 2 ? "severity-high" : "severity-fatal"
                  }`}
                  initial={{ width: 0 }}
                  animate={{ width: `${result.confidence[i] * 100}%` }}
                  transition={{ delay: 0.8 + i * 0.1, duration: 0.6 }}
                />
              </div>
              <span className="mono text-xs w-10 text-right">{Math.round(result.confidence[i] * 100)}%</span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
