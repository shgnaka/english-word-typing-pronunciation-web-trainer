import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
});

test("scrolls the primary panel into view when typing starts", async ({ page }) => {
  await page.evaluate(() => {
    (
      window as typeof window & {
        __scrollCalls?: Array<{ top?: number; behavior?: string }>;
      }
    ).__scrollCalls = [];
    const originalGetBoundingClientRect = HTMLElement.prototype.getBoundingClientRect;
    window.scrollTo = function (options?: ScrollToOptions | number, _y?: number) {
      if (typeof options === "number") {
        window.__scrollCalls?.push({ top: options });
        return;
      }
      window.__scrollCalls?.push({
        top: options?.top,
        behavior: options?.behavior
      });
    };
    HTMLElement.prototype.getBoundingClientRect = function () {
      const element = this as HTMLElement;
      if (element.dataset.testid === "primary-panel") {
        return {
          x: 0,
          y: 120,
          width: 400,
          height: 400,
          top: 120,
          right: 400,
          bottom: 520,
          left: 0,
          toJSON: () => ({})
        };
      }
      return originalGetBoundingClientRect.call(this);
    };
    Object.defineProperty(window, "scrollY", {
      configurable: true,
      value: 48
    });
  });

  await page.getByTestId("skip-countdown-button").click();

  await expect
    .poll(() =>
      page.evaluate(() => (window as typeof window & { __scrollCalls?: Array<{ top?: number; behavior?: string }> }).__scrollCalls ?? [])
    )
    .toEqual([{ top: 168, behavior: "smooth" }]);
});

test("shows the main practice guidance", async ({ page }) => {
  await expect(page.getByTestId("current-word")).toHaveText("apple");
  await expect(page.getByTestId("pronounce-button")).toBeVisible();
  await expect(page.getByTestId("practice-step-hint")).toContainText("Watch the highlighted letter");
  await expect(page.getByTestId("active-keycap")).toHaveText("A");
  await expect(page.getByTestId("finger-button-label")).toHaveText("Left pinky");
  await expect(page.getByTestId("active-finger-button")).toHaveAttribute("data-finger-id", "left-pinky");
});

test("switches the display language from settings", async ({ page }) => {
  await page.getByTestId("tab-settings").click();
  await page.getByTestId("language-ja").click();

  await expect(page.getByTestId("tab-practice")).toHaveText("練習");
  await expect(page.getByText("表示言語")).toBeVisible();

  await page.getByTestId("tab-practice").click();
  await expect(page.getByTestId("finger-button-label")).toHaveText("左小指");
  await expect(page.getByTestId("active-finger-button")).toHaveText("左小");
});

test("navigates across all tabs", async ({ page }) => {
  await page.getByTestId("tab-words").click();
  await expect(page.getByText("Add your own practice words")).toBeVisible();

  await page.getByTestId("tab-settings").click();
  await expect(page.getByText("Control practice conditions")).toBeVisible();

  await page.getByTestId("tab-results").click();
  await expect(page.getByText("Review your typing result")).toBeVisible();

  await page.getByTestId("tab-practice").click();
  await expect(page.getByText("Current word")).toBeVisible();
});

test("adds a custom word and rejects duplicates", async ({ page }) => {
  await page.getByTestId("tab-words").click();
  await page.getByTestId("new-word-input").fill("banana");
  await page.getByTestId("add-word-button").click();

  await expect(page.getByTestId("custom-word-list")).toContainText("banana");

  await page.getByTestId("new-word-input").fill("banana");
  await page.getByTestId("add-word-button").click();

  await expect(page.getByTestId("add-word-error")).toHaveText("That word already exists.");
});

test("keeps the search input value visible after clearing and typing again", async ({ page }) => {
  await page.getByTestId("tab-words").click();

  const searchInput = page.getByTestId("word-search-input");
  await searchInput.fill("app");
  await expect(searchInput).toHaveValue("app");

  await searchInput.clear();
  await expect(searchInput).toHaveValue("");

  await searchInput.fill("ban");
  await expect(searchInput).toHaveValue("ban");
});

test("rebuilds the active session after deleting a custom word", async ({ page }) => {
  await page.getByTestId("tab-words").click();
  await page.getByTestId("new-word-input").fill("banana");
  await page.getByTestId("add-word-button").click();

  await page.getByTestId("tab-words").click();
  await page.evaluate(() => {
    let randomCallCount = 0;
    Math.random = () => {
      const nextValue = randomCallCount === 0 ? 0 : 0.999999;
      randomCallCount += 1;
      return nextValue;
    };
  });
  await page.getByTestId("word-count-input").fill("20");
  await page.getByTestId("shuffle-toggle").check();
  await page.getByTestId("apply-settings-button").click();
  await expect(page.getByTestId("current-word")).toHaveText("banana");

  await page.getByTestId("tab-words").click();
  await page.evaluate(() => {
    let randomCallCount = 0;
    Math.random = () => {
      const nextValue = randomCallCount === 0 ? 0 : 0.999999;
      randomCallCount += 1;
      return nextValue;
    };
  });
  await page.getByTestId("custom-word-list").getByTestId("more-row-actions-button-custom-banana").click();
  await page.getByTestId("custom-word-list").getByTestId("delete-word-button-custom-banana").click();
  await page.getByTestId("tab-practice").click();

  await expect(page.getByTestId("current-word")).toHaveText("language");
});

test("edits and restores a builtin word", async ({ page }) => {
  await page.getByTestId("tab-words").click();
  await page.getByTestId("edit-word-button-builtin-apple").click();
  await page.getByTestId("edit-word-input-builtin-apple").fill("apricot");
  await page.getByTestId("save-word-button-builtin-apple").click();

  await expect(page.getByTestId("builtin-word-list")).toContainText("apricot");
  await expect(page.getByTestId("builtin-word-state-builtin-apple")).toHaveText("Edited locally");

  await page.getByTestId("tab-practice").click();
  await expect(page.getByTestId("current-word")).toHaveText("apricot");

  await page.getByTestId("tab-words").click();
  await page.getByTestId("builtin-word-list").getByTestId("more-row-actions-button-builtin-apple").click();
  await page.getByTestId("restore-word-button-builtin-apple").click();
  await expect(page.getByTestId("builtin-word-list")).toContainText("apple");
  await expect(page.getByTestId("builtin-word-state-builtin-apple")).toHaveCount(0);
});

test("deletes a builtin word and can reset builtin overrides", async ({ page }) => {
  await page.getByTestId("tab-words").click();
  await page.getByTestId("builtin-word-list").getByTestId("more-row-actions-button-builtin-apple").click();
  await page.getByTestId("delete-word-button-builtin-apple").click();

  await expect(page.getByTestId("builtin-word-list")).not.toContainText("apple");
  await expect(page.getByTestId("hidden-builtin-word-list")).toContainText("apple");

  await page.getByTestId("tab-practice").click();
  await expect(page.getByTestId("current-word")).toHaveText("book");

  await page.getByTestId("tab-words").click();
  await page.getByTestId("reset-builtin-words-button").click();
  await expect(page.getByTestId("builtin-word-list")).toContainText("apple");
  await expect(page.getByTestId("hidden-builtin-empty")).toContainText("No hidden built-in words.");
});

test("reorders builtin words in the mixed practice list and persists the order after reload", async ({ page }) => {
  await page.getByTestId("tab-words").click();
  await page.getByTestId("active-word-list").getByTestId("more-row-actions-button-builtin-apple").click();
  await page.getByTestId("active-word-list").getByTestId("move-word-down-button-builtin-apple").click();

  const activeWordChips = page.getByTestId("active-word-chip");
  await expect(activeWordChips.nth(0)).toHaveText("book");
  await expect(activeWordChips.nth(1)).toHaveText("apple");

  await page.reload();
  await page.getByTestId("tab-words").click();

  await expect(activeWordChips.nth(0)).toHaveText("book");
  await expect(activeWordChips.nth(1)).toHaveText("apple");
});

test("reorders mixed practice words with drag and drop", async ({ page }) => {
  await page.getByTestId("tab-words").click();

  const activeRows = page.getByTestId("active-word-row");
  await activeRows.nth(0).dragTo(activeRows.nth(2));

  const activeWordChips = page.getByTestId("active-word-chip");
  await expect(activeWordChips.nth(0)).toHaveText("book");
  await expect(activeWordChips.nth(1)).toHaveText("happy");
  await expect(activeWordChips.nth(2)).toHaveText("apple");
});

test("bulk-removes selected custom words from practice", async ({ page }) => {
  await page.getByTestId("tab-words").click();
  await page.getByTestId("new-word-input").fill("banana");
  await page.getByTestId("add-word-button").click();
  await page.getByTestId("new-word-input").fill("mango");
  await page.getByTestId("add-word-button").click();

  await page.getByTestId("select-custom-word-checkbox-custom-banana").check();
  await page.getByTestId("select-custom-word-checkbox-custom-mango").check();
  await page.getByTestId("bulk-remove-custom-words-button").click();

  const hiddenCustomWords = page.getByTestId("inactive-custom-word-list");
  await expect(hiddenCustomWords).toContainText("banana");
  await expect(hiddenCustomWords).toContainText("mango");
});

test("uses reordered mixed words for non-shuffled practice and reset restores shipped builtin order", async ({ page }) => {
  await page.getByTestId("tab-words").click();
  await page.getByTestId("new-word-input").fill("banana");
  await page.getByTestId("add-word-button").click();
  await page.getByTestId("active-word-list").getByTestId("more-row-actions-button-custom-banana").click();
  await page.getByTestId("active-word-list").getByTestId("move-word-top-button-custom-banana").click();

  await page.getByTestId("tab-practice").click();
  await expect(page.getByTestId("current-word")).toHaveText("banana");

  await page.getByTestId("tab-words").click();
  await page.getByTestId("reset-builtin-words-button").click();

  const builtinWordChips = page.getByTestId("builtin-word-chip");
  await expect(builtinWordChips.nth(0)).toHaveText("apple");
  await expect(builtinWordChips.nth(1)).toHaveText("book");
});

test("persists settings after reload", async ({ page }) => {
  await page.getByTestId("tab-settings").click();
  await page.getByTestId("language-ja-hira").click();
  await page.getByTestId("tab-words").click();
  await page.getByTestId("word-count-input").fill("1");
  await page.getByTestId("apply-settings-button").click();
  await page.getByTestId("tab-settings").click();
  await page.getByTestId("browser-tts-toggle").check();
  await page.getByTestId("speech-toggle").uncheck();
  await page.getByTestId("keyboard-hint-toggle").uncheck();
  await page.getByTestId("finger-guide-toggle").uncheck();
  await page.getByTestId("apply-settings-button").click();

  await page.reload();
  await page.getByTestId("tab-settings").click();

  await expect(page.getByTestId("tab-practice")).toHaveText("れんしゅう");
  await expect(page.getByTestId("browser-tts-toggle")).toBeChecked();
  await expect(page.getByTestId("speech-toggle")).not.toBeChecked();
  await expect(page.getByTestId("keyboard-hint-toggle")).not.toBeChecked();
  await expect(page.getByTestId("finger-guide-toggle")).not.toBeChecked();
  await page.getByTestId("tab-words").click();
  await expect(page.getByTestId("word-count-input")).toHaveValue("1");
});

test("shows pending settings until they are applied", async ({ page }) => {
  await page.getByTestId("tab-words").click();
  await page.getByTestId("word-count-input").fill("1");

  await expect(page.getByTestId("words-session-config-status")).toContainText("You have unapplied changes.");

  await page.getByTestId("tab-practice").click();
  await expect(page.getByTestId("progress-count")).toHaveText("0 / 10 words");

  await page.getByTestId("tab-words").click();
  await page.getByTestId("apply-settings-button").click();
  await expect(page.getByTestId("progress-count")).toHaveText("0 / 1 words");
});

test("shows session size and clamped outcome in the words page summary", async ({ page }) => {
  await page.getByTestId("tab-words").click();

  await expect(page.getByTestId("word-stat-session-size")).toContainText("1 session");
  await expect(page.getByTestId("word-stat-session-size")).toContainText("10");
  await expect(page.getByTestId("words-session-outcome-summary")).toContainText("Practice order: 20 words");
  await expect(page.getByTestId("words-session-outcome-summary")).toContainText("This session: 10 words");

  await page.getByTestId("word-count-input").fill("20");

  await expect(page.getByTestId("word-stat-session-size")).toContainText("20");
  await expect(page.getByTestId("words-session-outcome-summary")).toContainText("Practice order: 20 words");
  await expect(page.getByTestId("words-session-outcome-summary")).toContainText("This session: 20 words");
  await expect(page.getByTestId("words-session-clamp-hint")).toHaveCount(0);

  await page.getByTestId("builtin-word-list").getByTestId("more-row-actions-button-builtin-apple").click();
  await page.getByTestId("builtin-word-list").getByTestId("delete-word-button-builtin-apple").click();

  await expect(page.getByTestId("words-session-outcome-summary")).toContainText("Practice order: 19 words");
  await expect(page.getByTestId("words-session-outcome-summary")).toContainText("This session: 19 words");
  await expect(page.getByTestId("words-session-clamp-hint")).toContainText(
    "Only 19 words are in the practice order, so this session will use 19."
  );

  await page.getByTestId("new-word-input").fill("banana");
  await page.getByTestId("add-word-button").click();

  await expect(page.getByTestId("words-session-outcome-summary")).toContainText("Practice order: 20 words");
  await expect(page.getByTestId("words-session-outcome-summary")).toContainText("This session: 20 words");
  await expect(page.getByTestId("words-session-clamp-hint")).toHaveCount(0);
});

test("can discard pending settings changes", async ({ page }) => {
  await page.getByTestId("tab-words").click();
  await page.getByTestId("shuffle-toggle").check();
  await expect(page.getByTestId("words-session-config-status")).toContainText("You have unapplied changes.");

  await page.getByTestId("tab-settings").click();
  await page.getByTestId("discard-settings-button").click();

  await page.getByTestId("tab-words").click();
  await expect(page.getByTestId("shuffle-toggle")).not.toBeChecked();
  await page.getByTestId("tab-settings").click();
  await expect(page.getByTestId("settings-status")).toContainText("Current session already matches these settings.");
});

test("shows feedback on incorrect input", async ({ page }) => {
  await page.getByTestId("skip-countdown-button").click();
  await page.keyboard.press("z");
  await expect(page.getByTestId("practice-primary-status")).toHaveText("Wrong key: Z. Keep aiming for the highlighted letter.");
  await expect(page.getByTestId("target-char")).toHaveClass(/error/);
  await expect(page.getByTestId("mistyped-keycap")).toHaveText("Z");
  await expect(page.getByTestId("mistyped-keycap")).toHaveClass(/mistyped/);
  await expect(page.getByTestId("active-keycap")).toHaveClass(/target-outline/);
  await expect(page.getByTestId("active-finger-button")).toHaveClass(/target-outline/);
  await expect(page.getByTestId("active-finger-button")).not.toHaveClass(/active/);
});

test("clears mistype emphasis after the next correct key", async ({ page }) => {
  await page.getByTestId("skip-countdown-button").click();
  await page.keyboard.press("z");
  await page.keyboard.press("a");

  await expect(page.getByTestId("practice-primary-status")).toContainText("Keep typing.");
  await expect(page.getByTestId("mistyped-keycap")).toHaveCount(0);
  await expect(page.getByTestId("active-keycap")).not.toHaveClass(/target-outline/);
  await expect(page.getByTestId("active-finger-button")).not.toHaveClass(/target-outline/);
});

test("enters the focused practice layout once typing starts", async ({ page }) => {
  await page.getByTestId("skip-countdown-button").click();

  await expect(page.getByTestId("practice-panel")).toHaveClass(/typing-active-layout/);
  await expect(page.getByTestId("practice-metrics-bar")).toBeVisible();
  await expect(page.getByTestId("practice-word-stage")).toBeVisible();
  await expect(page.getByTestId("keyboard-guide-slot")).toBeVisible();
  await expect(page.getByTestId("finger-guide-slot")).toBeVisible();
  await expect(page.getByTestId("practice-primary-status")).toBeVisible();
});

test("collapses the finger guide by default on mobile typing layouts", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByTestId("skip-countdown-button").click();

  await expect(page.getByTestId("keyboard-guide-toggle")).toHaveAttribute("aria-expanded", "true");
  await expect(page.getByTestId("finger-guide-toggle")).toHaveAttribute("aria-expanded", "false");
  await expect(page.getByTestId("keyboard-visual")).toBeVisible();
  await expect(page.getByTestId("finger-button-visual")).toHaveCount(0);

  await page.getByTestId("finger-guide-toggle").click();
  await expect(page.getByTestId("finger-guide-toggle")).toHaveAttribute("aria-expanded", "true");
  await expect(page.getByTestId("finger-button-visual")).toBeVisible();
});

test("keeps guides visible during typing even when assist settings are turned off", async ({ page }) => {
  await page.getByTestId("tab-settings").click();
  await page.getByTestId("keyboard-hint-toggle").uncheck();
  await page.getByTestId("finger-guide-toggle").uncheck();
  await expect(page.getByTestId("apply-settings-button")).toBeDisabled();

  await page.getByTestId("tab-practice").click();
  await page.getByTestId("skip-countdown-button").click();

  await expect(page.getByTestId("keyboard-visual")).toBeVisible();
  await expect(page.getByTestId("finger-button-visual")).toBeVisible();

  const keyboardBox = await page.getByTestId("keyboard-guide-slot").boundingBox();
  const fingerBox = await page.getByTestId("finger-guide-slot").boundingBox();
  expect(keyboardBox).not.toBeNull();
  expect(fingerBox).not.toBeNull();
  expect(keyboardBox!.y).toBeLessThan(fingerBox!.y);
});

test("updates the finger button guide as typing advances", async ({ page }) => {
  await page.getByTestId("skip-countdown-button").click();

  await expect(page.getByTestId("active-finger-button")).toHaveAttribute("data-finger-id", "left-pinky");
  await page.keyboard.press("a");
  await expect(page.getByTestId("active-finger-button")).toHaveAttribute("data-finger-id", "right-pinky");
});

test("supports Enter to add words and skip countdown", async ({ page }) => {
  await page.getByTestId("tab-words").click();
  await page.getByTestId("new-word-input").fill("banana");
  await page.getByTestId("new-word-input").press("Enter");
  await expect(page.getByTestId("custom-word-list")).toContainText("banana");

  await page.getByTestId("tab-practice").click();
  await expect(page.getByTestId("practice-primary-status")).toContainText("Start in 3");
  await page.keyboard.press("Enter");
  await expect(page.getByTestId("practice-primary-status")).not.toContainText("Start in 3");
  await expect(page.getByTestId("current-word")).toHaveText("apple");
});

test("resumes typing after a practice action button is clicked", async ({ page }) => {
  await page.getByTestId("skip-countdown-button").click();
  await page.getByTestId("pronounce-button").click();
  await page.keyboard.press("a");

  await expect(page.getByTestId("active-keycap")).toHaveText("P");
});

test("completes a single-word session and shows results", async ({ page }) => {
  await page.getByTestId("tab-words").click();
  await page.getByTestId("word-count-input").fill("1");
  await page.getByTestId("apply-settings-button").click();

  await expect(page.getByTestId("current-word")).toHaveText("apple");
  await page.getByTestId("skip-countdown-button").click();
  await page.keyboard.type("apple");

  await expect(page.getByTestId("score-wpm")).not.toHaveText("0");
  await expect(page.getByTestId("score-accuracy")).toContainText("%");
  await expect(page.getByTestId("score-level")).not.toHaveText("");
  await expect(page.getByTestId("results-summary")).toContainText("Score blends speed and accuracy");
  await expect(page.getByTestId("results-list")).toContainText("apple");
});

test("clamps an oversized word count before saving", async ({ page }) => {
  await page.getByTestId("tab-words").click();
  await page.getByTestId("word-count-input").fill("99");

  await expect(page.getByTestId("word-count-input")).toHaveValue("20");

  await page.getByTestId("apply-settings-button").click();
  await expect(page.getByTestId("progress-count")).toHaveText("0 / 20 words");
});
