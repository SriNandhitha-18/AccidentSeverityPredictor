import { useEffect, useRef, useState, useCallback } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster";
import "leaflet.heat";
import { Flame, Eye, EyeOff, AlertTriangle, MapPin } from "lucide-react";
import { getHistory } from "@/lib/prediction-engine";
import { motion, AnimatePresence } from "framer-motion";

const DEFAULT_CENTER: [number, number] = [17.385, 78.4867];

const SEVERITY_LABELS = ["Low", "Medium", "High", "Fatal"];
const SEVERITY_COLORS = ["#10b981", "#eab308", "#f97316", "#dc2626"];

// Major accident zones in Hyderabad with lat, lng, intensity, severity index, probability
const ZONES = [
  { name: "Shamshabad",      lat: 17.2403, lng: 78.4294, intensity: 0.92, severity: 3, probability: 88 },
  { name: "Peerzadiguda",    lat: 17.4520, lng: 78.5750, intensity: 0.78, severity: 2, probability: 65 },
  { name: "Rajendranagar",   lat: 17.3150, lng: 78.4050, intensity: 0.85, severity: 3, probability: 82 },
  { name: "LB Nagar",        lat: 17.3457, lng: 78.5522, intensity: 0.90, severity: 3, probability: 86 },
  { name: "Amberpet",        lat: 17.3900, lng: 78.5100, intensity: 0.60, severity: 1, probability: 42 },
  { name: "Mehdipatnam",     lat: 17.3950, lng: 78.4400, intensity: 0.72, severity: 2, probability: 58 },
  { name: "Kukatpally",      lat: 17.4948, lng: 78.3996, intensity: 0.80, severity: 2, probability: 68 },
  { name: "Secunderabad",    lat: 17.4399, lng: 78.4983, intensity: 0.88, severity: 3, probability: 84 },
  { name: "Hitech City",     lat: 17.4435, lng: 78.3772, intensity: 0.95, severity: 3, probability: 90 },
  { name: "Banjara Hills",   lat: 17.4138, lng: 78.4408, intensity: 0.65, severity: 2, probability: 52 },
  { name: "Charminar",       lat: 17.3616, lng: 78.4747, intensity: 0.70, severity: 2, probability: 55 },
  { name: "Uppal",           lat: 17.4257, lng: 78.5481, intensity: 0.58, severity: 1, probability: 40 },
  { name: "Ameerpet",        lat: 17.4370, lng: 78.4480, intensity: 0.68, severity: 2, probability: 50 },
  { name: "Koti",            lat: 17.3850, lng: 78.4867, intensity: 0.62, severity: 1, probability: 45 },
];

const HOTSPOTS: [number, number, number][] = ZONES.map(z => [z.lat, z.lng, z.intensity]);

function createIcon(color: string, size = 18) {
  return L.divIcon({
    className: "custom-marker-icon",
    html: `<div style="
      width:${size}px;height:${size}px;border-radius:50%;
      background:radial-gradient(circle at 35% 35%, ${color}cc, ${color});
      border:2.5px solid white;
      box-shadow:0 0 12px ${color}80, 0 2px 8px rgba(0,0,0,0.18);
      transition: transform 0.2s, box-shadow 0.2s;
    "></div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

function getAreaRisk(lat: number, lng: number) {
  let minDist = Infinity;
  let closest = ZONES[0];
  for (const zone of ZONES) {
    const d = Math.sqrt((lat - zone.lat) ** 2 + (lng - zone.lng) ** 2);
    if (d < minDist) {
      minDist = d;
      closest = zone;
    }
  }
  const decay = Math.max(0, closest.intensity * Math.exp(-minDist * 30));
  const probability = Math.round(decay * 100);
  const severity = probability >= 70 ? 3 : probability >= 45 ? 2 : probability >= 20 ? 1 : 0;
  return { severity, probability, name: closest.name };
}

function useDebouncedCallback<T extends (...args: any[]) => void>(fn: T, delay: number) {
  const timer = useRef<ReturnType<typeof setTimeout>>();
  return useCallback(
    (...args: Parameters<T>) => {
      clearTimeout(timer.current);
      timer.current = setTimeout(() => fn(...args), delay);
    },
    [fn, delay]
  );
}

export function AccidentMap() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const heatRef = useRef<any>(null);
  const clusterRef = useRef<any>(null);
  const zonesLayerRef = useRef<L.LayerGroup | null>(null);

  const [showHeatmap, setShowHeatmap] = useState(true);
  const [showMarkers, setShowMarkers] = useState(true);
  const [showZones, setShowZones] = useState(true);
  const [areaRisk, setAreaRisk] = useState({ severity: 0, probability: 0, name: "Koti" });

  const handleMapMove = useDebouncedCallback(() => {
    if (!mapInstance.current) return;
    const c = mapInstance.current.getCenter();
    setAreaRisk(getAreaRisk(c.lat, c.lng));
  }, 150);

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    const map = L.map(mapRef.current, { zoomControl: false }).setView(DEFAULT_CENTER, 12);
    mapInstance.current = map;

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap",
      maxZoom: 19,
    }).addTo(map);

    L.control.zoom({ position: "bottomright" }).addTo(map);
    map.getContainer().style.background = "#f8fafc";

    // --- Zone overlays (circles + labels) ---
    const zonesLayer = L.layerGroup();
    ZONES.forEach((zone) => {
      const color = SEVERITY_COLORS[zone.severity];
      // Circle overlay
      L.circle([zone.lat, zone.lng], {
        radius: 1200,
        color: color,
        weight: 1.5,
        opacity: 0.5,
        fillColor: color,
        fillOpacity: 0.12,
        className: "zone-circle",
      }).addTo(zonesLayer);

      // Floating label
      const labelIcon = L.divIcon({
        className: "zone-label-icon",
        html: `<div class="zone-label" style="border-left:3px solid ${color}">
          <div style="font-weight:700;font-size:11px;color:#1f2937">${zone.name}</div>
          <div style="font-size:10px;color:${color};font-weight:600">${SEVERITY_LABELS[zone.severity]} · ${zone.probability}%</div>
        </div>`,
        iconSize: [120, 40],
        iconAnchor: [60, -10],
      });
      L.marker([zone.lat, zone.lng], { icon: labelIcon, interactive: false }).addTo(zonesLayer);

      // Zone center marker (larger)
      const zoneMarker = L.marker([zone.lat, zone.lng], { icon: createIcon(color, 22) });
      zoneMarker.bindTooltip(
        `<div style="font-family:system-ui;font-size:12px;font-weight:600;color:${color}">
          ${zone.name}<br/>${SEVERITY_LABELS[zone.severity]} · ${zone.probability}%
        </div>`,
        { direction: "top", offset: [0, -14], className: "clean-tooltip" }
      );
      zoneMarker.addTo(zonesLayer);
    });
    zonesLayer.addTo(map);
    zonesLayerRef.current = zonesLayer;

    // --- Heatmap ---
    const heat = (L as any).heatLayer(HOTSPOTS, {
      radius: 40,
      blur: 28,
      maxZoom: 15,
      gradient: { 0.15: "#10b981", 0.4: "#eab308", 0.65: "#f97316", 1: "#dc2626" },
    });
    heat.addTo(map);
    heatRef.current = heat;

    // --- Clusters (history markers) ---
    const cluster = L.markerClusterGroup({
      spiderfyOnMaxZoom: true,
      showCoverageOnHover: false,
      maxClusterRadius: 50,
      iconCreateFunction(c: any) {
        const count = c.getChildCount();
        return L.divIcon({
          html: `<div style="
            display:flex;align-items:center;justify-content:center;
            width:36px;height:36px;border-radius:50%;
            background:linear-gradient(135deg,#6366f1,#4f46e5);color:white;
            font-weight:700;font-size:13px;font-family:system-ui,sans-serif;
            box-shadow:0 3px 14px rgba(99,102,241,0.45);
            border:2px solid white;
          ">${count}</div>`,
          className: "custom-cluster-icon",
          iconSize: [36, 36],
          iconAnchor: [18, 18],
        });
      },
    });
    clusterRef.current = cluster;

    getHistory().forEach((r: any) => {
      if (!r.lat || !r.lng) return;
      const sev = r.result?.severity ?? 0;
      const color = SEVERITY_COLORS[sev];
      const marker = L.marker([r.lat, r.lng], { icon: createIcon(color) });

      marker.bindTooltip(
        `<div style="font-family:system-ui;font-size:12px;font-weight:600;color:${color}">
          ${SEVERITY_LABELS[sev]} · ${r.result?.probability ?? 0}%
        </div>`,
        { direction: "top", offset: [0, -10], className: "clean-tooltip" }
      );

      marker.bindPopup(
        `<div class="clean-popup-content">
          <div style="font-weight:700;font-size:14px;margin-bottom:8px;">
            ${r.input?.weather ?? "Unknown"} Conditions
          </div>
          <div class="popup-row">
            <span class="popup-label">Severity</span>
            <span style="font-weight:700;color:${color}">${SEVERITY_LABELS[sev]}</span>
          </div>
          <div class="popup-row">
            <span class="popup-label">Probability</span>
            <span style="font-weight:600">${r.result?.probability ?? 0}%</span>
          </div>
          <div class="popup-row">
            <span class="popup-label">Speed</span>
            <span>${r.input?.speed ?? "—"} km/h</span>
          </div>
          <div class="popup-row" style="border:none">
            <span class="popup-label">Time</span>
            <span>${r.timestamp ? new Date(r.timestamp).toLocaleString() : "—"}</span>
          </div>
        </div>`,
        { className: "clean-popup", maxWidth: 220 }
      );

      cluster.addLayer(marker);
    });
    cluster.addTo(map);

    setAreaRisk(getAreaRisk(DEFAULT_CENTER[0], DEFAULT_CENTER[1]));
    map.on("moveend", handleMapMove);
    map.on("zoomend", handleMapMove);

    return () => {
      map.off("moveend", handleMapMove);
      map.off("zoomend", handleMapMove);
      map.remove();
      mapInstance.current = null;
    };
  }, []);

  useEffect(() => {
    if (!mapInstance.current || !heatRef.current) return;
    if (showHeatmap) mapInstance.current.addLayer(heatRef.current);
    else mapInstance.current.removeLayer(heatRef.current);
  }, [showHeatmap]);

  useEffect(() => {
    if (!mapInstance.current || !clusterRef.current) return;
    if (showMarkers) mapInstance.current.addLayer(clusterRef.current);
    else mapInstance.current.removeLayer(clusterRef.current);
  }, [showMarkers]);

  useEffect(() => {
    if (!mapInstance.current || !zonesLayerRef.current) return;
    if (showZones) mapInstance.current.addLayer(zonesLayerRef.current);
    else mapInstance.current.removeLayer(zonesLayerRef.current);
  }, [showZones]);

  const riskColor = SEVERITY_COLORS[areaRisk.severity];

  return (
    <div className="relative rounded-2xl overflow-hidden shadow-lg border border-border/30">
      <div ref={mapRef} className="h-[520px]" style={{ background: "#f8fafc" }} />

      {/* Floating Controls */}
      <div className="absolute top-3 right-3 z-[1000] flex gap-2">
        <FloatingBtn active={showHeatmap} onClick={() => setShowHeatmap(!showHeatmap)} icon={<Flame size={14} />} label="Heat" />
        <FloatingBtn active={showMarkers} onClick={() => setShowMarkers(!showMarkers)} icon={showMarkers ? <Eye size={14} /> : <EyeOff size={14} />} label="Pins" />
        <FloatingBtn active={showZones} onClick={() => setShowZones(!showZones)} icon={<MapPin size={14} />} label="Zones" />
      </div>

      {/* Floating Risk Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={areaRisk.severity + "-" + areaRisk.probability}
          initial={{ opacity: 0, y: -6, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 6, scale: 0.97 }}
          transition={{ duration: 0.25 }}
          className="absolute top-3 left-3 z-[1000] rounded-xl shadow-lg p-3 w-52"
          style={{
            background: "rgba(255,255,255,0.75)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            borderLeft: `3px solid ${riskColor}`,
            border: `1px solid rgba(255,255,255,0.4)`,
            borderLeftWidth: "3px",
            borderLeftColor: riskColor,
          }}
        >
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground mb-2">
            <AlertTriangle size={11} />
            Current Area Risk
          </div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: riskColor, boxShadow: `0 0 8px ${riskColor}50` }} />
            <span className="font-bold text-foreground text-sm">{SEVERITY_LABELS[areaRisk.severity]}</span>
            <span className="ml-auto text-xs font-semibold text-muted-foreground">{areaRisk.probability}%</span>
          </div>
          <div className="text-[10px] text-muted-foreground mb-2">Near {areaRisk.name}</div>
          <div className="h-1.5 rounded-full bg-muted overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ background: riskColor }}
              initial={{ width: 0 }}
              animate={{ width: `${areaRisk.probability}%` }}
              transition={{ duration: 0.4 }}
            />
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Legend */}
      <div
        className="absolute bottom-3 left-3 z-[1000] rounded-lg px-3 py-2 flex gap-3"
        style={{
          background: "rgba(255,255,255,0.65)",
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(255,255,255,0.3)",
          boxShadow: "0 1px 6px rgba(0,0,0,0.06)",
        }}
      >
        {SEVERITY_LABELS.map((label, i) => (
          <div key={label} className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full" style={{ background: SEVERITY_COLORS[i] }} />
            <span className="text-[10px] font-medium text-muted-foreground">{label}</span>
          </div>
        ))}
      </div>

      <style>{`
        @keyframes marker-pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.15); }
        }
        .custom-marker-icon div {
          animation: marker-pulse 2.5s ease-in-out infinite;
        }
        .custom-marker-icon:hover div {
          transform: scale(1.3) !important;
          box-shadow: 0 0 20px currentColor !important;
        }
        .custom-cluster-icon div {
          animation: marker-pulse 3s ease-in-out infinite;
        }

        /* Zone labels */
        .zone-label-icon { background: none !important; border: none !important; }
        .zone-label {
          background: rgba(255,255,255,0.85);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          border-radius: 8px;
          padding: 4px 8px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.08);
          border: 1px solid rgba(255,255,255,0.4);
          white-space: nowrap;
          font-family: system-ui, -apple-system, sans-serif;
        }

        /* Zone circles fade in */
        .zone-circle {
          animation: zone-fade 0.6s ease-out;
        }
        @keyframes zone-fade {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        /* Tooltip */
        .clean-tooltip {
          background: rgba(255,255,255,0.92) !important;
          backdrop-filter: blur(8px);
          border: 1px solid rgba(0,0,0,0.06) !important;
          border-radius: 8px !important;
          box-shadow: 0 2px 10px rgba(0,0,0,0.08) !important;
          padding: 4px 10px !important;
        }
        .clean-tooltip::before { display: none !important; }

        /* Popup */
        .clean-popup .leaflet-popup-content-wrapper {
          background: #f9fafb !important;
          border-radius: 14px !important;
          box-shadow: 0 8px 30px rgba(0,0,0,0.12) !important;
          border: 1px solid rgba(0,0,0,0.04) !important;
          padding: 0 !important;
        }
        .clean-popup .leaflet-popup-content { margin: 0 !important; }
        .clean-popup .leaflet-popup-tip {
          background: #f9fafb !important;
          box-shadow: none !important;
        }
        .clean-popup .leaflet-popup-close-button {
          color: #9ca3af !important;
          font-size: 18px !important;
          top: 6px !important;
          right: 8px !important;
        }
        .clean-popup-content {
          font-family: system-ui, -apple-system, sans-serif;
          padding: 14px 16px;
          font-size: 12px;
          color: #374151;
        }
        .popup-row {
          display: flex;
          justify-content: space-between;
          padding: 5px 0;
          border-bottom: 1px solid #f3f4f6;
          font-size: 12px;
        }
        .popup-label { color: #9ca3af; }

        /* Force light map */
        .leaflet-container {
          background: #f8fafc !important;
          filter: none !important;
        }
        .dark .leaflet-container,
        .dark .leaflet-tile-pane {
          filter: none !important;
        }
        .leaflet-tile-pane { filter: none !important; }
      `}</style>
    </div>
  );
}

function FloatingBtn({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button
      onClick={onClick}
      className="transition-all duration-200 active:scale-95 hover:scale-105"
      style={{
        display: "flex",
        alignItems: "center",
        gap: "6px",
        padding: "6px 14px",
        borderRadius: "9999px",
        fontSize: "12px",
        fontWeight: 500,
        background: active ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0.6)",
        backdropFilter: "blur(10px)",
        border: "1px solid rgba(255,255,255,0.3)",
        boxShadow: active ? "0 2px 10px rgba(0,0,0,0.1)" : "0 1px 4px rgba(0,0,0,0.06)",
        color: active ? "#4f46e5" : "#6b7280",
        cursor: "pointer",
      }}
    >
      {icon} {label}
    </button>
  );
}
