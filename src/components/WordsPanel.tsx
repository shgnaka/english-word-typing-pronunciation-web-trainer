import { t } from "../i18n";
import type { TrainerState } from "../features/trainer/useTrainer";

interface WordsPanelProps {
  trainer: TrainerState;
}

export function WordsPanel({ trainer }: WordsPanelProps) {
  const language = trainer.displayLanguage;

  return (
    <>
      <div className="panel-header">
        <div>
          <p className="label">{t(language, "words.title")}</p>
          <h2>{t(language, "words.subtitle")}</h2>
        </div>
      </div>

      <div className="add-word-row">
        <input
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
        <p className="inline-error" data-testid="add-word-error">
          {t(language, trainer.addWordError as "words.error.invalid" | "words.error.duplicate")}
        </p>
      ) : null}

      <div className="word-list" data-testid="custom-word-list">
        {trainer.customWords.length === 0 ? (
          <p>{t(language, "words.empty")}</p>
        ) : (
          trainer.customWords.map((word) => (
            <span key={word.id} className="word-chip" data-testid="word-chip">
              {word.text}
            </span>
          ))
        )}
      </div>
    </>
  );
}
