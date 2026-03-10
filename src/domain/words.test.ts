import { describe, expect, it } from "vitest";
import { createWordEntry, orderWords, resolveBuiltinWords, sanitizeWordOrder } from "./words";

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

  it("sanitizes word order by removing stale ids and appending missing ids", () => {
    const words = [createWordEntry("apple", "builtin")!, createWordEntry("book", "builtin")!, createWordEntry("chair", "custom")!];

    expect(sanitizeWordOrder(words, ["builtin-book", "builtin-stale"])).toEqual([
      "builtin-book",
      "builtin-apple",
      "custom-chair"
    ]);
  });

  it("orders mixed words using the sanitized persisted order", () => {
    const words = [createWordEntry("apple", "builtin")!, createWordEntry("book", "builtin")!, createWordEntry("chair", "custom")!];

    const ordered = orderWords(words, ["custom-chair"]);

    expect(ordered.map((word) => word.text)).toEqual(["chair", "apple", "book"]);
  });
});
