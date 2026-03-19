const vowelOnlyMap: Record<string, string[]> = {
  A: ["ア"],
  E: ["エ"],
  I: ["イ"],
  O: ["オ"],
  U: ["ウ"],
  AI: ["ア", "イ"],
  EI: ["エ", "イ"],
  OI: ["オ", "イ"],
  AU: ["ア", "ウ"],
  OU: ["オ", "ー"],
  II: ["イ", "ー"],
  UU: ["ウ", "ー"],
  AR: ["ア", "ー"],
  ER: ["ア", "ー"],
  OR: ["オ", "ー"],
  YUU: ["ユ", "ー"]
};

const simpleOnsetRows: Record<string, Record<string, string>> = {
  B: { A: "バ", I: "ビ", U: "ブ", E: "ベ", O: "ボ" },
  D: { A: "ダ", I: "ディ", U: "ドゥ", E: "デ", O: "ド" },
  F: { A: "ファ", I: "フィ", U: "フ", E: "フェ", O: "フォ" },
  G: { A: "ガ", I: "ギ", U: "グ", E: "ゲ", O: "ゴ" },
  H: { A: "ハ", I: "ヒ", U: "フ", E: "ヘ", O: "ホ" },
  J: { A: "ジャ", I: "ジ", U: "ジュ", E: "ジェ", O: "ジョ" },
  K: { A: "カ", I: "キ", U: "ク", E: "ケ", O: "コ" },
  L: { A: "ラ", I: "リ", U: "ル", E: "レ", O: "ロ" },
  M: { A: "マ", I: "ミ", U: "ム", E: "メ", O: "モ" },
  P: { A: "パ", I: "ピ", U: "プ", E: "ペ", O: "ポ" },
  R: { A: "ラ", I: "リ", U: "ル", E: "レ", O: "ロ" },
  S: { A: "サ", I: "シ", U: "ス", E: "セ", O: "ソ" },
  T: { A: "タ", I: "ティ", U: "トゥ", E: "テ", O: "ト" },
  V: { A: "ヴァ", I: "ヴィ", U: "ヴ", E: "ヴェ", O: "ヴォ" },
  W: { A: "ワ", I: "ウィ", U: "ウ", E: "ウェ", O: "ウォ" },
  Y: { A: "ヤ", I: "イ", U: "ユ", E: "イェ", O: "ヨ" },
  Z: { A: "ザ", I: "ジ", U: "ズ", E: "ゼ", O: "ゾ" },
  TH: { A: "サ", I: "シ", U: "ス", E: "セ", O: "ソ" },
  SH: { A: "シャ", I: "シ", U: "シュ", E: "シェ", O: "ショ" },
  CH: { A: "チャ", I: "チ", U: "チュ", E: "チェ", O: "チョ" },
  KW: { A: "クァ", I: "クイ", U: "ク", E: "クェ", O: "クォ" }
};

const defaultConsonantMoras: Record<string, string[]> = {
  B: ["ブ"],
  D: ["ド"],
  F: ["フ"],
  G: ["グ"],
  H: ["ハ"],
  J: ["ジ"],
  K: ["ク"],
  L: ["ル"],
  M: ["ム"],
  P: ["プ"],
  R: ["ル"],
  S: ["ス"],
  T: ["ト"],
  V: ["ヴ"],
  W: ["ウ"],
  Y: ["イ"],
  Z: ["ズ"],
  TH: ["ス"],
  SH: ["シ"],
  CH: ["チ"],
  KW: ["ク"]
};

const finalConsonantMoras: Record<string, string[]> = {
  B: ["ッ", "ブ"],
  D: ["ッ", "ド"],
  F: ["フ"],
  G: ["ッ", "グ"],
  K: ["ッ", "ク"],
  L: ["ル"],
  M: ["ム"],
  P: ["ッ", "プ"],
  R: ["ー"],
  S: ["ス"],
  SH: ["シュ"],
  T: ["ッ", "ト"],
  V: ["ヴ"],
  CH: ["ッ", "チ"]
};

const vowelPhonemes = new Set(Object.keys(vowelOnlyMap));
const consonantPhonemes = new Set(Object.keys(defaultConsonantMoras).concat(["N", "NG"]));

function isVowelPhoneme(value: string | undefined): value is keyof typeof vowelOnlyMap {
  return value !== undefined && vowelPhonemes.has(value);
}

function isConsonantPhoneme(value: string | undefined): value is keyof typeof defaultConsonantMoras | "N" | "NG" {
  return value !== undefined && consonantPhonemes.has(value);
}

function combineOnsetWithSimpleVowel(onset: keyof typeof simpleOnsetRows, vowel: keyof typeof simpleOnsetRows[typeof onset]): string {
  return simpleOnsetRows[onset][vowel];
}

function combineOnsetWithVowel(onset: keyof typeof simpleOnsetRows, vowel: string): string[] | null {
  if (vowel === "A" || vowel === "E" || vowel === "I" || vowel === "O" || vowel === "U") {
    return [combineOnsetWithSimpleVowel(onset, vowel)];
  }
  if (vowel === "AI") {
    return [combineOnsetWithSimpleVowel(onset, "A"), "イ"];
  }
  if (vowel === "EI") {
    return [combineOnsetWithSimpleVowel(onset, "E"), "イ"];
  }
  if (vowel === "OI") {
    return [combineOnsetWithSimpleVowel(onset, "O"), "イ"];
  }
  if (vowel === "AU") {
    return [combineOnsetWithSimpleVowel(onset, "A"), "ウ"];
  }
  if (vowel === "OU") {
    return [combineOnsetWithSimpleVowel(onset, "O"), "ー"];
  }
  if (vowel === "II") {
    return [combineOnsetWithSimpleVowel(onset, "I"), "ー"];
  }
  if (vowel === "UU") {
    return [combineOnsetWithSimpleVowel(onset, "U"), "ー"];
  }
  if (vowel === "AR") {
    return [combineOnsetWithSimpleVowel(onset, "A"), "ー"];
  }
  if (vowel === "ER") {
    return [combineOnsetWithSimpleVowel(onset, "A"), "ー"];
  }
  if (vowel === "OR") {
    return [combineOnsetWithSimpleVowel(onset, "O"), "ー"];
  }
  if (vowel === "YUU") {
    if (onset === "P") {
      return ["ピュ", "ー"];
    }
    if (onset === "B") {
      return ["ビュ", "ー"];
    }
    if (onset === "F") {
      return ["フュ", "ー"];
    }
    if (onset === "M") {
      return ["ミュ", "ー"];
    }
    if (onset === "R" || onset === "L") {
      return ["リュ", "ー"];
    }
    if (onset === "K" || onset === "G") {
      return [combineOnsetWithSimpleVowel(onset, "U"), "ー"];
    }
    return ["ユ", "ー"];
  }
  return null;
}

export function phonemesToMoras(phonemes: string[]): string[] {
  const moras: string[] = [];

  for (let index = 0; index < phonemes.length; index += 1) {
    const current = phonemes[index];
    const next = phonemes[index + 1];
    const nextNext = phonemes[index + 2];

    if (isVowelPhoneme(current)) {
      moras.push(...vowelOnlyMap[current]);
      continue;
    }

    if (current === "N") {
      if (!next || isConsonantPhoneme(next)) {
        moras.push("ン");
        continue;
      }
    }

    if (current === "NG") {
      moras.push("ン");
      if (isVowelPhoneme(next)) {
        const combined = combineOnsetWithVowel("G", next);
        if (combined) {
          moras.push(...combined);
          index += 1;
          continue;
        }
      }
      moras.push("グ");
      continue;
    }

    if (current in simpleOnsetRows && isVowelPhoneme(next)) {
      const combined = combineOnsetWithVowel(current as keyof typeof simpleOnsetRows, next);
      if (combined) {
        moras.push(...combined);
        index += 1;
        continue;
      }
    }

    if (current === "S" && (next === "T" || next === "P" || next === "K")) {
      moras.push("ス");
      continue;
    }

    if ((current === "T" || current === "D") && next === "R" && isVowelPhoneme(nextNext)) {
      moras.push(current === "T" ? "ト" : "ド");
      continue;
    }

    if (current in simpleOnsetRows && isConsonantPhoneme(next) && isVowelPhoneme(nextNext)) {
      moras.push(...defaultConsonantMoras[current as keyof typeof defaultConsonantMoras]);
      continue;
    }

    if (index === phonemes.length - 1 && current in finalConsonantMoras) {
      moras.push(...finalConsonantMoras[current as keyof typeof finalConsonantMoras]);
      continue;
    }

    if (current in defaultConsonantMoras) {
      moras.push(...defaultConsonantMoras[current as keyof typeof defaultConsonantMoras]);
    }
  }

  return moras;
}
