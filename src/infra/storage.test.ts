import { beforeEach, describe, expect, it } from "vitest";
import {
  defaultSessionConfig,
  loadCustomWords,
  loadSessionConfig,
  saveCustomWords,
  saveSessionConfig
} from "./storage";
import type { WordEntry } from "../domain/types";

const customWordsKey = "wordbeat.customWords";
const sessionConfigKey = "wordbeat.sessionConfig";

describe("storage", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("saves custom words in a versioned format", () => {
    const words: WordEntry[] = [
      {
        id: "custom-apple",
        text: "apple",
        normalizedText: "apple",
        source: "custom",
        createdAt: "2026-03-08T00:00:00.000Z"
      }
    ];

    saveCustomWords(words);

    expect(JSON.parse(window.localStorage.getItem(customWordsKey) ?? "null")).toEqual({
      version: 1,
      value: words
    });
  });

  it("loads legacy custom words and migrates them to the versioned format", () => {
    const legacyWords: WordEntry[] = [
      {
        id: "custom-banana",
        text: "banana",
        normalizedText: "banana",
        source: "custom",
        createdAt: "2026-03-08T00:00:00.000Z"
      }
    ];
    window.localStorage.setItem(customWordsKey, JSON.stringify(legacyWords));

    expect(loadCustomWords()).toEqual(legacyWords);
    expect(JSON.parse(window.localStorage.getItem(customWordsKey) ?? "null")).toEqual({
      version: 1,
      value: legacyWords
    });
  });

  it("loads legacy session config and migrates it to the versioned format", () => {
    window.localStorage.setItem(
      sessionConfigKey,
      JSON.stringify({
        wordCount: 99,
        browserTtsEnabled: 1,
        showFingerGuide: false
      })
    );

    expect(loadSessionConfig()).toEqual({
      ...defaultSessionConfig,
      wordCount: 20,
      browserTtsEnabled: true,
      showFingerGuide: false
    });
    expect(JSON.parse(window.localStorage.getItem(sessionConfigKey) ?? "null")).toEqual({
      version: 1,
      value: {
        ...defaultSessionConfig,
        wordCount: 20,
        shuffle: false,
        speechEnabled: true,
        browserTtsEnabled: true,
        showFingerGuide: false,
        showKeyboardHint: true
      }
    });
  });

  it("saves session config in a versioned format", () => {
    saveSessionConfig({
      ...defaultSessionConfig,
      wordCount: 3,
      shuffle: true
    });

    expect(JSON.parse(window.localStorage.getItem(sessionConfigKey) ?? "null")).toEqual({
      version: 1,
      value: {
        ...defaultSessionConfig,
        wordCount: 3,
        shuffle: true
      }
    });
  });
});
