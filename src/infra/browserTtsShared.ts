export const BROWSER_TTS_MODEL_ID = "Xenova/mms-tts-eng";
export const BROWSER_TTS_MODEL_VERSION = "browser-tts-v1";
export const BROWSER_TTS_VOICE_VARIANT = "default";

export type BrowserTtsWorkerRequest =
  | { id: number; type: "generate"; word: string }
  | { id: number; type: "load" };

export type BrowserTtsWorkerResponse =
  | { id: number; type: "generated"; audioBlob: Blob }
  | { id: number; type: "loaded" }
  | { id: number; type: "error"; error: string };
