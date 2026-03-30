import { Link, useLocation } from "react-router-dom";
import { Activity, BarChart3, Gauge, Home, Settings, History, Moon, Sun } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

const links = [
  { to: "/", label: "Home", icon: Home },
  { to: "/predict", label: "Predict", icon: Gauge },
  { to: "/dashboard", label: "Dashboard", icon: BarChart3 },
  { to: "/history", label: "History", icon: History },
  { to: "/admin", label: "Admin", icon: Settings },
];

// ✅ FORCE LIGHT MODE
function useDarkMode() {
  const [dark, setDark] = useState(false);

  // 🔥 Always reset to LIGHT on load
  useEffect(() => {
    document.documentElement.classList.remove("dark");
    localStorage.setItem("theme", "light");
  }, []);

  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [dark]);

  return [dark, () => setDark((d) => !d)] as const;
}

export function AppNav() {
  const location = useLocation();
  const [dark, toggleDark] = useDarkMode();

  return (
    <motion.header
      className="sticky top-0 z-50 border-b border-border/30 bg-card/60 backdrop-blur-xl"
      initial={{ y: -60 }}
      animate={{ y: 0 }}
    >
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-bold text-lg">
          <Activity className="h-5 w-5 text-primary" />
          <span className="hidden sm:inline">AccidentAI</span>
        </Link>

        <div className="flex items-center gap-1">
          <nav className="flex items-center gap-1">
            {links.map(({ to, label, icon: Icon }) => {
              const active = location.pathname === to;

              return (
                <Link key={to} to={to}>
                  <div
                    className={`px-3 py-1.5 rounded-lg text-sm ${
                      active ? "text-primary" : "text-muted-foreground"
                    }`}
                  >
                    <Icon className="h-4 w-4 inline mr-1" />
                    {label}
                  </div>
                </Link>
              );
            })}
          </nav>

          {/* Toggle (optional) */}
          <button onClick={toggleDark} className="ml-2 p-2">
            {dark ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        </div>
      </div>
    </motion.header>
  );
}