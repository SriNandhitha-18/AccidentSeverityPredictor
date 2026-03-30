import { motion } from "framer-motion";

interface AnimatedCounterProps {
  value: number | string;
  className?: string;
}

export function AnimatedCounter({ value, className }: AnimatedCounterProps) {
  return (
    <motion.span
      className={className}
      key={String(value)}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
    >
      {value}
    </motion.span>
  );
}

export function PulsingDot({ color, size = 8 }: { color: string; size?: number }) {
  return (
    <span className="relative inline-flex">
      <span
        className="absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping"
        style={{ backgroundColor: color, width: size, height: size }}
      />
      <span
        className="relative inline-flex rounded-full"
        style={{ backgroundColor: color, width: size, height: size }}
      />
    </span>
  );
}

export function ShimmerEffect({ className }: { className?: string }) {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-foreground/5 to-transparent"
        animate={{ x: ["-100%", "200%"] }}
        transition={{ duration: 2, repeat: Infinity, repeatDelay: 1, ease: "linear" }}
      />
    </div>
  );
}
