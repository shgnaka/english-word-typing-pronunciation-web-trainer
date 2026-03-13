import type { MouseEvent } from "react";
import { formatMessage, t } from "../i18n";
import type { TrainerState } from "../features/trainer/useTrainer";

interface ResultsPanelProps {
  trainer: TrainerState;
}

export function ResultsPanel({ trainer }: ResultsPanelProps) {
  const language = trainer.displayLanguage;
  const resultsAnnouncement = formatMessage(language, "results.a11y.summary", {
    count: trainer.session.completedWords.length,
    wpm: trainer.score.wpm,
    accuracy: trainer.score.accuracy,
    score: trainer.score.rawScore,
    level: trainer.score.level
  });

  function blurButtonAfterAction(event: MouseEvent<HTMLButtonElement>, action: () => void) {
    action();
    event.currentTarget.blur();
  }

  return (
    <>
      <p className="sr-only" data-testid="results-accessibility-summary">
        {resultsAnnouncement}
      </p>

      <article className="metric results-inline-metric">
        <span className="label">{t(language, "results.wpm")}</span>
        <strong data-testid="score-wpm">{trainer.score.wpm}</strong>
      </article>
      <article className="metric results-inline-metric">
        <span className="label">{t(language, "results.accuracy")}</span>
        <strong data-testid="score-accuracy">{trainer.score.accuracy}%</strong>
      </article>
      <article className="metric results-inline-metric">
        <span className="label">{t(language, "results.score")}</span>
        <strong data-testid="score-raw">{trainer.score.rawScore}</strong>
      </article>
      <article className="metric results-inline-metric">
        <span className="label">{t(language, "results.level")}</span>
        <strong data-testid="score-level">{trainer.score.level}</strong>
      </article>

      {trainer.session.completedWords.length > 0 ? (
        <div className="results-list" data-testid="results-list">
          {trainer.session.completedWords.map((result) => (
            <article key={`${result.word}-${result.elapsedMs}`} className="result-card" data-testid="result-card">
              <h3>{result.word}</h3>
              <p>
                {t(language, "results.time")}: {result.elapsedMs} ms
              </p>
              <p>
                {t(language, "results.mistakes")}: {result.mistakes}
              </p>
            </article>
          ))}
        </div>
      ) : null}

      <div className="cta-row">
        <button onClick={(event) => blurButtonAfterAction(event, () => trainer.restartSession())}>{t(language, "results.startNew")}</button>
        {trainer.session.completedWords.length > 0 ? (
          <button
            className="secondary"
            data-testid="retry-focused-results-button"
            onClick={(event) => blurButtonAfterAction(event, () => trainer.retryFocusedWords())}
          >
            {t(language, "results.retryFocused")}
          </button>
        ) : null}
      </div>
    </>
  );
}
