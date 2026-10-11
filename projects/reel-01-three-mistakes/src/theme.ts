import { continueRender, delayRender, staticFile } from "remotion";

// Fonts local files se (Chrome yahan Google Fonts CDN ka certificate trust nahi karta).
// Sans: Creato Display ki jagah Inter (variable, saare weights). Script: Apple Garamond ki jagah EB Garamond Italic.
const FONTS: { family: string; file: string; style: string }[] = [
  { family: "Inter", file: "fonts/Inter-var.woff2", style: "normal" },
  { family: "EB Garamond", file: "fonts/EBGaramond-var.woff2", style: "normal" },
  { family: "EB Garamond", file: "fonts/EBGaramond-italic-var.woff2", style: "italic" },
];
if (typeof document !== "undefined") {
  const handle = delayRender("Loading fonts");
  Promise.all(
    FONTS.map((f) => {
      const face = new FontFace(f.family, `url(${staticFile(f.file)}) format("woff2")`, { style: f.style, weight: "300 800" });
      document.fonts.add(face);
      return face.load();
    }),
  )
    .then(() => continueRender(handle))
    .catch((e) => {
      console.error(e);
      continueRender(handle);
    });
}

export const sans = "Inter";
export const serif = "EB Garamond";
export const serifUpright = "EB Garamond";

export const C = {
  // Captions (speaker par)
  white: "#F3F3F3",
  accent: "#5B95FF", // footage ka dominant color blue hai → accent blue
  accentGlow: "rgba(91,149,255,0.55)",
  // Paper scenes (3-tone: off-white + charcoal + ek special color)
  paper: "#F1EFEA",
  charcoal: "#2E2C2A",
  muted: "#8B8780",
  blue: "#3D7BFF",
  blueDeep: "#2A62E6",
  dullBlue: "#5D6F8F",
  sage: "#7D8C76",
  // On-screen UI
  glass: "rgba(18,20,26,0.82)",
  glassBorder: "rgba(255,255,255,0.12)",
  uiGrey: "#8A8F98",
};

export const FPS = 30;
export const W = 1080;
export const H = 1920;
// Half-screen split line
export const SPLIT = 960;
// Footage me face ka center (zoom aur half-screen crop ke liye)
export const FACE = { x: 495, y: 520 };
