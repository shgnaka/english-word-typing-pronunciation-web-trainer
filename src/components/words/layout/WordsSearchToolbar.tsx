import { t } from "../../../i18n";
import type { DisplayLanguage } from "../../../domain/types";

export function WordsSearchToolbar({
  language,
  searchInputId,
  searchValue,
  onSearchValueChange,
  resultSummaries
}: {
  language: DisplayLanguage;
  searchInputId: string;
  searchValue: string;
  onSearchValueChange: (value: string) => void;
  resultSummaries?: Array<{ id: string; label: string; count: number; onClick: () => void }>;
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
      {searchValue.trim() && resultSummaries && resultSummaries.length > 0 ? (
        <div className="words-search-summary" data-testid="word-search-summary">
          {resultSummaries.map((summary) => (
            <button
              key={summary.id}
              type="button"
              className="secondary search-summary-chip"
              data-testid={`search-result-count-chip-${summary.id}`}
              onClick={summary.onClick}
              aria-label={`${summary.label}: ${summary.count}`}
            >
              <span>{summary.label}</span>
              <strong>{summary.count}</strong>
            </button>
          ))}
        </div>
      ) : null}
    </section>
  );
}
