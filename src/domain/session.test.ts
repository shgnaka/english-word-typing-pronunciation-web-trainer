import { describe, expect, it, vi } from "vitest";
import { applyKeystroke, buildSessionQueue, createInitialSession } from "./session";
import { createWordEntry } from "./words";

describe("session", () => {
  it("advances when the expected key is typed", () => {
    const word = createWordEntry("apple", "builtin");
    expect(word).not.toBeNull();
    const state = createInitialSession([word!]);

    const next = applyKeystroke(state, "a", 100);

    expect(next.charIndex).toBe(1);
    expect(next.lastInputCorrect).toBe(true);
  });

  it("does not advance on incorrect input", () => {
    const word = createWordEntry("apple", "builtin");
    expect(word).not.toBeNull();
    const state = createInitialSession([word!]);

    const next = applyKeystroke(state, "z", 100);

    expect(next.charIndex).toBe(0);
    expect(next.mistakes).toBe(1);
    expect(next.lastInputCorrect).toBe(false);
    expect(next.lastMistypedKey).toBe("z");
  });

  it("clears mistype state after the next correct key", () => {
    const word = createWordEntry("apple", "builtin");
    expect(word).not.toBeNull();
    let state = createInitialSession([word!]);

    state = applyKeystroke(state, "z", 100);
    state = applyKeystroke(state, "a", 120);

    expect(state.charIndex).toBe(1);
    expect(state.lastInputCorrect).toBe(true);
    expect(state.lastMistypedKey).toBeNull();
  });

  it("completes the word and records a result", () => {
    const word = createWordEntry("go", "builtin");
    expect(word).not.toBeNull();
    let state = createInitialSession([word!]);

    state = applyKeystroke(state, "g", 100);
    state = applyKeystroke(state, "o", 160);

    expect(state.isComplete).toBe(true);
    expect(state.completedWords).toHaveLength(1);
    expect(state.completedWords[0].word).toBe("go");
  });

  it("shuffles when requested", () => {
    const words = ["apple", "book", "chair"].map((value) => createWordEntry(value, "builtin")!);
    const randomSpy = vi.spyOn(Math, "random").mockReturnValue(0);

    const queue = buildSessionQueue(words, 3, true);

    expect(queue.map((word) => word.text)).toEqual(["book", "chair", "apple"]);
    randomSpy.mockRestore();
  });
});
