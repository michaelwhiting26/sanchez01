"""Pack render_beats.py frames into <beat>.webp + <beat>.json (public/assets/runner) and a labelled contact sheet PNG per beat.
  python3 tools/runner/assemble_beats.py --frames <scratch>/frames --out apps/web/public/assets/runner --sheets <scratch>/sheets [--beats walk,look,sneak,reach]
"""
import sys, os, json, glob
from PIL import Image, ImageDraw
a = sys.argv[1:]
def opt(n, d): return a[a.index(n) + 1] if n in a else d
FR = opt("--frames", "frames"); OUT = opt("--out", "out"); SH = opt("--sheets", "sheets"); BEATS = opt("--beats", "walk,look,sneak,reach").split(",")
os.makedirs(SH, exist_ok=True); os.makedirs(OUT, exist_ok=True)
for b in BEATS:
    raw = json.load(open(f"{FR}/{b}/raw.json")); files = sorted(glob.glob(f"{FR}/{b}/frame_*.png")); n = len(files)
    S = raw["size"]; cols = raw.get("cols", 4); rows = -(-n // cols)
    sheet = Image.new("RGBA", (cols * S, rows * S), (0, 0, 0, 0))
    for i, f in enumerate(files): sheet.paste(Image.open(f).convert("RGBA"), ((i % cols) * S, (i // cols) * S))
    q = 88
    while True:
        sheet.save(f"{OUT}/{b}.webp", "WEBP", quality=q, method=6)
        if os.path.getsize(f"{OUT}/{b}.webp") < 255000 or q < 60: break
        q -= 4
    meta = {k: v for k, v in raw.items() if k not in ("beat", "headYawNote", "plantedSamples", "metresPerCycle", "rows")}
    if b == "reach": meta["poses"] = [{"i": p["i"], "nozzle": p["nozzle"], "hips": p["hips"]} for p in raw["poses"]]
    else: meta["cols"] = cols
    json.dump(meta, open(f"{OUT}/{b}.json", "w"))
    # contact sheet: light background, index labels, footY line
    bg = Image.new("RGBA", sheet.size, (232, 228, 218, 255)); bg.alpha_composite(sheet); d = ImageDraw.Draw(bg)
    for i in range(n):
        x, y = (i % cols) * S, (i // cols) * S
        d.rectangle([x, y, x + S - 1, y + S - 1], outline=(150, 150, 150)); d.text((x + 6, y + 4), str(i), fill=(200, 0, 0))
        d.line([x, y + raw["footY"], x + S, y + raw["footY"]], fill=(0, 140, 200))
        if b == "reach":
            p = raw["poses"][i]["nozzle"]; d.ellipse([x + p["x"] - 3, y + p["y"] - 3, x + p["x"] + 3, y + p["y"] + 3], outline=(0, 160, 0))
    bg.convert("RGB").save(f"{SH}/{b}.png")
    print(b, n, "frames", os.path.getsize(f"{OUT}/{b}.webp") // 1024, "KB", "q", q)
