import React from "react";
import { Audio, Sequence, staticFile } from "remotion";
import { FPS } from "./theme";
import { SCENES } from "./timeline";
import { WORDS } from "./lib";

// Lesson 09. `at` = sync point (seconds). `offset` = file ke andar sync point kahan hai.
// Whoosh: peak (0.55s) fastest frame par. Riser: end (2.0s) transition frame par. Texture: transient event frame par.
type Cue = { file: string; at: number; offset?: number; db: number; note: string };

const WHOOSH_PEAK = 0.55;
const RISER_LEN = 2.0;
const dbToGain = (db: number) => Math.pow(10, db / 20);
const halfIn = (start: number) => start + 0.14; // easeInOut 0.28s ka fastest point
const halfOut = (end: number) => end - 0.1;

const W = WORDS;
const S = SCENES;

export const WHOOSHES: Cue[] = [
  { file: "whoosh_deep", at: S.full1.start + 0.06, db: -10, note: "full 1 enter" },
  { file: "whoosh_hollow", at: S.zoom.start + 0.16, db: -12, note: "zoom punch-in" },
  { file: "whoosh_hollow", at: halfIn(S.half1.start), db: -12, note: "half 1 slide down" },
  { file: "whoosh_transition", at: halfOut(S.half1.end), db: -12, note: "half 1 slide up" },
  { file: "whoosh_deep", at: halfIn(S.half2.start), db: -12, note: "half 2 slide down" },
  { file: "whoosh_deep", at: S.full2.start + 0.06, db: -10, note: "full 2 enter" },
  { file: "whoosh_transition", at: S.full2.end - 0.1, db: -12, note: "full 2 exit" },
  { file: "whoosh_hollow", at: halfIn(S.half3.start), db: -12, note: "half 3 slide down" },
  { file: "whoosh_deep", at: S.full3.start + 0.06, db: -10, note: "full 3 enter" },
  { file: "whoosh_transition", at: W[124].s - 0.18, db: -12, note: "brands → high-end text swap" },
  { file: "whoosh_transition", at: S.full3.end - 0.1, db: -12, note: "full 3 exit" },
].map((c) => ({ ...c, offset: WHOOSH_PEAK }));

export const TEXTURES: Cue[] = [
  // hook
  { file: "pop", at: 0.15, db: -8, note: "name tag" },
  { file: "ui_click", at: 0.34, db: -7, note: "step 1 appear" },
  { file: "ui_click", at: 0.5, db: -7, note: "step 2 appear" },
  { file: "ui_click", at: 0.66, db: -7, note: "step 3 appear" },
  // UI cards
  { file: "ui_click", at: S.slider.start, db: -7, note: "slider card" },
  { file: "scifi_click", at: W[22].s + 0.3, db: -6, note: "slider → professional" },
  { file: "ui_click", at: S.n1.start, db: -7, note: "stepper card (1)" },
  { file: "scifi_click", at: W[23].s, db: -6, note: "step 1 fill" },
  { file: "ui_click", at: S.n2.start, db: -7, note: "stepper card (2)" },
  { file: "scifi_click", at: W[66].s, db: -6, note: "step 2 fill" },
  { file: "ui_click", at: S.n3.start, db: -7, note: "stepper card (3)" },
  { file: "scifi_click", at: W[97].s, db: -6, note: "step 3 fill" },
  { file: "ui_click", at: S.recap.start, db: -7, note: "recap stepper" },
  { file: "scifi_click", at: W[137].s, db: -6, note: "recap step 1" },
  { file: "scifi_click", at: W[138].s, db: -6, note: "recap step 2" },
  { file: "scifi_click", at: W[139].s, db: -6, note: "recap step 3" },
  { file: "ui_click", at: 49.86, db: -7, note: "recap slider" },
  { file: "success", at: W[151].s, db: -7, note: "conclusion" },
  // full 1
  { file: "pop", at: W[35].s, db: -6, note: "huge arrow icon" },
  { file: "pop", at: W[36].s, db: -6, note: "huge star icon" },
  { file: "scifi_impact", at: W[38].s, db: -7, note: "huge shape 1" },
  { file: "pop", at: W[39].s, db: -6, note: "huge shape 2" },
  // half 1
  { file: "pop", at: W[56].s, db: -6, note: "−25% badge" },
  { file: "scifi_click", at: W[57].s, db: -7, note: "shrink particles" },
  { file: "gear_tick", at: W[63].s, db: -7, note: "sparkle" },
  { file: "gear_tick", at: W[63].s + 0.12, db: -7, note: "sparkle" },
  // half 2
  { file: "ui_click", at: W[70].s, db: -6, note: "all effects on" },
  ...[0, 1, 2, 3, 4, 5, 6, 7].map((k) => ({
    file: "gear_tick",
    at: W[74].s + (k / 7) * (W[80].s - W[74].s),
    db: -9,
    note: `effect off ${k + 1}`,
  })),
  { file: "scifi_impact", at: W[81].s, db: -6, note: "special (Glow) highlight" },
  // full 2
  ...[0, 1, 2, 3, 4].map((k) => ({ file: "gear_tick", at: S.full2.start + 0.1 + k * 0.06, db: -9, note: `card ${k + 1} pop` })),
  { file: "scifi_impact", at: W[95].s, db: -6, note: "spotlight lands" },
  { file: "ui_click", at: W[96].s, db: -6, note: "cursor click" },
  // half 3
  { file: "pop", at: W[107].s - 0.05, db: -6, note: "harsh black" },
  { file: "pop", at: W[109].s - 0.05, db: -6, note: "harsh white" },
  { file: "pop", at: W[111].s - 0.05, db: -6, note: "bright red" },
  { file: "scifi_click", at: W[112].e - 0.1, db: -6, note: "TOO HARSH stamp" },
  // full 3
  ...[0, 1, 2, 3, 4, 5, 6].map((k) => ({ file: "gear_tick", at: W[114].s + k * 0.17, db: -8, note: `brand card ${k + 1}` })),
  { file: "ui_click", at: W[119].s, db: -7, note: "dull blue chip" },
  { file: "ui_click", at: W[122].s, db: -7, note: "sage chip" },
];

// Risers: end on the transition frame; hit underneath. 2 bass + 2 metallic.
export const RISERS: Cue[] = [
  { file: "riser_bass", at: S.full1.start, db: -5, note: "into point 1 visual (~5s after hook)" },
  { file: "riser_metal", at: S.full2.start, db: -5, note: "into spotlight" },
  { file: "riser_bass", at: S.full3.start, db: -5, note: "into luxury brands" },
  { file: "riser_metal", at: S.recap.start, db: -5, note: "into recap" },
].map((c) => ({ ...c, offset: RISER_LEN }));

export const HITS: Cue[] = RISERS.map((r) => ({ file: "hit", at: r.at, db: -9, note: `hit under ${r.file}` }));

const Track: React.FC<{ name: string; cues: Cue[] }> = ({ name, cues }) => (
  <>
    {cues.map((c, k) => {
      const from = Math.round((c.at - (c.offset ?? 0)) * FPS);
      return (
        <Sequence key={`${name}-${k}`} name={`${name}: ${c.note}`} from={from} layout="none">
          <Audio src={staticFile(`sfx/${c.file}.wav`)} volume={dbToGain(c.db)} />
        </Sequence>
      );
    })}
  </>
);

export const SoundDesign: React.FC = () => (
  <>
    <Track name="WHOOSHES" cues={WHOOSHES} />
    <Track name="TEXTURES" cues={TEXTURES} />
    <Track name="RISERS" cues={RISERS} />
    <Track name="HITS" cues={HITS} />
  </>
);
