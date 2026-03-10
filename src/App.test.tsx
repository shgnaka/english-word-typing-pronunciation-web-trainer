import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { fireEvent } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import App from "./App";
import * as browserTts from "./infra/browserTts";

beforeEach(() => {
  window.localStorage.clear();
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
  vi.stubGlobal("scrollTo", vi.fn());
});

function getSpeechSynthesisMock() {
  return window.speechSynthesis as unknown as { cancel: ReturnType<typeof vi.fn>; speak: ReturnType<typeof vi.fn> };
}

afterEach(() => {
  vi.unstubAllGlobals();
  cleanup();
});

describe("App", () => {
  it("adds a custom word", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "Words" }));
    expect(screen.getByTestId("builtin-word-list")).toHaveTextContent("apple");
    await user.type(screen.getByLabelText("New word"), "banana");
    await user.click(screen.getByRole("button", { name: "Add word" }));

    expect(screen.getByTestId("custom-word-list")).toHaveTextContent("banana");
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
    expect(screen.getByTestId("practice-status-message")).toHaveTextContent("Typing will start in 3.");
    expect(screen.getByTestId("practice-target-summary")).toHaveTextContent("Current target letter A. Use key A with Left pinky.");
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it("adds a custom word when Enter is pressed", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "Words" }));
    await user.type(screen.getByLabelText("New word"), "banana{enter}");

    expect(screen.getByTestId("custom-word-list")).toHaveTextContent("banana");
  });

  it("shows actionable empty states on the words page", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "Words" }));

    expect(screen.getByTestId("hidden-builtin-empty")).toHaveTextContent("No hidden built-in words.");
    expect(screen.getByTestId("hidden-builtin-empty")).toHaveTextContent("Remove a built-in word from practice");
    expect(screen.getByTestId("hidden-builtin-empty-cta")).toHaveTextContent("Go to built-in words");
    expect(screen.getByTestId("custom-word-list")).toHaveTextContent("No custom words yet.");
    expect(screen.getByTestId("custom-word-list")).toHaveTextContent("Add a custom word above");
    expect(screen.getByTestId("empty-custom-cta")).toHaveTextContent("Add your first custom word");
  });

  it("uses empty-state ctas to guide the next action", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "Words" }));
    await user.click(screen.getByTestId("empty-custom-cta"));

    expect(screen.getByTestId("new-word-input")).toHaveFocus();
  });

  it("shows visual state labels for active, hidden, local-only, and edited words", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "Words" }));
    expect(screen.getByTestId("active-state-pill")).toHaveTextContent("Active");
    expect(screen.getByTestId("builtin-state-pill")).toHaveTextContent("Active");
    expect(screen.getByTestId("custom-state-pill")).toHaveTextContent("Saved locally");

    await user.click(screen.getByTestId("delete-word-button-builtin-apple"));
    expect(screen.getByTestId("hidden-builtin-state-pill")).toHaveTextContent("Hidden");

    await user.type(screen.getByLabelText("New word"), "banana");
    await user.click(screen.getByRole("button", { name: "Add word" }));
    await user.click(screen.getByTestId("remove-from-practice-button-custom-banana"));
    expect(screen.getByTestId("hidden-custom-state-pill")).toHaveTextContent("Hidden");
    expect(screen.getByTestId("hidden-custom-local-state-pill")).toHaveTextContent("Saved locally");

    await user.click(screen.getByTestId("edit-word-button-builtin-book"));
    await user.clear(screen.getByTestId("edit-word-input-builtin-book"));
    await user.type(screen.getByTestId("edit-word-input-builtin-book"), "books");
    await user.click(screen.getByTestId("save-word-button-builtin-book"));
    expect(screen.getByTestId("builtin-word-state-builtin-book")).toHaveTextContent("Edited locally");
  });

  it("persists words section minimization after reload", async () => {
    const user = userEvent.setup();
    const { unmount } = render(<App />);

    await user.click(screen.getByRole("button", { name: "Words" }));
    await user.click(screen.getByTestId("toggle-builtin-section-button"));
    expect(screen.getByTestId("builtin-section-summary")).toHaveTextContent("20 active built-in words, 0 hidden");

    unmount();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "Words" }));
    expect(screen.getByTestId("builtin-section-summary")).toHaveTextContent("20 active built-in words, 0 hidden");
  });

  it("shows count-based minimized summaries for custom and hidden word sections", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "Words" }));
    await user.type(screen.getByLabelText("New word"), "banana");
    await user.click(screen.getByRole("button", { name: "Add word" }));
    await user.type(screen.getByLabelText("New word"), "mango");
    await user.click(screen.getByRole("button", { name: "Add word" }));
    await user.click(screen.getByTestId("remove-from-practice-button-custom-banana"));
    await user.click(screen.getByTestId("delete-word-button-builtin-book"));

    await user.click(screen.getByTestId("toggle-hidden-builtin-section-button"));
    expect(screen.getByTestId("hidden-builtin-section-summary")).toHaveTextContent("1 hidden built-in words");

    await user.click(screen.getByTestId("toggle-inactive-custom-section-button"));
    expect(screen.getByTestId("inactive-custom-section-summary")).toHaveTextContent("1 hidden custom words");

    await user.click(screen.getByTestId("toggle-custom-section-button"));
    expect(screen.getByTestId("custom-section-summary")).toHaveTextContent("1 active custom words, 1 hidden");
  });

  it("sorts custom words alphabetically from the custom words section", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "Words" }));
    await user.type(screen.getByLabelText("New word"), "pear");
    await user.click(screen.getByRole("button", { name: "Add word" }));
    await user.type(screen.getByLabelText("New word"), "banana");
    await user.click(screen.getByRole("button", { name: "Add word" }));
    await user.type(screen.getByLabelText("New word"), "mango");
    await user.click(screen.getByRole("button", { name: "Add word" }));

    await user.click(screen.getByTestId("sort-custom-alpha-button"));

    const customWordChips = screen.getAllByTestId("word-chip");
    expect(customWordChips[0]).toHaveTextContent("banana");
    expect(customWordChips[1]).toHaveTextContent("mango");
    expect(customWordChips[2]).toHaveTextContent("pear");
  });

  it("moves a practice-order word to the top and keeps that order after reload", async () => {
    const user = userEvent.setup();
    const { unmount } = render(<App />);

    await user.click(screen.getByRole("button", { name: "Words" }));
    await user.click(screen.getByTestId("move-word-top-button-builtin-language"));

    let activeWordChips = screen.getAllByTestId("active-word-chip");
    expect(activeWordChips[0]).toHaveTextContent("language");

    unmount();
    render(<App />);
    await user.click(screen.getByRole("button", { name: "Words" }));

    activeWordChips = screen.getAllByTestId("active-word-chip");
    expect(activeWordChips[0]).toHaveTextContent("language");
  });

  it("moves a practice-order word to the bottom", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "Words" }));
    await user.click(screen.getByTestId("move-word-bottom-button-builtin-apple"));

    const activeWordChips = screen.getAllByTestId("active-word-chip");
    expect(activeWordChips[activeWordChips.length - 1]).toHaveTextContent("apple");
  });

  it("reorders practice-order words with drag and drop", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "Words" }));

    const rows = screen.getAllByTestId("active-word-row");
    const draggedRow = rows[0];
    const targetRow = rows[2];
    const dataTransfer = {
      effectAllowed: "move",
      dropEffect: "move",
      setData: vi.fn(),
      getData: vi.fn(() => "builtin-apple")
    };

    fireEvent.dragStart(draggedRow, { dataTransfer });
    fireEvent.dragOver(targetRow, { dataTransfer });
    fireEvent.drop(targetRow, { dataTransfer });
    fireEvent.dragEnd(draggedRow, { dataTransfer });

    const activeWordChips = screen.getAllByTestId("active-word-chip");
    expect(activeWordChips[0]).toHaveTextContent("book");
    expect(activeWordChips[1]).toHaveTextContent("happy");
    expect(activeWordChips[2]).toHaveTextContent("apple");
  });

  it("supports bulk remove and restore for custom words", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "Words" }));
    await user.type(screen.getByLabelText("New word"), "banana");
    await user.click(screen.getByRole("button", { name: "Add word" }));
    await user.type(screen.getByLabelText("New word"), "grape");
    await user.click(screen.getByRole("button", { name: "Add word" }));

    await user.click(screen.getByTestId("select-custom-word-checkbox-custom-banana"));
    await user.click(screen.getByTestId("select-custom-word-checkbox-custom-grape"));
    await user.click(screen.getByTestId("bulk-remove-custom-words-button"));

    expect(screen.getByTestId("inactive-custom-word-list")).toHaveTextContent("banana");
    expect(screen.getByTestId("inactive-custom-word-list")).toHaveTextContent("grape");

    await user.click(screen.getByTestId("select-hidden-custom-word-checkbox-custom-banana"));
    await user.click(screen.getByTestId("select-hidden-custom-word-checkbox-custom-grape"));
    await user.click(screen.getByTestId("bulk-restore-hidden-custom-words-button"));

    expect(screen.getByTestId("custom-word-list")).toHaveTextContent("banana");
    expect(screen.getByTestId("custom-word-list")).toHaveTextContent("grape");
  });

  it("keeps bulk action controls visible and returns focus after a bulk action", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "Words" }));
    await user.type(screen.getByLabelText("New word"), "banana");
    await user.click(screen.getByRole("button", { name: "Add word" }));

    expect(screen.getByTestId("bulk-selected-count-custom")).toHaveTextContent("0 selected");
    expect(screen.getByTestId("bulk-remove-custom-words-button")).toBeDisabled();
    expect(screen.getByTestId("bulk-delete-custom-words-button")).toBeDisabled();

    await user.click(screen.getByTestId("select-custom-word-checkbox-custom-banana"));
    expect(screen.getByTestId("bulk-selected-count-custom")).toHaveTextContent("1 selected");

    await user.click(screen.getByTestId("bulk-remove-custom-words-button"));

    expect(screen.getByTestId("bulk-select-visible-custom-button")).not.toHaveFocus();
    expect(screen.getByTestId("bulk-select-visible-custom-button").closest(".bulk-action-bar")).toHaveFocus();
    expect(screen.getByTestId("bulk-selected-count-custom")).toHaveTextContent("0 selected");
    expect(screen.getByTestId("bulk-remove-custom-words-button")).toBeDisabled();
    expect(screen.getByTestId("bulk-delete-custom-words-button")).toBeDisabled();
  });

  it("toggles visible bulk selection for custom words", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "Words" }));
    await user.type(screen.getByLabelText("New word"), "banana");
    await user.click(screen.getByRole("button", { name: "Add word" }));
    await user.type(screen.getByLabelText("New word"), "grape");
    await user.click(screen.getByRole("button", { name: "Add word" }));

    await user.click(screen.getByTestId("bulk-select-visible-custom-button"));
    expect(screen.getByTestId("select-custom-word-checkbox-custom-banana")).toBeChecked();
    expect(screen.getByTestId("select-custom-word-checkbox-custom-grape")).toBeChecked();

    await user.click(screen.getByTestId("bulk-select-visible-custom-button"));
    expect(screen.getByTestId("select-custom-word-checkbox-custom-banana")).not.toBeChecked();
    expect(screen.getByTestId("select-custom-word-checkbox-custom-grape")).not.toBeChecked();
  });

  it("supports bulk delete for hidden custom words", async () => {
    const user = userEvent.setup();
    const confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(true);
    render(<App />);

    await user.click(screen.getByRole("button", { name: "Words" }));
    await user.type(screen.getByLabelText("New word"), "banana");
    await user.click(screen.getByRole("button", { name: "Add word" }));
    await user.type(screen.getByLabelText("New word"), "grape");
    await user.click(screen.getByRole("button", { name: "Add word" }));
    await user.click(screen.getByTestId("remove-from-practice-button-custom-banana"));
    await user.click(screen.getByTestId("remove-from-practice-button-custom-grape"));

    await user.click(screen.getByTestId("select-hidden-custom-word-checkbox-custom-banana"));
    await user.click(screen.getByTestId("select-hidden-custom-word-checkbox-custom-grape"));
    await user.click(screen.getByTestId("bulk-delete-hidden-custom-words-button"));

    expect(screen.getByTestId("inactive-custom-word-list")).not.toHaveTextContent("banana");
    expect(screen.getByTestId("inactive-custom-word-list")).not.toHaveTextContent("grape");
    expect(confirmSpy).toHaveBeenCalled();
    confirmSpy.mockRestore();
  });

  it("cancels destructive bulk delete when confirmation is declined", async () => {
    const user = userEvent.setup();
    const confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(false);
    render(<App />);

    await user.click(screen.getByRole("button", { name: "Words" }));
    await user.type(screen.getByLabelText("New word"), "banana");
    await user.click(screen.getByRole("button", { name: "Add word" }));
    await user.type(screen.getByLabelText("New word"), "grape");
    await user.click(screen.getByRole("button", { name: "Add word" }));

    await user.click(screen.getByTestId("select-custom-word-checkbox-custom-banana"));
    await user.click(screen.getByTestId("select-custom-word-checkbox-custom-grape"));
    await user.click(screen.getByTestId("bulk-delete-custom-words-button"));

    expect(screen.getByTestId("custom-word-list")).toHaveTextContent("banana");
    expect(screen.getByTestId("custom-word-list")).toHaveTextContent("grape");
    expect(confirmSpy).toHaveBeenCalled();
    confirmSpy.mockRestore();
  });

  it("highlights search matches and lets the user clear an empty search result", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "Words" }));
    await user.type(screen.getByTestId("word-search-input"), "app");

    expect(document.querySelectorAll("mark.word-match-highlight").length).toBeGreaterThan(0);

    await user.clear(screen.getByTestId("word-search-input"));
    await user.type(screen.getByTestId("word-search-input"), "zzz");

    expect(screen.getByTestId("clear-word-search-button")).toBeInTheDocument();
    await user.click(screen.getByTestId("clear-word-search-button"));

    expect(screen.getByTestId("word-search-input")).toHaveValue("");
    expect(screen.queryByTestId("clear-word-search-button")).not.toBeInTheDocument();
  });

  it("moves secondary row actions into an overflow menu on compact layouts", async () => {
    const originalMatchMedia = window.matchMedia;
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: vi.fn().mockImplementation(() => ({
        matches: true,
        media: "(max-width: 760px)",
        onchange: null,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        addListener: vi.fn(),
        removeListener: vi.fn(),
        dispatchEvent: vi.fn()
      }))
    });

    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "Words" }));
    await user.type(screen.getByLabelText("New word"), "banana");
    await user.click(screen.getByRole("button", { name: "Add word" }));

    const customWordsSection = screen.getByTestId("custom-word-section");
    const customWordsSectionQueries = within(customWordsSection);

    expect(customWordsSectionQueries.getByTestId("more-row-actions-button-custom-banana")).toBeInTheDocument();
    await user.click(customWordsSectionQueries.getByTestId("more-row-actions-button-custom-banana"));
    expect(customWordsSectionQueries.getByTestId("delete-word-button-custom-banana")).toBeInTheDocument();

    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: originalMatchMedia
    });
  });

  it("edits a builtin word", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "Words" }));
    await user.click(screen.getByTestId("edit-word-button-builtin-apple"));
    await user.clear(screen.getByTestId("edit-word-input-builtin-apple"));
    await user.type(screen.getByTestId("edit-word-input-builtin-apple"), "apricot");
    await user.click(screen.getByTestId("save-word-button-builtin-apple"));

    expect(screen.getByTestId("builtin-word-list")).toHaveTextContent("apricot");
    expect(screen.getByTestId("builtin-word-state-builtin-apple")).toHaveTextContent("Edited locally");
  });

  it("deletes and restores a builtin word", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "Words" }));
    await user.click(screen.getByTestId("delete-word-button-builtin-apple"));

    expect(screen.getByTestId("builtin-word-list")).not.toHaveTextContent("apple");
    expect(screen.getByTestId("hidden-builtin-word-list")).toHaveTextContent("apple");

    await user.click(screen.getAllByTestId("restore-word-button-builtin-apple")[0]);

    expect(screen.getByTestId("builtin-word-list")).toHaveTextContent("apple");
    expect(screen.getByTestId("hidden-builtin-empty")).toHaveTextContent("No hidden built-in words.");
  });

  it("rejects duplicate builtin word edits", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "Words" }));
    await user.click(screen.getByTestId("edit-word-button-builtin-apple"));
    await user.clear(screen.getByTestId("edit-word-input-builtin-apple"));
    await user.type(screen.getByTestId("edit-word-input-builtin-apple"), "book");
    await user.click(screen.getByTestId("save-word-button-builtin-apple"));

    expect(screen.getByRole("alert")).toHaveTextContent("That word already exists.");
    expect(screen.getByTestId("edit-word-input-builtin-apple")).toHaveValue("book");
  });

  it("resets builtin word overrides", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "Words" }));
    await user.click(screen.getByTestId("edit-word-button-builtin-apple"));
    await user.clear(screen.getByTestId("edit-word-input-builtin-apple"));
    await user.type(screen.getByTestId("edit-word-input-builtin-apple"), "apricot");
    await user.click(screen.getByTestId("save-word-button-builtin-apple"));
    await user.click(screen.getByTestId("delete-word-button-builtin-book"));
    await user.click(screen.getByTestId("reset-builtin-words-button"));

    expect(screen.getByTestId("builtin-word-list")).toHaveTextContent("apple");
    expect(screen.getByTestId("builtin-word-list")).toHaveTextContent("book");
    expect(screen.getByTestId("hidden-builtin-empty")).toHaveTextContent("No hidden built-in words.");
  });

  it("reorders builtin words in the mixed practice list and keeps the order after reload", async () => {
    const user = userEvent.setup();
    const { unmount } = render(<App />);

    await user.click(screen.getByRole("button", { name: "Words" }));
    await user.click(screen.getByTestId("move-word-down-button-builtin-apple"));

    let activeWordChips = screen.getAllByTestId("active-word-chip");
    expect(activeWordChips[0]).toHaveTextContent("book");
    expect(activeWordChips[1]).toHaveTextContent("apple");

    unmount();
    render(<App />);
    await user.click(screen.getByRole("button", { name: "Words" }));

    activeWordChips = screen.getAllByTestId("active-word-chip");
    expect(activeWordChips[0]).toHaveTextContent("book");
    expect(activeWordChips[1]).toHaveTextContent("apple");
  });

  it("deletes a custom word", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "Words" }));
    await user.type(screen.getByLabelText("New word"), "banana");
    await user.click(screen.getByRole("button", { name: "Add word" }));
    await user.click(screen.getByTestId("delete-word-button-custom-banana"));

    expect(screen.queryByText("banana")).not.toBeInTheDocument();
  });

  it("can remove a custom word from practice without deleting it locally", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "Words" }));
    await user.type(screen.getByLabelText("New word"), "banana");
    await user.click(screen.getByRole("button", { name: "Add word" }));
    await user.click(screen.getByTestId("remove-from-practice-button-custom-banana"));

    expect(screen.getByTestId("inactive-custom-word-list")).toHaveTextContent("banana");
    expect(screen.getByTestId("custom-word-list")).not.toHaveTextContent("banana");
    expect(screen.getByTestId("active-word-list")).not.toHaveTextContent("banana");
  });

  it("can add a saved custom word back into practice", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "Words" }));
    await user.type(screen.getByLabelText("New word"), "banana");
    await user.click(screen.getByRole("button", { name: "Add word" }));
    await user.click(screen.getByTestId("remove-from-practice-button-custom-banana"));
    await user.click(screen.getByTestId("add-to-practice-button-custom-banana"));

    expect(screen.getByTestId("custom-word-list")).toHaveTextContent("banana");
    expect(screen.getByTestId("active-word-list")).toHaveTextContent("banana");
    expect(screen.getByTestId("inactive-custom-word-list")).not.toHaveTextContent("banana");
  });

  it("can remove a builtin word from practice order from the mixed list", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "Words" }));
    await user.click(screen.getByTestId("remove-from-practice-button-builtin-apple"));

    expect(screen.getByTestId("active-word-list")).not.toHaveTextContent("apple");
    expect(screen.getByTestId("hidden-builtin-word-list")).toHaveTextContent("apple");
  });

  it("edits a custom word", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "Words" }));
    await user.type(screen.getByLabelText("New word"), "banana");
    await user.click(screen.getByRole("button", { name: "Add word" }));
    await user.click(screen.getByTestId("edit-word-button-custom-banana"));
    await user.clear(screen.getByTestId("edit-word-input-custom-banana"));
    await user.type(screen.getByTestId("edit-word-input-custom-banana"), "grape");
    await user.click(screen.getByTestId("save-word-button-custom-banana"));

    expect(screen.getByTestId("custom-word-list")).toHaveTextContent("grape");
    expect(screen.queryByText("banana")).not.toBeInTheDocument();
  });

  it("rejects duplicate custom word edits", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "Words" }));
    await user.type(screen.getByLabelText("New word"), "banana");
    await user.click(screen.getByRole("button", { name: "Add word" }));
    await user.clear(screen.getByLabelText("New word"));
    await user.type(screen.getByLabelText("New word"), "grape");
    await user.click(screen.getByRole("button", { name: "Add word" }));
    await user.click(screen.getByTestId("edit-word-button-custom-banana"));
    await user.clear(screen.getByTestId("edit-word-input-custom-banana"));
    await user.type(screen.getByTestId("edit-word-input-custom-banana"), "grape");
    await user.click(screen.getByTestId("save-word-button-custom-banana"));

    expect(screen.getByRole("alert")).toHaveTextContent("That word already exists.");
    expect(screen.getByTestId("edit-word-input-custom-banana")).toHaveValue("grape");
  });

  it("reorders custom words among builtin words and keeps the order after reload", async () => {
    const user = userEvent.setup();
    const { unmount } = render(<App />);

    await user.click(screen.getByRole("button", { name: "Words" }));
    await user.type(screen.getByLabelText("New word"), "banana");
    await user.click(screen.getByRole("button", { name: "Add word" }));
    await user.click(screen.getByTestId("move-word-up-button-custom-banana"));
    await user.click(screen.getByTestId("move-word-up-button-custom-banana"));

    let activeWordChips = screen.getAllByTestId("active-word-chip");
    expect(activeWordChips[activeWordChips.length - 3]).toHaveTextContent("banana");
    expect(activeWordChips[activeWordChips.length - 2]).toHaveTextContent("keyboard");
    expect(activeWordChips[activeWordChips.length - 1]).toHaveTextContent("language");

    unmount();
    render(<App />);
    await user.click(screen.getByRole("button", { name: "Words" }));

    activeWordChips = screen.getAllByTestId("active-word-chip");
    expect(activeWordChips[activeWordChips.length - 3]).toHaveTextContent("banana");
    expect(activeWordChips[activeWordChips.length - 2]).toHaveTextContent("keyboard");
    expect(activeWordChips[activeWordChips.length - 1]).toHaveTextContent("language");
  });

  it("rebuilds the active session when a custom word is deleted", async () => {
    const user = userEvent.setup();
    let randomCallCount = 0;
    const randomSpy = vi.spyOn(Math, "random").mockImplementation(() => {
      const nextValue = randomCallCount === 0 || randomCallCount === 20 ? 0 : 0.999999;
      randomCallCount += 1;
      return nextValue;
    });
    try {
      render(<App />);

      await user.click(screen.getByRole("button", { name: "Words" }));
      await user.type(screen.getByLabelText("New word"), "banana");
      await user.click(screen.getByRole("button", { name: "Add word" }));

      await user.click(screen.getByRole("button", { name: "Settings" }));
      fireEvent.change(screen.getByTestId("word-count-input"), { target: { value: "20" } });
      await user.click(screen.getByTestId("shuffle-toggle"));
      await user.click(screen.getByTestId("apply-settings-button"));

      expect(screen.getByTestId("current-word")).toHaveTextContent("banana");

      await user.click(screen.getByRole("button", { name: "Words" }));
      await user.click(screen.getByTestId("delete-word-button-custom-banana"));
      await user.click(screen.getByRole("button", { name: "Practice" }));

      expect(screen.getByTestId("current-word")).toHaveTextContent("language");
    } finally {
      randomSpy.mockRestore();
    }
  });

  it("rebuilds the active session when a builtin word is edited or deleted", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "Words" }));
    await user.click(screen.getByTestId("edit-word-button-builtin-apple"));
    await user.clear(screen.getByTestId("edit-word-input-builtin-apple"));
    await user.type(screen.getByTestId("edit-word-input-builtin-apple"), "apricot");
    await user.click(screen.getByTestId("save-word-button-builtin-apple"));
    await user.click(screen.getByRole("button", { name: "Practice" }));

    expect(screen.getByTestId("current-word")).toHaveTextContent("apricot");

    await user.click(screen.getByRole("button", { name: "Words" }));
    await user.click(screen.getByTestId("delete-word-button-builtin-apple"));
    await user.click(screen.getByRole("button", { name: "Practice" }));

    expect(screen.getByTestId("current-word")).toHaveTextContent("book");
  });

  it("uses the reordered mixed word order for practice when shuffle is off", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "Words" }));
    await user.type(screen.getByLabelText("New word"), "banana");
    await user.click(screen.getByRole("button", { name: "Add word" }));
    for (let step = 0; step < 20; step += 1) {
      await user.click(screen.getByTestId("move-word-up-button-custom-banana"));
    }
    await user.click(screen.getByRole("button", { name: "Practice" }));

    expect(screen.getByTestId("current-word")).toHaveTextContent("banana");
  });

  it("reset builtin words restores the shipped builtin order", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "Words" }));
    await user.click(screen.getByTestId("move-word-down-button-builtin-apple"));
    await user.click(screen.getByTestId("reset-builtin-words-button"));

    const builtinWordChips = screen.getAllByTestId("builtin-word-chip");
    expect(builtinWordChips[0]).toHaveTextContent("apple");
    expect(builtinWordChips[1]).toHaveTextContent("book");
  });

  it("skips countdown when Enter is pressed", () => {
    render(<App />);
    const practicePanel = screen.getByTestId("primary-panel");

    fireEvent.keyDown(practicePanel, { key: "Enter" });

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

  it("shows fallback status for manual pronunciation when browser TTS falls back to system speech", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "Settings" }));
    await user.click(screen.getByTestId("browser-tts-toggle"));
    await user.click(screen.getByTestId("apply-settings-button"));
    await user.click(screen.getByTestId("skip-countdown-button"));
    await user.click(screen.getByRole("button", { name: "Pronounce" }));

    expect(screen.getByTestId("pronunciation-status")).toHaveTextContent("system pronunciation was used");
  });

  it("shows an error status when no pronunciation backend is available", async () => {
    const user = userEvent.setup();
    Object.defineProperty(window, "speechSynthesis", {
      writable: true,
      value: undefined
    });
    Object.defineProperty(window, "SpeechSynthesisUtterance", {
      writable: true,
      value: undefined
    });
    render(<App />);

    await user.click(screen.getByTestId("skip-countdown-button"));
    await user.click(screen.getByRole("button", { name: "Pronounce" }));

    expect(screen.getByTestId("pronunciation-status")).toHaveTextContent("Pronunciation was unavailable in this browser.");
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

  it("clears the browser TTS cache from settings", async () => {
    const user = userEvent.setup();
    const clearBrowserTtsCacheSpy = vi.spyOn(browserTts, "clearBrowserTtsCache").mockResolvedValue(2);
    render(<App />);

    await user.click(screen.getByRole("button", { name: "Settings" }));
    await user.click(screen.getByTestId("clear-browser-tts-cache-button"));

    expect(clearBrowserTtsCacheSpy).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId("browser-tts-cache-status")).toHaveTextContent("Browser audio cache was cleared.");

    clearBrowserTtsCacheSpy.mockRestore();
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

  it("applies visual assistance toggles immediately without pending session changes", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "Settings" }));
    await user.click(screen.getByTestId("keyboard-hint-toggle"));

    expect(screen.getByTestId("settings-status")).toHaveTextContent("Current session already matches these settings.");

    await user.click(screen.getByRole("button", { name: "Practice" }));

    expect(screen.queryByTestId("keyboard-guide-slot")).not.toBeInTheDocument();
  });

  it("updates the finger button guide as typing advances", () => {
    render(<App />);
    const practicePanel = screen.getByTestId("primary-panel");

    fireEvent.keyDown(practicePanel, { key: "Enter" });
    fireEvent.keyDown(practicePanel, { key: "a" });

    expect(screen.getByTestId("active-finger-button")).toHaveAttribute("data-finger-id", "right-pinky");
  });

  it("surfaces mistyped keys across the practice guidance", () => {
    render(<App />);
    const practicePanel = screen.getByTestId("primary-panel");

    fireEvent.keyDown(practicePanel, { key: "Enter" });
    fireEvent.keyDown(practicePanel, { key: "z" });

    expect(screen.getByTestId("feedback")).toHaveTextContent("Wrong key: Z. Keep aiming for the highlighted letter.");
    expect(screen.getByTestId("target-char")).toHaveClass("error");
    expect(screen.getByTestId("mistyped-keycap")).toHaveTextContent("Z");
    expect(screen.getByTestId("mistyped-keycap")).toHaveClass("mistyped");
    expect(screen.getByTestId("active-keycap")).toHaveClass("target-outline");
    expect(screen.getByTestId("active-finger-button")).toHaveClass("target-outline");
    expect(screen.getByTestId("active-finger-button")).not.toHaveClass("active");
    expect(screen.getByTestId("practice-status-message")).toHaveTextContent("Wrong key: Z. Keep aiming for the highlighted letter.");
  });

  it("clears mistype emphasis after the next correct key", () => {
    render(<App />);
    const practicePanel = screen.getByTestId("primary-panel");

    fireEvent.keyDown(practicePanel, { key: "Enter" });
    fireEvent.keyDown(practicePanel, { key: "z" });
    fireEvent.keyDown(practicePanel, { key: "a" });

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

    fireEvent.keyDown(screen.getByTestId("primary-panel"), { key: "Enter" });
    await user.keyboard("apple");

    expect(screen.getByTestId("results-summary")).toHaveTextContent("Score blends speed and accuracy");
    expect(screen.getByTestId("completion-banner")).toHaveTextContent("Session complete");
    expect(screen.getByTestId("results-accessibility-summary")).toHaveTextContent("Completed 1 words.");
    expect(screen.getByTestId("results-feedback")).toHaveTextContent("Practice insights");
    expect(screen.getByTestId("results-feedback")).toHaveTextContent("Slowest word: apple");
    expect(screen.getByTestId("results-feedback")).toHaveTextContent("No mistakes this session");
  });

  it("announces add-word errors as alerts", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "Words" }));
    await user.type(screen.getByLabelText("New word"), "banana");
    await user.click(screen.getByRole("button", { name: "Add word" }));
    await user.type(screen.getByLabelText("New word"), "banana");
    await user.click(screen.getByRole("button", { name: "Add word" }));

    expect(screen.getByRole("alert")).toHaveTextContent("That word already exists.");
  });

  it("switches into the focused practice layout after countdown", async () => {
    const user = userEvent.setup();
    render(<App />);

    expect(screen.getByTestId("practice-panel")).not.toHaveClass("typing-active-layout");

    await user.click(screen.getByTestId("skip-countdown-button"));

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
    const scrollToMock = vi.fn();
    const cancelAnimationFrameMock = vi.fn();
    const animationFrameCallbacks: FrameRequestCallback[] = [];
    vi.stubGlobal("scrollTo", scrollToMock);
    vi.stubGlobal("cancelAnimationFrame", cancelAnimationFrameMock);
    vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => {
      animationFrameCallbacks.push(callback);
      return animationFrameCallbacks.length;
    });

    render(<App />);
    const primaryPanel = screen.getByTestId("primary-panel");
    vi.spyOn(primaryPanel, "getBoundingClientRect").mockReturnValue({
      x: 0,
      y: 120,
      width: 100,
      height: 100,
      top: 120,
      right: 100,
      bottom: 220,
      left: 0,
      toJSON: () => ({})
    });
    Object.defineProperty(window, "scrollY", {
      configurable: true,
      value: 48
    });

    await user.click(screen.getByTestId("skip-countdown-button"));

    expect(animationFrameCallbacks).toHaveLength(1);
    animationFrameCallbacks.shift()?.(0);
    expect(animationFrameCallbacks).toHaveLength(1);
    animationFrameCallbacks.shift()?.(0);

    expect(scrollToMock).toHaveBeenCalledTimes(1);
    expect(scrollToMock).toHaveBeenCalledWith({
      top: 168,
      behavior: "smooth",
    });
  });

  it("keeps typing input scoped to the practice panel", () => {
    render(<App />);

    fireEvent.keyDown(window, { key: "Enter" });

    expect(screen.getByTestId("countdown-banner")).toBeInTheDocument();

    fireEvent.keyDown(screen.getByTestId("primary-panel"), { key: "Enter" });

    expect(screen.queryByTestId("countdown-banner")).not.toBeInTheDocument();
  });

  it("does not scroll again while typing or when returning to practice", async () => {
    const user = userEvent.setup();
    const scrollToMock = vi.fn();
    const animationFrameCallbacks: FrameRequestCallback[] = [];
    vi.stubGlobal("scrollTo", scrollToMock);
    vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => {
      animationFrameCallbacks.push(callback);
      return animationFrameCallbacks.length;
    });
    vi.stubGlobal("cancelAnimationFrame", vi.fn());
    render(<App />);

    await user.click(screen.getByTestId("skip-countdown-button"));
    animationFrameCallbacks.shift()?.(0);
    animationFrameCallbacks.shift()?.(0);
    expect(scrollToMock).toHaveBeenCalledTimes(1);

    await user.keyboard("a");
    await user.click(screen.getByRole("button", { name: "Settings" }));
    await user.click(screen.getByRole("button", { name: "Practice" }));

    expect(scrollToMock).toHaveBeenCalledTimes(1);
  });

  it("keeps keyboard and finger guides visible during typing even if assist settings are off", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "Settings" }));
    await user.click(screen.getByTestId("keyboard-hint-toggle"));
    await user.click(screen.getByTestId("finger-guide-toggle"));
    await user.click(screen.getByRole("button", { name: "Practice" }));
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
