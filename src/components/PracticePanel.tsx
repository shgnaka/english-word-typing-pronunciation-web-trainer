import { useEffect, useState, type MouseEvent } from "react";
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
  title,
  summary,
  expanded,
  onToggle,
  testId
}: {
  title: string;
  summary: string;
  expanded: boolean;
  onToggle: () => void;
  testId: string;
}) {
  return (
    <button
      type="button"
      className="secondary practice-guide-toggle"
      data-testid={testId}
      aria-expanded={expanded}
      onClick={onToggle}
    >
      <span>{title}</span>
      <strong>{summary}</strong>
    </button>
  );
}

function PracticeStepHint({ label, message }: { label: string; message: string }) {
  return (
    <div className="practice-step-hint" data-testid="practice-step-hint">
      <span className="label">{label}</span>
      <p>{message}</p>
    </div>
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
  targetSummary,
  trainer
}: {
  currentWord: string;
  hasMistype: boolean;
  targetSummary: string;
  trainer: TrainerState;
}) {
  return (
    <div className={`practice-word-stage ${trainer.isTypingActiveLayout ? "typing-active" : ""}`} data-testid="practice-word-stage">
      <div className="panel-header practice-header">
        <div>
          <p className={`label ${trainer.isTypingActiveLayout ? "typing-active-label" : ""}`}>{t(trainer.displayLanguage, "practice.currentWord")}</p>
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
  language,
  hasMistype,
  mistypedKey
}: {
  trainer: TrainerState;
  language: TrainerState["displayLanguage"];
  hasMistype: boolean;
  mistypedKey: string | null;
}) {
  return (
    <section
      className={`guide-card keyboard-guide-card ${trainer.isTypingActiveLayout ? "typing-active compact" : ""}`}
      data-testid="keyboard-visual"
    >
      <div className={`guide-card-header ${trainer.isTypingActiveLayout ? "typing-active compact" : ""}`}>
        <div>
          <span className="label">{t(language, "practice.keyboardMap")}</span>
          <strong>{trainer.currentTarget ? `Key ${trainer.currentTarget.toUpperCase()}` : t(language, "practice.noKey")}</strong>
        </div>
        {!trainer.isTypingActiveLayout ? <p className="guide-card-copy">{t(language, "practice.keyboardHelp")}</p> : null}
      </div>
      <div className={`keyboard-map ${trainer.isTypingActiveLayout ? "compact" : ""}`} aria-label="Keyboard guide">
        {keyboardRows.map((row, rowIndex) => (
          <div key={row.join("")} className={`keyboard-row row-${rowIndex} ${trainer.isTypingActiveLayout ? "compact" : ""}`}>
            {row.map((key) => (
              <span
                key={key}
                className={[
                  "keycap",
                  trainer.isTypingActiveLayout ? "compact" : "",
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
  hasMistype
}: {
  trainer: TrainerState;
  language: TrainerState["displayLanguage"];
  hasMistype: boolean;
}) {
  return (
    <FingerGuideButtons
      activeFingerId={trainer.currentGuide?.fingerId ?? null}
      hasMistype={hasMistype}
      helper={t(language, "practice.fingerGuideHelp")}
      label={
        trainer.currentGuide ? getFingerLabel(language, trainer.currentGuide.fingerId, trainer.currentGuide.finger) : t(language, "practice.noFinger")
      }
      language={language}
      title={t(language, "practice.fingerGuideTitle")}
      compact={trainer.isTypingActiveLayout}
    />
  );
}

export function PracticePanel({ trainer }: PracticePanelProps) {
  const language = trainer.displayLanguage;
  const isCompactPracticeGuides = useCompactPracticeGuides();
  const currentWord = trainer.session.currentWord?.text ?? "";
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
    : {
        title: t(language, "practice.feedback.default"),
        tone: "neutral" as const
      };
  const stepHint = showEmptyState
    ? t(language, "practice.stepHint.empty")
    : trainer.session.isComplete
    ? t(language, "practice.stepHint.complete")
    : trainer.isCountdownActive
    ? t(language, "practice.stepHint.countdown")
    : trainer.session.lastInputCorrect === false
    ? t(language, "practice.stepHint.incorrect")
    : t(language, "practice.stepHint.active");

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

      <PracticePrimaryStatus
        title={primaryStatus.title}
        detail={primaryStatus.detail}
        tone={primaryStatus.tone}
        action={primaryStatus.action}
      />
      <PracticeStepHint label={t(language, "practice.stepHintLabel")} message={stepHint} />

      {showEmptyState ? null : (
        <>
          <div className="practice-layout-slot metrics">
            <PracticeMetricsBar trainer={trainer} language={language} />
          </div>

          <div className="practice-layout-slot word">
            <PracticeWordStage currentWord={currentWord} hasMistype={hasMistype} targetSummary={targetSummary} trainer={trainer} />
          </div>
        </>
      )}

      {shouldShowKeyboardGuide && !showEmptyState ? (
        <div className="practice-layout-slot keyboard" data-testid="keyboard-guide-slot">
          {shouldUseCompactGuideDisclosure ? (
            <div className="practice-guide-disclosure" data-testid="keyboard-guide-disclosure">
              <PracticeGuideToggle
                title={t(language, "practice.keyboardMap")}
                summary={trainer.currentTarget ? `Key ${trainer.currentTarget.toUpperCase()}` : t(language, "practice.noKey")}
                expanded={isKeyboardGuideExpanded}
                onToggle={() => setIsKeyboardGuideExpanded((current) => !current)}
                testId="keyboard-guide-toggle"
              />
              {isKeyboardGuideExpanded ? (
                <KeyboardGuideCard trainer={trainer} language={language} hasMistype={hasMistype} mistypedKey={mistypedKey} />
              ) : null}
            </div>
          ) : (
            <KeyboardGuideCard trainer={trainer} language={language} hasMistype={hasMistype} mistypedKey={mistypedKey} />
          )}
        </div>
      ) : null}

      {shouldShowFingerGuide && !showEmptyState ? (
        <div className="practice-layout-slot finger" data-testid="finger-guide-slot">
          {shouldUseCompactGuideDisclosure ? (
            <div className="practice-guide-disclosure" data-testid="finger-guide-disclosure">
              <PracticeGuideToggle
                title={t(language, "practice.fingerGuideTitle")}
                summary={
                  trainer.currentGuide
                    ? getFingerLabel(language, trainer.currentGuide.fingerId, trainer.currentGuide.finger)
                    : t(language, "practice.noFinger")
                }
                expanded={isFingerGuideExpanded}
                onToggle={() => setIsFingerGuideExpanded((current) => !current)}
                testId="finger-guide-toggle"
              />
              {isFingerGuideExpanded ? <FingerGuideCard trainer={trainer} language={language} hasMistype={hasMistype} /> : null}
            </div>
          ) : (
            <FingerGuideCard trainer={trainer} language={language} hasMistype={hasMistype} />
          )}
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
