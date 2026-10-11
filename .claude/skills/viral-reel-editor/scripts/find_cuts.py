"""Jump-cut helper: silences kaato, retakes pakdo, cut footage render karo.

Step 1 — plan:
  python3 find_cuts.py plan <raw.mp4> <raw_words.json> <cuts.json> [--noise -30] [--min-sil 0.28] [--end SEC]
    • ffmpeg silencedetect se silences → keep ranges (har cut par ~0.1s saans rehne do)
    • raw transcript me REPEATED phrases dhundta hai (retake ka sabse bada signal)
      aur print karta hai. Retake mile to cuts.json me adhoora take wala range hata do,
      poora take rakho. (Raw ko ek baar transcribe karna zaroori hai: transcribe.py)
Step 1b — check (ZAROORI):
  python3 find_cuts.py check <raw.mp4> <cuts.json> [--model base.en]
    • har keep range ko ALAG se transcribe karke text print karta hai, aur jo range
      agle range ka adhoora/duplicate version ho use "RETAKE?" flag karta hai.
    • Whisper poore raw par retakes ko aksar jod deta hai, isliye sirf raw transcript
      par bharosa mat karo. Flagged range ko cuts.json se hatao, phir render.
Step 2 — render:
  python3 find_cuts.py render <raw.mp4> <cuts.json> <cut.mp4>
    • har range trim + 12 ms audio fade + concat → cut.mp4 (crf 17)
Phir cut.mp4 ko DOBARA transcribe karo (transcribe.py --merge). Raw timestamps ko
remap mat karo — wo 0.5–0.9s tak khisak jaate hain.
"""
import argparse, json, re, subprocess


def silences(src, noise, min_sil):
    r = subprocess.run(["ffmpeg", "-hide_banner", "-i", src, "-vn", "-af", f"silencedetect=noise={noise}dB:d={min_sil}", "-f", "null", "-"],
                       capture_output=True, text=True)
    st = [float(x) for x in re.findall(r"silence_start: ([\d.]+)", r.stderr)]
    en = [float(x) for x in re.findall(r"silence_end: ([\d.]+)", r.stderr)]
    return list(zip(st, en))


def duration(src):
    r = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", src], capture_output=True, text=True)
    return float(r.stdout.strip())


def norm(w):
    return re.sub(r"[^a-z0-9%]", "", w.lower())


def plan(a):
    dur = duration(a.src)
    end = a.end or dur
    sil = silences(a.src, a.noise, a.min_sil)
    words = json.load(open(a.words))
    cuts = []
    for s, e in sil:
        x0 = 0 if s <= 0.01 else s + 0.12
        x1 = e - 0.10
        if x1 - x0 >= 0.12:
            cuts.append((x0, x1))
    cuts.append((end, dur + 1))
    cuts.sort()
    keep, t = [], 0.0
    for x0, x1 in cuts:
        if x0 > t:
            keep.append([round(t, 3), round(min(x0, end), 3)])
        t = max(t, x1)

    def snap(x):
        for s, e in sil:
            if s <= x < e:
                return e
        return x

    starts = [snap(w["s"]) for w in words]
    # bahut chhote ranges (saans / click) hatao; bolne wale ranges ka faisla `check` karega
    keep = [r for r in keep if r[1] - r[0] >= 0.45 or any(r[0] - 0.05 <= s < r[1] for s in starts)]

    # retake detector: 3-word phrase jo 12s ke andar dobara aaye
    toks = [(norm(w["w"]), w["s"]) for w in words]
    seen, flagged = {}, []
    for i in range(len(toks) - 2):
        key = " ".join(t[0] for t in toks[i:i + 3])
        if key in seen and toks[i][1] - seen[key] < 12:
            flagged.append((seen[key], toks[i][1], key))
        seen[key] = toks[i][1]
    json.dump({"ranges": keep}, open(a.out, "w"), indent=1)
    print(f"{len(keep)} keep ranges, total {sum(e - s for s, e in keep):.2f}s (raw {dur:.2f}s) → {a.out}")
    for r in keep:
        print("  keep", r)
    if flagged:
        print("\nPOSSIBLE RETAKES (pehla adhoora take hatao, poora rakho):")
        for t0, t1, k in flagged:
            print(f"  '{k}'  first @ {t0:.2f}s, again @ {t1:.2f}s")


def check(a):
    import os, tempfile, wave
    import numpy as np
    from faster_whisper import WhisperModel
    keep = json.load(open(a.cuts))["ranges"]
    tmp = tempfile.NamedTemporaryFile(suffix=".wav", delete=False).name
    subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-i", a.src, "-vn", "-ac", "1", "-ar", "16000", tmp], check=True)
    with wave.open(tmp) as wf:
        audio = np.frombuffer(wf.readframes(wf.getnframes()), np.int16).astype(np.float32) / 32768
    os.unlink(tmp)
    model = WhisperModel(a.model, device="cpu", compute_type="int8")
    texts = []
    for s, e in keep:
        seg = audio[int(s * 16000):int(e * 16000)]
        t = " ".join(x.text.strip() for x in model.transcribe(seg, beam_size=5)[0]).strip()
        texts.append(t)
    words = lambda t: [norm(w) for w in t.split() if norm(w)]
    for i, ((s, e), t) in enumerate(zip(keep, texts)):
        flag = ""
        if i + 1 < len(texts):
            a_w, b_w = words(t), words(texts[i + 1])
            n = min(len(a_w), len(b_w), 4)
            if n >= 2 and a_w[:n] == b_w[:n]:
                flag = "   <-- RETAKE? agla range isi tarah shuru hota hai (adhoora wala hatao)"
        print(f"{i:2d} [{s:7.2f}-{e:7.2f}] {t or '(silent / noise)'}{flag}")


def render(a):
    keep = json.load(open(a.cuts))["ranges"]
    parts = []
    for i, (s, e) in enumerate(keep):
        d = e - s
        parts.append(f"[0:v]trim={s}:{e},setpts=PTS-STARTPTS[v{i}];[0:a]atrim={s}:{e},asetpts=PTS-STARTPTS,"
                     f"afade=t=in:d=0.012,afade=t=out:st={d - 0.012:.3f}:d=0.012[a{i}]")
    parts.append("".join(f"[v{i}][a{i}]" for i in range(len(keep))) + f"concat=n={len(keep)}:v=1:a=1[v][a]")
    fpath = a.out + ".filter.txt"
    open(fpath, "w").write(";".join(parts))
    subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-i", a.src, "-filter_complex_script", fpath, "-map", "[v]", "-map", "[a]",
                    "-c:v", "libx264", "-crf", "17", "-preset", "medium", "-pix_fmt", "yuv420p", "-r", "30", "-c:a", "aac", "-b:a", "192k", a.out], check=True)
    print(f"cut → {a.out} ({duration(a.out):.2f}s)")


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    sub = ap.add_subparsers(dest="cmd", required=True)
    p = sub.add_parser("plan"); p.add_argument("src"); p.add_argument("words"); p.add_argument("out")
    p.add_argument("--noise", type=float, default=-30); p.add_argument("--min-sil", type=float, default=0.28); p.add_argument("--end", type=float)
    c = sub.add_parser("check"); c.add_argument("src"); c.add_argument("cuts"); c.add_argument("--model", default="base.en")
    r = sub.add_parser("render"); r.add_argument("src"); r.add_argument("cuts"); r.add_argument("out")
    a = ap.parse_args()
    {"plan": plan, "check": check, "render": render}[a.cmd](a)
