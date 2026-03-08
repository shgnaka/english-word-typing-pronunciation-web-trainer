import { KokoroTTS } from "kokoro-js";
import { BROWSER_TTS_MODEL_ID, BROWSER_TTS_VOICE_VARIANT } from "./browserTtsShared";
import type { BrowserTtsWorkerRequest, BrowserTtsWorkerResponse } from "./browserTtsShared";

let synthesizerPromise: Promise<KokoroTTS> | null = null;

async function getSynthesizer() {
  synthesizerPromise ??= KokoroTTS.from_pretrained(BROWSER_TTS_MODEL_ID, {
    dtype: "q8",
    device: "wasm"
  });
  return synthesizerPromise;
}

self.onmessage = async (event: MessageEvent<BrowserTtsWorkerRequest>) => {
  const message = event.data;

  try {
    if (message.type === "load") {
      await getSynthesizer();
      const response: BrowserTtsWorkerResponse = { id: message.id, type: "loaded" };
      self.postMessage(response);
      return;
    }

    const synthesizer = await getSynthesizer();
    const output = await synthesizer.generate(message.word, {
      voice: BROWSER_TTS_VOICE_VARIANT
    });
    const response: BrowserTtsWorkerResponse = {
      id: message.id,
      type: "generated",
      audioBlob: output.toBlob()
    };
    self.postMessage(response);
  } catch (error) {
    const response: BrowserTtsWorkerResponse = {
      id: message.id,
      type: "error",
      error: error instanceof Error ? error.message : "Unknown browser TTS worker error."
    };
    self.postMessage(response);
  }
};
