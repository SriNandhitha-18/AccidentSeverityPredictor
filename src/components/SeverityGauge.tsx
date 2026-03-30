import { motion } from "framer-motion";

interface SeverityGaugeProps {
  probability: number;
  severity: number;
}

const SEVERITY_COLORS = [
  "hsl(160, 84%, 39%)",
  "hsl(45, 93%, 47%)",
  "hsl(27, 96%, 61%)",
  "hsl(0, 72%, 51%)",
];

export function SeverityGauge({ probability, severity }: SeverityGaugeProps) {
  const percentage = Math.round(probability * 100);
  const angle = probability * 180;
  const color = SEVERITY_COLORS[severity];

  const r = 80;
  const cx = 100;
  const cy = 95;

  // Arc path for background
  const describeArc = (startAngle: number, endAngle: number) => {
    const start = polarToCartesian(cx, cy, r, endAngle);
    const end = polarToCartesian(cx, cy, r, startAngle);
    const largeArc = endAngle - startAngle <= 180 ? "0" : "1";
    return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 0 ${end.x} ${end.y}`;
  };

  function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
    const angleRad = ((angleDeg - 180) * Math.PI) / 180;
    return { x: cx + r * Math.cos(angleRad), y: cy + r * Math.sin(angleRad) };
  }

  // Needle endpoint
  const needleEnd = polarToCartesian(cx, cy, r - 10, angle);

  return (
    <div className="flex flex-col items-center">
      <svg viewBox="0 0 200 120" className="w-48 h-28">
        {/* Background arc */}
        <path d={describeArc(0, 180)} fill="none" stroke="hsl(var(--border))" strokeWidth="12" strokeLinecap="round" />
        {/* Colored segments */}
        <path d={describeArc(0, 45)} fill="none" stroke="hsl(160, 84%, 39%)" strokeWidth="12" strokeLinecap="round" opacity={0.3} />
        <path d={describeArc(45, 90)} fill="none" stroke="hsl(45, 93%, 47%)" strokeWidth="12" strokeLinecap="round" opacity={0.3} />
        <path d={describeArc(90, 135)} fill="none" stroke="hsl(27, 96%, 61%)" strokeWidth="12" strokeLinecap="round" opacity={0.3} />
        <path d={describeArc(135, 180)} fill="none" stroke="hsl(0, 72%, 51%)" strokeWidth="12" strokeLinecap="round" opacity={0.3} />
        
        {/* Active arc */}
        <motion.path
          d={describeArc(0, angle)}
          fill="none"
          stroke={color}
          strokeWidth="12"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.2, ease: [0.4, 0, 0.2, 1] }}
        />

        {/* Needle */}
        <motion.line
          x1={cx}
          y1={cy}
          x2={needleEnd.x}
          y2={needleEnd.y}
          stroke={color}
          strokeWidth="2.5"
          strokeLinecap="round"
          initial={{ x2: cx - r + 10, y2: cy }}
          animate={{ x2: needleEnd.x, y2: needleEnd.y }}
          transition={{ duration: 1.2, ease: [0.4, 0, 0.2, 1] }}
        />
        <circle cx={cx} cy={cy} r="4" fill={color} />
      </svg>
      <motion.span 
        className="mono text-4xl font-bold mt-1"
        style={{ color }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        {percentage}%
      </motion.span>
      <span className="text-muted-foreground text-sm mt-1">Risk Probability</span>
    </div>
  );
}
