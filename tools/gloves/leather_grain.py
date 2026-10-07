"""Procedural, seamlessly tileable leather-grain normal map (numpy only, so it runs inside Blender's Python).

Used by tools/gloves/build_glove.py. The grain is a domain-warped cellular (pebble) pattern with creases between the pebbles plus fine
periodic noise. Everything is built from periodic functions (wrapped cell lookups, FFT noise, np.roll derivatives), so the tile has no seam.

Convention: tangent-space, OpenGL style (+Y / green points along +V). Row 0 of the returned array is the BOTTOM row (V = 0), which is how
Blender stores pixels and how three.js maps a texture loaded with its default flipY = true.
"""
import numpy as np


def _fft_noise(size, rng, lo, hi, beta=1.0):
    """Periodic band-limited noise in [-1, 1]: random phases, amplitude ~ k^-beta for lo <= k <= hi (k in cycles per tile)."""
    fx = np.fft.fftfreq(size) * size
    kx, ky = np.meshgrid(fx, fx)
    k = np.hypot(kx, ky)
    amp = np.where((k >= lo) & (k <= hi), 1.0 / np.maximum(k, 1e-6) ** beta, 0.0)
    spec = amp * np.exp(2j * np.pi * rng.random((size, size)))
    n = np.fft.ifft2(spec).real
    return n / np.abs(n).max()


def _gauss(h, sigma_px):
    """Periodic gaussian blur through the FFT."""
    size = h.shape[0]
    f = np.fft.fftfreq(size)
    kx, ky = np.meshgrid(f, f)
    return np.fft.ifft2(np.fft.fft2(h) * np.exp(-2 * (np.pi * sigma_px) ** 2 * (kx ** 2 + ky ** 2))).real


def height_field(size=1024, cells=46, seed=11):
    rng = np.random.default_rng(seed)
    c = size / cells  # cell size in pixels
    px = (np.arange(size) + 0.5)
    X, Y = np.meshgrid(px, px)
    # warp the lookup so the jittered grid underneath never shows as rows and columns
    X = X + _fft_noise(size, rng, 2, 9, 1.2) * c * 0.9 + _fft_noise(size, rng, 10, 40, 1.0) * c * 0.22
    Y = Y + _fft_noise(size, rng, 2, 9, 1.2) * c * 0.9 + _fft_noise(size, rng, 10, 40, 1.0) * c * 0.22
    jit = rng.random((cells, cells, 2)) * 0.9 + 0.05
    lift = rng.random((cells, cells))
    gx = np.floor(X / c).astype(int)
    gy = np.floor(Y / c).astype(int)
    f1 = np.full((size, size), 1e9)
    f2 = np.full((size, size), 1e9)
    cell_lift = np.zeros((size, size))
    for oy in (-2, -1, 0, 1, 2):
        for ox in (-2, -1, 0, 1, 2):
            cx, cy = gx + ox, gy + oy
            j = jit[cy % cells, cx % cells]
            d = np.hypot((cx + j[..., 0]) * c - X, (cy + j[..., 1]) * c - Y)
            nearer = d < f1
            f2 = np.where(nearer, f1, np.minimum(f2, d))
            cell_lift = np.where(nearer, lift[cy % cells, cx % cells], cell_lift)
            f1 = np.where(nearer, d, f1)
    edge = np.clip((f2 - f1) / (0.42 * c), 0, 1)
    crease = edge * edge * (3 - 2 * edge)  # 0 in the crease between pebbles, 1 on top of a pebble
    dome = 1.0 - 0.45 * np.clip(f1 / c, 0, 1) ** 2
    h = crease * dome * (0.8 + 0.2 * cell_lift)
    h = h + 0.10 * _fft_noise(size, rng, 60, 220, 0.6) + 0.12 * _fft_noise(size, rng, 3, 14, 1.0)
    return _gauss(h, 1.1)


def normal_map(size=1024, strength=2.6, seed=11):
    """Returns float array (size, size, 3) in 0..1, row 0 = bottom."""
    h = height_field(size, seed=seed)
    dx = (np.roll(h, -1, axis=1) - np.roll(h, 1, axis=1)) * 0.5 * strength
    dy = (np.roll(h, -1, axis=0) - np.roll(h, 1, axis=0)) * 0.5 * strength
    n = np.stack([-dx, -dy, np.ones_like(h)], axis=-1)
    n /= np.linalg.norm(n, axis=-1, keepdims=True)
    return n * 0.5 + 0.5


def tile_error(rgb):
    """Largest step across the wrap edges compared with the largest step between neighbours inside the tile (should be about the same)."""
    wrap = max(np.abs(rgb[0] - rgb[-1]).max(), np.abs(rgb[:, 0] - rgb[:, -1]).max())
    inner = max(np.abs(np.diff(rgb, axis=0)).max(), np.abs(np.diff(rgb, axis=1)).max())
    return float(wrap), float(inner)
