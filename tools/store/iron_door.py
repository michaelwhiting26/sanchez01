"""The shop's front door: a pair of wrought-iron leaves with scrollwork over pebbled glass, built from the owner's reference photo
(6 Oct 2026, "Double-Wrought-Iron-Doors"). Imported by build_store.py; it does not run on its own.

How the pattern was taken from the photo: the left leaf's glazed panel was cropped and enlarged four times (940 x 2920 px) and each scroll was read
off that crop against a measuring grid. Those points live in door_pattern.py, in "crop pixels" (x right, y down); px() turns them into metres on the leaf.
It follows that door's ironwork bar by bar (scroll head, ladder band, lyre, heart, riveted grid); it is drawn from one photo, not from a maker's drawing.

Each leaf hangs from its own node (DOOR on the left, DOOR_R on the right) so the site can swing them. The right leaf re-uses the left leaf's meshes
through a mirrored node, so the file carries the ironwork once.
"""
import bpy, math
from door_pattern import PXC, BAND_Y, GRID_Y, PICKET_X, lines as pattern_lines

# ---- leaf, in metres, in leaf space: u from the hinge edge, v up from the floor, w towards the street
LEAF_W = 0.795          # one leaf (two leaves and a 10 mm meeting gap fill the 1.6 m opening)
LEAF_H = 2.22
LEAF_T = 0.05
STILE = 0.12            # the upright on each side of the glass
RAIL_TOP = 0.13
RAIL_BOT = 0.17
OPEN_U0, OPEN_U1 = STILE, 0.68
OPEN_V0, OPEN_V1 = RAIL_BOT, LEAF_H - RAIL_TOP
BEAD = 0.045            # the set-back inner frame that holds the glass
BAR_R = 0.008           # scroll bar radius (about 16 mm bar, as measured on the photo)
GRILLE_W = 0.03         # distance of the ironwork's centre in front of the leaf's middle

# ---- crop pixels -> leaf metres (the grille's outer edge is x 70..880, y 65..2845 on the crop)
PX0, PX1, PY0 = 70.0, 880.0, 65.0
S = (OPEN_U1 - OPEN_U0) / (PX1 - PX0)


def px(x, y):
    return (OPEN_U0 + (x - PX0) * S, OPEN_V1 - (y - PY0) * S)


class Leaf:
    """Collects one leaf's parts in the scene, then joins them into three meshes (iron, glass, hardware)."""

    def __init__(self, hinge_x, door_z, B, mats):
        self.hx, self.z, self.B, self.m = hinge_x, door_z, B, mats
        self.parts = {"iron": [], "glass": [], "hardware": []}

    def at(self, u, v, w=0.0):  # leaf space -> web space
        return (self.hx + u, v, self.z + w)

    def box(self, kind, u0, u1, v0, v1, w0, w1, bevel=0.0):
        c = self.at((u0 + u1) / 2, (v0 + v1) / 2, (w0 + w1) / 2)
        bpy.ops.mesh.primitive_cube_add(size=1, location=self.B(c))
        o = bpy.context.object
        o.scale = (abs(u1 - u0), abs(w1 - w0), abs(v1 - v0))
        bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
        if bevel:
            md = o.modifiers.new("edge", "BEVEL")
            md.width, md.segments, md.limit_method = bevel, 2, "ANGLE"
            bpy.ops.object.modifier_apply(modifier=md.name)
        self.parts[kind].append(o)
        return o

    def rivet(self, u, v, w, r=0.0065, kind="iron"):
        bpy.ops.mesh.primitive_uv_sphere_add(radius=r, segments=10, ring_count=6, location=self.B(self.at(u, v, w)))
        o = bpy.context.object
        o.scale = (1, 0.6, 1)  # a domed head, not a ball
        bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
        bpy.ops.object.shade_smooth()
        self.parts[kind].append(o)

    def tubes(self, strokes, kind="iron"):
        cu = bpy.data.curves.new("scrolls", "CURVE")
        cu.dimensions = "3D"
        cu.bevel_depth, cu.bevel_resolution, cu.use_fill_caps = BAR_R, 1, True
        for line in strokes:
            sp = cu.splines.new("POLY")
            sp.points.add(len(line) - 1)
            for p, (x, y, taper) in zip(sp.points, line):
                u, v = px(x, y)
                p.co = (*self.B(self.at(u, v, GRILLE_W)), 1)
                p.radius = taper
            sp.use_smooth = True
        o = bpy.data.objects.new("scrolls", cu)
        bpy.context.scene.collection.objects.link(o)
        bpy.ops.object.select_all(action="DESELECT")
        o.select_set(True)
        bpy.context.view_layer.objects.active = o
        bpy.ops.object.convert(target="MESH")
        self.parts[kind].append(bpy.context.object)

    def finish(self, hinge, prefix):
        made = {}
        for kind, objs in self.parts.items():
            if not objs:
                continue
            bpy.ops.object.select_all(action="DESELECT")
            for o in objs:
                o.select_set(True)
            bpy.context.view_layer.objects.active = objs[0]
            if len(objs) > 1:
                bpy.ops.object.join()
            o = bpy.context.object
            o.name = f"{prefix}_{kind}"
            o.data.name = f"door_leaf_{kind}"
            o.data.materials.clear()
            o.data.materials.append(self.m[kind])
            if kind != "glass":  # only the glass carries a surface map; the painted parts need no texture coordinates
                while o.data.uv_layers:
                    o.data.uv_layers.remove(o.data.uv_layers[0])
            o.parent = hinge
            o.matrix_parent_inverse = hinge.matrix_world.inverted()
            made[kind] = o
        return made


def _glass_normal_image(size=256):
    """A tiling normal map for cast, pebbled ("rain") glass, made here so the build needs no outside file."""
    import numpy as np
    rng = np.random.default_rng(7)
    f = np.fft.fft2(rng.standard_normal((size, size)))
    ky, kx = np.meshgrid(np.fft.fftfreq(size), np.fft.fftfreq(size), indexing="ij")
    k = np.hypot(kx, ky)
    h = np.real(np.fft.ifft2(f * np.exp(-((k - 0.045) / 0.03) ** 2)))  # pebbles of one rough size, and it tiles because it is made in frequency space
    h /= np.abs(h).max()
    gx = (np.roll(h, -1, 1) - np.roll(h, 1, 1)) * 6.0
    gy = (np.roll(h, -1, 0) - np.roll(h, 1, 0)) * 6.0
    nz = 1.0 / np.sqrt(gx * gx + gy * gy + 1.0)
    rgba = np.stack([(-gx * nz) * 0.5 + 0.5, (-gy * nz) * 0.5 + 0.5, nz * 0.5 + 0.5, np.ones_like(nz)], -1).astype(np.float32)
    img = bpy.data.images.new("door_glass_pebble_normal", size, size, alpha=False, is_data=True)
    img.pixels.foreach_set(rgba.ravel())
    img.pack()
    return img


def door_materials(hexc):
    def base(name):
        m = bpy.data.materials.new(name)
        try:
            m.use_nodes = True
        except Exception:
            pass
        return m, m.node_tree.nodes.get("Principled BSDF")

    iron, b = base("door_iron")          # satin green-black paint over iron, as in the photo
    b.inputs["Base Color"].default_value = (*hexc("#1b2723"), 1)
    b.inputs["Roughness"].default_value = 0.46
    b.inputs["Metallic"].default_value = 0.35

    hw, b = base("door_hardware")        # the handle sets: the same colour, a little more polished from hands
    b.inputs["Base Color"].default_value = (*hexc("#1a2421"), 1)
    b.inputs["Roughness"].default_value = 0.3
    b.inputs["Metallic"].default_value = 0.7

    glass, b = base("door_glass")        # obscure glass: lets the light through, blurs what is behind it
    b.inputs["Base Color"].default_value = (*hexc("#e9efee"), 1)
    b.inputs["Roughness"].default_value = 0.42
    b.inputs["Metallic"].default_value = 0.0
    b.inputs["IOR"].default_value = 1.5
    b.inputs["Transmission Weight"].default_value = 1.0
    # Obscure glass scatters the lamp light behind it, so the pane itself glows: this is what puts the scrollwork in silhouette from the street.
    b.inputs["Emission Color"].default_value = (*hexc("#f0b46e"), 1)
    b.inputs["Emission Strength"].default_value = 0.55
    nt = glass.node_tree
    tex = nt.nodes.new("ShaderNodeTexImage")
    tex.image = _glass_normal_image()
    tex.image.colorspace_settings.name = "Non-Color"
    nm = nt.nodes.new("ShaderNodeNormalMap")
    nm.inputs["Strength"].default_value = 0.9
    nt.links.new(tex.outputs["Color"], nm.inputs["Color"])
    nt.links.new(nm.outputs["Normal"], b.inputs["Normal"])
    return {"iron": iron, "hardware": hw, "glass": glass}


def _build_leaf(leaf):
    T2 = LEAF_T / 2
    # the leaf itself: two stiles, top and bottom rails, edges eased as on fabricated steel
    leaf.box("iron", 0, STILE, 0, LEAF_H, -T2, T2, 0.003)
    leaf.box("iron", OPEN_U1, LEAF_W, 0, LEAF_H, -T2, T2, 0.003)
    leaf.box("iron", STILE, OPEN_U1, OPEN_V1, LEAF_H, -T2, T2, 0.003)
    leaf.box("iron", STILE, OPEN_U1, 0, OPEN_V0, -T2, T2, 0.003)
    # the set-back frame that holds the glass
    leaf.box("iron", OPEN_U0, OPEN_U0 + BEAD, OPEN_V0, OPEN_V1, -0.02, 0.008, 0.002)
    leaf.box("iron", OPEN_U1 - BEAD, OPEN_U1, OPEN_V0, OPEN_V1, -0.02, 0.008, 0.002)
    leaf.box("iron", OPEN_U0 + BEAD, OPEN_U1 - BEAD, OPEN_V1 - BEAD, OPEN_V1, -0.02, 0.008, 0.002)
    leaf.box("iron", OPEN_U0 + BEAD, OPEN_U1 - BEAD, OPEN_V0, OPEN_V0 + BEAD, -0.02, 0.008, 0.002)
    g = leaf.box("glass", OPEN_U0 + BEAD - 0.004, OPEN_U1 - BEAD + 0.004, OPEN_V0 + BEAD - 0.004, OPEN_V1 - BEAD + 0.004, -0.010, -0.002)
    uv = g.data.uv_layers.active.data  # lay the pebble map flat across the pane, one repeat every 20 cm (pebbles a little under 2 cm)
    for poly in g.data.polygons:
        for li in poly.loop_indices:
            co = g.matrix_world @ g.data.vertices[g.data.loops[li].vertex_index].co
            uv[li].uv = (co.x / 0.2, co.z / 0.2)

    # the grille: a riveted flat-bar border, the centre bar, the ladder band and the grid
    bw, bt = 0.02, 0.012
    w0, w1 = GRILLE_W - bt / 2, GRILLE_W + bt / 2
    leaf.box("iron", OPEN_U0, OPEN_U0 + bw, OPEN_V0, OPEN_V1, w0, w1, 0.0015)
    leaf.box("iron", OPEN_U1 - bw, OPEN_U1, OPEN_V0, OPEN_V1, w0, w1, 0.0015)
    leaf.box("iron", OPEN_U0 + bw, OPEN_U1 - bw, OPEN_V1 - bw, OPEN_V1, w0, w1, 0.0015)
    leaf.box("iron", OPEN_U0 + bw, OPEN_U1 - bw, OPEN_V0, OPEN_V0 + bw, w0, w1, 0.0015)
    n_side, n_top = 22, 7
    for i in range(n_side + 1):
        v = OPEN_V0 + bw / 2 + (OPEN_V1 - OPEN_V0 - bw) * i / n_side
        leaf.rivet(OPEN_U0 + bw / 2, v, w1)
        leaf.rivet(OPEN_U1 - bw / 2, v, w1)
    for i in range(1, n_top):
        u = OPEN_U0 + bw / 2 + (OPEN_U1 - OPEN_U0 - bw) * i / n_top
        leaf.rivet(u, OPEN_V1 - bw / 2, w1)
        leaf.rivet(u, OPEN_V0 + bw / 2, w1)

    sw = 0.016  # straight bars
    uc, v_top = px(PXC, PY0)
    _, v_foot = px(PXC, 2845)
    leaf.box("iron", uc - sw / 2, uc + sw / 2, v_foot + bw, v_top - bw, w0, w1, 0.0015)
    for y in BAND_Y + GRID_Y:
        _, v = px(PXC, y)
        leaf.box("iron", OPEN_U0 + bw, OPEN_U1 - bw, v - sw / 2, v + sw / 2, w0 + 0.001, w1 + 0.001, 0.0015)
    _, vb0 = px(PXC, BAND_Y[0])
    _, vb1 = px(PXC, BAND_Y[1])
    _, vg0 = px(PXC, GRID_Y[0])
    for x in PICKET_X:
        u, _ = px(x, 0)
        leaf.box("iron", u - sw / 2, u + sw / 2, vb1, vb0, w0, w1, 0.0015)
        leaf.box("iron", u - sw / 2, u + sw / 2, v_foot + bw, vg0, w0, w1, 0.0015)
    for x in PICKET_X + (PXC,):
        u, _ = px(x, 0)
        for y in BAND_Y + GRID_Y:
            _, v = px(PXC, y)
            leaf.rivet(u, v, w1 + 0.001, 0.006)

    # the scrolls (both halves of the panel come from door_pattern)
    leaf.tubes(pattern_lines())

    # handle set on the meeting stile: deadbolt plate above, backplate with thumb piece and a long grip below
    hu = (OPEN_U1 + LEAF_W) / 2
    f = T2
    leaf.box("hardware", hu - 0.026, hu + 0.026, 1.215, 1.285, f, f + 0.007, 0.002)
    bpy.ops.mesh.primitive_cylinder_add(radius=0.014, depth=0.008, vertices=24, location=leaf.B(leaf.at(hu, 1.25, f + 0.009)), rotation=(math.pi / 2, 0, 0))
    bpy.ops.object.shade_smooth()
    leaf.parts["hardware"].append(bpy.context.object)
    leaf.box("hardware", hu - 0.026, hu + 0.026, 1.06, 1.165, f, f + 0.007, 0.002)       # upper backplate
    leaf.box("hardware", hu - 0.014, hu + 0.014, 1.118, 1.13, f + 0.007, f + 0.03, 0.002)  # thumb piece
    leaf.box("hardware", hu - 0.026, hu + 0.026, 0.80, 0.84, f, f + 0.007, 0.002)         # lower foot
    leaf.box("hardware", hu - 0.008, hu + 0.008, 1.07, 1.09, f + 0.005, f + 0.05, 0.002)   # grip stand-offs
    leaf.box("hardware", hu - 0.008, hu + 0.008, 0.812, 0.832, f + 0.005, f + 0.05, 0.002)
    leaf.box("hardware", hu - 0.011, hu + 0.011, 0.80, 1.10, f + 0.042, f + 0.06, 0.004)    # the grip


def build_double_door(B, hexc, half_width=0.8, door_z=0.14, empty=None):
    """Builds both leaves at the door centre x = 0. Returns the two hinge nodes."""
    mats = door_materials(hexc)
    left = empty("DOOR", (-half_width, 0, door_z))
    leaf = Leaf(-half_width, door_z, B, mats)
    _build_leaf(leaf)
    made = leaf.finish(left, "DOOR")
    # the strip that covers the meeting gap, carried by the left leaf only
    strip = Leaf(-half_width, door_z, B, mats)
    strip.box("iron", LEAF_W - 0.012, LEAF_W + 0.022, 0.004, LEAF_H - 0.004, LEAF_T / 2, LEAF_T / 2 + 0.008, 0.002)
    strip.finish(left, "DOOR_astragal")

    # the right leaf is the left leaf seen in a mirror: same meshes, flipped across the door's centre line.
    # The flip sits on the parts, not on the hinge node, so the site can turn DOOR_R about its upright axis like any other node.
    from mathutils import Matrix
    right = empty("DOOR_R", (half_width, 0, door_z))
    bpy.context.view_layer.update()
    flip = Matrix.Diagonal((-1, 1, 1, 1))
    for kind, src in made.items():
        o = bpy.data.objects.new(f"DOOR_R_{kind}", src.data)
        bpy.context.scene.collection.objects.link(o)
        o.parent = right
        o.matrix_world = flip @ src.matrix_world
    return left, right, mats
