"""Reel ke liye sound effects synthesize karta hai (numpy only).

Families (Lesson 09):
  whooshes  -> movement      : whoosh_hollow, whoosh_deep, whoosh_transition
  textures  -> events        : pop, ui_click, scifi_click, scifi_impact, gear_tick
  risers    -> anticipation  : riser_bass, riser_metal  (+ hit)

Har whoosh ka peak WHOOSH_PEAK seconds par hai, aur har riser ka end RISER_LEN par.
Usage: python3 sfx.py <out_dir>
"""
import sys, os, wave
import numpy as np

SR = 48000
WHOOSH_PEAK = 0.55
RISER_LEN = 2.0
rng = np.random.default_rng(7)


def t(d):
    return np.arange(int(SR * d)) / SR


def lowpass(x, cutoff):
    """Time-varying one-pole lowpass. cutoff: scalar ya array (Hz)."""
    c = np.broadcast_to(np.asarray(cutoff, dtype=np.float64), x.shape)
    a = 1 - np.exp(-2 * np.pi * c / SR)
    y = np.empty_like(x)
    acc = 0.0
    for i in range(len(x)):
        acc += a[i] * (x[i] - acc)
        y[i] = acc
    return y


def bandpass(x, lo, hi):
    return lowpass(x, hi) - lowpass(x, lo)


def sweep(f0, f1, d, curve=2.0):
    tt = t(d)
    f = f0 + (f1 - f0) * (tt / d) ** curve
    return np.sin(2 * np.pi * np.cumsum(f) / SR)


def env_whoosh(d, peak, attack_pow=2.2, release_pow=1.6):
    tt = t(d)
    up = np.clip(tt / peak, 0, 1) ** attack_pow
    down = np.clip(1 - (tt - peak) / (d - peak), 0, 1) ** release_pow
    return np.where(tt <= peak, up, down)


def norm(x, peak=0.9):
    m = np.max(np.abs(x)) or 1
    return x / m * peak


def save(path, x):
    x = np.clip(x, -1, 1)
    with wave.open(path, "w") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes((x * 32767).astype(np.int16).tobytes())


def whoosh(d, peak, lo_hz, hi_hz, tone=None):
    n = rng.standard_normal(int(SR * d))
    e = env_whoosh(d, peak)
    cut = lo_hz + (hi_hz - lo_hz) * e  # brighter at the peak
    x = bandpass(n, cut * 0.25, cut) * e
    if tone:
        f0, f1, amt = tone
        x += amt * sweep(f0, f1, d, 1.0) * e ** 1.5
    return norm(x)


def make(out):
    os.makedirs(out, exist_ok=True)
    # --- whooshes (movement) ---
    save(f"{out}/whoosh_hollow.wav", whoosh(1.0, WHOOSH_PEAK, 600, 5200))
    save(f"{out}/whoosh_deep.wav", whoosh(1.0, WHOOSH_PEAK, 250, 2600, tone=(180, 70, 0.35)))
    save(f"{out}/whoosh_transition.wav", whoosh(1.0, WHOOSH_PEAK, 400, 7000, tone=(900, 2400, 0.12)))

    # --- textures (events) ---
    tt = t(0.09)
    pop = np.sin(2 * np.pi * np.cumsum(420 + 700 * np.exp(-tt * 60)) / SR) * np.exp(-tt * 45)
    save(f"{out}/pop.wav", norm(pop))

    tt = t(0.05)
    click = (np.sin(2 * np.pi * 2300 * tt) + 0.5 * np.sin(2 * np.pi * 4100 * tt)) * np.exp(-tt * 160)
    click[:40] += rng.standard_normal(40) * 0.6
    save(f"{out}/ui_click.wav", norm(click, 0.8))

    tt = t(0.12)
    sc = sweep(3200, 900, 0.12, 1.0) * np.exp(-tt * 40) + 0.4 * np.sin(2 * np.pi * 5200 * tt) * np.exp(-tt * 90)
    save(f"{out}/scifi_click.wav", norm(sc, 0.8))

    d = 0.9
    tt = t(d)
    thump = sweep(140, 38, d, 0.5) * np.exp(-tt * 6)
    burst = lowpass(rng.standard_normal(len(tt)), 2500) * np.exp(-tt * 25)
    ring = sum(np.sin(2 * np.pi * f * tt) * np.exp(-tt * k) for f, k in [(523, 7), (1307, 9), (2093, 12)]) * 0.15
    save(f"{out}/scifi_impact.wav", norm(thump + 0.6 * burst + ring))

    tt = t(0.03)
    tick = bandpass(rng.standard_normal(len(tt)), 1500, 6000) * np.exp(-tt * 220)
    save(f"{out}/gear_tick.wav", norm(tick, 0.7))

    # --- risers + hit (anticipation) ---
    d = RISER_LEN
    tt = t(d)
    e = (tt / d) ** 2.5
    bass = sweep(42, 170, d, 1.6) + 0.5 * sweep(84, 340, d, 1.6)
    hiss = bandpass(rng.standard_normal(len(tt)), 800 + 5000 * e, 1500 + 9000 * e)
    save(f"{out}/riser_bass.wav", norm((bass * 0.8 + hiss * 0.5) * e))

    parts = sum(sweep(f, f * 2.6, d, 1.8) * a for f, a in [(310, 1), (467, 0.7), (733, 0.5), (1187, 0.35)])
    trem = 0.75 + 0.25 * np.sin(2 * np.pi * (4 + 18 * (tt / d) ** 2) * tt)
    save(f"{out}/riser_metal.wav", norm(parts * trem * e))

    d = 1.4
    tt = t(d)
    boom = sweep(70, 34, d, 0.4) * np.exp(-tt * 3.2)
    trans = lowpass(rng.standard_normal(len(tt)), 3000) * np.exp(-tt * 60)
    save(f"{out}/hit.wav", norm(boom + 0.5 * trans))

    # success chime (conclusion)
    d = 1.2
    tt = t(d)
    chime = sum(np.sin(2 * np.pi * f * (tt - s)) * np.exp(-np.clip(tt - s, 0, None) * k) * (tt >= s)
                for f, k, s in [(784, 4, 0), (1175, 4, 0.09), (1568, 5, 0.18)])
    save(f"{out}/success.wav", norm(chime, 0.8))


if __name__ == "__main__":
    make(sys.argv[1])
    print("done")
