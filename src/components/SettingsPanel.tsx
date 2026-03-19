import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import { displayLanguageOptions, formatMessage, t } from "../i18n";
import type { SessionConfig } from "../domain/types";
import type { TrainerState } from "../features/trainer/useTrainer";
import type { ProfileManagerState } from "../features/profile/useProfileManager";
import { ThemeSettingsSection } from "./ThemeSettingsSection";

interface SettingsPanelProps {
  trainer: TrainerState;
  profileManager: ProfileManagerState;
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

interface PendingSettingChange {
  id: string;
  label: string;
  before: string;
  after: string;
}

function formatBooleanSetting(language: TrainerState["displayLanguage"], value: boolean): string {
  return value ? t(language, "settings.valueOn") : t(language, "settings.valueOff");
}

function buildPendingSettingChanges(
  language: TrainerState["displayLanguage"],
  config: SessionConfig,
  draftConfig: SessionConfig
): PendingSettingChange[] {
  const changes: PendingSettingChange[] = [];

  if (config.wordCount !== draftConfig.wordCount) {
    changes.push({
      id: "word-count",
      label: t(language, "settings.wordsPerSession"),
      before: String(config.wordCount),
      after: String(draftConfig.wordCount)
    });
  }

  if (config.shuffle !== draftConfig.shuffle) {
    changes.push({
      id: "shuffle",
      label: t(language, "settings.shuffle"),
      before: formatBooleanSetting(language, config.shuffle),
      after: formatBooleanSetting(language, draftConfig.shuffle)
    });
  }

  if (config.speechEnabled !== draftConfig.speechEnabled) {
    changes.push({
      id: "speech",
      label: t(language, "settings.speech"),
      before: formatBooleanSetting(language, config.speechEnabled),
      after: formatBooleanSetting(language, draftConfig.speechEnabled)
    });
  }

  if (config.browserTtsEnabled !== draftConfig.browserTtsEnabled) {
    changes.push({
      id: "browser-tts",
      label: t(language, "settings.browserTts"),
      before: formatBooleanSetting(language, config.browserTtsEnabled),
      after: formatBooleanSetting(language, draftConfig.browserTtsEnabled)
    });
  }

  return changes;
}

function SettingsStatusCard({
  language,
  config,
  draftConfig,
  className
}: {
  language: TrainerState["displayLanguage"];
  config: SessionConfig;
  draftConfig: SessionConfig;
  className?: string;
}) {
  const pendingSettingChanges = useMemo(() => buildPendingSettingChanges(language, config, draftConfig), [language, config, draftConfig]);
  const hasPendingChanges = pendingSettingChanges.length > 0;

  return (
    <section className={`settings-status ${className ?? ""} ${hasPendingChanges ? "pending" : ""}`.trim()} data-testid="settings-status" role="status" aria-live="polite">
      <div className="settings-status-summary">
        <strong data-testid="settings-status-message">{hasPendingChanges ? t(language, "settings.pending") : t(language, "settings.synced")}</strong>
        {hasPendingChanges ? (
          <ul data-testid="settings-status-summary">
            {pendingSettingChanges.map((change) => (
              <li key={change.id}>
                <span className="settings-status-change-label">{change.label}</span>
                <span className="settings-status-change-values">
                  {change.before} → {change.after}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="setting-hint">{t(language, "settings.sessionApplyHint")}</p>
        )}
      </div>
    </section>
  );
}

interface ProfileMetaItem {
  id: string;
  label: string;
  value: string;
}

function formatProfileTimestamp(value: string, language: TrainerState["displayLanguage"]): string {
  const locale = language === "en" ? "en-US" : "ja-JP";
  return new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}

function ProfileMetaList({
  profileId,
  items
}: {
  profileId: string;
  items: ProfileMetaItem[];
}) {
  return (
    <dl className="profile-card-meta-list" data-testid={`profile-meta-list-${profileId}`}>
      {items.map((item) => (
        <div className="profile-card-meta-item" key={item.id} data-testid={`profile-meta-item-${item.id}-${profileId}`}>
          <dt>{item.label}</dt>
          <dd>{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}

function ProfileCard({
  profile,
  language,
  isCurrent,
  canDelete,
  onSelect,
  onRename,
  onDelete
}: {
  profile: ProfileManagerState["profiles"][number];
  language: TrainerState["displayLanguage"];
  isCurrent: boolean;
  canDelete: boolean;
  onSelect: () => void;
  onRename: (name: string) => void;
  onDelete: () => void;
}) {
  const [draftName, setDraftName] = useState(profile.name);
  const isCompact = !isCurrent;
  const metaItems = [
    {
      id: "updated-at",
      label: t(language, "settings.profileUpdatedAt"),
      value: formatProfileTimestamp(profile.updatedAt, language)
    }
  ];

  useEffect(() => {
    setDraftName(profile.name);
  }, [profile.id, profile.name]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onRename(draftName);
  }

  return (
    <article
      className={`profile-card ${isCurrent ? "profile-card-current" : "profile-card-compact"}`.trim()}
      data-testid={isCurrent ? "profile-card-current" : `profile-card-${profile.id}`}
    >
      <div className="profile-card-header">
        <div className="profile-card-title-group">
          <span className="label">{t(language, "settings.profileName")}</span>
          <strong>{profile.name}</strong>
        </div>
        {isCurrent ? <span className="profile-card-badge">{t(language, "settings.profileActive")}</span> : null}
      </div>
      <ProfileMetaList profileId={profile.id} items={metaItems} />

      {isCompact ? null : (
        <form className="profile-card-form" onSubmit={handleSubmit}>
          <label>
            <span className="sr-only">{t(language, "settings.profileName")}</span>
            <input
              data-testid={`profile-name-input-${profile.id}`}
              value={draftName}
              onChange={(event) => setDraftName(event.target.value)}
              onBlur={() => onRename(draftName)}
            />
          </label>

          <div className="profile-card-actions">
            <button
              type="submit"
              className="secondary"
              data-testid={`save-profile-name-button-${profile.id}`}
              disabled={draftName.trim().length === 0 || draftName.trim() === profile.name}
            >
              {t(language, "settings.profileRename")}
            </button>
            <button
              type="button"
              className="secondary"
              data-testid={`delete-profile-button-${profile.id}`}
              onClick={onDelete}
              disabled={!canDelete}
            >
              {t(language, "settings.profileDelete")}
            </button>
          </div>
        </form>
      )}

      {isCompact ? (
        <div className="profile-card-actions profile-card-actions-compact">
          <button type="button" className="secondary" data-testid={`switch-profile-button-${profile.id}`} onClick={onSelect}>
            {t(language, "settings.profileSwitch")}
          </button>
          <button
            type="button"
            className="secondary"
            data-testid={`delete-profile-button-${profile.id}`}
            onClick={onDelete}
            disabled={!canDelete}
          >
            {t(language, "settings.profileDelete")}
          </button>
        </div>
      ) : null}
    </article>
  );
}

export function SettingsPanel({ trainer, profileManager }: SettingsPanelProps) {
  const language = trainer.displayLanguage;
  const profileCards = useMemo(
    () => [
      profileManager.currentProfile,
      ...profileManager.profiles.filter((profile) => profile.id !== profileManager.currentProfile.id)
    ],
    [profileManager.currentProfile, profileManager.profiles]
  );

  return (
    <div className="settings-page">
      <header className="settings-page-header">
        <div className="settings-page-heading">
          <span className="label">{t(language, "settings.title")}</span>
          <h2>{t(language, "settings.subtitle")}</h2>
        </div>
      </header>

      <div className="settings-grid">
        <SettingsGroupCard
          title={t(language, "settings.profileGroup")}
          timing={t(language, "settings.appliesNow")}
          testId="settings-profile-group"
          className="settings-profile-group"
        >
          <p className="setting-hint">{t(language, "settings.profileHelp")}</p>
          <div className="profile-card-list" data-testid="profile-card-list">
            {profileCards.map((profile) => (
              <ProfileCard
                key={profile.id}
                profile={profile}
                language={language}
                isCurrent={profile.id === profileManager.currentProfile.id}
                canDelete={profileManager.profiles.length > 1}
                onSelect={() => profileManager.selectProfile(profile.id)}
                onRename={(name) => profileManager.renameProfile(profile.id, name)}
                onDelete={() => {
                  if (profileManager.profiles.length <= 1) {
                    return;
                  }

                  const confirmed = window.confirm(
                    formatMessage(language, "settings.profileDeleteConfirm", {
                      name: profile.name
                    })
                  );

                  if (!confirmed) {
                    return;
                  }

                  profileManager.deleteProfile(profile.id);
                }}
              />
            ))}
          </div>
          {profileManager.profiles.length <= 1 ? (
            <p className="setting-hint" data-testid="profile-delete-hint">
              {t(language, "settings.profileDeleteDisabled")}
            </p>
          ) : null}
          <button
            type="button"
            className="secondary settings-inline-button"
            data-testid="create-profile-button"
            onClick={profileManager.createProfile}
          >
            {t(language, "settings.profileCreate")}
          </button>
        </SettingsGroupCard>

        <SettingsGroupCard
          title={t(language, "settings.immediateGroup")}
          timing={t(language, "settings.appliesNow")}
          testId="settings-immediate-group"
          className="settings-immediate-group"
        >
          <p className="setting-hint">{t(language, "settings.assistApplyHint")}</p>
          <div className="settings-stack">
            <label className="settings-control-block">
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
            <div className="settings-control-grid">
              <label className="toggle settings-control-block">
                <input
                  data-testid="keyboard-hint-toggle"
                  type="checkbox"
                  checked={trainer.draftConfig.showKeyboardHint}
                  onChange={(event) => trainer.handleConfigChange("showKeyboardHint", event.target.checked)}
                />
                <span>{t(language, "settings.keyboardHint")}</span>
              </label>
              <label className="toggle settings-control-block">
                <input
                  data-testid="finger-guide-toggle"
                  type="checkbox"
                  checked={trainer.draftConfig.showFingerGuide}
                  onChange={(event) => trainer.handleConfigChange("showFingerGuide", event.target.checked)}
                />
                <span>{t(language, "settings.fingerGuide")}</span>
              </label>
              <label className="toggle settings-control-block">
                <input
                  data-testid="word-reading-toggle"
                  type="checkbox"
                  checked={trainer.draftConfig.showWordReading}
                  onChange={(event) => trainer.handleConfigChange("showWordReading", event.target.checked)}
                />
                <span>{t(language, "settings.wordReading")}</span>
              </label>
            </div>
            <ThemeSettingsSection trainer={trainer} />
            <div className="settings-control-block settings-audio-tools">
              <span className="label">{t(language, "settings.audioToolsGroup")}</span>
              <button
                type="button"
                className="secondary settings-inline-button"
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
          </div>
        </SettingsGroupCard>

        <SettingsGroupCard
          title={t(language, "settings.nextSessionGroup")}
          timing={t(language, "settings.appliesOnApply")}
          testId="settings-next-session-group"
        >
          <p className="setting-hint">{t(language, "settings.sessionApplyHint")}</p>
          <div className="settings-stack">
            <SettingsStatusCard
              language={language}
              config={trainer.config}
              draftConfig={trainer.draftConfig}
              className="settings-control-block"
            />
            <div className="settings-control-grid" data-testid="settings-next-session-options">
              <label className="toggle settings-control-block">
                <input
                  data-testid="speech-toggle"
                  type="checkbox"
                  checked={trainer.draftConfig.speechEnabled}
                  onChange={(event) => trainer.handleConfigChange("speechEnabled", event.target.checked)}
                />
                <span>{t(language, "settings.speech")}</span>
              </label>
              <label className="toggle settings-control-block">
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
            <div className="cta-row settings-control-block settings-group-actions settings-group-actions-compact">
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
          </div>
        </SettingsGroupCard>
      </div>
    </div>
  );
}
