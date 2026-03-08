import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
});

test("shows the main practice guidance", async ({ page }) => {
  await expect(page.getByTestId("current-word")).toHaveText("apple");
  await expect(page.getByTestId("next-key")).toHaveText("a");
  await expect(page.getByTestId("finger-guide")).toContainText("Left");
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

test("persists settings after reload", async ({ page }) => {
  await page.getByTestId("tab-settings").click();
  await page.getByTestId("language-ja-hira").click();
  await page.getByTestId("word-count-input").fill("1");
  await page.getByTestId("speech-toggle").uncheck();
  await page.getByTestId("keyboard-hint-toggle").uncheck();
  await page.getByTestId("finger-guide-toggle").uncheck();
  await page.getByTestId("apply-settings-button").click();

  await page.reload();
  await page.getByTestId("tab-settings").click();

  await expect(page.getByTestId("tab-practice")).toHaveText("れんしゅう");
  await expect(page.getByTestId("word-count-input")).toHaveValue("1");
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
  await expect(page.getByTestId("feedback")).toHaveText("Incorrect key. Stay on the highlighted character.");
  await expect(page.getByTestId("next-key")).toHaveText("a");
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

test("does not progress typing while an action button is focused", async ({ page }) => {
  await page.getByTestId("skip-countdown-button").click();
  await page.getByTestId("pronounce-button").focus();
  await page.keyboard.press("a");

  await expect(page.getByTestId("next-key")).toHaveText("a");
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
  await expect(page.getByTestId("results-list")).toContainText("apple");
});
