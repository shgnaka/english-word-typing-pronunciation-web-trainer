import { describe, expect, it } from "vitest";
import { isBrowserTtsCacheExpired } from "./browserTts";

describe("browserTts cache policy", () => {
  it("marks records older than 30 days as expired", () => {
    const now = Date.UTC(2026, 2, 8);
    const thirtyOneDaysAgo = now - 1000 * 60 * 60 * 24 * 31;

    expect(isBrowserTtsCacheExpired(thirtyOneDaysAgo, now)).toBe(true);
  });

  it("keeps recent records available", () => {
    const now = Date.UTC(2026, 2, 8);
    const sevenDaysAgo = now - 1000 * 60 * 60 * 24 * 7;

    expect(isBrowserTtsCacheExpired(sevenDaysAgo, now)).toBe(false);
  });
});
