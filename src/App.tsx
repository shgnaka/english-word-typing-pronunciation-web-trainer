import { useEffect, useRef } from "react";
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
  const primaryPanelRef = useRef<HTMLElement | null>(null);
  const wasCountdownActiveRef = useRef(trainer.isCountdownActive);

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

  useEffect(() => {
    const shouldScrollIntoPracticePanel = trainer.screen === "practice" && trainer.isTypingActiveLayout && wasCountdownActiveRef.current;

    if (shouldScrollIntoPracticePanel) {
      primaryPanelRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
    }

    wasCountdownActiveRef.current = trainer.isCountdownActive;
  }, [trainer.isCountdownActive, trainer.isTypingActiveLayout, trainer.screen]);

  return (
    <div className={`app-shell ${trainer.isPracticeFocused ? "practice-focused-shell" : ""}`} data-testid="app-shell">
      <header className={`hero ${trainer.isPracticeFocused ? "practice-focused-hero" : ""}`} data-testid="app-hero">
        <div>
          <p className="eyebrow">WordBeat Trainer</p>
          <h1>{t(language, "hero.title")}</h1>
          <p className="hero-copy">{t(language, "hero.copy")}</p>
        </div>
        <nav className={`tabs ${trainer.isPracticeFocused ? "practice-focused-tabs" : ""}`} aria-label="Primary" data-testid="app-tabs">
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
        <section
          ref={primaryPanelRef}
          className={`panel panel-primary ${trainer.isPracticeFocused ? "practice-focused-panel" : ""}`}
          data-testid="primary-panel"
        >
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
