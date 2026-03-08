import type { MouseEvent } from "react";
import { keyboardRows } from "../domain/keyboard";
import { getFingerLabel, t } from "../i18n";
import type { TrainerState } from "../features/trainer/useTrainer";
import { FingerGuideButtons } from "./FingerGuideButtons";

interface PracticePanelProps {
  trainer: TrainerState;
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
  trainer
}: {
  currentWord: string;
  hasMistype: boolean;
  trainer: TrainerState;
}) {
  return (
    <div className={`practice-word-stage ${trainer.isTypingActiveLayout ? "typing-active" : ""}`} data-testid="practice-word-stage">
      <div className="panel-header practice-header">
        <div>
          <p className={`label ${trainer.isTypingActiveLayout ? "typing-active-label" : ""}`}>{t(trainer.displayLanguage, "practice.currentWord")}</p>
          <h2 data-testid="current-word">{currentWord || t(trainer.displayLanguage, "practice.noWords")}</h2>
        </div>
        <button
          className="secondary"
          data-testid="pronounce-button"
          onClick={(event) => {
            trainer.speakCurrentWord();
            event.currentTarget.blur();
          }}
          disabled={!currentWord || !trainer.config.speechEnabled || trainer.pronunciationStatus === "generating"}
        >
          {t(trainer.displayLanguage, "practice.pronounce")}
        </button>
      </div>

      {trainer.pronunciationStatus !== "idle" ? (
        <div className="pronunciation-status" data-testid="pronunciation-status" aria-live="polite">
          {trainer.pronunciationStatus === "generating"
            ? t(trainer.displayLanguage, "practice.audio.generating")
            : t(trainer.displayLanguage, "practice.audio.fallback")}
        </div>
      ) : null}

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
  const currentWord = trainer.session.currentWord?.text ?? "";
  const showEmptyState = !currentWord;
  const hasMistype = trainer.session.lastInputCorrect === false;
  const mistypedKey = trainer.session.lastMistypedKey;

  function blurButtonAfterAction(event: MouseEvent<HTMLButtonElement>, action: () => void | Promise<void>) {
    action();
    event.currentTarget.blur();
  }

  const incorrectFeedback = mistypedKey
    ? t(language, "practice.feedback.incorrectWithKey").replace("{key}", mistypedKey.toUpperCase())
    : t(language, "practice.feedback.incorrect");
  const shouldShowKeyboardGuide = trainer.isTypingActiveLayout || trainer.config.showKeyboardHint;
  const shouldShowFingerGuide = trainer.isTypingActiveLayout || trainer.config.showFingerGuide;

  return (
    <div className={`practice-panel ${trainer.isTypingActiveLayout ? "typing-active-layout" : ""}`} data-testid="practice-panel">
      {showEmptyState ? (
        <div className="empty-state" data-testid="practice-empty-state">
          <strong>{t(language, "practice.emptyTitle")}</strong>
          <p>{t(language, "practice.emptyCopy")}</p>
        </div>
      ) : (
        <>
          <div className="practice-layout-slot metrics">
            <PracticeMetricsBar trainer={trainer} language={language} />
          </div>

          <div className="practice-layout-slot word">
            <PracticeWordStage currentWord={currentWord} hasMistype={hasMistype} trainer={trainer} />
          </div>
        </>
      )}

      {trainer.isCountdownActive ? (
        <div className="countdown-banner" data-testid="countdown-banner" aria-live="polite">
          <span>
            {t(language, "practice.countdown")} {trainer.countdown}
          </span>
          <button
            className="secondary inline-action"
            data-testid="skip-countdown-button"
            onClick={(event) => blurButtonAfterAction(event, trainer.skipCountdown)}
          >
            {t(language, "practice.startNow")}
          </button>
        </div>
      ) : null}

      {shouldShowKeyboardGuide && !showEmptyState ? (
        <div className="practice-layout-slot keyboard" data-testid="keyboard-guide-slot">
          <KeyboardGuideCard trainer={trainer} language={language} hasMistype={hasMistype} mistypedKey={mistypedKey} />
        </div>
      ) : null}

      {shouldShowFingerGuide && !showEmptyState ? (
        <div className="practice-layout-slot finger" data-testid="finger-guide-slot">
          <FingerGuideCard trainer={trainer} language={language} hasMistype={hasMistype} />
        </div>
      ) : null}

      <div
        className={`feedback ${trainer.isTypingActiveLayout ? "persistent" : ""} ${trainer.session.lastInputCorrect === false ? "error" : ""} ${trainer.session.isComplete ? "success" : ""}`}
        data-testid="feedback"
      >
        {trainer.session.isComplete
          ? t(language, "practice.feedback.complete")
          : trainer.isCountdownActive
          ? t(language, "practice.feedback.ready")
          : trainer.session.lastInputCorrect === false
          ? incorrectFeedback
          : t(language, "practice.feedback.default")}
      </div>

      <div className="cta-row practice-actions" data-testid="practice-actions">
        <button onClick={(event) => blurButtonAfterAction(event, () => trainer.restartSession())}>{t(language, "practice.restart")}</button>
        <button className="secondary" onClick={(event) => blurButtonAfterAction(event, () => trainer.setScreen("results"))}>
          {t(language, "practice.viewResults")}
        </button>
      </div>
    </div>
  );
}
