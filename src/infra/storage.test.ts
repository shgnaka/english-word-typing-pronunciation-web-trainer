import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  clearBuiltinWordOrder,
  clearBuiltinWordOverrides,
  defaultStorageScopeId,
  defaultSessionConfig,
  defaultThemePreference,
  defaultWordsPanelState,
  loadCurrentProfileId,
  loadBuiltinWordOrder,
  loadBuiltinWordOverrides,
  loadCustomWords,
  loadProfiles,
  loadSessionConfig,
  loadThemePreference,
  loadWordsPanelState,
  saveCurrentProfileId,
  saveBuiltinWordOrder,
  saveBuiltinWordOverrides,
  saveCustomWords,
  saveSessionConfig,
  saveProfiles,
  saveThemePreference,
  saveWordsPanelState
} from "./storage";
import type { BuiltinWordOverrides, ThemePreference, WordEntry, WordOrder } from "../domain/types";

const customWordsKey = "wordbeat.customWords";
const scopedCustomWordsKey = "wordbeat.alice.customWords";
const builtinWordOrderKey = "wordbeat.builtinWordOrder";
const builtinWordOverridesKey = "wordbeat.builtinWordOverrides";
const sessionConfigKey = "wordbeat.sessionConfig";
const wordsPanelStateKey = "wordbeat.wordsPanelState";
const themePreferenceKey = "wordbeat.themePreference";
const profilesKey = "wordbeat.profiles";
const currentProfileIdKey = "wordbeat.currentProfileId";

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

  it("loads the default profile list when none exists", () => {
    expect(loadProfiles()).toEqual([
      {
        id: defaultStorageScopeId,
        name: "Profile 1",
        createdAt: "1970-01-01T00:00:00.000Z",
        updatedAt: "1970-01-01T00:00:00.000Z"
      }
    ]);
  });

  it("saves profiles in a versioned format", () => {
    const profiles = [
      {
        id: defaultStorageScopeId,
        name: "Profile 1",
        createdAt: "1970-01-01T00:00:00.000Z",
        updatedAt: "1970-01-01T00:00:00.000Z"
      },
      {
        id: "alice",
        name: "Profile 2",
        createdAt: "2026-03-19T00:00:00.000Z",
        updatedAt: "2026-03-19T00:00:00.000Z"
      }
    ];

    saveProfiles(profiles);

    expect(JSON.parse(window.localStorage.getItem(profilesKey) ?? "null")).toEqual({
      version: 1,
      value: profiles
    });
  });

  it("touches the profile when saving scoped data", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-03-20T12:34:56.000Z"));

    saveProfiles([
      {
        id: defaultStorageScopeId,
        name: "Profile 1",
        createdAt: "1970-01-01T00:00:00.000Z",
        updatedAt: "1970-01-01T00:00:00.000Z"
      },
      {
        id: "alice",
        name: "Profile 2",
        createdAt: "2026-03-19T00:00:00.000Z",
        updatedAt: "2026-03-19T00:00:00.000Z"
      }
    ]);

    saveCustomWords([], "alice");

    expect(loadProfiles()).toEqual([
      {
        id: defaultStorageScopeId,
        name: "Profile 1",
        createdAt: "1970-01-01T00:00:00.000Z",
        updatedAt: "1970-01-01T00:00:00.000Z"
      },
      {
        id: "alice",
        name: "Profile 2",
        createdAt: "2026-03-19T00:00:00.000Z",
        updatedAt: "2026-03-20T12:34:56.000Z"
      }
    ]);

    vi.useRealTimers();
  });

  it("loads and saves the current profile id", () => {
    expect(loadCurrentProfileId()).toBe(defaultStorageScopeId);

    saveCurrentProfileId("alice");

    expect(window.localStorage.getItem(currentProfileIdKey)).toBe("alice");
    expect(loadCurrentProfileId()).toBe("alice");
  });

  it("saves scoped custom words under a scoped key", () => {
    const words: WordEntry[] = [
      {
        id: "custom-orange",
        text: "orange",
        normalizedText: "orange",
        source: "custom",
        createdAt: "2026-03-08T00:00:00.000Z"
      }
    ];

    saveCustomWords(words, "alice");

    expect(JSON.parse(window.localStorage.getItem(scopedCustomWordsKey) ?? "null")).toEqual({
      version: 1,
      value: words
    });
    expect(window.localStorage.getItem(customWordsKey)).toBeNull();
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

  it("loads scoped custom words and migrates them to the versioned format", () => {
    const legacyWords: WordEntry[] = [
      {
        id: "custom-peach",
        text: "peach",
        normalizedText: "peach",
        source: "custom",
        createdAt: "2026-03-08T00:00:00.000Z"
      }
    ];
    window.localStorage.setItem(scopedCustomWordsKey, JSON.stringify(legacyWords));

    expect(loadCustomWords("alice")).toEqual(legacyWords);
    expect(JSON.parse(window.localStorage.getItem(scopedCustomWordsKey) ?? "null")).toEqual({
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
        showKeyboardHint: true,
        showWordReading: false
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

  it("defaults showWordReading to false when loading legacy session config", () => {
    window.localStorage.setItem(
      sessionConfigKey,
      JSON.stringify({
        wordCount: 5,
        showKeyboardHint: false
      })
    );

    expect(loadSessionConfig()).toEqual({
      ...defaultSessionConfig,
      wordCount: 5,
      showKeyboardHint: false,
      showWordReading: false
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

  it("loads legacy theme preference and migrates it to the versioned format", () => {
    window.localStorage.setItem(
      themePreferenceKey,
      JSON.stringify({
        themeId: "forest",
        accent: "sky",
        backgroundIntensity: 84
      })
    );

    expect(loadThemePreference()).toEqual({
      themeId: "forest",
      accent: "sky",
      backgroundIntensity: 84
    });
    expect(JSON.parse(window.localStorage.getItem(themePreferenceKey) ?? "null")).toEqual({
      version: 1,
      value: {
        themeId: "forest",
        accent: "sky",
        backgroundIntensity: 84
      }
    });
  });

  it("falls back to the default theme preference for malformed theme values", () => {
    window.localStorage.setItem(
      themePreferenceKey,
      JSON.stringify({
        version: 1,
        value: {
          themeId: "midnight",
          accent: "gold",
          backgroundIntensity: 999
        }
      })
    );

    expect(loadThemePreference()).toEqual({
      ...defaultThemePreference,
      backgroundIntensity: 100
    });
  });

  it("saves theme preference in a versioned format", () => {
    const themePreference: ThemePreference = {
      themeId: "ocean",
      accent: "rose",
      backgroundIntensity: 35
    };

    saveThemePreference(themePreference);

    expect(JSON.parse(window.localStorage.getItem(themePreferenceKey) ?? "null")).toEqual({
      version: 1,
      value: themePreference
    });
  });
});
