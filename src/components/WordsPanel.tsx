import { t } from "../i18n";
import type { TrainerState } from "../features/trainer/useTrainer";

interface WordsPanelProps {
  trainer: TrainerState;
}

export function WordsPanel({ trainer }: WordsPanelProps) {
  const language = trainer.displayLanguage;
  const lastCustomWordIndex = trainer.customWords.length - 1;

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
        <p className="inline-error" data-testid="add-word-error" role="alert" aria-live="assertive">
          {t(language, trainer.addWordError as "words.error.invalid" | "words.error.duplicate")}
        </p>
      ) : null}

      <section className="word-section" data-testid="builtin-word-section">
        <p className="label">{t(language, "words.builtinTitle")}</p>
        <div className="word-list" data-testid="builtin-word-list" aria-label={t(language, "words.builtinTitle")}>
          {trainer.builtinWords.map((word) => (
            <span key={word.id} className="word-chip" data-testid="builtin-word-chip">
              {word.text}
            </span>
          ))}
        </div>
      </section>

      <section className="word-section" data-testid="custom-word-section">
        <p className="label">{t(language, "words.customTitle")}</p>
        <div className="word-list" data-testid="custom-word-list" aria-label={t(language, "words.customTitle")}>
          {trainer.customWords.length === 0 ? (
            <p>{t(language, "words.empty")}</p>
          ) : (
            trainer.customWords.map((word) => (
              <div key={word.id} className="word-chip-row" data-testid="word-chip-row">
                {trainer.editingWordId === word.id ? (
                  <>
                    <input
                      data-testid={`edit-word-input-${word.id}`}
                      value={trainer.editingWordValue}
                      onChange={(event) => trainer.setEditingWordValue(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          event.preventDefault();
                          trainer.saveEditingWord();
                        }

                        if (event.key === "Escape") {
                          event.preventDefault();
                          trainer.cancelEditingWord();
                        }
                      }}
                      aria-label={`${t(language, "words.edit")} ${word.text}`}
                    />
                    <button type="button" className="secondary" data-testid={`save-word-button-${word.id}`} onClick={trainer.saveEditingWord}>
                      {t(language, "words.save")}
                    </button>
                    <button type="button" className="secondary" data-testid={`cancel-word-button-${word.id}`} onClick={trainer.cancelEditingWord}>
                      {t(language, "words.cancel")}
                    </button>
                  </>
                ) : (
                  <>
                    <span className="word-chip" data-testid="word-chip">
                      {word.text}
                    </span>
                    <button
                      type="button"
                      className="secondary"
                      data-testid={`move-word-up-button-${word.id}`}
                      onClick={() => trainer.moveCustomWord(word.id, "up")}
                      disabled={trainer.customWords.findIndex((entry) => entry.id === word.id) === 0}
                    >
                      {t(language, "words.moveUp")}
                    </button>
                    <button
                      type="button"
                      className="secondary"
                      data-testid={`move-word-down-button-${word.id}`}
                      onClick={() => trainer.moveCustomWord(word.id, "down")}
                      disabled={trainer.customWords.findIndex((entry) => entry.id === word.id) === lastCustomWordIndex}
                    >
                      {t(language, "words.moveDown")}
                    </button>
                    <button type="button" className="secondary" data-testid={`edit-word-button-${word.id}`} onClick={() => trainer.startEditingWord(word.id)}>
                      {t(language, "words.edit")}
                    </button>
                    <button type="button" className="secondary" data-testid={`delete-word-button-${word.id}`} onClick={() => trainer.handleRemoveWord(word.id)}>
                      {t(language, "words.delete")}
                    </button>
                  </>
                )}
              </div>
            ))
          )}
        </div>
      </section>
    </>
  );
}
