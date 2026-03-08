import type { MouseEvent } from "react";
import { t } from "../i18n";
import type { TrainerState } from "../features/trainer/useTrainer";

interface ResultsPanelProps {
  trainer: TrainerState;
}

export function ResultsPanel({ trainer }: ResultsPanelProps) {
  const language = trainer.displayLanguage;

  function blurButtonAfterAction(event: MouseEvent<HTMLButtonElement>, action: () => void) {
    action();
    event.currentTarget.blur();
  }

  return (
    <>
      <div className="panel-header">
        <div>
          <p className="label">{t(language, "results.title")}</p>
          <h2>{t(language, "results.subtitle")}</h2>
        </div>
      </div>

      <div className="completion-banner" data-testid="completion-banner">
        {t(language, "results.complete")}
      </div>

      <div className="status-row">
        <article className="metric">
          <span className="label">{t(language, "results.wpm")}</span>
          <strong data-testid="score-wpm">{trainer.score.wpm}</strong>
        </article>
        <article className="metric">
          <span className="label">{t(language, "results.accuracy")}</span>
          <strong data-testid="score-accuracy">{trainer.score.accuracy}%</strong>
        </article>
        <article className="metric">
          <span className="label">{t(language, "results.score")}</span>
          <strong data-testid="score-raw">{trainer.score.rawScore}</strong>
        </article>
        <article className="metric">
          <span className="label">{t(language, "results.level")}</span>
          <strong data-testid="score-level">{trainer.score.level}</strong>
        </article>
      </div>

      <p className="results-summary" data-testid="results-summary">
        {t(language, "results.summary")}
      </p>

      <div className="results-list" data-testid="results-list">
        {trainer.session.completedWords.length === 0 ? (
          <p>{t(language, "results.empty")}</p>
        ) : (
          trainer.session.completedWords.map((result) => (
            <article key={`${result.word}-${result.elapsedMs}`} className="result-card" data-testid="result-card">
              <h3>{result.word}</h3>
              <p>
                {t(language, "results.time")}: {result.elapsedMs} ms
              </p>
              <p>
                {t(language, "results.mistakes")}: {result.mistakes}
              </p>
            </article>
          ))
        )}
      </div>

      <div className="cta-row">
        <button onClick={(event) => blurButtonAfterAction(event, () => trainer.restartSession())}>{t(language, "results.startNew")}</button>
      </div>
    </>
  );
}
