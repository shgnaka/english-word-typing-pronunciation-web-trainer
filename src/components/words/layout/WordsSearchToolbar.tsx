import { t } from "../../../i18n";
import type { DisplayLanguage } from "../../../domain/types";

export function WordsSearchToolbar({
  language,
  searchInputId,
  searchValue,
  onSearchValueChange
}: {
  language: DisplayLanguage;
  searchInputId: string;
  searchValue: string;
  onSearchValueChange: (value: string) => void;
}) {
  return (
    <section className="words-toolbar" aria-label={t(language, "words.searchLabel")}>
      <label className="search-field" htmlFor={searchInputId}>
        <span className="label">{t(language, "words.searchLabel")}</span>
        <input
          id={searchInputId}
          data-testid="word-search-input"
          value={searchValue}
          onChange={(event) => onSearchValueChange(event.target.value)}
          placeholder={t(language, "words.searchPlaceholder")}
          aria-label={t(language, "words.searchLabel")}
        />
      </label>
      <p className="words-toolbar-hint">{t(language, "words.manageHint")}</p>
    </section>
  );
}
