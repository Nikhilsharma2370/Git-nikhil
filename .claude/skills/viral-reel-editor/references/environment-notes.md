# Environment notes (what broke and how it was fixed)

- **Remotion version:** template pins `remotion` / `@remotion/cli` 4.0.534 (+ React 18.3.1). `npm install` in the project.
- **Browser:** if Remotion can't download its Chrome, point it to an existing one: `--browser-executable=<path>` (cloud container: `/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell`).
- **Fonts:** behind a TLS-intercepting proxy, Chrome rejects Google Fonts (`ERR_CERT_AUTHORITY_INVALID`). The template loads **local woff2** from `public/fonts/` via `FontFace` + `delayRender` (Inter variable, EB Garamond variable + italic). Get more with curl (curl trusts the proxy CA) using the Google Fonts CSS API.
- **Whisper:** `pip install faster-whisper`; pass a numpy array (the bundled `av` decoder can fail with `metadata_errors`). `small.en` for the final transcript, `base.en` is enough for the retake check.
- **rembg:** `pip install "rembg[cpu]"`; first run downloads the model.
- **Render speed:** ~5 min for a 52s 1080×1920 reel on 4 cores (`--concurrency=4 --crf=18`). Run it in the background.
- **Chat upload limit ~30 MB:** re-encode the deliverable: `ffmpeg -i in.mp4 -c:v libx264 -preset slow -b:v 4000k -maxrate 4500k -bufsize 8000k -pix_fmt yuv420p -c:a aac -b:a 160k -movflags +faststart out.mp4` (52s → ~27 MB). Transparent overlays: QuickTime PNG codec (`-c:v png -pix_fmt rgba`) is ~4× smaller than ProRes 4444.
- **Stills:** `npx remotion bundle --out-dir <b>` once, then `npx remotion still <b> Reel out.png --frame=N --scale=0.5` per checkpoint; combine into a contact sheet and look at it.
- **Large public Drive files:** `curl -L "https://drive.usercontent.google.com/download?id=<ID>&export=download&confirm=t" -o file`. List a public folder via `https://drive.google.com/embeddedfolderview?id=<FOLDER_ID>`.
- **YouTube descriptions** (bot-checked watch pages): POST `https://www.youtube.com/youtubei/v1/next` with `{"videoId": ..., "context": {"client": {"clientName": "WEB", "clientVersion": "2.2026..."}}}` and read `attributedDescription` + chapter markers.
