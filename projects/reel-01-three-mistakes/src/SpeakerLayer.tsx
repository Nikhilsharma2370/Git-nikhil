import React from "react";
import { AbsoluteFill, OffthreadVideo, staticFile, useCurrentFrame } from "remotion";
import { FACE, FPS, H } from "./theme";
import { SCENES } from "./timeline";
import { easeInOut, prog } from "./lib";

const HALF_SHIFT = 840; // face center 520 → 1360 (neeche wale half ke beech)

const halfAmount = (t: number) => {
  const ranges = [SCENES.half1, SCENES.half2, SCENES.half3];
  let v = 0;
  for (const r of ranges) {
    const inP = prog(t, r.start, 0.28, easeInOut);
    const outP = prog(t, r.end - 0.2, 0.2, easeInOut);
    v = Math.max(v, inP * (1 - outP));
  }
  return v;
};

const zoomAmount = (t: number) => {
  const r = SCENES.zoom;
  // punch-in on "As a rule of thumb" + slow drift, out at the end
  const punch = prog(t, r.start + 0.12, 0.3);
  const drift = prog(t, r.start + 0.4, r.end - r.start - 0.4, (x) => x);
  const out = prog(t, r.end - 0.05, 0.05);
  return (0.16 * punch + 0.04 * drift) * (1 - out);
};

// On-screen UI ke time pe neeche ka hissa dark + blur (brief ka rule)
const uiWindows = () => [
  [SCENES.hook.start, SCENES.n1.end],
  [SCENES.n2.start, SCENES.n2.end],
  [SCENES.n3.start, SCENES.n3.end],
  [SCENES.recap.start, SCENES.recap.end + 1],
];
export const uiDim = (t: number) => {
  let v = 0;
  for (const [a, b] of uiWindows()) {
    const inP = prog(t, a + 0.05, 0.3);
    const outP = prog(t, b - 0.12, 0.12);
    v = Math.max(v, inP * (1 - outP));
  }
  return v;
};

export const SpeakerLayer: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const h = halfAmount(t);
  const z = zoomAmount(t);
  const dim = uiDim(t);
  // halki si constant drift taaki frame zinda lage
  const breathe = 1 + 0.015 * Math.sin(t * 0.35);

  return (
    <AbsoluteFill style={{ backgroundColor: "#0b1a2c", overflow: "hidden" }}>
      <AbsoluteFill
        style={{
          transform: `translateY(${h * HALF_SHIFT}px) scale(${(1 + z) * breathe})`,
          transformOrigin: `${FACE.x}px ${FACE.y}px`,
        }}
      >
        <OffthreadVideo src={staticFile("footage.mp4")} style={{ width: "100%", height: "100%" }} />
      </AbsoluteFill>

      {/* Caption readability: halka neeche ka gradient hamesha */}
      <AbsoluteFill
        style={{ background: "linear-gradient(180deg, rgba(0,0,0,0) 45%, rgba(0,0,0,0.28) 100%)" }}
      />

      {/* UI ke peeche: blur + darken, mid-frame se neeche */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: H * 0.44,
          bottom: 0,
          opacity: dim,
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          maskImage: "linear-gradient(180deg, transparent 0%, black 30%)",
          WebkitMaskImage: "linear-gradient(180deg, transparent 0%, black 30%)",
          background: "linear-gradient(180deg, rgba(4,8,14,0) 0%, rgba(4,8,14,0.45) 35%, rgba(4,8,14,0.62) 100%)",
        }}
      />
    </AbsoluteFill>
  );
};
