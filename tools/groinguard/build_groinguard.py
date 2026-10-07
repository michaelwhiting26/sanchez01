"""Builds the original Sanchez leather groin guard for the web customiser, entirely from maths (no imported or downloaded meshes).
Run headless from the repo root:

    /Applications/Blender.app/Contents/MacOS/Blender -b -P tools/groinguard/build_groinguard.py -- --out apps/web/public/assets --reports "<folder for preview PNGs>"

Writes (under --out):
    groinguard/groinguard.glb       the guard, eleven named meshes, two UV sets (decal + atlas), grey materials
    groinguard/groinguard-ao.webp   ambient occlusion baked in Cycles on the atlas UV set (linear data, greyscale stored as RGB)
    groinguard/groinguard.json      bounds, panel centroids / normals / decal sizes, atlasTilesPerUnit
    store/groin-guard.glb           light display copy for the shop wall (plain colours, no textures)
and, under --reports, the preview renders. The leather grain normal map is shared with the glove (gloves/leather-grain-normal.webp under
--out); it is only read here, for the preview renders. Optional flags: --quick (coarse mesh, no bake, small clay previews; for shaping
work only), --bake-samples N, --bake-size N, --no-renders, --wall-only (rebuild just the shop-wall copy and re-run the checks).

All geometry is written in the web scene's axes (three.js / glTF: x right, y up, z towards the viewer) and converted to Blender's on the
way in. The guard stands upright as worn: cup tip at y = 0, front facing +z, `_R` parts on +x.

How it is made: the outer skin is one lofted surface (horizontal rings found by ray-marching a smooth union of two solids: the waist
"barrel" and the cup). The edge of the leather and the panels are cut out of it along smooth curves by splitting triangles exactly where
a seam function crosses zero (never along the jagged edges of existing faces). The skin is then quilted (pulled down at the seams, plump
between them), given a wall thickness, a lining, a bound top edge and a turned lower edge, and the elastic belt, closure flap, leg straps,
buckles and stitch rows are built on top of it.
"""
import bpy, sys, os, math, json, time
import numpy as np
from mathutils import Vector
from mathutils.bvhtree import BVHTree
from mathutils.kdtree import KDTree

argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []


def arg(name, default=None):
    return argv[argv.index(name) + 1] if name in argv else default


OUT = arg("--out", ".")
REPORTS = arg("--reports")
QUICK = "--quick" in argv
NO_RENDERS = "--no-renders" in argv
WALL_ONLY = "--wall-only" in argv
BAKE_SIZE = int(arg("--bake-size", 2048))
BAKE_SAMPLES = int(arg("--bake-samples", 384))
GRAIN_TILE_M = 0.04  # one tile of the grain covers 4 cm of leather

PANELS = ["WAIST_FRONT", "CUP", "HIP_L", "HIP_R", "WAIST_BACK"]
LEATHER = PANELS + ["FLAP", "LINING", "BINDING"]
OTHERS = ["ELASTIC", "STITCHING", "BUCKLES"]
NAMES = LEATHER + OTHERS

FULL = dict(edge=0.0048, roll_k=5, stitch="prism", pitch=0.0048, step=0.006, belt_prof=4, frame_sides=6, uv=True)
LIGHT = dict(edge=0.0108, roll_k=2, stitch="quad", pitch=0.0085, step=0.010, belt_prof=1, frame_sides=4, uv=False)
if QUICK:
    FULL = dict(FULL, edge=0.0052, uv=False)

# ------------------------------------------------------------------------------------------------------------------------------------
# small maths helpers (same toolkit as tools/gloves/build_glove.py)
# ------------------------------------------------------------------------------------------------------------------------------------


def unit(v):
    v = np.asarray(v, float)
    return v / (np.linalg.norm(v, axis=-1, keepdims=True) + 1e-20)


def nspline(xs, ys):
    """Natural cubic spline through (xs, ys); ys may be vectors. Clamped outside the range."""
    xs = np.asarray(xs, float)
    ys = np.asarray(ys, float)
    n = len(xs)
    h = np.diff(xs)
    hh = h.reshape((-1,) + (1,) * (ys.ndim - 1))
    A = np.zeros((n, n))
    r = np.zeros_like(ys)
    A[0, 0] = A[-1, -1] = 1
    for i in range(1, n - 1):
        A[i, i - 1], A[i, i], A[i, i + 1] = h[i - 1], 2 * (h[i - 1] + h[i]), h[i]
        r[i] = 3 * ((ys[i + 1] - ys[i]) / h[i] - (ys[i] - ys[i - 1]) / h[i - 1])
    c = np.linalg.solve(A, r)
    b = (ys[1:] - ys[:-1]) / hh - hh * (2 * c[:-1] + c[1:]) / 3
    d = (c[1:] - c[:-1]) / (3 * hh)

    def f(x):
        x = np.clip(np.asarray(x, float), xs[0], xs[-1])
        i = np.clip(np.searchsorted(xs, x, side="right") - 1, 0, n - 2)
        t = (x - xs[i]).reshape(x.shape + (1,) * (ys.ndim - 1))
        return ys[i] + b[i] * t + c[i] * t * t + d[i] * t ** 3

    return f


def smoothstep(a, b, x):
    t = np.clip((np.asarray(x, float) - a) / (b - a), 0, 1)
    return t * t * (3 - 2 * t)


def smin(a, b, k):
    h = np.maximum(k - np.abs(a - b), 0) / k
    return np.minimum(a, b) - h * h * k * 0.25


def polyline_resample(P, step=None, n=None, closed=False, extra=()):
    """Resample a polyline at even arc length. `extra` = other per-point arrays to carry along. Returns (P, extras..., arc)."""
    P = np.asarray(P, float)
    Q = np.vstack([P, P[:1]]) if closed else P
    seg = np.linalg.norm(np.diff(Q, axis=0), axis=1)
    arc = np.r_[0, np.cumsum(seg)]
    total = arc[-1]
    if n is None:
        n = max(3, int(round(total / step)) + (0 if closed else 1))
    t = np.linspace(0, total, n, endpoint=not closed)
    out = [np.stack([np.interp(t, arc, Q[:, k]) for k in range(3)], 1)]
    for e in extra:
        e = np.asarray(e, float)
        E = np.vstack([e, e[:1]]) if closed else e
        out.append(np.stack([np.interp(t, arc, E[:, k]) for k in range(E.shape[1])], 1))
    return (*out, t, total)


def smooth_line(P, closed, it=2):
    P = P.copy()
    for _ in range(it):
        if closed:
            P = 0.5 * P + 0.25 * (np.roll(P, 1, 0) + np.roll(P, -1, 0))
        else:
            P[1:-1] = 0.5 * P[1:-1] + 0.25 * (P[:-2] + P[2:])
    return P


def catmull(P, per=12):
    """Uniform Catmull-Rom through the points (open)."""
    P = np.asarray(P, float)
    Q = np.vstack([2 * P[0] - P[1], P, 2 * P[-1] - P[-2]])
    out = []
    t = np.linspace(0, 1, per, endpoint=False)[:, None]
    for i in range(len(P) - 1):
        p0, p1, p2, p3 = Q[i], Q[i + 1], Q[i + 2], Q[i + 3]
        out.append(0.5 * ((2 * p1) + (-p0 + p2) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t * t + (-p0 + 3 * p1 - 3 * p2 + p3) * t ** 3))
    out.append(P[-1:])
    return np.vstack(out)


def vnormals(V, F):
    fn = np.cross(V[F[:, 1]] - V[F[:, 0]], V[F[:, 2]] - V[F[:, 0]])
    n = np.zeros_like(V)
    for k in range(3):
        np.add.at(n, F[:, k], fn)
    return unit(n)


def edge_faces(F, n):
    """Unique edges with the (up to two) faces on each: E (k,2), fa, fb (fb = -1 on a border)."""
    e = np.concatenate([F[:, [0, 1]], F[:, [1, 2]], F[:, [2, 0]]])
    fi = np.tile(np.arange(len(F)), 3)
    es = np.sort(e, 1)
    key = es[:, 0].astype(np.int64) * n + es[:, 1]
    order = np.argsort(key, kind="stable")
    ks, fo = key[order], fi[order]
    first = np.flatnonzero(np.r_[True, ks[1:] != ks[:-1]])
    cnt = np.diff(np.r_[first, len(ks)])
    E = np.stack([ks[first] // n, ks[first] % n], 1)
    fb = np.where(cnt > 1, fo[np.minimum(first + 1, len(ks) - 1)], -1)
    return E, fo[first], fb


def chains(edges):
    """Join loose edges into ordered vertex chains. Returns [(vertex list, closed)]; chains break at junctions."""
    adj = {}
    for a, b in edges:
        adj.setdefault(int(a), []).append(int(b))
        adj.setdefault(int(b), []).append(int(a))
    used = set()
    out = []

    def walk(a, b):
        path = [a, b]
        used.add((min(a, b), max(a, b)))
        while len(adj[path[-1]]) == 2 and path[-1] != path[0]:
            nxt = [v for v in adj[path[-1]] if v != path[-2]]
            if not nxt:
                break
            k = (min(path[-1], nxt[0]), max(path[-1], nxt[0]))
            if k in used:
                break
            used.add(k)
            path.append(nxt[0])
        return path

    for v in sorted(adj):
        if len(adj[v]) != 2:
            for w in adj[v]:
                if (min(v, w), max(v, w)) not in used:
                    out.append((walk(v, w), False))
    for v in sorted(adj):
        for w in adj[v]:
            if (min(v, w), max(v, w)) not in used:
                p = walk(v, w)
                closed = p[0] == p[-1]
                out.append((p[:-1] if closed else p, closed))
    return out


# ------------------------------------------------------------------------------------------------------------------------------------
# triangle mesh with per-vertex attributes, and the seam cutter
# ------------------------------------------------------------------------------------------------------------------------------------


class Mesh:
    def __init__(self, V, F, A):
        self.V, self.F, self.A = V, F, A
        self.lock = np.zeros(len(V), bool)  # vertices already sitting on a seam (the cutter will not slide them off it)

    def face_mean(self, name):
        return self.A[name][self.F].mean(1)


def cut(m, name, iso=0.0, snap=0.24):
    """Split triangles along the line where attribute `name` equals `iso`, so the line becomes a clean chain of edges.
    Vertices that are already close to the line slide onto it along their edge (unless locked on an earlier seam) to avoid slivers."""
    V, F, A = m.V, m.F, m.A
    f = A[name] - iso
    f[np.abs(f) < 1e-9] = 0.0
    n = len(V)
    e = np.sort(np.concatenate([F[:, [0, 1]], F[:, [1, 2]], F[:, [2, 0]]]), 1)
    uk = np.unique(e[:, 0].astype(np.int64) * n + e[:, 1])
    E = np.stack([uk // n, uk % n], 1)
    f0, f1 = f[E[:, 0]], f[E[:, 1]]
    cr = f0 * f1 < 0
    Ec, t = E[cr], f0[cr] / (f0[cr] - f1[cr])
    cv = np.r_[Ec[:, 0], Ec[:, 1]]
    co = np.r_[Ec[:, 1], Ec[:, 0]]
    ct = np.r_[t, 1 - t]
    ok = (ct < snap) & ~m.lock[cv]
    cv, co, ct = cv[ok], co[ok], ct[ok]
    order = np.argsort(ct, kind="stable")
    cv, co, ct = cv[order], co[order], ct[order]
    cv, first = np.unique(cv, return_index=True)
    co, ct = co[first], ct[first]
    newV = V[cv] + (V[co] - V[cv]) * ct[:, None]
    newA = {k: a[cv] + (a[co] - a[cv]) * ct for k, a in A.items()}
    V[cv] = newV
    for k in A:
        A[k][cv] = newA[k]
    A[name][cv] = iso
    f[cv] = 0.0
    m.lock[cv] = True
    m.lock[f == 0.0] = True
    # split what still crosses
    f0, f1 = f[E[:, 0]], f[E[:, 1]]
    cr = f0 * f1 < 0
    Ec, t = E[cr], (f0[cr] / (f0[cr] - f1[cr]))
    ck = uk[cr]
    base = n
    m.V = V = np.vstack([V, V[Ec[:, 0]] + (V[Ec[:, 1]] - V[Ec[:, 0]]) * t[:, None]])
    for k in A:
        A[k] = np.r_[A[k], A[k][Ec[:, 0]] + (A[k][Ec[:, 1]] - A[k][Ec[:, 0]]) * t]
    A[name][base:] = iso
    m.lock = np.r_[m.lock, np.ones(len(Ec), bool)]

    def cross_id(a, b):
        lo, hi = np.minimum(a, b), np.maximum(a, b)
        key = lo.astype(np.int64) * n + hi
        pos = np.searchsorted(ck, key)
        pos = np.minimum(pos, max(len(ck) - 1, 0))
        hit = (ck[pos] == key) if len(ck) else np.zeros(len(key), bool)
        return np.where(hit, base + pos, -1)

    c01, c12, c20 = cross_id(F[:, 0], F[:, 1]), cross_id(F[:, 1], F[:, 2]), cross_id(F[:, 2], F[:, 0])
    nc = (c01 >= 0).astype(int) + (c12 >= 0) + (c20 >= 0)
    out = [F[nc == 0]]
    # two crossed edges: apex a is the vertex between them
    for mask, (ia, ib, ic), p, q in (
        ((nc == 2) & (c12 < 0), (0, 1, 2), c01, c20),
        ((nc == 2) & (c20 < 0), (1, 2, 0), c12, c01),
        ((nc == 2) & (c01 < 0), (2, 0, 1), c20, c12),
    ):
        a, b, c, p, q = F[mask, ia], F[mask, ib], F[mask, ic], p[mask], q[mask]
        out.append(np.stack([a, p, q], 1))
        short = np.linalg.norm(V[p] - V[c], axis=1) <= np.linalg.norm(V[b] - V[q], axis=1)
        out.append(np.where(short[:, None], np.stack([p, b, c], 1), np.stack([p, b, q], 1)))
        out.append(np.where(short[:, None], np.stack([p, c, q], 1), np.stack([b, c, q], 1)))
    # one crossed edge (the opposite vertex is exactly on the line)
    for mask, (ia, ib, ic), p in (((nc == 1) & (c12 >= 0), (0, 1, 2), c12), ((nc == 1) & (c20 >= 0), (1, 2, 0), c20), ((nc == 1) & (c01 >= 0), (2, 0, 1), c01)):
        a, b, c, p = F[mask, ia], F[mask, ib], F[mask, ic], p[mask]
        out.append(np.stack([a, b, p], 1))
        out.append(np.stack([a, p, c], 1))
    m.F = np.vstack(out)
    # drop triangles squashed flat by sliding
    Fm = m.F
    ok = (Fm[:, 0] != Fm[:, 1]) & (Fm[:, 1] != Fm[:, 2]) & (Fm[:, 2] != Fm[:, 0])
    m.F = Fm[ok]


def submesh(F, mask):
    """Faces under `mask`, re-indexed. Returns (vertex ids used, new faces)."""
    Fs = F[mask]
    used, inv = np.unique(Fs, return_inverse=True)
    return used, inv.reshape(Fs.shape)


# ------------------------------------------------------------------------------------------------------------------------------------
# swept pieces and the accumulator for meshes made of many islands
# ------------------------------------------------------------------------------------------------------------------------------------


class Soup:
    """Collects pieces of one mesh. Each piece carries normals, atlas UVs in metres and its own island id."""

    def __init__(self):
        self.V, self.F, self.N, self.UV, self.ISL = [], [], [], [], []
        self.nv = 0
        self.nisl = 0

    def add(self, V, F, N=None, uvm=None):
        V = np.asarray(V, float)
        F = np.asarray(F, int)
        self.V.append(V)
        self.F.append(F + self.nv)
        self.N.append(vnormals(V, F) if N is None else N)
        self.UV.append(np.zeros((len(V), 2)) if uvm is None else uvm)
        self.ISL.append(np.full(len(V), self.nisl))
        self.nv += len(V)
        self.nisl += 1

    def part(self):
        return dict(V=np.vstack(self.V), F=np.vstack(self.F), N=np.vstack(self.N), uvm=np.vstack(self.UV), isl=np.concatenate(self.ISL))


def sweep(P, Nn, prof, closed=False, scale=None, lift=None, caps=True):
    """Sweep a closed 2D profile (q, 2) [x across, y along the surface normal] along path P with surface normals Nn.
    Returns V, F, N, uv (metres: along, around). The profile seam and (for closed paths) the path seam get duplicate vertices."""
    P = np.asarray(P, float)
    k = len(P)
    if closed:
        T = unit(np.roll(P, -1, 0) - np.roll(P, 1, 0))
    else:
        T = unit(np.gradient(P, axis=0))
    n = unit(Nn - (Nn * T).sum(1, keepdims=True) * T)
    e = np.cross(T, n)
    if closed:
        P, n, e = np.vstack([P, P[:1]]), np.vstack([n, n[:1]]), np.vstack([e, e[:1]])
        if scale is not None:
            scale = np.r_[scale, scale[:1]]
        if lift is not None:
            lift = np.r_[lift, lift[:1]]
        k += 1
    q = len(prof)
    pr = np.vstack([prof, prof[:1]])
    tang = unit(np.roll(prof, -1, 0) - np.roll(prof, 1, 0))
    pn = np.stack([tang[:, 1], -tang[:, 0]], 1)
    pn = np.vstack([pn, pn[:1]])
    sc = np.ones(k) if scale is None else scale
    lf = np.zeros(k) if lift is None else lift
    V = P[:, None, :] + e[:, None, :] * (pr[None, :, 0:1] * sc[:, None, None]) + n[:, None, :] * (pr[None, :, 1:2] * sc[:, None, None] + lf[:, None, None])
    Nv = unit(e[:, None, :] * pn[None, :, 0:1] + n[:, None, :] * pn[None, :, 1:2])
    arc = np.r_[0, np.cumsum(np.linalg.norm(np.diff(P, axis=0), axis=1))]
    around = np.r_[0, np.cumsum(np.linalg.norm(np.diff(pr, axis=0), axis=1))]
    uv = np.stack(np.broadcast_arrays(arc[:, None], around[None, :]), -1)
    idx = np.arange(k * (q + 1)).reshape(k, q + 1)
    a, b, c, d = idx[:-1, :-1], idx[1:, :-1], idx[1:, 1:], idx[:-1, 1:]
    F = np.vstack([np.stack([a, b, c], -1).reshape(-1, 3), np.stack([a, c, d], -1).reshape(-1, 3)])
    V, Nv, uv = V.reshape(-1, 3), Nv.reshape(-1, 3), uv.reshape(-1, 2)
    if caps and not closed:
        for row, tdir, flip in ((0, -T[0], True), (k - 1, T[-1], False)):
            ci = len(V)
            V = np.vstack([V, V[idx[row, :-1]].mean(0)[None]])
            Nv = np.vstack([Nv, tdir[None]])
            uv = np.vstack([uv, uv[idx[row, 0]][None]])
            r0, r1 = idx[row, :-1], idx[row, 1:]
            F = np.vstack([F, np.stack([r1, r0, np.full(q, ci)], 1) if not flip else np.stack([r0, r1, np.full(q, ci)], 1)])
    return V, F, Nv, uv


def circle_prof(r, sides, flat=1.0):
    a = np.linspace(0, 2 * np.pi, sides, endpoint=False) - np.pi / 2  # seam underneath
    return np.stack([r * np.cos(a), r * flat * np.sin(a)], 1)



def smax(a, b, k):
    return -smin(-a, -b, k)


def sgnpow(u, e):
    return np.sign(u) * np.abs(u) ** e


def rounded_poly(pts, r, k):
    """Closed 2D polygon with its corners rounded to radius r (k segments per corner). Keeps the winding of `pts`."""
    pts = np.asarray(pts, float)
    n = len(pts)
    out = []
    for i in range(n):
        p0, p1, p2 = pts[i - 1], pts[i], pts[(i + 1) % n]
        d0, d1 = unit(p0 - p1), unit(p2 - p1)
        half = math.acos(float(np.clip(d0 @ d1, -1, 1))) / 2
        c = p1 + unit(d0 + d1) * (r / math.sin(half))
        a, b = p1 + d0 * (r / math.tan(half)), p1 + d1 * (r / math.tan(half))
        a0 = math.atan2(a[1] - c[1], a[0] - c[0])
        a1 = math.atan2(b[1] - c[1], b[0] - c[0])
        da = (a1 - a0 + math.pi) % (2 * math.pi) - math.pi
        for j in range(k + 1):
            ang = a0 + da * j / k
            out.append(c + r * np.array([math.cos(ang), math.sin(ang)]))
    return np.array(out)


# ------------------------------------------------------------------------------------------------------------------------------------
# the shape: a waist "barrel" and a cup, joined as one smooth solid, sliced into horizontal rings
# ------------------------------------------------------------------------------------------------------------------------------------

YT = 0.306  # the loft starts a little above the top edge
Y_J = 0.085  # height at which the lower edge of the hip wings meets the side of the cup
Y_Q0 = 0.068  # the barrel has shrunk away to nothing by this height (everything of it below Y_J is cut off anyway)
NB = 2.5  # squareness of the waist in plan (2 = ellipse)
_YK = [0.0, 0.085, 0.11, 0.15, 0.19, 0.25, 0.30, 0.32]
_BW = nspline(_YK, [0.1560, 0.1560, 0.1625, 0.1650, 0.1635, 0.1560, 0.1480, 0.1450])  # half width of the barrel
_BD = nspline(_YK, [0.0884, 0.0884, 0.0945, 0.0980, 0.0980, 0.0955, 0.0910, 0.0890])  # half depth of the barrel
CUP_YM, CUP_HU, CUP_HD = 0.100, 0.062, 0.100  # widest height of the cup, and how far it reaches above / below that
CUP_A, CUP_C, CUP_ZC = 0.070, 0.042, 0.092  # half width, half depth, z of its middle
K_UNION = 0.010  # fillet where the cup meets the barrel
TH_F = math.radians(72)  # the front waist band runs this far round each side
TH_B = math.radians(118)  # the rear band starts here
R_ARC = 0.16  # metres per radian round the waist (only used to give seam functions sensible units)
BIND_W = 0.0100  # width of the binding band on the outside
BIND_H = 0.0009  # how far the binding stands proud of the leather
WALL = 0.0115  # thickness of the padded shell
GROOVE, GROOVE_W = 0.0021, 0.0046  # how deep and how wide the seams pull into the padding
PUFF_W = 0.012
Y_E, BELT_W, BELT_T = 0.228, 0.050, 0.0018  # elastic belt: height of its middle, width, thickness
STRAP_W, STRAP_T = 0.025, 0.0016
FLAP_W, FLAP_H, FLAP_RC, FLAP_RE = 0.118, 0.082, 0.009, 0.006  # closure flap: size, corner radius, width of its rolled edge
FLAP_RIM, FLAP_TOP = 0.0010, 0.0082  # how far its edge / its face stand off the bare barrel

WF, CU, HL, HR, WB, BI, LIN = 0, 1, 2, 3, 4, 7, 8
CODE = dict(WAIST_FRONT=WF, CUP=CU, HIP_L=HL, HIP_R=HR, WAIST_BACK=WB)
PUFF = {WF: 0.0022, CU: 0.0025, HL: 0.0035, HR: 0.0035, WB: 0.0020}  # how far each panel's padding swells between its seams


def f_parts(x, y, z):
    """The two solids as rough signed distances (negative inside): the waist barrel and the cup."""
    yj = np.maximum(y, Y_J)
    q = smoothstep(Y_Q0, Y_J, y)
    w0, d0 = _BW(yj), _BD(yj)
    front = np.where(y >= Y_J, d0, d0 - 1.6 * (Y_J - y))  # below the wings the barrel draws back behind the rim of the cup
    w, d = np.maximum(w0 * q, 1e-5), np.maximum(d0 * q, 1e-5)
    rb = (np.abs(x / w) ** NB + np.abs((z - (front - d)) / d) ** NB) ** (1 / NB)
    fb = np.where(q < 0.02, 1.0, (rb - 1) * np.minimum(w, d))
    t = np.clip((CUP_YM - y) / CUP_HD, 0, 1.3)
    tau = np.where(y >= CUP_YM, (y - CUP_YM) / CUP_HU, (CUP_YM - y) / CUP_HD)
    a = CUP_A - 0.013 * t ** 1.5  # the cup narrows towards its tip
    zc = CUP_ZC - 0.030 * t ** 1.6  # ... and tucks back between the legs
    fc = (np.sqrt((x / a) ** 2 + tau ** 2 + ((z - zc) / CUP_C) ** 2) - 1) * 0.045
    return fb, fc


def ray_centre(y):
    """A point inside the solid at every height, to cast the rings' rays from."""
    return np.interp(y, [0, 0.03, 0.045, 0.068, 0.085, 0.10, 0.16, 0.31], [0.062, 0.075, 0.078, 0.062, 0.078, 0.068, 0.068, 0.02])


def body_ring(s, al):
    """Horizontal rings of the solid: s (m,) distance down from YT, al (K,) ray angles (0 = front, towards +x) -> (m, K, 3)."""
    s = np.atleast_1d(np.asarray(s, float))
    out = np.zeros((len(s), len(al), 3))
    dx, dz = np.sin(al)[None, :], np.cos(al)[None, :]
    for a0 in range(0, len(s), 96):
        y = (YT - s[a0:a0 + 96])[:, None]
        c = ray_centre(y)
        lo = np.zeros((y.shape[0], len(al)))
        hi = np.full_like(lo, 0.42)
        for _ in range(36):
            mid = (lo + hi) / 2
            fb, fc = f_parts(mid * dx, y, c + mid * dz)
            inside = smin(fb, fc, K_UNION) < 0
            lo = np.where(inside, mid, lo)
            hi = np.where(inside, hi, mid)
        r = (lo + hi) / 2
        out[a0:a0 + 96] = np.stack([r * dx, np.broadcast_to(y, r.shape), c + r * dz], -1)
    return out


def arc_resample(dense, nr):
    """Resample closed rings (m, K, 3) to nr points each, evenly by arc length, starting from their first point."""
    seg = np.linalg.norm(np.roll(dense, -1, axis=1) - dense, axis=2)
    circ = seg.sum(1)
    out = np.zeros((len(dense), nr, 3))
    for j in range(len(dense)):
        arc = np.r_[0, np.cumsum(seg[j])]
        t = np.arange(nr) * circ[j] / nr
        ring = np.vstack([dense[j], dense[j, :1]])
        for k in range(3):
            out[j, :, k] = np.interp(t, arc, ring[:, k])
    return out, circ


def loft_rings(ring_fn, length, edge):
    """Grid mesh of the lofted surface with even spacing, open at the top and closed by a pole at the cup's tip. Faces point outwards."""
    sd = np.linspace(0, length, int(length / 0.0004) + 1)
    coarse, _ = arc_resample(ring_fn(sd, np.linspace(0, 2 * np.pi, 720, endpoint=False)), 96)
    step = np.linalg.norm(np.diff(coarse, axis=0), axis=2).max(1)
    dist = np.r_[0, np.cumsum(step)]
    rad = np.linalg.norm(coarse - coarse.mean(1, keepdims=True), axis=2).max(1)
    nrow = int(dist[-1] / edge)
    rows = np.interp(np.arange(nrow + 1) * (dist[-1] / nrow), dist, sd)
    rows = rows[np.interp(rows, sd, rad) > 0.75 * edge]
    dense = ring_fn(rows, np.linspace(0, 2 * np.pi, 4096, endpoint=False))
    seg = np.linalg.norm(np.roll(dense, -1, axis=1) - dense, axis=2)
    nr = int(round(seg.sum(1).max() / edge / 2)) * 2
    V, _ = arc_resample(dense, nr)
    nrw = len(rows)
    idx = np.arange(nrw * nr).reshape(nrw, nr)
    a, b = idx[:-1, :], np.roll(idx[:-1, :], -1, 1)
    c, d = np.roll(idx[1:, :], -1, 1), idx[1:, :]
    F = [np.stack([a, c, b], -1).reshape(-1, 3), np.stack([a, d, c], -1).reshape(-1, 3)]
    nv = nrw * nr
    tip = ring_fn(np.array([length]), np.zeros(1))[0, 0]
    F.append(np.stack([np.roll(idx[-1], -1), idx[-1], np.full(nr, nv)], 1))
    return Mesh(np.vstack([V.reshape(-1, 3), tip[None]]), np.vstack(F), {})


def y_top(th):
    return 0.2925 + 0.0045 * np.cos(th)


_YBOT = nspline(np.radians([37, 50, 68, 90, 118, 150, 180, 210]), [0.085, 0.097, 0.119, 0.135, 0.149, 0.162, 0.166, 0.162])


def y_bot(th):
    """Height of the lower edge of the leather round the waist (th = angle round from the front, 0..pi)."""
    return _YBOT(np.maximum(th, math.radians(37)))


def z_rim(y):
    """The cup's open rim lies in this tilted plane."""
    return 0.0837 + 0.78 * (y - Y_J)


def y_ws(th):
    """Lower seam of the front waist band: lowest in the middle."""
    return 0.192 + 0.012 * np.minimum(th / TH_F, 1.2) ** 2.2


def body_surf(t, y):
    """Point and outward normal on the bare barrel (no cup, no quilting): t = ring parameter (0 front, pi back), y = height."""
    t, y = np.asarray(t, float), np.asarray(y, float)

    def P(t, y):
        return np.stack([_BW(y) * sgnpow(np.sin(t), 2 / NB), y + 0 * t, _BD(y) * sgnpow(np.cos(t), 2 / NB)], -1)

    return P(t, y), unit(np.cross(P(t + 1e-3, y) - P(t - 1e-3, y), P(t, y + 1e-3) - P(t, y - 1e-3)))


class RingTable:
    """Arc length round the barrel at one height, measured from the middle of the back towards -x."""

    def __init__(self, y):
        self.t = np.linspace(0.02, 2 * np.pi - 0.02, 24001)
        P, _ = body_surf(self.t, np.full_like(self.t, y))
        arc = np.r_[0, np.cumsum(np.linalg.norm(np.diff(P, axis=0), axis=1))]
        self.s = arc - np.interp(np.pi, self.t, arc)
        self.th = np.arctan2(P[:, 0], P[:, 2])

    def t_at_arc(self, s):
        return np.interp(s, self.s, self.t)

    def t_at_theta(self, th):  # th in (0, pi): the +x side
        half = self.t < np.pi
        return float(np.interp(th, self.th[half], self.t[half]))


def tube(soup, P, N, prof, per, lift=None, scale=None, closed=False):
    """Sweep `prof` along P in short pieces (each unrolls to a compact atlas island), with end caps on an open path."""
    n = len(P)
    lf = np.zeros(n) if lift is None else lift
    sc = np.ones(n) if scale is None else scale
    if closed:
        Vp, Fp, Np, uvp = sweep(P, N, prof, closed=True, scale=sc, lift=lf)
        soup.add(Vp, Fp, Np, uvp)
        return
    # tangents come from the whole curve so neighbouring pieces meet without a kink: sweep once, then split the result by rows
    Vp, Fp, Np, uvp = sweep(P, N, prof, closed=False, scale=sc, lift=lf, caps=False)
    q = len(prof) + 1
    for a in range(0, n - 1, per):
        b = min(a + per, n - 1)
        if n - 1 - b < 3:
            b = n - 1
        rows = np.arange(a, b + 1)
        vid = (rows[:, None] * q + np.arange(q)[None, :]).ravel()
        k = len(rows)
        idx = np.arange(k * q).reshape(k, q)
        aa, bb, cc, dd = idx[:-1, :-1], idx[1:, :-1], idx[1:, 1:], idx[:-1, 1:]
        F = np.vstack([np.stack([aa, bb, cc], -1).reshape(-1, 3), np.stack([aa, cc, dd], -1).reshape(-1, 3)])
        soup.add(Vp[vid], F, Np[vid], uvp[vid])
        if b == n - 1:
            break
    for end, other in ((0, 1), (n - 1, n - 2)):
        tdir = unit(P[end] - P[other])
        ring = Vp[end * q:end * q + q - 1]
        Vc = np.vstack([ring, ring.mean(0)[None]])
        i = np.arange(q - 1)
        F = np.stack([i, (i + 1) % (q - 1), np.full(q - 1, q - 1)], 1)
        if np.cross(Vc[F[0, 1]] - Vc[F[0, 0]], Vc[F[0, 2]] - Vc[F[0, 0]]) @ tdir < 0:
            F = F[:, ::-1]
        soup.add(Vc, F, np.tile(tdir, (q, 1)), np.vstack([prof, prof.mean(0)[None]]))


def band_prof(width, thick, k):
    """Flat band profile with rounded edges, counter-clockwise: x across the band, y through its thickness."""
    hw, ht = width / 2, thick / 2
    ang = np.linspace(-np.pi / 2, np.pi / 2, k + 2)
    right = np.stack([hw - ht + ht * np.cos(ang), ht * np.sin(ang)], 1)
    left = np.stack([-(hw - ht) - ht * np.cos(ang), -ht * np.sin(ang)], 1)
    mid = np.array([[0.0, ht]])
    return np.vstack([right, mid, left, -mid])


def plate(soup, C, au, av, an, poly, th):
    """A flat plate: 2D outline `poly` (counter-clockwise in au, av) extruded by `th` along an."""
    k = len(poly)
    ring = C + poly[:, 0:1] * au + poly[:, 1:2] * av
    i = np.arange(k)
    for sgn in (1, -1):
        Vt = np.vstack([ring, ring.mean(0)[None]]) + an * (sgn * th / 2)
        F = np.stack([i, (i + 1) % k, np.full(k, k)], 1)
        soup.add(Vt, F if sgn > 0 else F[:, ::-1], np.tile(an * sgn, (k + 1, 1)), np.vstack([poly, poly.mean(0)[None]]))
    rr = np.vstack([ring, ring[:1]])
    Vs = np.vstack([rr + an * th / 2, rr - an * th / 2])
    j = np.arange(k)
    F = np.vstack([np.stack([j, j + k + 1, j + k + 2], 1), np.stack([j, j + k + 2, j + 1], 1)])
    per = np.r_[0, np.cumsum(np.linalg.norm(np.diff(np.vstack([poly, poly[:1]]), axis=0), axis=1))]
    soup.add(Vs, F, None, np.stack([np.r_[per, per], np.r_[np.zeros(k + 1), np.full(k + 1, th)]], 1))


def buckle(soup, C, au, av, an, D):
    """A plastic slide buckle: a rounded rectangular frame with a middle bar. au = across the strap, av = along it."""
    a, b = STRAP_W / 2 + 0.0042, 0.0115
    path = rounded_poly([(-a, -b), (a, -b), (a, b), (-a, b)], 0.0034, 3)
    path = polyline_resample(np.c_[path, np.zeros(len(path))], step=0.0026 if D["frame_sides"] > 4 else 0.006, closed=True)[0][:, :2]
    P = C + path[:, 0:1] * au + path[:, 1:2] * av
    prof = circle_prof(0.00175, D["frame_sides"], flat=0.78)
    Vp, Fp, Np, uvp = sweep(P, np.tile(an, (len(P), 1)), prof, closed=True)
    soup.add(Vp, Fp, Np, uvp)
    bar = C + np.linspace(-a, a, 5)[:, None] * au + an * 0.0011
    tube(soup, bar, np.tile(an, (5, 1)), prof, 99)


def stitch_mesh(dashes, D):
    """One small raised thread per dash (l0, l1, surface normal)."""
    st = Soup()
    if not dashes:
        return st
    P0 = np.array([d[0] for d in dashes])
    P1 = np.array([d[1] for d in dashes])
    Nn = unit(np.array([d[2] for d in dashes]))
    Tn = unit(P1 - P0)
    Nn = unit(Nn - (Nn * Tn).sum(1, keepdims=True) * Tn)
    Sd = unit(np.cross(Tn, Nn))
    nd = len(dashes)
    ln = np.linalg.norm(P1 - P0, axis=1)
    if D["stitch"] == "prism":
        px = np.array([-0.00060, -0.00032, 0.00032, 0.00060])
        py = np.array([-0.00015, 0.00045, 0.00045, -0.00015])
        ends = np.stack([P0 - Tn * 0.0002, P1 + Tn * 0.0002], 1)
        Vd = (ends[:, :, None, :] + Sd[:, None, None, :] * px[None, None, :, None] + Nn[:, None, None, :] * py[None, None, :, None]).reshape(nd, 8, 3)
        Fd = np.array([[0, 4, 5], [0, 5, 1], [1, 5, 6], [1, 6, 2], [2, 6, 7], [2, 7, 3], [0, 1, 2], [0, 2, 3], [4, 6, 5], [4, 7, 6]])
        vv = np.array([0, 0.0007, 0.0013, 0.0020])
        cell_w, cell_h = 0.0032 + 0.0012, 0.0020 + 0.0012
        ncol = max(1, int(math.sqrt(nd * cell_h / cell_w)))
        gi = np.arange(nd)
        ox, oy = (gi % ncol) * cell_w, (gi // ncol) * cell_h
        uu = np.stack([np.zeros(nd), np.minimum(ln + 0.0004, 0.0032)], 1)
        uvd = np.stack([np.repeat(uu, 4, 1) + ox[:, None], np.tile(vv, 2)[None, :] + oy[:, None]], -1)
        Fall = (Fd[None] + (np.arange(nd) * 8)[:, None, None]).reshape(-1, 3)
        Vall = Vd.reshape(-1, 3)
        fn0 = np.cross(Vall[Fall[2, 1]] - Vall[Fall[2, 0]], Vall[Fall[2, 2]] - Vall[Fall[2, 0]])
        if fn0 @ Nn[0] < 0:
            Fall = Fall[:, ::-1]
        st.add(Vall, Fall, None, uvd.reshape(-1, 2))
    else:
        hw = 0.0008
        Vd = np.stack([P0 - Sd * hw, P0 + Sd * hw, P1 + Sd * hw, P1 - Sd * hw], 1) + Nn[:, None, :] * 0.0005
        Fd = np.array([[0, 1, 2], [0, 2, 3]])
        Fall = (Fd[None] + (np.arange(nd) * 4)[:, None, None]).reshape(-1, 3)
        Vall = Vd.reshape(-1, 3)
        fn0 = np.cross(Vall[Fall[0, 1]] - Vall[Fall[0, 0]], Vall[Fall[0, 2]] - Vall[Fall[0, 0]])
        if fn0 @ Nn[0] < 0:
            Fall = Fall[:, ::-1]
        st.add(Vall, Fall, np.repeat(Nn, 4, 0), None)
    return st


def dash_points(Q, closed, pitch, dash=0.0028):
    """Start / end points of evenly pitched dashes along polyline Q."""
    Q, arc, total = polyline_resample(Q, step=0.0006, closed=closed)
    if closed:
        Q, arc = np.vstack([Q, Q[:1]]), np.r_[arc, total]
    nd = int(total / pitch)
    pitch = total / max(nd, 1) if closed else pitch
    a0 = np.arange(nd) * pitch + (0.0008 if not closed else 0.0) + (0 if closed else (total - nd * pitch) / 2)
    a0 = a0[a0 + dash <= total + 1e-9]
    p0 = np.stack([np.interp(a0, arc, Q[:, c]) for c in range(3)], 1)
    p1 = np.stack([np.interp(a0 + dash, arc, Q[:, c]) for c in range(3)], 1)
    return p0, p1


# ------------------------------------------------------------------------------------------------------------------------------------
# the guard
# ------------------------------------------------------------------------------------------------------------------------------------


def build(D):
    t0 = time.time()
    edge = D["edge"]
    parts = {}
    body = loft_rings(body_ring, YT, edge)
    x, y, z = body.V[:, 0].copy(), body.V[:, 1].copy(), body.V[:, 2].copy()
    th = np.abs(np.arctan2(x, z))  # angle round from the front
    fb, fc = f_parts(x, y, z)
    A = body.A
    A["x"], A["y"], A["th"] = x, y, th
    A["m"] = y_top(th) - y  # distance down from the top edge
    # edge of the leather: above the lower edge of the wings / rear band, or on the cup in front of its rim
    A["g"] = smin(y_bot(th) - y, np.maximum(z_rim(y) - z, y - (Y_J + 0.004)), 0.010)
    A["fwf"] = smax((th - TH_F) * R_ARC, y_ws(th) - y, 0.022)  # front waist band (negative inside), rounded lower corners
    A["fwb"] = (TH_B - th) * R_ARC  # rear band
    A["fcs"] = fb - fc  # positive on the cup: the seam runs along the crease where the cup leaves the barrel
    print("loft", round(time.time() - t0, 1), "s; verts", len(body.V), "tris", len(body.F))
    cut(body, "x")
    cut(body, "m", 0.0)
    if D["stitch"] == "prism":
        cut(body, "m", BIND_W - 0.0012)
    cut(body, "m", BIND_W)
    for name in ("g", "fwf", "fwb", "fcs"):
        cut(body, name)
    V, F, A = body.V, body.F, body.A
    n = len(V)
    fm = {k: body.face_mean(k) for k in ("x", "m", "g", "fwf", "fwb", "fcs")}
    base = np.where(fm["x"] > 0, HR, HL)
    base = np.where(fm["fcs"] > 0, CU, base)
    base = np.where(fm["fwb"] < 0, WB, base)
    base = np.where(fm["fwf"] < 0, WF, base)
    pid = np.where(fm["m"] < BIND_W, BI, base)
    keep = (fm["m"] > 0) & (fm["g"] < 0)
    N0 = vnormals(V, F)
    Fk, pk, bk = F[keep], pid[keep], base[keep]
    comp = components(Fk, n)
    roots, counts = np.unique(comp[Fk[:, 0]], return_counts=True)
    assert len(roots) == 1, "the leather is in %d pieces (face counts %s)" % (len(roots), sorted(counts)[::-1][:6])

    # ---- seams, quilting, wall thickness -------------------------------------------------------------------------------------
    E, fa, fb_ = edge_faces(Fk, n)
    inner = fb_ >= 0
    pa, pb = pk[fa], pk[np.maximum(fb_, 0)]
    on0 = np.abs(V[:, 0]) < 1e-9
    seam = inner & (pa != pb) & (pa != BI) & (pb != BI)
    centre = inner & (pa == CU) & (pb == CU) & on0[E[:, 0]] & on0[E[:, 1]]  # the cup's centre seam (inside one panel)
    border = ~inner
    top_e = border & (A["m"][E[:, 0]] < 1e-7) & (A["m"][E[:, 1]] < 1e-7)
    bot_e = border & ~top_e
    usedv = np.unique(Fk)

    def dist_to(edges, pts):
        S = np.vstack([V[edges[:, 0]] * (1 - t) + V[edges[:, 1]] * t for t in (0, 0.25, 0.5, 0.75)])
        kd = KDTree(len(S))
        for i, p in enumerate(S):
            kd.insert(p, i)
        kd.balance()
        return np.array([kd.find(p)[2] for p in pts])

    ds, de = np.full(n, 1.0), np.full(n, 1.0)
    ds[usedv] = dist_to(E[seam | centre], V[usedv])
    de[usedv] = dist_to(E[bot_e], V[usedv])
    mm = A["m"]
    vp = np.zeros(n)
    for code, h in PUFF.items():
        vp[np.unique(Fk[pk == code])] = h
    dedge = np.minimum(de, np.maximum(mm - BIND_W, 0))  # the padding also starts from nothing at the binding and at the lower edge
    disp = vp * (1 - np.exp(-(np.minimum(ds, dedge) / PUFF_W) ** 2)) - GROOVE * np.exp(-(ds / GROOVE_W) ** 2)
    disp[mm <= BIND_W] = 0.0
    ramp = 1 - smoothstep(BIND_W - 0.0012, BIND_W, mm)
    Vo = V + N0 * (disp + BIND_H * ramp)[:, None]
    wall = WALL - 0.002 * smoothstep(0.25, 0.30, A["y"])
    Vi = V - N0 * (wall + BIND_H * ramp)[:, None]

    # ---- the two free edges (top: bound; bottom: the leather is turned over it) -----------------------------------------------
    def directed(mask):
        Eb, Fb = E[mask], Fk[fa[mask]]
        dirE = np.zeros_like(Eb)
        for k in range(3):
            a, b = Fb[:, k], Fb[:, (k + 1) % 3]
            hit = ((a == Eb[:, 0]) & (b == Eb[:, 1])) | ((a == Eb[:, 1]) & (b == Eb[:, 0]))
            dirE[hit, 0], dirE[hit, 1] = a[hit], b[hit]
        nxt = {int(a): int(b) for a, b in dirE}
        assert len(nxt) == len(dirE), "a free edge of the leather is not a clean loop"
        start = int(dirE[0, 0])
        loop = [start]
        while nxt[loop[-1]] != start:
            loop.append(nxt[loop[-1]])
        assert len(loop) == len(dirE), "a free edge of the leather is in more than one loop (%d of %d)" % (len(loop), len(dirE))
        fn = unit(np.cross(V[Fb[:, 1]] - V[Fb[:, 0]], V[Fb[:, 2]] - V[Fb[:, 0]]))
        acc = np.zeros((n, 3))
        ed = np.cross(V[dirE[:, 1]] - V[dirE[:, 0]], fn)
        np.add.at(acc, dirE[:, 0], ed)
        np.add.at(acc, dirE[:, 1], ed)
        face_of = {(int(a), int(b)): int(f) for (a, b), f in zip(dirE, fa[mask])}
        return np.array(loop), acc, face_of

    K = D["roll_k"]
    phi = np.arange(1, K + 1) * np.pi / (K + 1)

    def roll(loop, acc):
        """Half-round edge joining the outer skin to the inner one along a loop. Returns the ring points, the outward direction, radius."""
        Aout, Bin = Vo[loop], Vi[loop]
        cen, r0 = (Aout + Bin) / 2, (Aout - Bin) / 2
        R = np.linalg.norm(r0, axis=1)
        rh = r0 / R[:, None]
        eo = unit(smooth_line(unit(acc[loop]), True, 3))
        eo = unit(eo - (eo * rh).sum(1, keepdims=True) * rh)
        pts = cen[:, None, :] + r0[:, None, :] * np.cos(phi)[None, :, None] + eo[:, None, :] * (R[:, None] * np.sin(phi)[None, :])[..., None]
        return pts, eo, R, cen

    loopT, accT, faceT = directed(top_e)
    loopB, accB, faceB = directed(bot_e)
    # the top loop starts at the seam between the right hip wing and the rear band, so the binding's strip of UVs splits on a panel seam
    s0 = int(np.argmin(np.abs(A["fwb"][loopT]) + (V[loopT, 0] < 0) * 10.0))
    loopT = np.roll(loopT, -s0)
    rollT, eoT, RT, cenT = roll(loopT, accT)
    rollB, eoB, RB, cenB = roll(loopB, accB)
    nT, nBt = len(loopT), len(loopB)
    ridT = 2 * n + np.arange(nT * K).reshape(nT, K)
    ridB = 2 * n + nT * K + np.arange(nBt * K).reshape(nBt, K)
    Vall = np.vstack([Vo, Vi, rollT.reshape(-1, 3), rollB.reshape(-1, 3)])

    def roll_faces(loop, rid, face_of):
        nl = len(loop)
        cols = np.concatenate([loop[:, None], rid, (loop + n)[:, None]], 1)
        ia = np.arange(nl)
        ib = (ia + 1) % nl
        qa, qb, qc, qd = cols[ia, :-1], cols[ia, 1:], cols[ib, 1:], cols[ib, :-1]
        Fr = np.concatenate([np.stack([qa, qb, qc], -1), np.stack([qa, qc, qd], -1)], 1)  # (nl, 2 (K + 1), 3)
        t = Fr[:, 0]
        if (np.cross(Vall[t[:, 1]] - Vall[t[:, 0]], Vall[t[:, 2]] - Vall[t[:, 0]]) * N0[loop]).sum() < 0:
            Fr = Fr[:, :, ::-1]
        fidx = np.array([face_of[(int(loop[i]), int(loop[ib[i]]))] for i in ia])  # the skin face each piece of the edge hangs from
        per = Fr.shape[1]
        return Fr.reshape(-1, 3), np.repeat(pk[fidx], per), np.repeat(bk[fidx], per)

    FrT, _, baseT = roll_faces(loopT, ridT, faceT)
    FrB, pidB, baseB = roll_faces(loopB, ridB, faceB)
    assert not (pidB == BI).any(), "the lower edge runs into the binding"
    Fall = np.vstack([Fk, Fk[:, ::-1] + n, FrT, FrB])
    fpid = np.r_[pk, np.where(pk == BI, BI, LIN), np.full(len(FrT), BI), pidB]
    fbase = np.r_[bk, bk, baseT, baseB]
    Nall = vnormals(Vall, Fall)
    for name, code in CODE.items():
        used, Fs = submesh(Fall, fpid == code)
        parts[name] = dict(V=Vall[used], F=Fs, N=Nall[used])

    # ---- binding: outer band + rolled edge + inner band, UVs as one long strip -------------------------------------------------
    Lp = V[loopT]
    segl = np.linalg.norm(np.roll(Lp, -1, 0) - Lp, axis=1)
    larc = np.r_[0, np.cumsum(segl)][:-1]
    LOOP_LEN = float(segl.sum())
    ROLL_LEN = float(np.pi * RT.mean())
    W_TOT = 2 * BIND_W + ROLL_LEN
    dense = polyline_resample(Lp, n=nT * 4, closed=True)[0]
    kd = KDTree(len(dense))
    for i, p in enumerate(dense):
        kd.insert(p, i)
    kd.balance()
    bandv = np.unique(Fk[pk == BI])
    Ub = np.array([kd.find(p)[1] for p in V[bandv]]) * (LOOP_LEN / len(dense))
    Uall, Vcall = np.zeros(len(Vall)), np.zeros(len(Vall))
    mband = np.clip(mm[bandv], 0, BIND_W)
    Uall[bandv] = Uall[bandv + n] = Ub
    Uall[loopT] = Uall[loopT + n] = larc
    Uall[ridT] = larc[:, None]
    Vcall[bandv], Vcall[bandv + n] = BIND_W - mband, BIND_W + ROLL_LEN + mband  # +V runs up the outside, over the edge, down the inside
    Vcall[ridT] = (BIND_W + ROLL_LEN * np.arange(1, K + 1) / (K + 1))[None, :]
    pieces = []
    for code in (WB, HL, WF, HR):
        used, Fs = submesh(Fall, (fpid == BI) & (fbase == code))
        u = Uall[used]
        ang = u / LOOP_LEN * 2 * np.pi
        um = (math.atan2(np.sin(ang).mean(), np.cos(ang).mean()) % (2 * np.pi)) * LOOP_LEN / (2 * np.pi)
        u = um + ((u - um + LOOP_LEN / 2) % LOOP_LEN - LOOP_LEN / 2)  # unwrap within the piece
        pieces.append([used, Fs, np.stack([u, Vcall[used]], 1)])
    if sum(uv_area(uv, Fs).sum() for _, Fs, uv in pieces) < 0:  # make the strip read unmirrored from outside
        for pc in pieces:
            pc[2][:, 0] = LOOP_LEN - pc[2][:, 0]
    bind = Soup()
    for used, Fs, uv in pieces:
        bind.add(Vall[used], Fs, Nall[used], uv)
    parts["BINDING"] = bind.part()
    bu = parts["BINDING"]["uvm"]
    print("binding strip: U %.4f..%.4f of %.4f m, V 0..%.4f" % (bu[:, 0].min(), bu[:, 0].max(), LOOP_LEN, W_TOT))
    parts["BINDING"].update(uv0=np.stack([np.clip(bu[:, 0] / LOOP_LEN, 0, 1), bu[:, 1] / W_TOT], 1), uvWidthM=LOOP_LEN, uvHeightM=W_TOT)

    # ---- lining: the inside skin, one island under each outer panel ------------------------------------------------------------
    lining = Soup()
    for code in (WF, CU, HL, HR, WB):
        used, Fs = submesh(Fall, (fpid == LIN) & (fbase == code))
        lining.add(Vall[used], Fs, Nall[used], None)
    parts["LINING"] = lining.part()

    # ---- outer skin for laying stitches on ------------------------------------------------------------------------------------
    Nout = vnormals(Vo, Fk)
    skin = BVHTree.FromPolygons([tuple(v) for v in Vo], [tuple(int(i) for i in f) for f in Fk])

    def on_skin(p):
        loc, nrm, fi, dist = skin.find_nearest(Vector(p))
        f = Fk[fi]
        k = np.argmin(np.linalg.norm(Vo[f] - np.array(loc), axis=1))
        return np.array(loc), Nout[f[k]], pk[fi], dist

    dashes = []
    rows = []  # (polyline, closed, clearance from seams, may sit on the binding)
    seam_pts = []
    for mask in (seam, centre):
        for path, closed in chains(E[mask]):
            if len(path) < 4:
                continue
            P = smooth_line(Vo[path], closed, 3)
            P, Nn, arc, total = polyline_resample(P, step=0.003, closed=closed, extra=(Nout[path],))
            Nn = unit(smooth_line(Nn, closed, 4))
            T = unit(np.roll(P, -1, 0) - np.roll(P, 1, 0)) if closed else unit(np.gradient(P, axis=0))
            side = np.cross(T, Nn)
            seam_pts.append(P)
            for sg in (1, -1):
                rows.append((P + side * (sg * 0.0048), closed, 0.0036, False))
    rows.append((smooth_line(Vo[loopT], True, 2) - eoT * (BIND_W - 0.0026), True, 0.0, True))  # along the binding, just inside its edge
    rows.append((smooth_line(Vo[loopB], True, 2) - eoB * 0.0080, True, 0.0036, False))  # along the turned lower edge
    allseam = np.vstack(seam_pts)
    kds = KDTree(len(allseam))
    for i, p in enumerate(allseam):
        kds.insert(p, i)
    kds.balance()
    for Q, closed, clear, on_binding in rows:
        p0s, p1s = dash_points(Q, closed, D["pitch"])
        for p0, p1 in zip(p0s, p1s):
            l0, n0, id0, d0 = on_skin(p0)
            l1, n1, id1, d1 = on_skin(p1)
            if max(d0, d1) > 0.004 or (not on_binding and (id0 == BI or id1 == BI)):
                continue
            if clear > 0 and kds.find((l0 + l1) / 2)[2] < clear:
                continue
            if abs(np.linalg.norm(l1 - l0) - 0.0028) > 0.0012:
                continue
            dashes.append((l0, l1, unit(n0 + n1)))
    print("skin", round(time.time() - t0, 1), "s; kept tris", len(Fk), "leather stitches", len(dashes))

    # ---- elastic belt across the back --------------------------------------------------------------------------------------------
    elastic = Soup()
    tab = RingTable(Y_E)
    ta = tab.t_at_theta(math.radians(96))
    td = np.linspace(ta, 2 * np.pi - ta, 1500)
    Pd, Nd = body_surf(td, np.full_like(td, Y_E))
    thd = np.abs(np.arctan2(Pd[:, 0], Pd[:, 2]))
    off = PUFF[HR] + (PUFF[WB] - PUFF[HR]) * smoothstep(TH_B - 0.09, TH_B + 0.2, thd) + 0.0005  # sits on the quilted leather
    Pb, Nb, offb, arcb, totb = polyline_resample(Pd + Nd * (off + BELT_T / 2)[:, None], step=D["step"], extra=(Nd, off[:, None]))
    Nb = unit(Nb)
    endd = np.minimum(arcb, totb - arcb)
    lift = -0.0016 * (1 - smoothstep(0.0, 0.012, endd))  # the ends are sewn down into the padding
    bprof = band_prof(BELT_W, BELT_T, D["belt_prof"])
    tube(elastic, Pb, Nb, bprof, max(4, int(0.10 / D["step"])), lift=lift)
    Tb = unit(np.gradient(Pb, axis=0))
    Eb = np.cross(Tb, Nb)
    for end in (0, 1):  # two stitch rows across each end of the belt
        for dist in (0.0035, 0.0095):
            a = dist if end == 0 else totb - dist
            c = np.array([np.interp(a, arcb, Pb[:, k]) for k in range(3)])
            nn = unit(np.array([np.interp(a, arcb, Nb[:, k]) for k in range(3)]))
            ee = unit(np.array([np.interp(a, arcb, Eb[:, k]) for k in range(3)]))
            top = c + nn * (BELT_T / 2 + float(np.interp(a, arcb, lift)))
            line = top[None, :] + np.linspace(-BELT_W / 2 + 0.003, BELT_W / 2 - 0.003, 30)[:, None] * ee[None, :]
            p0s, p1s = dash_points(line, False, D["pitch"])
            dashes += [(p0, p1, nn) for p0, p1 in zip(p0s, p1s)]

    # ---- closure flap: a cushioned leather square lying over the belt at the back ---------------------------------------------
    fe = edge * 0.85
    nu, nv_ = int(FLAP_W / fe) + 5, int(FLAP_H / fe) + 5
    gu, gv = np.meshgrid(np.linspace(-FLAP_W / 2 - 2 * fe, FLAP_W / 2 + 2 * fe, nu), np.linspace(-FLAP_H / 2 - 2 * fe, FLAP_H / 2 + 2 * fe, nv_))
    idx = np.arange(nu * nv_).reshape(nv_, nu)
    a, b, c, d = idx[:-1, :-1], idx[:-1, 1:], idx[1:, 1:], idx[1:, :-1]
    fm_ = Mesh(np.stack([gu.ravel(), gv.ravel(), np.zeros(nu * nv_)], 1), np.vstack([np.stack([a, b, c], -1).reshape(-1, 3), np.stack([a, c, d], -1).reshape(-1, 3)]), {})
    qx, qy = np.abs(fm_.V[:, 0]) - (FLAP_W / 2 - FLAP_RC), np.abs(fm_.V[:, 1]) - (FLAP_H / 2 - FLAP_RC)
    fm_.A["d"] = FLAP_RC - (np.hypot(np.maximum(qx, 0), np.maximum(qy, 0)) + np.minimum(np.maximum(qx, qy), 0))  # distance in from the outline
    cut(fm_, "d", 0.0)
    cut(fm_, "d", FLAP_RE)
    used, Ff = submesh(fm_.F, fm_.face_mean("d") > 0)
    fu, fv, fd = fm_.V[used, 0], fm_.V[used, 1], np.maximum(fm_.A["d"][used], 0)

    def flap_pt(u, v, h):
        P, Nn = body_surf(tab.t_at_arc(u), Y_E + v)
        return P + Nn * np.asarray(h)[..., None], Nn

    hh = FLAP_RIM + (FLAP_TOP - FLAP_RIM) * np.sqrt(np.maximum(1 - (1 - np.minimum(fd / FLAP_RE, 1)) ** 2, 0))
    Vf, _ = flap_pt(fu, fv, hh)
    uvf = np.stack([fu + FLAP_W / 2, fv + FLAP_H / 2], 1)
    parts["FLAP"] = dict(V=Vf, F=Ff, N=vnormals(Vf, Ff), uvm=uvf, uv0=uvf / np.array([FLAP_W, FLAP_H]), uvWidthM=FLAP_W, uvHeightM=FLAP_H,
                         isl=np.zeros(len(Vf), int))
    # its stitching: a row round the edge, and the box-and-cross at the end where it is sewn down (on the right, seen from behind)
    ins = FLAP_RE + 0.0035
    hw_, hh_ = FLAP_W / 2 - ins, FLAP_H / 2 - ins
    rect = rounded_poly([(-hw_, -hh_), (hw_, -hh_), (hw_, hh_), (-hw_, hh_)], FLAP_RC - 0.004, 6)
    bx = hw_ - 0.030  # left side of the stitched box-and-cross; everything left of it stays clear for a logo
    lines = [(rect, True), (np.array([[bx, -hh_], [bx, hh_]]), False), (np.array([[bx, -hh_], [hw_, hh_]]), False), (np.array([[bx, hh_], [hw_, -hh_]]), False)]
    for pts2, closed in lines:
        p0s, p1s = dash_points(np.c_[pts2, np.zeros(len(pts2))], closed, D["pitch"])
        for p0, p1 in zip(p0s, p1s):
            q0, n0 = flap_pt(p0[0], p0[1], FLAP_TOP)
            q1, _ = flap_pt(p1[0], p1[1], FLAP_TOP)
            dashes.append((q0, q1, n0))

    # ---- leg straps, their slide buckles and the junction piece behind the tip of the cup ---------------------------------------
    buckles = Soup()
    iJ = int(np.argmin(np.abs(V[loopB, 0]) + (V[loopB, 2] < 0) * 10.0))  # where the cup's rim crosses the centre line
    Jdir = unit(eoB[iJ] * np.array([0, 1, 1]))
    Jpt = cenB[iJ] * np.array([0, 1, 1]) + Jdir * RB[iJ]
    au, av = np.array([1.0, 0, 0]), -Jdir
    an = np.cross(au, av)
    Cp = Jpt + Jdir * 0.0075
    plate(buckles, Cp, au, av, an, rounded_poly([(-0.0170, 0.0095), (-0.0095, -0.0115), (0.0095, -0.0115), (0.0170, 0.0095)], 0.003, 3), 0.0032)
    sprof = band_prof(STRAP_W, STRAP_T, D["belt_prof"])
    for sgn in (1, -1):
        mx = np.array([sgn, 1, 1.0])
        iE = int(np.argmin(np.abs(A["th"][loopB] - math.radians(104)) + (V[loopB, 0] * sgn < 0) * 10.0))  # under the back of the hip wing
        Ept, Edn, Enr = cenB[iE], eoB[iE], N0[loopB[iE]]
        ctrl = np.array([Cp * mx + au * (0.0075 * sgn) - av * 0.004, [0.030 * sgn, 0.031, -0.024], [0.078 * sgn, 0.058, -0.066], [0.126 * sgn, 0.098, -0.062],
                         Ept + Edn * 0.032, Ept - Edn * 0.004])
        cn = np.array([an * (1 if an[1] < 0 else -1), [-0.80 * sgn, -0.30, -0.50], [0.0, -0.35, -0.94], [0.60 * sgn, -0.20, -0.77], Enr, Enr])
        Ps = catmull(ctrl, 24)
        Ns = catmull(unit(cn), 24)
        Ps, Ns, arcs, tots = polyline_resample(Ps, step=D["step"], extra=(Ns,))
        Ns = unit(Ns)
        tube(elastic, Ps, Ns, sprof, max(4, int(0.10 / D["step"])))
        ab = 0.80 * tots  # the buckle sits on the strap near the hip
        c = np.array([np.interp(ab, arcs, Ps[:, k]) for k in range(3)])
        nn = unit(np.array([np.interp(ab, arcs, Ns[:, k]) for k in range(3)]))
        tt = unit(np.array([np.interp(ab + 0.002, arcs, Ps[:, k]) - np.interp(ab - 0.002, arcs, Ps[:, k]) for k in range(3)]))
        nn = unit(nn - (nn @ tt) * tt)
        buckle(buckles, c, np.cross(tt, nn), tt, nn, D)
    parts["ELASTIC"] = elastic.part()
    parts["BUCKLES"] = buckles.part()
    parts["STITCHING"] = stitch_mesh(dashes, D).part()

    # ---- stand it on y = 0 and centre it -------------------------------------------------------------------------------------
    allv = np.vstack([p["V"] for p in parts.values()])
    lo, hi = allv.min(0), allv.max(0)
    shift = np.array([-(lo[0] + hi[0]) / 2, -lo[1], -(lo[2] + hi[2]) / 2])
    for p in parts.values():
        p["V"] = p["V"] + shift
    print("size", np.round(hi - lo, 4), "shift", np.round(shift, 5))
    print("built", round(time.time() - t0, 1), "s;", {k: len(v["F"]) for k, v in parts.items()}, "total", sum(len(v["F"]) for v in parts.values()))
    return parts, shift


# ------------------------------------------------------------------------------------------------------------------------------------
# Blender side: objects, UVs, bake, export, renders
# ------------------------------------------------------------------------------------------------------------------------------------


def Bv(V):  # web (x, y, z) -> Blender (x, -z, y)
    V = np.asarray(V, float)
    return np.stack([V[..., 0], -V[..., 2], V[..., 1]], -1)


def hexc(h):
    h = h.lstrip("#")
    return tuple(pow(int(h[i:i + 2], 16) / 255, 2.2) for i in (0, 2, 4))


def reset():
    bpy.ops.wm.read_factory_settings(use_empty=True)


def mat(name, color, rough=0.5):
    m = bpy.data.materials.new(name)
    try:
        m.use_nodes = True
    except Exception:
        pass
    b = m.node_tree.nodes.get("Principled BSDF")
    b.inputs["Base Color"].default_value = (*color, 1)
    b.inputs["Roughness"].default_value = rough
    b.inputs["Metallic"].default_value = 0.0
    return m


def make_obj(name, V, F, N=None, uv0=None, uv1=None, material=None):
    me = bpy.data.meshes.new(name)
    me.from_pydata(Bv(V).tolist(), [], np.asarray(F).tolist())
    me.polygons.foreach_set("use_smooth", [True] * len(F))
    if uv0 is not None or uv1 is not None:
        for lname, uv in (("decal", uv0), ("atlas", uv1)):
            layer = me.uv_layers.new(name=lname)
            if uv is not None:
                layer.data.foreach_set("uv", np.asarray(uv, float)[np.asarray(F).ravel()].ravel())
        me.uv_layers["decal"].active_render = True
        me.uv_layers.active = me.uv_layers["atlas"]
    if N is not None:
        me.normals_split_custom_set_from_vertices(Bv(N).tolist())
    me.update()
    o = bpy.data.objects.new(name, me)
    bpy.context.scene.collection.objects.link(o)
    if material:
        me.materials.append(material)
    return o


def bl_unwrap(V, F):
    """Flatten one panel as a single island with Blender's minimum-stretch unwrap. Returns per-vertex UVs."""
    me = bpy.data.meshes.new("tmp_unwrap")
    me.from_pydata(Bv(V).tolist(), [], np.asarray(F).tolist())
    me.uv_layers.new(name="u")
    o = bpy.data.objects.new("tmp_unwrap", me)
    bpy.context.scene.collection.objects.link(o)
    bpy.ops.object.select_all(action="DESELECT")
    o.select_set(True)
    bpy.context.view_layer.objects.active = o
    bpy.ops.object.mode_set(mode="EDIT")
    bpy.ops.mesh.select_all(action="SELECT")
    bpy.ops.uv.unwrap(method="MINIMUM_STRETCH", fill_holes=False, correct_aspect=False, margin=0.0, iterations=40)
    bpy.ops.object.mode_set(mode="OBJECT")
    uv = np.zeros(len(me.loops) * 2)
    me.uv_layers[0].data.foreach_get("uv", uv)
    uv = uv.reshape(-1, 2)
    vi = np.zeros(len(me.loops), int)
    me.loops.foreach_get("vertex_index", vi)
    out = np.zeros((len(V), 2))
    out[vi] = uv
    assert np.abs(out[vi] - uv).max() < 1e-5, "unwrap split the panel into more than one island"
    bpy.data.objects.remove(o)
    bpy.data.meshes.remove(me)
    return out


def uv_area(uv, F):
    a, b, c = uv[F[:, 0]], uv[F[:, 1]], uv[F[:, 2]]
    return 0.5 * ((b[:, 0] - a[:, 0]) * (c[:, 1] - a[:, 1]) - (b[:, 1] - a[:, 1]) * (c[:, 0] - a[:, 0]))


def area3(V, F):
    return 0.5 * np.linalg.norm(np.cross(V[F[:, 1]] - V[F[:, 0]], V[F[:, 2]] - V[F[:, 0]]), axis=1)


def components(F, n):
    parent = np.arange(n)

    def find(x):
        while parent[x] != x:
            parent[x] = parent[parent[x]]
            x = parent[x]
        return x

    for a, b, c in F:
        ra, rb, rc = find(a), find(b), find(c)
        parent[rb] = ra
        parent[find(rc)] = ra
    return np.array([find(i) for i in range(n)])


def pack_atlas(parts, size_px):
    """Shelf-pack every island of every mesh into one 0..1 square at a single scale. Returns UV units per metre."""
    isl = []
    for name in NAMES:
        p = parts[name]
        for i in np.unique(p["isl"]):
            sel = np.flatnonzero(p["isl"] == i)
            uv = p["uvm"][sel]
            lo, hi = uv.min(0), uv.max(0)
            w, h = hi - lo
            isl.append(dict(name=name, sel=sel, lo=lo, w=max(w, 1e-5), h=max(h, 1e-5), rot=h > w))
    for it in isl:
        if it["rot"]:
            it["w"], it["h"] = it["h"], it["w"]
    isl.sort(key=lambda it: -it["h"])
    gap = 20.0 / size_px

    def layout(k):
        x, y, rowh = gap, gap, 0.0
        pos = []
        for it in isl:
            w, h = it["w"] * k, it["h"] * k
            if x + w + gap > 1.0:
                x, y, rowh = gap, y + rowh + gap, 0.0
            if w + 2 * gap > 1.0:
                return None
            pos.append((x, y))
            x += w + gap
            rowh = max(rowh, h)
        return pos if y + rowh + gap <= 1.0 else None

    lo_k, hi_k = 0.1, 20.0
    for _ in range(50):
        mid = (lo_k + hi_k) / 2
        if layout(mid):
            lo_k = mid
        else:
            hi_k = mid
    k = lo_k
    pos = layout(k)
    for p in parts.values():
        p["uv1"] = np.zeros((len(p["V"]), 2))
    for it, (x, y) in zip(isl, pos):
        p = parts[it["name"]]
        uv = p["uvm"][it["sel"]] - it["lo"]
        if it["rot"]:
            uv = np.stack([uv[:, 1], (it["h"]) - uv[:, 0]], 1)  # quarter turn (keeps the island unmirrored); it["h"] is the original width
        p["uv1"][it["sel"]] = uv * k + np.array([x, y])
    used = sum(it["w"] * it["h"] for it in isl) * k * k
    print("atlas: %d islands, %.1f px per mm, %.0f%% of the square used" % (len(isl), k * size_px / 1000, used * 100))
    return k


def setup_cycles(samples):
    sc = bpy.context.scene
    sc.render.engine = "CYCLES"
    sc.cycles.samples = samples
    sc.cycles.use_denoising = True
    dev = "CPU"
    try:
        prefs = bpy.context.preferences.addons["cycles"].preferences
        prefs.compute_device_type = "METAL"
        prefs.get_devices()
        for d in prefs.devices:
            d.use = True
        sc.cycles.device = "GPU"
        dev = "GPU (Metal)"
    except Exception as e:  # the device only changes speed, never the picture
        print("Cycles GPU not available, using CPU:", e)
    print("cycles device:", dev)


def bake_ao(objs, path, size, samples):
    """Ambient occlusion of the whole guard (all eleven meshes shadowing each other) baked onto the atlas UV set."""
    sc = bpy.context.scene
    setup_cycles(samples)
    world = bpy.data.worlds.new("bake_world")
    sc.world = world
    world.light_settings.distance = 0.10
    img = bpy.data.images.new("groinguard_ao_bake", size, size, alpha=True, float_buffer=True, is_data=True)
    img.pixels.foreach_set(np.zeros(size * size * 4, np.float32))
    sc.render.bake.margin = 12
    sc.render.bake.margin_type = "EXTEND"
    sc.render.bake.use_clear = False
    sc.render.bake.target = "IMAGE_TEXTURES"
    sc.render.bake.use_selected_to_active = False
    nodes = []
    for o in objs:
        m = o.data.materials[0]
        nt = m.node_tree
        node = nt.nodes.new("ShaderNodeTexImage")
        node.image = img
        nt.nodes.active = node
        node.select = True
        nodes.append((nt, node))
        o.data.uv_layers.active = o.data.uv_layers["atlas"]
    for o in objs:
        bpy.ops.object.select_all(action="DESELECT")
        o.select_set(True)
        bpy.context.view_layer.objects.active = o
        bpy.ops.object.bake(type="AO")
    px = np.zeros(size * size * 4, np.float32)
    img.pixels.foreach_get(px)
    px = px.reshape(size, size, 4)
    ao, alpha = px[..., 0].copy(), px[..., 3] > 0.5
    assert alpha.mean() > 0.3, "AO bake came back almost empty (%.3f covered)" % alpha.mean()
    assert ao[alpha].std() > 0.02 and ao[alpha].mean() > 0.3, "AO bake has no usable shading"
    # spread the baked edge values outwards into the unused texels so mip-maps never pull in black
    val = np.where(alpha, ao, 0.0)
    have = alpha.astype(np.float32)
    for _ in range(48):
        s = np.zeros_like(val)
        c = np.zeros_like(have)
        for ax, sh in ((0, 1), (0, -1), (1, 1), (1, -1)):
            s += np.roll(val * have, sh, ax)
            c += np.roll(have, sh, ax)
        fill = (have == 0) & (c > 0)
        val[fill] = s[fill] / c[fill]
        have[fill] = 1
    val[have == 0] = float(ao[alpha].mean())
    save_rgb(np.repeat(val[..., None], 3, 2), path, 92)
    for nt, node in nodes:
        nt.nodes.remove(node)
    bpy.data.images.remove(img)
    print("AO baked: coverage %.2f, mean %.3f, min %.3f" % (alpha.mean(), ao[alpha].mean(), ao[alpha].min()))


def save_rgb(arr, path, quality):
    """Save a float (h, w, 3) array, row 0 at the bottom, as 8-bit data (no colour transform). Format from the extension."""
    h, w = arr.shape[:2]
    img = bpy.data.images.new("save_tmp", w, h, alpha=False, float_buffer=False, is_data=True)
    px = np.ones((h, w, 4), np.float32)
    px[..., :3] = np.clip(arr, 0, 1)
    img.pixels.foreach_set(px.ravel())
    img.filepath_raw = path
    img.file_format = "WEBP" if path.endswith(".webp") else "PNG"
    img.save(quality=quality)
    bpy.data.images.remove(img)
    assert os.path.getsize(path) > 1000, "image did not save: " + path
    print("WROTE", path, os.path.getsize(path))


def studio(target=(0, 0.15, 0)):
    sc = bpy.context.scene
    world = bpy.data.worlds.new("studio")
    world.use_nodes = True
    bg = world.node_tree.nodes["Background"]
    bg.inputs[0].default_value = (*hexc("#0a0b0d"), 1)
    bg.inputs[1].default_value = 1.0
    sc.world = world
    for name, pos, energy, size, col in (("key", (-0.9, 1.1, 1.3), 62, 1.2, (1, 0.97, 0.93)), ("fill", (1.3, 0.5, 0.9), 26, 1.6, (0.92, 0.95, 1)),
                                        ("rim", (0.7, 0.9, -1.4), 60, 0.8, (1, 1, 1)), ("rim2", (-1.2, 0.5, -1.0), 30, 0.9, (1, 1, 1)), ("under", (0, -0.7, 0.5), 8, 1.5, (1, 1, 1))):
        ld = bpy.data.lights.new(name, "AREA")
        ld.energy, ld.size, ld.color = energy, size, col
        o = bpy.data.objects.new(name, ld)
        o.location = Bv(pos)
        d = Vector(Bv(target)) - Vector(Bv(pos))
        o.rotation_euler = d.to_track_quat("-Z", "Y").to_euler()
        sc.collection.objects.link(o)
    cd = bpy.data.cameras.new("cam")
    cd.lens = 118
    cam = bpy.data.objects.new("cam", cd)
    sc.collection.objects.link(cam)
    sc.camera = cam
    sc.view_settings.view_transform = "AgX"
    sc.view_settings.look = "AgX - Medium High Contrast"
    sc.render.film_transparent = False
    return cam


def aim(cam, pos, target):
    cam.location = Bv(pos)
    d = Vector(Bv(target)) - Vector(Bv(pos))
    cam.rotation_euler = d.to_track_quat("-Z", "Y").to_euler()


def render(path, w, h):
    sc = bpy.context.scene
    sc.render.resolution_x, sc.render.resolution_y, sc.render.resolution_percentage = w, h, 100
    sc.render.image_settings.file_format = "PNG"
    sc.render.image_settings.color_mode = "RGBA"
    sc.render.film_transparent = True
    sc.render.filepath = path
    bpy.ops.render.render(write_still=True)
    # lay the picture over the exact studio colour (the tone curve would otherwise crush a near-black backdrop to pure black)
    img = bpy.data.images.load(path)
    px = np.zeros(w * h * 4, np.float32)
    img.pixels.foreach_get(px)
    px = px.reshape(h, w, 4)
    bpy.data.images.remove(img)
    bg = np.array([int("0a0b0d"[i:i + 2], 16) / 255 for i in (0, 2, 4)], np.float32)
    save_rgb(px[..., :3] * px[..., 3:4] + bg * (1 - px[..., 3:4]), path, 100)
    print("RENDERED", path)


def gltf_export(path, uvs=True):
    bpy.ops.object.select_all(action="SELECT")
    bpy.ops.export_scene.gltf(filepath=path, export_format="GLB", export_apply=True, export_yup=True, export_extras=True, use_selection=False,
                              export_texcoords=uvs, export_normals=True, export_draco_mesh_compression_enable=False, export_cameras=False, export_lights=False,
                              export_animations=False)
    print("WROTE", path, os.path.getsize(path))


def panel_stats(p):
    V, F = p["V"], p["F"]
    fn = np.cross(V[F[:, 1]] - V[F[:, 0]], V[F[:, 2]] - V[F[:, 0]])
    ar = np.linalg.norm(fn, axis=1) / 2
    cen = (V[F].mean(1) * ar[:, None]).sum(0) / ar.sum()
    return [round(float(x), 5) for x in cen], [round(float(x), 4) for x in unit(fn.sum(0))], len(F)



def orient_metric(uv, V, F, N):
    """Scale a flattened island to metres and turn it so +U runs left to right seen from outside and +V runs up the guard."""
    sa = uv_area(uv, F)
    fa = area3(V, F)
    uv = uv * math.sqrt(fa.sum() / sa.sum())
    w = np.zeros(len(V))
    for k in range(3):
        np.add.at(w, F[:, k], fa)
    navg = unit((N * w[:, None]).sum(0))
    right = unit(np.cross([0.0, 1.0, 0.0], navg))
    ref = np.stack([V @ right, V[:, 1]], 1)
    a = uv - np.average(uv, axis=0, weights=w)
    b = ref - np.average(ref, axis=0, weights=w)
    U_, _, Vt = np.linalg.svd((a * w[:, None]).T @ b)
    uv = uv @ (U_ @ np.diag([1, np.linalg.det(U_ @ Vt)]) @ Vt)  # proper rotation taking the flat panel onto (right, up)
    uv -= uv.min(0)
    ratio = uv_area(uv, F) / np.maximum(fa, 1e-12)
    return uv, ratio


def decal_uvs(parts):
    """Per-panel decal UVs: flatten each leather panel as one island, upright and unmirrored, stretched to fill 0..1."""
    for name in PANELS:
        p = parts[name]
        V, F = p["V"], p["F"]
        ncomp = len(np.unique(components(F, len(V))))
        assert ncomp == 1, "%s is in %d pieces" % (name, ncomp)
        uv = bl_unwrap(V, F)
        sa = uv_area(uv, F)
        assert (sa > 0).mean() > 0.995, "%s unwrap has flipped faces (%.3f)" % (name, (sa > 0).mean())
        uv, ratio = orient_metric(uv, V, F, p["N"])
        size = uv.max(0)
        p["uvm"], p["uv0"] = uv, uv / size
        p["uvWidthM"], p["uvHeightM"] = float(size[0]), float(size[1])
        p["isl"] = np.zeros(len(V), int)
        print("decal %-11s %.3f x %.3f m, area stretch 5..95%%: %.2f..%.2f" % (name, size[0], size[1], np.percentile(ratio, 5), np.percentile(ratio, 95)))
    # lining: one island under each outer panel, shelf-packed into its own 0..1 square
    p = parts["LINING"]
    V, F = p["V"], p["F"]
    uvm = np.zeros((len(V), 2))
    isl = []
    for i in np.unique(p["isl"]):
        used, Fs = submesh(F, p["isl"][F[:, 0]] == i)
        uv = bl_unwrap(V[used], Fs)
        sa = uv_area(uv, Fs)
        assert (sa > 0).mean() > 0.995, "lining island %d unwrap has flipped faces (%.3f)" % (i, (sa > 0).mean())
        uv, ratio = orient_metric(uv, V[used], Fs, p["N"][used])
        uvm[used] = uv
        isl.append((used, uv.max(0)))
        print("decal LINING island %d %.3f x %.3f m, area stretch 5..95%%: %.2f..%.2f" % (i, *uv.max(0), np.percentile(ratio, 5), np.percentile(ratio, 95)))
    isl.sort(key=lambda it: -it[1][1])
    gap = 0.012

    def layout(k):
        x, y, rowh, pos = gap, gap, 0.0, []
        for _, (w, h) in isl:
            if w * k + 2 * gap > 1.0:
                return None
            if x + w * k + gap > 1.0:
                x, y, rowh = gap, y + rowh + gap, 0.0
            pos.append((x, y))
            x += w * k + gap
            rowh = max(rowh, h * k)
        return pos if y + rowh + gap <= 1.0 else None

    lo_k, hi_k = 0.05, 20.0
    for _ in range(50):
        mid = (lo_k + hi_k) / 2
        lo_k, hi_k = (mid, hi_k) if layout(mid) else (lo_k, mid)
    uv0 = np.zeros((len(V), 2))
    for (used, _), (x, y) in zip(isl, layout(lo_k)):
        uv0[used] = uvm[used] * lo_k + np.array([x, y])
    p["uvm"], p["uv0"] = uvm, uv0
    p["uvWidthM"] = p["uvHeightM"] = 1.0 / lo_k
    for name in NAMES:
        p = parts[name]
        if "isl" not in p:
            p["isl"] = np.zeros(len(p["V"]), int)
        if "uv0" not in p:
            p["uv0"] = np.zeros((len(p["V"]), 2))


OXBLOOD = "#7d1712"
PALETTE = dict(WAIST_FRONT=OXBLOOD, CUP=OXBLOOD, HIP_L=OXBLOOD, HIP_R=OXBLOOD, WAIST_BACK=OXBLOOD, FLAP=OXBLOOD, LINING="#1c1c1f", BINDING="#161618",
               ELASTIC="#1b1b1d", STITCHING="#eeece6", BUCKLES="#1b1b1d")
PANEL_MAP = dict(WAIST_FRONT="#e6194b", CUP="#3cb44b", HIP_L="#4363d8", HIP_R="#f58231", WAIST_BACK="#911eb4", FLAP="#ffe119", LINING="#777777",
                 BINDING="#f032e6", ELASTIC="#42d4f4", STITCHING="#111111", BUCKLES="#bfef45")
TARGET = (0, 0.150, 0)
VIEWS = {  # name: (camera position, target) in web axes
    "front": ((0.0, 0.22, 1.60), TARGET),
    "three-quarter front": ((-0.92, 0.48, 1.25), TARGET),
    "side": ((1.60, 0.22, 0.0), TARGET),
    "rear": ((0.0, 0.24, -1.60), TARGET),
    "top-down into the guard": ((0.0, 1.38, -0.80), (0, 0.130, 0.01)),
}
EXTRA_VIEWS = {
    "rear three-quarter": ((0.95, 0.50, -1.20), TARGET),
    "from below": ((0.35, -0.85, 1.30), (0, 0.12, 0)),
}
RENDER_W, RENDER_H = 1400, 1200


def preview_material(name, color, ao_img, grain_img, tiles, flat=False):
    m = bpy.data.materials.new("P_" + name)
    m.use_nodes = True
    nt = m.node_tree
    b = nt.nodes.get("Principled BSDF")
    b.inputs["Base Color"].default_value = (*hexc(color), 1)
    b.inputs["Roughness"].default_value = 0.9 if name == "ELASTIC" else (0.42 if name in LEATHER else 0.6)
    if flat:
        b.inputs["Roughness"].default_value = 1.0
        return m
    if ao_img is not None:
        uvn = nt.nodes.new("ShaderNodeUVMap")
        uvn.uv_map = "atlas"
        tex = nt.nodes.new("ShaderNodeTexImage")
        tex.image = ao_img
        mix = nt.nodes.new("ShaderNodeMix")
        mix.data_type = "RGBA"
        mix.blend_type = "MULTIPLY"
        mix.inputs[0].default_value = 0.85
        mix.inputs[6].default_value = (*hexc(color), 1)
        nt.links.new(uvn.outputs[0], tex.inputs[0])
        nt.links.new(tex.outputs[0], mix.inputs[7])
        nt.links.new(mix.outputs[2], b.inputs["Base Color"])
        if grain_img is not None and name in LEATHER:
            mp = nt.nodes.new("ShaderNodeMapping")
            mp.inputs["Scale"].default_value = (tiles, tiles, 1)
            g = nt.nodes.new("ShaderNodeTexImage")
            g.image = grain_img
            nm = nt.nodes.new("ShaderNodeNormalMap")
            nm.uv_map = "atlas"
            nm.inputs[0].default_value = 0.8
            nt.links.new(uvn.outputs[0], mp.inputs[0])
            nt.links.new(mp.outputs[0], g.inputs[0])
            nt.links.new(g.outputs[0], nm.inputs[1])
            nt.links.new(nm.outputs[0], b.inputs["Normal"])
    return m


def render_set(objs, folder, prefix, views, samples, palette, ao_path=None, grain_path=None, tiles=1.0, flat=False, scale=1.0):
    setup_cycles(samples)
    if bpy.context.scene.camera is None:
        cam = studio(TARGET)
        cam.data.lens = 105
    cam = bpy.context.scene.camera
    ao_img = grain_img = None
    if ao_path:
        ao_img = bpy.data.images.load(ao_path)
        ao_img.colorspace_settings.name = "Non-Color"
        grain_img = bpy.data.images.load(grain_path)
        grain_img.colorspace_settings.name = "Non-Color"
    for o in objs:
        o.data.materials.clear()
        o.data.materials.append(preview_material(o.name, palette[o.name], ao_img, grain_img, tiles, flat=flat))
    for vname, (pos, tgt) in views.items():
        aim(cam, pos, tgt)
        render(os.path.join(folder, prefix + vname + ".png"), int(RENDER_W * scale), int(RENDER_H * scale))


# ------------------------------------------------------------------------------------------------------------------------------------
# main
# ------------------------------------------------------------------------------------------------------------------------------------

STORE_GROUPS = dict(LEATHER=(["WAIST_FRONT", "CUP", "HIP_L", "HIP_R", "WAIST_BACK", "FLAP"], "#111316", 0.45), LINING=(["LINING"], "#17181b", 0.45),
                    BINDING=(["BINDING"], "#c8954d", 0.45), ELASTIC=(["ELASTIC"], "#1b1b1d", 0.9), BUCKLES=(["BUCKLES"], "#1b1b1d", 0.45),
                    STITCHING=(["STITCHING"], "#eeece6", 0.45))
STORE_LIMIT = 400_000
LINING_VIEW = [0.0, 0.6, -0.8]  # where to stand to see the lining best: behind and above


def main():
    gdir = os.path.join(OUT, "groinguard")
    sdir = os.path.join(OUT, "store")
    os.makedirs(gdir, exist_ok=True)
    os.makedirs(sdir, exist_ok=True)
    scratch = REPORTS or "."
    if REPORTS:
        os.makedirs(REPORTS, exist_ok=True)

    glb = os.path.join(gdir, "groinguard.glb")
    if WALL_ONLY:
        with open(os.path.join(gdir, "groinguard.json")) as fh:
            meta = json.load(fh)
    else:
        reset()
        parts, _ = build(FULL)
        if QUICK:
            objs = [make_obj(n, parts[n]["V"], parts[n]["F"], parts[n].get("N")) for n in NAMES]
            render_set(objs, scratch, "quick-", {**VIEWS, **EXTRA_VIEWS}, 24, PALETTE, scale=0.6)
            render_set(objs, scratch, "quick-panels-", {k: VIEWS[k] for k in ("front", "side", "rear")}, 8, PANEL_MAP, flat=True, scale=0.5)
            return

        # ---- UVs --------------------------------------------------------------------------------------------------------------------
        decal_uvs(parts)
        k = pack_atlas(parts, BAKE_SIZE)
        tiles = (1.0 / k) / GRAIN_TILE_M
        # ---- objects ----------------------------------------------------------------------------------------------------------------
        objs = []
        for n in NAMES:
            p = parts[n]
            o = make_obj(n, p["V"], p["F"], p["N"], p["uv0"], p["uv1"], mat("M_" + n, hexc("#808080"), 0.5))
            if n in LEATHER:
                o["uvWidthM"] = round(p["uvWidthM"], 5)
                o["uvHeightM"] = round(p["uvHeightM"], 5)
            objs.append(o)
        # ---- AO ---------------------------------------------------------------------------------------------------------------------
        ao_path = os.path.join(gdir, "groinguard-ao.webp")
        bake_ao(objs, ao_path, BAKE_SIZE, BAKE_SAMPLES)
        # ---- export + json ----------------------------------------------------------------------------------------------------------
        glb = os.path.join(gdir, "groinguard.glb")
        gltf_export(glb)
        allv = np.vstack([p["V"] for p in parts.values()])
        meta = dict(version=1, units="m", bounds=dict(min=[round(float(x), 5) for x in allv.min(0)], max=[round(float(x), 5) for x in allv.max(0)]),
                    atlasTilesPerUnit=round(tiles, 4), panels={})
        for n in NAMES:
            cen, nrm, nt = panel_stats(parts[n])
            d = dict(centroid=cen, normal=LINING_VIEW if n == "LINING" else nrm)
            if n in LEATHER:
                d["uvWidthM"] = round(parts[n]["uvWidthM"], 5)
                d["uvHeightM"] = round(parts[n]["uvHeightM"], 5)
            d["triangles"] = nt
            meta["panels"][n] = d
        with open(os.path.join(gdir, "groinguard.json"), "w") as fh:
            json.dump(meta, fh, indent=2)
        print("WROTE", os.path.join(gdir, "groinguard.json"))
        # ---- renders ----------------------------------------------------------------------------------------------------------------
        if REPORTS and not NO_RENDERS:
            grain_path = os.path.join(OUT, "gloves", "leather-grain-normal.webp")  # shared with the glove; only read here
            assert os.path.exists(grain_path), "the shared leather grain map is missing: " + grain_path
            render_set(objs, REPORTS, "groin guard ", {**VIEWS, **EXTRA_VIEWS}, 160, PALETTE, ao_path, grain_path, tiles)
            render_set(objs, REPORTS, "panel map ", {k: VIEWS[k] for k in ("front", "side", "rear")}, 32, PANEL_MAP, flat=True)

    # ---- display copy for the shop wall -----------------------------------------------------------------------------------------
    reset()
    lp, _ = build(LIGHT)
    for g, (members, col, rough) in STORE_GROUPS.items():
        V = np.vstack([lp[m]["V"] for m in members])
        off = np.cumsum([0] + [len(lp[m]["V"]) for m in members])
        F = np.vstack([lp[m]["F"] + off[i] for i, m in enumerate(members)])
        N = np.vstack([lp[m]["N"] for m in members])
        make_obj("GROIN_GUARD_" + g, V, F, N, material=mat("M_GROIN_GUARD_" + g, hexc(col), rough))
    wall_path = os.path.join(sdir, "groin-guard.glb")
    gltf_export(wall_path, uvs=False)
    assert os.path.getsize(wall_path) <= STORE_LIMIT, "wall copy is %d bytes, over the %d limit" % (os.path.getsize(wall_path), STORE_LIMIT)
    if REPORTS and not NO_RENDERS:
        setup_cycles(160)
        cam = studio(TARGET)
        cam.data.lens = 105
        aim(cam, (-0.80, 0.45, 1.35), TARGET)
        render(os.path.join(REPORTS, "wall copy.png"), RENDER_W, RENDER_H)

    verify(glb, wall_path, meta)


def verify(glb, wall_path, meta):
    """Re-import the customiser guard into an empty scene and check it against the contract."""
    reset()
    bpy.ops.import_scene.gltf(filepath=glb)
    names = {o.name: o for o in bpy.data.objects if o.type == "MESH"}
    assert set(names) == set(NAMES) and len(bpy.data.objects) == len(NAMES), "node names differ: %s" % sorted(set(names) ^ set(NAMES))
    lo, hi = np.full(3, 1e9), np.full(3, -1e9)
    total = 0
    cents = {}
    for n in NAMES:
        o = names[n]
        assert not o.children and o.parent is None, n + " has a parent or children"
        assert np.allclose(np.array(o.matrix_world), np.eye(4), atol=1e-6), n + " has an unapplied transform"
        me = o.data
        layers = [l.name for l in me.uv_layers]
        assert len(layers) == 2, "%s has %d UV layers" % (n, len(layers))
        co = np.zeros(len(me.vertices) * 3)
        me.vertices.foreach_get("co", co)
        co = co.reshape(-1, 3)
        wco = np.stack([co[:, 0], co[:, 2], -co[:, 1]], 1)  # web axes
        lo, hi = np.minimum(lo, wco.min(0)), np.maximum(hi, wco.max(0))
        cents[n] = wco.mean(0)
        me.calc_loop_triangles()
        nt = len(me.loop_triangles)
        total += nt
        uvs = []
        for l in me.uv_layers:
            uv = np.zeros(len(me.loops) * 2)
            l.data.foreach_get("uv", uv)
            uvs.append(uv.reshape(-1, 2))
        extras = {k: round(o[k], 5) for k in o.keys() if k.startswith("uv")}
        print("VERIFY %-12s tris %6d  uv0 %.2f..%.2f  uv1 %.2f..%.2f  %s  material %s" % (
            n, nt, uvs[0].min(), uvs[0].max(), uvs[1].min(), uvs[1].max(), extras, me.materials[0].name if me.materials else None))
        assert uvs[1].min() >= 0 and uvs[1].max() <= 1, n + " atlas UVs leave the square"
        assert meta["panels"][n]["triangles"] == nt, n + " triangle count differs from groinguard.json"
        assert me.materials and me.materials[0].name == "M_" + n
        if n in LEATHER:
            assert uvs[0].min() > -1e-4 and uvs[0].max() < 1 + 1e-4, n + " decal UVs leave 0..1"
            assert "uvWidthM" in o and "uvHeightM" in o, n + " lost its decal size extras"
            li = np.array([list(t.loops) for t in me.loop_triangles])
            vi = np.array([[me.loops[i].vertex_index for i in t.loops] for t in me.loop_triangles])
            ta = uv_area(uvs[0], li)
            assert (ta >= 0).mean() > 0.995, n + " decal is mirrored or folded (%.3f)" % (ta >= 0).mean()
            if n in PANELS + ["FLAP"]:
                # decal orientation as it comes back out of the file: +U to the right seen from outside, +V up the guard
                right = unit(np.cross([0, 1, 0], np.array(meta["panels"][n]["normal"])))
                uu, vv = uvs[0][li.ravel(), 0], uvs[0][li.ravel(), 1]
                cu, cv2 = np.corrcoef(uu, wco[vi.ravel()] @ right)[0, 1], np.corrcoef(vv, wco[vi.ravel(), 1])[0, 1]
                print("VERIFY   decal %-11s unmirrored faces %.3f, corr(U, right) %+.2f, corr(V, up) %+.2f" % (n, (ta > 0).mean(), cu, cv2))
                lim = 0.9 if n in ("WAIST_FRONT", "FLAP") else 0.5
                assert cu > lim and cv2 > lim, n + " decal is not upright"
    size = hi - lo
    print("VERIFY bounds (web axes) min", np.round(lo, 4), "max", np.round(hi, 4), "size", np.round(size, 4), "total tris", total)
    assert abs(lo[1]) < 1e-4, "lowest point is not at y = 0"
    assert abs(lo[0] + hi[0]) < 2e-3 and abs(lo[2] + hi[2]) < 2e-3, "not centred"
    assert 0.32 < size[0] < 0.36 and 0.28 < size[1] < 0.32 and 0.22 < size[2] < 0.26, "size out of contract"
    assert 50_000 <= total <= 120_000, "triangle count out of contract"
    assert cents["WAIST_FRONT"][2] > 0 and cents["WAIST_FRONT"][1] > cents["CUP"][1], "front waist band is not at the front above the cup"
    assert cents["CUP"][2] > 0 and cents["FLAP"][2] < 0 and cents["WAIST_BACK"][2] < 0, "front / back are the wrong way round"
    assert cents["HIP_R"][0] > 0 and cents["HIP_L"][0] < 0, "left / right are the wrong way round"
    gdir = os.path.dirname(glb)
    for p in (glb, os.path.join(gdir, "groinguard-ao.webp"), os.path.join(gdir, "groinguard.json"), wall_path):
        print("VERIFY size %8d  %s" % (os.path.getsize(p), p))
    reset()
    bpy.ops.import_scene.gltf(filepath=wall_path)
    tp = 0
    wlo, whi = np.full(3, 1e9), np.full(3, -1e9)
    for o in bpy.data.objects:
        if o.type == "MESH":
            o.data.calc_loop_triangles()
            tp += len(o.data.loop_triangles)
            co = np.array([o.matrix_world @ v.co for v in o.data.vertices])
            wco = np.stack([co[:, 0], co[:, 2], -co[:, 1]], 1)
            wlo, whi = np.minimum(wlo, wco.min(0)), np.maximum(whi, wco.max(0))
    print("VERIFY wall copy tris", tp, "size", os.path.getsize(wall_path), "bounds", np.round(wlo, 4), np.round(whi, 4),
          "meshes", sorted(o.name for o in bpy.data.objects if o.type == "MESH"))
    assert abs(wlo[1]) < 1e-4 and abs(wlo[0] + whi[0]) < 2e-3 and abs(wlo[2] + whi[2]) < 2e-3, "wall copy is not standing on y = 0, centred"
    assert os.path.getsize(wall_path) <= STORE_LIMIT
    print("VERIFY OK")


main()
