import { t } from "../i18n";
import type { TrainerState } from "../features/trainer/useTrainer";
import { themeAccentOptions, themeOptions } from "../theme";

interface ThemeSettingsSectionProps {
  trainer: TrainerState;
}

export function ThemeSettingsSection({ trainer }: ThemeSettingsSectionProps) {
  const language = trainer.displayLanguage;

  return (
    <section className="theme-settings-section" data-testid="theme-settings-section">
      <span className="theme-settings-copy">{t(language, "settings.theme")}</span>

      <div className="theme-option-grid" data-testid="theme-option-grid">
        {themeOptions.map((option) => (
          <button
            key={option.id}
            type="button"
            className={`theme-option-card ${trainer.themePreference.themeId === option.id ? "active" : "secondary"}`}
            data-testid={`theme-option-${option.id}`}
            onClick={() => trainer.setThemeId(option.id)}
          >
            <strong>{t(language, option.labelKey)}</strong>
          </button>
        ))}
      </div>

      <label className="theme-slider-field" htmlFor="theme-background-intensity">
        <span>{t(language, "settings.themeBackgroundIntensity")}</span>
        <div className="theme-slider-row">
          <input
            id="theme-background-intensity"
            data-testid="theme-background-intensity"
            type="range"
            min={0}
            max={100}
            step={1}
            value={trainer.themePreference.backgroundIntensity}
            onChange={(event) => trainer.setThemeBackgroundIntensity(Number(event.target.value))}
          />
          <strong data-testid="theme-background-intensity-value">{trainer.themePreference.backgroundIntensity}%</strong>
        </div>
      </label>

      <div className="theme-accent-group">
        <span>{t(language, "settings.themeAccent")}</span>
        <div className="theme-accent-options" data-testid="theme-accent-options">
          {themeAccentOptions.map((option) => (
            <button
              key={option.id}
              type="button"
              className={`theme-accent-chip ${trainer.themePreference.accent === option.id ? "active" : "secondary"}`}
              data-testid={`theme-accent-${option.id}`}
              onClick={() => trainer.setThemeAccent(option.id)}
            >
              {t(language, option.labelKey)}
            </button>
          ))}
        </div>
      </div>

      <div className="theme-settings-actions">
        <button type="button" className="secondary" data-testid="reset-theme-button" onClick={trainer.resetThemePreference}>
          {t(language, "settings.themeReset")}
        </button>
      </div>
    </section>
  );
}
