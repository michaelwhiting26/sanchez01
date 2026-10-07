"""Builds the original Sanchez lace-up boxing glove for the web glove customiser, entirely from maths (no imported or downloaded meshes).
Run headless from the repo root:

    /Applications/Blender.app/Contents/MacOS/Blender -b -P tools/gloves/build_glove.py -- --out apps/web/public/assets --reports "<folder for preview PNGs>"

Writes (under --out):
    gloves/glove.glb                 one right-hand glove, twelve named meshes, two UV sets (decal + atlas), grey materials
    gloves/glove-ao.webp             ambient occlusion baked in Cycles on the atlas UV set (linear data, greyscale stored as RGB)
    gloves/leather-grain-normal.webp tileable leather grain normal map (tools/gloves/leather_grain.py)
    gloves/glove.json                bounds, panel centroids / normals / decal sizes, atlasTilesPerUnit
    store/gloves.glb                 light display pair for the shop wall (plain colours, no textures)
and, under --reports, the preview renders. Optional flags: --quick (coarse mesh, no bake, small clay previews; for shaping work only),
--bake-samples N, --bake-size N, --no-renders.

All geometry is written in the web scene's axes (three.js / glTF: x right, y up, z towards the viewer) and converted to Blender's on the way in.
The glove stands on its cuff: opening at y = 0, fist at the top, back of the hand facing +z, thumb on -x (a right hand).

How it is made: the hand and the thumb are two lofted surfaces (rings swept along a bent spine). Panels are cut out of them along smooth
seam curves by splitting triangles exactly where a seam function crosses zero (never along the jagged edges of existing faces), the thumb
and hand are trimmed against each other the same way, and piping, stitches, binding, laces and lining are built from the resulting seam curves.
"""
import bpy, sys, os, math, json, time
import numpy as np
from mathutils import Vector
from mathutils.bvhtree import BVHTree
from mathutils.kdtree import KDTree

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import leather_grain  # the tileable grain normal map

argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []


def arg(name, default=None):
    return argv[argv.index(name) + 1] if name in argv else default


OUT = arg("--out", ".")
REPORTS = arg("--reports")
QUICK = "--quick" in argv
NO_RENDERS = "--no-renders" in argv
BAKE_SIZE = int(arg("--bake-size", 2048))
BAKE_SAMPLES = int(arg("--bake-samples", 384))
GRAIN_SIZE = 1024
GRAIN_TILE_M = 0.04  # one tile of the grain covers 4 cm of leather

LEATHER = ["HAND_BACK", "PALM", "THUMB_OUT", "THUMB_IN", "THUMB_STRIP", "CUFF_BACK", "CUFF_PALM", "BINDING"]
OTHERS = ["PIPING", "STITCHING", "LACES", "LINING"]
NAMES = LEATHER + OTHERS

FULL = dict(edge=0.0028, lining_edge=0.0065, pipe_sides=8, pipe_step=0.0027, roll_k=6, lace_prof=8, lace_step=0.0017, stitch="prism", pitch=0.0043, uv=True)
LIGHT = dict(edge=0.0080, lining_edge=0.0160, pipe_sides=4, pipe_step=0.0090, roll_k=2, lace_prof=4, lace_step=0.007, stitch="quad", pitch=0.0070, uv=False)
if QUICK:
    FULL = dict(FULL, edge=0.0042, uv=False)

# ------------------------------------------------------------------------------------------------------------------------------------
# small maths helpers
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


def make_sd(V, F):
    """Signed distance to a closed surface (positive outside)."""
    bvh = BVHTree.FromPolygons([tuple(v) for v in V], [tuple(int(i) for i in f) for f in F])

    def sd(P):
        out = np.empty(len(P))
        for i, p in enumerate(P):
            p = Vector(p)
            loc, nrm, _, dist = bvh.find_nearest(p)
            out[i] = dist if (p - loc).dot(nrm) >= 0 else -dist
        return out

    return sd, bvh


# ------------------------------------------------------------------------------------------------------------------------------------
# the two lofted surfaces: hand (cuff + fist) and thumb
# ------------------------------------------------------------------------------------------------------------------------------------

S_CUFF = 0.102  # height of the cuff / hand seam
BL = 0.305  # length of the hand's spine

_PHI = nspline([0, 0.06, 0.13, 0.165, 0.205, 0.245, 0.275, BL], np.radians([0, 0, 0, 8, 30, 62, 88, 106]))  # forward lean of the spine
_W = nspline([0, 0.035, 0.095, 0.135, 0.175, 0.215, 0.255, BL], [0.0525, 0.0490, 0.0455, 0.0555, 0.0665, 0.0710, 0.0705, 0.0665])  # half width
_DB = nspline([0, 0.035, 0.095, 0.135, 0.175, 0.215, 0.255, BL], [0.0460, 0.0435, 0.0410, 0.0460, 0.0515, 0.0545, 0.0550, 0.0530])  # back half depth
_DP = nspline([0, 0.035, 0.095, 0.135, 0.175, 0.215, 0.255, BL], [0.0460, 0.0435, 0.0400, 0.0390, 0.0390, 0.0410, 0.0455, 0.0470])  # palm half depth
CAP0 = 0.250  # where the rounded end of the fist starts
_SS = np.linspace(0, BL, 4001)
_ph = np.maximum(_PHI(_SS), 0)
_PY = np.r_[0, np.cumsum(0.5 * (np.cos(_ph[1:]) + np.cos(_ph[:-1])) * np.diff(_SS))]
_PZ = np.r_[0, np.cumsum(-0.5 * (np.sin(_ph[1:]) + np.sin(_ph[:-1])) * np.diff(_SS))]
XAX = np.array([1.0, 0, 0])


def body_frame(s):
    s = np.asarray(s, float)
    ph = np.maximum(_PHI(s), 0)
    z = np.zeros_like(s)
    P = np.stack([z, np.interp(s, _SS, _PY), np.interp(s, _SS, _PZ)], -1)
    T = np.stack([z, np.cos(ph), -np.sin(ph)], -1)
    N = np.stack([z, np.sin(ph), np.cos(ph)], -1)
    return P, T, N


def body_ring(s, al):
    """Points of the hand's cross-section rings: s (m,), al (K,) -> (m, K, 3). al = 0 is the middle of the back, pi the middle of the palm."""
    s = np.atleast_1d(np.asarray(s, float))
    P, T, N = body_frame(s)
    nx = (2.25 + 0.35 * smoothstep(0.10, 0.19, s) - 0.25 * smoothstep(0.235, BL, s))[:, None]
    t = np.clip((s - CAP0) / (BL - CAP0), 0, 1)
    cap = ((1 - t ** 2.8) ** (1 / 2.8))[:, None]
    ca, sa = np.cos(al)[None, :], np.sin(al)[None, :]
    cx = np.sign(sa) * np.abs(sa) ** (2 / nx)
    cz = np.sign(ca) * np.abs(ca) ** (2 / nx)
    w = _W(s)[:, None] * cap
    d = np.where(ca >= 0, _DB(s)[:, None], _DP(s)[:, None]) * cap
    return P[:, None, :] + XAX[None, None, :] * (w * cx)[..., None] + N[:, None, :] * (d * cz)[..., None]


TH_CTRL = np.array([[-0.020, 0.124, -0.012], [-0.050, 0.149, -0.020], [-0.073, 0.183, -0.031], [-0.084, 0.216, -0.046], [-0.081, 0.243, -0.062]])
TH_SEAM = np.array([-0.75, 0.0, 1.0])  # the thumb's outer panel is the half facing this way
_thd = catmull(TH_CTRL, 60)
_tharc = np.r_[0, np.cumsum(np.linalg.norm(np.diff(_thd, axis=0), axis=1))]
TL = float(_tharc[-1])
TH_OUT = unit(np.array([-1.0, 0.0, -0.30]))  # "away from the fist"
_TRN = nspline([0, 0.3 * TL, 0.6 * TL, 0.85 * TL, TL], [0.0215, 0.0255, 0.0262, 0.0245, 0.0225])  # half thickness towards / away from the fist
_TRX = nspline([0, 0.3 * TL, 0.6 * TL, 0.85 * TL, TL], [0.0235, 0.0280, 0.0288, 0.0270, 0.0245])  # half thickness front to back


def thumb_frame(s):
    s = np.asarray(s, float)
    P = np.stack([np.interp(s, _tharc, _thd[:, k]) for k in range(3)], -1)
    d = 0.0015
    T = unit(np.stack([np.interp(np.clip(s + d, 0, TL), _tharc, _thd[:, k]) - np.interp(np.clip(s - d, 0, TL), _tharc, _thd[:, k]) for k in range(3)], -1))
    O = unit(TH_OUT - (T @ TH_OUT)[..., None] * T)
    X = np.cross(T, O)
    return P, T, O, X


def thumb_ring(s, al):
    s = np.atleast_1d(np.asarray(s, float))
    P, T, O, X = thumb_frame(s)
    c0, c1 = 0.028, 0.034
    t0 = np.clip(1 - s / c0, 0, 1)
    t1 = np.clip((s - (TL - c1)) / c1, 0, 1)
    cap = (np.sqrt(np.maximum(1 - t0 ** 2, 0)) * (1 - t1 ** 2.2) ** (1 / 2.2))[:, None]
    ca, sa = np.cos(al)[None, :], np.sin(al)[None, :]
    e = 2 / 2.15
    cx = np.sign(sa) * np.abs(sa) ** e
    cz = np.sign(ca) * np.abs(ca) ** e
    return P[:, None, :] + X[:, None, :] * (_TRX(s)[:, None] * cap * cx)[..., None] + O[:, None, :] * (_TRN(s)[:, None] * cap * cz)[..., None]


def loft(ring_fn, length, edge, pole0):
    """Grid mesh of a lofted surface with even spacing, closed by a pole at the far end (and at the start if pole0).
    Returns Mesh with attributes s (along), al (ring angle), arc (distance round the ring from al = 0), circ (ring length)."""
    sd = np.linspace(0, length, int(length / 0.0004) + 1)
    coarse = ring_fn(sd, np.linspace(0, 2 * np.pi, 48, endpoint=False))
    step = np.linalg.norm(np.diff(coarse, axis=0), axis=2).max(1)
    dist = np.r_[0, np.cumsum(step)]
    rad = np.linalg.norm(coarse - coarse.mean(1, keepdims=True), axis=2).max(1)
    nrow = int(dist[-1] / edge)
    rows = np.interp(np.arange(nrow + 1) * (dist[-1] / nrow), dist, sd)
    rows = rows[np.interp(rows, sd, rad) > 0.75 * edge]
    K = 1440
    al = np.linspace(0, 2 * np.pi, K, endpoint=False)
    dense = ring_fn(rows, al)
    seg = np.linalg.norm(np.roll(dense, -1, axis=1) - dense, axis=2)
    circ = seg.sum(1)
    nr = int(round(circ.max() / edge / 2)) * 2
    V = np.zeros((len(rows), nr, 3))
    AL = np.zeros((len(rows), nr))
    ARC = np.zeros((len(rows), nr))
    for j in range(len(rows)):
        arc = np.r_[0, np.cumsum(seg[j])]
        t = np.arange(nr) * circ[j] / nr
        ring = np.vstack([dense[j], dense[j, :1]])
        for k in range(3):
            V[j, :, k] = np.interp(t, arc, ring[:, k])
        AL[j] = np.interp(t, arc, np.r_[al, 2 * np.pi])
        ARC[j] = t
    nrw = len(rows)
    idx = np.arange(nrw * nr).reshape(nrw, nr)
    a, b = idx[:-1, :], np.roll(idx[:-1, :], -1, 1)
    c, d = np.roll(idx[1:, :], -1, 1), idx[1:, :]
    F = [np.stack([a, b, c], -1).reshape(-1, 3), np.stack([a, c, d], -1).reshape(-1, 3)]
    Vf = [V.reshape(-1, 3)]
    A = dict(s=np.repeat(rows, nr), al=AL.ravel(), arc=ARC.ravel(), circ=np.repeat(circ, nr))
    nv = nrw * nr
    tip = ring_fn(np.array([length]), al[:1])[0, 0]
    Vf.append(tip[None])
    F.append(np.stack([idx[-1], np.roll(idx[-1], -1), np.full(nr, nv)], 1))
    extra = dict(s=[length], al=[np.pi / 2], arc=[0.0], circ=[0.0])
    if pole0:
        start = ring_fn(np.array([0.0]), al[:1])[0, 0]
        Vf.append(start[None])
        F.append(np.stack([np.roll(idx[0], -1), idx[0], np.full(nr, nv + 1)], 1))
        for k, v in dict(s=0.0, al=np.pi / 2, arc=0.0, circ=0.0).items():
            extra[k].append(v)
    for k in A:
        A[k] = np.r_[A[k], extra[k]]
    return Mesh(np.vstack(Vf), np.vstack(F), A)


def cuff_surface(a, y):
    """Point and outward normal on the cuff's outer surface at signed distance `a` round from the middle of the palm side (a > 0 towards +x)
    and height y. Only valid where the spine is still straight (the cuff)."""
    al = np.linspace(0, 2 * np.pi, 1440, endpoint=False)

    def at(yy):
        ring = body_ring(np.array([yy]), al)[0]
        ring = np.vstack([ring, ring[:1]])
        arc = np.r_[0, np.cumsum(np.linalg.norm(np.diff(ring, axis=0), axis=1))]
        t = arc[-1] / 2 - a
        p = np.array([np.interp(t, arc, ring[:, k]) for k in range(3)])
        q = np.array([np.interp(t + 0.0005, arc, ring[:, k]) for k in range(3)])
        return p, q

    p, q = at(y)
    p2, _ = at(y + 0.0005)
    return p, unit(np.cross(q - p, p2 - p))


# ------------------------------------------------------------------------------------------------------------------------------------
# swept pieces (piping, laces) and the accumulator for meshes made of many islands
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


# ------------------------------------------------------------------------------------------------------------------------------------
# the glove
# ------------------------------------------------------------------------------------------------------------------------------------

BIND_W = 0.0085  # width of the binding band on the outside
BIND_H = 0.0008  # how far the binding stands proud of the leather
WALL = 0.0075  # thickness of the padded cuff wall
SLOT_TOP = 0.089  # top of the lace slit
S_IN = 0.15  # how far up the lining goes
PIPE_R = 0.00175
PUCKER = 0.0011  # depth of the groove the seams pull into the padding
N_EYE = 6
EYE_Y0, EYE_PITCH = 0.0225, 0.0114
LACE_HW, LACE_HT = 0.0027, 0.00085  # half width / half thickness of the flat lace

HB, PA, CB, CP, BI, SLOT = 0, 1, 5, 6, 7, -1


def slot_half_width(y):
    return 0.0080 + 0.0045 * (1 - np.clip(y / SLOT_TOP, 0, 1))


def build(D):
    t0 = time.time()
    edge = D["edge"]
    parts = {}
    # ---- hand ----------------------------------------------------------------------------------------------------------------
    body = loft(body_ring, BL, edge, pole0=False)
    A = body.A
    s = A["s"]
    A["u"] = np.abs(A["al"] - np.pi)  # angle round from the middle of the palm (0) to the middle of the back (pi)
    A["aabs"] = np.where(A["circ"] > 0, np.abs(A["arc"] - A["circ"] / 2), 1.0)  # metres round from the middle of the palm
    for k in ("al", "arc", "circ"):
        del A[k]
    A["fs"] = s - S_CUFF  # cuff seam
    cut(body, "fs")
    s = A["s"]
    # cuff: palm-side panel is the part within U_C of the palm centre
    U_C = np.radians(93)
    A["fcp"] = np.maximum((A["u"] - U_C) * 0.045, s - S_CUFF)
    cut(body, "fcp")
    # palm panel: a tall rounded shape on the palm side, ending in the fold under the fingertips
    s = A["s"]
    # (on the thumb side the seam sits further round, under the thumb, so it does not run alongside the thumb's own seam)
    S_A, C_R, PW = 0.196, 0.050, 2.6
    U_P = np.where(body.V[:, 0] >= 0, np.radians(97), np.radians(78))
    g = ((A["u"] / U_P) ** PW + (np.maximum(s - S_A, 0) / C_R) ** PW) ** (1 / PW) - 1
    A["fp"] = np.maximum(g * 0.05, S_CUFF - s)
    cut(body, "fp")
    # lace slit + binding band: m = distance in from the edge of the leather (rim of the opening and the slit)
    s = A["s"]
    hw = slot_half_width(s)
    yc = SLOT_TOP - slot_half_width(SLOT_TOP)
    A["dcap"] = np.hypot(A["aabs"], np.maximum(s - yc, 0)) - hw
    A["m"] = smin(s, A["dcap"], 0.014)
    A["m"][s > 0.14] = 1.0
    cut(body, "m", 0.0)
    if D["stitch"] == "prism":
        cut(body, "m", BIND_W - 0.0012)
    cut(body, "m", BIND_W)

    # ---- thumb ---------------------------------------------------------------------------------------------------------------
    thumb = loft(thumb_ring, TL, edge, pole0=True)
    P, T, O, X = thumb_frame(thumb.A["s"])
    SD = unit(TH_SEAM - (T @ TH_SEAM)[:, None] * T)
    thumb.A = dict(s=thumb.A["s"], fo=((thumb.V - P) * SD).sum(1))  # seam between the outer and inner thumb panels
    cut(thumb, "fo")

    # ---- trim hand and thumb against each other -------------------------------------------------------------------------------
    sd_thumb, _ = make_sd(thumb.V, thumb.F)
    sd_body, _ = make_sd(body.V, body.F)
    lo, hi = thumb.V.min(0) - 0.004, thumb.V.max(0) + 0.004
    near = np.all((body.V > lo) & (body.V < hi), axis=1)
    f = np.full(len(body.V), 0.01)
    f[near] = sd_thumb(body.V[near])
    body.A["trim"] = f
    cut(body, "trim")
    thumb.A["trim"] = sd_body(thumb.V)
    cut(thumb, "trim")
    print("cut", round(time.time() - t0, 1), "s; body tris", len(body.F), "thumb tris", len(thumb.F))

    # ---- classify faces ------------------------------------------------------------------------------------------------------
    A = body.A
    fm = {k: body.face_mean(k) for k in ("s", "u", "m", "fs", "fcp", "fp", "trim", "dcap")}
    pid = np.where(fm["fp"] < 0, PA, HB)
    pid = np.where(fm["fs"] < 0, np.where(fm["fcp"] < 0, CP, CB), pid)
    pid = np.where(fm["m"] < BIND_W, BI, pid)
    pid = np.where(fm["m"] < 0, SLOT, pid)
    bkeep = (fm["trim"] > 0) & (pid != SLOT)
    tpid = np.where(thumb.face_mean("fo") > 0, 0, 1)  # 0 = outer, 1 = inner
    tkeep = thumb.face_mean("trim") > 0

    # ---- normals, seam pucker, binding raise ---------------------------------------------------------------------------------
    BN = vnormals(body.V, body.F)
    TN = vnormals(thumb.V, thumb.F)
    V0 = body.V.copy()  # undisplaced

    def seam_edges(F, ids, n, valid):
        E, fa, fb = edge_faces(F, n)
        ok = (fb >= 0)
        ok &= valid[ids[fa]] & valid[ids[np.maximum(fb, 0)]] & (ids[fa] != ids[np.maximum(fb, 0)])
        return E[ok], fa[ok], fb[ok]

    leather_ok = np.zeros(10, bool)
    leather_ok[[HB, PA, CB, CP]] = True
    bE, bfa, bfb = seam_edges(body.F, pid, len(body.V), leather_ok)
    tE, tfa, tfb = seam_edges(thumb.F, tpid, len(thumb.V), np.ones(10, bool))

    def pucker(V, N, E, depth=PUCKER, width=0.0048):
        pts = np.vstack([V[E[:, 0]] * (1 - t) + V[E[:, 1]] * t for t in (0, 0.25, 0.5, 0.75, 1)])
        kd = KDTree(len(pts))
        for i, p in enumerate(pts):
            kd.insert(p, i)
        kd.balance()
        d = np.array([kd.find(p)[2] for p in V])
        return V - N * (depth * np.exp(-(d / width) ** 2))[:, None]

    body.V = pucker(body.V, BN, bE)
    thumb.V = pucker(thumb.V, TN, tE)
    ramp = 1 - smoothstep(BIND_W - 0.0012, BIND_W, A["m"])
    ramp[A["s"] > 0.14] = 0
    Vin = body.V - BN * (WALL + BIND_H * ramp)[:, None]  # inside face of the cuff wall
    body.V = body.V + BN * (BIND_H * ramp)[:, None]
    BN2 = vnormals(body.V, body.F[pid != SLOT])
    TN2 = vnormals(thumb.V, thumb.F)

    # ---- leather panels of the hand and thumb --------------------------------------------------------------------------------
    for name, code in (("HAND_BACK", HB), ("PALM", PA), ("CUFF_BACK", CB), ("CUFF_PALM", CP)):
        used, Fs = submesh(body.F, bkeep & (pid == code))
        parts[name] = dict(V=body.V[used], F=Fs, N=BN2[used], ref_s=A["s"][used])
    for name, code in (("THUMB_OUT", 0), ("THUMB_IN", 1)):
        used, Fs = submesh(thumb.F, tkeep & (tpid == code))
        parts[name] = dict(V=thumb.V[used], F=Fs, N=TN2[used], ref_s=thumb.A["s"][used])

    # outer skin for projecting stitches / the strip onto
    skinV = np.vstack([body.V, thumb.V])
    skinF = np.vstack([body.F[bkeep], thumb.F[tkeep] + len(body.V)])
    skin_pid = np.r_[pid[bkeep], np.full(tkeep.sum(), 20)]
    skinN = np.vstack([BN2, TN2])
    skin = BVHTree.FromPolygons([tuple(v) for v in skinV], [tuple(int(i) for i in f) for f in skinF])

    def on_skin(p):
        loc, nrm, fi, dist = skin.find_nearest(Vector(p))
        f = skinF[fi]
        # smooth normal: barycentric blend is overkill at this scale, the nearest corner's vertex normal is enough
        k = np.argmin(np.linalg.norm(skinV[f] - np.array(loc), axis=1))
        return np.array(loc), skinN[f[k]], skin_pid[fi], dist

    # ---- binding (outer band + rolled edge + inner band) and lining -----------------------------------------------------------
    nb = len(body.V)
    E, fa, fb = edge_faces(body.F, nb)
    pa, pb = pid[fa], np.where(fb >= 0, pid[np.maximum(fb, 0)], SLOT)
    is_edge = ((pa == BI) & (pb == SLOT)) | ((pb == BI) & (pa == SLOT))
    band_face = np.where(pa == BI, fa, fb)[is_edge]
    Eb = E[is_edge]
    # direct each boundary edge the way its band face runs (leather on the left seen from outside)
    Fb = body.F[band_face]
    dirE = np.zeros_like(Eb)
    for k in range(3):
        a, b = Fb[:, k], Fb[:, (k + 1) % 3]
        hit = ((a == Eb[:, 0]) & (b == Eb[:, 1])) | ((a == Eb[:, 1]) & (b == Eb[:, 0]))
        dirE[hit, 0], dirE[hit, 1] = a[hit], b[hit]
    nxt = {int(a): int(b) for a, b in dirE}
    assert len(nxt) == len(dirE), "binding edge is not a single clean loop"
    start = int(dirE[np.argmax(A["s"][dirE[:, 0]]), 0])  # top of the slit
    loop = [start]
    while nxt[loop[-1]] != start:
        loop.append(nxt[loop[-1]])
    assert len(loop) == len(dirE), "binding edge is not one loop (%d of %d)" % (len(loop), len(dirE))
    loop = np.array(loop)
    back = np.argmax(V0[loop, 2])  # at the back of the rim the loop must run towards +x
    if V0[loop[(back + 3) % len(loop)], 0] < V0[loop[back], 0]:
        loop = np.r_[loop[:1], loop[1:][::-1]]
    Lp = V0[loop]
    seg = np.linalg.norm(np.roll(Lp, -1, 0) - Lp, axis=1)
    larc = np.r_[0, np.cumsum(seg)][:-1]
    LOOP_LEN = float(seg.sum())
    # outward (away from the leather) direction at each loop vertex
    fn = unit(np.cross(V0[Fb[:, 1]] - V0[Fb[:, 0]], V0[Fb[:, 2]] - V0[Fb[:, 0]]))
    eo = np.zeros((nb, 3))
    ed = np.cross(V0[dirE[:, 1]] - V0[dirE[:, 0]], fn)
    np.add.at(eo, dirE[:, 0], ed)
    np.add.at(eo, dirE[:, 1], ed)
    eo = unit(eo[loop] - (eo[loop] * BN[loop]).sum(1, keepdims=True) * BN[loop])
    K = D["roll_k"]
    Aout, Bin = body.V[loop], Vin[loop]
    cen, r0 = (Aout + Bin) / 2, (Aout - Bin) / 2
    R = np.linalg.norm(r0, axis=1)
    phi = (np.arange(1, K + 1) * np.pi / (K + 1))
    roll = cen[:, None, :] + r0[:, None, :] * np.cos(phi)[None, :, None] + eo[:, None, :] * (R[:, None] * np.sin(phi)[None, :])[..., None]
    ROLL_LEN = float(np.pi * R.mean())
    W_TOT = 2 * BIND_W + ROLL_LEN
    band_mask = (pid == BI)
    used, Fband = submesh(body.F, band_mask)
    nu = len(used)
    # U (metres along the loop) for every band vertex = that of the nearest point of the loop
    dense, darc, _, _ = polyline_resample(Lp, n=max(len(loop) * 4, 16), closed=True, extra=())[0], None, None, None
    dn = len(dense)
    kd = KDTree(dn)
    for i, p in enumerate(dense):
        kd.insert(p, i)
    kd.balance()
    Uband = np.array([kd.find(p)[1] for p in V0[used]]) * (LOOP_LEN / dn)
    loop_pos = {int(v): i for i, v in enumerate(loop)}
    in_used = {int(v): i for i, v in enumerate(used)}
    for v, i in loop_pos.items():
        Uband[in_used[v]] = larc[i]
    mband = np.clip(A["m"][used], 0, BIND_W)
    li = np.array([in_used[int(v)] for v in loop])
    nl = len(loop)
    # vertex table: [outer band (nu)] [inner band (nu)] [roll (nl * K)]
    BV = np.vstack([body.V[used], Vin[used], roll.reshape(-1, 3)])
    BU = np.r_[Uband, Uband, np.repeat(larc, K)]
    BVc = np.r_[BIND_W + ROLL_LEN + mband, BIND_W - mband, np.tile(BIND_W + ROLL_LEN * (1 - np.arange(1, K + 1) / (K + 1)), nl)]
    rid = 2 * nu + np.arange(nl * K).reshape(nl, K)
    cols = np.concatenate([li[:, None], rid, (li + nu)[:, None]], 1)  # outer edge, roll, inner edge
    ia = np.arange(nl)
    ib = (ia + 1) % nl
    qa, qb, qc, qd = cols[ia, :-1], cols[ia, 1:], cols[ib, 1:], cols[ib, :-1]
    Froll = np.vstack([np.stack([qa, qb, qc], -1).reshape(-1, 3), np.stack([qa, qc, qd], -1).reshape(-1, 3)])
    # make sure the roll faces outwards (compare with the direction from the roll's centre line)
    fnr = np.cross(BV[Froll[:, 1]] - BV[Froll[:, 0]], BV[Froll[:, 2]] - BV[Froll[:, 0]])
    cenr = np.repeat(np.tile(cen, (2, 1)), K + 1, 0) if False else None
    mid = BV[Froll].mean(1)
    kdc = KDTree(nl)
    for i, p in enumerate(cen):
        kdc.insert(p, i)
    kdc.balance()
    outw = mid - np.array([cen[kdc.find(p)[1]] for p in mid])
    if ((fnr * outw).sum(1) < 0).mean() > 0.5:
        Froll = Froll[:, ::-1]
    BF = np.vstack([Fband, Fband[:, ::-1] + nu, Froll])
    BNrm = vnormals(BV, BF)
    # split vertices across the one UV seam (top of the slit, where U wraps)
    cu = BU[BF]
    wrap = (cu.max(1) - cu.min(1)) > LOOP_LEN / 2
    shift = wrap[:, None] & (cu < LOOP_LEN / 2)
    key = BF * 2 + shift
    uniq, inv = np.unique(key, return_inverse=True)
    src, sh = uniq // 2, uniq % 2
    uvm = np.stack([BU[src] + sh * LOOP_LEN, BVc[src]], 1)
    uvm[:, 0] -= uvm[:, 0].min()
    span_u = float(uvm[:, 0].max())
    parts["BINDING"] = dict(V=BV[src], F=inv.reshape(BF.shape), N=BNrm[src], uv0=np.stack([uvm[:, 0] / span_u, uvm[:, 1] / W_TOT], 1), uvm=uvm,
                            uvWidthM=span_u, uvHeightM=W_TOT)

    # lining: its own coarser copy of the cuff surface, pushed in by the wall thickness. It starts just under the binding's inner band.
    lb = loft(body_ring, BL, D["lining_edge"], pole0=False)
    LA = lb.A
    LA["aabs"] = np.where(LA["circ"] > 0, np.abs(LA["arc"] - LA["circ"] / 2), 1.0)
    for k in ("al", "arc", "circ"):
        del LA[k]
    LA["dcap"] = np.hypot(LA["aabs"], np.maximum(LA["s"] - yc, 0)) - slot_half_width(LA["s"])
    LA["m"] = smin(LA["s"], LA["dcap"], 0.014)
    LA["m"][LA["s"] > 0.14] = 1.0
    LA["tng"] = np.maximum(LA["dcap"] - 0.017, 0.004 - LA["s"])  # outline of the tongue behind the slit
    cut(lb, "tng")
    cut(lb, "m", BIND_W - 0.002)
    LN = vnormals(lb.V, lb.F)
    LVin = lb.V - LN * WALL
    lm, ls, ld = lb.face_mean("m"), lb.face_mean("s"), lb.face_mean("tng")
    lining = Soup()
    lsgn = np.where(lb.V[:, 0] >= 0, 1.0, -1.0)
    fcx = lb.V[lb.F].mean(1)[:, 0]
    lin_mask = (ls < S_IN) & (lm > BIND_W - 0.002)
    for side in (1, -1):
        used, Fs = submesh(lb.F, lin_mask & ((fcx >= 0) if side > 0 else (fcx < 0)))
        lining.add(LVin[used], Fs[:, ::-1], -LN[used], np.stack([side * LA["aabs"][used], LA["s"][used]], 1))
    # close the top of the lining
    usedl, Fl = submesh(lb.F, lin_mask)
    El, la, lb_ = edge_faces(Fl, len(usedl))
    top = El[(lb_ < 0) & (LA["s"][usedl[El[:, 0]]] > S_IN - 0.03)]
    ring = LVin[usedl[np.unique(top)]]
    cv = ring.mean(0) + np.array([0, 0.004, 0])
    capV = np.vstack([LVin[usedl], cv[None]])
    capF = np.stack([top[:, 0], top[:, 1], np.full(len(top), len(usedl))], 1)
    flip = np.cross(capV[capF[:, 1]] - capV[capF[:, 0]], capV[capF[:, 2]] - capV[capF[:, 0]])[:, 1] > 0  # must face down into the opening
    capF[flip] = capF[flip][:, ::-1]
    cu_, cF = submesh(capF, np.ones(len(capF), bool))
    lining.add(capV[cu_], cF, None, capV[cu_][:, [0, 2]])
    # tongue behind the lace slit (two layers so it is solid from both sides)
    tmask = (ld < 0) & (ls < SLOT_TOP + 0.03)
    used, Fs = submesh(lb.F, tmask)
    tuv = np.stack([lsgn[used] * LA["aabs"][used], LA["s"][used]], 1)
    lining.add(lb.V[used] - LN[used] * (WALL + 0.0012), Fs, LN[used], tuv)
    lining.add(lb.V[used] - LN[used] * (WALL + 0.0032), Fs[:, ::-1], -LN[used], tuv)
    parts["LINING"] = lining.part()

    # ---- seam curves ---------------------------------------------------------------------------------------------------------
    seams = []  # (P, N, closed, kind)

    def add_seams(V, N, E, fa, fb, keep):
        E = E[keep[fa] & keep[fb]]
        for path, closed in chains(E):
            if len(path) < 4:
                continue
            seams.append((V[path], N[path], closed, "seam"))

    add_seams(body.V, BN2, bE, bfa, bfb, bkeep)
    add_seams(thumb.V, TN2, tE, tfa, tfb, tkeep)
    # the line where the thumb joins the hand: border of the trimmed hand
    E, fa, fb = edge_faces(body.F, nb)
    ok = (fb >= 0) & (pid[fa] != SLOT) & (pid[np.maximum(fb, 0)] != SLOT) & (bkeep[fa] != bkeep[np.maximum(fb, 0)])
    tsd, tbvh = make_sd(thumb.V, thumb.F)
    for path, closed in chains(E[ok]):
        if len(path) < 6:
            continue
        P = body.V[path]
        tn = np.array([TN2[thumb.F[tbvh.find_nearest(Vector(p))[2]][0]] for p in P])
        seams.append((P, unit(BN2[path] + tn), closed, "join"))

    piping, stitches = Soup(), []
    pipe_pts = []
    prof = circle_prof(PIPE_R, D["pipe_sides"])
    resampled = []
    for P, N, closed, kind in seams:
        P = smooth_line(P, closed, 3)
        P, N, arc, total = polyline_resample(P, step=D["pipe_step"], closed=closed, extra=(N,))
        N = unit(smooth_line(N, closed, 4))
        resampled.append((P, N, closed, kind))
        pipe_pts.append(P)
        n = len(P)
        sc = np.ones(n)
        lf = np.full(n, PIPE_R * 0.42)
        if not closed:  # open ends tuck down into the leather
            for i in range(min(3, n // 2)):
                w = (i + 0.5) / 3
                sc[i] = sc[-1 - i] = 0.55 + 0.45 * w
                lf[i] = lf[-1 - i] = PIPE_R * (0.42 * w - 0.5 * (1 - w))
        # break long tubes into pieces so each unrolls to a compact atlas island
        per = max(8, int(0.11 / D["pipe_step"]))
        idx = np.arange(n + (1 if closed else 0)) % n
        for a in range(0, len(idx) - 1, per):
            ii = idx[a:a + per + 1]
            if len(ii) < 2:
                continue
            Vp, Fp, Np, uvp = sweep(P[ii], N[ii], prof, closed=False, scale=sc[ii], lift=lf[ii], caps=False)
            # tangents at the piece ends come from the whole curve so neighbouring pieces meet without a kink
            piping.add(Vp, Fp, Np, uvp)
        if not closed:
            for end, tdir in ((0, P[0] - P[1]), (-1, P[-1] - P[-2])):
                ringv = P[end] + 0  # small cap disc
                Vc_, Fc_, Nc_, uvc_ = sweep(np.stack([P[end], P[end] + unit(tdir) * 0.0006]), np.stack([N[end], N[end]]), prof * sc[end], closed=False,
                                            lift=np.full(2, lf[end]), caps=True)
                piping.add(Vc_, Fc_, Nc_, uvc_)
    parts["PIPING"] = piping.part()
    allpipe = np.vstack(pipe_pts)
    kdp = KDTree(len(allpipe))
    for i, p in enumerate(allpipe):
        kdp.insert(p, i)
    kdp.balance()

    # ---- stitch rows ---------------------------------------------------------------------------------------------------------
    rows = []
    for P, N, closed, kind in resampled:
        off = 0.0050 if kind == "join" else 0.0046
        T = unit(np.roll(P, -1, 0) - np.roll(P, 1, 0)) if closed else unit(np.gradient(P, axis=0))
        side = np.cross(T, N)
        for sg in (1, -1):
            rows.append((P + side * (sg * off), closed, 0.0034))
    # one row along the binding, just inside its edge
    Lps = smooth_line(body.V[loop], True, 2)
    rows.append((Lps - eo * (BIND_W - 0.0024), True, 0.0010))
    PITCH, DASH = D["pitch"], 0.0028
    dashes = []
    for Q, closed, clear in rows:
        Q, arc, total = polyline_resample(Q, step=0.0006, closed=closed)
        nd = int(total / PITCH)
        for k in range(nd):
            a0 = k * PITCH + 0.0008
            p0 = np.array([np.interp(a0, arc, Q[:, c]) for c in range(3)])
            p1 = np.array([np.interp(a0 + DASH, arc, Q[:, c]) for c in range(3)])
            l0, n0, id0, d0 = on_skin(p0)
            l1, n1, id1, d1 = on_skin(p1)
            if max(d0, d1) > 0.0022 or (clear > 0.002 and (id0 == BI or id1 == BI)):
                continue
            if clear > 0.002 and kdp.find((l0 + l1) / 2)[2] < clear:
                continue
            if abs(np.linalg.norm(l1 - l0) - DASH) > 0.0012:
                continue
            dashes.append((l0, l1, unit(n0 + n1)))
    st = Soup()
    if dashes:
        P0 = np.array([d[0] for d in dashes])
        P1 = np.array([d[1] for d in dashes])
        Nn = np.array([d[2] for d in dashes])
        Tn = unit(P1 - P0)
        Sd = unit(np.cross(Tn, Nn))
        nd = len(dashes)
        if D["stitch"] == "prism":
            px = np.array([-0.00055, -0.00030, 0.00030, 0.00055])
            py = np.array([-0.00015, 0.00042, 0.00042, -0.00015])
            ends = np.stack([P0 - Tn * 0.0002, P1 + Tn * 0.0002], 1)  # (nd, 2, 3)
            Vd = ends[:, :, None, :] + Sd[:, None, None, :] * px[None, None, :, None] + Nn[:, None, None, :] * py[None, None, :, None]
            Vd = Vd.reshape(nd, 8, 3)
            Fd = np.array([[0, 4, 5], [0, 5, 1], [1, 5, 6], [1, 6, 2], [2, 6, 7], [2, 7, 3], [0, 1, 2], [0, 2, 3], [4, 6, 5], [4, 7, 6]])
            vv = np.array([0, 0.0007, 0.0013, 0.0020])
            cell_w, cell_h = DASH + 0.0004 + 0.0012, 0.0020 + 0.0012
            ncol = max(1, int(math.sqrt(nd * cell_h / cell_w)))
            gi = np.arange(nd)
            ox, oy = (gi % ncol) * cell_w, (gi // ncol) * cell_h
            uvd = np.stack([np.repeat(np.array([0, DASH + 0.0004]), 4)[None, :] + ox[:, None], np.tile(vv, 2)[None, :] + oy[:, None]], -1)
            Fall = (Fd[None] + (np.arange(nd) * 8)[:, None, None]).reshape(-1, 3)
            Vall = Vd.reshape(-1, 3)
            # check winding against the surface normal once
            fn0 = np.cross(Vall[Fall[2, 1]] - Vall[Fall[2, 0]], Vall[Fall[2, 2]] - Vall[Fall[2, 0]])
            if fn0 @ Nn[0] < 0:
                Fall = Fall[:, ::-1]
            st.add(Vall, Fall, None, uvd.reshape(-1, 2))
        else:
            hw = 0.0007
            Vd = np.stack([P0 - Sd * hw, P0 + Sd * hw, P1 + Sd * hw, P1 - Sd * hw], 1) + Nn[:, None, :] * 0.00045
            Fd = np.array([[0, 1, 2], [0, 2, 3]])
            Fall = (Fd[None] + (np.arange(nd) * 4)[:, None, None]).reshape(-1, 3)
            Vall = Vd.reshape(-1, 3)
            fn0 = np.cross(Vall[Fall[0, 1]] - Vall[Fall[0, 0]], Vall[Fall[0, 2]] - Vall[Fall[0, 0]])
            if fn0 @ Nn[0] < 0:
                Fall = Fall[:, ::-1]
            st.add(Vall, Fall, np.repeat(Nn, 4, 0), None)
    parts["STITCHING"] = st.part()

    # ---- thumb strip ---------------------------------------------------------------------------------------------------------
    joins = [(P, N, c) for P, N, c, kind in resampled if kind == "join"]
    assert joins, "the thumb does not meet the hand"
    parts["THUMB_STRIP"] = build_strip(max(joins, key=lambda j: len(j[0])), on_skin, D)

    # ---- laces ---------------------------------------------------------------------------------------------------------------
    parts["LACES"] = build_laces(D)

    # ---- stand it on y = 0 and centre it -------------------------------------------------------------------------------------
    allv = np.vstack([p["V"] for p in parts.values()])
    lo, hi = allv.min(0), allv.max(0)
    shift = np.array([-(lo[0] + hi[0]) / 2, -lo[1], -(lo[2] + hi[2]) / 2])
    for p in parts.values():
        p["V"] = p["V"] + shift
    allv = np.vstack([p["V"] for p in parts.values()])
    print("bounds", np.round(allv.min(0), 4), np.round(allv.max(0), 4), "fist half width", round(float(_W(0.22)), 4))
    print("built", round(time.time() - t0, 1), "s;", {k: len(v["F"]) for k, v in parts.items()}, "total", sum(len(v["F"]) for v in parts.values()))
    return parts, shift


def build_strip(join, on_skin, D):
    """The short strap that ties the thumb to the fist at the top of the thumb. It bridges the crease where the two meet:
    one open sheet lying on the thumb, spanning the crease, lying on the fist, with its long edges turned under."""
    P, N, closed = join
    n = len(P)
    half = max(2, int(round(0.013 / D["pipe_step"])))
    i0 = int(np.argmax(P[:, 1]))
    ii = (i0 + np.arange(-half, half + 1)) % n
    Pc, Nc = P[ii], N[ii]
    T = unit(np.gradient(Pc, axis=0))
    E = unit(np.cross(T, Nc))
    nk = 15 if D["stitch"] == "prism" else 9
    ds = (0.0140, 0.0100, 0.0058)
    rows = []
    for p, nn, e in zip(Pc, Nc, E):
        ctrl = []
        for sg in (1, -1):
            side = []
            for d, lift in zip(ds, (0.0003, 0.0007, 0.0009)):
                loc, nrm, _, _ = on_skin(p + e * (sg * d) + nn * 0.004)
                side.append(loc + nrm * lift)
            ctrl.append(side)
        mid = (ctrl[0][-1] + ctrl[1][-1]) / 2 + nn * 0.0006
        path = ctrl[0] + [mid] + ctrl[1][::-1]
        rows.append(polyline_resample(catmull(np.array(path), 8), n=nk)[0])
    G = np.array(rows)  # (along the crease, across it, 3)
    nrm = unit(np.cross(np.gradient(G, axis=0), np.gradient(G, axis=1)))
    if (nrm * Nc[:, None, :]).sum() < 0:
        nrm = -nrm
    w_dir = unit(G[-1] - G[0])
    tuck = (np.sin(np.linspace(0, np.pi, nk)) ** 0.7)[:, None]  # the edges only turn under where the strap is in the air
    lo = G[0] - nrm[0] * 0.0024 * tuck - w_dir * 0.0006 * tuck
    hi = G[-1] - nrm[-1] * 0.0024 * tuck + w_dir * 0.0006 * tuck
    G = np.concatenate([lo[None], G, hi[None]], 0)
    na = G.shape[0]
    idx = np.arange(na * nk).reshape(na, nk)
    a, b, c_, d = idx[:-1, :-1], idx[1:, :-1], idx[1:, 1:], idx[:-1, 1:]
    F = np.vstack([np.stack([a, b, c_], -1).reshape(-1, 3), np.stack([a, c_, d], -1).reshape(-1, 3)])
    V = G.reshape(-1, 3)
    Nv = vnormals(V, F)
    if (Nv.reshape(na, nk, 3)[1:-1] * nrm).sum() < 0:
        F = F[:, ::-1]
        Nv = -Nv
    # flat coordinates in metres: A along the crease, B across it. Whichever points more "up the glove" becomes V.
    da = np.r_[0, np.cumsum(np.linalg.norm(np.diff(G, axis=0), axis=2).mean(1))]
    db = np.r_[0, np.cumsum(np.linalg.norm(np.diff(G, axis=1), axis=2).mean(0))]
    ea = unit(G[-1, nk // 2] - G[0, nk // 2])
    eb = unit(G[na // 2, -1] - G[na // 2, 0])
    nmid = Nv.reshape(na, nk, 3)[na // 2, nk // 2]
    Agrid, Bgrid = np.broadcast_arrays(da[:, None], db[None, :])
    if abs(ea[1]) >= abs(eb[1]):
        vcoord, ev, ucoord, eu, ulen, vlen = Agrid, ea, Bgrid, eb, db[-1], da[-1]
    else:
        vcoord, ev, ucoord, eu, ulen, vlen = Bgrid, eb, Agrid, ea, da[-1], db[-1]
    if ev[1] < 0:
        vcoord, ev = vlen - vcoord, -ev
    if np.cross(eu, ev) @ nmid < 0:
        ucoord = ulen - ucoord
    uvm = np.stack([ucoord, vcoord], -1).reshape(-1, 2)
    return dict(V=V, F=F, N=Nv, uvm=uvm, uv0=uvm / np.array([ulen, vlen]), uvWidthM=float(ulen), uvHeightM=float(vlen))


def build_laces(D):
    """Flat lace criss-crossed over the slit: each run comes up out of an eyelet, crosses, and dives under the far edge; tied in a bow at the wrist end."""
    laces = Soup()
    prof = circle_prof(LACE_HW, D["lace_prof"], flat=LACE_HT / LACE_HW)
    prof = np.stack([np.sign(prof[:, 0]) * np.abs(prof[:, 0] / LACE_HW) ** 0.6 * LACE_HW, prof[:, 1]], 1)  # squarer, ribbon-like section
    th = 2 * LACE_HT
    clear = BIND_H + LACE_HT + 0.0003

    def S(a, y, h=0.0):
        p, n = cuff_surface(a, y)
        return p + n * h, n

    def run(ctrl, nrm):
        P = catmull(np.array(ctrl), 14)
        Nn = catmull(np.array(nrm), 14)
        P, Nn, _, _ = polyline_resample(P, step=D["lace_step"], extra=(Nn,))
        V, F, N, uv = sweep(P, unit(Nn), prof, closed=False, caps=True)
        laces.add(V, F, N, uv)

    ys = EYE_Y0 + EYE_PITCH * np.arange(N_EYE)

    def eye_a(y):
        return slot_half_width(y) + BIND_W + 0.0050

    for i in range(N_EYE - 1, 0, -1):
        for sg in (1, -1):
            y0, y1 = ys[i], ys[i - 1]
            a0 = sg * eye_a(y0)
            a_edge0 = sg * (slot_half_width(y0) + 0.001)
            a_edge1 = -sg * (slot_half_width(y1) - 0.0002)
            over = th * 1.15 if (sg > 0) == (i % 2 == 0) else 0.0
            c, n = [], []
            for (a, y, h) in ((a0, y0, -0.004), (a0 * 0.97, y0, clear), (a_edge0, y0 - 0.0012, clear + 0.0002)):
                p, nn = S(a, y, h)
                c.append(p)
                n.append(nn)
            pe, ne = S(a_edge1, y1 + 0.0012, -0.0012)
            pm, nm = S(0.0, (y0 + y1) / 2)
            c.append((c[-1] + pe) / 2 + nm * over)
            n.append(nm)
            c.append(pe)
            n.append(ne)
            pd, nd_ = S(-sg * (slot_half_width(y1) + 0.006), y1, -(WALL * 0.62))
            c.append(pd)
            n.append(nd_)
            run(c, n)
    # bow at the wrist end: both ends come out of the lowest eyelets, meet in a knot over the slit, two loops and two tails
    y0 = ys[0]
    kp, kn = S(0.0, y0 - 0.0005)
    chord_l, _ = S(-slot_half_width(y0), y0, clear)
    chord_r, _ = S(slot_half_width(y0), y0, clear)
    knot_c = (chord_l + chord_r) / 2 + kn * 0.0006
    for sg in (1, -1):
        c, n = [], []
        for (a, y, h) in ((sg * eye_a(y0), y0, -0.004), (sg * eye_a(y0) * 0.97, y0, clear), (sg * (slot_half_width(y0) + 0.001), y0, clear + 0.0002)):
            p, nn = S(a, y, h)
            c.append(p)
            n.append(nn)
        c.append(knot_c + kn * 0.0002)
        n.append(kn)
        run(c, n)
        # loop: out along the cuff and back, lying on the leather
        lh = clear + th * 0.9
        loop_pts = [(0.000, 0.0000, 0.0016), (0.010, 0.0052, lh + 0.0010), (0.024, 0.0096, lh), (0.036, 0.0072, lh), (0.0405, 0.0010, lh), (0.035, -0.0046, lh),
                    (0.022, -0.0052, lh + th), (0.010, -0.0026, lh + th * 1.3), (0.000, -0.0004, 0.0030)]
        c, n = [], []
        for j, (a, dy, h) in enumerate(loop_pts):
            if j in (0, len(loop_pts) - 1):
                c.append(knot_c + kn * h)
                n.append(kn)
            else:
                p, nn = S(sg * a, y0 + dy, h)
                c.append(p)
                n.append(nn)
        run(c, n)
        tail = [(0.000, 0.0000, 0.0022), (0.007, -0.0058, lh + th * 2.0), (0.016, -0.0112, lh + th * 0.4), (0.0235, -0.0150, lh), (0.0285, -0.0166, lh)]
        c, n = [], []
        for j, (a, dy, h) in enumerate(tail):
            if j == 0:
                c.append(knot_c + kn * h)
                n.append(kn)
            else:
                p, nn = S(sg * a, y0 + dy, h)
                c.append(p)
                n.append(nn)
        run(c, n)
    # the knot: a short wrap of lace round the middle
    kt = unit(np.cross(kn, np.array([1.0, 0, 0])))
    ksd = np.cross(kt, kn)
    ang = np.linspace(0, 2 * np.pi, 10 if D["lace_prof"] > 4 else 6, endpoint=False)
    ringP = knot_c + kn * 0.0022 + (np.cos(ang)[:, None] * ksd * 0.0026 + np.sin(ang)[:, None] * kn * 0.0026)
    ringN = unit(ringP - (knot_c + kn * 0.0022))
    kprof = circle_prof(0.0024, 6 if D["lace_prof"] > 4 else 4, flat=0.55)
    V, F, N, uv = sweep(ringP, ringN, kprof, closed=True)
    laces.add(V, F, N, uv)
    return laces.part()


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


def decal_uvs(parts):
    """Per-panel decal UVs: flatten, turn so +V is up the glove and +U runs left to right seen from outside, stretch to fill 0..1."""
    for name in ("HAND_BACK", "PALM", "THUMB_OUT", "THUMB_IN", "CUFF_BACK", "CUFF_PALM"):
        p = parts[name]
        V, F = p["V"], p["F"]
        comp = components(F, len(V))
        assert len(np.unique(comp)) == 1, "%s is in %d pieces" % (name, len(np.unique(comp)))
        uv = bl_unwrap(V, F)
        sa = uv_area(uv, F)
        assert (sa > 0).mean() > 0.995, "%s unwrap has flipped faces (%.3f)" % (name, (sa > 0).mean())
        scale = math.sqrt(area3(V, F).sum() / sa.sum())  # metres per UV unit
        uv = uv * scale
        w = np.zeros(len(V))
        fa = area3(V, F)
        for k in range(3):
            np.add.at(w, F[:, k], fa)
        navg = unit((p["N"] * w[:, None]).sum(0))
        up = np.array([0.0, 1.0, 0.0])
        right = unit(np.cross(up, navg))
        sel = np.ones(len(V), bool)
        if name == "HAND_BACK":
            sel = (p["ref_s"] < 0.20) & (p["N"] @ navg > 0.3)
        ref = np.stack([V @ right, p["ref_s"]], 1)
        a = uv[sel] - np.average(uv[sel], axis=0, weights=w[sel])
        b = ref[sel] - np.average(ref[sel], axis=0, weights=w[sel])
        H = (a * w[sel][:, None]).T @ b
        U_, _, Vt = np.linalg.svd(H)
        Rm = (U_ @ np.diag([1, np.linalg.det(U_ @ Vt)]) @ Vt)  # proper rotation taking the flat panel onto (right, up)
        uv = uv @ Rm
        uv -= uv.min(0)
        size = uv.max(0)
        p["uvm"] = uv
        p["uv0"] = uv / size
        p["uvWidthM"], p["uvHeightM"] = float(size[0]), float(size[1])
        # stretch report: how far each triangle's flat area is from its real area
        ratio = uv_area(uv, F) / np.maximum(fa, 1e-12)
        fsel = sel[F].all(1)
        print("decal %-10s %.3f x %.3f m, area stretch 5..95%%: %.2f..%.2f (branding area %.2f..%.2f)" % (
            name, size[0], size[1], np.percentile(ratio, 5), np.percentile(ratio, 95), np.percentile(ratio[fsel], 5), np.percentile(ratio[fsel], 95)))
    for name in NAMES:
        p = parts[name]
        if "isl" not in p:
            p["isl"] = np.zeros(len(p["V"]), int)
        if "uv0" not in p:
            p["uv0"] = np.zeros((len(p["V"]), 2))


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
    """Ambient occlusion of the whole glove (all twelve meshes shadowing each other) baked onto the atlas UV set."""
    sc = bpy.context.scene
    setup_cycles(samples)
    world = bpy.data.worlds.new("bake_world")
    sc.world = world
    world.light_settings.distance = 0.10
    img = bpy.data.images.new("glove_ao_bake", size, size, alpha=True, float_buffer=True, is_data=True)
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


PALETTE = dict(HAND_BACK="#7d1712", PALM="#7d1712", THUMB_OUT="#7d1712", THUMB_IN="#7d1712", THUMB_STRIP="#7d1712", CUFF_BACK="#7d1712", CUFF_PALM="#7d1712",
               BINDING="#eeece6", PIPING="#c8954d", STITCHING="#eeece6", LACES="#eeece6", LINING="#141416")
PANEL_MAP = dict(HAND_BACK="#e6194b", PALM="#3cb44b", THUMB_OUT="#4363d8", THUMB_IN="#f58231", THUMB_STRIP="#ffe119", CUFF_BACK="#911eb4", CUFF_PALM="#42d4f4",
                 BINDING="#f032e6", PIPING="#ffffff", STITCHING="#111111", LACES="#bfef45", LINING="#555555")
VIEWS = {  # name: (camera position, target) in web axes
    "back-of-hand": ((0.0, 0.20, 1.25), (0, 0.152, 0)),
    "palm-lace-side": ((0.0, 0.20, -1.25), (0, 0.152, 0)),
    "thumb-side": ((-1.25, 0.20, 0.0), (0, 0.152, 0)),
    "three-quarter-front": ((-0.62, 0.52, 0.95), (0, 0.150, 0)),
}
EXTRA_VIEWS = {
    "x-palm-three-quarter": ((-0.75, 0.38, -0.95), (0, 0.152, 0)),
    "x-top": ((-0.25, 1.25, 0.25), (0, 0.16, 0)),
    "x-little-finger-side": ((1.25, 0.20, 0.0), (0, 0.152, 0)),
    "x-into-cuff": ((0.25, -0.75, -0.75), (0, 0.10, 0)),
    "x-strip": ((-0.30, 0.48, -0.26), (-0.035, 0.245, -0.035)),
    "x-strip2": ((-0.40, 0.42, 0.20), (-0.035, 0.245, -0.03)),
}


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


def preview_material(name, color, ao_img, grain_img, tiles, flat=False):
    m = bpy.data.materials.new("P_" + name)
    m.use_nodes = True
    nt = m.node_tree
    b = nt.nodes.get("Principled BSDF")
    b.inputs["Base Color"].default_value = (*hexc(color), 1)
    b.inputs["Roughness"].default_value = 0.42 if name in LEATHER else 0.6
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


def render_set(objs, folder, prefix, views, height, samples, ao_path=None, grain_path=None, tiles=1.0):
    setup_cycles(samples)
    cam = studio()
    ao_img = grain_img = None
    if ao_path:
        ao_img = bpy.data.images.load(ao_path)
        ao_img.colorspace_settings.name = "Non-Color"
        grain_img = bpy.data.images.load(grain_path)
        grain_img.colorspace_settings.name = "Non-Color"
    for o in objs:
        o.data.materials.clear()
        o.data.materials.append(preview_material(o.name, PALETTE[o.name], ao_img, grain_img, tiles))
    for vname, (pos, tgt) in views.items():
        aim(cam, pos, tgt)
        render(os.path.join(folder, prefix + vname + ".png"), int(height * 0.8), height)
    return cam


def gltf_export(path, uvs=True):
    bpy.ops.object.select_all(action="SELECT")
    bpy.ops.export_scene.gltf(filepath=path, export_format="GLB", export_apply=True, export_yup=True, export_extras=True, use_selection=False,
                              export_texcoords=uvs, export_normals=True, export_draco_mesh_compression_enable=False, export_cameras=False, export_lights=False,
                              export_animations=False)
    print("WROTE", path, os.path.getsize(path))


# ------------------------------------------------------------------------------------------------------------------------------------
# main
# ------------------------------------------------------------------------------------------------------------------------------------


def panel_stats(p):
    V, F = p["V"], p["F"]
    fn = np.cross(V[F[:, 1]] - V[F[:, 0]], V[F[:, 2]] - V[F[:, 0]])
    ar = np.linalg.norm(fn, axis=1) / 2
    cen = (V[F].mean(1) * ar[:, None]).sum(0) / ar.sum()
    return [round(float(x), 5) for x in cen], [round(float(x), 4) for x in unit(fn.sum(0))], len(F)


def main():
    gdir = os.path.join(OUT, "gloves")
    sdir = os.path.join(OUT, "store")
    os.makedirs(gdir, exist_ok=True)
    os.makedirs(sdir, exist_ok=True)
    scratch = REPORTS or "."
    if REPORTS:
        os.makedirs(REPORTS, exist_ok=True)

    reset()
    parts, _ = build(FULL)
    if QUICK:
        objs = [make_obj(n, parts[n]["V"], parts[n]["F"], parts[n].get("N")) for n in NAMES]
        render_set(objs, scratch, "quick-", {**VIEWS, **EXTRA_VIEWS}, 800, 24)
        for o in objs:
            o.data.materials.clear()
            o.data.materials.append(preview_material(o.name, PANEL_MAP[o.name], None, None, 1, flat=True))
        for vname in ("back-of-hand", "palm-lace-side", "thumb-side", "x-palm-three-quarter"):
            pos, tgt = {**VIEWS, **EXTRA_VIEWS}[vname]
            aim(bpy.context.scene.camera, pos, tgt)
            render(os.path.join(scratch, "quick-panels-" + vname + ".png"), 640, 800)
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
    # ---- grain ------------------------------------------------------------------------------------------------------------------
    grain_path = os.path.join(gdir, "leather-grain-normal.webp")
    grain = leather_grain.normal_map(GRAIN_SIZE)
    wrap, inner = leather_grain.tile_error(grain)
    assert wrap <= inner * 1.05, "grain does not tile (%.4f across the wrap, %.4f inside)" % (wrap, inner)
    save_rgb(grain, grain_path, 95)
    # ---- AO ---------------------------------------------------------------------------------------------------------------------
    ao_path = os.path.join(gdir, "glove-ao.webp")
    bake_ao(objs, ao_path, BAKE_SIZE, BAKE_SAMPLES)
    # ---- export + json ----------------------------------------------------------------------------------------------------------
    glb = os.path.join(gdir, "glove.glb")
    gltf_export(glb)
    allv = np.vstack([p["V"] for p in parts.values()])
    meta = dict(version=1, units="m", bounds=dict(min=[round(float(x), 5) for x in allv.min(0)], max=[round(float(x), 5) for x in allv.max(0)]),
                atlasTilesPerUnit=round(tiles, 4), panels={})
    for n in NAMES:
        cen, nrm, nt = panel_stats(parts[n])
        d = dict(centroid=cen, normal=nrm)
        if n in LEATHER:
            d["uvWidthM"] = round(parts[n]["uvWidthM"], 5)
            d["uvHeightM"] = round(parts[n]["uvHeightM"], 5)
        d["triangles"] = nt
        meta["panels"][n] = d
    with open(os.path.join(gdir, "glove.json"), "w") as fh:
        json.dump(meta, fh, indent=2)
    print("WROTE", os.path.join(gdir, "glove.json"))
    # ---- renders of the single glove --------------------------------------------------------------------------------------------
    if REPORTS and not NO_RENDERS:
        render_set(objs, REPORTS, "glove ", VIEWS, 1200, 160, ao_path, grain_path, tiles)
        render_set_extra = {"palm three-quarter": EXTRA_VIEWS["x-palm-three-quarter"], "little-finger side": EXTRA_VIEWS["x-little-finger-side"],
                            "into the cuff": EXTRA_VIEWS["x-into-cuff"], "top": EXTRA_VIEWS["x-top"]}
        for vname, (pos, tgt) in render_set_extra.items():
            aim(bpy.context.scene.camera, pos, tgt)
            render(os.path.join(REPORTS, "glove extra " + vname + ".png"), 960, 1200)
        for o in objs:
            o.data.materials.clear()
            o.data.materials.append(preview_material(o.name, PANEL_MAP[o.name], None, None, 1, flat=True))
        # panel map: four views side by side would need compositing; two plain views are enough to check every boundary
        for vname in ("back-of-hand", "palm-lace-side", "thumb-side", "three-quarter-front"):
            aim(bpy.context.scene.camera, *VIEWS[vname])
            render(os.path.join(REPORTS, "panel map " + vname + ".png"), 960, 1200)

    # ---- display pair -----------------------------------------------------------------------------------------------------------
    reset()
    lp, _ = build(LIGHT)
    groups = dict(leather=(["HAND_BACK", "PALM", "THUMB_OUT", "THUMB_IN", "THUMB_STRIP", "CUFF_BACK", "CUFF_PALM"], "#111316"), piping=(["PIPING"], "#c8954d"),
                  ivory=(["BINDING", "LACES", "STITCHING"], "#eeece6"), lining=(["LINING"], "#0c0c0e"))
    pair_objs = []
    gap, yaw = 0.012, math.radians(14)
    for side in (1, -1):  # +1 = the right glove as built, -1 = its mirror image (a left glove)
        for gname, (members, col) in groups.items():
            V = np.vstack([lp[m]["V"] for m in members])
            off = np.cumsum([0] + [len(lp[m]["V"]) for m in members])
            F = np.vstack([lp[m]["F"] + off[i] for i, m in enumerate(members)])
            N = np.vstack([lp[m]["N"] for m in members])
            if gname == "leather":  # weld the panels so the leather shades as one skin across the seams
                key = np.round(V / 2e-5).astype(np.int64)
                _, first, inv = np.unique(key, axis=0, return_index=True, return_inverse=True)
                V, F = V[first], inv.ravel()[F]
                F = F[(F[:, 0] != F[:, 1]) & (F[:, 1] != F[:, 2]) & (F[:, 2] != F[:, 0])]
                N = vnormals(V, F)
            if side < 0:
                V = V * np.array([-1, 1, 1])
                N = N * np.array([-1, 1, 1])
                F = F[:, ::-1]
            # stand them side by side, thumbs facing each other's way in, turned slightly towards one another
            half = (V[:, 0].max() - V[:, 0].min())
            pair_objs.append((side, gname, col, V, F, N))
    # placement: use the leather bounds of each glove
    placed = []
    for side in (1, -1):
        items = [it for it in pair_objs if it[0] == side]
        allv = np.vstack([it[3] for it in items])
        ang = yaw * side
        ca, sa = math.cos(ang), math.sin(ang)
        Rm = np.array([[ca, 0, sa], [0, 1, 0], [-sa, 0, ca]])
        rot = allv @ Rm.T
        # the right glove (thumb on -x) goes on the +x side so the thumbs meet in the middle
        dx = (gap / 2 - rot[:, 0].min()) if side > 0 else (-gap / 2 - rot[:, 0].max())
        for (_, gname, col, V, F, N) in items:
            placed.append((side, gname, col, V @ Rm.T + np.array([dx, 0, 0]), F, N @ Rm.T))
    allv = np.vstack([it[3] for it in placed])
    lo, hi = allv.min(0), allv.max(0)
    shift = np.array([-(lo[0] + hi[0]) / 2, -lo[1], -(lo[2] + hi[2]) / 2])
    mats = {g: mat("M_GLOVES_" + g.upper(), hexc(c), 0.45) for g, (_, c) in groups.items()}
    for g in groups:  # one mesh per material, both gloves together
        its = [it for it in placed if it[1] == g]
        V = np.vstack([it[3] for it in its]) + shift
        off = np.cumsum([0] + [len(it[3]) for it in its])
        F = np.vstack([it[4] + off[i] for i, it in enumerate(its)])
        N = np.vstack([it[5] for it in its])
        make_obj("GLOVES_" + g.upper(), V, F, N, material=mats[g])
    pair_path = os.path.join(sdir, "gloves.glb")
    gltf_export(pair_path, uvs=False)
    assert os.path.getsize(pair_path) <= 500_000, "display pair is %d bytes, over the 500 KB limit" % os.path.getsize(pair_path)
    if REPORTS and not NO_RENDERS:
        setup_cycles(160)
        cam = studio()
        aim(cam, (0.25, 0.42, 1.55), (0, 0.15, 0))
        render(os.path.join(REPORTS, "display pair.png"), 1500, 1200)

    verify(glb, pair_path, meta)


def verify(glb, pair_path, meta):
    """Re-import the customiser glove into an empty scene and check it against the contract."""
    reset()
    bpy.ops.import_scene.gltf(filepath=glb)
    names = {o.name: o for o in bpy.data.objects if o.type == "MESH"}
    assert set(names) == set(NAMES), "node names differ: %s" % sorted(set(names) ^ set(NAMES))
    lo, hi = np.full(3, 1e9), np.full(3, -1e9)
    total = 0
    for n in NAMES:
        o = names[n]
        assert not o.children and o.parent is None, n + " has a parent or children"
        me = o.data
        layers = [l.name for l in me.uv_layers]
        assert len(layers) == 2, "%s has %d UV layers" % (n, len(layers))
        co = np.zeros(len(me.vertices) * 3)
        me.vertices.foreach_get("co", co)
        co = co.reshape(-1, 3)
        w = np.array([[v.x, v.z, -v.y] for v in (o.matrix_world @ Vector(c) for c in co[:: max(1, len(co) // 4000)])])
        lo, hi = np.minimum(lo, w.min(0)), np.maximum(hi, w.max(0))
        me.calc_loop_triangles()
        nt = len(me.loop_triangles)
        total += nt
        uvr = []
        for l in me.uv_layers:
            uv = np.zeros(len(me.loops) * 2)
            l.data.foreach_get("uv", uv)
            uv = uv.reshape(-1, 2)
            uvr.append("%.2f..%.2f" % (uv.min(), uv.max()))
        extras = {k: o[k] for k in o.keys() if k.startswith("uv")}
        print("VERIFY %-12s tris %6d  uv0 %s  uv1 %s  %s  material %s" % (n, nt, uvr[0], uvr[1], extras, me.materials[0].name if me.materials else None))
        if n in LEATHER:
            # decal orientation as it comes back out of the file: unmirrored, +U to the right seen from outside, +V up the glove
            vi = np.array([[me.loops[i].vertex_index for i in t.loops] for t in me.loop_triangles])
            li = np.array([list(t.loops) for t in me.loop_triangles])
            d0 = np.zeros(len(me.loops) * 2)
            me.uv_layers[0].data.foreach_get("uv", d0)
            d0 = d0.reshape(-1, 2)
            ta = uv_area(d0, li)
            wco = np.stack([co[:, 0], co[:, 2], -co[:, 1]], 1)  # web axes
            nrm = np.array(meta["panels"][n]["normal"])
            right = unit(np.cross([0, 1, 0], nrm))
            uu, vv = d0[li.ravel(), 0], d0[li.ravel(), 1]
            pr, py = wco[vi.ravel()] @ right, wco[vi.ravel(), 1]
            cu, cv2 = np.corrcoef(uu, pr)[0, 1], np.corrcoef(vv, py)[0, 1]
            print("VERIFY   decal %-11s unmirrored faces %.3f, corr(U, right) %+.2f, corr(V, up) %+.2f" % (n, (ta > 0).mean(), cu, cv2))
            assert (ta >= 0).mean() > 0.995, n + " decal is mirrored or folded"
            if n not in ("BINDING", "THUMB_STRIP"):
                assert cu > 0.5 and cv2 > 0.5, n + " decal is not upright"
            assert "uvWidthM" in o and "uvHeightM" in o, n + " lost its decal size extras"
            assert meta["panels"][n]["triangles"] == nt, n + " triangle count differs from glove.json"
        assert me.materials and me.materials[0].name == "M_" + n
    print("VERIFY bounds (web axes) min", np.round(lo, 4), "max", np.round(hi, 4), "total tris", total)
    assert abs(lo[1]) < 1e-4 and 0.28 < hi[1] < 0.32, "height / base out of contract"
    assert abs(lo[0] + hi[0]) < 2e-3 and abs(lo[2] + hi[2]) < 2e-3, "not centred"
    thumb = names["THUMB_OUT"]
    tx = np.mean([(thumb.matrix_world @ v.co).x for v in thumb.data.vertices])
    hb = names["HAND_BACK"]
    low = [v for v in hb.data.vertices if (hb.matrix_world @ v.co).z < 0.19]  # the flat back of the hand, below the knuckles
    hz = np.mean([-(hb.matrix_world.to_3x3() @ v.normal).y for v in low])
    print("VERIFY thumb mean x %.4f (must be negative), back-of-hand mean outward normal z %.3f (must be positive)" % (tx, hz))
    assert tx < 0 and hz > 0
    for p in (glb, pair_path, os.path.join(os.path.dirname(glb), "glove-ao.webp"), os.path.join(os.path.dirname(glb), "leather-grain-normal.webp"),
              os.path.join(os.path.dirname(glb), "glove.json")):
        print("VERIFY size %8d  %s" % (os.path.getsize(p), p))
    reset()
    bpy.ops.import_scene.gltf(filepath=pair_path)
    tp = 0
    for o in bpy.data.objects:
        if o.type == "MESH":
            o.data.calc_loop_triangles()
            tp += len(o.data.loop_triangles)
    print("VERIFY pair tris", tp, "size", os.path.getsize(pair_path))
    print("VERIFY OK")


main()
