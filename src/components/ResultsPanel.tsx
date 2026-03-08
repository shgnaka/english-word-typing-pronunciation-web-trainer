import type { MouseEvent } from "react";
import { t } from "../i18n";
import type { TrainerState } from "../features/trainer/useTrainer";

interface ResultsPanelProps {
  trainer: TrainerState;
}

function buildResultsFeedback(trainer: TrainerState, language: TrainerState["displayLanguage"]) {
  const completedWords = trainer.session.completedWords;
  if (completedWords.length === 0) {
    return [];
  }

  const slowestWord = completedWords.reduce((currentSlowest, result) =>
    result.elapsedMs > currentSlowest.elapsedMs ? result : currentSlowest
  );
  const mostMistakesWord = completedWords.reduce((currentMostMistakes, result) =>
    result.mistakes > currentMostMistakes.mistakes ? result : currentMostMistakes
  );
  const cleanWordsCount = completedWords.filter((result) => result.mistakes === 0).length;

  const feedback = [
    t(language, "results.feedbackSlowest")
      .replace("{word}", slowestWord.word)
      .replace("{time}", String(slowestWord.elapsedMs)),
    t(language, "results.feedbackCleanWords")
      .replace("{count}", String(cleanWordsCount))
      .replace("{total}", String(completedWords.length))
  ];

  if (mostMistakesWord.mistakes > 0) {
    feedback.splice(
      1,
      0,
      t(language, "results.feedbackMostMistakes")
        .replace("{word}", mostMistakesWord.word)
        .replace("{mistakes}", String(mostMistakesWord.mistakes))
    );
  } else {
    feedback.splice(1, 0, t(language, "results.feedbackNoMistakes"));
  }

  return feedback;
}

export function ResultsPanel({ trainer }: ResultsPanelProps) {
  const language = trainer.displayLanguage;
  const feedbackItems = buildResultsFeedback(trainer, language);
  const resultsAnnouncement = t(language, "results.a11y.summary")
    .replace("{count}", String(trainer.session.completedWords.length))
    .replace("{wpm}", String(trainer.score.wpm))
    .replace("{accuracy}", String(trainer.score.accuracy))
    .replace("{score}", String(trainer.score.rawScore))
    .replace("{level}", trainer.score.level);

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

      {feedbackItems.length > 0 ? (
        <section className="results-feedback" data-testid="results-feedback">
          <p className="label">{t(language, "results.feedbackTitle")}</p>
          {feedbackItems.map((item) => (
            <p key={item} className="results-feedback-item" data-testid="results-feedback-item">
              {item}
            </p>
          ))}
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
      </div>
    </>
  );
}
