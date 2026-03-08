import { env, pipeline } from "@huggingface/transformers";
import { BROWSER_TTS_MODEL_ID } from "./browserTtsShared";
import type { BrowserTtsWorkerRequest, BrowserTtsWorkerResponse } from "./browserTtsShared";

env.allowLocalModels = false;

let synthesizerPromise: Promise<any> | null = null;

async function getSynthesizer() {
  synthesizerPromise ??= pipeline("text-to-speech", BROWSER_TTS_MODEL_ID);
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
    const output = await synthesizer(message.word);
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
