import type { MouseEvent } from "react";
import { formatMessage, t } from "../i18n";
import type { TrainerState } from "../features/trainer/useTrainer";

interface ResultsPanelProps {
  trainer: TrainerState;
}

function buildResultsFeedback(trainer: TrainerState, language: TrainerState["displayLanguage"]) {
  const completedWords = trainer.session.completedWords;
  if (completedWords.length === 0) {
    return null;
  }

  const slowestWord = completedWords.reduce((currentSlowest, result) =>
    result.elapsedMs > currentSlowest.elapsedMs ? result : currentSlowest
  );
  const mostMistakesWord = completedWords.reduce((currentMostMistakes, result) =>
    result.mistakes > currentMostMistakes.mistakes ? result : currentMostMistakes
  );
  const cleanWordsCount = completedWords.filter((result) => result.mistakes === 0).length;

  const strength = formatMessage(language, "results.feedbackCleanWords", {
    count: cleanWordsCount,
    total: completedWords.length
  });
  const focus =
    mostMistakesWord.mistakes > 0
      ? formatMessage(language, "results.feedbackMostMistakes", {
          word: mostMistakesWord.word,
          mistakes: mostMistakesWord.mistakes
        })
      : formatMessage(language, "results.feedbackSlowest", {
          word: slowestWord.word,
          time: slowestWord.elapsedMs
        });
  const supporting =
    mostMistakesWord.mistakes > 0
      ? formatMessage(language, "results.feedbackSlowest", {
          word: slowestWord.word,
          time: slowestWord.elapsedMs
        })
      : t(language, "results.feedbackNoMistakes");

  return {
    strength,
    focus,
    supporting
  };
}

export function ResultsPanel({ trainer }: ResultsPanelProps) {
  const language = trainer.displayLanguage;
  const feedbackItems = buildResultsFeedback(trainer, language);
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
      <div className="panel-header">
        <div>
          <p className="label">{t(language, "results.title")}</p>
          <h2>{t(language, "results.subtitle")}</h2>
        </div>
      </div>

      <div className="completion-banner" data-testid="completion-banner" role="status" aria-live="polite">
        {t(language, "results.complete")}
      </div>

      <p className="sr-only" data-testid="results-accessibility-summary">
        {resultsAnnouncement}
      </p>

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

      <p className="results-summary" data-testid="results-summary" aria-describedby="results-accessibility-summary">
        {t(language, "results.summary")}
      </p>

      {feedbackItems ? (
        <section className="results-feedback" data-testid="results-feedback">
          <p className="label">{t(language, "results.feedbackTitle")}</p>
          <div className="results-feedback-grid">
            <article className="results-feedback-card" data-testid="results-strength-card">
              <p className="label">{t(language, "results.coachingStrength")}</p>
              <p className="results-feedback-item" data-testid="results-feedback-item">
                {feedbackItems.strength}
              </p>
            </article>
            <article className="results-feedback-card" data-testid="results-focus-card">
              <p className="label">{t(language, "results.coachingFocus")}</p>
              <p className="results-feedback-item" data-testid="results-feedback-item">
                {feedbackItems.focus}
              </p>
              <p className="results-feedback-supporting" data-testid="results-feedback-supporting">
                {feedbackItems.supporting}
              </p>
            </article>
          </div>
        </section>
      ) : null}

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
