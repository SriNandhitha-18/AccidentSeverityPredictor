import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { History, Trash2, Search, AlertTriangle, Shield, ShieldAlert, ShieldOff, ChevronDown, ChevronUp, MapPin, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AccidentMap } from "@/components/AccidentMap";
import { getHistory, clearHistory, type PredictionRecord } from "@/lib/prediction-engine";
import { PageTransition, FloatIn } from "@/components/Animations";
import { useToast } from "@/hooks/use-toast";

const severityIcons = [Shield, AlertTriangle, ShieldAlert, ShieldOff];
const severityLabels = ["Low", "Medium", "High", "Fatal"];

function RecordCard({ record, index, onLocate }: { record: PredictionRecord; index: number; onLocate: (id: string) => void }) {
  const [expanded, setExpanded] = useState(false);
  const Icon = severityIcons[record.result.severity];
  const severityBg = ["severity-low-bg", "severity-medium-bg", "severity-high-bg", "severity-fatal-bg"][record.result.severity];
  const severityText = ["severity-low-text", "severity-medium-text", "severity-high-text", "severity-fatal-text"][record.result.severity];
  const date = new Date(record.timestamp);

  return (
    <motion.div
      className="card-elevated rounded-xl overflow-hidden bg-card/90 backdrop-blur-sm"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      layout
    >
      <button className="w-full p-4 flex items-center gap-4 text-left hover:bg-muted/30 transition-colors" onClick={() => setExpanded(!expanded)}>
        <div className={`w-10 h-10 rounded-lg ${severityBg} flex items-center justify-center shrink-0`}>
          <Icon className={`h-5 w-5 ${severityText}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className={`text-sm font-bold ${severityText}`}>{record.result.label}</span>
            <span className="mono text-xs text-muted-foreground">{Math.round(record.result.probability * 100)}%</span>
          </div>
          <div className="text-xs text-muted-foreground mt-0.5 truncate">
            {record.input.weather} • {record.input.vehicleType} • {record.input.speed}km/h • Age {record.input.driverAge}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {record.lat != null && (
            <motion.button
              onClick={(e) => { e.stopPropagation(); onLocate(record.id); }}
              className="p-1.5 rounded-lg hover:bg-primary/10 text-primary transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              title="Show on map"
            >
              <MapPin className="h-4 w-4" />
            </motion.button>
          )}
          <div className="text-right shrink-0">
            <div className="mono text-xs text-muted-foreground">{date.toLocaleDateString()}</div>
            <div className="mono text-xs text-muted-foreground">{date.toLocaleTimeString()}</div>
          </div>
          {expanded ? <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" /> : <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />}
        </div>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }} className="overflow-hidden">
            <div className="px-4 pb-4 pt-0 border-t border-border/30">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-3 text-sm">
                <Detail label="Weather" value={record.input.weather} />
                <Detail label="Road" value={record.input.roadCondition} />
                <Detail label="Vehicle" value={record.input.vehicleType} />
                <Detail label="Speed" value={`${record.input.speed} km/h`} />
                <Detail label="Driver Age" value={String(record.input.driverAge)} />
                <Detail label="Traffic" value={record.input.trafficDensity} />
                <Detail label="Time" value={record.input.timeOfDay} />
                <Detail label="Light" value={record.input.lightCondition} />
                <Detail label="Alcohol" value={record.input.alcoholInvolvement ? "Yes" : "No"} />
              </div>
              {record.lat != null && (
                <div className="mt-3 text-xs text-muted-foreground">
                  📍 Location: {record.lat.toFixed(4)}, {record.lng?.toFixed(4)}
                </div>
              )}
              {record.result.factors.length > 0 && (
                <div className="mt-3">
                  <span className="text-xs text-muted-foreground font-medium">Contributing Factors:</span>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {record.result.factors.map(f => (
                      <span key={f} className={`text-xs px-2 py-0.5 rounded-full ${severityBg} ${severityText}`}>{f}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="block text-sm font-medium capitalize">{value}</span>
    </div>
  );
}

export default function HistoryPage() {
  const [history, setHistory] = useState(getHistory());
  const [search, setSearch] = useState("");
  const [severityFilter, setSeverityFilter] = useState("all");
  const [highlightId, setHighlightId] = useState<string | null>(null);
  const { toast } = useToast();

  const filtered = history.filter(r => {
    if (severityFilter !== "all" && r.result.severity !== parseInt(severityFilter)) return false;
    if (!search) return true;
    const s = search.toLowerCase();
    return r.result.label.toLowerCase().includes(s) || r.input.weather.includes(s) || r.input.vehicleType.includes(s) || r.input.roadCondition.includes(s);
  });

  const handleClear = () => {
    clearHistory();
    setHistory([]);
    toast({ title: "History cleared", description: "All prediction records have been removed." });
  };

  const handleLocate = (id: string) => {
    setHighlightId(id);
    // Scroll to map
    document.getElementById("history-map")?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const severityCounts = [0, 1, 2, 3].map(s => history.filter(h => h.result.severity === s).length);

  return (
    <PageTransition>
      <div className="min-h-screen relative">
        <div className="fixed inset-0 -z-10 bg-gradient-to-br from-background via-background to-primary/5">
          <div className="absolute top-1/3 right-0 w-96 h-96 rounded-full bg-primary/3 blur-3xl" />
        </div>

        <div className="max-w-6xl mx-auto px-4 py-8">
          <FloatIn>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                  <History className="h-6 w-6 text-primary" />
                  Prediction History
                </h1>
                <p className="text-sm text-muted-foreground mt-1">{history.length} predictions stored</p>
              </div>
              {history.length > 0 && (
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button variant="outline" size="sm" onClick={handleClear} className="gap-1.5 text-destructive hover:text-destructive">
                    <Trash2 className="h-3.5 w-3.5" /> Clear All
                  </Button>
                </motion.div>
              )}
            </div>
          </FloatIn>

          {/* Summary chips */}
          {history.length > 0 && (
            <FloatIn delay={0.1}>
              <div className="flex flex-wrap gap-2 mb-6">
                {severityLabels.map((label, i) => (
                  <div key={label} className={`px-3 py-1.5 rounded-full text-xs font-medium ${["severity-low-bg severity-low-text", "severity-medium-bg severity-medium-text", "severity-high-bg severity-high-text", "severity-fatal-bg severity-fatal-text"][i]}`}>
                    {label}: {severityCounts[i]}
                  </div>
                ))}
              </div>
            </FloatIn>
          )}

          {/* Search & Filter */}
          {history.length > 0 && (
            <FloatIn delay={0.15}>
              <div className="flex gap-3 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search by severity, weather, vehicle..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10 bg-card/80 backdrop-blur-sm" />
                </div>
                <Select value={severityFilter} onValueChange={setSeverityFilter}>
                  <SelectTrigger className="w-[160px] bg-card/80 backdrop-blur-sm">
                    <Filter className="h-3.5 w-3.5 mr-1.5" />
                    <SelectValue placeholder="All severities" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Severities</SelectItem>
                    <SelectItem value="0">Low Only</SelectItem>
                    <SelectItem value="1">Medium Only</SelectItem>
                    <SelectItem value="2">High Only</SelectItem>
                    <SelectItem value="3">Fatal Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </FloatIn>
          )}

          {/* Map */}
          {history.length > 0 && (
            <FloatIn delay={0.2}>
              <div id="history-map" className="mb-8">
                <AccidentMap />
              </div>
            </FloatIn>
          )}

          {/* Records */}
          {filtered.length > 0 ? (
            <div className="space-y-3">
              {filtered.map((record, i) => (
                <RecordCard key={record.id} record={record} index={i} onLocate={handleLocate} />
              ))}
            </div>
          ) : (
            <FloatIn delay={0.2}>
              <div className="card-surface p-16 text-center rounded-xl border border-dashed border-border/50 bg-card/60 backdrop-blur-sm">
                <motion.div animate={{ y: [0, -6, 0] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}>
                  <History className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                </motion.div>
                <p className="text-lg font-semibold mb-1">{search || severityFilter !== "all" ? "No matches found" : "No predictions yet"}</p>
                <p className="text-sm text-muted-foreground">
                  {search || severityFilter !== "all" ? "Try adjusting your filters." : "Run some predictions to see your history here."}
                </p>
              </div>
            </FloatIn>
          )}
        </div>
      </div>
    </PageTransition>
  );
}
