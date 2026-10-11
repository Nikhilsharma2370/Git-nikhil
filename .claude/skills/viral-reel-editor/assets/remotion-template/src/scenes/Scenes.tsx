import React from "react";
import { AbsoluteFill, Img, OffthreadVideo, staticFile } from "remotion";
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

/** Gemini (Nano Banana) cutout PNG, casted shadow ke saath (Lesson 06 #4). */
const Gfx: React.FC<{ name: string; x: number; y: number; w: number; rot?: number; scale?: number; style?: React.CSSProperties }> = ({
  name,
  x,
  y,
  w,
  rot = 0,
  scale = 1,
  style,
}) => (
  <Img
    src={staticFile(`graphics/${name}.png`)}
    style={{
      position: "absolute",
      left: x - w / 2,
      top: y,
      width: w,
      transform: `translateY(-50%) rotate(${rot}deg) scale(${scale})`,
      filter: "drop-shadow(0 22px 26px rgba(40,34,26,0.22)) drop-shadow(0 4px 6px rgba(40,34,26,0.12))",
      ...style,
    }}
  />
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
          <Gfx name="camcorder" x={985} y={110} w={300} rot={8} style={{ filter: "blur(1.5px) drop-shadow(0 22px 26px rgba(40,34,26,0.22))" }} />
          <Gfx name="brush_stroke" x={180} y={1760} w={520} rot={-8} style={{ clipPath: `inset(0 ${(1 - brush) * 100}% 0 0)` }} />

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
            <Gfx name="arrow_huge" x={110} y={230} w={330} rot={-12} scale={icon1} />
            <Gfx name="star_huge" x={400} y={470} w={300} scale={icon2} />
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

          {/* hero: Gemini app icon */}
          <Img
            src={staticFile("graphics/app_icon.png")}
            style={{
              position: "absolute",
              left: cx - base / 2,
              top: cy - base / 2,
              width: base,
              height: base,
              transform: `scale(${s * appear})`,
              filter: "drop-shadow(0 26px 30px rgba(42,98,230,0.28))",
            }}
          />

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
          <Gfx name="sparkle" x={cx + 165} y={cy - 150} w={70} scale={popScale(prog(t, WORDS[63].s, 0.35, (v) => v))} />
          <Gfx name="sparkle" x={cx - 170} y={cy + 120} w={46} scale={popScale(prog(t, WORDS[63].s + 0.12, 0.35, (v) => v))} />
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
          <Gfx name="sparkle" x={690} y={420} w={84} scale={popScale(prog(t, WORDS[81].s + 0.05, 0.35, (v) => v))} />
          <Gfx name="sparkle" x={395} y={600} w={54} scale={popScale(prog(t, WORDS[81].s + 0.18, 0.35, (v) => v))} />
        </>
      );
    }}
  </SceneFrame>
);

// ---------- FULL 2: spotlight / grab attention (lamp + eye) ----------

const DEPTH_CARDS = [
  { x: 25, y: 645, r: -4 },
  { x: 705, y: 585, r: 3 },
  { x: 15, y: 1095, r: 2 },
  { x: 725, y: 1065, r: -3 },
];

export const Full2Spotlight: React.FC = () => (
  <SceneFrame kind="full" start={SCENES.full2.start} end={SCENES.full2.end}>
    {(t) => {
      const land = prog(t, WORDS[95].s, 0.3);
      // beam lamp se nikal ke sweep karta hai, phir aankh par rukta hai
      const k = [SCENES.full2.start + 0.3, SCENES.full2.start + 1.2, WORDS[95].s - 0.4, WORDS[95].s];
      const beamRot =
        t < k[1] ? 15 + (-60 - 15) * prog(t, k[0], k[1] - k[0], (x) => x * x * (3 - 2 * x))
        : t < k[2] ? -60 + (-15 + 60) * prog(t, k[1], k[2] - k[1], (x) => x * x * (3 - 2 * x))
        : -15 + (-41 + 15) * prog(t, k[2], k[3] - k[2], (x) => x * x * (3 - 2 * x));
      const eyeIn = popScale(prog(t, SCENES.full2.start + 0.2, 0.4, (x) => x));
      const dimOp = prog(t, SCENES.full2.start + 0.25, 0.4) * (0.76 + 0.24 * land);
      return (
        <>
          {DEPTH_CARDS.map((c, i) => (
            <div key={i} style={{ position: "absolute", left: c.x, top: c.y, opacity: 0.8 - 0.4 * land, transform: `scale(${popScale(prog(t, SCENES.full2.start + 0.1 + i * 0.06, 0.35, (x) => x))})` }}>
              <GhostCard x={0} y={0} w={350} h={230} rot={c.r} blur={land * 2} />
            </div>
          ))}
          <GhostCard x={-140} y={260} w={320} h={230} rot={-8} blur={4} />
          <GhostCard x={880} y={1500} w={340} h={240} rot={7} blur={4} />

          {/* spotlight: baaki frame dim, beam wali jagah roshan */}
          <AbsoluteFill
            style={{
              background: "radial-gradient(ellipse 330px 300px at 540px 980px, rgba(20,18,16,0) 0%, rgba(20,18,16,0) 45%, rgba(20,18,16,0.5) 100%)",
              opacity: dimOp,
            }}
          />
          <div
            style={{
              position: "absolute",
              left: 260 - 40,
              top: 680,
              width: 600,
              height: 800,
              transformOrigin: "40px 0px",
              transform: `rotate(${beamRot}deg)`,
              background: "linear-gradient(180deg, rgba(255,248,232,0.9) 0%, rgba(255,248,232,0.25) 100%)",
              clipPath: "polygon(0px 0px, 80px 0px, 600px 100%, 0% 100%)",
              filter: "blur(22px)",
              opacity: 0.5,
            }}
          />
          <Gfx name="spotlight_lamp" x={150} y={720} w={230} rot={25} />

          {/* hero: aankh — landing par rang aur bada */}
          <Img
            src={staticFile("graphics/eye.png")}
            style={{
              position: "absolute",
              left: 540 - 180,
              top: 980 - 180,
              width: 360,
              transform: `scale(${eyeIn * (1 + 0.12 * land)})`,
              filter: `grayscale(${1 - land}) drop-shadow(0 30px 40px rgba(40,34,26,0.25)) drop-shadow(0 0 ${50 * land}px rgba(255,240,210,${0.8 * land}))`,
            }}
          />

          <div style={{ position: "absolute", left: 0, right: 0, top: 170, textAlign: "center" }}>
            <div>{[84, 85].map((i) => <SW key={i} i={i} t={t} />)}</div>
            <div style={{ marginTop: -4 }}>{[86, 87].map((i) => <SS key={i} i={i} t={t} />)}</div>
          </div>
          <div style={{ position: "absolute", left: 60, right: 60, top: 1500, textAlign: "center" }}>
            <div>{[88, 89, 90, 91, 92, 93, 94].map((i) => <SW key={i} i={i} t={t} size={44} />)}</div>
            <div style={{ marginTop: -2 }}>{[95, 96].map((i) => <SS key={i} i={i} t={t} size={112} text={i === 96 ? "attention." : undefined} />)}</div>
          </div>
        </>
      );
    }}
  </SceneFrame>
);

// ---------- HALF 3: harsh palette (paint tubes) ----------

const HARSH = [
  { name: "HARSH BLACK", hex: "#000000", word: 107, file: "tube_black" },
  { name: "HARSH WHITE", hex: "#FFFFFF", word: 109, file: "tube_white" },
  { name: "BRIGHT RED", hex: "#FF1E1E", word: 111, file: "tube_red" },
];

export const Half3Harsh: React.FC = () => (
  <SceneFrame kind="half" start={SCENES.half3.start} end={SCENES.half3.end}>
    {(t) => {
      const stamp = popScale(prog(t, WORDS[112].e - 0.1, 0.32, (x) => x));
      return (
        <>
          <div style={{ position: "absolute", left: 0, right: 0, top: 100, textAlign: "center", fontFamily: sans, fontSize: 22, letterSpacing: 5, fontWeight: 500, color: C.muted }}>
            THE BEGINNER PALETTE
          </div>
          {HARSH.map((c, k) => {
            const p = popScale(prog(t, WORDS[c.word].s - 0.05, 0.34, (x) => x));
            const x = 290 + k * 250;
            return (
              <React.Fragment key={c.name}>
                <Gfx name={c.file} x={x} y={450} w={190} rot={(k - 1) * 6} scale={p} />
                <div style={{ position: "absolute", left: x - 140, width: 280, top: 770, textAlign: "center", transform: `scale(${p})`, opacity: Math.min(1, p * 2) }}>
                  <div style={{ fontFamily: sans, fontWeight: 600, fontSize: 24, letterSpacing: 3, color: C.charcoal }}>{c.name}</div>
                  <div style={{ marginTop: 6, fontFamily: sans, fontSize: 22, color: C.muted, letterSpacing: 1 }}>{c.hex}</div>
                </div>
              </React.Fragment>
            );
          })}
          <div
            style={{
              position: "absolute",
              left: 670,
              top: 215,
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
  { label: "LOUIS VUITTON", x: 690, y: 1400, style: { fontFamily: sans, fontWeight: 500, fontSize: 24, letterSpacing: 4 } },
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
            <Gfx name="perfume" x={540} y={1290} w={210} scale={popScale(prog(t, WORDS[117].s, 0.36, (v) => v))} />
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
