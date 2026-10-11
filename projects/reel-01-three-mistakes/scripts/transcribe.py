import sys, json
from faster_whisper import WhisperModel
m = WhisperModel("small.en", device="cpu", compute_type="int8")
import wave, numpy as np
wf = wave.open(sys.argv[1]); audio = np.frombuffer(wf.readframes(wf.getnframes()), np.int16).astype(np.float32) / 32768
segs, info = m.transcribe(audio, word_timestamps=True, vad_filter=False, beam_size=5)
words = []
for s in segs:
    for w in s.words:
        words.append({"w": w.word.strip(), "s": round(w.start, 3), "e": round(w.end, 3), "p": round(w.probability, 3)})
    print(f"[{s.start:6.2f}-{s.end:6.2f}] {s.text}")
json.dump(words, open(sys.argv[2], "w"), indent=0)
