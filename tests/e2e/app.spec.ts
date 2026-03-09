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

test("rebuilds the active session after deleting a custom word", async ({ page }) => {
  await page.getByTestId("tab-words").click();
  await page.getByTestId("new-word-input").fill("banana");
  await page.getByTestId("add-word-button").click();

  await page.getByTestId("tab-settings").click();
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
  await page.getByTestId("delete-word-button-custom-banana").click();
  await page.getByTestId("tab-practice").click();

  await expect(page.getByTestId("current-word")).toHaveText("language");
});

test("persists settings after reload", async ({ page }) => {
  await page.getByTestId("tab-settings").click();
  await page.getByTestId("language-ja-hira").click();
  await page.getByTestId("word-count-input").fill("1");
  await page.getByTestId("browser-tts-toggle").check();
  await page.getByTestId("speech-toggle").uncheck();
  await page.getByTestId("keyboard-hint-toggle").uncheck();
  await page.getByTestId("finger-guide-toggle").uncheck();
  await page.getByTestId("apply-settings-button").click();

  await page.reload();
  await page.getByTestId("tab-settings").click();

  await expect(page.getByTestId("tab-practice")).toHaveText("れんしゅう");
  await expect(page.getByTestId("word-count-input")).toHaveValue("1");
  await expect(page.getByTestId("browser-tts-toggle")).toBeChecked();
  await expect(page.getByTestId("speech-toggle")).not.toBeChecked();
  await expect(page.getByTestId("keyboard-hint-toggle")).not.toBeChecked();
  await expect(page.getByTestId("finger-guide-toggle")).not.toBeChecked();
});

test("shows pending settings until they are applied", async ({ page }) => {
  await page.getByTestId("tab-settings").click();
  await page.getByTestId("word-count-input").fill("1");

  await expect(page.getByTestId("settings-status")).toContainText("You have unapplied changes.");

  await page.getByTestId("tab-practice").click();
  await expect(page.getByTestId("progress-count")).toHaveText("0 / 10 words");

  await page.getByTestId("tab-settings").click();
  await page.getByTestId("apply-settings-button").click();
  await expect(page.getByTestId("progress-count")).toHaveText("0 / 1 words");
});

test("can discard pending settings changes", async ({ page }) => {
  await page.getByTestId("tab-settings").click();
  await page.getByTestId("shuffle-toggle").check();
  await expect(page.getByTestId("settings-status")).toContainText("You have unapplied changes.");

  await page.getByTestId("discard-settings-button").click();

  await expect(page.getByTestId("shuffle-toggle")).not.toBeChecked();
  await expect(page.getByTestId("settings-status")).toContainText("Current session already matches these settings.");
});

test("shows feedback on incorrect input", async ({ page }) => {
  await page.getByTestId("skip-countdown-button").click();
  await page.keyboard.press("z");
  await expect(page.getByTestId("feedback")).toHaveText("Wrong key: Z. Keep aiming for the highlighted letter.");
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

  await expect(page.getByTestId("feedback")).toHaveText("Keep typing.");
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
  await expect(page.getByTestId("feedback")).toHaveClass(/persistent/);
});

test("keeps guides visible during typing even when assist settings are turned off", async ({ page }) => {
  await page.getByTestId("tab-settings").click();
  await page.getByTestId("keyboard-hint-toggle").uncheck();
  await page.getByTestId("finger-guide-toggle").uncheck();
  await page.getByTestId("apply-settings-button").click();

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
  await expect(page.getByTestId("countdown-banner")).toContainText("Start in 3");
  await page.keyboard.press("Enter");
  await expect(page.getByTestId("countdown-banner")).toBeHidden({ timeout: 1000 });
});

test("resumes typing after a practice action button is clicked", async ({ page }) => {
  await page.getByTestId("skip-countdown-button").click();
  await page.getByTestId("pronounce-button").click();
  await page.keyboard.press("a");

  await expect(page.getByTestId("active-keycap")).toHaveText("P");
});

test("completes a single-word session and shows results", async ({ page }) => {
  await page.getByTestId("tab-settings").click();
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
  await page.getByTestId("tab-settings").click();
  await page.getByTestId("word-count-input").fill("99");

  await expect(page.getByTestId("word-count-input")).toHaveValue("20");

  await page.getByTestId("apply-settings-button").click();
  await expect(page.getByTestId("progress-count")).toHaveText("0 / 20 words");
});
