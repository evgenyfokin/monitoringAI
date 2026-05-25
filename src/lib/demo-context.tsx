import { createContext, useContext, useState, useCallback, useRef, useEffect, type ReactNode } from "react";

export type DemoStage =
  | "idle"
  | "connecting"
  | "receiving"
  | "detected"
  | "analyzing"
  | "ready"
  | "sending"
  | "complete";

export interface LogLine {
  timestamp: string;
  level: "INFO" | "WARN" | "ERROR";
  service: string;
  msg: string;
  isKey?: boolean;
}

export interface DemoContextValue {
  stage: DemoStage;
  visibleLogs: LogLine[];
  recommendation: string;
  service: string;
  newIncidentId: string | null;
  // scenario management
  scenario: 1 | 2;
  setScenario: (n: 1 | 2) => void;
  completedScenario: 1 | 2 | null;
  // telegram toast popup
  showToast: boolean;
  dismissToast: () => void;
  // telegram page actions
  telegramAction: "confirmed" | "false-alarm" | null;
  setTelegramAction: (a: "confirmed" | "false-alarm" | null) => void;
  runDemo: () => void;
  reset: () => void;
}

// ─── Scenario 1: Error response ──────────────────────────────────────────────

const S1_LOGS: LogLine[] = [
  { timestamp: "15:47:01", level: "INFO", service: "order-service", msg: "GET /api/orders → 200 (124ms)" },
  { timestamp: "15:47:03", level: "INFO", service: "order-service", msg: "GET /api/orders → 200 (131ms)" },
  { timestamp: "15:47:05", level: "WARN", service: "order-service", msg: "DB response time 512ms (threshold: 400ms)", isKey: true },
  { timestamp: "15:47:07", level: "ERROR", service: "order-service", msg: "db.pool: connection_acquire_failed pool=8/8 wait=30s", isKey: true },
  { timestamp: "15:47:08", level: "ERROR", service: "order-service", msg: "POST /api/orders → 500 Internal Server Error", isKey: true },
  { timestamp: "15:47:09", level: "ERROR", service: "order-service", msg: "POST /api/orders → 500 Internal Server Error" },
  { timestamp: "15:47:10", level: "ERROR", service: "order-service", msg: "POST /api/orders → 500 Internal Server Error" },
];

const S1_REC =
  `Вероятная причина: исчерпан пул соединений с базой данных.

После роста нагрузки на order-service очередь запросов переполнила пул (pool=8/8). Все новые запросы к БД зависают до таймаута 30s, вызывая каскадные 500-ошибки.

Рекомендуемые действия:
1. Временно: DB_POOL_SIZE=20 и перезапуск сервиса
2. Долгосрочно: добавить circuit-breaker для /api/orders
3. Проверить медленные запросы — возможно, удерживают соединения`;

// ─── Scenario 2: Preventive anomaly ──────────────────────────────────────────

const S2_LOGS: LogLine[] = [
  { timestamp: "16:12:04", level: "INFO", service: "checkout-service", msg: "GET /api/checkout → 200 (142ms)" },
  { timestamp: "16:12:19", level: "INFO", service: "checkout-service", msg: "GET /api/checkout → 200 (189ms)" },
  { timestamp: "16:12:34", level: "WARN", service: "checkout-service", msg: "p95 latency: 340ms — trending up (baseline: 180ms)", isKey: true },
  { timestamp: "16:12:41", level: "WARN", service: "checkout-service", msg: "Memory usage 78% — rising (was 61% за 30 мин)", isKey: true },
  { timestamp: "16:12:55", level: "WARN", service: "checkout-service", msg: "DB avg query: 890ms (обычно: 45ms) — подозрение на full scan", isKey: true },
  { timestamp: "16:13:02", level: "WARN", service: "checkout-service", msg: "p95 пересёк порог 500ms — circuit-breaker активируется" },
  { timestamp: "16:13:08", level: "INFO", service: "checkout-service", msg: "Ошибок нет — сервис отвечает, деградирует" },
];

const S2_REC =
  `Превентивное обнаружение: критических ошибок нет, но паттерн соответствует стадии перед pool exhaustion.

По историческим данным: такое сочетание p95↑ + DB avg↑ предшествовало инциденту за 60–90 минут.

Рекомендуется действовать сейчас:
1. Проверить медленные запросы: EXPLAIN ANALYZE на таблице orders
2. Временно: DB_POOL_SIZE=8 → 16, перезапустить checkout-service
3. Включить алерт на p95 > 300ms`;

// ─── Context ──────────────────────────────────────────────────────────────────

const DemoContext = createContext<DemoContextValue | null>(null);

export function DemoProvider({ children }: { children: ReactNode }) {
  const [stage, setStage] = useState<DemoStage>("idle");
  const [visibleLogs, setVisibleLogs] = useState<LogLine[]>([]);
  const [recommendation, setRecommendation] = useState("");
  const [service, setService] = useState("order-service");
  const [newIncidentId, setNewIncidentId] = useState<string | null>(null);
  const [scenario, setScenarioState] = useState<1 | 2>(1);
  const [completedScenario, setCompletedScenario] = useState<1 | 2 | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [telegramAction, setTelegramAction] = useState<"confirmed" | "false-alarm" | null>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const reset = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    setStage("idle");
    setVisibleLogs([]);
    setRecommendation("");
    setNewIncidentId(null);
    setTelegramAction(null);
    setShowToast(false);
  }, []);

  const setScenario = useCallback(
    (n: 1 | 2) => {
      reset();
      setScenarioState(n);
    },
    [reset],
  );

  const dismissToast = useCallback(() => setShowToast(false), []);

  const runDemo = useCallback(() => {
    reset();

    const logs = scenario === 1 ? S1_LOGS : S2_LOGS;
    const rec = scenario === 1 ? S1_REC : S2_REC;
    const svc = scenario === 1 ? "order-service" : "checkout-service";
    const incidentId = scenario === 1 ? "143" : "A08";
    setService(svc);

    const t = (delay: number, fn: () => void) => {
      const id = setTimeout(fn, delay);
      timers.current.push(id);
    };

    setStage("connecting");

    t(1000, () => setStage("receiving"));

    logs.forEach((log, i) => {
      t(1000 + (i + 1) * 600, () => {
        setVisibleLogs((prev) => [...prev, log]);
      });
    });

    const afterLogs = 1000 + logs.length * 600;
    t(afterLogs + 400, () => setStage("detected"));
    t(afterLogs + 1600, () => setStage("analyzing"));
    t(afterLogs + 4600, () => {
      setStage("ready");
      setRecommendation(rec);
    });
    t(afterLogs + 7000, () => setStage("sending"));
    t(afterLogs + 9000, () => {
      setStage("complete");
      setNewIncidentId(incidentId);
      setCompletedScenario(scenario);
      setShowToast(true);
    });
  }, [reset, scenario]);

  // Poll for external webhook trigger (works in Vite dev mode)
  useEffect(() => {
    if (stage !== "idle") return;

    const poll = setInterval(async () => {
      try {
        const res = await fetch("/api/demo");
        if (!res.ok) return;
        const data = (await res.json()) as { event: unknown | null };
        if (data.event) runDemo();
      } catch {
        // silently ignore — endpoint only available in dev
      }
    }, 1500);

    return () => clearInterval(poll);
  }, [stage, runDemo]);

  return (
    <DemoContext.Provider
      value={{
        stage,
        visibleLogs,
        recommendation,
        service,
        newIncidentId,
        scenario,
        setScenario,
        completedScenario,
        showToast,
        dismissToast,
        telegramAction,
        setTelegramAction,
        runDemo,
        reset,
      }}
    >
      {children}
    </DemoContext.Provider>
  );
}

export function useDemo() {
  const ctx = useContext(DemoContext);
  if (!ctx) throw new Error("useDemo must be used within DemoProvider");
  return ctx;
}
