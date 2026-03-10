import { t } from "../../../i18n";
import type { TrainerState } from "../../../features/trainer/useTrainer";

export function WordsHero({ trainer, onJumpToActive }: { trainer: TrainerState; onJumpToActive: () => void }) {
  const language = trainer.displayLanguage;
  const hiddenCount = trainer.hiddenBuiltinWords.length + trainer.inactiveCustomWords.length;

  return (
    <section className="words-hero" data-testid="words-hero">
      <div className="words-hero-copy">
        <p className="label">{t(language, "words.collectionLabel")}</p>
        <h3>{t(language, "words.collectionTitle")}</h3>
        <div className="words-hero-actions">
          <button type="button" data-testid="jump-to-active-words-button" onClick={onJumpToActive}>
            {t(language, "words.jumpToActive")}
          </button>
        </div>
      </div>
      <div className="words-stats" data-testid="words-stats">
        <article className="word-stat-card word-stat-card-featured">
          <span className="label">{t(language, "words.activeTitle")}</span>
          <span className="word-stat-value">{trainer.activeWords.length}</span>
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
          <span className="word-stat-value">{hiddenCount}</span>
          <span className="word-stat-label">{t(language, "words.stats.hiddenTotal")}</span>
        </article>
      </div>
    </section>
  );
}
