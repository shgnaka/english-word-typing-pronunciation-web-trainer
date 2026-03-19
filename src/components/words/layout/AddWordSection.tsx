import type { RefObject } from "react";
import { t } from "../../../i18n";
import type { TrainerState } from "../../../features/trainer/useTrainer";

export function AddWordSection({
  trainer,
  inputRef
}: {
  trainer: TrainerState;
  inputRef: RefObject<HTMLInputElement | null>;
}) {
  const language = trainer.displayLanguage;

  return (
    <section className="word-section word-section-highlight">
      <p className="label">{t(language, "words.newWord")}</p>
      <div className="add-word-row">
        <input
          ref={inputRef}
          data-testid="new-word-input"
          value={trainer.inputValue}
          onChange={(event) => trainer.setInputValue(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              trainer.handleAddWord();
            }
          }}
          placeholder={t(language, "words.placeholder")}
          aria-label={t(language, "words.newWord")}
        />
        <button data-testid="add-word-button" onClick={trainer.handleAddWord}>
          {t(language, "words.add")}
        </button>
      </div>
      {trainer.addWordError ? (
        <p className="inline-error" data-testid="add-word-error" role="alert" aria-live="assertive">
          {t(language, trainer.addWordError as "words.error.invalid" | "words.error.duplicate")}
        </p>
      ) : null}
    </section>
  );
}
