import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { useDemo, type DemoStage } from "@/lib/demo-context";
import {
  Play,
  RotateCcw,
  Send,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Bot,
  ArrowRight,
  Server,
  Cpu,
  Activity,
} from "lucide-react";
import { useEffect, useState, useRef } from "react";

export const Route = createFileRoute("/demo")({
  head: () => ({
    meta: [{ title: "Демо-сценарий — MonitoringAI" }],
  }),
  component: DemoPage,
});

const SCENARIO_STEPS: Record<1 | 2, { key: DemoStage; label: string }[]> = {
  1: [
    { key: "connecting", label: "Запуск" },
    { key: "receiving", label: "Получение логов" },
    { key: "detected", label: "Ошибка найдена" },
    { key: "analyzing", label: "AI-анализ" },
    { key: "ready", label: "Рекомендация" },
    { key: "sending", label: "Telegram" },
    { key: "complete", label: "Инцидент создан" },
  ],
  2: [
    { key: "connecting", label: "Запуск" },
    { key: "receiving", label: "Анализ метрик" },
    { key: "detected", label: "Аномалия найдена" },
    { key: "analyzing", label: "AI-анализ" },
    { key: "ready", label: "Рекомендация" },
    { key: "sending", label: "Telegram" },
    { key: "complete", label: "Аномалия зафиксирована" },
  ],
};

const STAGE_ORDER: DemoStage[] = [
  "idle", "connecting", "receiving", "detected",
  "analyzing", "ready", "sending", "complete",
];

function DemoPage() {
  const { stage, visibleLogs, recommendation, newIncidentId, scenario, setScenario, runDemo, reset } = useDemo();
  const [typedRec, setTypedRec] = useState("");
  const prevRecRef = useRef("");

  useEffect(() => {
    if (!recommendation || recommendation === prevRecRef.current) return;
    prevRecRef.current = recommendation;
    setTypedRec("");
    let i = 0;
    const id = setInterval(() => {
      i++;
      setTypedRec(recommendation.slice(0, i));
      if (i >= recommendation.length) clearInterval(id);
    }, 14);
    return () => clearInterval(id);
  }, [recommendation]);

  useEffect(() => {
    if (stage === "idle") {
      setTypedRec("");
      prevRecRef.current = "";
    }
  }, [stage]);

  const isRunning = stage !== "idle";
  const stageIdx = STAGE_ORDER.indexOf(stage);
  const steps = SCENARIO_STEPS[scenario];

  const stepDone = (key: DemoStage) =>
    STAGE_ORDER.indexOf(key) < stageIdx;
  const stepActive = (key: DemoStage) => key === stage;

  const isS1 = scenario === 1;

  return (
    <AppShell>
      <div className="p-4 md:p-8 max-w-[1600px]">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
          <div>
            <div className="text-xs mono uppercase tracking-widest text-muted-foreground mb-2">/ demo</div>
            <h1 className="text-2xl md:text-4xl font-bold">Демо-сценарий</h1>
            <p className="text-muted-foreground mt-2 text-sm md:text-base">
              {isS1
                ? "Реакция на ошибку: логи → AI-агент → рекомендация → Telegram → инцидент"
                : "Превентивное обнаружение: аномалия до инцидента → AI-агент → Telegram → предупреждение"}
            </p>
          </div>
          <div className="flex gap-3 shrink-0">
            {isRunning && (
              <button
                onClick={reset}
                className="px-4 py-2 rounded-lg bg-surface-2 border border-border text-sm flex items-center gap-2 hover:bg-surface-2/70"
              >
                <RotateCcw className="w-4 h-4" /> Сбросить
              </button>
            )}
            <button
              onClick={runDemo}
              disabled={isRunning && stage !== "complete"}
              className="px-5 md:px-6 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold flex items-center gap-2 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Play className="w-4 h-4" />
              {stage === "complete" ? "Снова" : <><span className="hidden sm:inline">Запустить сценарий</span><span className="sm:hidden">Запустить</span></>}
            </button>
          </div>
        </div>

        {/* Scenario tabs */}
        <div className="mb-6 flex gap-3">
          <ScenarioTab
            active={scenario === 1}
            onClick={() => setScenario(1)}
            label="Сценарий 1"
            sub="Обработка ошибки"
            color="crit"
          />
          <ScenarioTab
            active={scenario === 2}
            onClick={() => setScenario(2)}
            label="Сценарий 2"
            sub="Превентивное обнаружение"
            color="warn"
          />
        </div>

        {/* Pipeline flow */}
        <div className="mb-6 rounded-xl border border-border bg-surface/50 p-4">
          <div className="flex items-center gap-2 flex-wrap">
            <PipelineNode
              icon={Server}
              label={isS1 ? "Логи сервиса" : "Метрики & тренды"}
              sublabel={isS1 ? "Поток событий" : "p95, DB, Memory"}
              active={stage === "receiving" || stage === "detected"}
              done={stageIdx > STAGE_ORDER.indexOf("detected")}
            />
            <Arrow />
            <PipelineNode
              icon={Cpu}
              label="Агент анализа"
              sublabel={isS1 ? "Поиск ошибок" : "Поиск аномалий"}
              active={stage === "connecting" || stage === "receiving"}
              done={stageIdx > STAGE_ORDER.indexOf("receiving")}
            />
            <Arrow />
            <PipelineNode
              icon={Bot}
              label="Евлампий AI"
              sublabel="Формирование rec."
              active={stage === "analyzing"}
              done={stageIdx > STAGE_ORDER.indexOf("analyzing")}
            />
            <Arrow />
            <PipelineNode
              icon={Send}
              label="Telegram-бот"
              sublabel="oncall-team"
              active={stage === "sending"}
              done={stage === "complete"}
            />
            <Arrow />
            <PipelineNode
              icon={isS1 ? AlertTriangle : Sparkles}
              label={isS1 ? "Инцидент" : "Аномалия"}
              sublabel={"#" + (newIncidentId ?? (isS1 ? "143" : "A08"))}
              active={stage === "complete"}
              done={false}
            />
          </div>
        </div>

        {/* Progress */}
        <div className="mb-6 rounded-xl border border-border bg-surface/40 p-3.5 overflow-x-auto">
          <div className="flex items-center gap-1 min-w-max sm:min-w-0">
            {steps.map((s, i) => {
              const done = stepDone(s.key);
              const active = stepActive(s.key);
              return (
                <div key={s.key} className="flex items-center gap-1 flex-1">
                  <div
                    className={`flex items-center gap-1.5 px-2 py-1 rounded-md flex-1 transition-all duration-500 ${
                      active ? "bg-primary/15 text-primary" : done ? "text-ok" : "text-muted-foreground"
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold mono shrink-0 ${
                        done ? "bg-ok/20 text-ok" : active ? "bg-primary/20 text-primary" : "bg-surface-2 text-muted-foreground"
                      }`}
                    >
                      {done ? "✓" : i + 1}
                    </div>
                    <span className="text-xs truncate">{s.label}</span>
                    {active && <span className="w-1.5 h-1.5 rounded-full bg-primary pulse-dot ml-auto shrink-0" />}
                  </div>
                  {i < steps.length - 1 && (
                    <div className={`w-3 h-px shrink-0 ${done ? "bg-ok/40" : "bg-border"}`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Main 2-column */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-6">
          {/* Left: Log stream */}
          <div className="space-y-4">
            {/* Agent status bar */}
            <div
              className={`rounded-xl border p-4 flex items-center gap-3 transition-all duration-500 ${
                stage === "connecting" ? "border-accent/40 bg-accent/5" :
                stage !== "idle" ? "border-ok/30 bg-ok/5" :
                "border-border bg-surface/50"
              }`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                stage === "connecting" ? "bg-accent/20" : stage !== "idle" ? "bg-ok/15" : "bg-surface-2"
              }`}>
                <Activity className={`w-4 h-4 ${stage === "connecting" ? "text-accent" : stage !== "idle" ? "text-ok" : "text-muted-foreground"}`} />
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium">
                  {stage === "idle" && "Агент ожидает запуска"}
                  {stage === "connecting" && "Запуск агента анализа..."}
                  {(stage === "receiving" || stage === "detected") && (isS1 ? "Агент получает поток логов..." : "Агент анализирует метрики...")}
                  {(stage === "analyzing" || stage === "ready" || stage === "sending" || stage === "complete") && "Агент завершил анализ ✓"}
                </div>
                <div className="text-xs text-muted-foreground mono mt-0.5">
                  {stage === "idle" && (isS1 ? "order-service · log stream" : "checkout-service · metrics")}
                  {stage === "connecting" && "инициализация сценария..."}
                  {(stage === "receiving" || stage === "detected") && (isS1 ? "order-service · synthetic log batch" : "checkout-service · trend analysis")}
                  {stage !== "idle" && stage !== "connecting" && stage !== "receiving" && stage !== "detected" && "Яндекс GPT · анализ завершён"}
                </div>
              </div>
              {stage === "connecting" && (
                <div className="flex gap-1">
                  {[0, 150, 300].map((d) => (
                    <span key={d} className="w-1.5 h-1.5 rounded-full bg-accent animate-bounce" style={{ animationDelay: `${d}ms` }} />
                  ))}
                </div>
              )}
              {stage !== "idle" && stage !== "connecting" && <CheckCircle2 className="w-4 h-4 text-ok shrink-0" />}
            </div>

            {/* Log viewer */}
            <div className="rounded-xl border border-border bg-surface/50 overflow-hidden">
              <div className="px-5 py-3.5 border-b border-border flex items-center gap-3">
                <h2 className="font-display font-semibold text-sm">
                  {isS1 ? "Поток логов" : "Метрики и тренды"}
                </h2>
                <span className="text-xs text-muted-foreground mono">
                  {isS1 ? "order-service" : "checkout-service"}
                </span>
                {visibleLogs.length > 0 && (
                  <span className="ml-auto text-xs mono text-muted-foreground">
                    {visibleLogs.length} строк
                  </span>
                )}
              </div>

              <div className="font-mono text-[12.5px] leading-relaxed min-h-[240px]">
                {visibleLogs.length === 0 ? (
                  <div className="px-5 py-10 text-center text-muted-foreground text-sm">
                    {stage === "idle" && "Нажмите «Запустить сценарий», чтобы начать..."}
                    {stage === "connecting" && (
                      <div className="flex items-center justify-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-accent pulse-dot" />
                        Ожидание данных от агента...
                      </div>
                    )}
                  </div>
                ) : (
                  visibleLogs.map((log, i) => (
                    <div
                      key={i}
                      className={`flex items-start gap-3 px-5 py-1.5 border-l-2 log-line-appear ${
                        log.level === "ERROR" ? "bg-crit/5 border-crit/40" :
                        log.level === "WARN" ? "bg-warn/5 border-warn/40" :
                        "border-transparent"
                      }`}
                    >
                      <span className="text-muted-foreground shrink-0 w-16">{log.timestamp}</span>
                      <span className={`shrink-0 px-1.5 py-0.5 rounded text-[10px] font-bold w-12 text-center ${
                        log.level === "ERROR" ? "text-crit bg-crit/15" :
                        log.level === "WARN" ? "text-warn bg-warn/15" :
                        "text-info bg-info/15"
                      }`}>
                        {log.level}
                      </span>
                      <span className={log.level !== "INFO" ? "text-foreground" : "text-muted-foreground"}>
                        {log.msg}
                      </span>
                    </div>
                  ))
                )}
                {stage === "receiving" && (
                  <div className="px-5 py-2">
                    <span className="inline-block w-[2px] h-4 bg-muted-foreground/40 animate-pulse" />
                  </div>
                )}
              </div>

              {/* Detection banner */}
              {(stage === "detected" || stage === "analyzing" || stage === "ready" || stage === "sending" || stage === "complete") && (
                <div className={`border-t px-5 py-3 flex items-center gap-3 ${
                  isS1 ? "border-crit/20 bg-crit/5" : "border-warn/20 bg-warn/5"
                }`}>
                  <AlertTriangle className={`w-4 h-4 shrink-0 ${isS1 ? "text-crit" : "text-warn"}`} />
                  <span className={`text-sm font-medium ${isS1 ? "text-crit" : "text-warn"}`}>
                    {isS1
                      ? "Обнаружено 3 ошибки уровня ERROR · Передаю агенту"
                      : "Аномальный паттерн в 3 метриках · Нет ошибок, но деградация нарастает"}
                  </span>
                </div>
              )}
            </div>

            {/* Scenario explanation (idle only) */}
            {stage === "idle" && (
              <div className="rounded-xl border border-border bg-surface/50 p-5 space-y-3">
                <div className="text-xs mono uppercase tracking-wider text-muted-foreground">
                  Что произойдёт при запуске
                </div>
                <div className="space-y-2.5 text-sm text-muted-foreground">
                  {(isS1 ? [
                    "Агент получит поток логов order-service",
                    "Яндекс GPT обнаружит ошибки уровня ERROR",
                    "Сформирует рекомендацию по устранению",
                    "Telegram-бот отправит уведомление on-call команде",
                    "В системе создастся инцидент #143",
                  ] : [
                    "Агент проанализирует метрики checkout-service",
                    "Яндекс GPT обнаружит аномальный паттерн без ошибок",
                    "Оценит вероятность инцидента через 60–90 минут",
                    "Telegram-бот отправит превентивное предупреждение",
                    "Зафиксируется аномалия A08 до наступления инцидента",
                  ]).map((s) => (
                    <div key={s} className="flex items-start gap-2">
                      <span className="w-1 h-1 rounded-full bg-muted-foreground/50 mt-2 shrink-0" />
                      {s}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right: AI + Telegram */}
          <div className="space-y-4">
            {/* Agent card */}
            <div className={`rounded-xl border p-5 transition-all duration-500 ${
              stage === "analyzing" ? "border-accent/50 bg-accent/5 glow-ok" :
              (stage === "ready" || stage === "sending" || stage === "complete") ? "border-accent/30 bg-accent/5" :
              "border-border bg-surface/50"
            }`}>
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                  stage === "analyzing" || stage === "ready" || stage === "sending" || stage === "complete"
                    ? "bg-accent/20" : "bg-surface-2"
                }`}>
                  <Bot className={`w-4 h-4 ${
                    stage === "analyzing" || stage === "ready" || stage === "sending" || stage === "complete"
                      ? "text-accent" : "text-muted-foreground"
                  }`} />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium">Евлампий AI</div>
                  <div className="text-xs text-muted-foreground mono">
                    {stage === "idle" || stage === "connecting" || stage === "receiving" ? "ожидание данных" :
                     stage === "detected" ? "получены данные · начинаю анализ..." :
                     stage === "analyzing" ? "анализирует..." :
                     "анализ завершён ✓"}
                  </div>
                </div>
                {stage === "analyzing" && (
                  <div className="flex gap-1">
                    {[0, 150, 300].map((d) => (
                      <span key={d} className="w-1.5 h-1.5 rounded-full bg-accent animate-bounce" style={{ animationDelay: `${d}ms` }} />
                    ))}
                  </div>
                )}
                {(stage === "ready" || stage === "sending" || stage === "complete") && (
                  <Sparkles className="w-4 h-4 text-accent shrink-0" />
                )}
              </div>

              {stage === "analyzing" && (
                <div className="space-y-1.5">
                  {(isS1 ? [
                    "Классификация уровня критичности...",
                    "Анализ паттернов ошибок...",
                    "Поиск корневой причины...",
                    "Формирование рекомендации...",
                  ] : [
                    "Анализ трендов метрик...",
                    "Корреляция сигналов деградации...",
                    "Оценка вероятности инцидента...",
                    "Формирование рекомендации...",
                  ]).map((step, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="w-1 h-1 rounded-full bg-accent/60 animate-pulse shrink-0" style={{ animationDelay: `${i * 250}ms` }} />
                      {step}
                    </div>
                  ))}
                </div>
              )}

              {(stage === "ready" || stage === "sending" || stage === "complete") && (
                <div className="text-sm leading-relaxed text-foreground/90 whitespace-pre-line mt-1">
                  {typedRec}
                  {typedRec.length < recommendation.length && (
                    <span className="inline-block w-[2px] h-4 bg-accent animate-pulse align-middle ml-0.5" />
                  )}
                </div>
              )}

              {(stage === "idle" || stage === "connecting" || stage === "receiving" || stage === "detected") && (
                <div className="h-10 flex items-center">
                  <span className="text-xs text-muted-foreground">
                    {stage === "detected" ? "Передача данных агенту..." : "—"}
                  </span>
                </div>
              )}
            </div>

            {/* Telegram notification preview */}
            {(stage === "sending" || stage === "complete") && (
              <div className="rounded-xl border border-accent/30 bg-[oklch(0.14_0.012_250)] overflow-hidden log-line-appear">
                <div className="bg-[oklch(0.22_0.02_240)] px-4 py-2.5 flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                    <Send className="w-3.5 h-3.5 text-primary-foreground" />
                  </div>
                  <div className="flex-1">
                    <div className="text-xs font-semibold">MonitoringAI Bot</div>
                    <div className="text-[10px] text-muted-foreground">
                      {stage === "sending" ? "отправляет уведомление..." : "уведомление отправлено ✓"}
                    </div>
                  </div>
                  {stage === "sending" && (
                    <div className="flex gap-1">
                      {[0, 150, 300].map((d) => (
                        <span key={d} className="w-1.5 h-1.5 rounded-full bg-ok animate-bounce" style={{ animationDelay: `${d}ms` }} />
                      ))}
                    </div>
                  )}
                  {stage === "complete" && <CheckCircle2 className="w-4 h-4 text-ok shrink-0" />}
                </div>
                <div className="p-4 text-sm space-y-2">
                  <div className="flex items-center gap-2">
                    <span className={`w-1.5 h-1.5 rounded-full pulse-dot ${isS1 ? "bg-crit" : "bg-warn"}`} />
                    <span className={`font-bold mono text-xs tracking-wider ${isS1 ? "text-crit" : "text-warn"}`}>
                      {isS1 ? "P1 · ОШИБКА БД" : "P2 · АНОМАЛИЯ"}
                    </span>
                    <span className="mono text-xs text-muted-foreground ml-auto">
                      {isS1 ? "order-service" : "checkout-service"}
                    </span>
                  </div>
                  <div className="text-foreground/80">
                    {isS1
                      ? <><span className="font-medium">DB connection pool exhausted</span> — 3 ошибки за 9 сек</>
                      : <><span className="font-medium">Деградация без ошибок</span> — p95 ×3, DB ×20</>}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {isS1
                      ? "Яндекс GPT: DB_POOL_SIZE=20, circuit-breaker"
                      : "Яндекс GPT: действуйте за 60–90 мин до инцидента"}
                  </div>
                </div>
              </div>
            )}

            {/* Complete */}
            {stage === "complete" && (
              <div className="rounded-xl border border-ok/30 bg-ok/5 p-5 space-y-3 log-line-appear">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-ok" />
                  <span className="font-semibold">
                    {isS1 ? `Инцидент #${newIncidentId} создан!` : `Аномалия #${newIncidentId} зафиксирована!`}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {isS1
                    ? "Уведомление отправлено. Инцидент зарегистрирован в системе."
                    : "Предупреждение отправлено до наступления инцидента. Аномалия под наблюдением."}
                </p>
                <div className="flex gap-2">
                  <Link to="/" className="flex-1 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-medium text-center hover:opacity-90 flex items-center justify-center gap-1.5">
                    Дашборд <ArrowRight className="w-3 h-3" />
                  </Link>
                  <Link to="/telegram" className="flex-1 py-2 rounded-lg bg-surface-2 border border-border text-xs text-center hover:bg-surface-2/70 flex items-center justify-center gap-1.5">
                    <Send className="w-3 h-3" /> Telegram
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function ScenarioTab({
  active, onClick, label, sub, color,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  sub: string;
  color: "crit" | "warn";
}) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 sm:flex-none px-5 py-3 rounded-xl border text-left transition-all duration-200 ${
        active
          ? color === "crit"
            ? "border-crit/30 bg-crit/5 text-foreground"
            : "border-warn/30 bg-warn/5 text-foreground"
          : "border-border bg-surface/50 text-muted-foreground hover:text-foreground hover:bg-surface-2/50"
      }`}
    >
      <div className="flex items-center gap-2">
        <span className={`w-2 h-2 rounded-full ${active ? (color === "crit" ? "bg-crit pulse-dot" : "bg-warn pulse-dot") : "bg-muted-foreground/30"}`} />
        <span className="font-semibold text-sm">{label}</span>
      </div>
      <div className="text-xs text-muted-foreground mt-1 ml-4">{sub}</div>
    </button>
  );
}

function Arrow() {
  return <div className="text-muted-foreground text-sm shrink-0">→</div>;
}

function PipelineNode({
  icon: Icon, label, sublabel, active, done,
}: {
  icon: typeof Server;
  label: string;
  sublabel: string;
  active: boolean;
  done: boolean;
}) {
  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all duration-500 ${
      active ? "border-accent/50 bg-accent/8 text-foreground" :
      done ? "border-ok/30 bg-ok/5 text-ok" :
      "border-border bg-surface/50 text-muted-foreground"
    }`}>
      <Icon className={`w-3.5 h-3.5 shrink-0 ${active ? "text-accent" : done ? "text-ok" : ""}`} />
      <div>
        <div className="text-xs font-medium">{label}</div>
        <div className="text-[10px] mono opacity-70">{sublabel}</div>
      </div>
      {active && <span className="w-1.5 h-1.5 rounded-full bg-accent pulse-dot ml-1 shrink-0" />}
      {done && <CheckCircle2 className="w-3.5 h-3.5 text-ok ml-1 shrink-0" />}
    </div>
  );
}
