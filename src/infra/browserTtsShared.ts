export const BROWSER_TTS_MODEL_ID = "onnx-community/Kokoro-82M-v1.0-ONNX";
export const BROWSER_TTS_MODEL_VERSION = "kokoro-82m-v1.0-onnx-q8";
export const BROWSER_TTS_VOICE_VARIANT = "af_heart";

export type BrowserTtsWorkerRequest =
  | { id: number; type: "generate"; word: string }
  | { id: number; type: "load" };

export type BrowserTtsWorkerResponse =
  | { id: number; type: "generated"; audioBlob: Blob }
  | { id: number; type: "loaded" }
  | { id: number; type: "error"; error: string };
