import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { AlertOctagon, Bell, Clock, TrendingDown, ArrowRight, CheckCircle2, AlertTriangle, Flame, Sparkles } from "lucide-react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts";
import { useDemo } from "@/lib/demo-context";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Дашборд — MonitoringAI" },
      { name: "description", content: "Общий обзор состояния сервисов и инцидентов." },
    ],
  }),
  component: Dashboard,
});

const chartData = [
  { day: "Пн", alerts: 38, crit: 1 },
  { day: "Вт", alerts: 52, crit: 0 },
  { day: "Ср", alerts: 41, crit: 2 },
  { day: "Чт", alerts: 67, crit: 3 },
  { day: "Пт", alerts: 89, crit: 4 },
  { day: "Сб", alerts: 34, crit: 1 },
  { day: "Вс", alerts: 47, crit: 3 },
];

const events = [
  { time: "14:32", type: "crit", service: "payment-service", title: "Рост ошибок 500 (×8 за 2 мин)", status: "Активен", id: "142" },
  { time: "14:18", type: "warn", service: "order-service", title: "Задержки выше нормы p95 → 1.2s", status: "Наблюдение", id: "141" },
  { time: "13:45", type: "warn", service: "notification-service", title: "Рост таймаутов на 30%", status: "Наблюдение", id: "140" },
  { time: "12:02", type: "ok", service: "search-service", title: "Инцидент разрешён за 11 мин", status: "Закрыт", id: "139" },
  { time: "10:24", type: "ok", service: "auth-service", title: "Деплой v4.1.2 завершён", status: "Закрыт", id: "138" },
];

const eventMeta: Record<string, { icon: typeof Bell; cls: string }> = {
  crit: { icon: Flame, cls: "text-crit bg-crit/10" },
  warn: { icon: AlertTriangle, cls: "text-warn bg-warn/10" },
  ok: { icon: CheckCircle2, cls: "text-ok bg-ok/10" },
};

function Dashboard() {
  const { stage, newIncidentId, service, completedScenario } = useDemo();
  const demoActive = stage === "complete" || stage === "sending";
  const isS1 = completedScenario === 1;
  const now = new Date();
  const liveTime = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

  const liveEvent = demoActive
    ? {
        time: liveTime,
        type: isS1 ? "crit" : "warn",
        service: service,
        title: isS1
          ? "DB connection pool exhausted — 3 ошибки за 9 сек"
          : "Аномальный паттерн: p95 ×3, DB ×20 — нет ошибок",
        status: stage === "complete" ? (isS1 ? "Активен" : "Аномалия") : "Создаётся...",
        id: newIncidentId ?? (isS1 ? "143" : "A08"),
      }
    : null;

  const displayEvents = liveEvent ? [liveEvent, ...events] : events;

  return (
    <AppShell>
      <div className="p-4 md:p-8 max-w-[1400px]">
        <div className="flex items-end justify-between mb-6 gap-4">
          <div>
            <div className="text-xs mono uppercase tracking-widest text-muted-foreground mb-2">/ dashboard</div>
            <h1 className="text-2xl md:text-4xl font-bold">Обзор</h1>
          </div>
          <div className="text-xs mono text-muted-foreground shrink-0">обновлено {demoActive ? "сейчас" : "3 сек назад"}</div>
        </div>

        {/* Demo live banner */}
        {demoActive && (
          <div className={`mb-4 rounded-xl border p-4 flex items-center gap-3 log-line-appear ${isS1 ? "border-crit/30 bg-crit/5" : "border-warn/30 bg-warn/5"}`}>
            <Sparkles className={`w-5 h-5 shrink-0 ${isS1 ? "text-crit" : "text-warn"}`} />
            <div className="flex-1 text-sm">
              <span className={`font-medium ${isS1 ? "text-crit" : "text-warn"}`}>
                {isS1 ? "Новый инцидент" : "Аномалия обнаружена"}
              </span>
              <span className="text-muted-foreground">
                {isS1
                  ? ` — AI-агент обнаружил ошибки в ${service} и создал инцидент #${newIncidentId}`
                  : ` — AI-агент поймал деградацию в ${service} до наступления инцидента`}
              </span>
            </div>
            <Link to="/demo" className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
              Сценарий <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        )}

        {/* Status banner */}
        <div className="mb-6 rounded-xl border border-crit/30 bg-crit/5 p-4 md:p-5 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 glow-crit">
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-crit/15 flex items-center justify-center shrink-0">
            <span className="w-3 h-3 rounded-full bg-crit pulse-dot" />
          </div>
          <div className="flex-1">
            <div className="font-display text-base md:text-lg font-semibold">
              {demoActive
                ? isS1 ? "3 активных инцидента требуют внимания" : "2 инцидента + 1 аномалия под наблюдением"
                : "2 активных инцидента требуют внимания"}
            </div>
            <div className="text-sm text-muted-foreground mt-0.5">
              {demoActive
                ? isS1
                  ? `payment-service P0 · ${service} P1 — обнаружено AI-агентом`
                  : `payment-service P0 · ${service} — аномалия поймана до инцидента`
                : "3 из 5 сервисов работают штатно · payment-service в критическом состоянии"}
            </div>
          </div>
          <Link
            to="/incidents/$id"
            params={{ id: "142" }}
            className="px-4 py-2 rounded-lg bg-crit text-white text-sm font-medium hover:bg-crit/90 flex items-center gap-2 self-start sm:self-auto shrink-0"
          >
            <span className="hidden sm:inline">Открыть инцидент</span>
            <span className="sm:hidden">Открыть</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* KPI widgets */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <KpiCard
            icon={AlertOctagon}
            iconTone="text-crit bg-crit/10"
            label="Активные инциденты"
            value={demoActive ? (isS1 ? "3" : "2 + 1A") : "2"}
            sub={demoActive
              ? isS1
                ? <><span className="text-crit font-medium">P0</span> · payment + {service}</>
                : <><span className="text-crit font-medium">P0</span> · payment · аномалия: {service}</>
              : "P0 · payment-service"}
          />
          <KpiCard
            icon={Bell}
            iconTone="text-warn bg-warn/10"
            label="Алерты за 24ч"
            value={demoActive ? "48" : "47"}
            sub={<><span className="text-crit font-medium">{demoActive ? "4" : "3"} критичных</span> · 44 отфильтровано AI</>}
          />
          <KpiCard
            icon={Clock}
            iconTone="text-ok bg-ok/10"
            label="MTTR за месяц"
            value="23 мин"
            sub={
              <span className="flex items-center gap-1 text-ok">
                <TrendingDown className="w-3.5 h-3.5" /> −38% к прошлому месяцу
              </span>
            }
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Events list */}
          <div className="col-span-1 lg:col-span-2 rounded-xl border border-border bg-surface/50 overflow-hidden">
            <div className="px-5 py-4 border-b border-border flex items-center justify-between">
              <h2 className="font-display font-semibold">Последние события</h2>
              <Link to="/alerts" className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
                Все алерты <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <ul className="divide-y divide-border">
              {displayEvents.map((e, idx) => {
                const M = eventMeta[e.type];
                const Icon = M.icon;
                const isLive = idx === 0 && liveEvent !== null;
                return (
                  <li key={e.id + idx} className={isLive ? "log-line-appear" : ""}>
                    <Link
                      to="/incidents/$id"
                      params={{ id: e.id }}
                      className={`flex items-center gap-4 px-5 py-3.5 hover:bg-surface-2/50 transition-colors group ${isLive ? "bg-crit/3" : ""}`}
                    >
                      <span className="mono text-xs text-muted-foreground w-12">{e.time}</span>
                      <span className={`w-8 h-8 rounded-md flex items-center justify-center ${M.cls}`}>
                        <Icon className="w-4 h-4" />
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">{e.title}</div>
                        <div className="text-xs text-muted-foreground mono mt-0.5">{e.service}</div>
                      </div>
                      <span className={`text-[10px] mono uppercase tracking-wider px-2 py-1 rounded ${isLive ? "bg-crit/15 text-crit" : "bg-surface-2 text-muted-foreground"}`}>
                        {e.status}
                      </span>
                      {isLive && <span className="w-1.5 h-1.5 rounded-full bg-crit pulse-dot" />}
                      <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition" />
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Chart */}
          <div className="rounded-xl border border-border bg-surface/50 p-5 flex flex-col">
            <div className="flex items-start justify-between mb-1">
              <div>
                <h2 className="font-display font-semibold">Alert Fatigue</h2>
                <div className="text-xs text-muted-foreground mt-1">алерты по дням, 7д</div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold mono">368</div>
                <div className="text-[10px] text-ok mono uppercase">−73% после AI</div>
              </div>
            </div>
            <div className="flex-1 -mx-2 mt-2 min-h-[180px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 8, right: 6, left: -24, bottom: 0 }}>
                  <defs>
                    <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="oklch(0.85 0.18 145)" stopOpacity={0.5} />
                      <stop offset="100%" stopColor="oklch(0.85 0.18 145)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="oklch(1 0 0 / 0.04)" vertical={false} />
                  <XAxis dataKey="day" stroke="oklch(0.6 0.02 250)" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="oklch(0.6 0.02 250)" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{
                      background: "oklch(0.20 0.018 250)",
                      border: "1px solid oklch(0.30 0.020 250)",
                      borderRadius: 8,
                      fontSize: 12,
                    }}
                  />
                  <Area type="monotone" dataKey="alerts" stroke="oklch(0.85 0.18 145)" strokeWidth={2} fill="url(#g1)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function KpiCard({
  icon: Icon,
  iconTone,
  label,
  value,
  sub,
}: {
  icon: typeof Bell;
  iconTone: string;
  label: string;
  value: string;
  sub: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border bg-surface/50 p-5 relative overflow-hidden">
      <div className="absolute inset-0 grid-bg opacity-30" />
      <div className="relative">
        <div className="flex items-start justify-between mb-3">
          <div className="text-xs uppercase tracking-wider text-muted-foreground mono">{label}</div>
          <span className={`w-9 h-9 rounded-lg flex items-center justify-center ${iconTone}`}>
            <Icon className="w-4 h-4" />
          </span>
        </div>
        <div className="text-4xl font-bold font-display mb-2">{value}</div>
        <div className="text-xs text-muted-foreground">{sub}</div>
      </div>
    </div>
  );
}
