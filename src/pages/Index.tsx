import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Shield, BarChart3, Gauge, Activity, Zap, MapPin, Brain, Car, CloudRain, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageTransition, StaggerContainer, StaggerItem, FloatIn } from "@/components/Animations";
import { PulsingDot } from "@/components/AnimatedCounter";

const stats = [
  { value: "98.2%", label: "Model Accuracy", icon: Gauge },
  { value: "50K+", label: "Records Analyzed", icon: BarChart3 },
  { value: "4", label: "Severity Classes", icon: Shield },
  { value: "<50ms", label: "Inference Time", icon: Zap },
];

const features = [
  {
    title: "Multi-Factor Analysis",
    description: "9 environmental, vehicular, and human factors analyzed simultaneously through Random Forest classification.",
    icon: Brain,
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    title: "Real-Time Prediction",
    description: "Sub-50ms inference time with confidence distribution across all four severity classes.",
    icon: Gauge,
    color: "severity-low-text",
    bgColor: "severity-low-bg",
  },
  {
    title: "Hotspot Mapping",
    description: "Spatial accident density visualization with interactive markers and severity overlays.",
    icon: MapPin,
    color: "severity-high-text",
    bgColor: "severity-high-bg",
  },
  {
    title: "Safety Intelligence",
    description: "Contextual safety guidance generated based on identified risk factors and severity level.",
    icon: Shield,
    color: "severity-medium-text",
    bgColor: "severity-medium-bg",
  },
];

export default function HomePage() {
  return (
    <PageTransition>
      <div className="min-h-screen overflow-hidden relative">
        {/* Animated mesh background */}
        <div className="fixed inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.03] via-background to-severity-high/[0.03]" />
          <motion.div
            className="absolute top-20 -left-32 w-[500px] h-[500px] rounded-full bg-primary/[0.06] blur-[100px]"
            animate={{ x: [0, 60, 0], y: [0, -40, 0], scale: [1, 1.2, 1] }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute bottom-20 -right-32 w-[400px] h-[400px] rounded-full bg-severity-high/[0.06] blur-[100px]"
            animate={{ x: [0, -40, 0], y: [0, 40, 0], scale: [1, 1.15, 1] }}
            transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute top-1/2 left-1/3 w-[300px] h-[300px] rounded-full bg-severity-low/[0.04] blur-[80px]"
            animate={{ scale: [1, 1.3, 1], opacity: [0.4, 0.7, 0.4] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          />
          {/* Grid pattern overlay */}
          <div className="absolute inset-0 opacity-[0.015]" style={{
            backgroundImage: `linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)`,
            backgroundSize: '60px 60px'
          }} />
        </div>

        {/* Hero */}
        <section className="relative">
          <div className="max-w-7xl mx-auto px-4 py-24 md:py-36 relative">
            <FloatIn>
              <div className="flex items-center gap-2 mb-6">
                <PulsingDot color="hsl(var(--severity-0))" size={6} />
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  Machine Learning Powered
                </span>
              </div>
            </FloatIn>

            <FloatIn delay={0.1}>
              <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-[1.05] mb-6 max-w-4xl">
                Predictive Accident
                <br />
                <span className="bg-gradient-to-r from-primary via-primary to-severity-high bg-clip-text text-transparent">
                  Analytics Engine
                </span>
              </h1>
            </FloatIn>

            <FloatIn delay={0.2}>
              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-10 leading-relaxed">
                Quantifying road risk through multi-factor machine learning analysis.
                Predict accident severity, identify contributing factors, and generate
                actionable safety recommendations.
              </p>
            </FloatIn>

            <FloatIn delay={0.3}>
              <div className="flex flex-wrap gap-4">
                <Link to="/predict">
                  <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                    <Button className="btn-primary text-base px-8 py-6 rounded-xl">
                      Generate Risk Profile
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </motion.div>
                </Link>
                <Link to="/dashboard">
                  <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                    <Button variant="outline" className="text-base px-8 py-6 rounded-xl border-border/60 bg-card/50 backdrop-blur-sm">
                      View Dashboard
                    </Button>
                  </motion.div>
                </Link>
              </div>
            </FloatIn>

            {/* Floating icons decoration */}
            <div className="hidden lg:block absolute right-10 top-1/2 -translate-y-1/2">
              <motion.div className="relative w-64 h-64" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
                {[
                  { Icon: Car, x: 0, y: 0, delay: 0 },
                  { Icon: CloudRain, x: 120, y: -40, delay: 0.2 },
                  { Icon: AlertTriangle, x: 60, y: 100, delay: 0.4 },
                  { Icon: Shield, x: 160, y: 60, delay: 0.6 },
                ].map(({ Icon, x, y, delay }, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-14 h-14 rounded-xl bg-card/80 backdrop-blur-sm border border-border/30 flex items-center justify-center"
                    style={{ left: x, top: y }}
                    animate={{ y: [0, -8, 0] }}
                    transition={{ duration: 3 + i * 0.5, repeat: Infinity, ease: "easeInOut", delay }}
                  >
                    <Icon className="h-6 w-6 text-primary/70" />
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="border-y border-border/40 bg-card/30 backdrop-blur-md">
          <div className="max-w-7xl mx-auto px-4 py-16">
            <StaggerContainer className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat) => (
                <StaggerItem key={stat.label} className="text-center">
                  <motion.div whileHover={{ scale: 1.05 }} transition={{ type: "spring", stiffness: 300 }}>
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
                      <stat.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div className="mono text-3xl md:text-4xl font-bold mb-1">{stat.value}</div>
                    <div className="text-sm text-muted-foreground">{stat.label}</div>
                  </motion.div>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>
        </section>

        {/* Features */}
        <section className="max-w-7xl mx-auto px-4 py-20">
          <FloatIn>
            <h2 className="text-3xl font-bold tracking-tight mb-2">System Capabilities</h2>
            <p className="text-muted-foreground mb-10">Advanced analytics infrastructure for road safety intelligence.</p>
          </FloatIn>
          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {features.map((feature) => (
              <StaggerItem key={feature.title}>
                <motion.div
                  className="card-elevated p-6 rounded-xl bg-card/80 backdrop-blur-sm hover:shadow-lg transition-all duration-300 group cursor-default border border-border/30"
                  whileHover={{ y: -3 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className={`w-12 h-12 rounded-xl ${feature.bgColor} flex items-center justify-center mb-4`}>
                    <feature.icon className={`h-6 w-6 ${feature.color}`} />
                  </div>
                  <h3 className="font-bold text-lg mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
                </motion.div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </section>

        {/* Severity Scale */}
        <section className="max-w-7xl mx-auto px-4 pb-24">
          <FloatIn>
            <h2 className="text-3xl font-bold tracking-tight mb-6">Severity Classification</h2>
          </FloatIn>
          <StaggerContainer className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: "Low", value: "0", bgClass: "severity-low-bg", textClass: "severity-low-text", barColor: "severity-low" },
              { label: "Medium", value: "1", bgClass: "severity-medium-bg", textClass: "severity-medium-text", barColor: "severity-medium" },
              { label: "High", value: "2", bgClass: "severity-high-bg", textClass: "severity-high-text", barColor: "severity-high" },
              { label: "Fatal", value: "3", bgClass: "severity-fatal-bg", textClass: "severity-fatal-text", barColor: "severity-fatal" },
            ].map((level) => (
              <StaggerItem key={level.label}>
                <motion.div
                  className={`${level.bgClass} rounded-xl p-6 cursor-default relative overflow-hidden border border-border/20`}
                  whileHover={{ scale: 1.03, y: -2 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <motion.div
                    className={`absolute bottom-0 left-0 right-0 h-1 ${level.barColor}`}
                    initial={{ scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3, duration: 0.6 }}
                    style={{ transformOrigin: "left" }}
                  />
                  <span className={`mono text-4xl font-black ${level.textClass}`}>{level.value}</span>
                  <p className={`font-bold mt-1 text-lg ${level.textClass}`}>{level.label}</p>
                </motion.div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </section>

        {/* CTA */}
        <section className="border-t border-border/40 bg-card/20 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 py-20 text-center">
            <FloatIn>
              <h2 className="text-3xl font-bold tracking-tight mb-4">Ready to analyze?</h2>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                Start predicting accident severity with our multi-factor analysis engine.
              </p>
              <Link to="/predict">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="inline-block">
                  <Button className="btn-primary text-lg px-10 py-7 rounded-xl">
                    Get Started <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </motion.div>
              </Link>
            </FloatIn>
          </div>
        </section>
      </div>
    </PageTransition>
  );
}
