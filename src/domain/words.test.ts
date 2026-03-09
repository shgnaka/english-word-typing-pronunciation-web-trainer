import { describe, expect, it } from "vitest";
import { createWordEntry, orderBuiltinWords, resolveBuiltinWords, sanitizeBuiltinWordOrder } from "./words";

describe("words", () => {
  it("applies builtin edit overrides when resolving words", () => {
    const builtinWords = [createWordEntry("apple", "builtin")!, createWordEntry("book", "builtin")!];

    const resolved = resolveBuiltinWords(builtinWords, {
      "builtin-apple": {
        status: "edited",
        text: "apricot",
        normalizedText: "apricot",
        updatedAt: "2026-03-09T00:00:00.000Z"
      }
    });

    expect(resolved.map((word) => word.text)).toEqual(["apricot", "book"]);
  });

  it("omits deleted builtin words when resolving words", () => {
    const builtinWords = [createWordEntry("apple", "builtin")!, createWordEntry("book", "builtin")!];

    const resolved = resolveBuiltinWords(builtinWords, {
      "builtin-apple": {
        status: "deleted",
        updatedAt: "2026-03-09T00:00:00.000Z"
      }
    });

    expect(resolved.map((word) => word.text)).toEqual(["book"]);
  });

  it("sanitizes builtin word order by removing stale ids and appending missing ids", () => {
    const builtinWords = [createWordEntry("apple", "builtin")!, createWordEntry("book", "builtin")!, createWordEntry("chair", "builtin")!];

    expect(sanitizeBuiltinWordOrder(builtinWords, ["builtin-book", "builtin-stale"])).toEqual([
      "builtin-book",
      "builtin-apple",
      "builtin-chair"
    ]);
  });

  it("orders builtin words using the sanitized persisted order", () => {
    const builtinWords = [createWordEntry("apple", "builtin")!, createWordEntry("book", "builtin")!, createWordEntry("chair", "builtin")!];

    const ordered = orderBuiltinWords(builtinWords, ["builtin-book"]);

    expect(ordered.map((word) => word.text)).toEqual(["book", "apple", "chair"]);
  });
});
