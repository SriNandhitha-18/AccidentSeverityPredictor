import { motion } from "framer-motion";
import { Activity, AlertTriangle, Shield, ShieldOff, TrendingUp } from "lucide-react";
import { DashboardCharts } from "@/components/DashboardCharts";
import { AccidentMap } from "@/components/AccidentMap";
import { getDashboardStats, getHistory } from "@/lib/prediction-engine";
import { PageTransition, StaggerContainer, StaggerItem, FloatIn } from "@/components/Animations";
import { AnimatedCounter } from "@/components/AnimatedCounter";

export default function DashboardPage() {
  const stats = getDashboardStats();
  const history = getHistory();

  const summaryCards = [
    { label: "Total Predictions", value: stats.total, icon: Activity, bgClass: "bg-primary/10", textClass: "text-primary", iconBg: "bg-primary/20" },
    { label: "Low Severity", value: stats.low, icon: Shield, bgClass: "severity-low-bg", textClass: "severity-low-text", iconBg: "bg-severity-low/20" },
    { label: "High Risk", value: stats.high, icon: AlertTriangle, bgClass: "severity-high-bg", textClass: "severity-high-text", iconBg: "bg-severity-high/20" },
    { label: "Fatal Cases", value: stats.fatal, icon: ShieldOff, bgClass: "severity-fatal-bg", textClass: "severity-fatal-text", iconBg: "bg-severity-fatal/20" },
  ];

  return (
    <PageTransition>
      <div className="min-h-screen relative">
        {/* Background */}
        <div className="fixed inset-0 -z-10 bg-gradient-to-br from-background via-background to-primary/5">
          <div className="absolute bottom-0 left-1/4 w-96 h-96 rounded-full bg-primary/3 blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto px-4 py-8">
          <FloatIn>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-2xl font-bold tracking-tight">Analytics Dashboard</h1>
                <p className="text-sm text-muted-foreground mt-1">Overview of prediction data and accident risk analysis.</p>
              </div>
              <motion.div
                className="flex items-center gap-2 text-xs bg-severity-low/10 text-severity-low px-3 py-1.5 rounded-full font-medium border border-severity-low/20"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
              >
                <TrendingUp className="h-3.5 w-3.5" />
                Live Analytics
              </motion.div>
            </div>
          </FloatIn>

          {/* Summary Cards */}
          <StaggerContainer className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {summaryCards.map((card) => (
              <StaggerItem key={card.label}>
                <motion.div
                  className={`card-elevated p-5 ${card.bgClass} rounded-xl cursor-default backdrop-blur-sm bg-card/80 border border-border/20`}
                  whileHover={{ y: -3, scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <div className={`w-9 h-9 rounded-lg ${card.iconBg} flex items-center justify-center mb-3`}>
                    <card.icon className={`h-4 w-4 ${card.textClass}`} />
                  </div>
                  <AnimatedCounter value={card.value} className={`mono text-2xl font-bold ${card.textClass} block`} />
                  <div className="text-xs text-muted-foreground mt-1">{card.label}</div>
                </motion.div>
              </StaggerItem>
            ))}
          </StaggerContainer>

          {/* Charts */}
          <FloatIn delay={0.3}>
            <div className="mb-8">
              <DashboardCharts />
            </div>
          </FloatIn>

          {/* Map */}
          <FloatIn delay={0.4}>
            <div className="mb-8">
              <AccidentMap />
            </div>
          </FloatIn>

          {/* Recent Predictions Table */}
          <FloatIn delay={0.5}>
            <motion.div
              className="card-elevated p-5 rounded-xl bg-card/90 backdrop-blur-sm"
              whileHover={{ boxShadow: "0 8px 30px rgba(0,0,0,0.08)" }}
            >
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">Recent Predictions</h3>
              {history.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border text-left text-xs text-muted-foreground uppercase tracking-wider">
                        <th className="pb-3 pr-4">Time</th>
                        <th className="pb-3 pr-4">Weather</th>
                        <th className="pb-3 pr-4">Speed</th>
                        <th className="pb-3 pr-4">Severity</th>
                        <th className="pb-3">Probability</th>
                      </tr>
                    </thead>
                    <tbody>
                      {history.slice(0, 10).map((record, i) => (
                        <motion.tr
                          key={record.id}
                          className="border-b border-border/30 hover:bg-muted/30 transition-colors"
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.05 }}
                        >
                          <td className="py-3 pr-4 mono text-xs">{new Date(record.timestamp).toLocaleTimeString()}</td>
                          <td className="py-3 pr-4 capitalize">{record.input.weather}</td>
                          <td className="py-3 pr-4 mono">{record.input.speed} km/h</td>
                          <td className="py-3 pr-4">
                            <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                              record.result.severity === 0 ? "severity-low-bg severity-low-text" :
                              record.result.severity === 1 ? "severity-medium-bg severity-medium-text" :
                              record.result.severity === 2 ? "severity-high-bg severity-high-text" :
                              "severity-fatal-bg severity-fatal-text"
                            }`}>
                              {record.result.label}
                            </span>
                          </td>
                          <td className="py-3 mono text-xs font-medium">{Math.round(record.result.probability * 100)}%</td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <motion.div
                    animate={{ y: [0, -4, 0] }}
                    transition={{ duration: 2.5, repeat: Infinity }}
                  >
                    <Activity className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
                  </motion.div>
                  <p className="text-sm text-muted-foreground">
                    No predictions yet. Run some predictions to see data here.
                  </p>
                </div>
              )}
            </motion.div>
          </FloatIn>
        </div>
      </div>
    </PageTransition>
  );
}
