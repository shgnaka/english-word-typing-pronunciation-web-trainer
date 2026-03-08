import { useEffect } from "react";
import { useTrainer } from "./features/trainer/useTrainer";

function App() {
  const trainer = useTrainer();

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (trainer.screen !== "practice") {
        return;
      }

      const target = event.target;
      if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) {
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
          <h1>English typing with pronunciation and finger guidance.</h1>
          <p className="hero-copy">
            Practice one word at a time, hear the pronunciation, and follow the next-key hint on a US QWERTY layout.
          </p>
        </div>
        <nav className="tabs" aria-label="Primary">
          <button
            className={trainer.screen === "practice" ? "active" : ""}
            data-testid="tab-practice"
            onClick={() => trainer.setScreen("practice")}
          >
            Practice
          </button>
          <button className={trainer.screen === "words" ? "active" : ""} data-testid="tab-words" onClick={() => trainer.setScreen("words")}>
            Words
          </button>
          <button
            className={trainer.screen === "settings" ? "active" : ""}
            data-testid="tab-settings"
            onClick={() => trainer.setScreen("settings")}
          >
            Settings
          </button>
          <button className={trainer.screen === "results" ? "active" : ""} data-testid="tab-results" onClick={() => trainer.setScreen("results")}>
            Results
          </button>
        </nav>
      </header>

      <main className="grid">
        <section className="panel panel-primary">
          {trainer.screen === "practice" && (
            <>
              <div className="session-summary">
                <article className="metric">
                  <span className="label">Progress</span>
                  <strong data-testid="progress-count">
                    {trainer.completedWordsCount} / {trainer.totalWords || 0} words
                  </strong>
                </article>
                <article className="metric">
                  <span className="label">Remaining</span>
                  <strong data-testid="remaining-words">{trainer.remainingWords}</strong>
                </article>
              </div>

              <div className="progress-block">
                <div className="progress-copy">
                  <span className="label">Session progress</span>
                  <strong data-testid="progress-percent">{trainer.progressPercent}%</strong>
                </div>
                <div className="progress-track" aria-hidden="true">
                  <div className="progress-fill" data-testid="progress-fill" style={{ width: `${trainer.progressPercent}%` }} />
                </div>
              </div>

              <div className="panel-header">
                <div>
                  <p className="label">Current word</p>
                  <h2 data-testid="current-word">{currentWord || "No words available"}</h2>
                </div>
                <button
                  className="secondary"
                  data-testid="pronounce-button"
                  onClick={trainer.speakCurrentWord}
                  disabled={!currentWord || !trainer.config.speechEnabled}
                >
                  Pronounce
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
                  Start in {trainer.countdown}
                </div>
              ) : null}

              <div className="status-row">
                <article className="metric">
                  <span className="label">Next key</span>
                  <strong data-testid="next-key">{trainer.currentTarget || "-"}</strong>
                </article>
                <article className="metric">
                  <span className="label">Key position</span>
                  <strong data-testid="key-position">
                    {trainer.config.showKeyboardHint ? trainer.currentGuide?.keyPosition ?? "-" : "Hidden"}
                  </strong>
                </article>
                <article className="metric">
                  <span className="label">Finger</span>
                  <strong data-testid="finger-guide">{trainer.config.showFingerGuide ? trainer.currentGuide?.finger ?? "-" : "Hidden"}</strong>
                </article>
              </div>

              <div className={`feedback ${trainer.session.lastInputCorrect === false ? "error" : ""}`} data-testid="feedback">
                {trainer.isCountdownActive
                  ? "Get ready. Typing unlocks when the countdown finishes."
                  : trainer.session.lastInputCorrect === false
                  ? "Incorrect key. Stay on the highlighted character."
                  : "Type on your keyboard to progress."}
              </div>

              <div className="cta-row">
                <button onClick={() => trainer.restartSession()}>Restart session</button>
                <button className="secondary" onClick={() => trainer.setScreen("results")}>
                  View results
                </button>
              </div>
            </>
          )}

          {trainer.screen === "words" && (
            <>
              <div className="panel-header">
                <div>
                  <p className="label">Custom vocabulary</p>
                  <h2>Add your own practice words</h2>
                </div>
              </div>

              <div className="add-word-row">
                <input
                  data-testid="new-word-input"
                  value={trainer.inputValue}
                  onChange={(event) => trainer.setInputValue(event.target.value)}
                  placeholder="Enter an English word"
                  aria-label="New word"
                />
                <button data-testid="add-word-button" onClick={trainer.handleAddWord}>
                  Add word
                </button>
              </div>
              {trainer.addWordError ? (
                <p className="inline-error" data-testid="add-word-error">
                  {trainer.addWordError}
                </p>
              ) : null}

              <div className="word-list" data-testid="custom-word-list">
                {trainer.customWords.length === 0 ? (
                  <p>No custom words yet.</p>
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
                  <p className="label">Session settings</p>
                  <h2>Control practice conditions</h2>
                </div>
              </div>

              <div className="settings-grid">
                <label>
                  <span>Words per session</span>
                  <input
                    aria-label="Words per session"
                    data-testid="word-count-input"
                    type="number"
                    min={1}
                    max={20}
                    value={trainer.config.wordCount}
                    onChange={(event) => trainer.handleConfigChange("wordCount", Number(event.target.value))}
                  />
                </label>
                <label className="toggle">
                  <input
                    data-testid="shuffle-toggle"
                    type="checkbox"
                    checked={trainer.config.shuffle}
                    onChange={(event) => trainer.handleConfigChange("shuffle", event.target.checked)}
                  />
                  <span>Shuffle words</span>
                </label>
                <label className="toggle">
                  <input
                    data-testid="speech-toggle"
                    type="checkbox"
                    checked={trainer.config.speechEnabled}
                    onChange={(event) => trainer.handleConfigChange("speechEnabled", event.target.checked)}
                  />
                  <span>Enable pronunciation</span>
                </label>
                <label className="toggle">
                  <input
                    data-testid="keyboard-hint-toggle"
                    type="checkbox"
                    checked={trainer.config.showKeyboardHint}
                    onChange={(event) => trainer.handleConfigChange("showKeyboardHint", event.target.checked)}
                  />
                  <span>Show key position</span>
                </label>
                <label className="toggle">
                  <input
                    data-testid="finger-guide-toggle"
                    type="checkbox"
                    checked={trainer.config.showFingerGuide}
                    onChange={(event) => trainer.handleConfigChange("showFingerGuide", event.target.checked)}
                  />
                  <span>Show finger guide</span>
                </label>
              </div>

              <div className="cta-row">
                <button data-testid="apply-settings-button" onClick={() => trainer.restartSession(trainer.config)}>
                  Apply and restart
                </button>
              </div>
            </>
          )}

          {trainer.screen === "results" && (
            <>
              <div className="panel-header">
                <div>
                  <p className="label">Session score</p>
                  <h2>Review your typing result</h2>
                </div>
              </div>

              <div className="completion-banner" data-testid="completion-banner">
                Session complete. Nice finish.
              </div>

              <div className="status-row">
                <article className="metric">
                  <span className="label">WPM</span>
                  <strong data-testid="score-wpm">{trainer.score.wpm}</strong>
                </article>
                <article className="metric">
                  <span className="label">Accuracy</span>
                  <strong data-testid="score-accuracy">{trainer.score.accuracy}%</strong>
                </article>
                <article className="metric">
                  <span className="label">Score</span>
                  <strong data-testid="score-raw">{trainer.score.rawScore}</strong>
                </article>
                <article className="metric">
                  <span className="label">Level</span>
                  <strong data-testid="score-level">{trainer.score.level}</strong>
                </article>
              </div>

              <div className="results-list" data-testid="results-list">
                {trainer.session.completedWords.length === 0 ? (
                  <p>No completed words yet.</p>
                ) : (
                  trainer.session.completedWords.map((result) => (
                    <article key={`${result.word}-${result.elapsedMs}`} className="result-card" data-testid="result-card">
                      <h3>{result.word}</h3>
                      <p>{result.elapsedMs} ms</p>
                      <p>{result.mistakes} mistakes</p>
                    </article>
                  ))
                )}
              </div>

              <div className="cta-row">
                <button onClick={() => trainer.restartSession()}>Start new session</button>
              </div>
            </>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;
