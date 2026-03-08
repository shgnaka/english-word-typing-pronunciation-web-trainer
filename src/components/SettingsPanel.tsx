import { displayLanguageOptions, t } from "../i18n";
import type { TrainerState } from "../features/trainer/useTrainer";

interface SettingsPanelProps {
  trainer: TrainerState;
}

export function SettingsPanel({ trainer }: SettingsPanelProps) {
  const language = trainer.displayLanguage;

  return (
    <>
      <div className="panel-header">
        <div>
          <p className="label">{t(language, "settings.title")}</p>
          <h2>{t(language, "settings.subtitle")}</h2>
        </div>
      </div>

      <div className="settings-grid">
        <section className="settings-group">
          <div className="settings-group-header">
            <span className="label">{t(language, "settings.sessionGroup")}</span>
          </div>
          <p className="setting-hint">{t(language, "settings.sessionApplyHint")}</p>
          <label>
            <span>{t(language, "settings.language")}</span>
            <div className="language-toggle" data-testid="language-toggle">
              {displayLanguageOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={trainer.displayLanguage === option.value ? "active" : "secondary"}
                  data-testid={`language-${option.value}`}
                  onClick={() => trainer.setDisplayLanguage(option.value)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </label>
          <label>
            <span>{t(language, "settings.wordsPerSession")}</span>
            <input
              aria-label={t(language, "settings.wordsPerSession")}
              data-testid="word-count-input"
              type="number"
              min={1}
              max={20}
              value={trainer.draftConfig.wordCount}
              onChange={(event) => trainer.handleConfigChange("wordCount", Number(event.target.value))}
            />
          </label>
          <label className="toggle">
            <input
              data-testid="shuffle-toggle"
              type="checkbox"
              checked={trainer.draftConfig.shuffle}
              onChange={(event) => trainer.handleConfigChange("shuffle", event.target.checked)}
            />
            <span>{t(language, "settings.shuffle")}</span>
          </label>
          <label className="toggle">
            <input
              data-testid="speech-toggle"
              type="checkbox"
              checked={trainer.draftConfig.speechEnabled}
              onChange={(event) => trainer.handleConfigChange("speechEnabled", event.target.checked)}
            />
            <span>{t(language, "settings.speech")}</span>
          </label>
          <label className="toggle">
            <input
              data-testid="browser-tts-toggle"
              type="checkbox"
              checked={trainer.draftConfig.browserTtsEnabled}
              disabled={!trainer.draftConfig.speechEnabled}
              onChange={(event) => trainer.handleConfigChange("browserTtsEnabled", event.target.checked)}
            />
            <span>{t(language, "settings.browserTts")}</span>
          </label>
          <p className="setting-hint">{t(language, "settings.browserTtsHelp")}</p>
          <p className="setting-hint">{t(language, "settings.browserTtsCachePolicy")}</p>
          <button
            type="button"
            className="secondary"
            data-testid="clear-browser-tts-cache-button"
            onClick={() => trainer.clearBrowserTtsCache()}
            disabled={trainer.isClearingBrowserTtsCache}
          >
            {t(language, "settings.browserTtsClear")}
          </button>
          {trainer.browserTtsCacheMessage ? (
            <p className="setting-hint" data-testid="browser-tts-cache-status" role="status" aria-live="polite">
              {trainer.browserTtsCacheMessage === "cleared"
                ? t(language, "settings.browserTtsCacheCleared")
                : t(language, "settings.browserTtsCacheClearFailed")}
            </p>
          ) : null}
        </section>

        <section className="settings-group">
          <div className="settings-group-header">
            <span className="label">{t(language, "settings.assistGroup")}</span>
          </div>
          <p className="setting-hint">{t(language, "settings.assistApplyHint")}</p>
          <label className="toggle">
            <input
              data-testid="keyboard-hint-toggle"
              type="checkbox"
              checked={trainer.draftConfig.showKeyboardHint}
              onChange={(event) => trainer.handleConfigChange("showKeyboardHint", event.target.checked)}
            />
            <span>{t(language, "settings.keyboardHint")}</span>
          </label>
          <label className="toggle">
            <input
              data-testid="finger-guide-toggle"
              type="checkbox"
              checked={trainer.draftConfig.showFingerGuide}
              onChange={(event) => trainer.handleConfigChange("showFingerGuide", event.target.checked)}
            />
            <span>{t(language, "settings.fingerGuide")}</span>
          </label>
        </section>
      </div>

      <div className={`settings-status ${trainer.hasPendingConfigChanges ? "pending" : ""}`} data-testid="settings-status">
        {trainer.hasPendingConfigChanges ? t(language, "settings.pending") : t(language, "settings.synced")}
      </div>

      <div className="cta-row">
        <button data-testid="apply-settings-button" onClick={trainer.applyConfigChanges} disabled={!trainer.hasPendingConfigChanges}>
          {t(language, "settings.apply")}
        </button>
        <button
          className="secondary"
          data-testid="discard-settings-button"
          onClick={trainer.discardConfigChanges}
          disabled={!trainer.hasPendingConfigChanges}
        >
          {t(language, "settings.discard")}
        </button>
      </div>
    </>
  );
}
