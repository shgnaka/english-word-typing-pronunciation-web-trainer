import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import App from "./App";

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

afterEach(() => {
  vi.unstubAllGlobals();
  cleanup();
});

describe("App bulk remove regression", () => {
  it("rebuilds the active session correctly after bulk-removing mixed active words", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "Words" }));
    await user.type(screen.getByLabelText("New word"), "banana");
    await user.click(screen.getByRole("button", { name: "Add word" }));

    await user.click(screen.getByTestId("select-active-word-checkbox-builtin-apple"));
    await user.click(screen.getByTestId("select-active-word-checkbox-custom-banana"));
    await user.click(screen.getByTestId("bulk-remove-active-words-button"));
    await user.click(screen.getByRole("button", { name: "Practice" }));

    expect(screen.getByTestId("current-word")).toHaveTextContent("book");
  });
});
