export function speakWord(word: string): void {
  if (!("speechSynthesis" in globalThis) || typeof SpeechSynthesisUtterance === "undefined") {
    return;
  }

  globalThis.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(word);
  utterance.lang = "en-US";
  globalThis.speechSynthesis.speak(utterance);
}
