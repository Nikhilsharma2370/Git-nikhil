# Adobe mode — Photoshop + After Effects + Premiere Pro (FULL EDITABLE)

Nikhil khud **Photoshop me graphics**, **After Effects me animation** aur **Premiere Pro me final edit** karta hai. Is mode me Claude ka kaam: saari taiyaari (cut list, transcript, timings, Gemini graphics, scene designs, scripts) karke ek kit dena jisme **har cheez editable** ho. Ye Nikhil ka **default mode** hai. Remotion sirf tab, jab wo preview video maange.

## Full-editable rule (kabhi mat todo)

| Cheez | Kaise deni hai | Kabhi nahi |
|-------|----------------|------------|
| Text / captions | Live text layer (AE Text Animator, PSD type layer, Premiere caption track) | Text ko PNG / video me bake karna |
| Graphics / objects | Alag transparent PNG → PSD me **Smart Object**, AE me alag layer | Saare objects ek flat image me |
| Shadow / glow / stroke | Layer Style (PSD) / Effect (AE), parameters ke saath | Shadow ko pixel me merge karna |
| Background (paper, grid, casted shadow, grain) | Alag layers, group `BACKGROUND` | Ek flat background JPG |
| Animation | AE keyframes + Easy Ease (har move alag, naam ke saath) | Pre-rendered animation clip |
| Cuts | Premiere / AE me alag clips, raw footage se (trim karke wapas khol sakte ho) | Pehle se cut kiya hua mp4 hi dena |
| Half / zoom | Speaker clip par Position / Scale keyframes | Crop karke render |
| AE → Premiere | **Dynamic Link** (`.aep` import, comp seedha timeline par) | Sirf alpha `.mov` render (ye fallback hai, default nahi) |
| SFX | Har sound alag clip, family-wise alag track (A2 whoosh, A3 texture, A4 riser, A5 hit) | Ek mixed audio file |
| Colors | Accent / palette README me hex ke saath, AE me ek jagah se badlo | Hardcoded alag-alag shades |

Har layer ka **naam** saaf ho (`HERO eye`, `TEXT payoff "attention."`, `WHOOSH half-in`). Groups / precomps ka order wahi jo 4-layer build me hai: BACKGROUND → DEPTH → SUPPORT → HERO → TEXT.

## Kit (jo Nikhil ko milta hai)

```
<NAME>_adobe_kit/
  README.md                         Hinglish step-by-step (yahi flow)
  footage/                          raw footage (khud daalega; zip me nahi)
  graphics/*.png                    Gemini cutouts (transparent)
  scene-spec.json                   har half/full scene ka layout (Photoshop script padhta hai)
  photoshop/build_psd_scenes.jsx    → psd/<scene>.psd (layered) + psd/<scene>.png preview
  after-effects/build_<name>.jsx    → poori reel native AE layers me + <NAME>.aep auto-save
  after-effects/reel-data.jsxinc    timings
  <NAME>_premiere.xml               cuts + motion + SFX tracks + markers
  <NAME>_captions.srt               editable caption track
  sfx/*.wav  fonts/*.ttf  reel-data.json
  renders/                          (sirf fallback ke liye)
```

Claude ki side (cloud me) ke steps: SKILL.md 0–3 (inputs, cut, transcribe, plan) → Gemini graphics → timeline data (`timeline.ts` hi single source of truth hai) → `scene-spec.json` likho → AE script ka SCENES section → validate (`acorn` + `mock_ae.js` + `mock_ps.js`) → Premiere XML + SRT → README → zip.

## `scene-spec.json` kaise likhna hai

Plan ke har half / full scene ke liye ek entry. Full = 1080×1920, half = 1080×960 (upar ka panel; speaker neeche shift hota hai). Positions wahi jo AE script / Remotion scene me hain, taaki PSD aur animation match karein.

```json
{ "scenes": [ { "name": "SC_FULL2_spotlight", "width": 1080, "height": 1920, "accent": "5B95FF",
  "layers": [
    { "group": "DEPTH",   "type": "card",  "x": 220, "y": 420, "w": 300, "h": 200, "rot": -5, "blur": 3, "opacity": 60 },
    { "group": "SUPPORT", "type": "image", "file": "spotlight_lamp.png", "x": 150, "y": 720, "w": 230, "rot": 25 },
    { "group": "HERO",    "type": "image", "file": "eye.png", "x": 540, "y": 980, "w": 360 },
    { "group": "TEXT",    "type": "text",  "text": "grab attention.", "font": "EBGaramond-BoldItalic", "size": 112, "color": "5B95FF", "x": 540, "y": 1670 },
    { "group": "SUPPORT", "type": "rect",  "x": 540, "y": 1400, "w": 300, "h": 8 } ] } ] }
```
- `image`: Smart Object + drop shadow (Multiply, 26%, distance 22, size 40, angle 90). `"shadow": false` for flat stuff (sparkle, brush). `"blur": N` sirf depth objects par (ye layer rasterize karta hai).
- `card`: white rounded-feel card + soft shadow (ghost / depth card). `rect`: accent color block.
- `text`: x / y = anchor (center justify me center, baseline par). Font = PostScript name.
- Layout check (Photoshop ke bina): `python3 scripts/preview_spec.py <kit> <kit>/scene-spec-preview.png` → **dekho**: text objects ke peeche to nahi, badge text rect ke upar hai (list me baad wala layer upar), kuch frame se bahar to nahi.
- Validate: `node scripts/mock_ps.js <kit>/photoshop/build_psd_scenes.jsx <kit>` → "missing graphic" warning nahi aani chahiye.

---

# Nikhil ke liye: app-wise editing guide

Pehle `fonts/` ki saari `.ttf` install karo (Inter + EB Garamond), phir apps kholo.

## 1. Photoshop: graphics aur scene design

**Script se (fast):** File → Scripts → Browse… → `photoshop/build_psd_scenes.jsx`. Har scene ka layered PSD `psd/` me ban jaata hai, groups ke saath: BACKGROUND / DEPTH / SUPPORT / HERO / TEXT.

**Khud banana ho (Lesson 06 ka 4-layer build):**
1. New doc 1080×1920 (half scene: 1080×960), 72 ppi, RGB.
2. **BACKGROUND:** fill `#F1EFEA`. Grid: 90 px lines, `#2E2C2A`, opacity 6–7%. Casted shadow: tirchhi patti (28°) brush / rect, `#3D3328`, Gaussian Blur 40, opacity 7%. Vignette: kinaare `#5A4E42`, Multiply 14%. Grain: 50% grey layer → Filter → Noise → Add Noise 8% Gaussian Monochromatic → Overlay 12%.
3. **DEPTH:** edge par kate hue objects / ghost cards, Gaussian Blur 1.5–3, opacity 60–80%.
4. **HERO:** Gemini PNG → File → **Place Linked** (Smart Object rehta hai). Layer Style → Drop Shadow: Multiply, `#28221A`, 26%, angle 90°, distance 22, size 40.
5. **SUPPORT:** chhote objects, accent blocks, sparkles (sparkle par shadow nahi).
6. **TEXT:** setup = Inter Regular 44–52 px `#2E2C2A`; payoff = EB Garamond Bold Italic 104–112 px accent color + Outer Glow (accent, 55%, size 30). Ek scene me ek hi payoff.
7. Gemini cutout ka edge kharab ho: Select and Mask → Smooth 2, Shift Edge −10%; ya Layer Mask se brush karke saaf karo (mask hai to editable rehta hai).
8. Save as **PSD** (layers ke saath). PNG sirf preview ke liye.

## 2. After Effects: animation (main kaam yahin)

**Option A: poori reel ek click me:** File → Scripts → Run Script File… → `after-effects/build_<name>.jsx`. Ye speaker cuts, captions, UI cards, half/full scenes, SFX layers, markers sab native layers me banata hai aur `<NAME>.aep` save karta hai. Har cheez keyframes me hai, to kuch bhi badal sakte ho.

**Option B: apne PSD design animate karna:** File → Import → `psd/<scene>.psd` → Import As: **Composition – Retain Layer Sizes**, Layer Options: **Editable Layer Styles**. Text layer select → Layer → Create → **Convert to Editable Text**. Phir is comp ko main comp me scene ke time par rakho (Option A ke scene comp ki jagah bhi rakh sakte ho).

**Motion rules (Lesson 06 / 08, exact settings):**
| Move | Kaise |
|------|-------|
| Pop-in (object / card) | Scale 0 → 110 → 100% (frame 0 / 6 / 10), Opacity 0 → 100 in 4 frames, Easy Ease (F9) |
| Slide-in | Position 120 px door se, 8–10 frames, Graph Editor → speed influence 80% (fast start, soft end) |
| Half-screen | Speaker Position Y +840 px (face y≈520 ho to) 8 frames Easy Ease; upar paper panel 1080×960 slide-down same timing |
| Zoom punch-in | Speaker Scale 100 → 118% in 6 frames, Anchor Point face par |
| Full-screen | Paper comp poora frame, scene 4–7s, end par 6-frame wipe / slide out |
| Caption word reveal | Text → Animate → Opacity 0%, Position 0,20, Blur 10; Range Selector → Advanced: Based On **Words**, Units **Index**; *Start* ko har word ke time par keyframe karo |
| Payoff glow | Layer Style → Outer Glow (accent, 55%, size 30) ya Effect → Glow (radius 30, intensity 0.6) |
| UI card ke peeche dim + blur | Adjustment layer: Gaussian Blur 20 + Black solid 35% opacity, mask beech se neeche, feather 300; card ke saath fade in / out (6 frames) |
| Har move | Ek kaam, ek direction. Same time par 2 bade moves nahi. Har 3–5 s naya visual |

Sound AE me bhi hai (labels ke saath), lekin final mix Premiere me karo.

## 3. Premiere Pro: final edit, sound, export

1. File → Import → `<NAME>_premiere.xml` → File → **Save As** `<NAME>.prproj`.
2. Media offline: right-click → **Link Media** → `footage/`, `sfx/` folders.
3. **Graphics editable rakhne ke liye (Dynamic Link):** File → Import → `<NAME>.aep` → `GRAPHICS` comp chuno. Use **V2** par 00:00 par rakho (purana `renders/…GRAPHICS.mov` placeholder hata do). Ab AE me kuch bhi badlo, Premiere me apne aap update hoga. (Playback slow ho to: Sequence → Render In to Out, ya last me ProRes 4444 alpha render karke replace karo.)
4. **Captions:** File → Import → `<NAME>_captions.srt` → caption track. Text, timing, style sab editable (Properties panel me font Inter, `#F3F3F3`). Animated captions pehle se AE GRAPHICS me hain; ye track subtitle / backup ke liye hai.
5. **V1 speaker:** half / zoom hisson me clips split hain, Motion keyframes ke saath. Cut badalna ho to clip ka edge drag karo (raw footage hai, kuch kho nahi gaya).
6. **Sound (Lesson 09):** A2 whoosh −12 / −10 dB (whoosh ka peak animation ke sabse fast frame par), A3 textures −6…−9 dB (click / pop event frame par), A4 risers −5 dB (segment change se pehle, end par A5 hit). Animations ke neeche music nahi. Voice A1 −6 dB ke aas paas peak, Essential Sound → Dialogue.
7. Export: H.264, 1080×1920, 30 fps, bitrate VBR 1-pass target 16 Mbps (Instagram / Shorts).

## Claude ke liye: deliver karte waqt
- Batao ki kit **cloud me bani hai, asli Adobe apps me test nahi hui** (ES3 parse + mock AE + mock PS pass). Pehle run ka alert / error screenshot maango.
- PSD / `.aep` / `.prproj` uski machine par scripts / Save As se bante hain. Computer use available ho to offer karo ki apps khol ke ye steps khud kar doge.
- README me upar wala app-wise guide reel ke scene names ke saath likho.
