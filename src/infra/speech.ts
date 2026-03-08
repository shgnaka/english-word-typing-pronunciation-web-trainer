import { ensureWordAudio, getCachedWordAudio, isBrowserTtsSupported, playAudioBlob, queueWordGeneration } from "./browserTts";

export interface SpeakWordOptions {
  browserTtsEnabled?: boolean;
  trigger?: "auto" | "manual";
}

export interface SpeakWordResult {
  source: "browser-cache" | "browser-generated" | "speech-synthesis" | "none";
}

function speakWithSpeechSynthesis(word: string): SpeakWordResult {
  if (!("speechSynthesis" in globalThis) || typeof SpeechSynthesisUtterance === "undefined") {
    return { source: "none" };
  }

  globalThis.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(word);
  utterance.lang = "en-US";
  globalThis.speechSynthesis.speak(utterance);
  return { source: "speech-synthesis" };
}

export async function speakWord(word: string, options: SpeakWordOptions = {}): Promise<SpeakWordResult> {
  const normalizedWord = word.trim();
  if (!normalizedWord) {
    return { source: "none" };
  }

  if (!options.browserTtsEnabled || !isBrowserTtsSupported()) {
    return speakWithSpeechSynthesis(normalizedWord);
  }

  if (options.trigger === "auto") {
    try {
      const cachedAudio = await getCachedWordAudio(normalizedWord);
      if (cachedAudio) {
        await playAudioBlob(cachedAudio);
        return { source: "browser-cache" };
      }
    } catch {
      return speakWithSpeechSynthesis(normalizedWord);
    }

    queueWordGeneration(normalizedWord);
    return speakWithSpeechSynthesis(normalizedWord);
  }

  try {
    const cachedAudio = await getCachedWordAudio(normalizedWord);
    if (cachedAudio) {
      await playAudioBlob(cachedAudio);
      return { source: "browser-cache" };
    }

    const generatedAudio = await ensureWordAudio(normalizedWord);
    await playAudioBlob(generatedAudio);
    return { source: "browser-generated" };
  } catch {
    return speakWithSpeechSynthesis(normalizedWord);
  }
}
