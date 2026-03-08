import { useEffect } from "react";
import { PracticePanel } from "./components/PracticePanel";
import { ResultsPanel } from "./components/ResultsPanel";
import { SettingsPanel } from "./components/SettingsPanel";
import { WordsPanel } from "./components/WordsPanel";
import { useTrainer } from "./features/trainer/useTrainer";
import { t } from "./i18n";

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

  return (
    <div className="app-shell">
      <header className="hero">
        <div>
          <p className="eyebrow">WordBeat Trainer</p>
          <h1>{t(language, "hero.title")}</h1>
          <p className="hero-copy">{t(language, "hero.copy")}</p>
        </div>
        <nav className="tabs" aria-label="Primary">
          <button className={trainer.screen === "practice" ? "active" : ""} data-testid="tab-practice" onClick={() => trainer.setScreen("practice")}>
            {t(language, "tabs.practice")}
          </button>
          <button className={trainer.screen === "words" ? "active" : ""} data-testid="tab-words" onClick={() => trainer.setScreen("words")}>
            {t(language, "tabs.words")}
          </button>
          <button className={trainer.screen === "settings" ? "active" : ""} data-testid="tab-settings" onClick={() => trainer.setScreen("settings")}>
            {t(language, "tabs.settings")}
          </button>
          <button className={trainer.screen === "results" ? "active" : ""} data-testid="tab-results" onClick={() => trainer.setScreen("results")}>
            {t(language, "tabs.results")}
          </button>
        </nav>
      </header>

      <main className="grid">
        <section className="panel panel-primary">
          {trainer.screen === "practice" ? <PracticePanel trainer={trainer} /> : null}
          {trainer.screen === "words" ? <WordsPanel trainer={trainer} /> : null}
          {trainer.screen === "settings" ? <SettingsPanel trainer={trainer} /> : null}
          {trainer.screen === "results" ? <ResultsPanel trainer={trainer} /> : null}
        </section>
      </main>
    </div>
  );
}

export default App;
