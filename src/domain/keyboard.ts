import type { FingerId, KeyboardGuideMap } from "./types";

export const keyboardGuideMap: KeyboardGuideMap = {
  a: { keyPosition: "Home row - A", finger: "Left pinky", fingerId: "left-pinky" },
  b: { keyPosition: "Bottom row - B", finger: "Left index", fingerId: "left-index" },
  c: { keyPosition: "Bottom row - C", finger: "Left middle", fingerId: "left-middle" },
  d: { keyPosition: "Home row - D", finger: "Left middle", fingerId: "left-middle" },
  e: { keyPosition: "Top row - E", finger: "Left middle", fingerId: "left-middle" },
  f: { keyPosition: "Home row - F", finger: "Left index", fingerId: "left-index" },
  g: { keyPosition: "Home row - G", finger: "Left index", fingerId: "left-index" },
  h: { keyPosition: "Home row - H", finger: "Right index", fingerId: "right-index" },
  i: { keyPosition: "Top row - I", finger: "Right middle", fingerId: "right-middle" },
  j: { keyPosition: "Home row - J", finger: "Right index", fingerId: "right-index" },
  k: { keyPosition: "Home row - K", finger: "Right middle", fingerId: "right-middle" },
  l: { keyPosition: "Home row - L", finger: "Right ring", fingerId: "right-ring" },
  m: { keyPosition: "Bottom row - M", finger: "Right index", fingerId: "right-index" },
  n: { keyPosition: "Bottom row - N", finger: "Right index", fingerId: "right-index" },
  o: { keyPosition: "Top row - O", finger: "Right ring", fingerId: "right-ring" },
  p: { keyPosition: "Top row - P", finger: "Right pinky", fingerId: "right-pinky" },
  q: { keyPosition: "Top row - Q", finger: "Left pinky", fingerId: "left-pinky" },
  r: { keyPosition: "Top row - R", finger: "Left index", fingerId: "left-index" },
  s: { keyPosition: "Home row - S", finger: "Left ring", fingerId: "left-ring" },
  t: { keyPosition: "Top row - T", finger: "Left index", fingerId: "left-index" },
  u: { keyPosition: "Top row - U", finger: "Right index", fingerId: "right-index" },
  v: { keyPosition: "Bottom row - V", finger: "Left index", fingerId: "left-index" },
  w: { keyPosition: "Top row - W", finger: "Left ring", fingerId: "left-ring" },
  x: { keyPosition: "Bottom row - X", finger: "Left ring", fingerId: "left-ring" },
  y: { keyPosition: "Top row - Y", finger: "Right index", fingerId: "right-index" },
  z: { keyPosition: "Bottom row - Z", finger: "Left pinky", fingerId: "left-pinky" }
};

export const keyboardRows = [
  ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"],
  ["a", "s", "d", "f", "g", "h", "j", "k", "l"],
  ["z", "x", "c", "v", "b", "n", "m"]
] as const;

export const fingerButtonLayout: Array<{ side: "left" | "right"; fingers: FingerId[] }> = [
  {
    side: "left",
    fingers: ["left-pinky", "left-ring", "left-middle", "left-index"]
  },
  {
    side: "right",
    fingers: ["right-index", "right-middle", "right-ring", "right-pinky"]
  }
];

export const fingerButtonLabels: Record<FingerId, string> = {
  "left-pinky": "LP",
  "left-ring": "LR",
  "left-middle": "LM",
  "left-index": "LI",
  "right-index": "RI",
  "right-middle": "RM",
  "right-ring": "RR",
  "right-pinky": "RP"
};
