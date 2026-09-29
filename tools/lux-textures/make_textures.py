"""Sanchez luxury bag textures: koi, dragon, monogram, kintsugi.

Each design writes two images into prototype/assets/bag3d/lux/:
  <name>-albedo.jpg  the colour
  <name>-rm.jpg      packed maps, glTF-style: R = bump height, G = roughness, B = metalness
The wrap is 2048 x 2004: one full turn round the bag body (0.979 = body height / circumference, measured from bag_4ft.glb). Front = middle of the width.

Sources
  koi     Yashima Gakutei, "Red Carp Ascending a Waterfall", late 1820s. The Met, Havemeyer Collection (public domain, Open Access).
  dragon  Katsushika Hokusai, dragon from "Ehon wakan no homare" (1836). The Met, Wallach Foundation Gift 2013 (public domain, Open Access).
  monogram, kintsugi: original, generated here.
"""
import os, sys, math, json
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter
from scipy.ndimage import gaussian_filter, zoom, map_coordinates
from scipy.spatial import cKDTree

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.environ.get('SRC', os.path.join(HERE, 'src'))
OUT = os.environ.get('OUT', os.path.join(HERE, '..', '..', 'prototype', 'assets', 'bag3d', 'lux'))
os.makedirs(OUT, exist_ok=True)
W, H = 2048, 2004
rng = np.random.default_rng(7)

def smooth(a, b, x):
    t = np.clip((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t)

def noise(scale, seed, wrap_x=True):
    """smooth value noise 0..1, tileable in x"""
    r = np.random.default_rng(seed); gw, gh = max(2, int(W / scale)), max(2, int(H / scale))
    g = r.random((gh + 3, gw)); g = np.concatenate([g, g[:, :3]], 1)
    z = zoom(g, (H / gh * (gh + 3) / (gh + 3), W / gw), order=3)[:H, :W]
    z = gaussian_filter(z, 1.0); z = (z - z.min()) / (z.max() - z.min() + 1e-9); return z

def thread(angle=58, period=5.0, amt=0.10):
    """fine satin-stitch texture: parallel threads with a soft sheen"""
    yy, xx = np.mgrid[0:H, 0:W].astype(np.float32); a = math.radians(angle)
    u = xx * math.cos(a) + yy * math.sin(a)
    t = 0.5 + 0.5 * np.sin(u * 2 * math.pi / period)
    t = t * (0.8 + 0.2 * noise(9, 11)); return 1 - amt + amt * 2 * (t - 0.5)

def feather_x(width_frac, edge_px=110):
    """0 at the left/right ends of the artwork, 1 inside, so the art melts into the plain back"""
    x0 = int((W - width_frac * W) / 2); x1 = W - x0
    xs = np.arange(W); m = np.clip(np.minimum(xs - x0, x1 - xs) / edge_px, 0, 1); m = m * m * (3 - 2 * m)
    return np.tile(m, (H, 1))

def save(name, albedo, bump, rough, metal):
    a = np.clip(albedo, 0, 255).astype(np.uint8)
    Image.fromarray(a).save(os.path.join(OUT, name + '-albedo.jpg'), quality=90, optimize=True, subsampling=0)
    rm = np.stack([np.clip(bump, 0, 1), np.clip(rough, 0, 1), np.clip(metal, 0, 1)], -1) * 255
    Image.fromarray(rm.astype(np.uint8)).save(os.path.join(OUT, name + '-rm.jpg'), quality=90, optimize=True, subsampling=0)
    print('wrote', name, os.path.getsize(os.path.join(OUT, name + '-albedo.jpg')) // 1024, 'KB +', os.path.getsize(os.path.join(OUT, name + '-rm.jpg')) // 1024, 'KB')

def place(img_arr, frac, fill):
    """centre an artwork of the given width fraction on the wrap; returns (canvas, mask) with mask=1 where the artwork is"""
    tw = int(W * frac); h, w = img_arr.shape[:2]; s = min(tw / w, H / h)
    nw, nh = int(round(w * s)), int(round(h * s))
    im = Image.fromarray(img_arr.astype(np.uint8)).resize((nw, nh), Image.LANCZOS)
    can = Image.new('RGB', (W, H), tuple(int(x) for x in fill)); ox, oy = (W - nw) // 2, (H - nh) // 2
    can.paste(im, (ox, oy)); m = np.zeros((H, W), np.float32); m[oy:oy + nh, ox:ox + nw] = 1
    return np.array(can).astype(np.float32), m

# ------------------------------------------------------------------ KOI
def koi():
    from skimage.restoration import inpaint_biharmonic
    im = Image.open(os.path.join(SRC, 'koi-full.jpg')).convert('RGB'); k = im.width / 639.0     # 639 = the width of the preview I picked crops on
    box = (int(65 * k), int(12 * k), int(632 * k), int(692 * k)); im = im.crop(box)
    a = np.array(im).astype(np.float32); sx, sy = a.shape[1] / 567.0, a.shape[0] / 680.0
    # paint out the artist's seal (red, lower left) and the poem (gold on the navy corner) so only the fish and the water remain
    R, G, B = a[..., 0], a[..., 1], a[..., 2]
    yy, xx = np.mgrid[0:a.shape[0], 0:a.shape[1]]
    seal = (R > 140) & (G < 120) & (B < 120) & (xx < 60 * sx) & (yy > 420 * sy) & (yy < 590 * sy)
    poem = (R > 70) & (R > B + 5) & (xx < 200 * sx) & (yy < 385 * sy)
    m = (seal | poem).astype(np.uint8)
    from scipy.ndimage import binary_dilation
    m = binary_dilation(m, iterations=int(9 * sx)); small = 6
    sm = np.array(Image.fromarray(a.astype(np.uint8)).resize((a.shape[1] // small, a.shape[0] // small), Image.LANCZOS)) / 255.0
    ms = np.array(Image.fromarray((m * 255).astype(np.uint8)).resize((sm.shape[1], sm.shape[0]), Image.NEAREST)) > 0
    inp = inpaint_biharmonic(sm, ms, channel_axis=-1); inp = np.array(Image.fromarray((inp * 255).astype(np.uint8)).resize((a.shape[1], a.shape[0]), Image.BICUBIC)).astype(np.float32)
    mm = gaussian_filter(m.astype(np.float32), 6)[..., None]; a = a * (1 - mm) + inp * mm
    # richer, deeper colour, like silk thread: more contrast and saturation, cool the shadows
    L = a.mean(-1, keepdims=True); a = L + (a - L) * 1.28; a = (a - 128) * 1.10 + 122
    navy = np.array([16, 40, 66], np.float32)
    can, mask = place(a, 0.82, navy)
    ft = feather_x(0.82); can = can * ft[..., None] + navy * (1 - ft[..., None])
    th = thread(60, 5.0, 0.10)[..., None]; can = can * th
    lum = can.mean(-1) / 255.0
    bump = 0.55 + 0.5 * (gaussian_filter(lum, 1.2) - gaussian_filter(lum, 6)) * 2.2
    rough = np.full((H, W), 0.5, np.float32) - 0.12 * (lum > 0.55)     # the pale water and the fish catch a bit more light
    save('koi', can, bump, rough, np.zeros((H, W)))

# ------------------------------------------------------------------ DRAGON
def dragon():
    im = Image.open(os.path.join(SRC, 'dragon-full.jpg')).convert('L'); k = im.width / 1400.0
    left = im.crop((int(150 * k), int(140 * k), int(672 * k), int(860 * k))); right = im.crop((int(710 * k), int(140 * k), int(1222 * k), int(860 * k)))
    joined = Image.new('L', (left.width + right.width, left.height)); joined.paste(left, (0, 0)); joined.paste(right, (left.width, 0))   # the page gutter is cut out
    joined = joined.rotate(90, expand=True)                                  # coils run up the bag, head at the top
    L = np.array(joined).astype(np.float32) / 255.0
    L = gaussian_filter(L, 0.8)
    # gold = the pale dragon; oxblood = the cloud; black = ink lines and everything else
    lo, hi = np.percentile(L, [12, 97]); L = np.clip((L - lo) / (hi - lo), 0, 1)
    gold = smooth(0.52, 0.78, L)
    cloud = smooth(0.12, 0.38, L) * (1 - smooth(0.50, 0.72, L))
    can_L, mask = place(np.stack([L * 255] * 3, -1), 0.70, (0, 0, 0)); Lc = can_L[..., 0] / 255.0
    gold = smooth(0.52, 0.78, Lc) * mask; cloud = smooth(0.12, 0.38, Lc) * (1 - smooth(0.50, 0.72, Lc)) * mask
    ft = feather_x(0.70, 130); gold *= ft; cloud *= ft
    # thread sheen: the gold catches light across the threads and along the body
    th = thread(52, 4.6, 0.20); sheen = 0.78 + 0.32 * noise(70, 5)
    t = np.clip(Lc * th * sheen, 0, 1.2)
    shadow = np.array([92, 62, 24], np.float32); mid = np.array([201, 164, 92], np.float32); light = np.array([248, 224, 152], np.float32)
    r = np.clip((t - 0.45) / 0.55, 0, 1)[..., None]
    g = np.where(r < 0.5, shadow + (mid - shadow) * (r / 0.5), mid + (light - mid) * ((r - 0.5) / 0.5))
    base = np.array([9, 8, 8], np.float32); ox = np.array([74, 14, 12], np.float32)
    col = base + (ox - base) * (cloud * 0.95)[..., None]
    col = col * (1 - gold[..., None]) + g * gold[..., None]
    bump = 0.35 + 0.55 * gold + 0.25 * (gaussian_filter(Lc, 1.0) - gaussian_filter(Lc, 5)) * gold
    rough = 0.6 - 0.34 * gold; metal = 0.92 * gold
    save('dragon', col, bump, rough, metal)

# ------------------------------------------------------------------ MONOGRAM
def sparkle_poly(cx, cy, r):
    o = json.load(open(os.path.join(HERE, 'outline.json'))); th = np.array(o['theta']); rr = np.array(o['r'])
    return [(cx + r * ri * math.cos(t), cy - r * ri * math.sin(t)) for t, ri in zip(th[::4], rr[::4])]

def monogram():
    cols = 8; cw = W / cols; rows = 8; ch = H / rows
    S = 4; big = Image.new('L', (W * S // 2, H * S // 2), 0); d = ImageDraw.Draw(big); k = S / 2
    font = ImageFont.truetype('/System/Library/Fonts/Supplemental/Didot.ttc', int(ch * 0.62 * k), index=0)
    for row in range(-1, rows + 1):
        for c in range(cols):
            cx = (c + 0.5) * cw; cy = (row + 0.5) * ch + (ch / 2 if c % 2 else 0)
            if (row + c) % 2 == 0:   # the sparkle
                d.polygon([(x * k, y * k) for x, y in sparkle_poly(cx, cy, ch * 0.30)], fill=255)
            else:                    # the S
                bb = d.textbbox((0, 0), 'S', font=font); tw, th_ = bb[2] - bb[0], bb[3] - bb[1]
                d.text((cx * k - tw / 2 - bb[0], cy * k - th_ / 2 - bb[1]), 'S', font=font, fill=255)
    m = np.array(big.resize((W, H), Image.LANCZOS)).astype(np.float32) / 255.0
    edge = gaussian_filter(m, 2.2)
    grain = noise(3, 21) * 0.5 + noise(6, 22) * 0.5
    # tone on tone: the colour barely moves; the pattern shows in the shine and the relief
    base = 11 + 2.2 * (grain - 0.5); col = base + 5.5 * m + 6 * (gaussian_filter(m, 3) - gaussian_filter(m, 1)) * 0
    albedo = np.stack([col, col, col * 1.02], -1)
    bump = 0.5 + 0.30 * edge + 0.10 * (grain - 0.5)
    rough = 0.66 - 0.36 * edge + 0.06 * (grain - 0.5); metal = np.zeros((H, W))
    save('monogram', albedo, bump, rough, metal)

# ------------------------------------------------------------------ KINTSUGI
def worley_edge(n, seed, warp, wscale, amp):
    """F2 - F1 of a tileable (in x) Worley field on a warped grid: ~0 along cell borders"""
    r = np.random.default_rng(seed); pts = r.random((n, 2)) * np.array([W, H])
    allp = np.concatenate([pts + np.array([dx, 0]) for dx in (-W, 0, W)]); tree = cKDTree(allp)
    yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
    wx = (noise(wscale, seed + 1) - 0.5) * 2 * amp; wy = (noise(wscale, seed + 2) - 0.5) * 2 * amp
    wx += (noise(wscale / 4, seed + 3) - 0.5) * 2 * amp * 0.25; wy += (noise(wscale / 4, seed + 4) - 0.5) * 2 * amp * 0.25
    q = np.stack([(xx + wx).ravel(), (yy + wy).ravel()], -1); d, _ = tree.query(q, k=2)
    return (d[:, 1] - d[:, 0]).reshape(H, W).astype(np.float32)

def kintsugi():
    e1 = worley_edge(30, 3, 1, 170, 120)
    e2 = worley_edge(170, 5, 1, 90, 60); e3 = worley_edge(520, 9, 1, 60, 30)
    m2 = smooth(0.55, 0.75, noise(260, 31)); m3 = smooth(0.66, 0.82, noise(180, 32))
    w1 = 4.5 + 6.5 * noise(140, 41)                                      # main veins: 4.5-11 px, swelling and thinning
    w2 = (1.6 + 2.6 * noise(90, 42)) * m2; w3 = (0.9 + 1.0 * noise(60, 43)) * m3
    c1 = 1 - smooth(w1 * 0.35, w1, e1); c2 = (1 - smooth(w2 * 0.35, np.maximum(w2, 0.01), e2)) * (m2 > 0.02); c3 = (1 - smooth(w3 * 0.35, np.maximum(w3, 0.01), e3)) * (m3 > 0.02)
    crack = np.clip(np.maximum(np.maximum(c1, c2 * 0.9), c3 * 0.8), 0, 1)
    edge = gaussian_filter(crack, 1.6)
    grain = noise(3, 51) * 0.5 + noise(7, 52) * 0.5; pebble = noise(14, 53)
    leather = 10 + 4 * (grain - 0.5) + 3 * (pebble - 0.5)
    sp = noise(11, 61) * 0.6 + noise(34, 62) * 0.4                       # gold flecks: some bright, some deep
    gold = np.array([206, 166, 88], np.float32) * (0.62 + 0.62 * sp[..., None]) + np.array([30, 24, 10], np.float32)
    halo = smooth(0.0, 1.0, gaussian_filter(crack, 5)) * (1 - crack)     # a faint warm glow just outside the vein
    col = np.stack([leather, leather, leather * 1.03], -1) + np.array([26, 15, 4], np.float32) * halo[..., None] * 0.5
    col = col * (1 - crack[..., None]) + gold * crack[..., None]
    bump = 0.55 - 0.30 * edge + 0.10 * (grain - 0.5) + 0.05 * (pebble - 0.5)
    rough = 0.50 + 0.08 * (grain - 0.5) - 0.24 * crack; metal = 1.0 * crack
    save('kintsugi', col, bump, rough, metal)

if __name__ == '__main__':
    which = sys.argv[1:] or ['koi', 'dragon', 'monogram', 'kintsugi']
    for w in which: globals()[w]()
