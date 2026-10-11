"""Premiere Pro ke liye FCP7 XML + SRT captions banata hai (adobe/reel-data.json se).

Sequence (1080x1920, 30fps):
  V1  speaker: raw footage ke jump cuts. Half-screen / zoom ke hisson me clip split
      aur static Basic Motion (keyframe-free, taaki har Premiere version me same aaye)
  V2  <name>_GRAPHICS.mov  (After Effects ke GRAPHICS comp ka alpha render)
  A1  voice (V1 ke saath linked)
  A2  WHOOSHES   A3 TEXTURES   A4 RISERS   A5 HITS   (levels Lesson 09 ke hisaab se)
  Markers: har scene ka start
Usage:
  python3 export_premiere.py --kit <adobe_kit_dir> --raw-name "<raw footage file name>" --raw-duration <sec> \
      [--face 495,520] [--half-shift 840] [--zoom 1.18] [--name REEL_01]
  Kit me <kit>/reel-data.json hona chahiye (export-data.ts se) aur <kit>/sfx/*.wav.
  Scene keys: "half*" = half-screen, "zoom*" = zoom punch-in; baaki sirf markers.
"""
import argparse, json, os, wave
from xml.sax.saxutils import escape

ap = argparse.ArgumentParser()
ap.add_argument("--kit", required=True)
ap.add_argument("--raw-name", required=True)
ap.add_argument("--raw-duration", type=float, required=True)
ap.add_argument("--face", default="495,520")
ap.add_argument("--half-shift", type=float, default=840)
ap.add_argument("--zoom", type=float, default=1.18)
ap.add_argument("--name", default="REEL_01")
ARGS = ap.parse_args()

KIT = ARGS.kit
D = json.load(open(os.path.join(KIT, "reel-data.json")))
FPS = D["fps"]
W, H = 1080, 1920
FACE = tuple(float(v) for v in ARGS.face.split(","))
HALF_SHIFT = ARGS.half_shift
ZOOM = ARGS.zoom
RAW_NAME = ARGS.raw_name
RAW_FRAMES = int(ARGS.raw_duration * FPS)
SEQ_FRAMES = round(D["duration"] * FPS)
S = D["scenes"]
HALF_KEYS = [k for k in S if k.startswith("half")]
ZOOM_KEYS = [k for k in S if k.startswith("zoom")]

f = lambda sec: int(round(sec * FPS))

# ---------- motion states on the comp timeline ----------
def motion_at(t):
    for k in HALF_KEYS:
        if S[k]["start"] + 0.14 <= t < S[k]["end"] - 0.1:
            return "half"
    for k in ZOOM_KEYS:
        if S[k]["start"] + 0.27 <= t < S[k]["end"]:
            return "zoom"
    return "normal"

bounds = {0.0, D["duration"]}
for k in HALF_KEYS:
    bounds |= {S[k]["start"] + 0.14, S[k]["end"] - 0.1}
for k in ZOOM_KEYS:
    bounds |= {S[k]["start"] + 0.27, S[k]["end"]}

# cut ranges → comp timeline segments, split at motion bounds
pieces = []
t = 0.0
for a, b in D["ranges"]:
    seg_start, seg_end = t, t + (b - a)
    cuts = sorted([x for x in bounds if seg_start < x < seg_end] + [seg_start, seg_end])
    for x0, x1 in zip(cuts, cuts[1:]):
        pieces.append({"start": f(x0), "end": f(x1), "in": f(a + (x0 - seg_start)), "out": f(a + (x1 - seg_start)), "motion": motion_at((x0 + x1) / 2)})
    t = seg_end
# frame rounding: pieces ko seamless banao
for p0, p1 in zip(pieces, pieces[1:]):
    p1["start"] = p0["end"]
pieces = [p for p in pieces if p["end"] > p["start"]]
for p in pieces:
    p["out"] = p["in"] + (p["end"] - p["start"])  # source length == timeline length


def motion_filter(m):
    if m == "normal":
        return ""
    if m == "half":
        scale, dx, dy = 100, 0, HALF_SHIFT
    else:
        scale = ZOOM * 100
        # center par scale hota hai → face ko wapas uski jagah lao
        dx = FACE[0] - (W / 2 + (FACE[0] - W / 2) * ZOOM)
        dy = FACE[1] - (H / 2 + (FACE[1] - H / 2) * ZOOM)
    return f"""
            <filter><effect><name>Basic Motion</name><effectid>basic</effectid><effectcategory>motion</effectcategory><effecttype>motion</effecttype><mediatype>video</mediatype>
              <parameter><parameterid>scale</parameterid><name>Scale</name><valuemin>0</valuemin><valuemax>1000</valuemax><value>{scale:.2f}</value></parameter>
              <parameter><parameterid>center</parameterid><name>Center</name><value><horiz>{dx / W:.5f}</horiz><vert>{dy / H:.5f}</vert></value></parameter>
            </effect></filter>"""


def rate():
    return f"<rate><timebase>{FPS}</timebase><ntsc>FALSE</ntsc></rate>"


RAW_FILE_DEF = f"""<file id="file-raw"><name>{escape(RAW_NAME)}</name><pathurl>footage/{RAW_NAME.replace(' ', '%20')}</pathurl>{rate()}<duration>{RAW_FRAMES}</duration>
              <media><video><samplecharacteristics>{rate()}<width>{W}</width><height>{H}</height><pixelaspectratio>square</pixelaspectratio></samplecharacteristics></video>
              <audio><samplecharacteristics><depth>16</depth><samplerate>48000</samplerate></samplecharacteristics><channelcount>2</channelcount></audio></media></file>"""
GFX_FILE_DEF = f"""<file id="file-gfx"><name>{ARGS.name}_GRAPHICS.mov</name><pathurl>renders/{ARGS.name}_GRAPHICS.mov</pathurl>{rate()}<duration>{SEQ_FRAMES}</duration>
              <media><video><samplecharacteristics>{rate()}<width>{W}</width><height>{H}</height><pixelaspectratio>square</pixelaspectratio></samplecharacteristics></video></media></file>"""

# ---------- V1 / A1 ----------
v1, a1 = [], []
for i, p in enumerate(pieces):
    fdef = RAW_FILE_DEF if i == 0 else '<file id="file-raw"/>'
    name = f"speaker {i + 1}" + (" [HALF]" if p["motion"] == "half" else " [ZOOM]" if p["motion"] == "zoom" else "")
    link = f"""<link><linkclipref>v1-{i}</linkclipref><mediatype>video</mediatype><trackindex>1</trackindex><clipindex>{i + 1}</clipindex></link>
            <link><linkclipref>a1-{i}</linkclipref><mediatype>audio</mediatype><trackindex>1</trackindex><clipindex>{i + 1}</clipindex></link>"""
    v1.append(f"""
          <clipitem id="v1-{i}"><name>{name}</name><duration>{RAW_FRAMES}</duration>{rate()}<start>{p['start']}</start><end>{p['end']}</end><in>{p['in']}</in><out>{p['out']}</out>
            {fdef}{motion_filter(p['motion'])}
            {link}
          </clipitem>""")
    a1.append(f"""
          <clipitem id="a1-{i}"><name>{name}</name><duration>{RAW_FRAMES}</duration>{rate()}<start>{p['start']}</start><end>{p['end']}</end><in>{p['in']}</in><out>{p['out']}</out>
            <file id="file-raw"/><sourcetrack><mediatype>audio</mediatype><trackindex>1</trackindex></sourcetrack>
            {link}
          </clipitem>""")

v2 = [f"""
          <clipitem id="v2-gfx"><name>{ARGS.name}_GRAPHICS (AE alpha render)</name><duration>{SEQ_FRAMES}</duration>{rate()}<start>0</start><end>{SEQ_FRAMES}</end><in>0</in><out>{SEQ_FRAMES}</out>
            {GFX_FILE_DEF}
          </clipitem>"""]

# ---------- SFX tracks ----------
sfx_dir = os.path.join(KIT, "sfx")
sfx_len = {}
for fn in os.listdir(sfx_dir):
    with wave.open(os.path.join(sfx_dir, fn)) as wv:
        sfx_len[fn[:-4]] = max(1, f(wv.getnframes() / wv.getframerate()))
defined = set()


def sfx_track(cues, tag):
    items = []
    for i, c in enumerate(cues):
        start = f(c["at"] - c.get("offset", 0))
        dur = sfx_len[c["file"]]
        fid = f"file-sfx-{c['file']}"
        if fid in defined:
            fdef = f'<file id="{fid}"/>'
        else:
            defined.add(fid)
            fdef = f"""<file id="{fid}"><name>{c['file']}.wav</name><pathurl>sfx/{c['file']}.wav</pathurl>{rate()}<duration>{dur}</duration>
              <media><audio><samplecharacteristics><depth>16</depth><samplerate>48000</samplerate></samplecharacteristics><channelcount>1</channelcount></audio></media></file>"""
        gain = 10 ** (c["db"] / 20)
        items.append(f"""
          <clipitem id="{tag}-{i}"><name>{escape(tag + ': ' + c['note'])}</name><duration>{dur}</duration>{rate()}<start>{start}</start><end>{start + dur}</end><in>0</in><out>{dur}</out>
            {fdef}<sourcetrack><mediatype>audio</mediatype><trackindex>1</trackindex></sourcetrack>
            <filter><effect><name>Audio Levels</name><effectid>audiolevels</effectid><effectcategory>audiolevels</effectcategory><effecttype>audiolevels</effecttype><mediatype>audio</mediatype>
              <parameter><parameterid>level</parameterid><name>Level</name><valuemin>0</valuemin><valuemax>3.98109</valuemax><value>{gain:.5f}</value></parameter></effect></filter>
          </clipitem>""")
    return items


def track(items, kind="video"):
    extra = "" if kind == "video" else "<outputchannelindex>1</outputchannelindex>"
    return f"<track>{''.join(items)}{extra}</track>"


markers = []
names = sorted(((k, k.upper()) for k in S), key=lambda kv: S[kv[0]]["start"])
for k, n in names:
    markers.append(f"<marker><name>{escape(n)}</name><comment></comment><in>{f(S[k]['start'])}</in><out>-1</out></marker>")

xml = f"""<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE xmeml>
<xmeml version="5">
  <sequence id="seq-reel-01">
    <name>{ARGS.name}</name>
    <duration>{SEQ_FRAMES}</duration>
    {rate()}
    <timecode>{rate()}<string>00:00:00:00</string><frame>0</frame><displayformat>NDF</displayformat></timecode>
    {''.join(markers)}
    <media>
      <video>
        <format><samplecharacteristics>{rate()}<width>{W}</width><height>{H}</height><pixelaspectratio>square</pixelaspectratio><fielddominance>none</fielddominance></samplecharacteristics></format>
        {track(v1)}
        {track(v2)}
      </video>
      <audio>
        <numOutputChannels>2</numOutputChannels>
        {track(a1, 'audio')}
        {track(sfx_track(D['sfx']['WHOOSHES'], 'WHOOSH'), 'audio')}
        {track(sfx_track(D['sfx']['TEXTURES'], 'TEXTURE'), 'audio')}
        {track(sfx_track(D['sfx']['RISERS'], 'RISER'), 'audio')}
        {track(sfx_track(D['sfx']['HITS'], 'HIT'), 'audio')}
      </audio>
    </media>
  </sequence>
</xmeml>
"""
out = os.path.join(KIT, f"{ARGS.name}_premiere.xml")
open(out, "w").write(xml)

# ---------- SRT ----------
def ts(sec):
    ms = int(round(sec * 1000))
    return f"{ms // 3600000:02d}:{ms // 60000 % 60:02d}:{ms // 1000 % 60:02d},{ms % 1000:03d}"

srt = []
caps = D["captions"]
for i, g in enumerate(caps):
    words = [(g.get("text") or {}).get(str(k), D["words"][k]["w"]) for k in range(g["from"], g["to"] + 1)]
    start = max(0.0, D["words"][g["from"]]["s"] - 0.04)
    nxt = caps[i + 1] if i + 1 < len(caps) else None
    end = g.get("end", min((D["words"][nxt["from"]]["s"] - 0.04) if nxt else D["words"][g["to"]]["e"] + 1, D["words"][g["to"]]["e"] + 1.2))
    srt.append(f"{i + 1}\n{ts(start)} --> {ts(end)}\n{' '.join(words)}\n")
open(os.path.join(KIT, f"{ARGS.name}_captions.srt"), "w").write("\n".join(srt))
print(f"{len(pieces)} V1 pieces, {sum(len(D['sfx'][k]) for k in D['sfx'])} sfx, {len(markers)} markers, {len(srt)} captions → {out}")
