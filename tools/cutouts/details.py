"""Square detail pictures for the shop gallery, made from the cut-out masters and Jesse's ruler photographs (8 Oct 2026).
A piece lettered with a person's name is not shown whole without consent; these crops show its construction with no lettering in frame.
usage: details.py <masters transparent-png dir> <source photos dir> <out dir>"""
import os, sys
import numpy as np
from PIL import Image, ImageOps
M, SRC, OUT = sys.argv[1:4]
BG = (244, 241, 234)

def product_box(im):
    ys, xs = np.where(np.array(im)[..., 3] > 8)
    return xs.min(), ys.min(), xs.max() + 1, ys.max() + 1

def detail(master, out, fx, fy, side):
    """A square of the product, `side` of its width wide, with its top-left corner at (fx, fy) of the product's own box."""
    im = Image.open(os.path.join(M, master + ".png")).convert("RGBA")
    x0, y0, x1, _ = product_box(im)
    s = int((x1 - x0) * side); x, y = int(x0 + fx * (x1 - x0)), int(y0 + fy * (x1 - x0))
    flat = Image.new("RGBA", (s, s), BG + (255,)); flat.alpha_composite(im.crop((x, y, x + s, y + s)))
    save(flat.convert("RGB"), out)

def photo(name, out, top):
    """The widest square of a photograph, starting `top` of the spare height down."""
    im = ImageOps.exif_transpose(Image.open(os.path.join(SRC, name))).convert("RGB")
    w, h = im.size; y = int((h - w) * top)
    save(im.crop((0, y, w, y + w)), out)

def save(im, out):
    if im.width > 1000: im = im.resize((1000, 1000), Image.LANCZOS)  # never enlarged
    im.save(os.path.join(OUT, out + ".webp"), quality=92, method=6)
    print(out, im.size)

detail("focus-mitts-bowman-side-pair", "focus-mitts-laced-rim-detail", 0.30, 0.08, 0.40)
photo("IMG_4180.JPG", "focus-mitts-shamrock-measured-width", 0.45)
photo("IMG_4163.JPG", "focus-mitts-shamrock-measured-length", 0.40)
