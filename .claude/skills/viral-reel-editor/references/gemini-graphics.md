# Graphics with Gemini (Nano Banana) → transparent PNG cutouts

Use when the reel needs real objects/icons (eye, perfume, paint tubes, 3D icons…) instead of CSS/SVG shapes, or when Nikhil asks for "Photoshop / Gemini graphics".

## 1. Pick the objects
One per scene, the **literal visual of the spoken word**, plus a few depth objects. Typical list for a 50s reel: ~10 images.

## 2. Generate (Magnific connector → Gemini)
- Model: `imagen-nano-banana-2-lite` (cheap/fast, ~60 credits each). Use Nano Banana Pro (`imagen-nano-banana-2`) only if he asks for max quality.
- **Tell him the credit cost and get a yes before generating** (check `account_balance` first).
- One `images_generate` call per subject (`count: 1`, `aspectRatio: "1:1"`, `16:9` for wide things like a brush stroke). Run them in parallel, then `creations_wait` with up to 8 ids, then download each `url` with curl.
- Prompt pattern (keep it short; no style essay):
  - `"<object, material, color>. Single isolated object, centered, plain flat light grey background, no text."`
  - Halftone/editorial look: add `"black and white halftone print style"`.
  - For a white-keyed element: `"... Isolated on a plain pure white background, no text."`
- Examples that worked: "Glossy 3D app icon: a rounded square tile with an electric blue gradient, a white stacked-layers symbol in the center…", "Photorealistic human eyeball with a blue-grey iris and fine red veins, macro…", "Three squeezed oil paint tubes side by side: pure black, pure white, bright red… product shot from above…", "Vintage theater spotlight lamp on a stand, black metal, black and white halftone print style…".
- If Magnific isn't connected, say so; fall back to CSS/SVG objects.

## 3. Cut out locally (no extra credits)
```bash
pip install "rembg[cpu]"
python3 scripts/cutout.py <downloaded_dir> <png_dir> --white-key brush_stroke --split paint_tubes:3
```
- rembg `isnet-general-use` + alpha matting, then trims padding.
- `--white-key` for black-on-white art (luminance → alpha).
- `--split name:N` cuts a multi-object image into N PNGs along empty columns.
- Check the cutouts on a colored background (contact sheet) before using them.

## 4. Use them
- Remotion: copy to `public/graphics/`, render with `<Img src={staticFile("graphics/x.png")}>` plus `filter: drop-shadow(...)` for the casted shadow.
- Adobe kit: copy to `<kit>/graphics/`; the AE script imports them by name.
