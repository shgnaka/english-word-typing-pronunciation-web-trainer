import type { DisplayLanguage } from "../../domain/types";

export function defineMessages<T extends Record<string, string>>(messages: {
  en: T;
  ja: T;
  "ja-hira": T;
}) {
  return messages satisfies Record<DisplayLanguage, T>;
}
