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
  const addWordPreview = trainer.addWordPreview;
  const duplicatePreviewLabel =
    addWordPreview?.duplicateMatch
      ? t(language, "words.inputDuplicate")
          .replace("{source}", t(language, addWordPreview.duplicateMatch.source === "builtin" ? "words.sourceBuiltin" : "words.sourceCustom"))
          .replace("{word}", addWordPreview.duplicateMatch.text)
      : "";
  const normalizedPreviewLabel =
    addWordPreview?.normalizedValue
      ? t(language, "words.inputPreview").replace("{word}", addWordPreview.normalizedValue)
      : "";

  return (
    <section className="word-section word-section-highlight">
      <div className="panel-header">
        <div>
          <p className="label">{t(language, "words.newWord")}</p>
          <p>{t(language, "words.addHint")}</p>
        </div>
      </div>
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
      <p className="setting-hint" data-testid="add-word-rules">
        {t(language, "words.addRules")}
      </p>
      {addWordPreview ? (
        <div className="add-word-preview-list" data-testid="add-word-preview-list">
          {addWordPreview.isInvalid ? (
            <p className="add-word-preview add-word-preview-warning" data-testid="add-word-invalid-preview">
              {t(language, "words.inputInvalidPreview")}
            </p>
          ) : null}
          {addWordPreview.normalizedValue ? (
            <p className="add-word-preview" data-testid="add-word-normalized-preview">
              {normalizedPreviewLabel}
            </p>
          ) : null}
          {addWordPreview.duplicateMatch ? (
            <p className="add-word-preview add-word-preview-warning" data-testid="add-word-duplicate-preview">
              {duplicatePreviewLabel}
            </p>
          ) : null}
        </div>
      ) : null}
      {trainer.addWordError ? (
        <p className="inline-error" data-testid="add-word-error" role="alert" aria-live="assertive">
          {t(language, trainer.addWordError as "words.error.invalid" | "words.error.duplicate")}
        </p>
      ) : null}
    </section>
  );
}
