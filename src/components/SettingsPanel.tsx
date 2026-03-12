import type { ReactNode } from "react";
import { displayLanguageOptions, t } from "../i18n";
import type { TrainerState } from "../features/trainer/useTrainer";
import { ThemeSettingsSection } from "./ThemeSettingsSection";

interface SettingsPanelProps {
  trainer: TrainerState;
}

function SettingsGroupCard({
  title,
  timing,
  children,
  testId,
  className
}: {
  title: string;
  timing: string;
  children: ReactNode;
  testId: string;
  className?: string;
}) {
  return (
    <section className={`settings-group ${className ?? ""}`.trim()} data-testid={testId}>
      <div className="settings-group-header">
        <span className="label">{title}</span>
        <span className="settings-timing-pill">{timing}</span>
      </div>
      {children}
    </section>
  );
}

export function SettingsPanel({ trainer }: SettingsPanelProps) {
  const language = trainer.displayLanguage;
  return (
    <div className="settings-page">
      <div className="settings-grid">
        <SettingsGroupCard title={t(language, "settings.immediateGroup")} timing={t(language, "settings.appliesNow")} testId="settings-immediate-group">
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
          <button
            type="button"
            className="secondary settings-inline-button"
            data-testid="clear-browser-tts-cache-button"
            onClick={() => trainer.clearBrowserTtsCache()}
            disabled={trainer.isClearingBrowserTtsCache}
          >
            {t(language, "settings.browserTtsClear")}
          </button>
        </SettingsGroupCard>

        <SettingsGroupCard
          title={t(language, "settings.nextSessionGroup")}
          timing={t(language, "settings.appliesOnApply")}
          testId="settings-next-session-group"
          className="settings-group-next-session"
        >
          <div className="settings-option-list" data-testid="settings-next-session-options">
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
          </div>
          <div className="cta-row settings-group-actions settings-group-actions-compact">
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
