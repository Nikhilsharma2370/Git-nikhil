# Adobe kit — After Effects + Premiere Pro editable files

Use when Nikhil wants the edit "in After Effects / Premiere", "editable file", ".aep / .prproj".

**Be upfront:** native `.aep` / `.prproj` files can only be saved by the Adobe apps. If you're in a cloud/Linux container (no Adobe), ship a kit that *builds* them on his machine:
- After Effects: a script that builds the whole project and **auto-saves `<NAME>.aep`** into the kit folder.
- Premiere: an FCP7 XML he imports, then Save As `<NAME>.prproj`.
If computer use is available on his Mac/PC, you can open the apps and run these steps yourself.

## Kit layout
```
<NAME>_adobe_kit/
  README.md                       Hinglish step-by-step (fonts → footage → AE → Premiere)
  after-effects/build_<name>.jsx  ES3 ExtendScript (from assets/adobe/build_reel_TEMPLATE.jsx)
  after-effects/reel-data.jsxinc  var DATA = {...}  (timings)
  <NAME>_premiere.xml             FCP7 XML
  <NAME>_captions.srt
  reel-data.json
  graphics/*.png  sfx/*.wav  fonts/*.ttf
  footage/  (raw footage goes here — big files are not zipped)
  renders/  (AE GRAPHICS alpha render goes here for Premiere V2)
```

## Build steps
1. **Timeline data** (from the Remotion project):
   ```bash
   node_modules/.bin/esbuild scripts/export-data.ts --bundle --platform=node --format=cjs --loader:.tsx=tsx --jsx=automatic --outfile=/tmp/export.cjs
   node /tmp/export.cjs > <kit>/reel-data.json
   python3 -c "import json;d=json.load(open('<kit>/reel-data.json'));open('<kit>/after-effects/reel-data.jsxinc','w').write('var DATA = '+json.dumps(d)+';\n')"
   ```
   `export-data.ts` needs `scripts/cut.json` = `{"ranges": [[rawStart, rawEnd], ...]}` (the keep ranges, in raw-footage seconds).
2. **After Effects script:** start from `assets/adobe/build_reel_TEMPLATE.jsx`. The generic parts work as-is (helpers, paper BG, SPEAKER cuts, CARD_CLIP, stepper/slider UI, captions with word-indexed Text Animator, half/full instances, speaker half/zoom keys, dim + blur, SFX layers, markers, auto-save). **Rewrite the SCENES section** to match this reel's scenes (same layouts/positions as the Remotion scenes), and set the footage file name + FACE point.
3. **Validate** (you can't run AE):
   ```bash
   npm i --no-save acorn
   node -e "require('acorn').parse(require('fs').readFileSync('<jsx>','utf8'),{ecmaVersion:3,allowReserved:true});console.log('ES3 OK')"
   node scripts/mock_ae.js <kit>/after-effects/build_<name>.jsx
   ```
   The mock AE host runs the script end-to-end and catches reference/data errors (it can't catch wrong AE parameter indices — those are wrapped in try/catch and reported in the final alert).
4. **Premiere XML + SRT:**
   ```bash
   python3 scripts/export_premiere.py --kit <kit> --raw-name "<raw file name>" --raw-duration <sec> --face 495,520 --name <NAME>
   ```
   V1 = speaker cuts split at half/zoom boundaries with static Basic Motion (half: +840px down; zoom: 118% around the face) · V2 = `renders/<NAME>_GRAPHICS.mov` · A1 voice · A2 whooshes · A3 textures · A4 risers · A5 hits · scene markers. Paths are relative → he does **Link Media** once.
5. Copy graphics/sfx/fonts, write the README, zip (without footage) and send. Keep it under 30 MB.

## ExtendScript rules that matter
- ES3 only: `var`, no arrow functions / template literals / `let` / `Array.indexOf` / `forEach`; no function declarations inside loops.
- Wrap every effect parameter in try/catch (`tryDo`) and report warnings in the final alert.
- Effect color params: find by `propertyValueType === PropertyValueType.COLOR`, not by index (indices differ between versions).
- Text style: guard `resetCharStyle` (older AE lacks it). Font PostScript names: `Inter-Regular`, `Inter-Medium`, `Inter-SemiBold`, `EBGaramond-Regular`, `EBGaramond-BoldItalic` (TTFs in `assets/adobe/fonts/`, he must install them).
- Track matte: `layer.setTrackMatte(matte, TrackMatteType.ALPHA)` with fallback to `trackMatteType`.
- Build precomps with the **same duration as the main comp and absolute times**, then trim the instance layer's in/out — keeps every keyframe time identical to the Remotion timeline.

## Known caveats to tell him
- Premiere's Basic Motion center: if half-screen clips move up instead of down, flip Position Y (version difference).
- The UI dim/blur exists in the AE build, not in the Premiere V1 (add an adjustment layer + blur + mask if needed).
- First run in real AE may show warnings — ask for a screenshot and fix.
