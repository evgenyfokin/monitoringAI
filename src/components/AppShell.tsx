import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard, Bell, AlertOctagon, Settings,
  Activity, Send, Sparkles, Play, X, CheckCircle2,
} from "lucide-react";
import { type ReactNode, useEffect, useState } from "react";
import { useDemo } from "@/lib/demo-context";

const nav = [
  { to: "/", label: "Дашборд", icon: LayoutDashboard },
  { to: "/alerts", label: "Алерты", icon: Bell, badge: 47 },
  { to: "/incidents/142", label: "Инциденты", icon: AlertOctagon, badge: 2, badgeTone: "crit" as const },
  { to: "/anomalies", label: "Аномалии", icon: Sparkles },
  { to: "/telegram", label: "Telegram", icon: Send },
  { to: "/demo", label: "Демо", icon: Play },
];

const services = [
  { name: "payment-service", status: "crit" },
  { name: "order-service", status: "warn" },
  { name: "auth-service", status: "ok" },
  { name: "search-service", status: "ok" },
  { name: "notification-service", status: "warn" },
];

const toneClass: Record<string, string> = {
  ok: "bg-ok",
  warn: "bg-warn",
  crit: "bg-crit",
};

export function AppShell({ children }: { children: ReactNode }) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const { stage, showToast, dismissToast, completedScenario, service } = useDemo();
  const demoActive = stage !== "idle";

  const isActive = (to: string) =>
    to === "/" ? path === "/" : path.startsWith(to.split("/").slice(0, 2).join("/"));

  useEffect(() => {
    if (!showToast) return;
    const t = setTimeout(dismissToast, 8000);
    return () => clearTimeout(t);
  }, [showToast, dismissToast]);

  return (
    <div className="min-h-screen flex flex-col md:flex-row">

      {/* ── Mobile top header ── */}
      <header className="md:hidden sticky top-0 z-40 flex items-center justify-between px-4 py-3 border-b border-border bg-background/95 backdrop-blur-sm shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center glow-ok">
            <Activity className="w-3.5 h-3.5 text-primary-foreground" strokeWidth={2.5} />
          </div>
          <span className="font-display font-bold text-[15px]">MonitoringAI</span>
        </div>
        {demoActive && (
          <div className="flex items-center gap-1.5 text-xs text-ok">
            <span className="w-1.5 h-1.5 rounded-full bg-ok pulse-dot" />
            Демо активно
          </div>
        )}
      </header>

      {/* ── Desktop sidebar ── */}
      <aside className="hidden md:flex w-64 shrink-0 border-r border-border bg-surface/40 flex-col">
        <div className="px-5 py-5 border-b border-border flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center glow-ok">
            <Activity className="w-4 h-4 text-primary-foreground" strokeWidth={2.5} />
          </div>
          <div>
            <div className="font-display font-bold text-[15px] leading-none">MonitoringAI</div>
            <div className="text-[10px] text-muted-foreground mt-1 mono uppercase tracking-wider">v2.3.1 · stable</div>
          </div>
        </div>

        <nav className="p-3 space-y-0.5">
          {nav.map((item) => {
            const active = isActive(item.to);
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-all ${
                  active
                    ? "bg-surface-2 text-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-surface-2/50"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="flex-1">{item.label}</span>
                {item.badge !== undefined && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded mono font-semibold ${
                    item.badgeTone === "crit" ? "bg-crit/15 text-crit" : "bg-surface-2 text-muted-foreground"
                  }`}>
                    {item.badge}
                  </span>
                )}
                {item.to === "/demo" && demoActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-ok pulse-dot" />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto p-4 border-t border-border">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-3 mono">Сервисы · 5</div>
          <div className="space-y-1.5">
            {services.map((s) => (
              <div key={s.name} className="flex items-center gap-2 text-xs">
                <span className={`w-1.5 h-1.5 rounded-full ${toneClass[s.status]} ${s.status !== "ok" ? "pulse-dot" : ""}`} />
                <span className="mono text-muted-foreground truncate">{s.name}</span>
              </div>
            ))}
          </div>
          <button className="mt-4 flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground">
            <Settings className="w-3.5 h-3.5" /> Настройки
          </button>
        </div>
      </aside>

      {/* ── Main content ── */}
      <main className="flex-1 min-w-0 pb-20 md:pb-0">{children}</main>

      {/* ── Mobile bottom navigation ── */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 border-t border-border bg-background/95 backdrop-blur-sm">
        <div className="flex items-stretch">
          {nav.map((item) => {
            const active = isActive(item.to);
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex-1 flex flex-col items-center justify-center py-2.5 gap-1 relative transition-colors ${
                  active ? "text-primary" : "text-muted-foreground"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[9px] mono leading-none">{item.label}</span>
                {item.badgeTone === "crit" && !active && (
                  <span className="absolute top-1.5 right-2 w-2 h-2 rounded-full bg-crit text-[6px] flex items-center justify-center text-white font-bold">
                    {item.badge}
                  </span>
                )}
                {item.to === "/demo" && demoActive && (
                  <span className="absolute top-1.5 right-2 w-1.5 h-1.5 rounded-full bg-ok pulse-dot" />
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* ── Telegram-style toast notification ── */}
      {showToast && completedScenario && (
        <TelegramToast
          scenario={completedScenario}
          service={service}
          onClose={dismissToast}
        />
      )}
    </div>
  );
}

function TelegramToast({
  scenario, service, onClose,
}: {
  scenario: 1 | 2;
  service: string;
  onClose: () => void;
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 30);
    return () => clearTimeout(t);
  }, []);

  const isS1 = scenario === 1;

  return (
    <div
      className={`fixed z-50 rounded-2xl overflow-hidden shadow-2xl border border-white/10 transition-all duration-500
        bottom-24 left-4 right-4
        md:bottom-6 md:left-auto md:right-6 md:w-80
        ${visible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}`}
      style={{ background: "oklch(0.20 0.018 250)" }}
    >
      <div className="flex items-center gap-3 px-4 py-3 border-b border-white/5">
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[oklch(0.55_0.18_235)] to-[oklch(0.45_0.20_250)] flex items-center justify-center shrink-0">
          <Send className="w-4 h-4 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold">MonitoringAI Bot</div>
          <div className="text-[11px] text-muted-foreground">Telegram · сейчас</div>
        </div>
        <button
          onClick={onClose}
          className="w-7 h-7 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-white/10 shrink-0"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="px-4 py-3 space-y-1.5">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full pulse-dot ${isS1 ? "bg-crit" : "bg-warn"}`} />
          <span className={`text-xs font-bold mono tracking-wider ${isS1 ? "text-crit" : "text-warn"}`}>
            {isS1 ? "P1 · ОШИБКА" : "P2 · АНОМАЛИЯ"}
          </span>
          <span className="ml-auto text-[10px] mono text-muted-foreground">{service}</span>
        </div>
        <div className="text-sm">
          {isS1 ? "DB connection pool exhausted — 3 ошибки за 9 сек" : "Деградация без ошибок — p95 ×3 за 20 мин"}
        </div>
        <div className="text-xs text-muted-foreground">
          {isS1 ? "Яндекс GPT: DB_POOL_SIZE=20, перезапустить сервис" : "Яндекс GPT: действуйте за 60–90 мин до инцидента"}
        </div>
      </div>

      <div className="px-4 pb-4 flex gap-2">
        <Link
          to="/telegram"
          onClick={onClose}
          className="flex-1 py-2 rounded-lg text-center text-xs font-medium"
          style={{ background: "oklch(0.55_0.18_235 / 0.9)", color: "white" }}
        >
          Открыть
        </Link>
        <button
          onClick={onClose}
          className="flex-1 py-2 rounded-lg bg-white/8 hover:bg-white/12 text-xs flex items-center justify-center gap-1.5"
        >
          <CheckCircle2 className="w-3 h-3 text-ok" /> Подтвердить
        </button>
      </div>

      <div className="h-0.5 bg-white/5">
        <div className="h-full bg-primary/60 toast-progress" />
      </div>
    </div>
  );
}
