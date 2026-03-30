import { motion } from "framer-motion";

interface RiskBarProps {
  severity: number;
}

const levels = [
  { label: "Low", className: "severity-low" },
  { label: "Medium", className: "severity-medium" },
  { label: "High", className: "severity-high" },
  { label: "Fatal", className: "severity-fatal" },
];

export function RiskBar({ severity }: RiskBarProps) {
  return (
    <div className="w-full">
      <div className="flex gap-1 h-3 rounded-full overflow-hidden bg-muted">
        {levels.map((level, i) => (
          <motion.div
            key={level.label}
            className={`flex-1 rounded-full transition-all duration-300 ${
              i <= severity ? level.className : "bg-muted"
            }`}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: i * 0.15, duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
            style={{
              boxShadow: i === severity ? `0 0 0 2px hsl(var(--foreground) / 0.2), 0 0 8px hsl(var(--foreground) / 0.1)` : undefined,
            }}
          />
        ))}
      </div>
      <div className="flex justify-between mt-2 text-xs text-muted-foreground">
        {levels.map((level, i) => (
          <span
            key={level.label}
            className={`font-medium ${i === severity ? "text-foreground" : ""}`}
          >
            {level.label}
          </span>
        ))}
      </div>
    </div>
  );
}
