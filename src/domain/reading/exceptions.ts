export const readingExceptions: Record<string, string> = {
  apple: "アップル",
  book: "ブック",
  colonel: "カーネル",
  come: "カム",
  computer: "コンピューター",
  does: "ダズ",
  done: "ダン",
  earth: "アース",
  gone: "ゴーン",
  have: "ハブ",
  hello: "ハロー",
  journey: "ジャーニー",
  language: "ランゲージ",
  love: "ラブ",
  move: "ムーブ",
  nature: "ネイチャー",
  one: "ワン",
  phone: "フォーン",
  queue: "キュー",
  some: "サム",
  two: "トゥー",
  women: "ウィメン",
  yacht: "ヨット"
};

export function lookupReadingException(word: string): string | null {
  return readingExceptions[word] ?? null;
}
