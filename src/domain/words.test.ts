import { describe, expect, it } from "vitest";
import { createWordEntry, resolveBuiltinWords } from "./words";

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
});
