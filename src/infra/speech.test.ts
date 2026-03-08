import { beforeEach, describe, expect, it, vi } from "vitest";
import { speakWord } from "./speech";

const browserTtsMocks = vi.hoisted(() => ({
  ensureWordAudio: vi.fn(),
  getCachedWordAudio: vi.fn(),
  isBrowserTtsSupported: vi.fn(),
  playAudioBlob: vi.fn(),
  queueWordGeneration: vi.fn()
}));

vi.mock("./browserTts", () => browserTtsMocks);

beforeEach(() => {
  browserTtsMocks.ensureWordAudio.mockReset();
  browserTtsMocks.getCachedWordAudio.mockReset();
  browserTtsMocks.isBrowserTtsSupported.mockReset();
  browserTtsMocks.playAudioBlob.mockReset();
  browserTtsMocks.queueWordGeneration.mockReset();

  Object.defineProperty(globalThis, "speechSynthesis", {
    writable: true,
    value: {
      cancel: vi.fn(),
      speak: vi.fn()
    }
  });

  Object.defineProperty(globalThis, "SpeechSynthesisUtterance", {
    writable: true,
    value: function MockUtterance(this: { text?: string; lang?: string }, text: string) {
      this.text = text;
      this.lang = "en-US";
    }
  });
});

describe("speakWord", () => {
  it("uses cached browser audio for manual pronunciation when available", async () => {
    const cachedBlob = new Blob(["cached"]);
    browserTtsMocks.isBrowserTtsSupported.mockReturnValue(true);
    browserTtsMocks.getCachedWordAudio.mockResolvedValue(cachedBlob);

    const result = await speakWord("apple", { browserTtsEnabled: true, trigger: "manual" });

    expect(result.source).toBe("browser-cache");
    expect(browserTtsMocks.playAudioBlob).toHaveBeenCalledWith(cachedBlob);
    expect(browserTtsMocks.ensureWordAudio).not.toHaveBeenCalled();
    expect(globalThis.speechSynthesis.speak).not.toHaveBeenCalled();
  });

  it("queues generation and falls back to speech synthesis for auto pronunciation on cache miss", async () => {
    browserTtsMocks.isBrowserTtsSupported.mockReturnValue(true);
    browserTtsMocks.getCachedWordAudio.mockResolvedValue(null);

    const result = await speakWord("apple", { browserTtsEnabled: true, trigger: "auto" });

    expect(result.source).toBe("speech-synthesis");
    expect(browserTtsMocks.queueWordGeneration).toHaveBeenCalledWith("apple");
    expect(globalThis.speechSynthesis.speak).toHaveBeenCalledTimes(1);
  });

  it("returns none when no pronunciation backend is available", async () => {
    // @ts-expect-error test override
    globalThis.speechSynthesis = undefined;
    // @ts-expect-error test override
    globalThis.SpeechSynthesisUtterance = undefined;
    browserTtsMocks.isBrowserTtsSupported.mockReturnValue(false);

    const result = await speakWord("apple", { browserTtsEnabled: false, trigger: "manual" });

    expect(result.source).toBe("none");
  });
});
