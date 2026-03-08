import { useEffect } from "react";
import { keyboardRows } from "./domain/keyboard";
import { FingerGuideButtons } from "./components/FingerGuideButtons";
import { useTrainer } from "./features/trainer/useTrainer";
import { displayLanguageOptions, getFingerLabel, t } from "./i18n";

function isInteractiveElement(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) {
    return false;
  }

  return Boolean(target.closest("input, textarea, button, select, a, [contenteditable='true'], [role='button']"));
}

function App() {
  const trainer = useTrainer();
  const language = trainer.displayLanguage;

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (trainer.screen !== "practice") {
        return;
      }

      if (trainer.isCountdownActive && event.key === "Enter") {
        event.preventDefault();
        trainer.skipCountdown();
        return;
      }

      if (isInteractiveElement(event.target)) {
        return;
      }

      trainer.handleKeyInput(event.key);
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [trainer]);

  const currentWord = trainer.session.currentWord?.text ?? "";

  return (
    <div className="app-shell">
      <header className="hero">
        <div>
          <p className="eyebrow">WordBeat Trainer</p>
          <h1>{t(language, "hero.title")}</h1>
          <p className="hero-copy">{t(language, "hero.copy")}</p>
        </div>
        <nav className="tabs" aria-label="Primary">
          <button
            className={trainer.screen === "practice" ? "active" : ""}
            data-testid="tab-practice"
            onClick={() => trainer.setScreen("practice")}
          >
            {t(language, "tabs.practice")}
          </button>
          <button className={trainer.screen === "words" ? "active" : ""} data-testid="tab-words" onClick={() => trainer.setScreen("words")}>
            {t(language, "tabs.words")}
          </button>
          <button
            className={trainer.screen === "settings" ? "active" : ""}
            data-testid="tab-settings"
            onClick={() => trainer.setScreen("settings")}
          >
            {t(language, "tabs.settings")}
          </button>
          <button className={trainer.screen === "results" ? "active" : ""} data-testid="tab-results" onClick={() => trainer.setScreen("results")}>
            {t(language, "tabs.results")}
          </button>
        </nav>
      </header>

      <main className="grid">
        <section className="panel panel-primary">
          {trainer.screen === "practice" && (
            <>
              <div className="session-summary">
                <article className="metric">
                  <span className="label">{t(language, "practice.progress")}</span>
                  <strong data-testid="progress-count">
                    {trainer.completedWordsCount} / {trainer.totalWords || 0} words
                  </strong>
                </article>
                <article className="metric">
                  <span className="label">{t(language, "practice.remaining")}</span>
                  <strong data-testid="remaining-words">{trainer.remainingWords}</strong>
                </article>
              </div>

              <div className="progress-block">
                <div className="progress-copy">
                  <span className="label">{t(language, "practice.sessionProgress")}</span>
                  <strong data-testid="progress-percent">{trainer.progressPercent}%</strong>
                </div>
                <div className="progress-track" aria-hidden="true">
                  <div className="progress-fill" data-testid="progress-fill" style={{ width: `${trainer.progressPercent}%` }} />
                </div>
              </div>

              <div className="panel-header">
                <div>
                  <p className="label">{t(language, "practice.currentWord")}</p>
                  <h2 data-testid="current-word">{currentWord || t(language, "practice.noWords")}</h2>
                </div>
                <button
                  className="secondary"
                  data-testid="pronounce-button"
                  onClick={trainer.speakCurrentWord}
                  disabled={!currentWord || !trainer.config.speechEnabled}
                >
                  {t(language, "practice.pronounce")}
                </button>
              </div>

              <div className="word-display" aria-live="polite" data-testid="word-display">
                {currentWord.split("").map((char, index) => {
                  const status =
                    index < trainer.session.charIndex ? "done" : index === trainer.session.charIndex ? "target" : "todo";
                  return (
                    <span key={`${char}-${index}`} className={`char ${status}`}>
                      {char}
                    </span>
                  );
                })}
              </div>

              {trainer.isCountdownActive ? (
                <div className="countdown-banner" data-testid="countdown-banner" aria-live="polite">
                  <span>{t(language, "practice.countdown")} {trainer.countdown}</span>
                  <button className="secondary inline-action" data-testid="skip-countdown-button" onClick={trainer.skipCountdown}>
                    {t(language, "practice.startNow")}
                  </button>
                </div>
              ) : null}

              <div className="status-row">
                <article className="metric">
                  <span className="label">{t(language, "practice.nextKey")}</span>
                  <strong data-testid="next-key">{trainer.currentTarget || "-"}</strong>
                </article>
                <article className="metric">
                  <span className="label">{t(language, "practice.keyPosition")}</span>
                  <strong data-testid="key-position">
                    {trainer.config.showKeyboardHint ? trainer.currentGuide?.keyPosition ?? "-" : "Hidden"}
                  </strong>
                </article>
                <article className="metric">
                  <span className="label">{t(language, "practice.finger")}</span>
                  <strong data-testid="finger-guide">
                    {trainer.config.showFingerGuide
                      ? trainer.currentGuide
                        ? getFingerLabel(language, trainer.currentGuide.fingerId, trainer.currentGuide.finger)
                        : "-"
                      : "Hidden"}
                  </strong>
                </article>
              </div>

              {trainer.config.showKeyboardHint || trainer.config.showFingerGuide ? (
                <div className="guide-visuals">
                  {trainer.config.showKeyboardHint ? (
                    <section className="guide-card" data-testid="keyboard-visual">
                      <div className="guide-card-header">
                        <span className="label">{t(language, "practice.keyboardMap")}</span>
                        <strong>{trainer.currentTarget ? `Key ${trainer.currentTarget.toUpperCase()}` : t(language, "practice.noKey")}</strong>
                      </div>
                      <div className="keyboard-map" aria-label="Keyboard guide">
                        {keyboardRows.map((row, rowIndex) => (
                          <div key={row.join("")} className={`keyboard-row row-${rowIndex}`}>
                            {row.map((key) => (
                              <span
                                key={key}
                                className={`keycap ${trainer.currentTarget === key ? "active" : ""}`}
                                data-testid={trainer.currentTarget === key ? "active-keycap" : undefined}
                              >
                                {key.toUpperCase()}
                              </span>
                            ))}
                          </div>
                        ))}
                      </div>
                    </section>
                  ) : null}

                  {trainer.config.showFingerGuide ? (
                    <FingerGuideButtons
                      activeFingerId={trainer.currentGuide?.fingerId ?? null}
                      label={
                        trainer.currentGuide
                          ? getFingerLabel(language, trainer.currentGuide.fingerId, trainer.currentGuide.finger)
                          : t(language, "practice.noFinger")
                      }
                      language={language}
                    />
                  ) : null}
                </div>
              ) : null}

              <div className={`feedback ${trainer.session.lastInputCorrect === false ? "error" : ""}`} data-testid="feedback">
                {trainer.isCountdownActive
                  ? t(language, "practice.feedback.ready")
                  : trainer.session.lastInputCorrect === false
                  ? t(language, "practice.feedback.incorrect")
                  : t(language, "practice.feedback.default")}
              </div>

              <div className="cta-row">
                <button onClick={() => trainer.restartSession()}>{t(language, "practice.restart")}</button>
                <button className="secondary" onClick={() => trainer.setScreen("results")}>
                  {t(language, "practice.viewResults")}
                </button>
              </div>
            </>
          )}

          {trainer.screen === "words" && (
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
          )}

          {trainer.screen === "settings" && (
            <>
              <div className="panel-header">
                <div>
                  <p className="label">{t(language, "settings.title")}</p>
                  <h2>{t(language, "settings.subtitle")}</h2>
                </div>
              </div>

              <div className="settings-grid">
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
              </div>

              <div className={`settings-status ${trainer.hasPendingConfigChanges ? "pending" : ""}`} data-testid="settings-status">
                {trainer.hasPendingConfigChanges
                  ? t(language, "settings.pending")
                  : t(language, "settings.synced")}
              </div>

              <div className="cta-row">
                <button
                  data-testid="apply-settings-button"
                  onClick={trainer.applyConfigChanges}
                  disabled={!trainer.hasPendingConfigChanges}
                >
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
          )}

          {trainer.screen === "results" && (
            <>
              <div className="panel-header">
                <div>
                  <p className="label">{t(language, "results.title")}</p>
                  <h2>{t(language, "results.subtitle")}</h2>
                </div>
              </div>

              <div className="completion-banner" data-testid="completion-banner">
                {t(language, "results.complete")}
              </div>

              <div className="status-row">
                <article className="metric">
                  <span className="label">{t(language, "results.wpm")}</span>
                  <strong data-testid="score-wpm">{trainer.score.wpm}</strong>
                </article>
                <article className="metric">
                  <span className="label">{t(language, "results.accuracy")}</span>
                  <strong data-testid="score-accuracy">{trainer.score.accuracy}%</strong>
                </article>
                <article className="metric">
                  <span className="label">{t(language, "results.score")}</span>
                  <strong data-testid="score-raw">{trainer.score.rawScore}</strong>
                </article>
                <article className="metric">
                  <span className="label">{t(language, "results.level")}</span>
                  <strong data-testid="score-level">{trainer.score.level}</strong>
                </article>
              </div>

              <div className="results-list" data-testid="results-list">
                {trainer.session.completedWords.length === 0 ? (
                  <p>{t(language, "results.empty")}</p>
                ) : (
                  trainer.session.completedWords.map((result) => (
                    <article key={`${result.word}-${result.elapsedMs}`} className="result-card" data-testid="result-card">
                      <h3>{result.word}</h3>
                      <p>{result.elapsedMs} ms</p>
                      <p>{result.mistakes} {t(language, "results.mistakes")}</p>
                    </article>
                  ))
                )}
              </div>

              <div className="cta-row">
                <button onClick={() => trainer.restartSession()}>{t(language, "results.startNew")}</button>
              </div>
            </>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;
