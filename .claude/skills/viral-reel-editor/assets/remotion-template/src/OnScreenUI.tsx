import React from "react";
import { useCurrentFrame } from "remotion";
import { C, FPS, sans } from "./theme";
import { SCENES } from "./timeline";
import { WORDS, popScale, prog, windowOpacity } from "./lib";

const UI_TOP = 1185;

/** Dark glass card: rise + fade + unblur in, fade out (Lesson 07). */
const GlassCard: React.FC<{ t: number; from: number; to: number; width: number; children: React.ReactNode }> = ({
  t,
  from,
  to,
  width,
  children,
}) => {
  const pin = prog(t, from, 0.36);
  const op = windowOpacity(t, from, to, 0.3, 0.14);
  if (op <= 0) return null;
  return (
    <div
      style={{
        position: "absolute",
        top: UI_TOP,
        left: (1080 - width) / 2,
        width,
        boxSizing: "border-box",
        padding: "26px 34px",
        borderRadius: 34,
        background: C.glass,
        border: `2px solid ${C.glassBorder}`,
        boxShadow: "0 24px 60px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.06)",
        backdropFilter: "blur(20px)",
        opacity: op,
        transform: `translateY(${(1 - pin) * 34}px) scale(${0.96 + 0.04 * pin})`,
        filter: pin < 1 ? `blur(${(1 - pin) * 10}px)` : undefined,
      }}
    >
      {children}
    </div>
  );
};

type StepperSpec = { from: number; to: number; appear: number[]; fill: (number | null)[] };

const STEPPERS: StepperSpec[] = [
  // Hook: "These 3 mistakes" → teen circles pop
  { from: 0.22, to: SCENES.hook.end, appear: [0.34, 0.5, 0.66], fill: [null, null, null] },
  { from: SCENES.n1.start, to: SCENES.n1.end, appear: [0, 0, 0], fill: [WORDS[23].s, null, null] },
  { from: SCENES.n2.start, to: SCENES.n2.end, appear: [0, 0, 0], fill: [0, WORDS[66].s, null] },
  { from: SCENES.n3.start, to: SCENES.n3.end, appear: [0, 0, 0], fill: [0, 0, WORDS[97].s] },
  // Recap: "change these 3 things" → teeno ek ke baad ek
  { from: SCENES.recap.start, to: 49.86, appear: [0, 0, 0], fill: [WORDS[137].s, WORDS[138].s, WORDS[139].s] },
];

const Step: React.FC<{ n: number; t: number; appear: number; fill: number | null }> = ({ n, t, appear, fill }) => {
  const a = popScale(prog(t, appear, 0.3, (x) => x));
  const f = fill === null ? 0 : prog(t, fill, 0.25);
  const ring = fill === null ? 0 : prog(t, fill, 0.5);
  return (
    <div style={{ position: "relative", width: 62, height: 62, transform: `scale(${a})` }}>
      {ring > 0 && ring < 1 && (
        <div
          style={{
            position: "absolute",
            inset: -6,
            borderRadius: 40,
            border: `3px solid ${C.accent}`,
            opacity: 1 - ring,
            transform: `scale(${1 + ring * 0.5})`,
          }}
        />
      )}
      <div
        style={{
          width: 62,
          height: 62,
          borderRadius: 31,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: sans,
          fontWeight: 600,
          fontSize: 28,
          background: f > 0.5 ? "#F3F3F3" : "rgba(255,255,255,0.06)",
          color: f > 0.5 ? "#15171C" : C.uiGrey,
          border: `2px solid ${f > 0.5 ? "#F3F3F3" : "rgba(255,255,255,0.18)"}`,
          boxShadow: f > 0.5 ? `0 0 ${18 * f}px ${C.accentGlow}` : "none",
          transform: `scale(${1 + 0.12 * Math.sin(Math.PI * f)})`,
        }}
      >
        {n}
      </div>
    </div>
  );
};

const Link: React.FC<{ t: number; fill: number | null }> = ({ t, fill }) => {
  const f = fill === null ? 0 : prog(t, fill - 0.1, 0.25);
  return (
    <div style={{ width: 70, height: 4, borderRadius: 2, background: "rgba(255,255,255,0.14)", overflow: "hidden" }}>
      <div style={{ width: `${f * 100}%`, height: "100%", background: "#F3F3F3" }} />
    </div>
  );
};

export const Stepper: React.FC<{ t: number }> = ({ t }) => {
  const s = STEPPERS.find((x) => t >= x.from - 0.01 && t < x.to + 0.2);
  if (!s) return null;
  const [a1, a2, a3] = s.appear.map((v) => (v === 0 ? s.from : v));
  return (
    <GlassCard t={t} from={s.from} to={s.to} width={400}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 14 }}>
        <Step n={1} t={t} appear={a1} fill={s.fill[0]} />
        <Link t={t} fill={s.fill[1]} />
        <Step n={2} t={t} appear={a2} fill={s.fill[1]} />
        <Link t={t} fill={s.fill[2]} />
        <Step n={3} t={t} appear={a3} fill={s.fill[2]} />
      </div>
    </GlassCard>
  );
};

type SliderSpec = { from: number; to: number; moveStart: number; moveEnd: number };
const SLIDERS: SliderSpec[] = [
  { from: SCENES.slider.start, to: SCENES.slider.end, moveStart: WORDS[19].s, moveEnd: WORDS[22].s + 0.3 },
  { from: 49.86, to: SCENES.recap.end + 1, moveStart: WORDS[148].s, moveEnd: WORDS[151].s + 0.3 },
];

export const Slider: React.FC<{ t: number }> = ({ t }) => {
  const s = SLIDERS.find((x) => t >= x.from - 0.01 && t < x.to + 0.2);
  if (!s) return null;
  const p = prog(t, s.moveStart, s.moveEnd - s.moveStart, (x) => x * x * (3 - 2 * x));
  const done = prog(t, s.moveEnd, 0.4);
  const trackW = 520;
  return (
    <GlassCard t={t} from={s.from} to={s.to} width={620}>
      <div style={{ display: "flex", justifyContent: "space-between", fontFamily: sans, fontSize: 24, fontWeight: 500 }}>
        <span style={{ color: p < 0.5 ? "#F3F3F3" : C.uiGrey }}>Beginner</span>
        <span style={{ color: p > 0.5 ? "#F3F3F3" : C.uiGrey }}>Professional</span>
      </div>
      <div style={{ position: "relative", marginTop: 22, height: 30 }}>
        <div style={{ position: "absolute", top: 11, left: 0, width: trackW, height: 8, borderRadius: 4, background: "rgba(255,255,255,0.12)" }} />
        <div
          style={{
            position: "absolute",
            top: 11,
            left: 0,
            width: trackW * p,
            height: 8,
            borderRadius: 4,
            background: `linear-gradient(90deg, #3D7BFF, ${C.accent})`,
            boxShadow: `0 0 14px ${C.accentGlow}`,
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 0,
            left: trackW * p - 15,
            width: 30,
            height: 30,
            borderRadius: 15,
            background: "#FFFFFF",
            boxShadow: `0 2px 8px rgba(0,0,0,0.4), 0 0 ${24 * done}px ${C.accentGlow}`,
          }}
        />
        {/* cursor */}
        <svg
          width="34"
          height="40"
          viewBox="0 0 24 28"
          style={{ position: "absolute", top: 14, left: trackW * p + 2, filter: "drop-shadow(0 2px 3px rgba(0,0,0,0.5))" }}
        >
          <path d="M2 2 L2 22 L7.5 16.5 L11 25 L14.5 23.5 L11 15 L19 15 Z" fill="#FFFFFF" stroke="#111" strokeWidth="1.2" />
        </svg>
      </div>
    </GlassCard>
  );
};

export const NameTag: React.FC<{ t: number }> = ({ t }) => {
  const op = windowOpacity(t, 0.15, SCENES.hook.end, 0.3, 0.15);
  if (op <= 0) return null;
  const p = prog(t, 0.15, 0.4);
  return (
    <div
      style={{
        position: "absolute",
        left: 70,
        top: 1640,
        opacity: op,
        transform: `translateY(${(1 - p) * 16}px)`,
        filter: p < 1 ? `blur(${(1 - p) * 8}px)` : undefined,
        fontFamily: sans,
      }}
    >
      <div style={{ color: C.white, fontSize: 34, fontWeight: 600, letterSpacing: -0.3 }}>Joseph Eid</div>
      <div style={{ color: "rgba(243,243,243,0.62)", fontSize: 22, fontWeight: 300, marginTop: 2 }}>Video Editor · Ultimate Editors</div>
    </div>
  );
};

export const OnScreenUI: React.FC = () => {
  const t = useCurrentFrame() / FPS;
  return (
    <>
      <Stepper t={t} />
      <Slider t={t} />
      <NameTag t={t} />
    </>
  );
};
