// Remotion timeline → JSON (Premiere XML aur After Effects script isi se bante hain)
import { SCENES, CAPTIONS, DURATION } from "../src/timeline";
import { WORDS } from "../src/lib";
import { WHOOSHES, TEXTURES, RISERS, HITS } from "../src/Sound";
import cut from "./cut.json";

const out = { duration: DURATION, fps: 30, scenes: SCENES, captions: CAPTIONS, words: WORDS, ranges: cut.ranges, sfx: { WHOOSHES, TEXTURES, RISERS, HITS } };
console.log(JSON.stringify(out));
