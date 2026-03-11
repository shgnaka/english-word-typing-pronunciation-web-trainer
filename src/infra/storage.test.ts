import { beforeEach, describe, expect, it } from "vitest";
import {
  clearBuiltinWordOrder,
  clearBuiltinWordOverrides,
  defaultSessionConfig,
  defaultWordsPanelState,
  loadBuiltinWordOrder,
  loadBuiltinWordOverrides,
  loadCustomWords,
  loadSessionConfig,
  loadWordsPanelState,
  saveBuiltinWordOrder,
  saveBuiltinWordOverrides,
  saveCustomWords,
  saveSessionConfig,
  saveWordsPanelState
} from "./storage";
import type { BuiltinWordOverrides, WordEntry, WordOrder } from "../domain/types";

const customWordsKey = "wordbeat.customWords";
const builtinWordOrderKey = "wordbeat.builtinWordOrder";
const builtinWordOverridesKey = "wordbeat.builtinWordOverrides";
const sessionConfigKey = "wordbeat.sessionConfig";
const wordsPanelStateKey = "wordbeat.wordsPanelState";

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

  it("filters malformed custom words before migrating them", () => {
    window.localStorage.setItem(
      customWordsKey,
      JSON.stringify([
        {
          id: "custom-banana",
          text: "Banana!!",
          normalizedText: "Banana!!",
          source: "custom",
          createdAt: "invalid-date"
        },
        {
          id: "",
          text: "123",
          source: "custom",
          createdAt: "2026-03-08T00:00:00.000Z"
        },
        null
      ])
    );

    expect(loadCustomWords()).toEqual([
      {
        id: "custom-banana",
        text: "banana",
        normalizedText: "banana",
        source: "custom",
        createdAt: "1970-01-01T00:00:00.000Z"
      }
    ]);
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
      browserTtsEnabled: false,
      showFingerGuide: false
    });
    expect(JSON.parse(window.localStorage.getItem(sessionConfigKey) ?? "null")).toEqual({
      version: 1,
      value: {
        ...defaultSessionConfig,
        wordCount: 20,
        shuffle: false,
        speechEnabled: true,
        browserTtsEnabled: false,
        showFingerGuide: false,
        showKeyboardHint: true
      }
    });
  });

  it("falls back to default booleans for malformed session config flags", () => {
    window.localStorage.setItem(
      sessionConfigKey,
      JSON.stringify({
        version: 1,
        value: {
          shuffle: "yes",
          speechEnabled: 0,
          browserTtsEnabled: "nope",
          showFingerGuide: null,
          showKeyboardHint: "sometimes"
        }
      })
    );

    expect(loadSessionConfig()).toEqual(defaultSessionConfig);
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

  it("loads legacy builtin word overrides and migrates them to the versioned format", () => {
    const legacyOverrides = {
      "builtin-apple": {
        status: "edited",
        text: "apricot",
        normalizedText: "apricot",
        updatedAt: "2026-03-09T00:00:00.000Z"
      }
    };
    window.localStorage.setItem(builtinWordOverridesKey, JSON.stringify(legacyOverrides));

    expect(loadBuiltinWordOverrides()).toEqual(legacyOverrides);
    expect(JSON.parse(window.localStorage.getItem(builtinWordOverridesKey) ?? "null")).toEqual({
      version: 1,
      value: legacyOverrides
    });
  });

  it("drops malformed builtin word overrides before migrating them", () => {
    window.localStorage.setItem(
      builtinWordOverridesKey,
      JSON.stringify({
        "builtin-apple": {
          status: "edited",
          text: "Apricot!!!",
          normalizedText: "Apricot!!!",
          updatedAt: "invalid-date"
        },
        "builtin-book": {
          status: "edited",
          text: "123",
          updatedAt: "2026-03-09T00:00:00.000Z"
        },
        "builtin-chair": {
          status: "unknown",
          updatedAt: "2026-03-09T00:00:00.000Z"
        }
      })
    );

    expect(loadBuiltinWordOverrides()).toEqual({
      "builtin-apple": {
        status: "edited",
        text: "apricot",
        normalizedText: "apricot",
        updatedAt: "1970-01-01T00:00:00.000Z"
      }
    });
  });

  it("saves builtin word overrides in a versioned format", () => {
    const overrides: BuiltinWordOverrides = {
      "builtin-apple": {
        status: "deleted",
        updatedAt: "2026-03-09T00:00:00.000Z"
      }
    };

    saveBuiltinWordOverrides(overrides);

    expect(JSON.parse(window.localStorage.getItem(builtinWordOverridesKey) ?? "null")).toEqual({
      version: 1,
      value: overrides
    });
  });

  it("clears builtin word overrides by writing an empty versioned record", () => {
    const overrides: BuiltinWordOverrides = {
      "builtin-apple": {
        status: "deleted",
        updatedAt: "2026-03-09T00:00:00.000Z"
      }
    };
    saveBuiltinWordOverrides(overrides);

    clearBuiltinWordOverrides();

    expect(JSON.parse(window.localStorage.getItem(builtinWordOverridesKey) ?? "null")).toEqual({
      version: 1,
      value: {}
    });
  });

  it("loads legacy builtin word order and migrates it to the versioned format", () => {
    const legacyOrder: WordOrder = ["builtin-book", "builtin-apple"];
    window.localStorage.setItem(builtinWordOrderKey, JSON.stringify(legacyOrder));

    expect(loadBuiltinWordOrder()).toEqual(legacyOrder);
    expect(JSON.parse(window.localStorage.getItem(builtinWordOrderKey) ?? "null")).toEqual({
      version: 1,
      value: legacyOrder
    });
  });

  it("filters malformed builtin word order entries before migrating them", () => {
    window.localStorage.setItem(builtinWordOrderKey, JSON.stringify(["builtin-book", "", 3, null, "builtin-apple"]));

    expect(loadBuiltinWordOrder()).toEqual(["builtin-book", "builtin-apple"]);
  });

  it("saves builtin word order in a versioned format", () => {
    const order: WordOrder = ["builtin-book", "builtin-apple"];

    saveBuiltinWordOrder(order);

    expect(JSON.parse(window.localStorage.getItem(builtinWordOrderKey) ?? "null")).toEqual({
      version: 1,
      value: order
    });
  });

  it("clears builtin word order by writing an empty versioned record", () => {
    saveBuiltinWordOrder(["builtin-book", "builtin-apple"]);

    clearBuiltinWordOrder();

    expect(JSON.parse(window.localStorage.getItem(builtinWordOrderKey) ?? "null")).toEqual({
      version: 1,
      value: []
    });
  });

  it("loads legacy words panel state and migrates it to the versioned format", () => {
    window.localStorage.setItem(
      wordsPanelStateKey,
      JSON.stringify({
        builtinMinimized: true,
        inactiveCustomMinimized: true
      })
    );

    expect(loadWordsPanelState()).toEqual({
      ...defaultWordsPanelState,
      builtinMinimized: true,
      inactiveCustomMinimized: true
    });
    expect(JSON.parse(window.localStorage.getItem(wordsPanelStateKey) ?? "null")).toEqual({
      version: 1,
      value: {
        ...defaultWordsPanelState,
        builtinMinimized: true,
        inactiveCustomMinimized: true
      }
    });
  });

  it("saves words panel state in a versioned format", () => {
    saveWordsPanelState({
      ...defaultWordsPanelState,
      customMinimized: true
    });

    expect(JSON.parse(window.localStorage.getItem(wordsPanelStateKey) ?? "null")).toEqual({
      version: 1,
      value: {
        ...defaultWordsPanelState,
        customMinimized: true
      }
    });
  });
});
