import type { SessionConfig, WordEntry } from "../../domain/types";
import type { PronunciationStatus } from "./useTrainerPronunciation";

export interface SpeakWordResult {
  source: "browser-cache" | "browser-generated" | "speech-synthesis" | "none";
}

interface PronunciationOrchestratorDependencies {
  hasCachedWordAudio: (word: string) => Promise<boolean>;
  preloadBrowserTtsWords: (words: string[]) => void;
  speakWord: (
    word: string,
    options: {
      browserTtsEnabled?: boolean;
      trigger?: "auto" | "manual";
    }
  ) => Promise<SpeakWordResult>;
}

interface SyncCurrentWordArgs {
  screen: "practice" | "words" | "settings" | "results";
  countdown: number;
  sessionKey: string | null;
  currentWord: string | null;
  speechEnabled: boolean;
  browserTtsEnabled: boolean;
  isComplete: boolean;
}

export class PronunciationOrchestrator {
  private lastAutoPronouncedKey: string | null = null;
  private currentWordToken = 0;
  private latestManualRequestToken = 0;
  private isManualPronunciationPending = false;

  constructor(
    private readonly dependencies: PronunciationOrchestratorDependencies,
  private readonly onStatusChange: (status: PronunciationStatus) => void
  ) {}

  private setPronunciationStatus(status: PronunciationStatus) {
    this.onStatusChange(status);
  }

  syncCurrentWord(args: SyncCurrentWordArgs) {
    this.currentWordToken += 1;
    this.setPronunciationStatus("idle");

    if (args.screen !== "practice" || args.countdown > 0 || !args.speechEnabled || !args.currentWord || args.isComplete || !args.sessionKey) {
      return;
    }

    if (this.lastAutoPronouncedKey === args.sessionKey) {
      return;
    }

    void this.dependencies.speakWord(args.currentWord, {
      browserTtsEnabled: args.browserTtsEnabled,
      trigger: "auto"
    });
    this.lastAutoPronouncedKey = args.sessionKey;
  }

  preloadAvailableWords(availableWords: WordEntry[], config: SessionConfig) {
    if (!config.speechEnabled || !config.browserTtsEnabled) {
      return;
    }

    this.dependencies.preloadBrowserTtsWords(availableWords.map((word) => word.text));
  }

  resetAutoPronunciation() {
    this.lastAutoPronouncedKey = null;
  }

  async speakCurrentWord(word: string | null, config: Pick<SessionConfig, "speechEnabled" | "browserTtsEnabled">) {
    if (!word || !config.speechEnabled || this.isManualPronunciationPending) {
      return;
    }

    const requestToken = ++this.latestManualRequestToken;
    const wordToken = this.currentWordToken;
    this.isManualPronunciationPending = true;

    if (config.browserTtsEnabled) {
      const hasCachedAudio = await this.dependencies.hasCachedWordAudio(word).catch(() => false);
      if (!this.isActiveManualRequest(requestToken, wordToken)) {
        return;
      }
      this.setPronunciationStatus(hasCachedAudio ? "playing" : "generating");
    } else {
      this.setPronunciationStatus("playing");
    }

    try {
      const result = await this.dependencies.speakWord(word, {
        browserTtsEnabled: config.browserTtsEnabled,
        trigger: "manual"
      });

      if (!this.isActiveManualRequest(requestToken, wordToken)) {
        return;
      }

      if (result.source === "none") {
        this.setPronunciationStatus("error");
        return;
      }

      if (config.browserTtsEnabled && result.source === "speech-synthesis") {
        this.setPronunciationStatus("fallback");
        return;
      }

      this.setPronunciationStatus("idle");
    } catch {
      if (this.isActiveManualRequest(requestToken, wordToken)) {
        this.setPronunciationStatus("error");
      }
    } finally {
      if (this.latestManualRequestToken === requestToken) {
        this.isManualPronunciationPending = false;
      }
    }
  }

  private isActiveManualRequest(requestToken: number, wordToken: number) {
    return this.latestManualRequestToken === requestToken && this.currentWordToken === wordToken;
  }
}
