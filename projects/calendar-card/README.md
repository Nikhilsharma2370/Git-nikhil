# Calendar Card: on-screen UI animation

Video editing Lesson 07 ka "Next 30 days" calendar card, code se bana hua. Reel me speaker ke upar overlay karne ke liye.

## Files

| File | Kya hai |
|------|---------|
| `calendar-card.html` | Card ka design + animation. Browser me kholo to loop me chalega. `?preview` lagao to background aur caption ke saath |
| `render.js` | HTML ko 30fps PNG frames me render karta hai (Playwright) |
| `output/calendar-card-preview.mp4` | Dekhne ke liye: dark background + "to posting" caption |
| `output/calendar-card-transparent.webm` | Transparent overlay (VP9 alpha). Web, CapCut, Premiere (plugin ke saath) |
| `output/calendar-card-transparent.mov` | Transparent overlay (ProRes 4444). After Effects, Premiere, Final Cut, DaVinci. 44MB, isliye git me nahi hai; chat me bheja gaya |

Sab videos **1080×1920, 30fps, 4 second** ke hain. Card already sahi jagah par hai (caption ke neeche, chest level), isliye reel ke upar seedha drop kar sakte ho.

## Animation timeline

| Time | Kya hota hai |
|------|--------------|
| 0.00–0.45s | Card neeche se upar aata hai + fade + blur → sharp |
| 0.20–0.55s | Header ("Next 30 days", counter) aata hai |
| 0.30–0.90s | 30 grey cells ek-ek karke aate hain |
| 0.85–2.30s | Din 1 → 15 blue hote hain (pop ke saath), counter 0 → 15/30, progress bar badhta hai |
| 2.30–2.80s | Din 15 ("today") par glow ring |
| 2.80–3.45s | Hold |
| 3.45–3.85s | Exit: fade + neeche + blur |

## Badalna ho to

`calendar-card.html` ke `<script>` me upar:
- `POSTED = 15` → kitne din blue honge
- `DURATION = 4.0` → total length
- Timings `T = { ... }` me

Colors `:root` me (`--accent: #2F6BFF`).

## Dobara render karna

```bash
NODE_PATH=/opt/node-tools/node_modules node render.js frames-alpha
NODE_PATH=/opt/node-tools/node_modules node render.js frames-preview preview

ffmpeg -framerate 30 -i frames-preview/f_%04d.png -c:v libx264 -pix_fmt yuv420p -crf 18 output/calendar-card-preview.mp4
ffmpeg -framerate 30 -i frames-alpha/f_%04d.png -c:v prores_ks -profile:v 4 -pix_fmt yuva444p10le -qscale:v 11 output/calendar-card-transparent.mov
ffmpeg -framerate 30 -i frames-alpha/f_%04d.png -c:v libvpx-vp9 -pix_fmt yuva420p -b:v 0 -crf 30 -auto-alt-ref 0 output/calendar-card-transparent.webm
```
