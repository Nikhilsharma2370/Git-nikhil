import React from "react";
import { AbsoluteFill, OffthreadVideo, staticFile } from "remotion";
import { C, sans, serif, serifUpright } from "../theme";
import { SCENES } from "../timeline";
import { WORDS, popScale, prog, wordIn } from "../lib";
import { SceneFrame } from "./Paper";

// ---------- shared pieces ----------

const card = (extra: React.CSSProperties = {}): React.CSSProperties => ({
  background: "#FFFFFF",
  borderRadius: 22,
  boxShadow: "0 2px 0 rgba(0,0,0,0.03), 0 18px 40px rgba(40,34,26,0.14), 0 4px 10px rgba(40,34,26,0.06)",
  ...extra,
});

/** Sans scene word (charcoal), word-synced. */
const SW: React.FC<{ i: number; t: number; size?: number; text?: string; weight?: number; color?: string }> = ({
  i,
  t,
  size = 52,
  text,
  weight = 400,
  color = C.charcoal,
}) => (
  <span
    style={{
      display: "inline-block",
      marginRight: size * 0.24,
      fontFamily: sans,
      fontWeight: weight,
      fontSize: size,
      letterSpacing: -0.6,
      color,
      ...wordIn(t, WORDS[i].s - 0.04),
    }}
  >
    {text ?? WORDS[i].w}
  </span>
);

/** Script payoff on paper: bold italic serif, very light gradient inside the color (Lesson 06 #3). */
const SS: React.FC<{ i: number; t: number; size?: number; text?: string; from?: string; to?: string }> = ({
  i,
  t,
  size = 120,
  text,
  from = "#4A86FF",
  to = C.blueDeep,
}) => (
  <span
    style={{
      display: "inline-block",
      marginRight: size * 0.16,
      fontFamily: serif,
      fontStyle: "italic",
      fontWeight: 700,
      fontSize: size,
      lineHeight: 1.05,
      letterSpacing: -1.5,
      backgroundImage: `linear-gradient(180deg, ${from} 0%, ${to} 100%)`,
      WebkitBackgroundClip: "text",
      backgroundClip: "text",
      color: "transparent",
      paddingRight: 6,
      ...wordIn(t, WORDS[i].s - 0.04, 0.36),
    }}
  >
    {text ?? WORDS[i].w}
  </span>
);

const Sparkle: React.FC<{ x: number; y: number; size: number; t: number; at: number; color?: string }> = ({
  x,
  y,
  size,
  t,
  at,
  color = C.blue,
}) => {
  const p = popScale(prog(t, at, 0.35, (v) => v));
  if (p <= 0) return null;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      style={{ position: "absolute", left: x - size / 2, top: y - size / 2, transform: `scale(${p}) rotate(${(1 - p) * 40}deg)` }}
    >
      <path d="M12 0 C13 8 16 11 24 12 C16 13 13 16 12 24 C11 16 8 13 0 12 C8 11 11 8 12 0 Z" fill={color} />
    </svg>
  );
};

/** Depth element: cropped, blurred placeholder card at the frame edge (Lesson 06 step 4). */
const GhostCard: React.FC<{ x: number; y: number; w: number; h: number; rot?: number; blur?: number }> = ({
  x,
  y,
  w,
  h,
  rot = 0,
  blur = 3,
}) => (
  <div style={{ position: "absolute", left: x, top: y, width: w, height: h, transform: `rotate(${rot}deg)`, filter: `blur(${blur}px)`, opacity: 0.8, ...card({ borderRadius: 28 }) }}>
    <div style={{ margin: 28, width: 60, height: 60, borderRadius: 30, background: "#E9E6E0" }} />
    <div style={{ marginLeft: 28, width: w * 0.55, height: 14, borderRadius: 7, background: "#ECE9E3" }} />
    <div style={{ marginLeft: 28, marginTop: 12, width: w * 0.35, height: 14, borderRadius: 7, background: "#F0EDE8" }} />
  </div>
);

// ---------- FULL 1: video-centric "screams beginner" ----------

export const Full1VideoCentric: React.FC = () => (
  <SceneFrame kind="full" start={SCENES.full1.start} end={SCENES.full1.end}>
    {(t) => {
      const swap = prog(t, WORDS[35].s - 0.2, 0.2);
      // video card: neeche se upar slow pan (camera move)
      const pan = prog(t, SCENES.full1.start, SCENES.full1.end - SCENES.full1.start, (x) => x * x * (3 - 2 * x));
      const cardTop = 1150 - pan * 420;
      const icon1 = popScale(prog(t, WORDS[35].s, 0.32, (x) => x));
      const icon2 = popScale(prog(t, WORDS[36].s, 0.32, (x) => x));
      const shape1 = popScale(prog(t, WORDS[38].s, 0.3, (x) => x));
      const shape2 = popScale(prog(t, WORDS[39].s, 0.3, (x) => x));
      const brush = prog(t, SCENES.full1.start + 0.2, 0.7);
      return (
        <>
          {/* depth */}
          <div style={{ position: "absolute", right: -160, bottom: -120, width: 520, height: 520, borderRadius: 260, background: C.blue, opacity: 0.16, filter: "blur(30px)" }} />
          <GhostCard x={830} y={140} w={360} h={250} rot={6} />
          <svg width="420" height="220" viewBox="0 0 420 220" style={{ position: "absolute", left: -40, top: 1660 }}>
            <path
              d="M10 180 C 120 60, 260 40, 410 30"
              stroke={C.charcoal}
              strokeWidth="34"
              strokeLinecap="round"
              fill="none"
              strokeDasharray="520"
              strokeDashoffset={520 * (1 - brush)}
              opacity={0.9}
            />
          </svg>

          {/* text (supporting, upar) */}
          <div style={{ position: "absolute", left: 80, top: 210, opacity: 1 - swap, transform: `translateY(${-swap * 20}px)` }}>
            <div>{[27, 28, 29, 30].map((i) => <SW key={i} i={i} t={t} />)}</div>
            <div style={{ marginTop: -4 }}>{[31, 32].map((i) => <SS key={i} i={i} t={t} />)}</div>
          </div>
          {swap > 0 && (
            <div style={{ position: "absolute", left: 80, top: 210 }}>
              <div>{[35, 36, 37].map((i) => <SW key={i} i={i} t={t} text={i === 35 ? "Huge" : undefined} />)}</div>
              <div style={{ marginTop: -4 }}>{[38, 39].map((i) => <SS key={i} i={i} t={t} text={i === 39 ? "shapes." : undefined} />)}</div>
            </div>
          )}

          {/* hero: video card */}
          <div
            style={{
              position: "absolute",
              left: 290,
              top: cardTop,
              width: 500,
              height: 889,
              transform: "rotate(-3deg)",
              borderRadius: 28,
              border: "8px solid #FFFFFF",
              overflow: "hidden",
              boxShadow: "0 50px 90px rgba(40,34,26,0.28), 0 12px 24px rgba(40,34,26,0.16)",
              background: "#000",
            }}
          >
            <OffthreadVideo src={staticFile("footage.mp4")} muted startFrom={0} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            {/* beginner mistake: huge icons + huge shapes */}
            <svg width="300" height="300" viewBox="0 0 100 100" style={{ position: "absolute", left: -20, top: 80, transform: `scale(${icon1}) rotate(-12deg)` }}>
              <path d="M10 40 H60 V20 L95 50 L60 80 V60 H10 Z" fill="#FF2D2D" stroke="#FFF" strokeWidth="4" />
            </svg>
            <svg width="280" height="280" viewBox="0 0 100 100" style={{ position: "absolute", right: -30, top: 330, transform: `scale(${icon2})` }}>
              <path d="M50 4 L62 38 L98 38 L69 59 L80 94 L50 73 L20 94 L31 59 L2 38 L38 38 Z" fill="#FFD400" stroke="#FFF" strokeWidth="3" />
            </svg>
            <div style={{ position: "absolute", left: -40, bottom: 140, width: 420, height: 160, background: "#FF00B8", transform: `scale(${shape1}) rotate(8deg)`, opacity: 0.92 }} />
            <div style={{ position: "absolute", right: -60, bottom: 30, width: 360, height: 220, borderRadius: 110, background: "#7CFF00", transform: `scale(${shape2}) rotate(-10deg)`, opacity: 0.9 }} />
          </div>
        </>
      );
    }}
  </SceneFrame>
);

// ---------- HALF 1: 25% smaller ----------

export const Half1Shrink: React.FC = () => (
  <SceneFrame kind="half" start={SCENES.half1.start} end={SCENES.half1.end}>
    {(t) => {
      const shrinkStart = WORDS[56].s;
      const s = 1 - 0.25 * prog(t, shrinkStart, WORDS[57].e - shrinkStart, (x) => x * x * (3 - 2 * x));
      const appear = popScale(prog(t, SCENES.half1.start + 0.1, 0.4, (x) => x));
      const badge = popScale(prog(t, WORDS[56].s, 0.32, (x) => x));
      const size = Math.round(420 * s);
      const base = 340;
      const box = base * s + 36;
      const cx = 540;
      const cy = 470;
      const burst = prog(t, WORDS[57].s, 0.7);
      return (
        <>
          <GhostCard x={-120} y={120} w={300} h={220} rot={-6} />
          <GhostCard x={900} y={560} w={300} h={240} rot={5} />
          <div style={{ position: "absolute", left: 70, top: 70, fontFamily: sans, fontSize: 22, letterSpacing: 4, color: C.muted, fontWeight: 500 }}>ELEMENT SIZE</div>

          {/* hero card */}
          <div
            style={{
              position: "absolute",
              left: cx - base / 2,
              top: cy - base / 2,
              width: base,
              height: base,
              transform: `scale(${s * appear})`,
              ...card({ borderRadius: 78 }),
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                width: 160,
                height: 160,
                borderRadius: 44,
                background: "linear-gradient(160deg, #5C95FF 0%, #2A62E6 100%)",
                boxShadow: "0 14px 30px rgba(42,98,230,0.35), inset 0 2px 0 rgba(255,255,255,0.3)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg width="90" height="90" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinejoin="round">
                <path d="M12 3 L21 8 L12 13 L3 8 Z" fill="rgba(255,255,255,0.25)" />
                <path d="M3 12.5 L12 17.5 L21 12.5" />
                <path d="M3 16.5 L12 21.5 L21 16.5" />
              </svg>
            </div>
            <div style={{ marginTop: 26, width: 170, height: 14, borderRadius: 7, background: "#E7E4DE" }} />
            <div style={{ marginTop: 10, width: 110, height: 14, borderRadius: 7, background: "#EFECE7" }} />
          </div>

          {/* Figma-style selection box */}
          <div style={{ position: "absolute", left: cx - box / 2, top: cy - box / 2, width: box, height: box, border: `2px solid ${C.blue}`, opacity: appear }}>
            {[
              [-7, -7],
              [box - 9, -7],
              [-7, box - 9],
              [box - 9, box - 9],
            ].map(([x, y], k) => (
              <div key={k} style={{ position: "absolute", left: x, top: y, width: 14, height: 14, background: "#fff", border: `2px solid ${C.blue}` }} />
            ))}
            <div
              style={{
                position: "absolute",
                left: "50%",
                top: box + 14,
                transform: "translateX(-50%)",
                padding: "6px 14px",
                borderRadius: 8,
                background: C.blue,
                color: "#fff",
                fontFamily: sans,
                fontWeight: 600,
                fontSize: 22,
                fontVariantNumeric: "tabular-nums",
                whiteSpace: "nowrap",
              }}
            >
              {size} × {size}
            </div>
            <div
              style={{
                position: "absolute",
                right: -70,
                top: -48,
                padding: "10px 20px",
                borderRadius: 30,
                background: C.blue,
                color: "#fff",
                fontFamily: sans,
                fontWeight: 600,
                fontSize: 34,
                transform: `scale(${badge})`,
                boxShadow: "0 10px 24px rgba(61,123,255,0.35)",
              }}
            >
              −25%
            </div>
          </div>

          {/* particles on shrink */}
          {burst > 0 && burst < 1 &&
            Array.from({ length: 16 }).map((_, k) => {
              const a = (k / 16) * Math.PI * 2 + 0.3;
              const r = 210 + burst * 170;
              return (
                <div
                  key={k}
                  style={{
                    position: "absolute",
                    left: cx + Math.cos(a) * r,
                    top: cy + Math.sin(a) * r,
                    width: k % 3 === 0 ? 12 : 8,
                    height: k % 3 === 0 ? 12 : 8,
                    borderRadius: 6,
                    background: k % 2 ? C.blue : C.charcoal,
                    opacity: 1 - burst,
                  }}
                />
              );
            })}
          <Sparkle x={cx + 160} y={cy - 150} size={54} t={t} at={WORDS[63].s} />
          <Sparkle x={cx - 170} y={cy + 120} size={36} t={t} at={WORDS[63].s + 0.12} />
        </>
      );
    }}
  </SceneFrame>
);

// ---------- HALF 2: less is more ----------

const EFFECTS = ["Shake", "Blur", "Zoom", "RGB Split", "Glow", "Flash", "Glitch", "Spin", "Bounce"];
const OFF_ORDER = [0, 8, 2, 6, 1, 7, 3, 5]; // Glow (index 4) bachta hai

export const Half2LessIsMore: React.FC = () => (
  <SceneFrame kind="half" start={SCENES.half2.start} end={SCENES.half2.end}>
    {(t) => {
      const onAt = (k: number) => WORDS[70].s + k * 0.04;
      const offStart = WORDS[74].s;
      const offEnd = WORDS[80].s;
      const offAt = (k: number) => offStart + (OFF_ORDER.indexOf(k) / (OFF_ORDER.length - 1)) * (offEnd - offStart);
      const special = prog(t, WORDS[81].s, 0.4);
      let lit = 0;
      EFFECTS.forEach((_, k) => {
        const on = t >= onAt(k);
        const off = k !== 4 && t >= offAt(k);
        if (on && !off) lit++;
      });
      return (
        <>
          <div style={{ position: "absolute", left: 90, right: 90, top: 80, display: "flex", justifyContent: "space-between", fontFamily: sans, fontSize: 22, letterSpacing: 4, fontWeight: 500, color: C.muted }}>
            <span>EFFECT USAGE</span>
            <span style={{ color: C.blue, fontVariantNumeric: "tabular-nums", letterSpacing: 2 }}>{lit} / 9</span>
          </div>
          <div style={{ position: "absolute", left: 90, top: 170, width: 900, display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 26 }}>
            {EFFECTS.map((name, k) => {
              const inP = popScale(prog(t, SCENES.half2.start + 0.15 + k * 0.03, 0.3, (x) => x));
              const onP = prog(t, onAt(k), 0.15);
              const offP = k === 4 ? 0 : prog(t, offAt(k), 0.18);
              const litV = onP * (1 - offP);
              const isSpecial = k === 4;
              const sp = isSpecial ? special : 0;
              return (
                <div
                  key={name}
                  style={{
                    height: 190,
                    ...card({ borderRadius: 30 }),
                    background: litV > 0.5 ? "linear-gradient(160deg, #5C95FF 0%, #2A62E6 100%)" : "#FFFFFF",
                    boxShadow:
                      litV > 0.5
                        ? `0 18px 40px rgba(42,98,230,${0.25 + 0.35 * sp}), 0 0 ${40 * sp}px rgba(61,123,255,${0.6 * sp})`
                        : "0 18px 40px rgba(40,34,26,0.12)",
                    transform: `scale(${inP * (1 + 0.1 * sp)})`,
                    opacity: isSpecial || litV > 0.5 ? 1 : 0.55 + 0.45 * (1 - prog(t, offStart, 0.3)),
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: 14,
                    zIndex: isSpecial ? 2 : 1,
                  }}
                >
                  <div style={{ width: 22, height: 22, borderRadius: 11, background: litV > 0.5 ? "#FFFFFF" : "#DCD8D1" }} />
                  <div style={{ fontFamily: sans, fontWeight: 500, fontSize: 32, color: litV > 0.5 ? "#FFFFFF" : C.charcoal }}>{name}</div>
                </div>
              );
            })}
          </div>
          <Sparkle x={680} y={430} size={58} t={t} at={WORDS[81].s + 0.05} />
          <Sparkle x={400} y={610} size={40} t={t} at={WORDS[81].s + 0.18} />
        </>
      );
    }}
  </SceneFrame>
);

// ---------- FULL 2: spotlight / grab attention ----------

const SPOT_CARDS = [
  { x: 120, y: 760, r: -4 },
  { x: 600, y: 700, r: 3 },
  { x: 360, y: 860, r: 0 }, // hero (center)
  { x: 110, y: 1090, r: 2 },
  { x: 620, y: 1060, r: -3 },
];

export const Full2Spotlight: React.FC = () => (
  <SceneFrame kind="full" start={SCENES.full2.start} end={SCENES.full2.end}>
    {(t) => {
      const land = prog(t, WORDS[95].s, 0.3);
      // beam sweeps, phir hero card par rukta hai
      const sweep = prog(t, SCENES.full2.start + 0.3, WORDS[95].s - SCENES.full2.start - 0.3, (x) => x * x * (3 - 2 * x));
      const beamX = land > 0 ? 540 : 260 + Math.sin(sweep * Math.PI * 1.5) * 300 + sweep * 30;
      const cursorP = prog(t, WORDS[94].s - 0.3, 0.5);
      const click = prog(t, WORDS[96].s, 0.25);
      return (
        <>
          <GhostCard x={-140} y={260} w={320} h={230} rot={-8} blur={4} />
          <GhostCard x={880} y={1500} w={340} h={240} rot={7} blur={4} />

          {/* text */}
          <div style={{ position: "absolute", left: 0, right: 0, top: 170, textAlign: "center", zIndex: 4 }}>
            <div>{[84, 85].map((i) => <SW key={i} i={i} t={t} />)}</div>
            <div style={{ marginTop: -4 }}>{[86, 87].map((i) => <SS key={i} i={i} t={t} />)}</div>
          </div>
          <div style={{ position: "absolute", left: 60, right: 60, top: 1500, textAlign: "center", zIndex: 4 }}>
            <div>{[88, 89, 90, 91, 92, 93, 94].map((i) => <SW key={i} i={i} t={t} size={44} />)}</div>
            <div style={{ marginTop: -2 }}>{[95, 96].map((i) => <SS key={i} i={i} t={t} size={112} text={i === 96 ? "attention." : undefined} />)}</div>
          </div>

          {/* spotlight: baaki frame dim, beam wali jagah roshan */}
          <AbsoluteFill
            style={{
              background: `radial-gradient(ellipse 330px 300px at ${beamX}px 980px, rgba(20,18,16,0) 0%, rgba(20,18,16,0) 45%, rgba(20,18,16,0.5) 100%)`,
              opacity: prog(t, SCENES.full2.start + 0.25, 0.4) * (0.75 + 0.25 * land),
              zIndex: 2,
            }}
          />
          {/* spotlight beam */}
          <div
            style={{
              position: "absolute",
              left: beamX - 260,
              top: 380,
              width: 520,
              height: 820,
              background: "linear-gradient(180deg, rgba(255,255,255,0) 0%, rgba(255,250,235,0.85) 100%)",
              clipPath: "polygon(42% 0%, 58% 0%, 100% 100%, 0% 100%)",
              filter: "blur(18px)",
              opacity: 0.55,
              zIndex: 2,
            }}
          />

          {/* cards */}
          {SPOT_CARDS.map((c, k) => {
            const hero = k === 2;
            const inP = popScale(prog(t, SCENES.full2.start + 0.1 + k * 0.06, 0.35, (x) => x));
            const dim = hero ? 0 : land;
            return (
              <div
                key={k}
                style={{
                  position: "absolute",
                  left: c.x,
                  top: c.y,
                  width: 350,
                  height: 230,
                  transform: `rotate(${c.r}deg) scale(${inP * (hero ? 1 + 0.1 * land : 1)})`,
                  ...card({ borderRadius: 30 }),
                  opacity: 1 - 0.55 * dim,
                  filter: `grayscale(${hero ? 1 - land : 1}) blur(${dim * 2}px)`,
                  boxShadow: hero
                    ? `0 24px 50px rgba(42,98,230,${0.12 + 0.3 * land}), 0 0 ${60 * land}px rgba(61,123,255,${0.45 * land})`
                    : "0 18px 40px rgba(40,34,26,0.12)",
                  zIndex: hero ? 3 : 1,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 18, margin: "34px 32px 0" }}>
                  <div style={{ width: 64, height: 64, borderRadius: 18, background: hero ? "linear-gradient(160deg, #5C95FF, #2A62E6)" : "#E4E0DA" }} />
                  <div>
                    <div style={{ width: 150, height: 16, borderRadius: 8, background: hero ? C.charcoal : "#E4E0DA" }} />
                    <div style={{ marginTop: 10, width: 100, height: 12, borderRadius: 6, background: "#ECE9E3" }} />
                  </div>
                </div>
                <div style={{ margin: "30px 32px 0", height: 14, borderRadius: 7, background: "#EFECE7" }} />
                <div style={{ margin: "12px 32px 0", width: 180, height: 14, borderRadius: 7, background: hero ? "#CFDDFF" : "#F1EEE9" }} />
              </div>
            );
          })}

          {/* cursor click */}
          {cursorP > 0 && (
            <svg
              width="64"
              height="76"
              viewBox="0 0 24 28"
              style={{
                position: "absolute",
                left: 760 - cursorP * 120,
                top: 1180 - cursorP * 160,
                transform: `scale(${1 - 0.15 * Math.sin(Math.PI * click)})`,
                filter: "drop-shadow(0 4px 6px rgba(0,0,0,0.3))",
                zIndex: 5,
              }}
            >
              <path d="M2 2 L2 22 L7.5 16.5 L11 25 L14.5 23.5 L11 15 L19 15 Z" fill={C.charcoal} stroke="#fff" strokeWidth="1.4" />
            </svg>
          )}
        </>
      );
    }}
  </SceneFrame>
);

// ---------- HALF 3: harsh palette ----------

const HARSH = [
  { name: "HARSH BLACK", hex: "#000000", word: 107 },
  { name: "HARSH WHITE", hex: "#FFFFFF", word: 109 },
  { name: "BRIGHT RED", hex: "#FF1E1E", word: 111 },
];

export const Half3Harsh: React.FC = () => (
  <SceneFrame kind="half" start={SCENES.half3.start} end={SCENES.half3.end}>
    {(t) => {
      const stamp = popScale(prog(t, WORDS[112].e - 0.1, 0.32, (x) => x));
      return (
        <>
          <div style={{ position: "absolute", left: 0, right: 0, top: 110, textAlign: "center", fontFamily: sans, fontSize: 22, letterSpacing: 5, fontWeight: 500, color: C.muted }}>
            THE BEGINNER PALETTE
          </div>
          <div style={{ position: "absolute", left: 0, right: 0, top: 290, display: "flex", justifyContent: "center", gap: 46 }}>
            {HARSH.map((c) => {
              const p = popScale(prog(t, WORDS[c.word].s - 0.05, 0.34, (x) => x));
              return (
                <div key={c.name} style={{ width: 240, textAlign: "center", transform: `scale(${p})`, opacity: Math.min(1, p * 2) }}>
                  <div
                    style={{
                      width: 240,
                      height: 240,
                      borderRadius: 48,
                      background: c.hex,
                      border: c.hex === "#FFFFFF" ? "2px solid #E4E0DA" : "none",
                      boxShadow: "0 24px 50px rgba(40,34,26,0.18)",
                    }}
                  />
                  <div style={{ marginTop: 24, fontFamily: sans, fontWeight: 600, fontSize: 24, letterSpacing: 3, color: C.charcoal }}>{c.name}</div>
                  <div style={{ marginTop: 6, fontFamily: sans, fontSize: 22, color: C.muted, letterSpacing: 1 }}>{c.hex}</div>
                </div>
              );
            })}
          </div>
          <div
            style={{
              position: "absolute",
              left: 640,
              top: 210,
              padding: "10px 22px",
              border: "4px solid #E02424",
              borderRadius: 12,
              color: "#E02424",
              fontFamily: sans,
              fontWeight: 700,
              fontSize: 30,
              letterSpacing: 4,
              transform: `rotate(-10deg) scale(${stamp})`,
              background: "rgba(255,255,255,0.7)",
            }}
          >
            TOO HARSH
          </div>
        </>
      );
    }}
  </SceneFrame>
);

// ---------- FULL 3: luxury brands → more high-end ----------

const BRANDS: { label: string; x: number; y: number; style: React.CSSProperties }[] = [
  { label: "TIFFANY & CO.", x: 640, y: 330, style: { fontFamily: serifUpright, fontSize: 30, letterSpacing: 3 } },
  { label: "ROLEX", x: 700, y: 520, style: { fontFamily: serifUpright, fontSize: 40, letterSpacing: 6, color: "#2F5A43", fontWeight: 500 } },
  { label: "Cartier", x: 110, y: 560, style: { fontFamily: serif, fontStyle: "italic", fontSize: 50 } },
  { label: "CHANEL", x: 680, y: 1190, style: { fontFamily: sans, fontWeight: 600, fontSize: 36, letterSpacing: 7 } },
  { label: "Dior", x: 160, y: 1240, style: { fontFamily: serifUpright, fontSize: 58 } },
  { label: "HERMÈS", x: 120, y: 350, style: { fontFamily: serifUpright, fontSize: 32, letterSpacing: 6, color: "#7A5B3E" } },
  { label: "LOUIS VUITTON", x: 380, y: 1390, style: { fontFamily: sans, fontWeight: 500, fontSize: 24, letterSpacing: 4 } },
];
const DULL = [
  { name: "DULL BLUE", hex: C.dullBlue, word: 119 },
  { name: "SAGE GREEN", hex: C.sage, word: 122 },
];

export const Full3HighEnd: React.FC = () => (
  <SceneFrame kind="full" start={SCENES.full3.start} end={SCENES.full3.end}>
    {(t) => {
      const phaseB = prog(t, WORDS[124].s - 0.35, 0.35);
      return (
        <>
          {/* Phase A: brands + dull colors */}
          <AbsoluteFill style={{ opacity: 1 - phaseB, transform: `scale(${1 + phaseB * 0.12})` }}>
            {BRANDS.map((b, k) => {
              const p = popScale(prog(t, WORDS[114].s + k * 0.17, 0.32, (x) => x));
              return (
                <div
                  key={b.label}
                  style={{
                    position: "absolute",
                    left: b.x,
                    top: b.y,
                    padding: "22px 34px",
                    ...card({ borderRadius: 18 }),
                    color: C.charcoal,
                    transform: `scale(${p})`,
                    whiteSpace: "nowrap",
                    ...b.style,
                  }}
                >
                  {b.label}
                </div>
              );
            })}
            <div style={{ position: "absolute", left: 0, right: 0, top: 760, textAlign: "center" }}>
              <div>{[113, 114].map((i) => <SW key={i} i={i} t={t} size={50} />)}</div>
              <div>{[115, 116].map((i) => <SW key={i} i={i} t={t} size={50} />)}</div>
              <div style={{ marginTop: -2 }}>{[117, 118].map((i) => <SS key={i} i={i} t={t} size={124} from="#6F82A3" to="#4F5F7C" text={i === 118 ? "colors" : undefined} />)}</div>
            </div>
            <div style={{ position: "absolute", left: 0, right: 0, top: 1580, display: "flex", justifyContent: "center", gap: 30 }}>
              {DULL.map((d) => {
                const p = popScale(prog(t, WORDS[d.word].s, 0.34, (x) => x));
                return (
                  <div key={d.name} style={{ display: "flex", alignItems: "center", gap: 18, padding: "16px 26px 16px 16px", ...card({ borderRadius: 24 }), transform: `scale(${p})` }}>
                    <div style={{ width: 70, height: 70, borderRadius: 18, background: d.hex }} />
                    <div style={{ fontFamily: sans }}>
                      <div style={{ fontWeight: 600, fontSize: 22, letterSpacing: 3, color: C.charcoal }}>{d.name}</div>
                      <div style={{ fontSize: 20, color: C.muted, marginTop: 4 }}>{d.hex}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </AbsoluteFill>

          {/* Phase B: text only */}
          {phaseB > 0 && (
            <div style={{ position: "absolute", left: 60, right: 60, top: 780, textAlign: "center" }}>
              <div>
                {[124, 125, 126, 127].map((i) => (
                  <span key={i} style={{ display: "inline-block", marginRight: 16, fontFamily: serifUpright, fontSize: 70, color: C.charcoal, ...wordIn(t, WORDS[i].s - 0.04) }}>
                    {WORDS[i].w}
                  </span>
                ))}
              </div>
              <div style={{ marginTop: 4 }}>{[128, 129].map((i) => <SS key={i} i={i} t={t} size={140} from="#6F82A3" to="#4F5F7C" />)}</div>
            </div>
          )}
        </>
      );
    }}
  </SceneFrame>
);
