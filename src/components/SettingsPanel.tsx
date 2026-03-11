import type { ReactNode } from "react";
import { displayLanguageOptions, t } from "../i18n";
import type { TrainerState } from "../features/trainer/useTrainer";
import type { SessionConfig } from "../domain/types";
import { ThemeSettingsSection } from "./ThemeSettingsSection";

interface SettingsPanelProps {
  trainer: TrainerState;
}

function SettingsGroupCard({
  title,
  timing,
  hint,
  children,
  testId
}: {
  title: string;
  timing: string;
  hint: string;
  children: ReactNode;
  testId: string;
}) {
  return (
    <section className="settings-group" data-testid={testId}>
      <div className="settings-group-header">
        <span className="label">{title}</span>
        <span className="settings-timing-pill">{timing}</span>
      </div>
      <p className="setting-hint">{hint}</p>
      {children}
    </section>
  );
}

function formatSettingValue(language: TrainerState["displayLanguage"], key: keyof SessionConfig, value: SessionConfig[keyof SessionConfig]) {
  if (typeof value === "boolean") {
    return t(language, value ? "settings.valueOn" : "settings.valueOff");
  }

  if (key === "wordCount") {
    return String(value);
  }

  return String(value);
}

export function SettingsPanel({ trainer }: SettingsPanelProps) {
  const language = trainer.displayLanguage;
  const pendingSummaryItems = (["wordCount", "shuffle", "speechEnabled", "browserTtsEnabled"] as const)
    .filter((key) => trainer.config[key] !== trainer.draftConfig[key])
    .map((key) => ({
      key,
      label: t(
        language,
        key === "wordCount"
          ? "settings.wordsPerSession"
          : key === "shuffle"
          ? "settings.shuffle"
          : key === "speechEnabled"
          ? "settings.speech"
          : "settings.browserTts"
      ),
      before: formatSettingValue(language, key, trainer.config[key]),
      after: formatSettingValue(language, key, trainer.draftConfig[key])
    }));
  return (
    <div className="settings-page">
      <div className="panel-header">
        <div>
          <p className="label">{t(language, "settings.title")}</p>
          <h2>{t(language, "settings.subtitle")}</h2>
        </div>
      </div>

      <div className="settings-grid">
        <SettingsGroupCard
          title={t(language, "settings.immediateGroup")}
          timing={t(language, "settings.appliesNow")}
          hint={t(language, "settings.assistApplyHint")}
          testId="settings-immediate-group"
        >
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
          <ThemeSettingsSection trainer={trainer} />
          <label className="toggle">
            <input
              data-testid="word-reading-toggle"
              type="checkbox"
              checked={trainer.draftConfig.showWordReading}
              onChange={(event) => trainer.handleConfigChange("showWordReading", event.target.checked)}
            />
            <span>{t(language, "settings.wordReading")}</span>
          </label>
          <div className="settings-inline-tools">
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
          </div>
        </SettingsGroupCard>

        <SettingsGroupCard
          title={t(language, "settings.nextSessionGroup")}
          timing={t(language, "settings.appliesOnApply")}
          hint={t(language, "settings.sessionApplyHint")}
          testId="settings-next-session-group"
        >
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
          <div className={`settings-status ${trainer.hasPendingConfigChanges ? "pending" : ""}`} data-testid="settings-status">
            {trainer.hasPendingConfigChanges ? t(language, "settings.pending") : t(language, "settings.synced")}
            {trainer.hasPendingConfigChanges && pendingSummaryItems.length > 0 ? (
              <div className="settings-status-summary" data-testid="settings-status-summary">
                <strong>{t(language, "settings.pendingSummaryLabel")}</strong>
                <ul>
                  {pendingSummaryItems.map((item) => (
                    <li key={item.key}>
                      {item.label}: {item.before} {"->"} {item.after}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
          <div className="cta-row settings-group-actions">
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
        </SettingsGroupCard>
      </div>
    </div>
  );
}
