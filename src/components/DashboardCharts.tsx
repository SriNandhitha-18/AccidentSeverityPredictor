import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  LineChart, Line, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { motion } from "framer-motion";
import { getDashboardStats } from "@/lib/prediction-engine";

const cardVariant = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.4, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] },
  }),
};

export function DashboardCharts() {
  const stats = getDashboardStats();
  const BAR_COLORS = ["hsl(160,84%,39%)", "hsl(45,93%,47%)", "hsl(27,96%,61%)", "hsl(0,72%,51%)"];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Severity Distribution - Pie */}
      <motion.div className="card-surface p-5" variants={cardVariant} custom={0} initial="hidden" animate="visible">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">Severity Distribution</h3>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie data={stats.severityDistribution} cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={3} dataKey="value">
              {stats.severityDistribution.map((entry, i) => (
                <Cell key={i} fill={entry.fill} />
              ))}
            </Pie>
            <Tooltip contentStyle={{ borderRadius: 8, border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Vehicle vs Severity - Bar */}
      <motion.div className="card-surface p-5" variants={cardVariant} custom={1} initial="hidden" animate="visible">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">Vehicle Type vs Severity</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={stats.vehicleData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="vehicle" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip contentStyle={{ borderRadius: 8, border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }} />
            <Bar dataKey="low" fill={BAR_COLORS[0]} radius={[2, 2, 0, 0]} />
            <Bar dataKey="medium" fill={BAR_COLORS[1]} radius={[2, 2, 0, 0]} />
            <Bar dataKey="high" fill={BAR_COLORS[2]} radius={[2, 2, 0, 0]} />
            <Bar dataKey="fatal" fill={BAR_COLORS[3]} radius={[2, 2, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Accidents by Time - Line */}
      <motion.div className="card-surface p-5" variants={cardVariant} custom={2} initial="hidden" animate="visible">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">Accidents by Time of Day</h3>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={stats.timeData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="time" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip contentStyle={{ borderRadius: 8, border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }} />
            <Line type="monotone" dataKey="accidents" stroke="hsl(var(--primary))" strokeWidth={2.5} dot={{ r: 4, fill: "hsl(var(--primary))" }} />
          </LineChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Weather vs Risk - Doughnut */}
      <motion.div className="card-surface p-5" variants={cardVariant} custom={3} initial="hidden" animate="visible">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">Weather vs Accident Risk</h3>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie data={stats.weatherData} cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={3} dataKey="value">
              {stats.weatherData.map((entry, i) => (
                <Cell key={i} fill={entry.fill} />
              ))}
            </Pie>
            <Tooltip contentStyle={{ borderRadius: 8, border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </motion.div>
    </div>
  );
}
