"""Word-level transcript (faster-whisper).

Usage:
  python3 transcribe.py <video_or_audio> <out_words.json> [--model small.en] [--merge]

- Audio ko ffmpeg se 16 kHz mono WAV banata hai aur numpy array pass karta hai
  (faster-whisper ka bundled `av` decoder kuch environments me fail hota hai).
- --merge: "25" + "%" aur "high" + "-end." jaise tokens jod deta hai (captions ke liye).
Output: [{"w": "word", "s": start_sec, "e": end_sec}, ...]
Install once: pip install faster-whisper
"""
import argparse, json, os, subprocess, tempfile, wave
import numpy as np


def load_audio(path):
    tmp = tempfile.NamedTemporaryFile(suffix=".wav", delete=False).name
    subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-i", path, "-vn", "-ac", "1", "-ar", "16000", tmp], check=True)
    with wave.open(tmp) as wf:
        audio = np.frombuffer(wf.readframes(wf.getnframes()), np.int16).astype(np.float32) / 32768
    os.unlink(tmp)
    return audio


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("src")
    ap.add_argument("out")
    ap.add_argument("--model", default="small.en")
    ap.add_argument("--merge", action="store_true")
    a = ap.parse_args()

    from faster_whisper import WhisperModel

    model = WhisperModel(a.model, device="cpu", compute_type="int8")
    segs, _ = model.transcribe(load_audio(a.src), word_timestamps=True, vad_filter=False, beam_size=5)
    words = []
    for s in segs:
        print(f"[{s.start:6.2f}-{s.end:6.2f}] {s.text}")
        for w in s.words:
            words.append({"w": w.word.strip(), "s": round(w.start, 3), "e": round(w.end, 3)})
    if a.merge:
        merged = []
        for w in words:
            if merged and (w["w"].startswith("-") or w["w"] == "%"):
                merged[-1]["w"] += w["w"]
                merged[-1]["e"] = w["e"]
            else:
                merged.append(dict(w))
        words = merged
    json.dump(words, open(a.out, "w"), indent=0)
    print(f"{len(words)} words → {a.out}")


if __name__ == "__main__":
    main()
