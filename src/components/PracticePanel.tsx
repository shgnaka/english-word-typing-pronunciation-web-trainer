import { useEffect, useState, type MouseEvent } from "react";
import { generateReadingHint } from "../domain/reading";
import { keyboardRows } from "../domain/keyboard";
import { formatMessage, getFingerLabel, t } from "../i18n";
import type { TrainerState } from "../features/trainer/useTrainer";
import { FingerGuideButtons } from "./FingerGuideButtons";

interface PracticePanelProps {
  trainer: TrainerState;
}

type PracticeStatusTone = "neutral" | "warning" | "error" | "success";

function useCompactPracticeGuides() {
  const [isCompact, setIsCompact] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
      return;
    }

    const mediaQuery = window.matchMedia("(max-width: 720px)");
    const update = (matches: boolean) => setIsCompact(matches);

    update(mediaQuery.matches);

    const listener = (event: MediaQueryListEvent) => update(event.matches);
    if (typeof mediaQuery.addEventListener === "function") {
      mediaQuery.addEventListener("change", listener);
      return () => mediaQuery.removeEventListener("change", listener);
    }

    mediaQuery.addListener(listener);
    return () => mediaQuery.removeListener(listener);
  }, []);

  return isCompact;
}

function PracticePrimaryStatus({
  title,
  detail,
  tone,
  action
}: {
  title: string;
  detail?: string;
  tone: PracticeStatusTone;
  action?: { label: string; onClick: (event: MouseEvent<HTMLButtonElement>) => void; testId: string };
}) {
  return (
    <div className={`practice-primary-status practice-primary-status-${tone}`} data-testid="practice-primary-status" role="status" aria-live="polite">
      <div className="practice-primary-status-copy">
        <strong data-testid="practice-primary-status-title">{title}</strong>
        {detail ? <p data-testid="practice-primary-status-detail">{detail}</p> : null}
      </div>
      {action ? (
        <button className="secondary inline-action" data-testid={action.testId} onClick={action.onClick}>
          {action.label}
        </button>
      ) : null}
    </div>
  );
}

function PracticeGuideToggle({
  ariaLabel,
  expanded,
  onToggle,
  testId
}: {
  ariaLabel: string;
  expanded: boolean;
  onToggle: () => void;
  testId: string;
}) {
  return (
    <button
      type="button"
      className="secondary practice-guide-toggle icon-only"
      data-testid={testId}
      aria-expanded={expanded}
      aria-label={ariaLabel}
      onClick={onToggle}
    >
      <span aria-hidden="true">{expanded ? "−" : "+"}</span>
      <span className="sr-only">{ariaLabel}</span>
    </button>
  );
}

function PracticeMetricsBar({ trainer, language }: PracticePanelProps & { language: TrainerState["displayLanguage"] }) {
  return (
    <div className={`practice-metrics-bar ${trainer.isTypingActiveLayout ? "typing-active" : ""}`} data-testid="practice-metrics-bar">
      <article className="metric compact-metric">
        <span className="label">{t(language, "practice.progress")}</span>
        <strong data-testid="progress-count">
          {trainer.completedWordsCount} / {trainer.totalWords || 0} words
        </strong>
      </article>
      <article className="metric compact-metric">
        <span className="label">{t(language, "practice.remaining")}</span>
        <strong data-testid="remaining-words">{trainer.remainingWords}</strong>
      </article>
      <article className="metric compact-metric progress-metric" data-testid="progress-block">
        <div className="progress-copy">
          <span className="label">{t(language, "practice.sessionProgress")}</span>
          <strong data-testid="progress-percent">{trainer.progressPercent}%</strong>
        </div>
        <div className="progress-track" aria-hidden="true">
          <div className="progress-fill" data-testid="progress-fill" style={{ width: `${trainer.progressPercent}%` }} />
        </div>
      </article>
    </div>
  );
}

function PracticeWordStage({
  currentWord,
  hasMistype,
  readingHint,
  targetSummary,
  showWordReading,
  trainer
}: {
  currentWord: string;
  hasMistype: boolean;
  readingHint: string | null;
  targetSummary: string;
  showWordReading: boolean;
  trainer: TrainerState;
}) {
  return (
    <div className={`practice-word-stage ${trainer.isTypingActiveLayout ? "typing-active" : ""}`} data-testid="practice-word-stage">
      <div className="panel-header practice-header">
        <div>
          <p className={`label ${trainer.isTypingActiveLayout ? "typing-active-label" : ""}`}>{t(trainer.displayLanguage, "practice.currentWord")}</p>
          {readingHint ? (
            <p className="practice-word-reading" data-testid="practice-word-reading-slot">
              {readingHint}
            </p>
          ) : showWordReading ? (
            <div className="practice-word-reading-slot" data-testid="practice-word-reading-slot" />
          ) : null}
          <h2 data-testid="current-word" aria-describedby="practice-target-summary practice-status-message">
            {currentWord || t(trainer.displayLanguage, "practice.noWords")}
          </h2>
        </div>
        <button
          className="secondary"
          data-testid="pronounce-button"
          onClick={(event) => {
            trainer.speakCurrentWord();
            event.currentTarget.blur();
          }}
          disabled={!currentWord || !trainer.config.speechEnabled || trainer.pronunciationStatus === "generating" || trainer.pronunciationStatus === "playing"}
        >
          {t(trainer.displayLanguage, "practice.pronounce")}
        </button>
      </div>

      <div className="word-display" aria-live="polite" data-testid="word-display">
        {currentWord.split("").map((char, index) => {
          const status = index < trainer.session.charIndex ? "done" : index === trainer.session.charIndex ? "target" : "todo";
          return (
            <span
              key={`${char}-${index}`}
              className={`char ${status} ${status === "target" && hasMistype ? "error" : ""}`}
              data-testid={status === "target" ? "target-char" : undefined}
            >
              {char}
            </span>
          );
        })}
      </div>

      <p className="sr-only" data-testid="practice-target-summary" id="practice-target-summary">
        {targetSummary}
      </p>
    </div>
  );
}

function KeyboardGuideCard({
  trainer,
  compact,
  hasMistype,
  mistypedKey
}: {
  trainer: TrainerState;
  compact: boolean;
  hasMistype: boolean;
  mistypedKey: string | null;
}) {
  return (
    <section className={`guide-card keyboard-guide-card ${trainer.isTypingActiveLayout ? "typing-active" : ""} ${compact ? "compact" : ""}`.trim()} data-testid="keyboard-visual">
      <div className={`keyboard-map ${compact ? "compact" : ""}`} aria-label="Keyboard guide">
        {keyboardRows.map((row, rowIndex) => (
          <div key={row.join("")} className={`keyboard-row row-${rowIndex} ${compact ? "compact" : ""}`}>
            {row.map((key) => (
              <span
                key={key}
                className={[
                  "keycap",
                  compact ? "compact" : "",
                  trainer.currentTarget === key && !hasMistype ? "active" : "",
                  trainer.currentTarget === key && hasMistype ? "target-outline" : "",
                  mistypedKey === key ? "mistyped" : ""
                ]
                  .filter(Boolean)
                  .join(" ")}
                data-testid={trainer.currentTarget === key ? "active-keycap" : mistypedKey === key ? "mistyped-keycap" : undefined}
              >
                {key.toUpperCase()}
              </span>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}

function FingerGuideCard({
  trainer,
  language,
  compact,
  hasMistype
}: {
  trainer: TrainerState;
  language: TrainerState["displayLanguage"];
  compact: boolean;
  hasMistype: boolean;
}) {
  return (
    <FingerGuideButtons
      activeFingerId={trainer.currentGuide?.fingerId ?? null}
      hasMistype={hasMistype}
      label={
        trainer.currentGuide ? getFingerLabel(language, trainer.currentGuide.fingerId, trainer.currentGuide.finger) : t(language, "practice.noFinger")
      }
      language={language}
      compact={compact}
    />
  );
}

export function PracticePanel({ trainer }: PracticePanelProps) {
  const language = trainer.displayLanguage;
  const isCompactPracticeGuides = useCompactPracticeGuides();
  const currentWord = trainer.session.currentWord?.text ?? "";
  const readingHint =
    trainer.config.showWordReading && currentWord
      ? (() => {
          const hint = generateReadingHint(currentWord);
          return hint && hint.confidence !== "low" ? hint.text : null;
        })()
      : null;
  const showEmptyState = !currentWord;
  const hasMistype = trainer.session.lastInputCorrect === false;
  const mistypedKey = trainer.session.lastMistypedKey;
  const [isKeyboardGuideExpanded, setIsKeyboardGuideExpanded] = useState(true);
  const [isFingerGuideExpanded, setIsFingerGuideExpanded] = useState(false);

  function blurButtonAfterAction(event: MouseEvent<HTMLButtonElement>, action: () => void | Promise<void>) {
    action();
    event.currentTarget.blur();
  }

  const incorrectFeedback = mistypedKey
    ? formatMessage(language, "practice.feedback.incorrectWithKey", { key: mistypedKey.toUpperCase() })
    : t(language, "practice.feedback.incorrect");
  const shouldShowKeyboardGuide = trainer.isTypingActiveLayout || trainer.config.showKeyboardHint;
  const shouldShowFingerGuide = trainer.isTypingActiveLayout || trainer.config.showFingerGuide;
  const shouldUseCompactGuideDisclosure = isCompactPracticeGuides && trainer.isTypingActiveLayout;
  const pronunciationStatusMessage =
    trainer.pronunciationStatus === "generating"
      ? t(language, "practice.audio.generating")
      : trainer.pronunciationStatus === "playing"
      ? t(language, "practice.audio.playing")
      : trainer.pronunciationStatus === "error"
      ? t(language, "practice.audio.error")
      : trainer.pronunciationStatus === "fallback"
      ? t(language, "practice.audio.fallback")
      : null;
  const targetSummary = trainer.currentTarget && trainer.currentGuide
    ? formatMessage(language, "practice.a11y.target", {
        char: trainer.currentTarget.toUpperCase(),
        key: trainer.currentTarget.toUpperCase(),
        finger: getFingerLabel(language, trainer.currentGuide.fingerId, trainer.currentGuide.finger)
      })
    : t(language, "practice.noKey");
  const practiceStatusMessage = showEmptyState
    ? t(language, "practice.a11y.status.empty")
    : trainer.session.isComplete
    ? t(language, "practice.a11y.status.complete")
    : trainer.isCountdownActive
    ? formatMessage(language, "practice.a11y.status.countdown", { count: trainer.countdown })
    : trainer.session.lastInputCorrect === false
    ? incorrectFeedback
    : pronunciationStatusMessage
    ? pronunciationStatusMessage
    : t(language, "practice.a11y.status.active");
  const primaryStatus = showEmptyState
    ? {
        title: t(language, "practice.emptyTitle"),
        detail: t(language, "practice.emptyCopy"),
        tone: "warning" as const
      }
    : trainer.session.isComplete
    ? {
        title: t(language, "practice.feedback.complete"),
        tone: "success" as const
      }
    : trainer.isCountdownActive
    ? {
        title: `${t(language, "practice.countdown")} ${trainer.countdown}`,
        detail: t(language, "practice.feedback.ready"),
        tone: "warning" as const,
        action: {
          label: t(language, "practice.startNow"),
          testId: "skip-countdown-button",
          onClick: (event: MouseEvent<HTMLButtonElement>) => blurButtonAfterAction(event, trainer.skipCountdown)
        }
      }
    : trainer.session.lastInputCorrect === false
    ? {
        title: incorrectFeedback,
        tone: "error" as const
      }
    : pronunciationStatusMessage
    ? {
        title: pronunciationStatusMessage,
        tone: trainer.pronunciationStatus === "error" ? ("error" as const) : ("neutral" as const)
      }
    : null;
  useEffect(() => {
    if (!shouldUseCompactGuideDisclosure) {
      setIsKeyboardGuideExpanded(true);
      setIsFingerGuideExpanded(true);
      return;
    }

    setIsKeyboardGuideExpanded(true);
    setIsFingerGuideExpanded(false);
  }, [currentWord, shouldUseCompactGuideDisclosure]);

  return (
    <div className={`practice-panel ${trainer.isTypingActiveLayout ? "typing-active-layout" : ""}`} data-testid="practice-panel">
      <div className="sr-only" data-testid="practice-status-message" id="practice-status-message" role="status" aria-live="polite">
        {practiceStatusMessage}
      </div>

      {primaryStatus ? (
        <PracticePrimaryStatus title={primaryStatus.title} detail={undefined} tone={primaryStatus.tone} action={primaryStatus.action} />
      ) : null}

      {showEmptyState ? null : (
        <>
          <div className="practice-layout-slot metrics">
            <PracticeMetricsBar trainer={trainer} language={language} />
          </div>

          <div className="practice-layout-slot word">
            <PracticeWordStage
              currentWord={currentWord}
              hasMistype={hasMistype}
              readingHint={readingHint}
              targetSummary={targetSummary}
              showWordReading={trainer.config.showWordReading}
              trainer={trainer}
            />
          </div>
        </>
      )}

      {((shouldShowKeyboardGuide || shouldShowFingerGuide) && !showEmptyState) ? (
        <div className="practice-layout-slot keyboard practice-guides-panel" data-testid="practice-guides-panel">
          {shouldShowKeyboardGuide ? (
            shouldUseCompactGuideDisclosure ? (
              <div className="practice-guide-disclosure" data-testid="keyboard-guide-disclosure">
                <PracticeGuideToggle
                  ariaLabel={t(language, "practice.keyboardMap")}
                  expanded={isKeyboardGuideExpanded}
                  onToggle={() => setIsKeyboardGuideExpanded((current) => !current)}
                  testId="keyboard-guide-toggle"
                />
                {isKeyboardGuideExpanded ? <KeyboardGuideCard trainer={trainer} compact={isCompactPracticeGuides} hasMistype={hasMistype} mistypedKey={mistypedKey} /> : null}
              </div>
            ) : (
              <KeyboardGuideCard trainer={trainer} compact={isCompactPracticeGuides} hasMistype={hasMistype} mistypedKey={mistypedKey} />
            )
          ) : null}

          {shouldShowFingerGuide ? (
            <div className="practice-guides-finger-slot" data-testid="finger-guide-slot">
              {shouldUseCompactGuideDisclosure ? (
                <div className="practice-guide-disclosure" data-testid="finger-guide-disclosure">
                  <PracticeGuideToggle
                    ariaLabel={t(language, "practice.fingerGuideTitle")}
                    expanded={isFingerGuideExpanded}
                    onToggle={() => setIsFingerGuideExpanded((current) => !current)}
                    testId="finger-guide-toggle"
                  />
                  {isFingerGuideExpanded ? <FingerGuideCard trainer={trainer} language={language} compact={isCompactPracticeGuides} hasMistype={hasMistype} /> : null}
                </div>
              ) : (
                <FingerGuideCard trainer={trainer} language={language} compact={isCompactPracticeGuides} hasMistype={hasMistype} />
              )}
            </div>
          ) : null}
        </div>
      ) : null}

      <div className="cta-row practice-actions" data-testid="practice-actions">
        <button onClick={(event) => blurButtonAfterAction(event, () => trainer.restartSession())}>{t(language, "practice.restart")}</button>
        <button className="secondary" onClick={(event) => blurButtonAfterAction(event, () => trainer.setScreen("results"))}>
          {t(language, "practice.viewResults")}
        </button>
      </div>
    </div>
  );
}
