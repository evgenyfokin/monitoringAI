import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { ArrowUpRight, CheckCircle2, ChevronRight, Sparkles, Clock, AlertOctagon, GitBranch, Bell, History } from "lucide-react";

export const Route = createFileRoute("/incidents/$id")({
  head: () => ({
    meta: [
      { title: "Инцидент #142 — MonitoringAI" },
      { name: "description", content: "Детали инцидента: логи, гипотеза и чек-лист действий." },
    ],
  }),
  component: IncidentDetail,
});

type LogLevel = "ERROR" | "WARN" | "INFO";
type LogRow = { t: string; lvl: LogLevel; msg: string; key?: boolean };

const logs: LogRow[] = [
  { t: "14:30:02", lvl: "INFO", msg: "deployment payment-service v2.3.1 rolled out (5/5 pods ready)" },
  { t: "14:30:18", lvl: "INFO", msg: "payment-worker started — pid=24193 listening :8080" },
  { t: "14:31:44", lvl: "WARN", msg: "circuit-breaker [stripe-gw] half-open, retrying", key: true },
  { t: "14:31:57", lvl: "ERROR", msg: "POST /v1/charge → 500  upstream timeout after 30000ms", key: true },
  { t: "14:32:01", lvl: "ERROR", msg: "POST /v1/charge → 500  upstream timeout after 30000ms" },
  { t: "14:32:03", lvl: "ERROR", msg: "POST /v1/charge → 500  upstream timeout after 30000ms" },
  { t: "14:32:09", lvl: "ERROR", msg: "db.pool: connection_acquire_failed pool=8/8 wait=30s", key: true },
  { t: "14:32:11", lvl: "WARN", msg: "GC pause 1.4s — heap 92% used" },
  { t: "14:32:14", lvl: "ERROR", msg: "trace=a1f9b: NullPointerException at PaymentProcessor.applyDiscount:147", key: true },
  { t: "14:32:18", lvl: "ERROR", msg: "trace=b2c01: NullPointerException at PaymentProcessor.applyDiscount:147" },
  { t: "14:32:22", lvl: "INFO", msg: "alert dispatched → telegram:#oncall, opsgenie:P0" },
];

const lvlCls: Record<LogLevel, string> = {
  ERROR: "text-crit bg-crit/10",
  WARN: "text-warn bg-warn/10",
  INFO: "text-info bg-info/10",
};

function IncidentDetail() {
  return (
    <AppShell>
      <div className="p-4 md:p-8 max-w-[1600px]">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 text-xs mono text-muted-foreground mb-3">
            <Link to="/" className="hover:text-foreground">/ dashboard</Link>
            <ChevronRight className="w-3 h-3" />
            <span>incidents</span>
            <ChevronRight className="w-3 h-3" />
            <span className="text-foreground">#142</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2 md:gap-3 mb-2">
                <span className="px-2 py-1 rounded bg-crit/15 text-crit text-[10px] mono uppercase tracking-wider font-semibold flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-crit pulse-dot" /> P0 · Активен
                </span>
                <span className="text-xs text-muted-foreground mono">
                  начат 14:32 · длительность <span className="text-foreground">04:23</span>
                </span>
              </div>
              <h1 className="text-xl md:text-3xl font-bold leading-tight">
                Инцидент #142 — рост ошибок <span className="mono text-crit">payment-service</span>
              </h1>
            </div>
            <div className="flex flex-wrap gap-2 shrink-0">
              <button className="px-3 md:px-4 py-2 rounded-lg bg-ok text-primary-foreground text-sm font-medium hover:opacity-90 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" /> <span className="hidden sm:inline">Подтвердить</span>
              </button>
              <button className="px-3 md:px-4 py-2 rounded-lg bg-warn text-primary-foreground text-sm font-medium hover:opacity-90 flex items-center gap-1.5">
                <ArrowUpRight className="w-4 h-4" /> <span className="hidden sm:inline">Эскалировать</span>
              </button>
              <button className="px-3 md:px-4 py-2 rounded-lg bg-surface-2 text-foreground text-sm font-medium hover:bg-surface-2/70 border border-border">
                Закрыть
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-6">
          {/* Logs */}
          <div className="rounded-xl border border-border bg-surface/50 overflow-hidden flex flex-col">
            <div className="px-5 py-3.5 border-b border-border flex items-center gap-3">
              <h2 className="font-display font-semibold text-sm">Кластер логов</h2>
              <span className="text-xs text-muted-foreground mono">payment-service</span>
              <div className="ml-auto flex gap-1 p-0.5 rounded-md bg-surface-2 text-xs">
                <button className="px-2 md:px-3 py-1 rounded bg-primary text-primary-foreground mono">
                  <span className="hidden md:inline">★ Релевантные · 47 / 12 384</span>
                  <span className="md:hidden">★ 47 / 12 384</span>
                </button>
                <button className="px-2 md:px-3 py-1 rounded text-muted-foreground mono hover:text-foreground">Все</button>
              </div>
            </div>

            <div className="font-mono text-[12.5px] leading-relaxed overflow-x-auto">
              {logs.map((log, i) => (
                <div
                  key={i}
                  className={`flex items-start gap-3 px-5 py-1.5 border-l-2 ${
                    log.key
                      ? "bg-warn/5 border-warn"
                      : "border-transparent hover:bg-surface-2/40"
                  }`}
                >
                  <span className="text-muted-foreground shrink-0 w-20">{log.t}</span>
                  <span className={`shrink-0 px-1.5 py-0.5 rounded text-[10px] font-bold w-12 text-center ${lvlCls[log.lvl]}`}>
                    {log.lvl}
                  </span>
                  <span className={log.key ? "text-foreground" : "text-muted-foreground"}>{log.msg}</span>
                  {log.key && (
                    <span className="ml-auto shrink-0 text-warn text-[10px] mono uppercase tracking-wider">★ ключевая</span>
                  )}
                </div>
              ))}
              <button className="w-full text-center py-3 text-xs text-muted-foreground hover:text-foreground hover:bg-surface-2/40 border-t border-border mono">
                ↕ Показать ещё контекст вокруг выделенных строк
              </button>
            </div>

            {/* Timeline */}
            <div className="border-t border-border p-5">
              <div className="flex items-center gap-2 mb-4">
                <History className="w-4 h-4 text-muted-foreground" />
                <h3 className="font-display font-semibold text-sm">Таймлайн</h3>
              </div>
              <div className="relative pl-4">
                <div className="absolute left-[5px] top-1 bottom-1 w-px bg-border" />
                {[
                  { t: "14:17", icon: GitBranch, tone: "text-info", text: "Деплой payment-service v2.3.1" },
                  { t: "14:31", icon: Bell, tone: "text-warn", text: "Первый WARN: circuit-breaker half-open" },
                  { t: "14:32", icon: AlertOctagon, tone: "text-crit", text: "Алерт P0 → создан инцидент #142" },
                  { t: "14:33", icon: Sparkles, tone: "text-accent", text: "AI выдвинул гипотезу + чек-лист" },
                  { t: "14:34", icon: CheckCircle2, tone: "text-muted-foreground", text: "On-call инженер подтвердил" },
                ].map((it, i) => (
                  <div key={i} className="relative pl-4 pb-3 last:pb-0">
                    <span className="absolute -left-[2px] top-1 w-2 h-2 rounded-full bg-border-strong" />
                    <div className="flex items-center gap-2 text-xs">
                      <span className="mono text-muted-foreground w-12">{it.t}</span>
                      <it.icon className={`w-3.5 h-3.5 ${it.tone}`} />
                      <span>{it.text}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* AI Panel */}
          <div className="space-y-4">
            <div className="rounded-xl border border-accent/30 bg-accent/5 p-5">
              <div className="flex items-center gap-2 mb-3">
                <span className="w-7 h-7 rounded-md bg-accent/20 flex items-center justify-center">
                  <Sparkles className="w-3.5 h-3.5 text-accent" />
                </span>
                <h3 className="font-display font-semibold text-sm">AI-трактовка</h3>
                <span className="ml-auto text-[10px] mono text-muted-foreground uppercase">уверенность 87%</span>
              </div>
              <p className="text-sm leading-relaxed text-foreground/90">
                Скорее всего: ошибка после деплоя <span className="mono text-warn">v2.3.1</span>. Изменения в{" "}
                <span className="mono">PaymentProcessor.applyDiscount</span> вызывают NPE при пустом купоне →
                таймауты в БД-пуле → каскад 500.
              </p>
            </div>

            <div className="rounded-xl border border-border bg-surface/50 p-5">
              <h3 className="font-display font-semibold text-sm mb-3 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-ok" /> Чек-лист действий
              </h3>
              <ul className="space-y-2.5">
                {[
                  { txt: "Проверить статус деплоя v2.3.1", cmd: "kubectl rollout status deployment/payment-service" },
                  { txt: "Откатить на v2.3.0", cmd: "kubectl rollout undo deployment/payment-service" },
                  { txt: "Проверить здоровье payment-worker :8080", cmd: "curl :8080/healthz" },
                  { txt: "Если не помогает — пинг @database-team" },
                ].map((it, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm group">
                    <input
                      type="checkbox"
                      className="mt-0.5 w-4 h-4 rounded border-border-strong bg-surface-2 accent-primary"
                    />
                    <div className="flex-1">
                      <div>{it.txt}</div>
                      {it.cmd && (
                        <code className="block mt-1 text-[11px] px-2 py-1 rounded bg-background border border-border text-accent">
                          $ {it.cmd}
                        </code>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-xl border border-border bg-surface/50 p-5">
              <h3 className="font-display font-semibold text-sm mb-3 flex items-center gap-2">
                <Clock className="w-4 h-4 text-muted-foreground" /> Похожие инциденты
              </h3>
              <div className="text-sm space-y-2">
                <div className="flex items-start gap-3 p-2 rounded hover:bg-surface-2/50 cursor-pointer">
                  <span className="text-xs mono text-muted-foreground shrink-0 mt-0.5">12 мар</span>
                  <div className="flex-1">
                    <div>payment-service: NPE после деплоя</div>
                    <div className="text-xs text-muted-foreground mt-0.5">решён откатом за <span className="text-ok">8 мин</span></div>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-2 rounded hover:bg-surface-2/50 cursor-pointer">
                  <span className="text-xs mono text-muted-foreground shrink-0 mt-0.5">04 фев</span>
                  <div className="flex-1">
                    <div>order-service: таймауты БД-пула</div>
                    <div className="text-xs text-muted-foreground mt-0.5">решён увеличением пула за <span className="text-ok">14 мин</span></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button className="py-2.5 rounded-lg bg-surface-2 hover:bg-surface-2/70 border border-border text-xs">
                Ложная тревога
              </button>
              <button className="py-2.5 rounded-lg bg-ok/15 text-ok hover:bg-ok/25 border border-ok/30 text-xs font-medium">
                ✓ Разобрался
              </button>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
