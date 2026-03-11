import { useEffect, useRef } from "react";
import type { KeyboardEvent as ReactKeyboardEvent, MouseEvent as ReactMouseEvent } from "react";
import { PracticePanel } from "./components/PracticePanel";
import { ResultsPanel } from "./components/ResultsPanel";
import { SettingsPanel } from "./components/SettingsPanel";
import { WordsPanel } from "./components/WordsPanel";
import { useTrainer } from "./features/trainer/useTrainer";
import { t } from "./i18n";
import { buildThemeStyleProperties, getThemeColorScheme } from "./theme";

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
    if (trainer.screen !== "practice") {
      return;
    }

    primaryPanelRef.current?.focus();
  }, [trainer.screen]);

  useEffect(() => {
    const shouldScrollIntoPracticePanel = trainer.screen === "practice" && trainer.isTypingActiveLayout && wasCountdownActiveRef.current;
    let firstFrameId: number | null = null;
    let secondFrameId: number | null = null;

    if (shouldScrollIntoPracticePanel) {
      firstFrameId = window.requestAnimationFrame(() => {
        secondFrameId = window.requestAnimationFrame(() => {
          const panel = primaryPanelRef.current;
          if (!panel) {
            return;
          }

          const top = panel.getBoundingClientRect().top + window.scrollY;
          window.scrollTo({
            top,
            behavior: "smooth"
          });
        });
      });
    }

    wasCountdownActiveRef.current = trainer.isCountdownActive;

    return () => {
      if (firstFrameId !== null) {
        window.cancelAnimationFrame(firstFrameId);
      }
      if (secondFrameId !== null) {
        window.cancelAnimationFrame(secondFrameId);
      }
    };
  }, [trainer.isCountdownActive, trainer.isTypingActiveLayout, trainer.screen]);

  useEffect(() => {
    const root = document.documentElement;
    const themeVariables = buildThemeStyleProperties(trainer.themePreference);
    const colorScheme = getThemeColorScheme(trainer.themePreference.themeId);

    root.dataset.theme = trainer.themePreference.themeId;
    root.dataset.colorScheme = colorScheme;
    Object.entries(themeVariables).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });

    return () => {
      delete root.dataset.theme;
      delete root.dataset.colorScheme;
      Object.keys(themeVariables).forEach((key) => {
        root.style.removeProperty(key);
      });
    };
  }, [trainer.themePreference]);

  function handlePracticePanelKeyDown(event: ReactKeyboardEvent<HTMLElement>) {
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

  function handlePracticePanelClick(event: ReactMouseEvent<HTMLElement>) {
    if (trainer.screen !== "practice") {
      return;
    }

    if (!isInteractiveElement(event.target)) {
      return;
    }

    primaryPanelRef.current?.focus();
  }

  return (
    <div className="app-shell" data-testid="app-shell">
      <nav className="tabs" aria-label="Primary" data-testid="app-tabs">
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

      <main className="grid">
        <section
          ref={primaryPanelRef}
          className="panel panel-primary"
          data-testid="primary-panel"
          tabIndex={trainer.screen === "practice" ? -1 : undefined}
          onKeyDown={handlePracticePanelKeyDown}
          onClick={handlePracticePanelClick}
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
