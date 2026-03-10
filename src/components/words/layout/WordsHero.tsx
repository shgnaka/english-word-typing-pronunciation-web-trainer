import { t } from "../../../i18n";
import type { TrainerState } from "../../../features/trainer/useTrainer";

export function WordsHero({ trainer }: { trainer: TrainerState }) {
  const language = trainer.displayLanguage;

  return (
    <section className="words-hero">
      <div className="words-hero-copy">
        <p className="label">{t(language, "words.collectionLabel")}</p>
        <h3>{t(language, "words.collectionTitle")}</h3>
        <p>{t(language, "words.addHint")}</p>
      </div>
      <div className="words-stats" data-testid="words-stats">
        <article className="word-stat-card">
          <span className="word-stat-value">{trainer.builtinWords.length + trainer.customWords.length}</span>
          <span className="word-stat-label">{t(language, "words.stats.available")}</span>
        </article>
        <article className="word-stat-card">
          <span className="word-stat-value">{trainer.builtinWords.length}</span>
          <span className="word-stat-label">{t(language, "words.stats.builtin")}</span>
        </article>
        <article className="word-stat-card">
          <span className="word-stat-value">{trainer.customWords.length}</span>
          <span className="word-stat-label">{t(language, "words.stats.custom")}</span>
        </article>
        <article className="word-stat-card">
          <span className="word-stat-value">{trainer.hiddenBuiltinWords.length}</span>
          <span className="word-stat-label">{t(language, "words.stats.hidden")}</span>
        </article>
      </div>
    </section>
  );
}
