import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { ChevronDown, Sparkles, TrendingDown, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { useDemo } from "@/lib/demo-context";

export const Route = createFileRoute("/alerts")({
  head: () => ({
    meta: [
      { title: "Алерты — MonitoringAI" },
      { name: "description", content: "Лента алертов с AI-приоритизацией и группировкой." },
    ],
  }),
  component: AlertsPage,
});

type Tone = "p0" | "p1" | "p2" | "p3";

const BASE_SECTIONS: { tone: Tone; label: string; sub: string; items: { service: string; title: string; sub: string; id?: string }[] }[] = [
  {
    tone: "p0",
    label: "P0 · Критично",
    sub: "Влияет на пользователей",
    items: [
      { service: "payment-service", title: "Рост ошибок 500 (×8 за 2 минуты)", sub: "12% пользователей checkout · 4 мин", id: "142" },
    ],
  },
  {
    tone: "p1",
    label: "P1 · Важно",
    sub: "Деградация качества",
    items: [
      { service: "order-service", title: "Задержки p95 выше нормы (1.2s)", sub: "длится 3 минуты", id: "141" },
      { service: "notification-service", title: "Рост таймаутов на 30%", sub: "тренд за последний час", id: "140" },
    ],
  },
  {
    tone: "p2",
    label: "P2 · Внимание",
    sub: "Мониторим",
    items: [
      { service: "auth-service", title: "Рост 401 ошибок (+18%)", sub: "вероятно — истёкшие токены" },
      { service: "search-service", title: "Повышенная нагрузка (CPU 78%)", sub: "ниже порога алерта" },
      { service: "cdn-edge", title: "Cache hit ratio 91% → 84%", sub: "после ротации ключей" },
      { service: "billing-cron", title: "Долгий старт задачи (+12s)", sub: "одноразово" },
      { service: "logger-shipper", title: "Очередь >10k событий", sub: "разгружается" },
    ],
  },
  {
    tone: "p3",
    label: "P3 · Шум",
    sub: "Отфильтровано AI",
    items: Array.from({ length: 39 }, (_, i) => ({
      service: ["auth", "redis", "kafka", "cron"][i % 4] + "-svc",
      title: "малозначимый алерт",
      sub: "автоматически сгруппирован",
    })),
  },
];

const toneStyles: Record<Tone, { dot: string; text: string; border: string; bg: string }> = {
  p0: { dot: "bg-crit", text: "text-crit", border: "border-crit/30", bg: "bg-crit/5" },
  p1: { dot: "bg-warn", text: "text-warn", border: "border-warn/30", bg: "bg-warn/5" },
  p2: { dot: "bg-p2", text: "text-p2", border: "border-p2/30", bg: "bg-p2/5" },
  p3: { dot: "bg-p3", text: "text-muted-foreground", border: "border-border", bg: "bg-surface/30" },
};

function AlertsPage() {
  const { completedScenario, service } = useDemo();
  const [open, setOpen] = useState<Record<string, boolean>>({ p0: true, p1: true, p2: false, p3: false });

  const sections = completedScenario
    ? BASE_SECTIONS.map((s) => {
        if (completedScenario === 1 && s.tone === "p1") {
          return {
            ...s,
            items: [
              { service, title: "DB connection pool exhausted — 3 ошибки за 9 сек", sub: "обнаружено AI-агентом · сейчас", id: "143" },
              ...s.items,
            ],
          };
        }
        if (completedScenario === 2 && s.tone === "p2") {
          return {
            ...s,
            items: [
              { service, title: "Аномалия: p95 ×3, DB ×20 — нет ошибок, превентивно", sub: "поймано до инцидента · сейчас" },
              ...s.items,
            ],
          };
        }
        return s;
      })
    : BASE_SECTIONS;

  return (
    <AppShell>
      <div className="p-4 md:p-8 max-w-[1500px]">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-end gap-4 sm:justify-between">
          <div>
            <div className="text-xs mono uppercase tracking-widest text-muted-foreground mb-2">/ alerts</div>
            <h1 className="text-2xl md:text-4xl font-bold">Лента алертов</h1>
            <p className="text-muted-foreground mt-2">AI-приоритизация и группировка против alert fatigue.</p>
          </div>
          <div className="flex gap-1 p-1 rounded-lg bg-surface-2 text-sm self-start sm:self-auto shrink-0">
            <button className="px-3 py-1.5 rounded-md bg-primary text-primary-foreground font-medium">По приоритету</button>
            <button className="px-3 py-1.5 rounded-md text-muted-foreground hover:text-foreground">Хронология</button>
            <button className="px-3 py-1.5 rounded-md text-muted-foreground hover:text-foreground">По сервису</button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6">
          <div className="space-y-3">
            {sections.map((s) => {
              const st = toneStyles[s.tone];
              const isOpen = open[s.tone];
              return (
                <div key={s.tone} className={`rounded-xl border ${st.border} ${st.bg} overflow-hidden`}>
                  <button
                    onClick={() => setOpen((o) => ({ ...o, [s.tone]: !o[s.tone] }))}
                    className="w-full px-5 py-3.5 flex items-center gap-3 hover:bg-white/[0.02]"
                  >
                    <span className={`w-2.5 h-2.5 rounded-full ${st.dot} ${s.tone === "p0" ? "pulse-dot" : ""}`} />
                    <span className={`font-display font-bold ${st.text}`}>{s.label}</span>
                    <span className="text-xs text-muted-foreground mono">{s.items.length}</span>
                    <span className="text-xs text-muted-foreground">— {s.sub}</span>
                    <ChevronDown className={`w-4 h-4 ml-auto text-muted-foreground transition-transform ${isOpen ? "rotate-180" : ""}`} />
                  </button>

                  {isOpen && (
                    <ul className="border-t border-border/50 divide-y divide-border/50">
                      {s.tone === "p3" ? (
                        <li className="px-5 py-6 text-center">
                          <div className="text-sm text-muted-foreground">
                            <span className="text-foreground font-medium">39 алертов</span>, классифицированных как малозначимые
                          </div>
                          <button className="mt-3 px-4 py-2 rounded-md bg-surface-2 border border-border text-xs hover:bg-surface-2/70">
                            Развернуть корзину шума
                          </button>
                        </li>
                      ) : (
                        s.items.map((it, i) => (
                          <li key={i}>
                            {it.id ? (
                              <Link
                                to="/incidents/$id"
                                params={{ id: it.id }}
                                className="flex items-center gap-4 px-5 py-3.5 hover:bg-white/[0.03] group"
                              >
                                <AlertRow item={it} />
                              </Link>
                            ) : (
                              <div className="flex items-center gap-4 px-5 py-3.5">
                                <AlertRow item={it} />
                              </div>
                            )}
                          </li>
                        ))
                      )}
                    </ul>
                  )}
                </div>
              );
            })}
          </div>

          {/* Sidebar stats */}
          <div className="space-y-4">
            <div className="rounded-xl border border-accent/30 bg-accent/5 p-5">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-4 h-4 text-accent" />
                <span className="text-xs mono uppercase tracking-wider text-accent">AI-фильтр</span>
              </div>
              <div className="text-3xl font-bold font-display mb-1">−73%</div>
              <div className="text-xs text-muted-foreground">меньше уведомлений за неделю</div>
              <div className="mt-3 h-1.5 rounded-full bg-surface-2 overflow-hidden">
                <div className="h-full w-[73%] bg-gradient-to-r from-accent to-primary" />
              </div>
            </div>

            <div className="rounded-xl border border-border bg-surface/50 p-5">
              <div className="flex items-center gap-2 mb-2">
                <ShieldCheck className="w-4 h-4 text-ok" />
                <span className="text-xs mono uppercase tracking-wider text-ok">Покрытие</span>
              </div>
              <div className="text-3xl font-bold font-display mb-1">0</div>
              <div className="text-xs text-muted-foreground">пропущенных критических алертов</div>
            </div>

            <div className="rounded-xl border border-border bg-surface/50 p-5">
              <div className="flex items-center gap-2 mb-3">
                <TrendingDown className="w-4 h-4 text-ok" />
                <span className="text-xs mono uppercase tracking-wider text-muted-foreground">Распределение</span>
              </div>
              {[
                { l: "P0", v: 1, c: "bg-crit" },
                { l: "P1", v: 2, c: "bg-warn" },
                { l: "P2", v: 5, c: "bg-p2" },
                { l: "P3", v: 39, c: "bg-p3" },
              ].map((r) => (
                <div key={r.l} className="flex items-center gap-3 text-xs mb-2 last:mb-0">
                  <span className="mono text-muted-foreground w-6">{r.l}</span>
                  <div className="flex-1 h-1.5 rounded-full bg-surface-2 overflow-hidden">
                    <div className={`h-full ${r.c}`} style={{ width: `${(r.v / 39) * 100}%` }} />
                  </div>
                  <span className="mono w-6 text-right">{r.v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function AlertRow({ item }: { item: { service: string; title: string; sub: string } }) {
  return (
    <>
      <div className="flex-1 min-w-0">
        <div className="text-sm">{item.title}</div>
        <div className="text-xs text-muted-foreground mono mt-0.5">{item.service} · {item.sub}</div>
      </div>
    </>
  );
}
