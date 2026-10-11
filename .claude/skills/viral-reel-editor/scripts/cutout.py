"""Gemini / Nano Banana images → transparent PNG cutouts (Photoshop "Select Subject + Remove BG" jaisa).

Usage:
  python3 cutout.py <in_dir_with_jpg_png> <out_dir> [--white-key name1,name2] [--split name:3]

- Default: rembg (isnet-general-use) + alpha matting, phir transparent padding trim.
- --white-key: pure white background wali images (jaise ink brush stroke) ke liye luminance se alpha.
- --split name:N: ek image me N alag objects (jaise 3 paint tubes) ko khaali columns ke hisaab se
  N alag PNG me kaatta hai → name_1.png … name_N.png
Install once: pip install "rembg[cpu]"   (pehli baar model download hota hai)
"""
import argparse, glob, os
import numpy as np
from PIL import Image


def trim(rgba, pad=16):
    bbox = rgba.getchannel("A").point(lambda v: 255 if v > 8 else 0).getbbox()
    if not bbox:
        return rgba
    return rgba.crop((max(0, bbox[0] - pad), max(0, bbox[1] - pad), min(rgba.width, bbox[2] + pad), min(rgba.height, bbox[3] + pad)))


def white_key(im):
    a = 255 - np.asarray(im.convert("L")).astype(np.int32)
    a = np.clip((a - 20) * 1.25, 0, 255).astype(np.uint8)
    rgba = Image.new("RGBA", im.size, (20, 20, 20, 0))
    rgba.putalpha(Image.fromarray(a))
    return rgba


def split(rgba, n):
    a = np.asarray(rgba.getchannel("A"))
    cols = (a > 20).sum(0)
    runs, start = [], None
    for x in range(rgba.width):
        if cols[x] > 0 and start is None:
            start = x
        if cols[x] == 0 and start is not None:
            runs.append((start, x)); start = None
    if start is not None:
        runs.append((start, rgba.width))
    runs = sorted(runs, key=lambda r: r[1] - r[0], reverse=True)[:n]
    runs.sort()
    out = []
    for x0, x1 in runs:
        piece = rgba.crop((max(0, x0 - 8), 0, min(rgba.width, x1 + 8), rgba.height))
        out.append(piece.crop(piece.getchannel("A").getbbox()))
    return out


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("src"); ap.add_argument("out")
    ap.add_argument("--white-key", default="")
    ap.add_argument("--split", action="append", default=[])
    a = ap.parse_args()
    os.makedirs(a.out, exist_ok=True)
    wk = set(filter(None, a.white_key.split(",")))
    splits = dict((s.split(":")[0], int(s.split(":")[1])) for s in a.split)
    from rembg import new_session, remove
    sess = new_session("isnet-general-use")
    files = sorted(glob.glob(os.path.join(a.src, "*.jpg")) + glob.glob(os.path.join(a.src, "*.png")) + glob.glob(os.path.join(a.src, "*.webp")))
    for f in files:
        name = os.path.splitext(os.path.basename(f))[0]
        im = Image.open(f).convert("RGB")
        if name in wk:
            rgba = white_key(im)
        else:
            rgba = remove(im, session=sess, alpha_matting=True, alpha_matting_foreground_threshold=240,
                          alpha_matting_background_threshold=15, alpha_matting_erode_size=8)
        rgba = trim(rgba)
        rgba.save(os.path.join(a.out, name + ".png"), optimize=True)
        print(name, rgba.size)
        if name in splits:
            for i, piece in enumerate(split(rgba, splits[name]), 1):
                piece.save(os.path.join(a.out, f"{name}_{i}.png")); print(f"  {name}_{i}", piece.size)


if __name__ == "__main__":
    main()
