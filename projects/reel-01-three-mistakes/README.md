# Reel 01: "3 mistakes that make your edits look amateur"

`short-form-remotion` skill ke saare rules se bani pehli poori reel (Remotion).

**Footage:** Joseph Eid ki raw footage `3 things from beginner to pro.mp4` ([free Drive folder](https://drive.google.com/drive/folders/1WJMeuTvYZJgufE9_Xpkp6xThzQWXhR-G)), jo usne practice ke liye share ki hai. Sirf practice/demo ke liye, post karne ke liye nahi.

## Pipeline

1. **Cut** (76s → 51.8s): `ffmpeg silencedetect` (−30 dB, 0.28s) se silences kaate, har cut par 10–12 ms audio fade. Ek **bad take** ("Number one, stop oversizing… / Number one, stop oversizing everything") pakda aur adhoora take hataya. Filter: `scripts/cut_filter.txt`.
2. **Transcribe:** `scripts/transcribe.py` (faster-whisper `small.en`, word timestamps) cut footage par chalaya → `src/data/words.json`.
3. **SFX:** `scripts/sfx.py` numpy se whooshes / textures / risers / hit banata hai → `public/sfx/`.
4. **Remotion:** `src/`.

## Structure

| File | Kaam |
|------|------|
| `src/timeline.ts` | Har scene ka time + caption groups (word index, script words) |
| `src/SpeakerLayer.tsx` | Speaker video, half-screen shift, zoom punch-in, UI ke peeche dark + blur |
| `src/Captions.tsx` | Setup (sans) → Payoff (script, glow) → Tail, word-synced rise + fade + blur |
| `src/OnScreenUI.tsx` | Dark glass stepper ①②③, Beginner→Professional slider, name tag |
| `src/scenes/Paper.tsx` | Paper BG (off-white + grid + casted shadow + gradient + grain), half/full frame |
| `src/scenes/Scenes.tsx` | 3 full + 3 half scenes |
| `src/Sound.tsx` | Cue sheet: WHOOSHES / TEXTURES / RISERS / HITS alag tracks |

## Timeline

| Time | Kind | Scene |
|------|------|-------|
| 0–3.3s | On-screen (hook) | "These *three mistakes*", stepper ①②③ pop, name tag |
| 3.4–6.9s | On-screen | Beginner → Professional slider |
| 6.9–8.8s | On-screen | "Number 1: *Stop oversizing everything*" |
| 8.8–13.9s | **Full, video-centric** | Tilted video card pan + bahut bade icons/shapes ("screams beginner") |
| 13.9–17s | Zoom | Punch-in "As a *rule of thumb*" |
| 17–21.2s | **Half** | Card 25% shrink, Figma selection box, −25% badge |
| 21.2–23s | On-screen | Stepper ② |
| 23–27.9s | **Half** | 9 effects on → ek-ek off → sirf "Glow" *special* |
| 27.9–32s | **Full, graphic-centric** | Spotlight: "grab *attention*" |
| 32–34.1s | On-screen | Stepper ③ |
| 34.1–38.9s | **Half** | Harsh black / white / red + "TOO HARSH" |
| 38.9–45.7s | **Full, text + objects** | Luxury brand cards + dull swatches → "*more high-end.*" |
| 45.7–51.8s | On-screen recap | Stepper teeno fill + slider callback, success chime |

Sound: 11 whooshes (−12/−10 dB, peak on fastest frame), ~50 textures (−6 to −9 dB), 2 bass + 2 metallic risers (−5 dB) har ek ke neeche hit. Music nahi (rule: approval ke baad, aur animations ke neeche kabhi nahi).

## Chalana

```bash
npm install
# footage: public/footage.mp4 (git me nahi; README ke upar wale steps se banao)
npx remotion studio
npx remotion render Reel out/reel.mp4 --browser-executable=/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell
```

Fonts `public/fonts/` me local hain (Inter + EB Garamond variable), kyunki is environment ka Chrome Google Fonts CDN ka certificate trust nahi karta.
