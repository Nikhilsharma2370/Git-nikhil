# Style brief — viral talking-head reels

The house style, modeled on Joseph Eid's (Ultimate Editors) "viral talking head" edits. Every visual decision in a reel should trace back to one of these sections.

## Contents
1. Captions & typography
2. Caption layouts (A–G)
3. Hook
4. The three kinds of animations + pacing
5. Scene categories
6. Building a scene (4 layers) + design principles
7. On-screen UI cards
8. Graphs
9. Pre-render checklist

---

## 1. Captions & typography

| | Sans (regular words) | Script (special / payoff words) |
|---|---|---|
| Font | Creato Display (fallback: **Inter**, Satoshi). A family with many weights | Apple Garamond Italic (fallback: **EB Garamond Bold Italic**, Cormorant Garamond Italic) |
| Weight | Opposite of the script (thin sans ↔ bold script) | Opposite of the sans |
| Color | `#F3F3F3` — slightly warm white, never pure `#FFFFFF` | A vibrant accent taken from the footage's dominant color (blue studio → `#5B95FF`, warm studio → orange `#F19441`, greenery → lime) |
| Effect | Light drop shadow: black 20–30%, y 1–2px, blur 4–8px | Glow in the accent color: 40–60%, radius 15–30px |
| Size | Smaller than feels "normal" (≈46px at 1080w) — small text reads premium | ≈2× the sans (≈104px); 3 words ≈74px; 4+ words ≈64px, one line |

**Placement:** lower third, centered (unless a special layout). Never over the face; over chest / mic is fine. Max 3–5 words per line.

**Animation (per word, synced to its spoken timestamp):** translateY +20px → 0, opacity 0 → 1, blur 10px → 0, ease-out (cubic), ~8–12 frames. A whole caption's motion stays within ~1.5s. Exit: quick 0.1s fade when the next group starts.

## 2. Caption layouts (A–G)

Every caption = **Setup** (small sans) → **Payoff** (big script, accent + glow) → **Tail** (small sans). Rotate layouts:

| | Layout | When |
|---|---|---|
| A | Center sandwich: setup / PAYOFF / tail | Default key line |
| B | Hero number, left-aligned (`60mins` big, small line beside) | A number + a rule/tip |
| C | Full sentence small, punchline word big underneath | Long sentence ending on the concept |
| D | Tiny UPPERCASE words spread across, script payoff overlapping | Dramatic / emotional quote |
| E | Name tag: name (sans semibold) + tiny role line, lower-left | Speaker intro (hook) |
| F | Inverted: bold sans payoff + thin italic tail | Keyword is a plain phrase |
| G | Monochrome caps: no accent, payoff = ALL CAPS + size | Serious tone / busy footage |

**Payoff word = what the viewer should remember:** numbers, money, power verbs, the core concept. One payoff per caption.

## 3. Hook

- **Speaker on screen** in the first frames, with a name tag + role line.
- Ask: *"What one thing makes the viewer want to watch this?"* — visualize exactly that word.
- Pick the payoff by trigger: **fear/problem** (mistakes, gap, losing) · **topic** · **desire** (growth, money) · **number/money** · **negative/controversial** (steal, never, stop).
- The payoff lands on the frame the word is spoken.
- Keep them hooked: a new visual beat every 3–5s; a riser ~5s after the hook into the body.

## 4. The three kinds of animations + pacing

| Kind | Frame | Use for |
|---|---|---|
| **On-screen (UI)** | Speaker full frame; lower part darkened + blurred; caption, then a small dark-glass UI under it | Structure & small facts: stepper ①②③, slider, counter, list, calendar |
| **Half-screen** | Hard split: top 50% = paper scene with one big object/UI; bottom 50% = speaker crop (face centered); caption over the speaker half | Visual needed *and* the speaker's expression matters |
| **Full-screen** | Speaker gone; whole frame = paper scene | Big proof, reveals, lists of examples |

Plus **zoom punch-ins / camera moves** on the speaker between scenes.

**Rhythm:** per point → on-screen (number/title) → half or full (visual proof) → back to speaker. Never the same kind twice in a row. A recurring UI (e.g. a ①②③ stepper) threads the video together and comes back for the recap.

Reference rhythm (Joseph's 50s "3 mistakes" edit):
```
0s  on-screen hook (stepper ①②③)     4s  on-screen slider Beginner→Pro
7s  on-screen "Number 1: …" (①)        9s  FULL video-centric
13s zoom punch-in                       14s HALF visual
20s on-screen "Number 2" (②)           24s HALF visual
27s FULL object + UI cards              31s on-screen "Number 3" (③)
33s HALF visual                         37s FULL text + logos → text only
44s on-screen recap (①②③ all filled + slider callback)
```

## 5. Scene categories (inside half / full screens)

| Category | Types |
|---|---|
| **Text-centric** | Text only · Text + Object (object secondary, for depth) · Text + Graphic shapes |
| **Object-centric** | Object in the middle + text above/below · Object + graphics behind/around |
| **Character-centric** | Person centered with a graphic behind (color block, circle, polaroid frame) · Person on the side + text + who they are |
| **Video-centric** | A clip (B-roll, old reel, screen recording) is the hero inside a rounded card / phone frame (radius ~16–28px, white border, soft shadow), tilted 2–5°, sliding/panning slowly while text changes beside it; clip audio muted |

**The object is the literal visual of the spoken word** ("Binge Watch" → popcorn, "Formula" → flask, "attention" → an eye, "dull luxury" → a desaturated perfume bottle). Objects are cutouts with casted shadows. One accent color per scene. Supporting shapes: brush strokes, arrows, sparkle stars, Figma-style selection boxes with handles + size label, label bars, thin connector lines.

## 6. Building a scene (4 layers) + design principles

On a 3×3 grid:
1. **Background:** off-white `#F1EFEA` (warm or cool) + thin grey grid (90px, ~6% opacity) + soft diagonal casted-shadow overlay (window blinds, ~7%, blurred) + subtle radial gradient (center light, edges darker) + grain/halftone.
2. **Focal point:** the hero (object / text / person / clip) in the center cell.
3. **Supporting element:** right around the hero (text on top of the object, or an object beside the text).
4. **Depth elements:** outer cells, cropped by the frame edge, often blurred (ghost UI cards, color blocks, related objects, brush strokes, big faded outline numbers).

**Design principles**
- **3-tone palette:** off-white · charcoal `#2E2C2A` · ONE special color (blue `#3D7BFF`, teal `#3FA585`, deep red `#8E0A0A`, lavender `#A574D6`, dull blue `#5D6F8F` for "luxury").
- Main text sans; payoff in bold italic serif; tiny script "kicker" words also work ("The human / **brain is drawn**").
- Very light gradient inside text color (5–10% brightness difference).
- Objects: casted shadow + texture. Backgrounds: gradient + texture + casted shadow.

**Motion:** half panels slide down from the top (0.28s ease-in-out); full scenes scale 0.94 → 1 + fade in; slow push-in 100 → 104.5% over the scene; hero pops (0 → 108 → 100%); text word-by-word; brush strokes draw on; scenes last 1.5–5s.

## 7. On-screen UI cards

- Speaker stays on screen; the card floats over the chest **below** the caption; face never covered.
- **Darken + blur behind the UI:** while a card is up, from mid-frame down: blur (~16px) + darken (black → 50–60%), feathered top edge, fading in/out with the card.
- Card: dark glass `rgba(18,20,26,0.82)`, 1–2px white 10–15% border, radius 28–36px, one accent (`#2F6BFF`/`#5B95FF`), big number + small grey label, glow on the active item.
- The card shows exactly what is said at that second (exact sync). Reuse the same fictional names across the video (continuity).
- Motion: rise 34px + fade + unblur (~0.35s), inner items stagger 2–3 frames, data animates (count-up, cells fill, bars grow, knob slides), important item glows, fade out. One card at a time.
- Card types that work: stepper ①②③, Beginner→Pro slider, list/inbox of clients, notification cards, calendar grid ("Next 30 days 15/30"), thumbnail row with growing views, stat card (big number + mini chart), flow diagram (avatar → dotted line → items), ring chart, prompt bar.

## 8. Graphs

Dark background (or off-white for paper scenes), near-invisible grid, one smooth line + gradient fill fading downward, glowing dot at the "now" point, color shifting dim → bright along the line, one big number, a story (past grey → future colored, known → unknown, steps with icons). Animate: line draw-on → fill reveal → dot travels + halo pulse → number count-up (2–3s total).

| Point | Graph |
|---|---|
| Fast growth | Exponential curve + marker |
| Journey steps | Area curve + icons on steps |
| Future scenarios | Fan-out lines |
| Known vs unknown | Line + dot grid, glowing "now" |
| One stat | Big number inside a wave |
| Before vs after | Grey past → colored future |

## 9. Pre-render checklist
- [ ] Captions: sans `#F3F3F3` + shadow, script accent + glow, opposite weights, lower third, word-synced
- [ ] Layouts rotate (A–G); payoffs chosen by trigger
- [ ] Hook: speaker on screen + name tag; payoff lands on its sound
- [ ] Kinds rotate (on-screen / half / full / zoom); new visual every 3–5s; nothing over the face
- [ ] Scenes: BG → hero → support → depth; 3-tone palette; objects = literal visuals with casted shadows
- [ ] On-screen UI under the caption, background dimmed + blurred behind it
- [ ] Sound: whooshes on moves, textures on events, risers into segments, no music under animations
- [ ] 15–20 stills reviewed for overlaps (text vs objects, objects vs frame edge) before the full render
