import { Easing, interpolate } from "remotion";
import words from "./data/words.json";

export type Word = { w: string; s: number; e: number };
export const WORDS = words as Word[];

export const easeOut = Easing.out(Easing.cubic);
export const easeInOut = Easing.inOut(Easing.cubic);

/** 0 → 1 between start and start+dur (seconds), eased. */
export const prog = (t: number, start: number, dur: number, easing = easeOut) =>
  interpolate(t, [start, start + dur], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing,
  });

/** Overshoot pop: 0 → ~1.08 → 1. */
export const popScale = (p: number) => {
  if (p <= 0) return 0;
  if (p >= 1) return 1;
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(p - 1, 3) + c1 * Math.pow(p - 1, 2);
};

/** Visibility window with fade in/out (seconds). */
export const windowOpacity = (t: number, start: number, end: number, fadeIn = 0.15, fadeOut = 0.12) =>
  Math.min(prog(t, start, fadeIn), 1 - prog(t, end - fadeOut, fadeOut, Easing.in(Easing.cubic)));

/** Standard caption/scene word entry: rise + fade + unblur (Lesson 02). */
export const wordIn = (t: number, start: number, dur = 0.32) => {
  const p = prog(t, start, dur);
  return {
    opacity: p,
    transform: `translateY(${(1 - p) * 20}px)`,
    filter: p < 1 ? `blur(${(1 - p) * 10}px)` : undefined,
  };
};

export const wordStart = (i: number) => WORDS[i].s;
export const wordEnd = (i: number) => WORDS[i].e;
