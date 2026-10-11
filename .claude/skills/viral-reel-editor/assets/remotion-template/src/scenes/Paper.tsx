import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { C, FPS, SPLIT } from "../theme";
import { easeInOut, prog } from "../lib";

const GRAIN = `url("data:image/svg+xml;utf8,${encodeURIComponent(
  `<svg xmlns='http://www.w3.org/2000/svg' width='240' height='240'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.55 0'/></filter><rect width='100%' height='100%' filter='url(#n)'/></svg>`,
)}")`;

/** Lesson 06 Step 1: white + thin grey grid + casted shadow + gradient + texture. */
export const PaperBG: React.FC<{ t: number }> = ({ t }) => (
  <AbsoluteFill style={{ background: C.paper, overflow: "hidden" }}>
    {/* thin grid */}
    <AbsoluteFill
      style={{
        backgroundImage:
          "linear-gradient(rgba(40,38,34,0.065) 1.5px, transparent 1.5px), linear-gradient(90deg, rgba(40,38,34,0.065) 1.5px, transparent 1.5px)",
        backgroundSize: "90px 90px",
        backgroundPosition: "-2px -2px",
      }}
    />
    {/* casted shadow: khidki ki diagonal parchhai, dheere khiskti hui */}
    <AbsoluteFill
      style={{
        backgroundImage:
          "repeating-linear-gradient(118deg, rgba(60,50,40,0) 0px, rgba(60,50,40,0) 150px, rgba(60,50,40,0.07) 190px, rgba(60,50,40,0.07) 250px, rgba(60,50,40,0) 300px)",
        filter: "blur(18px)",
        transform: `translateX(${-80 + t * 6}px) scale(1.3)`,
      }}
    />
    {/* gradient: center light, edges thode dark */}
    <AbsoluteFill
      style={{ background: "radial-gradient(ellipse 80% 65% at 50% 42%, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0) 60%, rgba(70,60,50,0.10) 100%)" }}
    />
    {/* grain */}
    <AbsoluteFill
      style={{
        backgroundImage: GRAIN,
        opacity: 0.09,
        mixBlendMode: "multiply",
        backgroundPosition: `${(Math.floor(t * 12) % 7) * 37}px ${(Math.floor(t * 12) % 5) * 53}px`,
      }}
    />
  </AbsoluteFill>
);

/**
 * Half ya full scene ka frame.
 * full: poora frame, scale 0.94→1 + fade in, andar slow push-in.
 * half: upar se panel slide-down (top 50%), speaker neeche.
 */
export const SceneFrame: React.FC<{
  kind: "full" | "half";
  start: number;
  end: number;
  children: (t: number) => React.ReactNode;
}> = ({ kind, start, end, children }) => {
  const t = useCurrentFrame() / FPS;
  if (t < start || t >= end) return null;
  const pin = prog(t, start, 0.28, easeInOut);
  const pout = prog(t, end - 0.2, 0.2, easeInOut);
  const push = 1 + 0.045 * prog(t, start, end - start, (x) => x);

  if (kind === "half") {
    return (
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: 1080,
          height: SPLIT,
          overflow: "hidden",
          transform: `translateY(${(-(1 - pin) - pout) * SPLIT}px)`,
          boxShadow: "0 10px 40px rgba(0,0,0,0.35)",
        }}
      >
        <PaperBG t={t} />
        <AbsoluteFill style={{ transform: `scale(${push})` }}>{children(t)}</AbsoluteFill>
      </div>
    );
  }
  return (
    <AbsoluteFill style={{ opacity: Math.min(prog(t, start, 0.12), 1 - pout), overflow: "hidden" }}>
      <AbsoluteFill style={{ transform: `scale(${0.94 + 0.06 * pin})` }}>
        <PaperBG t={t} />
        <AbsoluteFill style={{ transform: `scale(${push})` }}>{children(t)}</AbsoluteFill>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
