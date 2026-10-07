"""Builds the original Sanchez full-face boxing head guard for the web customiser, entirely from maths (no imported or downloaded meshes).
Run headless from the repo root:

    /Applications/Blender.app/Contents/MacOS/Blender -b -P tools/headguard/build_headguard.py -- --out apps/web/public/assets --reports "<folder for preview PNGs>"

Writes (under --out):
    headguard/headguard.glb       the head guard, thirteen named meshes, two UV sets (decal + atlas), grey materials
    headguard/headguard-ao.webp   ambient occlusion baked in Cycles on the atlas UV set (linear data, greyscale stored as RGB)
    headguard/headguard.json      bounds, panel centroids / normals / decal sizes, atlasTilesPerUnit
    store/head-guard.glb          light display copy for the shop wall (plain colours, no textures)
and, under --reports, the preview renders. The leather grain normal map is shared with the glove (gloves/leather-grain-normal.webp under
--out); it is only read here, for the previews. Optional flags: --quick (coarse mesh, no bake, small clay previews; for shaping work only),
--bake-samples N, --bake-size N, --no-renders.

All geometry is written in the web scene's axes (three.js / glTF: x right, y up, z towards the viewer) and converted to Blender's on the way in.
The head guard stands upright as worn: chin / nape edge at y = 0, face opening towards +z, the wearer's left (`_R` parts) on +x.

How it is made: the inside of the shell (the lining) is one lofted barrel. It is cut into panels along smooth seam curves by splitting
triangles exactly where a seam function crosses zero (the cutter from tools/gloves/build_glove.py), the three open edges (face opening, top,
bottom) are cut the same way, and the outside is that surface pushed out by a padding thickness that is plump in the middle of every panel
and pinched down at its seams and bound edges. Bindings, stitches, the top tabs, the lace and the back strap are built on top of that.
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
BAKE_SIZE = int(arg("--bake-size", 2048))
BAKE_SAMPLES = int(arg("--bake-samples", 384))
GRAIN_TILE_M = 0.04  # one tile of the grain covers 4 cm of leather

PANELS = ["FOREHEAD", "CHEEK_L", "CHEEK_R", "CHIN", "SIDE_L", "SIDE_R", "BACK_PAD"]
LEATHER = PANELS + ["STRAP", "TOP_TABS", "LINING", "BINDING"]
OTHERS = ["STITCHING", "LACES"]
NAMES = LEATHER + OTHERS

FULL = dict(edge=0.0033, lining_edge=0.0062, roll_k=4, lace_sides=8, lace_step=0.0021, tab_step=0.0028, stitch="prism", pitch=0.0043,
            dcuts=(0.0010, 0.0030), strap_step=0.0027)
LIGHT = dict(edge=0.0066, lining_edge=0.0135, roll_k=2, lace_sides=4, lace_step=0.007, tab_step=0.007, stitch="quad", pitch=0.0078,
             dcuts=(), strap_step=0.008)
if QUICK:
    FULL = dict(FULL, edge=0.0040, lining_edge=0.008)

# ------------------------------------------------------------------------------------------------------------------------------------
# small maths helpers (as in tools/gloves/build_glove.py)
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


def smax(a, b, k):
    return -smin(-a, -b, k)


def sdbox(px, py, cx, cy, hx, hy, r):
    """Signed distance to a rounded rectangle (negative inside)."""
    qx = np.abs(px - cx) - (hx - r)
    qy = np.abs(py - cy) - (hy - r)
    return np.hypot(np.maximum(qx, 0), np.maximum(qy, 0)) + np.minimum(np.maximum(qx, qy), 0) - r


def polyline_resample(P, step=None, n=None, closed=False, extra=()):
    """Resample a polyline at even arc length. `extra` = other per-point arrays to carry along. Returns (P, extras..., arc, total)."""
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


def dist_to_edges(V, E, P):
    """Distance from each point of P to the nearest of the edges E of mesh V (sampled at quarter points)."""
    if len(E) == 0:
        return np.full(len(P), 1.0)
    pts = np.vstack([V[E[:, 0]] * (1 - t) + V[E[:, 1]] * t for t in (0, 0.25, 0.5, 0.75, 1)])
    kd = KDTree(len(pts))
    for i, p in enumerate(pts):
        kd.insert(p, i)
    kd.balance()
    return np.array([kd.find(p)[2] for p in P])


# ------------------------------------------------------------------------------------------------------------------------------------
# the shell: one lofted barrel (the inside surface of the head guard)
# ------------------------------------------------------------------------------------------------------------------------------------

W_IN, DF_IN, DB_IN = 0.0850, 0.0965, 0.0975  # inside half width, half depth to the front, half depth to the back (at the widest ring)
N_FRONT, N_BACK = 2.25, 2.55  # superellipse powers of the ring (the back is squarer, so the strap lies on a flatter face)
BUMP = 0.135  # how far the cheek / chin region stands forward of the face
# the profile up the side of the head: (scale of the ring, height). It leans in to the open top.
_MER = np.array([[0.830, -0.014], [0.910, 0.030], [0.972, 0.070], [1.000, 0.110], [0.986, 0.146], [0.932, 0.179], [0.842, 0.206], [0.732, 0.2245], [0.622, 0.2360], [0.542, 0.2410]])
_mp = _MER * np.array([0.09, 1.0])
_mt = np.r_[0, np.cumsum(np.linalg.norm(np.diff(_mp, axis=0), axis=1))]
_mf = nspline(_mt, _MER)
_md = _mf(np.linspace(0, _mt[-1], 6001))
_S_TAB = np.r_[0, np.cumsum(np.linalg.norm(np.diff(_md * np.array([0.09, 1.0]), axis=0), axis=1))]
S_TOP = float(_S_TAB[-1])  # length of the profile; the top rim is at s = S_TOP
H0 = 0.289  # half the ring's length at the widest ring, for turning fractions round the ring into metres
_AL = np.linspace(0, 2 * np.pi, 1440, endpoint=False)


def mer(s):
    s = np.asarray(s, float)
    return np.interp(s, _S_TAB, _md[:, 0]), np.interp(s, _S_TAB, _md[:, 1])


def s_of_y(y):
    return float(np.interp(y, _md[:, 1], _S_TAB))


def ring_fn(s, al):
    """Points of the shell's rings: s (m,), al (K,) -> (m, K, 3). al = 0 is the middle of the face, pi the middle of the back, pi/2 is +x."""
    s = np.atleast_1d(np.asarray(s, float))
    m, y = mer(s)
    m, y = m[:, None], y[:, None]
    ca, sa = np.cos(al)[None, :], np.sin(al)[None, :]
    n = np.where(ca >= 0, N_FRONT, N_BACK)
    cx = np.sign(sa) * np.abs(sa) ** (2 / n)
    cz = np.sign(ca) * np.abs(ca) ** (2 / n)
    x = W_IN * m * cx
    z = np.where(ca >= 0, DF_IN, DB_IN * (1 - 0.07 * (1 - smoothstep(0.0, 0.10, y)))) * m * cz  # the back tucks in a little towards the nape
    az = np.degrees(np.arctan2(np.abs(x), z))
    b = (0.62 + 0.38 * smoothstep(6, 30, az)) * (1 - smoothstep(46, 88, az)) * (1 - smoothstep(0.090, 0.140, y))
    k = 1 + BUMP * b
    return np.stack([x * k, y + 0 * x, z * k], -1)


def ring_arc(s):
    ring = ring_fn(np.array([s]), _AL)[0]
    ring = np.vstack([ring, ring[:1]])
    arc = np.r_[0, np.cumsum(np.linalg.norm(np.diff(ring, axis=0), axis=1))]
    return ring, arc


def _pt(af, s):
    """Point of the shell at fraction `af` of half the ring from the middle of the face (+ towards +x, +-1 = middle of the back)."""
    ring, arc = ring_arc(s)
    t = (af % 2.0) / 2.0 * arc[-1]
    return np.array([np.interp(t, arc, ring[:, k]) for k in range(3)])


def base_point(af, s):
    """Point and outward normal of the shell."""
    s = min(max(s, 0.0), S_TOP)
    p = _pt(af, s)
    ta = _pt(af + 2e-3, s) - _pt(af - 2e-3, s)
    ts = (_pt(af, s) - _pt(af, s - 3e-4)) if s > S_TOP - 4e-4 else (_pt(af, s + 3e-4) - _pt(af, s))
    return p, unit(np.cross(ta, ts))


def half_ring(s):
    return ring_arc(s)[1][-1] / 2


def back_af(ab, s):
    """Ring fraction of the point `ab` metres round from the middle of the back (+ towards +x)."""
    f = 1.0 - abs(ab) / half_ring(s)
    return f if ab >= 0 else -f


def grid(edge, wrap):
    """Evenly spaced triangle grid over the whole shell. wrap=True closes the ring (for cutting panels); wrap=False leaves it open down
    the middle of the back with a doubled column (for the lining, which needs one flat UV island).
    Attributes: s (up the profile), aabs (metres round the ring from the middle of the face), circ (ring length), and a (signed) if open."""
    nrow = int(round(S_TOP / edge))
    rows = np.linspace(0, S_TOP, nrow + 1)
    dense = ring_fn(rows, _AL)
    seg = np.linalg.norm(np.roll(dense, -1, axis=1) - dense, axis=2)
    circ = seg.sum(1)
    nr = int(round(circ.max() / edge / 2)) * 2
    ncol = nr if wrap else nr + 1
    nrw = len(rows)
    V = np.zeros((nrw, ncol, 3))
    AA = np.zeros((nrw, ncol))
    for j in range(nrw):
        arc = np.r_[0, np.cumsum(seg[j])]
        ring = np.vstack([dense[j], dense[j, :1]])
        if wrap:
            t = np.arange(nr) * circ[j] / nr
            a = np.where(np.arange(nr) <= nr // 2, t, t - circ[j])
        else:
            a = (np.arange(nr + 1) / nr - 0.5) * circ[j]
            t = a % circ[j]
        for k in range(3):
            V[j, :, k] = np.interp(t, arc, ring[:, k])
        AA[j] = a
    idx = np.arange(nrw * ncol).reshape(nrw, ncol)
    if wrap:
        a_, b_, c_, d_ = idx[:-1, :], np.roll(idx[:-1, :], -1, 1), np.roll(idx[1:, :], -1, 1), idx[1:, :]
        left = (np.arange(nr) >= nr // 2)[None, :].repeat(nrw - 1, 0)
    else:
        a_, b_, c_, d_ = idx[:-1, :-1], idx[:-1, 1:], idx[1:, 1:], idx[1:, :-1]
        left = (np.arange(nr) < nr // 2)[None, :].repeat(nrw - 1, 0)
    # the quads' diagonals mirror about the middle of the face so both halves triangulate alike
    t1 = np.where(left[..., None], np.stack([a_, b_, d_], -1), np.stack([a_, b_, c_], -1)).reshape(-1, 3)
    t2 = np.where(left[..., None], np.stack([b_, c_, d_], -1), np.stack([a_, c_, d_], -1)).reshape(-1, 3)
    A = dict(s=np.repeat(rows, ncol), aabs=np.abs(AA).ravel(), circ=np.repeat(circ, ncol))
    if not wrap:
        A["a"] = AA.ravel()
    return Mesh(V.reshape(-1, 3), np.vstack([t1, t2]), A)


# ------------------------------------------------------------------------------------------------------------------------------------
# where the edges and seams run (all in metres round the ring from the middle of the face, and height)
# ------------------------------------------------------------------------------------------------------------------------------------

BIND_W = 0.0060  # width of the binding band on the outside, round the face opening
BIND_TOP, BIND_BOT = 0.0050, 0.0040  # ... round the top rim and the bottom rim
BIND_H = 0.0008  # how far the binding stands proud of the leather
T_EDGE = 0.0052  # thickness of the wall where it is bound
T_SEAM = 0.0105  # thickness of the wall where two panels are sewn together
PIL_P = 2.6  # how sharply the padding rises from a seam
EYE = (0.1425, 0.0700, 0.0255, 0.0210)  # the eye part of the face opening: centre height, half width, half height, corner radius
STEM = (0.0850, 0.0215, 0.0450, 0.0150)  # the nose / mouth part
STEM_BOT = STEM[0] - STEM[2]
U_F, Y_F = 0.340, 0.1520  # forehead: out to this fraction of half the ring, down to this height
U_B = 0.600  # the back panel starts at this fraction of half the ring
CK = (0.030, 0.064, 0.035, 0.092, 2.5)  # cheek outline: a0, ra, y0, ry, power
OPEN, BI, FH, CKL, CKR, CH, SDL, SDR, BK = range(9)
CODE = dict(FOREHEAD=FH, CHEEK_L=CKL, CHEEK_R=CKR, CHIN=CH, SIDE_L=SDL, SIDE_R=SDR, BACK_PAD=BK)
IS_LEATHER = np.array([False, False] + [True] * 7)
# padding: thickness in the middle of the panel, distance from a seam over which it rises
PAD = {FH: (0.0195, 0.0140, 2.6), CKL: (0.0400, 0.0340, 1.9), CKR: (0.0400, 0.0340, 1.9), CH: (0.0185, 0.0115, 2.4), SDL: (0.0185, 0.0140, 2.6), SDR: (0.0185, 0.0140, 2.6),
       BK: (0.0175, 0.0140, 2.6)}
EAR = (0.47, 0.106, 0.0190, 0.0240)  # stitched ear ring on the side panel: fraction of half the ring, height, half width, half height
T_BACK = PAD[BK][0]
BACK_SEAM_Y = 0.108  # the back panel's centre seam fades out here, above the strap
# strap across the back
STRAP_HL = 0.0880  # half length
STRAP_Y = (0.0440, 0.1000)  # heights of its lower and upper edges (before the final shift onto y = 0)
STRAP_R, STRAP_TH, STRAP_BE, STRAP_GAP = 0.0070, 0.0032, 0.0015, 0.0003
# tabs and lace round the open top
TAB_ANGLES = (-150, -114, -76, -38, 0, 38, 76, 114, 150)
TAB_HW, TAB_HT = 0.0105, 0.0011
LACE_R = 0.0018
LACE_GAP, LACE_RISE = 0.0190, 0.0050


def rim_m(aabs, s, y, circ):
    """Distance in from the nearest open edge (bottom rim, top rim, face opening); negative = cut away."""
    deg = aabs / (circ / 2) * 180
    yb = 0.004 + 0.016 * smoothstep(12, 95, deg) - 0.008 * smoothstep(110, 170, deg)
    g = smin(sdbox(aabs, y, 0, EYE[0], EYE[1], EYE[2], EYE[3]), sdbox(aabs, y, 0, STEM[0], STEM[1], STEM[2], STEM[3]), 0.040)
    # (the top and bottom bands are narrower: their distances are stretched so that all three bands end at m = BIND_W)
    return np.minimum(np.minimum((y - yb) * (BIND_W / BIND_BOT), (S_TOP - s) * (BIND_W / BIND_TOP)), g)


def chin_line(y):
    return 0.034 + 0.45 * (STEM_BOT - y)


def seam_fields(aabs, y, circ):
    u = aabs / (circ / 2)
    a0, ra, y0, ry, p = CK
    return dict(
        fF=smax((u - U_F) * H0, Y_F - y, 0.03),  # < 0 in the forehead
        fB=(u - U_B) * H0,  # > 0 in the back panel
        fK=(((np.maximum(aabs - a0, 0) / ra) ** p + (np.maximum(y - y0, 0) / ry) ** p) ** (1 / p) - 1) * 0.07,  # < 0 inside the cheek outline
        fN=np.maximum(aabs - chin_line(y), y - (STEM_BOT + 0.030)),  # < 0 in the chin bar
        fE=(np.hypot((aabs - EAR[0] * circ / 2) / EAR[2], (y - EAR[1]) / EAR[3]) - 1) * 0.0215,  # 0 on the ear ring
    )


def classify(body):
    F = body.F
    fm = {k: body.face_mean(k) for k in ("m", "fF", "fB", "fK", "fN")}
    cx = body.V[F].mean(1)[:, 0]
    cy = body.V[F].mean(1)[:, 1]
    pid = np.where(cx >= 0, SDR, SDL)
    pid = np.where(fm["fB"] > 0, BK, pid)
    pid = np.where(fm["fF"] < 0, FH, pid)
    pid = np.where((fm["fK"] < 0) & (cy < 0.135), np.where(cx >= 0, CKR, CKL), pid)
    pid = np.where(fm["fN"] < 0, CH, pid)
    pid = np.where(fm["m"] < BIND_W, BI, pid)
    pid = np.where(fm["m"] < 0, OPEN, pid)
    return clean_pid(F, pid, len(body.V))


def clean_pid(F, pid, nv):
    """Every panel must be one piece: hand any stray scrap of triangles to the panel it is surrounded by."""
    E, fa, fb = edge_faces(F, nv)
    inner = fb >= 0
    fa, fb = fa[inner], fb[inner]
    for _ in range(4):
        same = pid[fa] == pid[fb]
        a, b = fa[same], fb[same]
        lab = np.arange(len(F))
        while True:
            mn = np.minimum(lab[a], lab[b])
            new = lab.copy()
            np.minimum.at(new, a, mn)
            np.minimum.at(new, b, mn)
            new = new[new]
            if np.array_equal(new, lab):
                break
            lab = new
        moved = 0
        for code in range(2, 9):
            idx = np.flatnonzero(pid == code)
            if len(idx) == 0:
                continue
            comps, counts = np.unique(lab[idx], return_counts=True)
            if len(comps) == 1:
                continue
            main = comps[np.argmax(counts)]
            for c in comps:
                if c == main:
                    continue
                inc = (lab == c)
                na, nb = inc[fa], inc[fb]
                other = np.r_[pid[fb[na & ~nb]], pid[fa[nb & ~na]]]
                other = other[IS_LEATHER[other] & (other != code)]
                if len(other):
                    pid[inc] = np.bincount(other).argmax()
                    moved += int(inc.sum())
        if moved == 0:
            break
        print("  moved", moved, "stray triangles to their surrounding panel")
    return pid


# ------------------------------------------------------------------------------------------------------------------------------------
# swept pieces (tabs, laces) and the accumulator for meshes made of many islands
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


def slerp(a, b, f):
    th = math.acos(float(np.clip(a @ b, -1, 1)))
    if th < 1e-6:
        return a
    return (a * math.sin((1 - f) * th) + b * math.sin(f * th)) / math.sin(th)


# ------------------------------------------------------------------------------------------------------------------------------------
# the head guard
# ------------------------------------------------------------------------------------------------------------------------------------


def build(D):
    t0 = time.time()
    parts = {}
    # ---- shell, cut along the open edges and the seams -------------------------------------------------------------------------
    body = grid(D["edge"], wrap=True)
    A = body.A
    A["m"] = rim_m(A["aabs"], A["s"], body.V[:, 1], A["circ"])
    cut(body, "m", 0.0)
    if D["stitch"] == "prism":
        cut(body, "m", BIND_W - 0.0012)
    cut(body, "m", BIND_W)
    for name in ("fF", "fB", "fK", "fN", "fE"):
        A[name] = seam_fields(A["aabs"], body.V[:, 1], A["circ"])[name]
        cut(body, name)
    if D["dcuts"]:
        cut(body, "fE", 0.0024)
        cut(body, "fE", -0.0024)
    pid = classify(body)

    def seam_sets(pid):
        E, fa, fb = edge_faces(body.F, len(body.V))
        ok = fb >= 0
        pa, pb = pid[fa], pid[np.maximum(fb, 0)]
        seam = ok & IS_LEATHER[pa] & IS_LEATHER[pb] & (pa != pb)
        band = ok & ((IS_LEATHER[pa] & (pb == BI)) | (IS_LEATHER[pb] & (pa == BI)))
        return E[seam], E[band], (E, fa, fb)

    # extra rows of vertices close beside every seam, so the padding's steep rise out of the seam is smooth
    if D["dcuts"]:
        Es, Eb, _ = seam_sets(pid)
        d = dist_to_edges(body.V, np.vstack([Es, Eb]), body.V)
        d[A["m"] < BIND_W - 1e-9] = -1.0
        d[np.unique(np.vstack([Es, Eb]))] = 0.0
        A["d"] = d
        for iso in D["dcuts"]:
            cut(body, "d", iso)
        del A["d"]
        pid = classify(body)
    Es, Eb, (E_all, fa_all, fb_all) = seam_sets(pid)
    nv = len(body.V)
    print("cut", round(time.time() - t0, 1), "s; shell tris", len(body.F), {n: int((pid == c).sum()) for n, c in CODE.items()})

    # ---- padding thickness -----------------------------------------------------------------------------------------------------
    V0 = body.V
    N0 = vnormals(V0, body.F)
    ds = dist_to_edges(V0, Es, V0)
    db = dist_to_edges(V0, Eb, V0)
    ds[np.unique(Es)] = 0.0
    db[np.unique(Eb)] = 0.0
    vp = np.full(nv, -1)
    for code in range(2, 9):
        vp[body.F[pid == code].ravel()] = code
    T = np.full(nv, T_EDGE)
    yv = V0[:, 1]
    for code, (tp, w, pw) in PAD.items():
        sel = vp == code
        fs = 1 - (1 - np.clip(ds[sel] / w, 0, 1)) ** pw
        fb_ = 1 - (1 - np.clip(db[sel] / w, 0, 1)) ** pw
        t = np.minimum(T_SEAM + (tp - T_SEAM) * fs, T_EDGE + (tp - T_EDGE) * fb_)
        if code == CH:  # the chin bar's centre seam: a shallower groove down the middle
            fc = 1 - (1 - np.clip(A["aabs"][sel] / 0.008, 0, 1)) ** PIL_P
            t = np.minimum(t, (tp - 0.0042) + 0.0042 * fc)
        if code == BK:  # the back panel's centre seam, from the top down to the strap
            fc = 1 - (1 - np.clip((A["circ"][sel] / 2 - A["aabs"][sel]) / 0.008, 0, 1)) ** PIL_P
            dep = 0.0040 * smoothstep(BACK_SEAM_Y, BACK_SEAM_Y + 0.022, yv[sel])
            t = np.minimum(t, (tp - dep) + dep * fc)
        if code in (SDL, SDR):  # the stitched ring over the ear
            fc = 1 - (1 - np.clip(np.abs(A["fE"][sel]) / 0.0065, 0, 1)) ** 2.2
            t = np.minimum(t, (tp - 0.0045) + 0.0045 * fc)
        T[sel] = t
    ramp = 1 - smoothstep(BIND_W - 0.0012, BIND_W, A["m"])
    Vout = V0 + N0 * (T + BIND_H * ramp)[:, None]
    Vin = V0 - N0 * (BIND_H * ramp)[:, None]
    keep = pid != OPEN
    BN = vnormals(Vout, body.F[keep])
    for name, code in CODE.items():
        used, Fs = submesh(body.F, pid == code)
        parts[name] = dict(V=Vout[used], F=Fs, N=BN[used])

    # outer skin for projecting stitches, tabs and the lace onto
    skinF = body.F[keep]
    skin_pid = pid[keep]
    skin = BVHTree.FromPolygons([tuple(v) for v in Vout], [tuple(int(i) for i in f) for f in skinF])

    def on_skin(p):
        loc, nrm, fi, dist = skin.find_nearest(Vector(p))
        f = skinF[fi]
        k = np.argmin(np.linalg.norm(Vout[f] - np.array(loc), axis=1))
        return np.array(loc), BN[f[k]], skin_pid[fi], dist

    # ---- binding ---------------------------------------------------------------------------------------------------------------
    parts["BINDING"], loops = build_binding(body.F, pid, V0, Vout, Vin, N0, A["m"], D)

    # ---- lining ----------------------------------------------------------------------------------------------------------------
    lb = grid(D["lining_edge"], wrap=False)
    LA = lb.A
    LA["m"] = rim_m(LA["aabs"], LA["s"], lb.V[:, 1], LA["circ"])
    cut(lb, "m", BIND_W - 0.002)
    LN = vnormals(lb.V, lb.F)
    key = np.round(lb.V / 1e-6).astype(np.int64)
    _, inv = np.unique(key, axis=0, return_inverse=True)
    inv = inv.ravel()
    acc = np.zeros((inv.max() + 1, 3))
    np.add.at(acc, inv, LN)
    LN = unit(acc[inv])  # the doubled column down the back shades as one surface
    used, Fs = submesh(lb.F, lb.face_mean("m") > BIND_W - 0.002)
    luv = np.stack([-LA["a"][used], LA["s"][used]], 1)
    luv -= luv.min(0)
    parts["LINING"] = dict(V=lb.V[used], F=Fs[:, ::-1], N=-LN[used], uvm=luv, uv0=luv / luv.max(0), uvWidthM=float(luv[:, 0].max()), uvHeightM=float(luv[:, 1].max()))

    # ---- stitch rows -----------------------------------------------------------------------------------------------------------
    dashes = []
    PITCH, DASH = D["pitch"], 0.0028

    def lay_row(Q, closed, allow_band, nrm_fn=None):
        Q, arc, total = polyline_resample(Q, step=0.0006, closed=closed)
        for k in range(int(total / PITCH)):
            a0 = k * PITCH + 0.0008
            p0 = np.array([np.interp(a0, arc, Q[:, c]) for c in range(3)])
            p1 = np.array([np.interp(a0 + DASH, arc, Q[:, c]) for c in range(3)])
            if nrm_fn is not None:
                dashes.append((p0, p1, nrm_fn((p0 + p1) / 2)))
                continue
            l0, n0, id0, d0 = on_skin(p0)
            l1, n1, id1, d1 = on_skin(p1)
            if max(d0, d1) > 0.0030 or (not allow_band and (id0 == BI or id1 == BI)):
                continue
            if abs(np.linalg.norm(l1 - l0) - DASH) > 0.0012:
                continue
            dashes.append((l0, l1, unit(n0 + n1)))

    seam_rows = [(path, closed, 0.0036) for path, closed in chains(Es) if len(path) >= 4]
    pa_, pb_ = pid[fa_all], pid[np.maximum(fb_all, 0)]
    cen = (A["aabs"] < 1e-9) & (vp == CH)
    ok = cen[E_all[:, 0]] & cen[E_all[:, 1]] & (fb_all >= 0) & (pa_ == CH) & (pb_ == CH)
    seam_rows += [(path, closed, 0.0030) for path, closed in chains(E_all[ok]) if len(path) >= 4]
    cen = (A["circ"] / 2 - A["aabs"] < 1e-9) & (vp == BK) & (yv > BACK_SEAM_Y + 0.012)
    ok = cen[E_all[:, 0]] & cen[E_all[:, 1]] & (fb_all >= 0) & (pa_ == BK) & (pb_ == BK)
    seam_rows += [(path, closed, 0.0030) for path, closed in chains(E_all[ok]) if len(path) >= 4]
    ring = np.abs(A["fE"]) < 1e-12
    ok = ring[E_all[:, 0]] & ring[E_all[:, 1]] & (fb_all >= 0) & (pa_ == pb_) & ((pa_ == SDL) | (pa_ == SDR))
    seam_rows += [(path, closed, 0.0) for path, closed in chains(E_all[ok]) if len(path) >= 8]
    for path, closed, off in seam_rows:
        P = smooth_line(Vout[path], closed, 3)
        P, Nn, arc, total = polyline_resample(P, step=0.0025, closed=closed, extra=(BN[path],))
        Nn = unit(smooth_line(Nn, closed, 4))
        Tn = unit(np.roll(P, -1, 0) - np.roll(P, 1, 0)) if closed else unit(np.gradient(P, axis=0))
        side = np.cross(Tn, Nn)
        for sg in ((1, -1) if off > 0 else (1,)):
            lay_row(P + side * (sg * off), closed, False)
    for (Lp, eo), bw in zip(loops, (BIND_TOP, BIND_W, BIND_BOT)):
        lay_row(smooth_line(Lp, True, 2) - eo * (bw - 0.0019), True, True)

    # ---- strap, tabs, lace -----------------------------------------------------------------------------------------------------
    parts["STRAP"] = build_strap(D, lay_row)
    parts["TOP_TABS"], lace_pts = build_tabs(D, on_skin, dashes)
    parts["LACES"] = build_laces(D, on_skin, lace_pts)
    parts["STITCHING"] = build_stitches(dashes, D, DASH)

    # ---- stand it on y = 0 and centre it -------------------------------------------------------------------------------------
    allv = np.vstack([p["V"] for p in parts.values()])
    lo, hi = allv.min(0), allv.max(0)
    shift = np.array([-(lo[0] + hi[0]) / 2, -lo[1], -(lo[2] + hi[2]) / 2])
    for p in parts.values():
        p["V"] = p["V"] + shift
    allv = np.vstack([p["V"] for p in parts.values()])
    print("bounds", np.round(allv.min(0), 4), np.round(allv.max(0), 4), "size", np.round(allv.max(0) - allv.min(0), 4))
    print("built", round(time.time() - t0, 1), "s;", {k: len(v["F"]) for k, v in parts.items()}, "total", sum(len(v["F"]) for v in parts.values()))
    return parts


def build_binding(F, pid, V0, Vout, Vin, BN, m_attr, D):
    """Bound edges round the face opening, the top rim and the bottom rim: outer band + rolled edge + inner band for each."""
    nb = len(V0)
    E, fa, fb = edge_faces(F, nb)
    pa, pb = pid[fa], np.where(fb >= 0, pid[np.maximum(fb, 0)], OPEN)
    is_edge = ((pa == BI) & (pb == OPEN)) | ((pb == BI) & (pa == OPEN))
    band_face = np.where(pa == BI, fa, fb)[is_edge]
    Eb = E[is_edge]
    Fb = F[band_face]
    dirE = np.zeros_like(Eb)  # each rim edge, directed the way its band face runs (leather on the left seen from outside)
    for k in range(3):
        a, b = Fb[:, k], Fb[:, (k + 1) % 3]
        hit = ((a == Eb[:, 0]) & (b == Eb[:, 1])) | ((a == Eb[:, 1]) & (b == Eb[:, 0]))
        dirE[hit, 0], dirE[hit, 1] = a[hit], b[hit]
    nxt = {int(a): int(b) for a, b in dirE}
    assert len(nxt) == len(dirE), "a bound edge is not a clean loop"
    fn = unit(np.cross(V0[Fb[:, 1]] - V0[Fb[:, 0]], V0[Fb[:, 2]] - V0[Fb[:, 0]]))
    eo_acc = np.zeros((nb, 3))
    ed = np.cross(V0[dirE[:, 1]] - V0[dirE[:, 0]], fn)
    np.add.at(eo_acc, dirE[:, 0], ed)
    np.add.at(eo_acc, dirE[:, 1], ed)
    loops, seen = [], set()
    for st in sorted(nxt):
        if st in seen:
            continue
        loop = [st]
        seen.add(st)
        while nxt[loop[-1]] != st:
            loop.append(nxt[loop[-1]])
            seen.add(loop[-1])
        loops.append(np.array(loop))
    assert len(loops) == 3, "expected three bound edges (face, top, bottom), found %d" % len(loops)
    loops.sort(key=lambda l: -V0[l, 1].mean())  # top, face, bottom
    # which loop each band face belongs to
    allv = np.concatenate(loops)
    lid = np.concatenate([np.full(len(l), i) for i, l in enumerate(loops)])
    kd = KDTree(len(allv))
    for i, p in enumerate(V0[allv]):
        kd.insert(p, i)
    kd.balance()
    bi = np.flatnonzero(pid == BI)
    face_loop = np.array([lid[kd.find(p)[1]] for p in V0[F[bi]].mean(1)])
    K = D["roll_k"]
    phi = (np.arange(1, K + 1) * np.pi / (K + 1))
    out = dict(V=[], F=[], N=[], uvm=[], uv0=[], isl=[])
    info = []
    nvt = 0
    for li, loop in enumerate(loops):
        bw = (BIND_TOP, BIND_W, BIND_BOT)[li]
        Lp = Vout[loop]
        seg = np.linalg.norm(np.roll(Lp, -1, 0) - Lp, axis=1)
        larc = np.r_[0, np.cumsum(seg)][:-1]
        LEN = float(seg.sum())
        eo = unit(eo_acc[loop] - (eo_acc[loop] * BN[loop]).sum(1, keepdims=True) * BN[loop])
        Aout, Bin = Vout[loop], Vin[loop]
        cen, r0 = (Aout + Bin) / 2, (Aout - Bin) / 2
        R = np.linalg.norm(r0, axis=1)
        roll = cen[:, None, :] + r0[:, None, :] * np.cos(phi)[None, :, None] + eo[:, None, :] * (R[:, None] * np.sin(phi)[None, :])[..., None]
        ROLL_LEN = float(np.pi * R.mean())
        W_TOT = 2 * bw + ROLL_LEN
        mask = np.zeros(len(F), bool)
        mask[bi[face_loop == li]] = True
        used, Fband = submesh(F, mask)
        nu = len(used)
        dense = polyline_resample(Lp, n=max(len(loop) * 4, 16), closed=True)[0]
        dn = len(dense)
        kdl = KDTree(dn)
        for i, p in enumerate(dense):
            kdl.insert(p, i)
        kdl.balance()
        Uband = np.array([kdl.find(p)[1] for p in Vout[used]]) * (LEN / dn)
        in_used = {int(v): i for i, v in enumerate(used)}
        li_idx = np.array([in_used[int(v)] for v in loop])
        Uband[li_idx] = larc
        mband = np.clip(m_attr[used], 0, BIND_W) * (bw / BIND_W)
        nl = len(loop)
        BV = np.vstack([Vout[used], Vin[used], roll.reshape(-1, 3)])  # [outer band] [inner band] [roll]
        BU = np.r_[Uband, Uband, np.repeat(larc, K)]
        BVc = np.r_[bw + ROLL_LEN + mband, bw - mband, np.tile(bw + ROLL_LEN * (1 - np.arange(1, K + 1) / (K + 1)), nl)]
        rid = 2 * nu + np.arange(nl * K).reshape(nl, K)
        cols = np.concatenate([li_idx[:, None], rid, (li_idx + nu)[:, None]], 1)  # outer edge, roll, inner edge
        ia = np.arange(nl)
        ib = (ia + 1) % nl
        qa, qb, qc, qd = cols[ia, :-1], cols[ia, 1:], cols[ib, 1:], cols[ib, :-1]
        Froll = np.vstack([np.stack([qa, qb, qc], -1).reshape(-1, 3), np.stack([qa, qc, qd], -1).reshape(-1, 3)])
        fnr = np.cross(BV[Froll[:, 1]] - BV[Froll[:, 0]], BV[Froll[:, 2]] - BV[Froll[:, 0]])
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
        # split vertices across the one UV seam (where U wraps)
        cu = BU[BF]
        wrap = (cu.max(1) - cu.min(1)) > LEN / 2
        shiftv = wrap[:, None] & (cu < LEN / 2)
        keyv = BF * 2 + shiftv
        uniq, inv = np.unique(keyv, return_inverse=True)
        src, sh = uniq // 2, uniq % 2
        uvm = np.stack([BU[src] + sh * LEN, BVc[src]], 1)
        uvm[:, 0] -= uvm[:, 0].min()
        Fn = inv.reshape(BF.shape)
        if uv_area(uvm, Fn[:len(Fband)]).sum() < 0:
            uvm[:, 0] = uvm[:, 0].max() - uvm[:, 0]
        span = float(uvm[:, 0].max())
        out["V"].append(BV[src])
        out["F"].append(Fn + nvt)
        out["N"].append(BNrm[src])
        out["uvm"].append(uvm)
        out["uv0"].append(np.stack([uvm[:, 0] / span, (li + uvm[:, 1] / W_TOT) / 3], 1))  # three strips stacked in the decal square
        out["isl"].append(np.full(len(src), li))
        nvt += len(src)
        info.append((Lp, eo))
        print("  bound edge %d: %.3f m round, roll radius %.1f mm" % (li, LEN, R.mean() * 1000))
    part = dict(V=np.vstack(out["V"]), F=np.vstack(out["F"]), N=np.vstack(out["N"]), uvm=np.vstack(out["uvm"]), uv0=np.vstack(out["uv0"]), isl=np.concatenate(out["isl"]))
    return part, info


def build_stitches(dashes, D, DASH):
    st = Soup()
    P0 = np.array([d[0] for d in dashes])
    P1 = np.array([d[1] for d in dashes])
    Nn = unit(np.array([d[2] for d in dashes]))
    Tn = unit(P1 - P0)
    Sd = unit(np.cross(Tn, Nn))
    Nn = np.cross(Sd, Tn)
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
    return st.part()


def build_strap(D, lay_row):
    """The wide closure strap across the back: a slab with rounded corners and a rounded top edge, lying on the back panel's padding.
    It is one sheet (top face plus the skirt round its edge), so it flattens to a single decal island."""
    st = D["strap_step"]
    pad = st * 1.5
    s0, s1 = s_of_y(STRAP_Y[0]), s_of_y(STRAP_Y[1])
    sc, hh, hl, be = (s0 + s1) / 2, (s1 - s0) / 2, STRAP_HL, STRAP_BE
    na = int(round(2 * (hl + pad) / st)) + 1
    ns = int(round(2 * (hh + pad) / st)) + 1
    abv = np.linspace(-(hl + pad), hl + pad, na)
    sv = np.linspace(sc - hh - pad, sc + hh + pad, ns)
    V = np.zeros((ns, na, 3))
    for j, s in enumerate(sv):
        ring, arc = ring_arc(s)
        t = (arc[-1] / 2 - abv) % arc[-1]
        for k in range(3):
            V[j, :, k] = np.interp(t, arc, ring[:, k])
    idx = np.arange(ns * na).reshape(ns, na)
    a, b, c, d = idx[:-1, :-1], idx[:-1, 1:], idx[1:, 1:], idx[1:, :-1]
    F = np.vstack([np.stack([a, c, b], -1).reshape(-1, 3), np.stack([a, d, c], -1).reshape(-1, 3)])
    AB, SS = np.meshgrid(abv, sv)
    m = Mesh(V.reshape(-1, 3), F, dict(ab=AB.ravel(), s=SS.ravel()))
    m.A["sd"] = sdbox(m.A["ab"], m.A["s"], 0, sc, hl, hh, STRAP_R)
    cut(m, "sd", 0.0)
    if D["stitch"] == "prism":
        cut(m, "sd", -be * 0.4)
        cut(m, "sd", -be)
    N0 = vnormals(m.V, m.F)
    assert (N0[:, 2] < 0).mean() > 0.9, "strap faces the wrong way"
    sdv = np.clip(m.A["sd"], -be, 0)
    h = STRAP_TH - be + np.sqrt(np.maximum(be * be - (sdv + be) ** 2, 0))
    level = T_BACK + STRAP_GAP
    Vtop = m.V + N0 * (level + h)[:, None]
    used, Fs = submesh(m.F, m.face_mean("sd") < 0)
    Vt = Vtop[used]
    uv = np.stack([-m.A["ab"][used], m.A["s"][used]], 1)
    # the skirt: the edge loop dropped down into the padding
    E, fa, fb = edge_faces(Fs, len(used))
    brd = fb < 0
    Fb = Fs[fa[brd]]
    Eb = E[brd]
    nxt = {}
    for k in range(3):
        p, q = Fb[:, k], Fb[:, (k + 1) % 3]
        hit = ((p == Eb[:, 0]) & (q == Eb[:, 1])) | ((p == Eb[:, 1]) & (q == Eb[:, 0]))
        for u_, v_ in zip(p[hit], q[hit]):
            nxt[int(u_)] = int(v_)
    start = next(iter(nxt))
    loop = [start]
    while nxt[loop[-1]] != start:
        loop.append(nxt[loop[-1]])
    assert len(loop) == len(Eb), "strap outline is not one loop"
    loop = np.array(loop)
    wall = STRAP_TH - be + STRAP_GAP + 0.0025
    Vw = Vt[loop] - N0[used][loop] * wall
    e = 1e-4
    ab_l, s_l = m.A["ab"][used][loop], m.A["s"][used][loop]
    gx = sdbox(ab_l + e, s_l, 0, sc, hl, hh, STRAP_R) - sdbox(ab_l - e, s_l, 0, sc, hl, hh, STRAP_R)
    gy = sdbox(ab_l, s_l + e, 0, sc, hl, hh, STRAP_R) - sdbox(ab_l, s_l - e, 0, sc, hl, hh, STRAP_R)
    g = unit(np.stack([-gx, gy], 1))
    uvw = uv[loop] + g * wall
    nt, nl = len(used), len(loop)
    i0 = np.arange(nl)
    i1 = (i0 + 1) % nl
    Fw = np.vstack([np.stack([loop[i0], nt + i0, nt + i1], 1), np.stack([loop[i0], nt + i1, loop[i1]], 1)])
    Vall = np.vstack([Vt, Vw])
    Fall = np.vstack([Fs, Fw])
    uvm = np.vstack([uv, uvw])
    uvm -= uvm.min(0)
    size = uvm.max(0)
    # one stitch row round the strap, just in from its edge
    ins = 0.0036
    hx, hy, r = hl - ins, hh - ins, STRAP_R - ins
    pts = []
    for cx_, cy_, a0 in ((hx - r, hy - r, 0), (-(hx - r), hy - r, 90), (-(hx - r), -(hy - r), 180), (hx - r, -(hy - r), 270)):
        for a_ in np.radians(a0 + np.linspace(0, 90, 7)):
            pts.append((cx_ + r * math.cos(a_), sc + cy_ + r * math.sin(a_)))
    pts = np.array(pts)
    pts = polyline_resample(np.c_[pts, np.zeros(len(pts))], step=0.002, closed=True)[0][:, :2]
    P3, N3 = [], []
    for ab_, s_ in pts:
        p, n = base_point(back_af(ab_, s_), s_)
        P3.append(p + n * (level + STRAP_TH))
        N3.append(n)
    P3, N3 = np.array(P3), np.array(N3)
    kd = KDTree(len(P3))
    for i, p in enumerate(P3):
        kd.insert(p, i)
    kd.balance()
    lay_row(P3, True, True, nrm_fn=lambda p: N3[kd.find(p)[1]])
    return dict(V=Vall, F=Fall, N=vnormals(Vall, Fall), uvm=uvm, uv0=uvm / size, uvWidthM=float(size[0]), uvHeightM=float(size[1]))


def rim_frame(af):
    """Frame at the top rim: base point, outward normal, the direction on past the rim, the rim's own direction, level outward direction."""
    p, n = base_point(af, S_TOP)
    ts = unit(p - _pt(af, S_TOP - 0.0008))
    h = unit(np.array([n[0], 0.0, n[2]]))
    bd = unit(np.cross([0.0, 1.0, 0.0], h))
    nn = unit(n - (n @ bd) * bd)
    eo = unit(ts - (ts @ bd) * bd)
    return p, nn, eo, bd, h


def build_tabs(D, on_skin, dashes):
    """The short leather tabs round the open top. Each is one strip: sewn to the outside below the rim, over the rolled edge, across to
    the lace, round it, and back down to the inside of the rim."""
    tabs = Soup()
    full = D["stitch"] == "prism"
    hw, ht, c = TAB_HW, TAB_HT, 0.0006
    if full:
        prof = np.array([(0, -ht), (hw - c, -ht), (hw, -ht + c), (hw, ht - c), (hw - c, ht), (0, ht), (-hw + c, ht), (-hw, ht - c), (-hw, -ht + c), (-hw + c, -ht)])
    else:
        prof = np.array([(hw, -ht), (hw, ht), (-hw, ht), (-hw, -ht)])
    lift = ht + 0.0004
    lace_pts = []
    uv0 = []
    for ti, ang in enumerate(TAB_ANGLES):
        af = ang / 180.0
        p_r, nn, eo, bd, h = rim_frame(af)

        def planar(q):
            return q - ((q - p_r) @ bd) * bd

        C1 = p_r + nn * (T_EDGE / 2)
        r1 = T_EDGE / 2 + BIND_H + lift
        C2 = C1 - h * LACE_GAP + np.array([0, LACE_RISE, 0])
        r2 = LACE_R + ht + 0.0003
        dv = C2 - C1
        Dd = np.linalg.norm(dv)
        dh = dv / Dd
        ph = np.cross(bd, dh)
        if ph @ nn < 0:
            ph = -ph
        sb = (r1 - r2) / Dd
        nvec = dh * sb + ph * math.sqrt(1 - sb * sb)
        T1, T2 = C1 + r1 * nvec, C2 + r2 * nvec
        tvec = unit(T2 - T1)
        ctrl = []
        for drop in (0.020, 0.0145, 0.009, 0.0035):
            pb, nb_ = base_point(af, S_TOP - drop)
            loc, nrm, _, _ = on_skin(pb + nb_ * 0.012)
            ctrl.append(planar(loc + nrm * lift))
        for f in (0.0, 0.5, 1.0):
            ctrl.append(C1 + r1 * slerp(nn, nvec, f))
        for f in (0.33, 0.66):
            ctrl.append(T1 + (T2 - T1) * f)
        for th in np.radians((0, 45, 90, 135, 180)):
            ctrl.append(C2 + r2 * (nvec * math.cos(th) + tvec * math.sin(th)))
        pb1, nb1 = base_point(af, S_TOP - 0.011)
        pb2, nb2 = base_point(af, S_TOP - 0.020)
        Pin1, Pin2 = planar(pb1 - nb1 * (lift + 0.0006)), planar(pb2 - nb2 * lift)
        Pl = C2 - r2 * nvec
        for f in (0.33, 0.66):
            ctrl.append(Pl + (Pin1 - Pl) * f)
        ctrl += [Pin1, Pin2]
        P = catmull(np.array(ctrl), 6)
        P, arc, total = polyline_resample(P, step=D["tab_step"])
        Tn = unit(np.gradient(P, axis=0))
        Nn = np.cross(Tn, bd)
        if Nn[0] @ nn < 0:
            Nn = -Nn
        V, F, N, uv = sweep(P, Nn, prof, closed=False, caps=True)
        tabs.add(V, F, N, uv)
        cell = np.array([ti % 3, ti // 3])
        uv0.append((cell + uv / np.maximum(uv.max(0), 1e-9)) / 3)
        lace_pts.append((ang, C2, bd))
        # two short rows of stitches across the foot of the tab
        for a_ in (0.0035, 0.0115):
            i = int(np.argmin(np.abs(arc - a_)))
            for j in range(4):
                x0 = -0.0080 + j * 0.0044
                dashes.append((P[i] + bd * x0 + Nn[i] * ht, P[i] + bd * (x0 + 0.0028) + Nn[i] * ht, Nn[i]))
    part = tabs.part()
    part["uv0"] = np.vstack(uv0)
    return part, lace_pts


def build_laces(D, on_skin, lace_pts):
    """Round cord threaded through the tabs' loops and tied in a bow at the back, the bow lying over the back of the rim."""
    laces = Soup()
    prof = circle_prof(LACE_R, D["lace_sides"])
    up = np.array([0.0, 1.0, 0.0])

    def run(ctrl, nrm, per=10):
        P = catmull(np.array(ctrl), per)
        Nn = catmull(np.array(nrm), per)
        P, Nn, _, _ = polyline_resample(P, step=D["lace_step"], extra=(Nn,))
        V, F, N, uv = sweep(P, unit(Nn), prof, closed=False, caps=True)
        laces.add(V, F, N, uv)

    p_r, nn, eo, bd, h = rim_frame(1.0)
    C1b = p_r + nn * (T_EDGE / 2)
    K = C1b - h * (LACE_GAP - 0.005) + up * (LACE_RISE - 0.0005)
    ctrl = [K]
    for ang, C2, b in sorted(lace_pts, key=lambda t: t[0]):
        ctrl += [C2 - b * 0.008, C2, C2 + b * 0.008]
    ctrl.append(K)
    run(ctrl, [up] * len(ctrl), 12)
    r = LACE_R

    def back_pt(lat, drop, lift):
        s = S_TOP - drop
        pb, nb_ = base_point(back_af(lat, s), s)
        loc, nrm, _, _ = on_skin(pb + nb_ * 0.012)
        return loc + nrm * (r + lift), nrm

    def rim_pt(lat, deg, lift):
        p, n2, e2, b2, h2 = rim_frame(back_af(lat, S_TOP))
        d = n2 * math.cos(math.radians(deg)) + e2 * math.sin(math.radians(deg))
        return p + n2 * (T_EDGE / 2) + d * (T_EDGE / 2 + BIND_H + r + lift), d

    for sg in (1, -1):
        # bow loop: out over the rim, down the back, round and up again
        seq = [rim_pt(sg * 0.0085, 100, 0.0006), rim_pt(sg * 0.0135, 40, 0.0006), back_pt(sg * 0.0190, 0.007, 0.0004), back_pt(sg * 0.0265, 0.020, 0.0002),
               back_pt(sg * 0.0300, 0.033, 0.0002), back_pt(sg * 0.0255, 0.0425, 0.0002), back_pt(sg * 0.0185, 0.0370, 0.0002), back_pt(sg * 0.0140, 0.022, 0.0004),
               back_pt(sg * 0.0110, 0.008, 0.0006), rim_pt(sg * 0.0085, 40, 0.0010), rim_pt(sg * 0.0050, 100, 0.0010)]
        c = [K + up * 0.0010] + [q[0] for q in seq] + [K + up * 0.0016]
        n = [up] + [q[1] for q in seq] + [up]
        run(c, n)
        # tail
        seq = [rim_pt(sg * 0.0022, 100, 2 * r + 0.0012), rim_pt(sg * 0.0030, 40, 2 * r + 0.0010), back_pt(sg * 0.0040, 0.008, 0.0010), back_pt(sg * 0.0052, 0.026, 0.0003),
               back_pt(sg * 0.0085, 0.050, 0.0002), back_pt(sg * 0.0115, 0.072, 0.0002), back_pt(sg * 0.0122, 0.088, 0.0002)]
        c = [K + up * 0.0022] + [q[0] for q in seq]
        n = [up] + [q[1] for q in seq]
        run(c, n)
    # the knot: a small rounded lump where the six strands meet
    nu_, nv_ = (10, 7) if D["lace_sides"] > 4 else (6, 4)
    th = np.linspace(0, 2 * np.pi, nu_ + 1)
    ph = np.linspace(0, np.pi, nv_ + 1)
    TH, PH = np.meshgrid(th, ph)
    rad = np.array([0.0052, 0.0036, 0.0040])
    dirs = np.stack([np.sin(PH) * np.cos(TH), np.cos(PH), np.sin(PH) * np.sin(TH)], -1)
    Vk = (K + up * 0.0012) + dirs.reshape(-1, 3) * rad
    idx = np.arange((nv_ + 1) * (nu_ + 1)).reshape(nv_ + 1, nu_ + 1)
    a, b, c_, d = idx[:-1, :-1], idx[1:, :-1], idx[1:, 1:], idx[:-1, 1:]
    Fk = np.vstack([np.stack([a, c_, b], -1).reshape(-1, 3), np.stack([a, d, c_], -1).reshape(-1, 3)])
    Nk = unit(dirs.reshape(-1, 3) / rad)
    if (np.cross(Vk[Fk[:, 1]] - Vk[Fk[:, 0]], Vk[Fk[:, 2]] - Vk[Fk[:, 0]]) * Nk[Fk[:, 0]]).sum() < 0:
        Fk = Fk[:, ::-1]
    ar = np.linalg.norm(Vk[Fk[:, 1]] - Vk[Fk[:, 0]], axis=1) * np.linalg.norm(Vk[Fk[:, 2]] - Vk[Fk[:, 0]], axis=1)
    Fk = Fk[ar > 1e-12]
    laces.add(Vk, Fk, Nk, np.stack([TH.ravel() * 0.0045, PH.ravel() * 0.0040], 1))
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
    """Per-panel decal UVs: flatten, turn so +V is up the head guard and +U runs left to right seen from outside, stretch to fill 0..1."""
    up = np.array([0.0, 1.0, 0.0])
    for name in PANELS:
        p = parts[name]
        V, F = p["V"], p["F"]
        comp = components(F, len(V))
        assert len(np.unique(comp)) == 1, "%s is in %d pieces" % (name, len(np.unique(comp)))
        uv = bl_unwrap(V, F)
        sa = uv_area(uv, F)
        assert (sa > 0).mean() > 0.995, "%s unwrap has flipped faces (%.3f)" % (name, (sa > 0).mean())
        fa = area3(V, F)
        scale = math.sqrt(fa.sum() / sa.sum())  # metres per UV unit
        uv = uv * scale
        w = np.zeros(len(V))
        for k in range(3):
            np.add.at(w, F[:, k], fa)
        navg = unit((p["N"] * w[:, None]).sum(0))
        right = unit(np.cross(up, navg))
        sel = (p["N"] @ navg) > 0.35  # the part of the panel that faces the viewer decides which way is up
        ref = np.stack([V @ right, V[:, 1]], 1)
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
        ratio = uv_area(uv, F) / np.maximum(fa, 1e-12)
        fsel = sel[F].all(1)
        print("decal %-9s %.3f x %.3f m, area stretch 5..95%%: %.2f..%.2f (facing part %.2f..%.2f)" % (
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
    print("atlas: %d islands, %.2f px per mm, %.0f%% of the square's bounding boxes used" % (len(isl), k * size_px / 1000, used * 100))
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
    """Ambient occlusion of the whole head guard (all thirteen meshes shadowing each other) baked onto the atlas UV set."""
    sc = bpy.context.scene
    setup_cycles(samples)
    world = bpy.data.worlds.new("bake_world")
    sc.world = world
    world.light_settings.distance = 0.10
    img = bpy.data.images.new("headguard_ao_bake", size, size, alpha=True, float_buffer=True, is_data=True)
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


_LE, _IV = "#7d1712", "#eeece6"
PALETTE = dict(FOREHEAD=_LE, CHEEK_L=_LE, CHEEK_R=_LE, CHIN=_LE, SIDE_L=_LE, SIDE_R=_LE, BACK_PAD=_LE, STRAP=_LE, TOP_TABS=_LE,
               LINING=_IV, BINDING=_IV, STITCHING=_IV, LACES="#17181b")
PANEL_MAP = dict(FOREHEAD="#e6194b", CHEEK_L="#3cb44b", CHEEK_R="#4363d8", CHIN="#f58231", SIDE_L="#ffe119", SIDE_R="#911eb4", BACK_PAD="#42d4f4",
                 STRAP="#f032e6", TOP_TABS="#bfef45", LINING="#666666", BINDING="#ffffff", STITCHING="#111111", LACES="#9a6324")
TGT = (0, 0.128, 0)
VIEWS = {  # name: (camera position, target) in web axes
    "front": ((0.0, 0.17, 1.25), TGT),
    "three-quarter front": ((0.74, 0.34, 0.96), TGT),
    "side": ((1.25, 0.17, 0.0), TGT),
    "rear": ((0.0, 0.22, -1.25), TGT),
    "top": ((0.0, 1.24, -0.30), (0, 0.13, 0)),
}
EXTRA_VIEWS = {
    "rear three-quarter from above": ((-0.62, 0.72, -0.86), TGT),
    "front from below": ((0.35, -0.25, 1.18), TGT),
}


def studio(target=TGT):
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


def render_set(objs, folder, prefix, views, height, samples, ao_path=None, grain_path=None, tiles=1.0, palette=PALETTE):
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
        o.data.materials.append(preview_material(o.name, palette[o.name], ao_img, grain_img, tiles))
    for vname, (pos, tgt) in views.items():
        aim(cam, pos, tgt)
        render(os.path.join(folder, prefix + vname + ".png"), height, height)
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
    hdir = os.path.join(OUT, "headguard")
    sdir = os.path.join(OUT, "store")
    scratch = REPORTS or "."
    if REPORTS:
        os.makedirs(REPORTS, exist_ok=True)

    reset()
    parts = build(FULL)
    if QUICK:
        objs = [make_obj(n, parts[n]["V"], parts[n]["F"], parts[n].get("N")) for n in NAMES]
        render_set(objs, scratch, "quick ", {**VIEWS, **EXTRA_VIEWS}, 800, 24)
        for o in objs:
            o.data.materials.clear()
            o.data.materials.append(preview_material(o.name, PANEL_MAP[o.name], None, None, 1, flat=True))
        for vname in ("front", "side", "rear"):
            aim(bpy.context.scene.camera, *VIEWS[vname])
            render(os.path.join(scratch, "quick panels " + vname + ".png"), 700, 700)
        return

    os.makedirs(hdir, exist_ok=True)
    os.makedirs(sdir, exist_ok=True)
    grain_path = os.path.join(OUT, "gloves", "leather-grain-normal.webp")  # shared with the glove; only read here, for the previews
    assert os.path.exists(grain_path), "shared leather grain not found: " + grain_path
    # ---- UVs --------------------------------------------------------------------------------------------------------------------
    decal_uvs(parts)
    k = pack_atlas(parts, BAKE_SIZE)
    tiles = (1.0 / k) / GRAIN_TILE_M
    # ---- objects ----------------------------------------------------------------------------------------------------------------
    objs = []
    for n in NAMES:
        p = parts[n]
        o = make_obj(n, p["V"], p["F"], p["N"], p["uv0"], p["uv1"], mat("M_" + n, hexc("#808080"), 0.5))
        if "uvWidthM" in p:
            o["uvWidthM"] = round(p["uvWidthM"], 5)
            o["uvHeightM"] = round(p["uvHeightM"], 5)
        objs.append(o)
    # ---- AO ---------------------------------------------------------------------------------------------------------------------
    ao_path = os.path.join(hdir, "headguard-ao.webp")
    bake_ao(objs, ao_path, BAKE_SIZE, BAKE_SAMPLES)
    # ---- export + json ----------------------------------------------------------------------------------------------------------
    glb = os.path.join(hdir, "headguard.glb")
    gltf_export(glb)
    allv = np.vstack([p["V"] for p in parts.values()])
    meta = dict(version=1, units="m", bounds=dict(min=[round(float(x), 5) for x in allv.min(0)], max=[round(float(x), 5) for x in allv.max(0)]),
                atlasTilesPerUnit=round(tiles, 4), panels={})
    for n in NAMES:
        cen, nrm, nt = panel_stats(parts[n])
        if n == "LINING":  # where to stand to see it: in front of the face opening, a little above
            nrm = [0.0, 0.2425, 0.9701]
        d = dict(centroid=cen, normal=nrm)
        if "uvWidthM" in parts[n]:
            d["uvWidthM"] = round(parts[n]["uvWidthM"], 5)
            d["uvHeightM"] = round(parts[n]["uvHeightM"], 5)
        d["triangles"] = nt
        meta["panels"][n] = d
    with open(os.path.join(hdir, "headguard.json"), "w") as fh:
        json.dump(meta, fh, indent=2)
    print("WROTE", os.path.join(hdir, "headguard.json"))
    # ---- renders ----------------------------------------------------------------------------------------------------------------
    if REPORTS and not NO_RENDERS:
        render_set(objs, REPORTS, "head guard ", {**VIEWS, **EXTRA_VIEWS}, 1200, 160, ao_path, grain_path, tiles)
        for o in objs:
            o.data.materials.clear()
            o.data.materials.append(preview_material(o.name, PANEL_MAP[o.name], None, None, 1, flat=True))
        for vname in ("front", "side", "rear"):
            aim(bpy.context.scene.camera, *VIEWS[vname])
            render(os.path.join(REPORTS, "panel map " + vname + ".png"), 1200, 1200)

    # ---- display copy for the shop wall -----------------------------------------------------------------------------------------
    reset()
    lp = build(LIGHT)
    groups = dict(leather=(PANELS + ["STRAP", "TOP_TABS"], "#111316"), lining=(["LINING"], "#eeece6"), binding=(["BINDING"], "#c8954d"),
                  ivory=(["LACES", "STITCHING"], "#eeece6"))
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
        make_obj("HEADGUARD_" + gname.upper(), V, F, N, material=mat("M_HEADGUARD_" + gname.upper(), hexc(col), 0.45))
    wall_path = os.path.join(sdir, "head-guard.glb")
    gltf_export(wall_path, uvs=False)
    assert os.path.getsize(wall_path) <= 500_000, "display copy is %d bytes, over the 500 KB limit" % os.path.getsize(wall_path)
    if REPORTS and not NO_RENDERS:
        setup_cycles(160)
        cam = studio()
        aim(cam, (0.74, 0.34, 0.96), TGT)
        render(os.path.join(REPORTS, "wall copy.png"), 1200, 1200)

    verify(glb, wall_path, meta)


def verify(glb, wall_path, meta):
    """Re-import the customiser head guard into an empty scene and check it against the contract."""
    reset()
    bpy.ops.import_scene.gltf(filepath=glb)
    names = {o.name: o for o in bpy.data.objects if o.type == "MESH"}
    assert set(names) == set(NAMES) and len([o for o in bpy.data.objects]) == len(NAMES), "node names differ: %s" % sorted(set(names) ^ set(NAMES))
    lo, hi = np.full(3, 1e9), np.full(3, -1e9)
    total = 0
    cen = {}
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
        cen[n] = wco.mean(0)
        me.calc_loop_triangles()
        nt = len(me.loop_triangles)
        total += nt
        assert meta["panels"][n]["triangles"] == nt, n + " triangle count differs from headguard.json"
        uvs = []
        for l in me.uv_layers:
            uv = np.zeros(len(me.loops) * 2)
            l.data.foreach_get("uv", uv)
            uvs.append(uv.reshape(-1, 2))
        extras = {k: round(o[k], 5) for k in o.keys() if k.startswith("uv")}
        print("VERIFY %-10s tris %6d  uv0 %.2f..%.2f  uv1 %.2f..%.2f  %s  material %s" % (
            n, nt, uvs[0].min(), uvs[0].max(), uvs[1].min(), uvs[1].max(), extras, me.materials[0].name if me.materials else None))
        assert me.materials and me.materials[0].name == "M_" + n
        assert uvs[1].min() >= 0 and uvs[1].max() <= 1, n + " atlas UVs leave the square"
        li = np.array([list(t.loops) for t in me.loop_triangles])
        vi = np.array([[me.loops[i].vertex_index for i in t.loops] for t in me.loop_triangles])
        assert np.abs(uv_area(uvs[1], li)).sum() > 1e-5, n + " has no atlas area"
        if n in LEATHER:
            # decal orientation as it comes back out of the file: unmirrored, +U to the right seen from outside, +V up the head guard
            ta = uv_area(uvs[0], li)
            nrm = np.array(meta["panels"][n]["normal"])
            right = unit(np.cross([0, 1, 0], nrm))
            uu, vv = uvs[0][li.ravel(), 0], uvs[0][li.ravel(), 1]
            pr, py = wco[vi.ravel()] @ right, wco[vi.ravel(), 1]
            cu, cv2 = np.corrcoef(uu, pr)[0, 1], np.corrcoef(vv, py)[0, 1]
            print("VERIFY   decal %-9s unmirrored faces %.3f, corr(U, right) %+.2f, corr(V, up) %+.2f" % (n, (ta >= 0).mean(), cu, cv2))
            if n != "LINING":  # (the lining is seen from the inside, so it is laid out for that side)
                assert (ta >= -1e-12).mean() > 0.995, n + " decal is mirrored or folded"
            if n in PANELS or n == "STRAP":
                assert cu > 0.5 and cv2 > 0.5, n + " decal is not upright"
                assert "uvWidthM" in o and "uvHeightM" in o, n + " lost its decal size extras"
    size = hi - lo
    print("VERIFY bounds (web axes) min", np.round(lo, 4), "max", np.round(hi, 4), "size", np.round(size, 4), "total tris", total)
    assert abs(lo[1]) < 1e-4 and 0.235 < size[1] < 0.27 and 0.195 < size[0] < 0.225 and 0.225 < size[2] < 0.255, "size / base out of contract"
    assert abs(lo[0] + hi[0]) < 2e-3 and abs(lo[2] + hi[2]) < 2e-3, "not centred"
    assert cen["FOREHEAD"][2] > 0 and cen["FOREHEAD"][1] > cen["CHIN"][1], "forehead is not at the front above the chin"
    assert cen["STRAP"][2] < 0 and cen["BACK_PAD"][2] < 0, "strap / back panel is not at the back"
    assert cen["CHEEK_R"][0] > 0 > cen["CHEEK_L"][0] and cen["SIDE_R"][0] > 0 > cen["SIDE_L"][0], "left / right are swapped"
    assert 60_000 <= total <= 150_000, "triangle count out of contract"
    for p in (glb, os.path.join(os.path.dirname(glb), "headguard-ao.webp"), os.path.join(os.path.dirname(glb), "headguard.json"), wall_path):
        print("VERIFY size %8d  %s" % (os.path.getsize(p), p))
    reset()
    bpy.ops.import_scene.gltf(filepath=wall_path)
    tp = 0
    lo, hi = np.full(3, 1e9), np.full(3, -1e9)
    for o in bpy.data.objects:
        if o.type == "MESH":
            o.data.calc_loop_triangles()
            tp += len(o.data.loop_triangles)
            co = np.array([o.matrix_world @ v.co for v in o.data.vertices])
            wco = np.stack([co[:, 0], co[:, 2], -co[:, 1]], 1)
            lo, hi = np.minimum(lo, wco.min(0)), np.maximum(hi, wco.max(0))
            print("VERIFY wall mesh %-20s material %s" % (o.name, o.data.materials[0].name))
    print("VERIFY wall copy tris", tp, "size", os.path.getsize(wall_path), "bounds", np.round(lo, 4), np.round(hi, 4))
    assert abs(lo[1]) < 1e-4 and abs(lo[0] + hi[0]) < 2e-3 and abs(lo[2] + hi[2]) < 2e-3 and os.path.getsize(wall_path) <= 500_000
    print("VERIFY OK")


main()
