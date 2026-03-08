import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { fireEvent } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import App from "./App";

const scrollIntoViewMock = vi.fn();

beforeEach(() => {
  window.localStorage.clear();
  scrollIntoViewMock.mockReset();
  Object.defineProperty(window, "speechSynthesis", {
    writable: true,
    value: {
      cancel: vi.fn(),
      speak: vi.fn()
    }
  });
  Object.defineProperty(window, "SpeechSynthesisUtterance", {
    writable: true,
    value: function MockUtterance(this: { text?: string; lang?: string }, text: string) {
      this.text = text;
      this.lang = "en-US";
    }
  });
  Object.defineProperty(HTMLElement.prototype, "scrollIntoView", {
    configurable: true,
    value: scrollIntoViewMock
  });
});

function getSpeechSynthesisMock() {
  return window.speechSynthesis as unknown as { cancel: ReturnType<typeof vi.fn>; speak: ReturnType<typeof vi.fn> };
}

afterEach(() => {
  cleanup();
});

describe("App", () => {
  it("adds a custom word", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "Words" }));
    await user.type(screen.getByLabelText("New word"), "banana");
    await user.click(screen.getByRole("button", { name: "Add word" }));

    expect(screen.getByText("banana")).toBeInTheDocument();
  });

  it("shows key guidance on the practice screen", () => {
    render(<App />);

    expect(screen.queryByTestId("next-key")).not.toBeInTheDocument();
    expect(screen.queryByTestId("finger-guide")).not.toBeInTheDocument();
    expect(screen.getByTestId("keyboard-visual")).toBeInTheDocument();
    expect(screen.getByTestId("finger-button-visual")).toBeInTheDocument();
    expect(screen.getByTestId("active-keycap")).toHaveTextContent("A");
    expect(screen.getByTestId("finger-button-label")).toHaveTextContent("Left pinky");
    expect(screen.getByTestId("active-finger-button")).toHaveAttribute("data-finger-id", "left-pinky");
  });

  it("shows countdown and progress before typing starts", () => {
    vi.useFakeTimers();
    render(<App />);

    expect(screen.getByTestId("countdown-banner")).toHaveTextContent("Start in 3");
    expect(screen.getByTestId("progress-count")).toHaveTextContent("0 / 10 words");
    expect(screen.getByTestId("remaining-words")).toHaveTextContent("10");
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it("adds a custom word when Enter is pressed", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "Words" }));
    await user.type(screen.getByLabelText("New word"), "banana{enter}");

    expect(screen.getByText("banana")).toBeInTheDocument();
  });

  it("skips countdown when Enter is pressed", () => {
    render(<App />);

    fireEvent.keyDown(window, { key: "Enter" });

    expect(screen.queryByTestId("countdown-banner")).not.toBeInTheDocument();
    expect(screen.getByTestId("feedback")).toHaveTextContent("Keep typing.");
  });

  it("auto pronounces the first word when typing becomes available", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByTestId("skip-countdown-button"));

    expect(getSpeechSynthesisMock().speak).toHaveBeenCalledTimes(1);
  });

  it("auto pronounces the next word after completing the current one", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByTestId("skip-countdown-button"));
    await user.keyboard("apple");

    expect(getSpeechSynthesisMock().speak).toHaveBeenCalledTimes(2);
  });

  it("resumes typing after a practice action button is clicked", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByTestId("skip-countdown-button"));
    await user.click(screen.getByRole("button", { name: "Pronounce" }));
    await user.keyboard("a");

    expect(screen.getByTestId("active-keycap")).toHaveTextContent("P");
  });

  it("persists the browser pronunciation toggle after reload", async () => {
    const user = userEvent.setup();
    const { unmount } = render(<App />);

    await user.click(screen.getByRole("button", { name: "Settings" }));
    await user.click(screen.getByTestId("browser-tts-toggle"));
    await user.click(screen.getByTestId("apply-settings-button"));

    unmount();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "Settings" }));
    expect(screen.getByTestId("browser-tts-toggle")).toBeChecked();
  });

  it("keeps settings as pending until they are applied", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "Settings" }));
    fireEvent.change(screen.getByLabelText("Words per session"), { target: { value: "1" } });

    expect(screen.getByTestId("settings-status")).toHaveTextContent("You have unapplied changes.");

    await user.click(screen.getByTestId("apply-settings-button"));

    expect(screen.getByTestId("progress-count")).toHaveTextContent("0 / 1 words");
  });

  it("discards pending settings changes", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "Settings" }));
    await user.click(screen.getByTestId("shuffle-toggle"));
    await user.click(screen.getByTestId("discard-settings-button"));

    expect(screen.getByTestId("shuffle-toggle")).not.toBeChecked();
    expect(screen.getByTestId("settings-status")).toHaveTextContent("Current session already matches these settings.");
  });

  it("updates the finger button guide as typing advances", () => {
    render(<App />);

    fireEvent.keyDown(window, { key: "Enter" });
    fireEvent.keyDown(window, { key: "a" });

    expect(screen.getByTestId("active-finger-button")).toHaveAttribute("data-finger-id", "right-pinky");
  });

  it("surfaces mistyped keys across the practice guidance", () => {
    render(<App />);

    fireEvent.keyDown(window, { key: "Enter" });
    fireEvent.keyDown(window, { key: "z" });

    expect(screen.getByTestId("feedback")).toHaveTextContent("Wrong key: Z. Keep aiming for the highlighted letter.");
    expect(screen.getByTestId("target-char")).toHaveClass("error");
    expect(screen.getByTestId("mistyped-keycap")).toHaveTextContent("Z");
    expect(screen.getByTestId("mistyped-keycap")).toHaveClass("mistyped");
    expect(screen.getByTestId("active-keycap")).toHaveClass("target-outline");
    expect(screen.getByTestId("active-finger-button")).toHaveClass("target-outline");
    expect(screen.getByTestId("active-finger-button")).not.toHaveClass("active");
  });

  it("clears mistype emphasis after the next correct key", () => {
    render(<App />);

    fireEvent.keyDown(window, { key: "Enter" });
    fireEvent.keyDown(window, { key: "z" });
    fireEvent.keyDown(window, { key: "a" });

    expect(screen.getByTestId("feedback")).toHaveTextContent("Keep typing.");
    expect(screen.getByTestId("target-char")).not.toHaveClass("error");
    expect(screen.queryByTestId("mistyped-keycap")).not.toBeInTheDocument();
    expect(screen.getByTestId("active-keycap")).not.toHaveClass("target-outline");
    expect(screen.getByTestId("active-finger-button")).not.toHaveClass("target-outline");
  });

  it("clamps invalid word counts before applying settings", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "Settings" }));
    fireEvent.change(screen.getByLabelText("Words per session"), { target: { value: "99" } });

    expect(screen.getByLabelText("Words per session")).toHaveValue(20);

    await user.click(screen.getByTestId("apply-settings-button"));

    expect(screen.getByTestId("progress-count")).toHaveTextContent("0 / 20 words");
  });

  it("shows a results summary once the session is complete", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "Settings" }));
    fireEvent.change(screen.getByLabelText("Words per session"), { target: { value: "1" } });
    await user.click(screen.getByTestId("apply-settings-button"));

    fireEvent.keyDown(window, { key: "Enter" });
    await user.keyboard("apple");

    expect(screen.getByTestId("results-summary")).toHaveTextContent("Score blends speed and accuracy");
    expect(screen.getByTestId("completion-banner")).toHaveTextContent("Session complete");
  });

  it("switches into the focused practice layout after countdown", async () => {
    const user = userEvent.setup();
    render(<App />);

    expect(screen.getByTestId("app-hero")).not.toHaveClass("practice-focused-hero");
    expect(screen.getByTestId("practice-panel")).not.toHaveClass("focused");
    expect(screen.getByTestId("practice-panel")).not.toHaveClass("typing-active-layout");

    await user.click(screen.getByTestId("skip-countdown-button"));

    expect(screen.getByTestId("app-hero")).toHaveClass("practice-focused-hero");
    expect(screen.getByTestId("app-tabs")).toHaveClass("practice-focused-tabs");
    expect(screen.getByTestId("practice-panel")).toHaveClass("focused");
    expect(screen.getByTestId("practice-panel")).toHaveClass("typing-active-layout");
    expect(screen.getByTestId("practice-metrics-bar")).toBeInTheDocument();
    expect(screen.getByTestId("practice-word-stage")).toBeInTheDocument();
    expect(screen.getByTestId("keyboard-guide-slot")).toBeInTheDocument();
    expect(screen.getByTestId("finger-guide-slot")).toBeInTheDocument();
    expect(screen.getByTestId("feedback")).toHaveClass("persistent");
    expect(screen.getByTestId("practice-actions")).toBeInTheDocument();
  });

  it("scrolls the primary panel into view when typing starts", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByTestId("skip-countdown-button"));

    expect(scrollIntoViewMock).toHaveBeenCalledTimes(1);
    expect(scrollIntoViewMock).toHaveBeenCalledWith({
      behavior: "smooth",
      block: "start"
    });
  });

  it("does not scroll again while typing or when returning to practice", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByTestId("skip-countdown-button"));
    expect(scrollIntoViewMock).toHaveBeenCalledTimes(1);

    await user.keyboard("a");
    await user.click(screen.getByRole("button", { name: "Settings" }));
    await user.click(screen.getByRole("button", { name: "Practice" }));

    expect(scrollIntoViewMock).toHaveBeenCalledTimes(1);
  });

  it("keeps keyboard and finger guides visible during typing even if assist settings are off", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "Settings" }));
    await user.click(screen.getByTestId("keyboard-hint-toggle"));
    await user.click(screen.getByTestId("finger-guide-toggle"));
    await user.click(screen.getByTestId("apply-settings-button"));
    await user.click(screen.getByTestId("skip-countdown-button"));

    expect(screen.getByTestId("keyboard-visual")).toBeInTheDocument();
    expect(screen.getByTestId("finger-button-visual")).toBeInTheDocument();
    expect(screen.getByTestId("keyboard-guide-slot").compareDocumentPosition(screen.getByTestId("finger-guide-slot"))).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING
    );
  });

  it("switches display language in settings", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "Settings" }));
    await user.click(screen.getByTestId("language-ja"));

    expect(screen.getByRole("button", { name: "練習" })).toBeInTheDocument();
    expect(screen.getByText("表示言語")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "練習" }));
    expect(screen.getByTestId("finger-button-label")).toHaveTextContent("左小指");
    expect(screen.getByTestId("active-finger-button")).toHaveTextContent("左小");
  });

  it("persists selected display language after reload", async () => {
    const user = userEvent.setup();
    const { unmount } = render(<App />);

    await user.click(screen.getByRole("button", { name: "Settings" }));
    await user.click(screen.getByTestId("language-ja-hira"));

    unmount();
    render(<App />);

    expect(screen.getByRole("button", { name: "れんしゅう" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "れんしゅう" }));
    expect(screen.getByTestId("finger-button-label")).toHaveTextContent("ひだりこゆび");
  });
});
