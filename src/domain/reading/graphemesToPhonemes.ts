const vowels = new Set(["a", "e", "i", "o", "u", "y"]);
const frontVowels = new Set(["e", "i", "y", "ea", "ee"]);

function isSingleConsonant(token: string): boolean {
  return token.length === 1 && /[bcdfghjklmnpqrstvwxyz]/.test(token) && !vowels.has(token);
}

function isTerminalSilentE(tokens: string[], index: number): boolean {
  return tokens[index] === "e" && index === tokens.length - 1;
}

function getLongVowelPhoneme(vowel: string): string | null {
  if (vowel === "a") {
    return "EI";
  }
  if (vowel === "i") {
    return "AI";
  }
  if (vowel === "o") {
    return "OU";
  }
  if (vowel === "u") {
    return "YUU";
  }
  return null;
}

export function graphemesToPhonemes(tokens: string[]): string[] {
  const phonemes: string[] = [];

  for (let index = 0; index < tokens.length; index += 1) {
    const token = tokens[index];
    const next = tokens[index + 1];
    const nextNext = tokens[index + 2];

    if (isTerminalSilentE(tokens, index)) {
      continue;
    }

    if (
      (token === "a" || token === "i" || token === "o" || token === "u") &&
      isSingleConsonant(next ?? "") &&
      nextNext === "e" &&
      index + 2 === tokens.length - 1
    ) {
      const longVowel = getLongVowelPhoneme(token);
      if (longVowel) {
        phonemes.push(longVowel);
        continue;
      }
    }

    if (token === "c") {
      phonemes.push(frontVowels.has(next ?? "") ? "S" : "K");
      continue;
    }

    if (token === "g") {
      phonemes.push(frontVowels.has(next ?? "") ? "J" : "G");
      continue;
    }

    if (token === "qu") {
      phonemes.push("KW");
      continue;
    }

    if (token === "x") {
      phonemes.push("K", "S");
      continue;
    }

    if (token === "tion" || token === "sion") {
      phonemes.push("SH", "O", "N");
      continue;
    }

    if (token === "sh") {
      phonemes.push("SH");
      continue;
    }

    if (token === "ch") {
      phonemes.push("CH");
      continue;
    }

    if (token === "th") {
      phonemes.push("TH");
      continue;
    }

    if (token === "ph") {
      phonemes.push("F");
      continue;
    }

    if (token === "wh") {
      phonemes.push("W");
      continue;
    }

    if (token === "ck") {
      phonemes.push("K");
      continue;
    }

    if (token === "ng") {
      phonemes.push("NG");
      continue;
    }

    if (token === "gh") {
      phonemes.push("G");
      continue;
    }

    if (token === "igh") {
      phonemes.push("AI");
      continue;
    }

    if (token === "ee" || token === "ea") {
      phonemes.push("II");
      continue;
    }

    if (token === "oo") {
      if (index === tokens.length - 2 && next === "k") {
        phonemes.push("U");
      } else {
        phonemes.push("UU");
      }
      continue;
    }

    if (token === "oa") {
      phonemes.push("OU");
      continue;
    }

    if (token === "ai" || token === "ay") {
      phonemes.push("EI");
      continue;
    }

    if (token === "ou") {
      phonemes.push("AU");
      continue;
    }

    if (token === "ow") {
      phonemes.push("OU");
      continue;
    }

    if (token === "oi" || token === "oy") {
      phonemes.push("OI");
      continue;
    }

    if (token === "ar") {
      phonemes.push("AR");
      continue;
    }

    if (token === "er" || token === "ir" || token === "ur") {
      phonemes.push("ER");
      continue;
    }

    if (token === "or") {
      phonemes.push("OR");
      continue;
    }

    if (token === "b") {
      phonemes.push("B");
      continue;
    }

    if (token === "d") {
      phonemes.push("D");
      continue;
    }

    if (token === "f") {
      phonemes.push("F");
      continue;
    }

    if (token === "h") {
      phonemes.push("H");
      continue;
    }

    if (token === "j") {
      phonemes.push("J");
      continue;
    }

    if (token === "k") {
      phonemes.push("K");
      continue;
    }

    if (token === "l") {
      phonemes.push("L");
      continue;
    }

    if (token === "m") {
      phonemes.push("M");
      continue;
    }

    if (token === "n") {
      phonemes.push("N");
      continue;
    }

    if (token === "p") {
      phonemes.push("P");
      continue;
    }

    if (token === "q") {
      phonemes.push("K");
      continue;
    }

    if (token === "r") {
      phonemes.push("R");
      continue;
    }

    if (token === "s") {
      phonemes.push("S");
      continue;
    }

    if (token === "t") {
      phonemes.push("T");
      continue;
    }

    if (token === "v") {
      phonemes.push("V");
      continue;
    }

    if (token === "w") {
      phonemes.push("W");
      continue;
    }

    if (token === "y") {
      phonemes.push(index === tokens.length - 1 ? "II" : "Y");
      continue;
    }

    if (token === "z") {
      phonemes.push("Z");
      continue;
    }

    if (token === "a") {
      phonemes.push("A");
      continue;
    }

    if (token === "e") {
      phonemes.push("E");
      continue;
    }

    if (token === "i") {
      phonemes.push("I");
      continue;
    }

    if (token === "o") {
      phonemes.push("O");
      continue;
    }

    if (token === "u") {
      phonemes.push("U");
    }
  }

  return phonemes;
}
