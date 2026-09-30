"""Contact sheets with frame labels on mid-grey and #050403, from raw frame PNGs. python3 contact.py <frames_dir> <out_prefix> <cols> [zoom_x,y,w,h]"""
import sys, glob
from PIL import Image, ImageDraw
d, outp, cols = sys.argv[1], sys.argv[2], int(sys.argv[3]); crop = [int(v) for v in sys.argv[4].split(",")] if len(sys.argv) > 4 else None
fs = sorted(glob.glob(f"{d}/frame_*.png"))
for name, col in (("grey", (128, 128, 128)), ("dark", (5, 4, 3))):
    ims = [Image.open(f).convert("RGBA") for f in fs]; S = ims[0].size[0]
    if crop: ims = [im.crop((crop[0], crop[1], crop[0] + crop[2], crop[1] + crop[3])).resize((crop[2] * 2, crop[3] * 2), Image.LANCZOS) for im in ims]; W, H = crop[2] * 2, crop[3] * 2
    else: W = H = S
    rows = -(-len(ims) // cols); sh = Image.new("RGBA", (cols * W, rows * H), col + (255,)); dr = ImageDraw.Draw(sh)
    for i, im in enumerate(ims):
        x, y = (i % cols) * W, (i // cols) * H; sh.alpha_composite(im, (x, y)); dr.rectangle([x, y, x + W - 1, y + H - 1], outline=(70, 70, 70)); dr.text((x + 5, y + 4), str(i), fill=(255, 60, 60))
        if not crop: dr.line([x, y + 293.4, x + W, y + 293.4], fill=(0, 140, 200))
    sh.convert("RGB").save(f"{outp}_{name}{'_zoom' if crop else ''}.png")
