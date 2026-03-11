import { fingerButtonLabels, fingerLabels } from "./domain/keyboard";
import type { DisplayLanguage, FingerId } from "./domain/types";
import { practiceMessages } from "./i18n/catalogs/practice";
import { resultsMessages } from "./i18n/catalogs/results";
import { settingsMessages } from "./i18n/catalogs/settings";
import { tabMessages } from "./i18n/catalogs/tabs";
import { wordsMessages } from "./i18n/catalogs/words";

const messages = {
  en: {
    ...tabMessages.en,
    ...practiceMessages.en,
    ...wordsMessages.en,
    ...settingsMessages.en,
    ...resultsMessages.en
  },
  ja: {
    ...tabMessages.ja,
    ...practiceMessages.ja,
    ...wordsMessages.ja,
    ...settingsMessages.ja,
    ...resultsMessages.ja
  },
  "ja-hira": {
    ...tabMessages["ja-hira"],
    ...practiceMessages["ja-hira"],
    ...wordsMessages["ja-hira"],
    ...settingsMessages["ja-hira"],
    ...resultsMessages["ja-hira"]
  }
} as const;

export type MessageKey = keyof typeof messages.en;

export const displayLanguageOptions: Array<{ value: DisplayLanguage; label: string }> = [
  { value: "en", label: "English" },
  { value: "ja", label: "日本語" },
  { value: "ja-hira", label: "にほんご" }
];

export function t(language: DisplayLanguage, key: MessageKey): string {
  return messages[language][key];
}

export function formatMessage(
  language: DisplayLanguage,
  key: MessageKey,
  values: Record<string, string | number>
): string {
  return Object.entries(values).reduce(
    (message, [placeholder, value]) => message.split(`{${placeholder}}`).join(String(value)),
    t(language, key)
  );
}

export function getFingerLabel(language: DisplayLanguage, fingerId: FingerId, fallback: string): string {
  if (language === "en") {
    return fallback;
  }

  return fingerLabels[language][fingerId];
}

export function getFingerButtonLabel(language: DisplayLanguage, fingerId: FingerId): string {
  return fingerButtonLabels[language][fingerId];
}
