import type { MouseEvent } from "react";
import { keyboardRows } from "../domain/keyboard";
import { getFingerLabel, t } from "../i18n";
import type { TrainerState } from "../features/trainer/useTrainer";
import { FingerGuideButtons } from "./FingerGuideButtons";

interface PracticePanelProps {
  trainer: TrainerState;
}

export function PracticePanel({ trainer }: PracticePanelProps) {
  const language = trainer.displayLanguage;
  const currentWord = trainer.session.currentWord?.text ?? "";
  const showEmptyState = !currentWord;
  const hasMistype = trainer.session.lastInputCorrect === false;
  const mistypedKey = trainer.session.lastMistypedKey;

  function blurButtonAfterAction(event: MouseEvent<HTMLButtonElement>, action: () => void) {
    action();
    event.currentTarget.blur();
  }

  const incorrectFeedback = mistypedKey
    ? t(language, "practice.feedback.incorrectWithKey").replace("{key}", mistypedKey.toUpperCase())
    : t(language, "practice.feedback.incorrect");

  return (
    <>
      <div className="session-summary">
        <article className="metric">
          <span className="label">{t(language, "practice.progress")}</span>
          <strong data-testid="progress-count">
            {trainer.completedWordsCount} / {trainer.totalWords || 0} words
          </strong>
        </article>
        <article className="metric">
          <span className="label">{t(language, "practice.remaining")}</span>
          <strong data-testid="remaining-words">{trainer.remainingWords}</strong>
        </article>
      </div>

      <div className="progress-block">
        <div className="progress-copy">
          <span className="label">{t(language, "practice.sessionProgress")}</span>
          <strong data-testid="progress-percent">{trainer.progressPercent}%</strong>
        </div>
        <div className="progress-track" aria-hidden="true">
          <div className="progress-fill" data-testid="progress-fill" style={{ width: `${trainer.progressPercent}%` }} />
        </div>
      </div>

      <div className="panel-header">
        <div>
          <p className="label">{t(language, "practice.currentWord")}</p>
          <h2 data-testid="current-word">{currentWord || t(language, "practice.noWords")}</h2>
        </div>
        <button
          className="secondary"
          data-testid="pronounce-button"
          onClick={(event) => blurButtonAfterAction(event, trainer.speakCurrentWord)}
          disabled={!currentWord || !trainer.config.speechEnabled}
        >
          {t(language, "practice.pronounce")}
        </button>
      </div>

      {showEmptyState ? (
        <div className="empty-state" data-testid="practice-empty-state">
          <strong>{t(language, "practice.emptyTitle")}</strong>
          <p>{t(language, "practice.emptyCopy")}</p>
        </div>
      ) : (
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

      {(trainer.config.showKeyboardHint || trainer.config.showFingerGuide) && !showEmptyState ? (
        <div className="guide-visuals">
          {trainer.config.showKeyboardHint ? (
            <section className="guide-card" data-testid="keyboard-visual">
              <div className="guide-card-header">
                <div>
                  <span className="label">{t(language, "practice.keyboardMap")}</span>
                  <strong>{trainer.currentTarget ? `Key ${trainer.currentTarget.toUpperCase()}` : t(language, "practice.noKey")}</strong>
                </div>
                <p className="guide-card-copy">{t(language, "practice.keyboardHelp")}</p>
              </div>
              <div className="keyboard-map" aria-label="Keyboard guide">
                {keyboardRows.map((row, rowIndex) => (
                  <div key={row.join("")} className={`keyboard-row row-${rowIndex}`}>
                    {row.map((key) => (
                      <span
                        key={key}
                        className={[
                          "keycap",
                          trainer.currentTarget === key && !hasMistype ? "active" : "",
                          trainer.currentTarget === key && hasMistype ? "target-outline" : "",
                          mistypedKey === key ? "mistyped" : ""
                        ]
                          .filter(Boolean)
                          .join(" ")}
                        data-testid={
                          trainer.currentTarget === key ? "active-keycap" : mistypedKey === key ? "mistyped-keycap" : undefined
                        }
                      >
                        {key.toUpperCase()}
                      </span>
                    ))}
                  </div>
                ))}
              </div>
            </section>
          ) : null}

          {trainer.config.showFingerGuide ? (
            <FingerGuideButtons
              activeFingerId={trainer.currentGuide?.fingerId ?? null}
              hasMistype={hasMistype}
              helper={t(language, "practice.fingerGuideHelp")}
              label={
                trainer.currentGuide
                  ? getFingerLabel(language, trainer.currentGuide.fingerId, trainer.currentGuide.finger)
                  : t(language, "practice.noFinger")
              }
              language={language}
              title={t(language, "practice.fingerGuideTitle")}
            />
          ) : null}
        </div>
      ) : null}

      <div
        className={`feedback ${trainer.session.lastInputCorrect === false ? "error" : ""} ${trainer.session.isComplete ? "success" : ""}`}
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

      <div className="cta-row">
        <button onClick={(event) => blurButtonAfterAction(event, () => trainer.restartSession())}>{t(language, "practice.restart")}</button>
        <button className="secondary" onClick={(event) => blurButtonAfterAction(event, () => trainer.setScreen("results"))}>
          {t(language, "practice.viewResults")}
        </button>
      </div>
    </>
  );
}
