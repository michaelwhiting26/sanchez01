"""Pack render_beats.py / render_runner.py frames into <beat><suffix>.webp + <beat><suffix>.json (public/assets/runner) and a labelled contact sheet PNG per beat.
  python3 tools/runner/assemble_beats.py --frames <scratch>/frames --out apps/web/public/assets/runner --sheets <scratch>/sheets [--beats walk,look,sneak,reach,crouch,crouchlook,crouchpeek] [--suffix _shaded]
  beat "run" reads <frames>/run/meta.json (render_runner.py output, 24 frames, cols 6) and writes run<suffix>.webp/.json (same schema as meta.json).
Never point --out at the live folder for a beat that already exists there unless you mean to replace it."""
import sys, os, json, glob
from PIL import Image, ImageDraw
a = sys.argv[1:]
def opt(n, d): return a[a.index(n) + 1] if n in a else d
FR = opt("--frames", "frames"); OUT = opt("--out", "out"); SH = opt("--sheets", "sheets"); BEATS = opt("--beats", "walk,look,sneak,reach").split(","); SUF = opt("--suffix", "")
LIMIT = 345000
os.makedirs(SH, exist_ok=True); os.makedirs(OUT, exist_ok=True)
for b in BEATS:
    isrun = b == "run"
    raw = json.load(open(f"{FR}/{b}/{'meta' if isrun else 'raw'}.json")); files = sorted(glob.glob(f"{FR}/{b}/frame_*.png")); n = len(files)
    if isrun: raw["footY"] = 293.4; raw.setdefault("cols", 6)
    S = raw["size"]; cols = raw.get("cols", 4); rows = -(-n // cols)
    sheet = Image.new("RGBA", (cols * S, rows * S), (0, 0, 0, 0))
    for i, f in enumerate(files): sheet.paste(Image.open(f).convert("RGBA"), ((i % cols) * S, (i // cols) * S))
    q = 88; name = f"{b}{SUF}"
    while True:
        sheet.save(f"{OUT}/{name}.webp", "WEBP", quality=q, method=6)
        if os.path.getsize(f"{OUT}/{name}.webp") < LIMIT or q < 50: break
        q -= 4
    if isrun: meta = {"frames": n, "size": S, "nozzle": raw["nozzle"], "cols": cols}
    elif b in ("teep", "roll"): meta = {k: v for k, v in raw.items() if k not in ("beat", "diag", "head", "note")}
    elif b in ("crouch", "crouchpeek"): meta = {"frames": n, "cols": cols, "size": S, "hips": raw["hips"], "head": raw["head"], "footY": raw["footY"]}
    elif b == "crouchlook": meta = {"frames": n, "cols": cols, "size": S, "yawDeg": raw["yawDeg"], "pitchDeg": raw["pitchDeg"], "head": raw["head"], "footY": raw["footY"]}
    else:
        meta = {k: v for k, v in raw.items() if k not in ("beat", "headYawNote", "plantedSamples", "metresPerCycle", "rows")}
        if b == "reach": meta["poses"] = [{"i": p["i"], "nozzle": p["nozzle"], "hips": p["hips"]} for p in raw["poses"]]
        else: meta["cols"] = cols
    json.dump(meta, open(f"{OUT}/{name}.json", "w"))
    for tag, col in (("grey", (128, 128, 128)), ("dark", (5, 4, 3))):
        bg = Image.new("RGBA", sheet.size, col + (255,)); bg.alpha_composite(sheet); d = ImageDraw.Draw(bg)
        for i in range(n):
            x, y = (i % cols) * S, (i // cols) * S
            d.rectangle([x, y, x + S - 1, y + S - 1], outline=(90, 90, 90)); d.text((x + 6, y + 4), str(i), fill=(255, 70, 70))
            d.line([x, y + raw["footY"], x + S, y + raw["footY"]], fill=(0, 140, 200))
        bg.convert("RGB").save(f"{SH}/{name}_{tag}.png")
    print(name, n, "frames", os.path.getsize(f"{OUT}/{name}.webp") // 1024, "KB", "q", q)
