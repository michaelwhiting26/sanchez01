"""Web pictures from the enlarged phone screenshots (8 Oct 2026): upscale.py, then samrun_screens.py, then this.
usage: screens.py <sam out dir> <web out dir> <masters out dir>"""
import os, sys, numpy as np
from PIL import Image
from scipy import ndimage as ndi
S, OUT, MASTERS = sys.argv[1:4]
BG = (244, 241, 234)

def cutout(src, name):
    """One product on a clear square with a margin, as final.py does; the largest piece only, edge pulled in a pixel."""
    a = np.array(Image.open(os.path.join(S, src)).convert("RGBA")); al = a[..., 3]
    lab, n = ndi.label(al > 40)
    if n > 1: al = np.where(lab == 1 + int(np.argmax(ndi.sum(al > 40, lab, range(1, n + 1)))), al, 0)
    a[..., 3] = ndi.grey_erosion(al, size=(5, 5))
    ys, xs = np.where(a[..., 3] > 8); im = Image.fromarray(a[ys.min():ys.max() + 1, xs.min():xs.max() + 1])
    w, h = im.size; side = int(max(w, h) * 1.14)
    cv = Image.new("RGBA", (side, side), (0, 0, 0, 0)); cv.alpha_composite(im, ((side - w) // 2, (side - h) // 2))
    cv.save(os.path.join(MASTERS, name + ".png"), optimize=True)
    if side > 1000: cv = cv.resize((1000, 1000), Image.LANCZOS)
    cv.save(os.path.join(OUT, name + ".webp"), quality=92, method=6); print(name, cv.size)

def detail(src, name, fx, fy, side):
    """A square from inside one product, so no cut edge shows."""
    im = Image.open(os.path.join(S, src)).convert("RGBA"); w = im.width; s = int(w * side)
    flat = Image.new("RGBA", (s, s), BG + (255,)); flat.alpha_composite(im.crop((int(fx * w), int(fy * w), int(fx * w) + s, int(fy * w) + s)))
    flat.convert("RGB").save(os.path.join(OUT, name + ".webp"), quality=92, method=6); print(name, flat.size)

cutout("4766__black.png", "focus-mitts-face-black")
cutout("4766__white.png", "focus-mitts-face-white")
cutout("4766__gold.png", "focus-mitts-face-black-gold")
detail("4763__cross.png", "focus-mitts-red-cross-detail", 0.14, 0.15, 0.48)
cutout("4764__L.png", "focus-mitts-team-savva-left")
cutout("4764__R.png", "focus-mitts-team-savva-right")
