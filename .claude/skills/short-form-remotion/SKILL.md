---
name: short-form-remotion
description: Nikhil's full brief for editing short-form talking-head videos (Reels / Shorts / TikTok, 9:16) with Remotion — captions (sans + script), hooks, the 3 animation kinds (on-screen UI, half-screen, full-screen), scene categories (text / object / character / video centric), the 4-step scene build, design principles, graphs, on-screen UI overlays with darkened + blurred background, and sound design (whooshes / textures / risers). Use this every time you create captions, a hook, an animation, a scene, a UI overlay, or a full edit with Remotion (or any code-based video) for Nikhil, even if he only says "reel banao", "caption lagao", "animation banao", "Remotion me edit karo".
---

# Short-Form Talking-Head Editing with Remotion

This is the house style. Every rule below comes from Nikhil's brief and the lessons in `learnings/`. The brief is modeled on Joseph Eid's (Ultimate Editors) "viral talking head" style; his finished example edit is analyzed in `learnings/video-editing/08-three-animation-kinds-and-video-centric.md` — use its timeline as the reference for pacing. Before building, **open the referenced lesson files and look at their reference images** — they are the visual target, not optional extras. Also load the `remotion-best-practices` skill for Remotion API details if it is available.

Canvas: **1080×1920, 30fps**. Speaker footage via `<OffthreadVideo>`; assets via `staticFile()`; all motion from `useCurrentFrame()` + `interpolate()` / `spring()` (never CSS transitions).

The brief has 9 parts (+ setup notes in §10). Work through them in this order.

---

## 1. Captions & stylization
**Read:** `learnings/video-editing/01-podcast-caption-style.md`, `02-caption-typography-system.md`

Two kinds of caption text:

| | Sans (regular words) | Script (special words) |
|---|---|---|
| Font | **Creato Display** (fallback Inter / Satoshi). Use a family with many weights (Thin → Black) and vary them | **Apple Garamond Italic** (fallback EB Garamond / Cormorant Garamond Italic) |
| Weight | Opposite of the script: thin sans ↔ bold script, and vice versa | Opposite of the sans |
| Color | `#F3F3F3` (warm white, never `#FFFFFF`) | Vibrant accent pulled from the footage's dominant color (orange `#F19441` for warm studios, gold, lime, etc.) |
| Effect | Light drop shadow (black, 20–30%, y 1–2px, blur 4–8px) | **Glow** in the accent color (40–60%, 15–30px) |
| Size | Smaller than "normal" — small text reads premium | ~2× the sans; only the special word is big |

**Placement:** lower third, center aligned (unless a special layout is chosen). Never over the face; over the chest/mic is fine. Max 3–5 words per line.

**Animation:** word-by-word pop-up. Each word: `translateY` +15–25px → 0, opacity 0 → 1, `blur` 8–12px → 0, ease-out (spring with no bounce, or `Easing.out(Easing.cubic)`), 8–12 frames per word, 2–4 frame stagger or synced to word timestamps. **The whole caption's animation never exceeds 1.5s.**

## 2. Caption inspiration board
**Read:** `learnings/video-editing/03-caption-layout-inspiration.md` (9 reference frames in `assets/03-text-inspo-*.png`)

Every caption = **Setup (small sans) → Payoff (big script/accent) → Tail (small sans)**. Pick one of the 7 layouts every time, and rotate them:
A center sandwich · B hero number left-aligned · C sentence + punchline · D scattered tiny UPPERCASE + script · E speaker name tag · F inverted pair (bold sans payoff + thin italic tail) · G monochrome caps.
Payoff words: numbers, money, power verbs, the core concept.

## 3. Hook
**Read:** `learnings/video-editing/04-hook-editing.md`

- **Keep the speaker on screen** in the hook (first frames = face). Add the name tag + role line.
- Ask: *"What one thing makes the viewer want to watch?"* — visualize exactly that word as the payoff.
- Choose the payoff by trigger: fear/problem · topic · desire · number/money · negative/controversial word.
- Show the right text at the right sound: the payoff must land on the frame the word is spoken.
- Keep viewers hooked through the video: a new visual beat (caption payoff, scene, or UI card) every few seconds; never the same scene type twice in a row.

## 4. Full-screen animations guide
**Read:** `learnings/video-editing/05-animated-scene-types.md` (+ its 4 slide images) and `08-three-animation-kinds-and-video-centric.md` (+ key frames)

### The three kinds of animations
| Kind | Frame | Use when |
|---|---|---|
| **On-screen (UI)** | Speaker fills the frame; lower part darkened + blurred; caption, then a small dark-glass UI below it (see §7) | Structure and small facts: steppers ①②③, sliders, counters, lists |
| **Half-screen** | Hard split: top ~50% = off-white paper + grid scene with one big object/UI; bottom ~50% = speaker crop (face centered), caption over the speaker half | The point needs a visual **and** the speaker's expression |
| **Full-screen** | Speaker gone; the whole frame is the paper + grid scene (§5) | Big visual proof, reveals, lists of examples |

Plus **zooms / camera moves** on the speaker between scenes. Rotate the kinds — never the same kind twice in a row; a new visual every 3–5s. Per point: on-screen (number/title) → half or full (visual proof) → back to speaker.

### Scene categories (inside half- and full-screen)

| Category | Types |
|---|---|
| **Text-centric** | Text only · Text + Object (object secondary, for depth) · Text + Graphic shapes |
| **Object-centric** | Object in middle + text above/below · Object + graphics behind/around |
| **Character-centric** | Person in center with a graphic behind (color block, circle, polaroid frame) · Person on the side + text and who they are |
| **Video-centric** | A video clip (B-roll, old reel, screen recording) is the hero, inside a rounded card or phone frame (radius ~16px, thin white border, soft drop shadow), tilted 2–5°, sliding/panning slowly through the frame while sans + script text changes beside it; clip audio muted |

The object = the literal visual of the spoken word ("Binge Watch" → popcorn, "Formula" → flask). Cutouts are B&W/desaturated, background removed, with casted shadow. One accent color per scene. Brush strokes, arrows, sparkle stars, Figma-style selection boxes, label bars.

## 5. How to create animations (scene build)
**Read:** `learnings/video-editing/06-minimal-animation-principles.md` (+ its 10 slide images)

Build every full-screen scene in 4 layers on a 3×3 grid:
1. **Background:** white (warm or cold) + light thin grey grid + light casted-shadow overlay + subtle gradient + texture (grain/halftone).
2. **Focal point:** decide the hero (object / text / person) → put it in the center zone.
3. **Supporting element:** right around the hero (text on top of an object, or an object beside the text).
4. **Depth elements:** in the outer 8 cells, cropped by the frame edge (color blocks, related objects, brush strokes, cracks, big faded outline numbers).

Design principles: **3-tone palette** (off-white `#E2E0DC` · charcoal `#3C3A38` · one special color: teal `#3FA585` / deep red `#8E0A0A` / lavender `#A574D6`) · sans main text with tiny script "kicker" words · very light gradient inside text color · casted shadows + textures on objects · gradients + textures + casted shadows on backgrounds.

Motion: hero scale-pops 80% → 100% (ease-out, 8–10 frames), shapes slide in / brush strokes draw on, text word-by-word, slow 100% → 105% push-in on the whole scene.

## 6. Big inspiration board (UIs, graphs, scenes)
**Read:** `learnings/design-inspiration/01-ui-inspiration-board.md`, `02-graph-inspiration.md`

Images: `learnings/design-inspiration/assets/ui-board/<category>/` (175 refs) and `board-graphs.jpg`. Before designing any UI, graph, or scene, **open the relevant board images and match them**.
Graphs: dark background, near-invisible grid, one smooth line + fading gradient fill, glowing end dot, color shifts dim → bright, one big number, a story (past → future, known → unknown). Animate: line draw-on → fill reveal → dot travels + halo pulse → number count-up.

## 7. On-screen animations
**Read:** `learnings/video-editing/07-on-screen-ui-animation.md` (5 reel frames + `assets/07-ui-kit/` 29 refs). Working example: `projects/calendar-card/`.

- The speaker stays on screen; a UI card floats over the chest, **below** the caption. Face never covered.
- **Darken and blur the background behind the UI:** while a card is up, put a darkening gradient on the lower part of the frame (black 0 → 50–60% from mid-frame down) and blur the footage behind the card area (blurred copy of the video masked to the lower half, or `backdropFilter: blur()` on the card). Fade both in/out with the card.
- Card: dark glass `rgba(21,23,28,0.86)`, 1–2px white 8–15% border, radius 28–36px (at 1080 width), one accent (`#2F6BFF`), big number + small grey label, glow on the active element.
- The card shows exactly what is being said at that second. Reuse the same fictional names/brands across the video for continuity.
- Motion: card rises + fades + unblurs (8–12 frames), inner items stagger 2–3 frames, data animates (count-up, cells fill, bars grow), last/important item gets a glow highlight, then fade out. One card at a time, 1.5–3s each.

## 8. Before you render — checklist
- [ ] Opened the lesson files and reference images for every element used
- [ ] Captions: sans `#F3F3F3` + shadow, script accent + glow, opposite weights, lower third, ≤1.5s animation
- [ ] Layouts rotate (A–G); payoff words chosen by trigger
- [ ] Hook: speaker on screen, name tag, payoff word lands on its sound
- [ ] Full-screen scenes: BG → hero → support → depth; 3-tone palette; no type repeated back-to-back
- [ ] On-screen UI: under caption, face clear, background darkened + blurred behind it
- [ ] Every visual synced to the spoken word (use word-level timestamps)
- [ ] Animation kinds rotate (on-screen / half / full), new visual every 3–5s
- [ ] Sound: whooshes on moves, textures on events, risers into segments, no music under animations
- [ ] Rendered a few stills and checked them against the reference images before the full render

## 9. Sound design
**Read:** `learnings/video-editing/09-sound-design.md`

- Sound only emphasizes visible motion. Three families: **whooshes** (movement, peak on the fastest frame, −12 dB, max −10) · **textures** (pops, clicks, reveals, UI changes, on the event frame, −6 to −7 dB) · **risers + hits** (anticipation, riser ends on the transition frame with a hit under it, −5 dB; first one ~5s after the hook; ≥2 sharp bass + ≥2 metallic per video).
- Music only under the talking head (−19 dB), never under animations. Voice is never covered.
- Order: analyze frame by frame and report a cue sheet → whooshes pass → textures pass → risers/hits pass → mix check → music after approval.
- Remotion: one `<Sequence>` track per family, `<Audio volume={10 ** (db / 20)}>`, original audio muted not deleted.

## 10. Working example + setup notes
**Reference project:** `projects/reel-01-three-mistakes/` — a full 52s reel built with every rule above (cut, transcript, captions, on-screen UI, 3 half + 3 full scenes, sound cue sheet). Start new reels by copying its structure (`timeline.ts`, `SpeakerLayer`, `Captions`, `OnScreenUI`, `scenes/`, `Sound.tsx`).

Pipeline that worked here:
1. Cut silences with `ffmpeg silencedetect=noise=-30dB:d=0.28`, keep ~0.1s breath each side, 12 ms audio fades per cut. **Listen for retakes** (transcribe each kept range; a repeated phrase = bad take, keep the complete one).
2. Transcribe the **cut** footage directly (faster-whisper `small.en`, `word_timestamps=True`, pass a numpy array — the bundled `av` decoder fails). Don't remap raw timestamps; they drift up to ~0.9s.
3. In this cloud container, Chrome can't load Google Fonts (proxy cert) → download woff2 with curl into `public/fonts/` and load with `FontFace` + `delayRender`. Render with `--browser-executable=/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell`.
4. Render 15–20 stills (`npx remotion still … --scale=0.5`) and review them before the full render.
5. Deliverable must be ≤30 MB to send in chat → re-encode with ffmpeg (`-b:v 4M`).

## 11. Adobe route (After Effects / Premiere) + Gemini graphics
When Nikhil wants Photoshop / Gemini graphics or an AE / Premiere edit: this container can't run Adobe apps, so ship an **Adobe kit** (working example: `projects/reel-01-three-mistakes/adobe/`):
- **Graphics:** Gemini Nano Banana via the Magnific connector (`imagen-nano-banana-2-lite` is cheap; tell him the credit cost first). Prompt: one isolated object, plain light grey background, no text. Then cut out locally with `rembg` (`isnet-general-use`, alpha matting) and trim — no extra credits. Split multi-object images with alpha column gaps.
- **After Effects:** one ES3 `.jsx` + `//@include` data file generated from the Remotion timeline (`scripts/export-data.ts`). Builds real layers: SPEAKER cuts, half/zoom keys, dim + blur adjustment, captions with a word-indexed Text Animator, shape-layer UI, scene precomps, SFX layers per family, markers. Wrap every effect parameter in try/catch; find effect colour params by type, not index. Verify with `acorn` (ecmaVersion 3) and a mock-AE dry run before shipping.
- **Premiere:** FCP7 XML (`scripts/export_premiere.py`): V1 cuts split at motion boundaries with static Basic Motion, V2 = AE `GRAPHICS` alpha render, A1 voice, A2–A5 SFX families with Audio Levels, scene markers + SRT. Relative pathurls → user does Link Media once.
- Always render a Remotion preview with the same graphics so he can see the look, and say plainly that the Adobe files are untested in real AE / Premiere.

If a part of the brief is still missing from `learnings/`, say so and ask rather than guessing.
