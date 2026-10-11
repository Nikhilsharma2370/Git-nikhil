---
name: viral-reel-editor
description: Edit a raw talking-head video into a viral-style 9:16 reel (Instagram Reels / YouTube Shorts / TikTok) in Nikhil's house style — jump cuts with retake detection, word-synced sans + script captions, hook, on-screen UI cards, half-screen and full-screen animated scenes, Gemini (Nano Banana) object graphics cut out to transparent PNGs, sound design (whooshes, textures, risers), rendered with Remotion — plus an editable After Effects (.aep via script) and Premiere Pro (XML → .prproj) kit. Use this whenever Nikhil sends footage or asks for a reel, short, edit, captions, hook, animation, UI overlay, motion graphics, sound design, "Remotion me edit karo", "reel banao", "caption lagao", "animation banao", "After Effects / Premiere me editable file do", or wants graphics "Photoshop / Gemini se", even if he doesn't say "skill" or name every step.
---

# Viral Reel Editor

Turns raw talking-head footage into a finished 9:16 reel in the "viral talking head" style (modeled on Joseph Eid / Ultimate Editors), and optionally an editable Adobe kit. Talk to Nikhil in **Hinglish**, short and plain. Show progress with stills/videos rather than long explanations.

**Read first:** `references/style-brief.md` — the house style (captions, layouts, hook, 3 animation kinds, scene build, UI cards, graphs, checklist). Every visual decision should trace back to it.

Other references (read when you reach that step):
- `references/sound-design.md` — SFX families, levels, 3-pass order (Hinglish notes)
- `references/gemini-graphics.md` — generating objects with Gemini + local cutouts
- `references/adobe-kit.md` — After Effects script + Premiere XML kit
- `references/environment-notes.md` — fonts/proxy, browser path, whisper, upload limits, Drive/YouTube tricks

Bundled tools:
- `assets/remotion-template/` — a complete working Remotion project (52s reel) to copy; its README says which files are generic vs reel-specific
- `assets/adobe/build_reel_TEMPLATE.jsx` + `assets/adobe/fonts/` — After Effects build script template and TTFs
- `scripts/find_cuts.py` (plan / check / render), `scripts/transcribe.py`, `scripts/sfx.py`, `scripts/cutout.py`, `scripts/export-data.ts`, `scripts/export_premiere.py`, `scripts/mock_ae.js`

If this repo has a `learnings/` folder with lesson notes and reference images, open the relevant ones too — they are the visual targets the brief was written from.

---

## Workflow

### 0. Inputs
- Raw footage (vertical 1080×1920 ideal). If he hasn't sent any, ask; for practice you may use footage a creator has explicitly shared for practice — say it's demo-only, not for posting.
- Speaker name + role for the name tag (ask, or leave a placeholder he can edit).

### 1. Cut (jump cuts, no silences, no bad takes)
```bash
python3 scripts/transcribe.py raw.mp4 raw_words.json            # raw transcript (for the planner)
python3 scripts/find_cuts.py plan  raw.mp4 raw_words.json cuts.json [--end <sec before any outro/outtake>]
python3 scripts/find_cuts.py check raw.mp4 cuts.json             # per-range transcript + RETAKE? flags
# remove flagged incomplete takes / outtakes from cuts.json, then:
python3 scripts/find_cuts.py render raw.mp4 cuts.json cut.mp4
```
Why `check` matters: whisper on the whole raw file merges a false start and its retake into one line, so retakes are invisible in the raw transcript. Per-range transcription exposes them ("Number one, stop oversizing." followed by "Number one, stop oversizing everything." → drop the first). Also drop trailing outtakes ("Awesome.") and noise-only ranges. Aim for ~65–70% of the raw length.

### 2. Transcribe the cut
`python3 scripts/transcribe.py cut.mp4 words.json --merge` — always transcribe the **cut** file; remapped raw timestamps drift up to ~0.9s. Print the words with indices; captions and scenes are keyed to word indices.

### 3. Plan the edit (write it down, show him)
Grab one frame, overlay a pixel grid, and note the face box and mic area (FACE point for zoom/half-screen; captions sit below the face).
Then plan a timeline table: time · kind (on-screen / half / full / zoom) · what is shown · which word triggers it. Rules (from the style brief): speaker + name tag + payoff in the hook; per point on-screen number → half/full proof → speaker; never the same kind twice in a row; a new beat every 3–5s; a recurring UI (stepper) for structure and recap; objects = literal visuals of spoken words. Pick the accent color from the footage's dominant color.

### 4. Build in Remotion
- Copy `assets/remotion-template/` to the project folder, `npm install`, put `cut.mp4` at `public/footage.mp4` and `words.json` at `src/data/words.json`.
- Edit `src/timeline.ts` (SCENES + CAPTIONS), `src/scenes/Scenes.tsx` (this reel's scenes), `OnScreenUI.tsx` specs, name tag, `theme.ts` (accent, FACE), `Sound.tsx` cue lists.
- Graphics: CSS/SVG works; for real objects use Gemini (step 5) and the `Gfx` helper.
- `npx tsc --noEmit` must pass.

### 5. Gemini graphics (optional, costs credits)
Follow `references/gemini-graphics.md`: list ~10 objects, **tell him the credit cost and get a yes**, generate with Nano Banana 2 Lite via Magnific, cut out with `scripts/cutout.py`, check them on a contact sheet, drop into `public/graphics/`.

### 6. Sound design
Follow `references/sound-design.md`. If he has an SFX library, use its files; otherwise `python3 scripts/sfx.py public/sfx` synthesizes whooshes (peak at 0.55s), pop, ui/sci-fi clicks, impact, gear tick, bass + metallic risers (end at 2.0s), hit, success. In `Sound.tsx`: whooshes −12/−10 dB with the peak on the fastest frame of each move, textures −6…−9 dB on event frames, 2 bass + 2 metallic risers (−5 dB) ending on segment transitions (first ~5s after the hook) with a hit under each, no music under animations.

### 7. Check stills, then render
- `npx remotion bundle --out-dir <b>`, render 15–20 stills at checkpoints (`--scale=0.5`), combine into contact sheets and **look** for: text over faces, objects over text, captions wrapping onto the mic, things cut by the frame edge unintentionally, invisible effects (e.g. a light beam on a light background). Fix, re-check.
- Full render in the background (`--concurrency=4 --crf=18`), then re-encode a ≤30 MB copy for chat (see environment notes). Sample frames from the final file once more before sending.

### 8. Adobe kit (when he wants After Effects / Premiere)
Follow `references/adobe-kit.md`: export timeline data, adapt the AE template's SCENES section to this reel, validate (ES3 parse + `mock_ae.js`), generate the Premiere XML + SRT with `export_premiere.py`, write a Hinglish README, zip without footage, send. Be clear that `.aep`/`.prproj` are created on his machine by the script / Save As, that the files weren't run in real Adobe apps, and ask for a screenshot if anything errors. If computer use on his Mac/PC is available, offer to open the apps and do those steps.

### 9. Deliver
Send the video (and kit) with the file tool; one line each on what's inside. Commit the project source if working in a repo (keep footage, renders and `node_modules` out of git). Mention anything that is a substitute or untested (fonts, synthesized SFX, Adobe files).

---

## Defaults worth keeping
- Canvas 1080×1920 @ 30fps. All motion from `useCurrentFrame()` (no CSS transitions).
- Fonts: Inter (sans) + EB Garamond Bold Italic (script) as stand-ins for Creato Display + Apple Garamond.
- Captions `#F3F3F3`, ~46px sans; payoff ~104px script in the accent with glow; top of caption block ≈ y 905 (speaker) / 975 (half-screen).
- UI cards at y ≈ 1185, dark glass, darken + blur from mid-frame down while visible.
- Half-screen: speaker shifted down so the face sits in the lower half (≈ +840px for a face at y 520).
