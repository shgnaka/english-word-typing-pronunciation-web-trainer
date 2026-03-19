import { t } from "../../../i18n";
import type { TrainerState } from "../../../features/trainer/useTrainer";

export function WordsHero({ trainer, onJumpToActive }: { trainer: TrainerState; onJumpToActive: () => void }) {
  const language = trainer.displayLanguage;
  const hiddenCount = trainer.hiddenBuiltinWords.length + trainer.inactiveCustomWords.length;

  return (
    <section className="words-hero" data-testid="words-hero">
      <div className="words-hero-actions">
        <button type="button" data-testid="jump-to-active-words-button" onClick={onJumpToActive}>
          {t(language, "words.jumpToActive")}
        </button>
      </div>
      <p className="words-hero-summary" data-testid="words-stats">
        <span>{t(language, "words.activeTitle")}: {trainer.activeWords.length}</span>
        <span>{t(language, "words.stats.sessionSize")}: {trainer.requestedWordCount}</span>
        <span>{t(language, "words.stats.builtin")}: {trainer.builtinWords.length}</span>
        <span>{t(language, "words.stats.custom")}: {trainer.customWords.length}</span>
        <span>{t(language, "words.stats.hiddenTotal")}: {hiddenCount}</span>
      </p>
    </section>
  );
}
