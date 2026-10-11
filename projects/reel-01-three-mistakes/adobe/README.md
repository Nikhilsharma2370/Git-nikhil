# REEL_01: Adobe kit (After Effects + Premiere Pro)

Ye kit wahi "3 mistakes" reel **After Effects aur Premiere Pro me** banane ke liye hai. Graphics Gemini (Nano Banana 2 Lite, Magnific ke through) se bane hain, aur unka background Photoshop jaisa cutout karke transparent PNG banaya gaya hai.

> **Zaroori:** ye files Linux cloud machine par bani hain, jahan Adobe apps nahi chalte. AE script ES3 syntax check aur ek mock-AE dry run (7418 calls, bina error) pass kar chuki hai. Premiere XML ka structure bhi validate ho chuka hai. **Asli AE / Premiere me pehli baar chala rahe ho**, isliye koi error ya warning aaye to uska screenshot bhej dena, main theek kar dunga.

## Kit me kya hai

| Path | Kya hai |
|------|---------|
| `after-effects/build_reel_01.jsx` | **Main script.** AE me poori reel asli layers se banati hai |
| `after-effects/reel-data.jsxinc` | Timings (cuts, words, captions, scenes, SFX). Script khud padhti hai |
| `REEL_01_premiere.xml` | Premiere sequence: cuts + motion + SFX tracks + markers |
| `REEL_01_captions.srt` | Captions (Premiere caption track ke liye) |
| `graphics/*.png` | 13 Gemini cutouts (app icon, arrow, star, eye, lamp, sparkle, perfume, camcorder, brush, 3 paint tubes) |
| `sfx/*.wav` | 12 sound effects (whoosh, pop, click, sci-fi, riser, hit, success) |
| `fonts/*.ttf` | Inter (Regular / Medium / SemiBold) + EB Garamond (Regular / Bold Italic) |
| `footage/` | **Khaali.** Raw footage yahan daalni hai (neeche step 1) |

## Step 1: Taiyaari (sirf ek baar)

1. **Fonts install karo:** `fonts/` ki saari `.ttf` par double-click → Install. AE / Premiere band karke phir kholna.
2. **Raw footage:** Joseph ke free Drive folder se `3 things from beginner to pro.mp4` download karo: <https://drive.google.com/drive/folders/1WJMeuTvYZJgufE9_Xpkp6xThzQWXhR-G>. Use **`footage/`** folder me rakho (naam same rehna chahiye).
   - Ye footage sirf practice ke liye hai. Apni footage use karni ho to mujhe bhejo, main timings dobara bana dunga.

## Step 2A: After Effects (recommended, sab kuch yahin)

1. After Effects kholo → naya project.
2. **File → Scripts → Run Script File…** → `after-effects/build_reel_01.jsx`.
3. 1–2 minute me Project panel me **`REEL_01`** folder ban jaayega, aur `REEL_01` comp khul jaayegi. End me ek alert aayega. Usme warnings hon to unka screenshot bhejo.

**Comps:**

| Comp | Kya hai |
|------|---------|
| `REEL_01` | Final: speaker + UI dim/blur + GRAPHICS + 75 SFX layers (alag labels: whoosh, texture, riser, hit) + scene markers |
| `SPEAKER` | 13 jump cuts. Har layer ka naam raw time batata hai (in/out drag karke cut badal sakte ho) |
| `GRAPHICS` | Saare overlays: captions, UI cards, half aur full scenes (transparent) |
| `SC_FULL1_video_centric` | Tilted video card + huge arrow/star/shapes ("screams beginner") |
| `SC_HALF1_shrink` | App icon 25% chhota, Figma selection box, live "420 × 420" size label (expression) |
| `SC_HALF2_less_is_more` | 9 effect tiles, counter 9 → 1, "Glow" special |
| `SC_FULL2_spotlight` | Lamp → beam → aankh (grey se color), dim vignette |
| `SC_HALF3_harsh` | Black / white / red paint tubes + "TOO HARSH" stamp |
| `SC_FULL3_high_end` | Brand cards + perfume + dull swatches → "more high-end." |
| `UI_STEPPER`, `UI_SLIDER`, `CARD_CLIP` | Reusable pieces |

4. **Render:** `REEL_01` select → Composition → Add to Render Queue (ya Media Encoder) → H.264, 1080×1920.

**Captions kaise bane hain:** har line ek text layer hai, jisme "Word Reveal" Text Animator hai (Opacity 0, Position +20, Blur 10). Range Selector Index / Words par hai, aur uska *Start* har word ke bolne ke time par keyframed hai. Kisi word ka timing badalna ho to bas us keyframe ko khiskao.

## Step 2B: Premiere Pro (cut + sound + finishing)

1. AE me `GRAPHICS` comp render karo: **QuickTime → Apple ProRes 4444, Channels: RGB + Alpha**. File ka naam `REEL_01_GRAPHICS.mov` rakho aur kit me `renders/` folder banake usme save karo.
2. Premiere → **File → Import** → `REEL_01_premiere.xml`.
3. Media offline dikhe to: clip par right-click → **Link Media** → `footage/`, `sfx/` aur `renders/` folders dikha do. Ek baar link karte hi saare clips jud jaate hain.
4. Captions: **File → Import** → `REEL_01_captions.srt` → timeline par caption track me daalo (optional; animated captions GRAPHICS me already hain).

**Sequence me kya hai:**
- **V1:** 21 speaker clips (13 cuts). Half-screen aur zoom wale hisson me clip split hai aur static Basic Motion laga hai (half: neeche 840 px; zoom: 118%, face center par).
- **V2:** `REEL_01_GRAPHICS.mov` (AE ka alpha render).
- **A1:** voice. **A2:** whooshes (−12/−10 dB). **A3:** textures (−6 to −9 dB). **A4:** risers (−5 dB). **A5:** hits.
- **Markers:** har scene ka naam.

> Premiere me half-screen wale clips me speaker **neeche** khiskna chahiye. Agar upar ja raha ho, to Effect Controls → Position ka Y value ulta kar do (1 min ka kaam). Ye XML center-coordinate ka known farq hai jo kuch Premiere versions me aata hai.
>
> UI ke peeche wala blur Premiere me nahi hai (sirf AE me hai). Chahiye to V1 ke upar Adjustment Layer + Gaussian Blur + mask lagao. Ya seedha AE wala `REEL_01` render use karo.

## Graphics (Gemini → cutout)

| File | Kahan use hua |
|------|---------------|
| `app_icon.png` | Half 1 hero (25% shrink) |
| `arrow_huge.png`, `star_huge.png` | Full 1: "beginner" wale bade icons |
| `camcorder.png`, `brush_stroke.png` | Full 1 depth elements |
| `sparkle.png` | Half 1 "better", Half 2 "special" |
| `spotlight_lamp.png`, `eye.png` | Full 2 spotlight |
| `tube_black/white/red.png` | Half 3 harsh palette |
| `perfume.png` | Full 3 dull luxury |
| `paint_tubes.png` | Teeno tubes ek saath (original) |

Ye sab Magnific ke "Personal" project me bhi saved hain (Nano Banana 2 Lite, 10 generations).

## Data dobara banana (agar Remotion timeline badle)

```bash
node_modules/.bin/esbuild scripts/export-data.ts --bundle --platform=node --format=cjs --loader:.tsx=tsx --jsx=automatic --outfile=/tmp/export.cjs
node /tmp/export.cjs > adobe/reel-data.json
python3 -c "import json;d=json.load(open('adobe/reel-data.json'));open('adobe/after-effects/reel-data.jsxinc','w').write('var DATA = '+json.dumps(d)+';\n')"
python3 scripts/export_premiere.py
```
