// Poori reel ka plan (seconds, cut footage ke timeline par).
// Rule: kind rotate karo (on-screen → half/full → speaker), har 3–5s naya visual.

export type Mode = "speaker" | "zoom" | "half" | "full";

export const DURATION = 51.82;

export const SCENES = {
  hook: { start: 0, end: 3.3 },
  slider: { start: 3.4, end: 6.92 },
  n1: { start: 6.92, end: 8.78 },
  full1: { start: 8.78, end: 13.86 }, // video-centric: "screams beginner"
  zoom: { start: 13.86, end: 16.95 },
  half1: { start: 16.95, end: 21.24 }, // 25% smaller
  n2: { start: 21.24, end: 23.06 },
  half2: { start: 23.06, end: 27.9 }, // less is more
  full2: { start: 27.9, end: 32.08 }, // spotlight: grab attention
  n3: { start: 32.08, end: 34.14 },
  half3: { start: 34.14, end: 38.88 }, // harsh colors
  full3: { start: 38.88, end: 45.66 }, // luxury brands + high-end
  recap: { start: 45.66, end: DURATION },
};

export const modeAt = (t: number): Mode => {
  const s = SCENES;
  if (t >= s.full1.start && t < s.full1.end) return "full";
  if (t >= s.full2.start && t < s.full2.end) return "full";
  if (t >= s.full3.start && t < s.full3.end) return "full";
  if (t >= s.half1.start && t < s.half1.end) return "half";
  if (t >= s.half2.start && t < s.half2.end) return "half";
  if (t >= s.half3.start && t < s.half3.end) return "half";
  if (t >= s.zoom.start && t < s.zoom.end) return "zoom";
  return "speaker";
};

// Captions: word index range (inclusive), script words, display overrides.
export type CaptionGroup = {
  from: number;
  to: number;
  script?: number[]; // in words ko bada script (accent + glow) me
  scriptBlock?: "below" | "inline"; // below = setup line + payoff line (layout A/C)
  text?: Record<number, string>; // transcript ke words ko theek karna
  end?: number; // kab hide (seconds); default = next group ka start
};

export const CAPTIONS: CaptionGroup[] = [
  // HOOK — payoff: "three mistakes" (number + fear)
  { from: 0, to: 2, script: [1, 2], scriptBlock: "below", text: { 1: "three" } },
  { from: 3, to: 9, script: [9], scriptBlock: "below", end: 3.36 },
  // Slider
  { from: 10, to: 14 },
  { from: 15, to: 18 },
  { from: 19, to: 22, script: [22], scriptBlock: "below", end: 6.95 },
  // Number 1
  { from: 23, to: 26, script: [24, 25, 26], scriptBlock: "below", text: { 23: "Number 1:", 25: "oversizing" }, end: 8.8 },
  // Zoom
  { from: 41, to: 45, script: [43, 44, 45], scriptBlock: "below" },
  { from: 46, to: 52, end: 16.95 },
  // Half 1 (speaker half)
  { from: 53, to: 57, script: [56, 57], scriptBlock: "below" },
  { from: 58, to: 65, script: [63], scriptBlock: "below", end: 21.24 },
  // Number 2
  { from: 66, to: 69, script: [67, 68, 69], scriptBlock: "below", text: { 66: "Number 2:" }, end: 23.08 },
  // Half 2
  { from: 70, to: 72, script: [70, 71, 72], scriptBlock: "below" },
  { from: 73, to: 78 },
  { from: 79, to: 83, script: [81], scriptBlock: "below", end: 27.92 },
  // Number 3
  { from: 97, to: 101, script: [98, 99, 100, 101], scriptBlock: "below", text: { 97: "Number 3:", 98: "Use" }, end: 34.16 },
  // Half 3
  { from: 102, to: 105, script: [104, 105], scriptBlock: "below" },
  { from: 106, to: 109 },
  { from: 110, to: 112, script: [111, 112], scriptBlock: "below", end: 38.9 },
  // Recap
  { from: 130, to: 135, text: { 130: "So" } },
  { from: 136, to: 142, script: [138, 139], scriptBlock: "below", text: { 138: "three" } },
  { from: 143, to: 147 },
  { from: 148, to: 151, script: [151], scriptBlock: "below", end: DURATION },
];
