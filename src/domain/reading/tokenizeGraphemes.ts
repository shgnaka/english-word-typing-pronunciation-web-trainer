const graphemePatterns = [
  "tion",
  "sion",
  "igh",
  "sh",
  "ch",
  "th",
  "ph",
  "wh",
  "ck",
  "ng",
  "gh",
  "ee",
  "oo",
  "oa",
  "ai",
  "ay",
  "ea",
  "ou",
  "ow",
  "oi",
  "oy",
  "ar",
  "er",
  "ir",
  "or",
  "ur",
  "qu"
] as const;

export function tokenizeGraphemes(word: string): string[] {
  const tokens: string[] = [];
  let index = 0;

  while (index < word.length) {
    const match = graphemePatterns.find((pattern) => word.startsWith(pattern, index));
    if (match) {
      tokens.push(match);
      index += match.length;
      continue;
    }

    tokens.push(word[index]);
    index += 1;
  }

  return tokens;
}
