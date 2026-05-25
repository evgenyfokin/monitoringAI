import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Send, Check, X, ArrowRight, Sparkles, AlertTriangle } from "lucide-react";
import { useDemo } from "@/lib/demo-context";

export const Route = createFileRoute("/telegram")({
  head: () => ({
    meta: [
      { title: "Telegram-уведомление — MonitoringAI" },
      { name: "description", content: "Пример уведомления об инциденте в Telegram." },
    ],
  }),
  component: TelegramMock,
});

function TelegramMock() {
  const { completedScenario, telegramAction, setTelegramAction, service, newIncidentId } = useDemo();
  const hasDemo = completedScenario !== null;
  const isS1 = completedScenario === 1;

  // Notification content based on scenario
  const notif = hasDemo
    ? {
        time: new Date().toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" }),
        priority: isS1 ? "P1 · КРИТИЧНО" : "P2 · АНОМАЛИЯ",
        priorityCls: isS1 ? "text-crit" : "text-warn",
        dotCls: isS1 ? "bg-crit" : "bg-warn",
        service: service,
        what: isS1 ? "Рост ошибок 500 — ×3 за 2 минуты" : "Деградация без ошибок — p95 ×3 за 20 мин",
        affected: isS1 ? "~8% запросов /api/orders" : "checkout-service · нет ошибок, но p95=500ms",
        reason: isS1
          ? "DB pool exhausted — connection_acquire_failed"
          : "Паттерн перед инцидентом (по историческим данным)",
        steps: isS1
          ? [
              "DB_POOL_SIZE=20 → перезапуск order-service",
              "EXPLAIN ANALYZE на медленных запросах",
              "Эскалация → @database-team если не помогло",
            ]
          : [
              "EXPLAIN ANALYZE на таблице orders",
              "DB_POOL_SIZE=8 → 16, перезапустить сервис",
              "Включить алерт на p95 > 300ms",
            ],
        incidentId: newIncidentId ?? (isS1 ? "143" : "A08"),
      }
    : {
        time: "14:32",
        priority: "P0 · КРИТИЧНО",
        priorityCls: "text-crit",
        dotCls: "bg-crit",
        service: "payment-service",
        what: "Рост ошибок 500 — ×8 за 2 минуты",
        affected: "~12% пользователей checkout",
        reason: "Деплой v2.3.1 (15 мин назад)",
        steps: [
          "Откатить деплой v2.3.1 → v2.3.0",
          "Проверить логи payment-worker",
          "Эскалация → @database-team",
        ],
        incidentId: "142",
      };

  return (
    <AppShell>
      <div className="p-8 max-w-[1400px]">
        <div className="mb-6">
          <div className="text-xs mono uppercase tracking-widest text-muted-foreground mb-2">/ telegram</div>
          <h1 className="text-4xl font-bold">Уведомление в месенджере</h1>
          <p className="text-muted-foreground mt-2 max-w-2xl">
            {hasDemo
              ? `Показано последнее уведомление — Сценарий ${completedScenario}: ${isS1 ? "обработка ошибки" : "превентивное обнаружение"}`
              : "Инженер получает уведомление с готовой гипотезой и чек-листом действий."}
          </p>
        </div>

        <div className="grid grid-cols-[420px_1fr] gap-8">
          {/* Phone mockup */}
          <div className="rounded-[40px] border-4 border-border-strong bg-[oklch(0.12_0.01_250)] p-2 shadow-2xl">
            <div className="rounded-[32px] overflow-hidden bg-[oklch(0.14_0.012_250)]">
              {/* Telegram header */}
              <div className="bg-[oklch(0.22_0.02_240)] px-4 py-3 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[oklch(0.55_0.18_235)] to-[oklch(0.45_0.20_250)] flex items-center justify-center">
                  <Send className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-sm">MonitoringAI</div>
                  <div className="text-[10px] text-muted-foreground">бот · сейчас online</div>
                </div>
              </div>

              {/* Messages */}
              <div className="p-4 space-y-3 min-h-[560px]">
                <div className="text-center text-[10px] text-muted-foreground py-2">
                  сегодня · {notif.time}
                </div>

                {/* Main notification message */}
                <div className="bg-[oklch(0.22_0.02_240)] rounded-2xl rounded-tl-sm p-4 max-w-[92%] text-sm space-y-3">
                  <div className="flex items-center gap-2 pb-2 border-b border-white/5">
                    <span className={`w-2 h-2 rounded-full ${notif.dotCls} pulse-dot`} />
                    <span className={`font-bold ${notif.priorityCls} mono text-xs tracking-wider`}>
                      {notif.priority}
                    </span>
                    <span className="mono text-xs text-muted-foreground ml-auto">{notif.service}</span>
                  </div>

                  <div>
                    <div className="text-[10px] mono uppercase text-muted-foreground mb-1">Что произошло</div>
                    <div>{notif.what}</div>
                  </div>

                  <div>
                    <div className="text-[10px] mono uppercase text-muted-foreground mb-1">Затронуто</div>
                    <div className="text-foreground/80">{notif.affected}</div>
                  </div>

                  <div>
                    <div className="text-[10px] mono uppercase text-muted-foreground mb-1">
                      {completedScenario === 2 ? "Прогноз" : "Вероятная причина"}
                    </div>
                    <div>{notif.reason}</div>
                  </div>

                  <div>
                    <div className="text-[10px] mono uppercase text-muted-foreground mb-1">Что проверить</div>
                    <ol className="space-y-1.5 text-[13px]">
                      {notif.steps.map((step, i) => (
                        <li key={i} className="flex gap-2">
                          <span className="mono text-muted-foreground">{i + 1}.</span>
                          {step}
                        </li>
                      ))}
                    </ol>
                  </div>

                  {/* Action buttons — disabled if action already taken */}
                  <div className="pt-2 space-y-1.5">
                    <button
                      disabled={telegramAction !== null}
                      className="block w-full text-center py-2.5 rounded-lg font-medium text-sm hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
                      style={{ background: "oklch(0.55_0.18_235)", color: "white" }}
                    >
                      Открыть в MonitoringAI →
                    </button>
                    <div className="grid grid-cols-2 gap-1.5">
                      <button
                        onClick={() => setTelegramAction("confirmed")}
                        disabled={telegramAction !== null}
                        className={`py-2 rounded-lg text-xs flex items-center justify-center gap-1.5 transition-all ${
                          telegramAction === "confirmed"
                            ? "bg-ok/20 text-ok border border-ok/30"
                            : "bg-white/5 hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed"
                        }`}
                      >
                        <Check className="w-3 h-3 text-ok" /> Подтвердить
                      </button>
                      <button
                        onClick={() => setTelegramAction("false-alarm")}
                        disabled={telegramAction !== null}
                        className={`py-2 rounded-lg text-xs flex items-center justify-center gap-1.5 transition-all ${
                          telegramAction === "false-alarm"
                            ? "bg-surface-2 border border-border"
                            : "bg-white/5 hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed"
                        }`}
                      >
                        <X className="w-3 h-3 text-muted-foreground" /> Ложная тревога
                      </button>
                    </div>
                  </div>

                  <div className="text-[10px] text-muted-foreground text-right mono">{notif.time}</div>
                </div>

                {/* Bot response to "Подтвердить" */}
                {telegramAction === "confirmed" && (
                  <div className="bg-[oklch(0.22_0.02_240)] rounded-2xl rounded-tl-sm p-3.5 max-w-[92%] text-sm log-line-appear">
                    <div className="flex items-center gap-1.5 mb-2">
                      <Sparkles className="w-3.5 h-3.5 text-ok" />
                      <span className="text-[10px] mono uppercase text-ok tracking-wider">Принято</span>
                    </div>
                    <div className="text-foreground/90">
                      ✓ {hasDemo && !isS1 ? `Аномалия #${notif.incidentId}` : `Инцидент #${notif.incidentId}`} подтверждён.
                      Назначаю on-call инженера.
                    </div>
                    <div className="text-xs text-muted-foreground mt-1.5">
                      {hasDemo && !isS1
                        ? "Статус: под наблюдением · превентивное реагирование"
                        : "Статус: в работе · таймер MTTR запущен"}
                    </div>
                    <div className="text-[10px] text-muted-foreground text-right mono mt-2">сейчас</div>
                  </div>
                )}

                {/* Bot response to "Ложная тревога" */}
                {telegramAction === "false-alarm" && (
                  <div className="bg-[oklch(0.22_0.02_240)] rounded-2xl rounded-tl-sm p-3.5 max-w-[92%] text-sm log-line-appear">
                    <div className="flex items-center gap-1.5 mb-2">
                      <AlertTriangle className="w-3.5 h-3.5 text-warn" />
                      <span className="text-[10px] mono uppercase text-warn tracking-wider">Отмечено</span>
                    </div>
                    <div className="text-foreground/90">
                      Понял. Обновляю классификатор — похожие паттерны от {notif.service} буду учитывать.
                    </div>
                    <div className="text-xs text-muted-foreground mt-1.5">
                      Спасибо за фидбек. Это помогает снизить false positive rate.
                    </div>
                    <div className="text-[10px] text-muted-foreground text-right mono mt-2">сейчас</div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Annotations */}
          <div className="space-y-4 pt-8">
            {telegramAction === null ? (
              <>
                <Annotation
                  icon={<Sparkles className="w-4 h-4 text-accent" />}
                  title={hasDemo && !isS1 ? "Превентивная гипотеза" : "Краткая трактовка"}
                  body={hasDemo && !isS1
                    ? "Агент обнаружил деградацию по корреляции метрик, до появления ошибок. Инженер получает предупреждение за 60–90 мин."
                    : "AI сразу выдаёт гипотезу: что произошло, кого затронуло и почему. Не нужно читать тысячи строк логов вручную."}
                />
                <Annotation
                  icon={<ArrowRight className="w-4 h-4 text-accent" />}
                  title="Чек-лист действий"
                  body="Конкретные шаги в порядке вероятности успеха. Первый пункт обычно решает 80% случаев."
                />
                <Annotation
                  icon={<Check className="w-4 h-4 text-ok" />}
                  title="Обратная связь"
                  body={`«Подтвердить» переводит ${hasDemo && !isS1 ? "аномалию" : "инцидент"} в работу. «Ложная тревога» обучает классификатор не присылать такое в следующий раз.`}
                />
                <div className="mt-2 p-4 rounded-xl border border-border bg-surface/50 text-sm text-muted-foreground">
                  Нажмите <span className="text-ok font-medium">«Подтвердить»</span> или <span className="text-muted-foreground font-medium">«Ложная тревога»</span> в уведомлении, чтобы увидеть ответ бота.
                </div>
              </>
            ) : telegramAction === "confirmed" ? (
              <>
                <div className="rounded-xl border border-ok/30 bg-ok/5 p-5 log-line-appear">
                  <div className="flex items-center gap-2 mb-2">
                    <Check className="w-5 h-5 text-ok" />
                    <span className="font-semibold">{hasDemo && !isS1 ? "Аномалия" : "Инцидент"} принят в работу</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {hasDemo && !isS1
                      ? "Аномалия зарегистрирована. Команда получила уведомление о превентивном реагировании."
                      : "On-call инженер назначен. Таймер MTTR запущен. Статус инцидента обновлён в системе."}
                  </p>
                </div>
                <Annotation
                  icon={<Sparkles className="w-4 h-4 text-accent" />}
                  title="Что происходит дальше"
                  body={hasDemo && !isS1
                    ? "Агент будет отслеживать метрики каждые 5 мин. Если деградация усилится — автоматически повысит приоритет до P1."
                    : "Агент мониторит статус и напомнит через 15 мин, если нет прогресса. Автоматически закроет инцидент после стабилизации."}
                />
              </>
            ) : (
              <>
                <div className="rounded-xl border border-border bg-surface/50 p-5 log-line-appear">
                  <div className="flex items-center gap-2 mb-2">
                    <X className="w-5 h-5 text-muted-foreground" />
                    <span className="font-semibold">Ложная тревога отмечена</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Классификатор обновлён. Паттерн от {notif.service} добавлен в список исключений для снижения шума.
                  </p>
                </div>
                <Annotation
                  icon={<AlertTriangle className="w-4 h-4 text-warn" />}
                  title="Обучение на обратной связи"
                  body="Каждая пометка «ложная тревога» уточняет модель. После 3–5 примеров AI перестаёт присылать аналогичные события."
                />
              </>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function Annotation({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return (
    <div className="border-l-2 border-accent pl-4 py-1">
      <div className="flex items-center gap-1.5 text-xs mono uppercase tracking-wider text-accent mb-1">
        {icon}
        {title}
      </div>
      <div className="text-sm text-muted-foreground">{body}</div>
    </div>
  );
}
