import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Sparkles, AlertTriangle, TrendingUp, CheckCircle2, Eye, Zap, Clock } from "lucide-react";
import {
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ReferenceArea,
  ResponsiveContainer,
} from "recharts";
import { useDemo } from "@/lib/demo-context";

export const Route = createFileRoute("/anomalies")({
  head: () => ({
    meta: [
      { title: "Аномалии — MonitoringAI" },
      { name: "description", content: "Превентивное обнаружение проблем до инцидента." },
    ],
  }),
  component: AnomalyPage,
});

const trendData = [
  { t: "16:00", p95: 178, db: 41 },
  { t: "16:02", p95: 183, db: 43 },
  { t: "16:04", p95: 193, db: 49 },
  { t: "16:06", p95: 208, db: 58 },
  { t: "16:08", p95: 231, db: 81 },
  { t: "16:10", p95: 274, db: 156 },
  { t: "16:12", p95: 340, db: 312 },
  { t: "16:13", p95: 420, db: 890 },
  { t: "16:15", p95: 480, db: 940, proj: true },
  { t: "16:18", p95: 530, db: 1100, proj: true },
  { t: "16:22", p95: 590, db: 1380, proj: true },
];

const signals = [
  { label: "p95 latency", val: "340ms", baseline: "180ms", up: true, anomaly: true },
  { label: "DB avg query", val: "890ms", baseline: "45ms", up: true, anomaly: true },
  { label: "Memory usage", val: "78%", baseline: "61%", up: true, anomaly: true },
  { label: "CPU load", val: "42%", baseline: "38%", up: false, anomaly: false },
  { label: "Error rate", val: "0%", baseline: "0%", up: false, anomaly: false },
];

const history = [
  { date: "22 апр", service: "order-service", title: "pool exhaustion", savedTime: "73 мин до инцидента" },
  { date: "15 мар", service: "payment-service", title: "memory leak", savedTime: "2 ч до инцидента" },
  { date: "04 фев", service: "auth-service", title: "token cache miss", savedTime: "40 мин до инцидента" },
];

function AnomalyPage() {
  const { completedScenario, service, stage } = useDemo();
  const demoS2 = completedScenario === 2 || (stage !== "idle" && stage !== "connecting");
  const s2running = stage !== "idle" && stage !== "complete" && stage !== "connecting";

  return (
    <AppShell>
      <div className="p-8 max-w-[1400px]">
        {/* Header */}
        <div className="mb-6">
          <div className="text-xs mono uppercase tracking-widest text-muted-foreground mb-2">/ anomalies</div>
          <h1 className="text-4xl font-bold">Превентивное обнаружение</h1>
          <p className="text-muted-foreground mt-2 max-w-2xl">
            AI ловит деградацию по паттернам метрик — до первой ошибки, до жалоб пользователей, до инцидента.
          </p>
        </div>

        {/* Active anomaly banner */}
        {demoS2 ? (
          <div className="mb-6 rounded-xl border border-warn/30 bg-warn/5 p-5 flex items-start gap-4 glow-warn log-line-appear">
            <div className="w-10 h-10 rounded-lg bg-warn/15 flex items-center justify-center shrink-0">
              {s2running
                ? <span className="w-3 h-3 rounded-full bg-warn pulse-dot" />
                : <AlertTriangle className="w-5 h-5 text-warn" />}
            </div>
            <div className="flex-1">
              <div className="font-display font-semibold text-lg flex items-center gap-2">
                {s2running ? "Анализирую аномалию..." : "Аномалия обнаружена — инцидент предотвращён"}
                {!s2running && <span className="text-xs font-normal mono bg-warn/15 text-warn px-2 py-0.5 rounded">A08</span>}
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                <span className="mono text-foreground">{service ?? "checkout-service"}</span>
                {" "}— p95 растёт с 180ms до 340ms за 13 мин · DB замедлился в 20× · ошибок нет
              </div>
            </div>
            <div className="flex gap-2 shrink-0">
              <button className="px-3 py-2 rounded-lg bg-warn text-primary-foreground text-sm font-medium">Изучить</button>
              <button className="px-3 py-2 rounded-lg bg-surface-2 border border-border text-sm">Мониторить</button>
            </div>
          </div>
        ) : (
          <div className="mb-6 rounded-xl border border-warn/30 bg-warn/5 p-5 flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-warn/15 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5 text-warn" />
            </div>
            <div className="flex-1">
              <div className="font-display font-semibold text-lg">Аномалия — конверсия checkout снизилась</div>
              <div className="text-sm text-muted-foreground mt-1">
                Конверсия <span className="mono text-foreground">checkout</span> снизилась на{" "}
                <span className="text-warn font-semibold">−18%</span> за последний час. Технических ошибок нет.
              </div>
            </div>
            <div className="flex gap-2 shrink-0">
              <button className="px-3 py-2 rounded-lg bg-warn text-primary-foreground text-sm font-medium">Изучить</button>
              <button className="px-3 py-2 rounded-lg bg-surface-2 border border-border text-sm">Игнорировать</button>
            </div>
          </div>
        )}

        {/* KPI row */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <StatCard icon={Eye} label="Аномалий сегодня" value={demoS2 ? "2" : "1"} sub="−нет ошибок" tone="warn" />
          <StatCard icon={Zap} label="Предотвращено" value={demoS2 ? "1" : "0"} sub="инцидентов этим методом" tone="ok" />
          <StatCard icon={Clock} label="Среднее предупреждение" value="67 мин" sub="до инцидента по истории" tone="accent" />
          <StatCard icon={CheckCircle2} label="False positive rate" value="12%" sub="за последние 30 дней" tone="muted" />
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-[1.5fr_1fr] gap-6">
          {/* Left: signals + chart */}
          <div className="space-y-4">
            {/* Signal cards */}
            <div className="rounded-xl border border-border bg-surface/50 p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display font-semibold text-sm">Сигналы аномалии</h2>
                <span className="text-xs mono text-muted-foreground">
                  {demoS2 ? service : "checkout-service"} · сейчас
                </span>
              </div>
              <div className="grid grid-cols-5 gap-2">
                {signals.map((s) => (
                  <div
                    key={s.label}
                    className={`rounded-lg p-3 border text-center ${
                      s.anomaly ? "border-warn/30 bg-warn/5" : "border-border bg-surface-2/50"
                    }`}
                  >
                    <div className={`text-lg font-bold font-display ${s.anomaly ? "text-warn" : "text-ok"}`}>
                      {s.val}
                    </div>
                    <div className="text-[10px] text-muted-foreground mono mt-0.5">{s.label}</div>
                    <div className="text-[9px] text-muted-foreground/60 mt-1">
                      {s.anomaly ? "↑" : "="} норма: {s.baseline}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-3 pt-3 border-t border-border flex items-center gap-2 text-xs text-muted-foreground">
                <AlertTriangle className="w-3 h-3 text-warn" />
                3 из 5 метрик аномальны — корреляция указывает на DB-проблему
              </div>
            </div>

            {/* Trend chart */}
            <div className="rounded-xl border border-border bg-surface/50 p-5">
              <div className="flex items-center justify-between mb-1">
                <h2 className="font-display font-semibold text-sm">Тренд деградации · p95 latency</h2>
                <span className="text-xs mono text-muted-foreground">16:00 — 16:22</span>
              </div>
              <div className="text-xs text-muted-foreground mb-4">
                Точка AI-обнаружения и прогнозируемая траектория до инцидента (пунктир)
              </div>

              <div style={{ height: 260 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={trendData} margin={{ top: 8, right: 16, left: -20, bottom: 0 }}>
                    <CartesianGrid stroke="oklch(1 0 0 / 0.04)" vertical={false} />
                    <XAxis dataKey="t" stroke="oklch(0.6 0.02 250)" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis stroke="oklch(0.6 0.02 250)" fontSize={10} tickLine={false} axisLine={false} />
                    <Tooltip
                      contentStyle={{
                        background: "oklch(0.20 0.018 250)",
                        border: "1px solid oklch(0.30 0.020 250)",
                        borderRadius: 8,
                        fontSize: 12,
                      }}
                      formatter={(val: number, name: string) => [
                        `${val}ms`,
                        name === "p95" ? "p95 latency" : "DB query",
                      ]}
                    />
                    {/* Zones */}
                    <ReferenceArea x1="16:00" x2="16:10" fill="oklch(0.78 0.17 150 / 0.04)" />
                    <ReferenceArea x1="16:10" x2="16:13" fill="oklch(0.78 0.16 60 / 0.08)" label={{ value: "⚑ AI", position: "insideTopLeft", fill: "oklch(0.78 0.16 60)", fontSize: 11 }} />
                    {/* Thresholds */}
                    <ReferenceLine y={500} stroke="oklch(0.68 0.22 22 / 0.6)" strokeDasharray="4 2" label={{ value: "Порог инцидента", position: "insideTopRight", fill: "oklch(0.68 0.22 22)", fontSize: 10 }} />
                    <ReferenceLine y={300} stroke="oklch(0.78 0.16 60 / 0.4)" strokeDasharray="4 2" label={{ value: "Порог аномалии", position: "insideTopRight", fill: "oklch(0.78 0.16 60 / 0.7)", fontSize: 10 }} />
                    {/* Lines */}
                    <Line
                      type="monotone"
                      dataKey="p95"
                      stroke="oklch(0.78 0.16 60)"
                      strokeWidth={2}
                      dot={false}
                      strokeDasharray="0"
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Right: AI analysis + history */}
          <div className="space-y-4">
            {/* AI prediction */}
            <div className="rounded-xl border border-accent/30 bg-accent/5 p-5">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-4 h-4 text-accent" />
                <span className="text-xs mono uppercase tracking-wider text-accent">AI-прогноз</span>
              </div>

              <div className="text-center mb-4">
                <div className="text-5xl font-bold font-display text-warn">78%</div>
                <div className="text-sm text-muted-foreground mt-1">вероятность инцидента</div>
                <div className="text-xs mono text-muted-foreground mt-0.5">в ближайшие 60–90 мин</div>
              </div>

              <div className="h-2 rounded-full bg-surface-2 overflow-hidden mb-4">
                <div className="h-full bg-gradient-to-r from-warn to-crit" style={{ width: "78%" }} />
              </div>

              <p className="text-sm text-foreground/90 leading-relaxed">
                Паттерн p95↑ + DB slow + memory↑ совпадает с{" "}
                <span className="text-warn font-medium">3 историческими случаями</span>, предшествовавшими pool exhaustion.
                Ошибок нет — действуйте до инцидента.
              </p>
            </div>

            {/* Recommended actions */}
            <div className="rounded-xl border border-border bg-surface/50 p-5">
              <h3 className="font-display font-semibold text-sm mb-3 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-warn" /> Рекомендованные действия
              </h3>
              <ul className="space-y-2.5">
                {[
                  { txt: "EXPLAIN ANALYZE на медленных запросах (orders)", urgent: true },
                  { txt: "DB_POOL_SIZE=8 → 16, перезапустить сервис", urgent: true },
                  { txt: "Включить алерт на p95 > 300ms" },
                  { txt: "Мониторить memory usage — если >85%, GC tuning" },
                ].map((it, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm">
                    <input type="checkbox" className="mt-0.5 w-4 h-4 rounded border-border-strong bg-surface-2 accent-primary" />
                    <span className={it.urgent ? "text-warn" : "text-muted-foreground"}>{it.txt}</span>
                    {it.urgent && <span className="text-[9px] mono text-warn border border-warn/30 px-1 rounded ml-auto shrink-0">↑ срочно</span>}
                  </li>
                ))}
              </ul>
            </div>

            {/* Historical prevention */}
            <div className="rounded-xl border border-border bg-surface/50 p-5">
              <h3 className="font-display font-semibold text-sm mb-3 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-ok" />
                <span>Поймано до инцидента</span>
                <span className="ml-auto text-xs mono text-ok bg-ok/15 px-2 py-0.5 rounded">+{history.length}</span>
              </h3>
              <div className="space-y-2.5">
                {history.map((h, i) => (
                  <div key={i} className="flex items-start gap-3 text-sm p-2 rounded hover:bg-surface-2/50 cursor-pointer">
                    <span className="text-xs mono text-muted-foreground shrink-0 mt-0.5 w-14">{h.date}</span>
                    <div className="flex-1">
                      <div>{h.service}: {h.title}</div>
                      <div className="text-xs text-ok mt-0.5 flex items-center gap-1">
                        <Zap className="w-3 h-3" /> предотвращено за {h.savedTime}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function StatCard({
  icon: Icon, label, value, sub, tone,
}: {
  icon: typeof Eye;
  label: string;
  value: string;
  sub: string;
  tone: "warn" | "ok" | "accent" | "muted";
}) {
  const colors = {
    warn: "text-warn bg-warn/10",
    ok: "text-ok bg-ok/10",
    accent: "text-accent bg-accent/10",
    muted: "text-muted-foreground bg-surface-2",
  };
  return (
    <div className="rounded-xl border border-border bg-surface/50 p-4">
      <div className="flex items-start justify-between mb-2">
        <span className="text-xs uppercase tracking-wider text-muted-foreground mono">{label}</span>
        <span className={`w-8 h-8 rounded-lg flex items-center justify-center ${colors[tone]}`}>
          <Icon className="w-4 h-4" />
        </span>
      </div>
      <div className="text-3xl font-bold font-display mb-1">{value}</div>
      <div className="text-xs text-muted-foreground">{sub}</div>
    </div>
  );
}
