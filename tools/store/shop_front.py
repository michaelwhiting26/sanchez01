"""The street side of the shop, built to the owner's storyboard (6 Oct 2026): a black timber shop front set in a dark brick wall, the sign carried on
the fascia, a window each side of the door that looks into the real workshop, lanterns, and stone setts underfoot.
Imported by build_store.py; it does not run on its own. Coordinates are web space (x right, y up, z towards the street; the wall face is z = 0.25).

Nothing here is modelled on a real building: there is no photograph of Jesse's actual shop front yet. The textures are generated below so the build
needs no outside files, and the sign is set in Cinzel (SIL Open Font Licence, tools/store/fonts).
"""
import bpy, math, os
import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
TEXTURE_UV = "UVMap"    # the name of the layout the tiling textures are drawn on (Blender's default name for a mesh's first layout)
WALL_Z = 0.25           # street face of the brick
FRONT_Z = 0.29          # street face of the timber shop front (40 mm proud of the brick)
SHOP_X = 3.0            # the timber shop front runs from -SHOP_X to +SHOP_X
SHOP_TOP = 3.3
WALL_TOP = 6.8
DOOR = (-0.86, 0.86, 0.0, 2.31)
WINDOWS = ((-2.80, -1.30, 0.75, 2.31), (1.30, 2.80, 0.75, 2.31))
UPPER_WINDOWS = ((-1.95, -0.75, 4.05, 5.75), (0.75, 1.95, 4.05, 5.75))
LANTERN_X, LANTERN_Y = 1.10, 1.98


# ---------------------------------------------------------------- generated textures
def _noise(size, centre, width, seed):
    """Smooth tiling noise of one rough feature size."""
    rng = np.random.default_rng(seed)
    f = np.fft.fft2(rng.standard_normal((size, size)))
    ky, kx = np.meshgrid(np.fft.fftfreq(size), np.fft.fftfreq(size), indexing="ij")
    h = np.real(np.fft.ifft2(f * np.exp(-((np.hypot(kx, ky) - centre) / width) ** 2)))
    return h / np.abs(h).max()


def _soften(h, n=1):
    for _ in range(n):
        h = (h + np.roll(h, 1, 0) + np.roll(h, -1, 0) + np.roll(h, 1, 1) + np.roll(h, -1, 1)) / 5
    return h


def _image(name, rgb, data=False):
    size = rgb.shape[0]
    rgba = np.concatenate([np.clip(rgb, 0, 1), np.ones((size, size, 1))], -1).astype(np.float32)
    img = bpy.data.images.new(name, size, size, alpha=False, is_data=data)
    img.pixels.foreach_set(rgba[::-1].ravel())
    img.pack()
    return img


def _normal(name, height, strength):
    gx = (np.roll(height, -1, 1) - np.roll(height, 1, 1)) * strength
    gy = (np.roll(height, -1, 0) - np.roll(height, 1, 0)) * strength
    nz = 1.0 / np.sqrt(gx * gx + gy * gy + 1.0)
    return _image(name, np.stack([-gx * nz * 0.5 + 0.5, gy * nz * 0.5 + 0.5, nz * 0.5 + 0.5], -1), data=True)


def brick_maps(size=512, across=4, rows=8):
    """Old dark stock brick in stretcher bond. One repeat is `across` bricks wide and `rows` courses high."""
    y, x = np.mgrid[0:size, 0:size]
    bh, bw = size // rows, size // across
    row = y // bh
    xo = (x + (row % 2) * (bw // 2)) % size
    col = xo // bw
    joint = 5
    mortar = ((y % bh) < joint) | ((xo % bw) < joint)
    rng = np.random.default_rng(11)
    tone = rng.uniform(-1, 1, (rows, across))[row, col]
    warm = rng.uniform(-1, 1, (rows, across))[row, col]
    grain = _noise(size, 0.16, 0.1, 3)
    blotch = _noise(size, 0.012, 0.01, 4)
    r = 0.205 + 0.045 * tone + 0.025 * warm + 0.03 * grain + 0.03 * blotch
    g = 0.150 + 0.035 * tone + 0.008 * warm + 0.025 * grain + 0.025 * blotch
    b = 0.128 + 0.030 * tone - 0.004 * warm + 0.022 * grain + 0.022 * blotch
    rgb = np.stack([r, g, b], -1)
    rgb[mortar] = np.array([0.105, 0.098, 0.09]) + 0.02 * grain[mortar][:, None]
    height = np.where(mortar, 0.0, 1.0 + 0.1 * tone) + 0.18 * grain
    return _image("brick_colour", rgb), _normal("brick_normal", _soften(height, 2), 2.2)


def sett_maps(size=512, across=6, rows=8):
    """Worn granite setts, laid in offset courses. One repeat is `across` setts wide and `rows` courses deep."""
    y, x = np.mgrid[0:size, 0:size]
    rng = np.random.default_rng(23)
    bh, bw = size / rows, size / across
    row = (y // bh).astype(int)
    shift = rng.uniform(0, bw, rows)[row]
    xo = (x + shift) % size
    col = (xo // bw).astype(int) % across
    u = (xo % bw) / bw
    v = (y % bh) / bh
    dome = (1 - np.abs(2 * u - 1) ** 5) * (1 - np.abs(2 * v - 1) ** 5)   # each sett is flat on top and rounded at its edges
    tone = rng.uniform(-1, 1, (rows, across))[row, col]
    tilt = rng.uniform(-1, 1, (rows, across))[row, col]
    grain = _noise(size, 0.2, 0.12, 5)
    height = np.clip(dome * 1.6, 0, 1) * (1 + 0.12 * tone) + 0.07 * tilt * (u - 0.5) * 2 + 0.06 * grain
    joint = dome < 0.16
    base = 0.150 + 0.035 * tone + 0.03 * grain
    rgb = np.stack([base * 1.0, base * 0.97, base * 0.95], -1)
    rgb[joint] = 0.04
    return _image("sett_colour", rgb), _normal("sett_normal", _soften(height, 1), 2.6)


def _streak(size, seed, along=0.006, across=0.18):
    """Tiling noise drawn out into long streaks down the image: wood grain."""
    rng = np.random.default_rng(seed)
    f = np.fft.fft2(rng.standard_normal((size, size)))
    ky, kx = np.meshgrid(np.fft.fftfreq(size), np.fft.fftfreq(size), indexing="ij")
    h = np.real(np.fft.ifft2(f * np.exp(-(kx / across) ** 2) * np.exp(-(ky / along) ** 2)))
    return h / np.abs(h).max()


def plank_maps(name, base, size=512, boards=6, seed=31, gap=2, joints=True):
    """Boards running up the image, `boards` to a repeat, each its own tone, with grain, the odd butt joint and a dark gap between boards."""
    y, x = np.mgrid[0:size, 0:size]
    rng = np.random.default_rng(seed)
    bw = size / boards
    board = (x // bw).astype(int)
    tone = rng.uniform(-1, 1, boards)[board]
    joint_at = rng.integers(0, size, boards)[board]
    grain = _streak(size, seed + 1)
    fine = _streak(size, seed + 2, along=0.02, across=0.3)
    gaps = ((x % bw) < gap) if gap else np.zeros_like(x, bool)
    if gap and joints:
        gaps |= np.abs(y - joint_at) < gap
    k = 1 + 0.2 * tone + 0.3 * grain + 0.12 * fine
    rgb = np.stack([base[0] * k, base[1] * k, base[2] * k], -1)
    rgb[gaps] *= 0.25
    height = np.where(gaps, 0.0, 1.0) + 0.22 * grain + 0.1 * fine
    return _image(f"{name}_colour", rgb), _normal(f"{name}_normal", _soften(height, 1), 1.6)


def plaster_maps(size=512):
    """Old hand-finished plaster: slow tonal drift, a faint trowelled surface, nothing that reads as a pattern."""
    drift = _noise(size, 0.008, 0.008, 41)
    patch = _noise(size, 0.03, 0.02, 42)
    fine = _noise(size, 0.22, 0.12, 43)
    k = 1 + 0.16 * drift + 0.1 * patch + 0.05 * fine
    rgb = np.stack([0.185 * k, 0.155 * k, 0.128 * k], -1)
    return _image("plaster_colour", rgb), _normal("plaster_normal", _soften(0.6 * patch + 0.4 * fine, 1), 0.7)


def weave_maps(name, base, size=512, cells=8, seed=71):
    """Strips woven over and under each other, basket fashion. `cells` crossings to a repeat (an even number, so it tiles)."""
    y, x = np.mgrid[0:size, 0:size]
    c = size / cells
    u, v = (x % c) / c, (y % c) / c
    over = ((x // c + y // c) % 2) == 0                 # True where the strip running across is on top
    across = np.sin(np.pi * v) ** 0.6 * (0.62 + 0.38 * np.sin(np.pi * u))
    down = np.sin(np.pi * u) ** 0.6 * (0.62 + 0.38 * np.sin(np.pi * v))
    height = np.where(over, across, down)
    grain_down = _streak(size, seed)
    grain = np.where(over, grain_down.T, grain_down)    # grain follows each strip
    rng = np.random.default_rng(seed + 1)
    tone = rng.uniform(-1, 1, (cells, cells))[(y // c).astype(int), (x // c).astype(int)]
    k = (0.8 + 0.2 * height) * (1 + 0.1 * tone + 0.2 * grain)
    rgb = np.stack([base[0] * k, base[1] * k, base[2] * k], -1)
    return _image(f"{name}_colour", rgb), _normal(f"{name}_normal", _soften(height + 0.05 * grain, 2), 1.7)


def marble_maps(size=512):
    """Dark green marble, polished: a slow cloudiness in the stone and only a few long, thin veins, so it sits quietly behind a product.
    A vein is where very slow noise crosses zero; a little faster noise bends it so it wanders instead of running straight."""
    a = _noise(size, 0.004, 0.003, 81) + 0.22 * _noise(size, 0.02, 0.012, 82)
    b = _noise(size, 0.005, 0.003, 83) + 0.2 * _noise(size, 0.03, 0.02, 84)
    cloud = _noise(size, 0.012, 0.012, 85)
    fleck = _noise(size, 0.12, 0.08, 86)
    pale = np.exp(-(a / 0.016) ** 2)
    ochre = np.exp(-(b / 0.01) ** 2)
    k = 1 + 0.5 * cloud + 0.12 * fleck
    rgb = np.stack([0.028 * k, 0.058 * k, 0.043 * k], -1)
    rgb += pale[..., None] * np.array([0.2, 0.22, 0.17]) + ochre[..., None] * np.array([0.16, 0.11, 0.045])
    return _image("marble_colour", rgb), _normal("marble_normal", _soften(0.15 * cloud, 2), 0.3)


def _textured(name, colour_img, normal_img, rough, normal_strength=1.0, metal=0.0):
    m = bpy.data.materials.new(name)
    try:
        m.use_nodes = True
    except Exception:
        pass
    nt = m.node_tree
    b = nt.nodes.get("Principled BSDF")
    b.inputs["Roughness"].default_value = rough
    b.inputs["Metallic"].default_value = metal
    # The textures name the layout they are drawn on. A surface can also carry a second layout for baked light (bake_light.py), and neither
    # Blender nor the exported file may be left to guess which is which.
    where = nt.nodes.new("ShaderNodeUVMap")
    where.uv_map = TEXTURE_UV
    col = nt.nodes.new("ShaderNodeTexImage")
    col.image = colour_img
    nt.links.new(where.outputs["UV"], col.inputs["Vector"])
    nt.links.new(col.outputs["Color"], b.inputs["Base Color"])
    nor = nt.nodes.new("ShaderNodeTexImage")
    nor.image = normal_img
    nt.links.new(where.outputs["UV"], nor.inputs["Vector"])
    nor.image.colorspace_settings.name = "Non-Color"
    nm = nt.nodes.new("ShaderNodeNormalMap")
    nm.inputs["Strength"].default_value = normal_strength
    nt.links.new(nor.outputs["Color"], nm.inputs["Color"])
    nt.links.new(nm.outputs["Normal"], b.inputs["Normal"])
    return m


# ---------------------------------------------------------------- building blocks
class Kit:
    def __init__(self, B, mat, hexc):
        self.B, self.mat, self.hexc = B, mat, hexc
        self.made = []
        self.lights = []   # where the fixtures put light, for the bake: (kind, position, candela, colour[, length])

    def bx(self, m, x0, x1, y0, y1, z0, z1, bevel=0.0):
        """A box from its corners, edges eased when asked."""
        bpy.ops.mesh.primitive_cube_add(size=1, location=self.B(((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2)))
        o = bpy.context.object
        o.scale = (abs(x1 - x0), abs(z1 - z0), abs(y1 - y0))
        bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
        if bevel:
            md = o.modifiers.new("edge", "BEVEL")
            md.width, md.segments, md.limit_method = bevel, 2, "ANGLE"
            bpy.ops.object.modifier_apply(modifier=md.name)
        o.data.materials.append(m)
        self.made.append(o)
        return o

    def wall(self, m, x0, x1, y0, y1, z0, z1, openings=()):
        """A wall with rectangular openings: the wall is cut into a grid along every opening edge and the cells inside an opening are left out."""
        xs = sorted({x0, x1, *[v for o in openings for v in o[:2] if x0 < v < x1]})
        ys = sorted({y0, y1, *[v for o in openings for v in o[2:] if y0 < v < y1]})
        for xa, xb in zip(xs, xs[1:]):
            run = None
            for ya, yb in zip(ys, ys[1:]):
                cx, cy = (xa + xb) / 2, (ya + yb) / 2
                solid = not any(o[0] < cx < o[1] and o[2] < cy < o[3] for o in openings)
                if solid:
                    run = (run[0], yb) if run else (ya, yb)
                if run and (not solid or yb == ys[-1]):
                    self.bx(m, xa, xb, run[0], run[1], z0, z1)
                    run = None

    def cyl(self, m, c, r, h, axis="y", verts=16):
        bpy.ops.mesh.primitive_cylinder_add(radius=r, depth=h, vertices=verts, location=self.B(c))
        o = bpy.context.object
        if axis == "x":
            o.rotation_euler = (0, math.pi / 2, 0)
        elif axis == "z":
            o.rotation_euler = (math.pi / 2, 0, 0)
        bpy.ops.object.transform_apply(location=False, rotation=True, scale=False)
        bpy.ops.object.shade_smooth()
        o.data.materials.append(m)
        self.made.append(o)
        return o

    def taper(self, m, c, r_low, r_high, h, verts=16, open_ends=False):
        """A cone frustum standing upright: thread cones, lamp shades (open underneath so the bulb shows)."""
        bpy.ops.mesh.primitive_cone_add(vertices=verts, radius1=r_low, radius2=r_high, depth=h, location=self.B(c), end_fill_type="NOTHING" if open_ends else "NGON")
        o = bpy.context.object
        bpy.ops.object.shade_smooth()
        o.data.materials.append(m)
        self.made.append(o)
        return o

    def bulb(self, m, c, r):
        bpy.ops.mesh.primitive_uv_sphere_add(radius=r, segments=12, ring_count=8, location=self.B(c))
        o = bpy.context.object
        bpy.ops.object.shade_smooth()
        o.data.materials.append(m)
        self.made.append(o)
        return o

    def pendant(self, shade, glow, cord, x, y, z, ceiling, r=0.2, cd=9.0):
        """A black enamel shade on a cord with a lit bulb under it. (x, y, z) is the rim of the shade; `cd` is how bright the bulb is, in candela."""
        self.lights.append(("point", (x, y - 0.03, z), cd, "#ffc58a"))
        self.taper(shade, (x, y + 0.085, z), r, 0.035, 0.17, 20, open_ends=True)
        self.cyl(shade, (x, y + 0.2, z), 0.03, 0.07, verts=10)
        self.cyl(cord, (x, (y + 0.23 + ceiling) / 2, z), 0.006, ceiling - y - 0.23, verts=6)
        self.bulb(glow, (x, y + 0.03, z), 0.05)

    def blob(self, m, c, s):
        """A rounded form: a ball squashed to size."""
        bpy.ops.mesh.primitive_uv_sphere_add(radius=0.5, segments=16, ring_count=10, location=self.B(c))
        o = bpy.context.object
        o.scale = (s[0], s[2], s[1])
        bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
        bpy.ops.object.shade_smooth()
        o.data.materials.append(m)
        self.made.append(o)
        return o

    def ring(self, m, c, r, thick=0.006):
        """A loop lying flat against the back wall (a coiled rope)."""
        bpy.ops.mesh.primitive_torus_add(major_radius=r, minor_radius=thick, major_segments=24, minor_segments=6, location=self.B(c), rotation=(math.pi / 2, 0, 0))
        o = bpy.context.object
        bpy.ops.object.transform_apply(location=False, rotation=True, scale=False)
        bpy.ops.object.shade_smooth()
        o.data.materials.append(m)
        self.made.append(o)
        return o

    def t_hook(self, m, x, y, z, out=0.07):
        """A brass T-hook standing out from the back wall."""
        self.cyl(m, (x, y, z + out / 2), 0.008, out, axis="z", verts=10)
        self.cyl(m, (x, y, z + out), 0.01, 0.09, axis="x", verts=10)

    def cone(self, m, c, r, h, sides=4):
        bpy.ops.mesh.primitive_cone_add(vertices=sides, radius1=r, radius2=0.012, depth=h, location=self.B(c), rotation=(0, 0, math.pi / 4))
        o = bpy.context.object
        o.data.materials.append(m)
        self.made.append(o)
        return o

    def text(self, m, body, c, size, extrude, spacing=1.0):
        bpy.ops.object.text_add(location=self.B(c))
        o = bpy.context.object
        o.data.body, o.data.size, o.data.align_x = body, size, "CENTER"
        o.data.extrude, o.data.space_character = extrude, spacing
        o.data.resolution_u = 3
        o.data.font = bpy.data.fonts.load(os.path.join(HERE, "fonts", "Cinzel.ttf"), check_existing=True)
        o.rotation_euler = (math.pi / 2, 0, 0)  # stand it up, facing the street
        bpy.ops.object.convert(target="MESH")
        o = bpy.context.object
        o.data.materials.append(m)
        self.made.append(o)
        return o

    def lantern(self, iron, glow, x, y, z, w=0.2, h=0.36, bracket=True):
        """A four-sided iron lantern with a lit core. (x, y, z) is the centre of its body."""
        r = w / 2
        p = 0.012
        for sx in (-1, 1):
            for sz in (-1, 1):
                self.bx(iron, x + sx * r - p, x + sx * r + p, y - h / 2, y + h / 2, z + sz * r - p, z + sz * r + p)
        self.bx(iron, x - r - 0.02, x + r + 0.02, y - h / 2 - 0.022, y - h / 2, z - r - 0.02, z + r + 0.02, 0.004)
        self.bx(iron, x - r - 0.03, x + r + 0.03, y + h / 2, y + h / 2 + 0.02, z - r - 0.03, z + r + 0.03, 0.004)
        self.cone(iron, (x, y + h / 2 + 0.02 + 0.07, z), (r + 0.03) * 1.41, 0.14)
        self.bx(iron, x - 0.012, x + 0.012, y + h / 2 + 0.15, y + h / 2 + 0.2, z - 0.012, z + 0.012)
        self.bx(glow, x - r * 0.42, x + r * 0.42, y - h * 0.34, y + h * 0.26, z - r * 0.42, z + r * 0.42, 0.01)   # the lit core
        if bracket:
            self.bx(iron, x - 0.03, x + 0.03, y - 0.16, y + 0.2, FRONT_Z + 0.06, FRONT_Z + 0.075, 0.003)               # back plate
            self.bx(iron, x - 0.01, x + 0.01, y + h / 2 + 0.19, y + h / 2 + 0.21, FRONT_Z + 0.07, z + 0.012)           # arm
            self.bx(iron, x - 0.01, x + 0.01, y - 0.1, y + h / 2 + 0.2, FRONT_Z + 0.07, FRONT_Z + 0.09)


def _uv_from_world(o, tile_u, tile_v):
    """Lay a texture across a mesh by where each face sits in the world, so courses line up across separate blocks."""
    me = o.data
    if not me.uv_layers:
        me.uv_layers.new()
    uv = me.uv_layers.active.data
    mw = o.matrix_world
    for poly in me.polygons:
        n = mw.to_3x3() @ poly.normal
        ax = max(range(3), key=lambda i: abs(n[i]))
        for li in poly.loop_indices:
            co = mw @ me.vertices[me.loops[li].vertex_index].co
            a, b = ((co.y, co.z), (co.x, co.z), (co.x, co.y))[ax]   # Blender axes: x across, y depth, z up
            uv[li].uv = (a / tile_u, b / tile_v)


def join_by_material(objs, prefix):
    """One mesh per material: a shop front is a few draw calls, not a few hundred."""
    groups = {}
    for o in objs:
        groups.setdefault(o.data.materials[0].name, []).append(o)
    out = {}
    for name, group in groups.items():
        bpy.ops.object.select_all(action="DESELECT")
        for o in group:
            o.select_set(True)
        bpy.context.view_layer.objects.active = group[0]
        if len(group) > 1:
            bpy.ops.object.join()
        o = bpy.context.object
        o.name = f"{prefix}_{name}"
        out[name] = o
    return out


# ---------------------------------------------------------------- the shop front
def build(B, mat, hexc, iron):
    k = Kit(B, mat, hexc)
    brick = _textured("brick", *brick_maps(), rough=0.86, normal_strength=1.0)
    setts = _textured("setts", *sett_maps(), rough=0.42, normal_strength=1.0)        # low roughness: the street has been rained on
    timber = mat("shopfront_timber", hexc("#100d0b"), 0.55)                          # black paint over joinery, a soft sheen
    stone = mat("threshold_stone", hexc("#2b2824"), 0.7)
    matting = mat("doormat", hexc("#15100b"), 1.0)
    sign = mat("sign_brass", hexc("#c8954d"), 0.36, 0.9, 0.22)                       # aged brass letters, lifted a little so they read at night
    glow = mat("lantern_glow", hexc("#ffa94d"), 0.5, 0.0, 3.2)
    pane = mat("window_glass", hexc("#a9b6b4"), 0.06, 0.0, 0.0, 0.14)
    dark_pane = mat("upper_window_glass", hexc("#07080a"), 0.38)                       # unlit rooms upstairs: dark, with only a dull sheen

    # ground
    k.bx(setts, -9, 9, -0.1, 0.0, WALL_Z, 11.0)
    k.bx(stone, -1.25, 1.25, 0.0, 0.035, WALL_Z, 0.95, 0.008)
    k.bx(matting, -0.62, 0.62, 0.035, 0.05, 0.42, 0.86, 0.004)

    # brick: either side of the shop front, and the upper storey with two dark windows
    k.wall(brick, -9, -SHOP_X, 0, WALL_TOP, 0, WALL_Z)
    k.wall(brick, SHOP_X, 9, 0, WALL_TOP, 0, WALL_Z)
    k.wall(brick, -SHOP_X, SHOP_X, SHOP_TOP, WALL_TOP, 0, WALL_Z, UPPER_WINDOWS)
    k.bx(stone, -9, 9, WALL_TOP, WALL_TOP + 0.16, -0.05, WALL_Z + 0.1, 0.01)        # coping
    for x0, x1, y0, y1 in UPPER_WINDOWS:
        k.bx(dark_pane, x0, x1, y0, y1, 0.09, 0.1)
        k.bx(stone, x0 - 0.08, x1 + 0.08, y0 - 0.09, y0, 0.12, WALL_Z + 0.06, 0.006)  # sill
        f = 0.05
        for a, b, c, d in ((x0, x0 + f, y0, y1), (x1 - f, x1, y0, y1), (x0, x1, y1 - f, y1), (x0, x1, y0, y0 + f),
                           ((x0 + x1) / 2 - 0.02, (x0 + x1) / 2 + 0.02, y0, y1), (x0, x1, (y0 + y1) / 2 - 0.02, (y0 + y1) / 2 + 0.02)):
            k.bx(timber, a, b, c, d, 0.1, 0.15)

    # timber shop front: the panel the door and windows sit in
    k.wall(timber, -SHOP_X, SHOP_X, 0, SHOP_TOP, 0, FRONT_Z, (DOOR, *WINDOWS))
    for sx in (-1, 1):
        # pilasters: one between door and window (it carries the lantern), one closing the end
        for xc, w in ((1.10, 0.28), (2.92, 0.22)):
            x0, x1 = sx * xc - w / 2, sx * xc + w / 2
            k.bx(timber, x0, x1, 0.0, 2.40, FRONT_Z, FRONT_Z + 0.06, 0.006)
            k.bx(timber, x0 - 0.02, x1 + 0.02, 0.0, 0.3, FRONT_Z, FRONT_Z + 0.085, 0.008)       # plinth
            k.bx(timber, x0 + 0.045, x1 - 0.045, 0.42, 2.26, FRONT_Z + 0.06, FRONT_Z + 0.072, 0.004)  # raised panel
            k.bx(timber, x0 - 0.025, x1 + 0.025, 2.40, 2.47, FRONT_Z, FRONT_Z + 0.1, 0.008)     # cap
        # stall riser under each window, with a planted moulding
        wx0, wx1, wy0, wy1 = WINDOWS[1] if sx > 0 else WINDOWS[0]
        mx0, mx1 = wx0 + 0.12, wx1 - 0.12
        for a, b, c, d in ((mx0, mx1, 0.5, 0.53), (mx0, mx1, 0.14, 0.17), (mx0, mx0 + 0.03, 0.14, 0.53), (mx1 - 0.03, mx1, 0.14, 0.53)):
            k.bx(timber, a, b, c, d, FRONT_Z, FRONT_Z + 0.02, 0.004)
        k.bx(timber, wx0 - 0.03, wx1 + 0.03, wy0 - 0.05, wy0, FRONT_Z - 0.02, FRONT_Z + 0.09, 0.008)   # sill
        # window: frame, one mullion, a transom light across the top
        f = 0.055
        for a, b, c, d in ((wx0, wx0 + f, wy0, wy1), (wx1 - f, wx1, wy0, wy1), (wx0, wx1, wy1 - f, wy1), (wx0, wx1, wy0, wy0 + f),
                           ((wx0 + wx1) / 2 - 0.022, (wx0 + wx1) / 2 + 0.022, wy0, wy1), (wx0, wx1, 1.88, 1.925)):
            k.bx(timber, a, b, c, d, 0.14, 0.2, 0.004)
        k.bx(pane, wx0, wx1, wy0, wy1, 0.165, 0.171)
        # lanterns: one on the pilaster, one standing on the paving
        k.lantern(iron, glow, sx * LANTERN_X, LANTERN_Y, FRONT_Z + 0.22)
        k.lantern(iron, glow, sx * 1.52, 0.27, 1.0, w=0.24, h=0.4, bracket=False)

    # fascia and cornice, with the sign planted on the fascia
    k.bx(timber, -SHOP_X - 0.04, SHOP_X + 0.04, 2.47, 2.53, FRONT_Z, FRONT_Z + 0.12, 0.01)       # architrave
    k.bx(timber, -SHOP_X - 0.02, SHOP_X + 0.02, 2.53, 3.14, FRONT_Z, FRONT_Z + 0.07, 0.006)      # fascia board
    k.bx(timber, -SHOP_X - 0.07, SHOP_X + 0.07, 3.14, 3.21, FRONT_Z, FRONT_Z + 0.16, 0.012)
    k.bx(timber, -SHOP_X - 0.12, SHOP_X + 0.12, 3.21, 3.30, FRONT_Z, FRONT_Z + 0.24, 0.014)      # cornice
    k.text(sign, "SANCHEZ", (0, 2.775, FRONT_Z + 0.07), 0.345, 0.012, 1.08)
    k.text(sign, "CUSTOM BOXING", (0, 2.6, FRONT_Z + 0.07), 0.098, 0.008, 1.5)

    joined = join_by_material(k.made, "EXT")
    _uv_from_world(joined["brick"], 0.9, 0.6)      # four 225 mm bricks across, eight 75 mm courses up
    _uv_from_world(joined["setts"], 0.72, 0.72)    # setts about 120 x 90 mm
    for name, o in joined.items():
        if name not in ("brick", "setts"):
            while o.data.uv_layers:
                o.data.uv_layers.remove(o.data.uv_layers[0])
    return joined
