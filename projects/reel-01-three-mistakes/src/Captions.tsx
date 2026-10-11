import React from "react";
import { useCurrentFrame } from "remotion";
import { CAPTIONS, CaptionGroup, modeAt } from "./timeline";
import { C, FPS, sans, serif } from "./theme";
import { WORDS, prog, wordIn } from "./lib";

const groupStart = (g: CaptionGroup) => WORDS[g.from].s - 0.04;
const groupEnd = (g: CaptionGroup, i: number) => {
  if (g.end !== undefined) return g.end;
  const next = CAPTIONS[i + 1];
  const lastWordEnd = WORDS[g.to].e;
  return Math.min(next ? groupStart(next) : lastWordEnd + 1, lastWordEnd + 1.2);
};

const display = (g: CaptionGroup, idx: number) => g.text?.[idx] ?? WORDS[idx].w;

/** Setup (small sans) → Payoff (big script) → Tail (small sans). */
const splitLines = (g: CaptionGroup) => {
  const idx = Array.from({ length: g.to - g.from + 1 }, (_, k) => g.from + k);
  const isScript = (i: number) => g.script?.includes(i) ?? false;
  const firstScript = idx.findIndex(isScript);
  if (firstScript < 0) return { setup: idx, payoff: [] as number[], tail: [] as number[] };
  let lastScript = firstScript;
  while (lastScript + 1 < idx.length && isScript(idx[lastScript + 1])) lastScript++;
  return {
    setup: idx.slice(0, firstScript),
    payoff: idx.slice(firstScript, lastScript + 1),
    tail: idx.slice(lastScript + 1),
  };
};

const SansWord: React.FC<{ g: CaptionGroup; i: number; t: number }> = ({ g, i, t }) => (
  <span
    style={{
      display: "inline-block",
      marginRight: 12,
      fontFamily: sans,
      fontWeight: 400,
      fontSize: 46,
      letterSpacing: -0.4,
      color: C.white,
      textShadow: "0 2px 6px rgba(0,0,0,0.28)",
      ...wordIn(t, WORDS[i].s - 0.04),
    }}
  >
    {display(g, i)}
  </span>
);

const ScriptWord: React.FC<{ g: CaptionGroup; i: number; t: number; size: number }> = ({ g, i, t, size }) => (
  <span
    style={{
      display: "inline-block",
      marginRight: 18,
      fontFamily: serif,
      fontStyle: "italic",
      fontWeight: 700,
      fontSize: size,
      lineHeight: 1,
      letterSpacing: -1,
      color: C.accent,
      textShadow: `0 0 22px ${C.accentGlow}, 0 2px 4px rgba(0,0,0,0.25)`,
      ...wordIn(t, WORDS[i].s - 0.04, 0.36),
    }}
  >
    {display(g, i)}
  </span>
);

export const Captions: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const mode = modeAt(t);
  if (mode === "full") return null;

  const i = CAPTIONS.findIndex((g, k) => t >= groupStart(g) && t < groupEnd(g, k));
  if (i < 0) return null;
  const g = CAPTIONS[i];
  const end = groupEnd(g, i);
  const out = prog(t, end - 0.1, 0.1);
  const { setup, payoff, tail } = splitLines(g);
  const scriptSize = payoff.length >= 4 ? 64 : payoff.length === 3 ? 74 : 104;

  const top = mode === "half" ? 975 : 905;
  const scale = mode === "half" ? 0.9 : 1;

  return (
    <div
      style={{
        position: "absolute",
        left: 30,
        right: 30,
        top,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
        opacity: 1 - out,
        transform: `scale(${scale})`,
        transformOrigin: "50% 0%",
      }}
    >
      {setup.length > 0 && (
        <div>
          {setup.map((w) => (
            <SansWord key={w} g={g} i={w} t={t} />
          ))}
        </div>
      )}
      {payoff.length > 0 && (
        <div style={{ marginTop: setup.length ? -6 : 0, whiteSpace: "nowrap" }}>
          {payoff.map((w) => (
            <ScriptWord key={w} g={g} i={w} t={t} size={scriptSize} />
          ))}
        </div>
      )}
      {tail.length > 0 && (
        <div style={{ marginTop: 2 }}>
          {tail.map((w) => (
            <SansWord key={w} g={g} i={w} t={t} />
          ))}
        </div>
      )}
    </div>
  );
};
