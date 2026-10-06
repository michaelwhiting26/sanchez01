"""Jesse's own corner of the workshop, taken from the two sewing films on his current site (saved in the project's Dropbox folder under
assets/workshop-reference, 6 Oct 2026): the industrial sewing machine and everything round it on his table, and the wall behind him with its
collection display (where the row of hanging gloves and two big frames were until the owner replaced them, 6 Oct 2026), the Sanchez banner and the tool board. Imported by build_store.py; it does not run on its own.

It is built by eye from those films, so sizes are judged, not measured. Two things in the films are deliberately not copied: the pictures inside
his frames (other people's photographs) and the other makers' names on the gloves. The frames hold plain panels and the gloves carry no marks.
The banner is his own logo (tools/store/textures/sanchez-banner.png, made from the logo file on his site).
"""
import bpy, math, os

HERE = os.path.dirname(os.path.abspath(__file__))


def _blob(k, m, c, s):
    """A rounded form (glove body, thumb): a ball squashed to size."""
    bpy.ops.mesh.primitive_uv_sphere_add(radius=0.5, segments=16, ring_count=10, location=k.B(c))
    o = bpy.context.object
    o.scale = (s[0], s[2], s[1])
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    bpy.ops.object.shade_smooth()
    o.data.materials.append(m)
    k.made.append(o)


def _ring(k, m, c, r, axis="x"):
    """A finger loop on a pair of shears."""
    bpy.ops.mesh.primitive_torus_add(major_radius=r, minor_radius=0.005, major_segments=14, minor_segments=6, location=k.B(c),
                                     rotation=(0, math.pi / 2, 0) if axis == "x" else (0, 0, 0))
    o = bpy.context.object
    bpy.ops.object.transform_apply(location=False, rotation=True, scale=False)
    bpy.ops.object.shade_smooth()
    o.data.materials.append(m)
    k.made.append(o)


def _picture(k, m, x, y0, y1, z0, z1):
    """A flat picture facing into the room from the right-hand wall, with the image the right way round."""
    B = k.B
    me = bpy.data.meshes.new("banner")
    me.from_pydata([B((x, y0, z0)), B((x, y0, z1)), B((x, y1, z1)), B((x, y1, z0))], [], [(0, 1, 2, 3)])
    uv = me.uv_layers.new(name="UVMap").data
    for i, co in enumerate(((0, 0), (1, 0), (1, 1), (0, 1))):
        uv[i].uv = co
    o = bpy.data.objects.new("banner", me)
    bpy.context.scene.collection.objects.link(o)
    o.data.materials.append(m)
    return o


def _thread_normal():
    """A small tiling picture of fine ridges, for thread wound on a reel. Made here so the build needs no outside file."""
    import numpy as np
    name = "wound_thread_normal"
    if name in bpy.data.images:
        return bpy.data.images[name]
    size = 64
    rows = np.arange(size)[:, None] * np.ones((1, size))
    slope = np.cos(rows / size * 2 * np.pi * 16) * 0.9       # sixteen turns of thread up the picture
    nz = 1.0 / np.sqrt(slope * slope + 1.0)
    rgba = np.stack([np.full_like(nz, 0.5), slope * nz * 0.5 + 0.5, nz * 0.5 + 0.5, np.ones_like(nz)], -1).astype(np.float32)
    img = bpy.data.images.new(name, size, size, alpha=False, is_data=True)
    img.pixels.foreach_set(rgba.ravel())
    img.pack()
    return img


def _thread(name, colour):
    """Thread wound on a reel: its colour, with fine ridges running round it. Keeps the reel's own texture layout (see build_store.py)."""
    if name in bpy.data.materials:
        return bpy.data.materials[name]
    m = bpy.data.materials.new(name)
    try:
        m.use_nodes = True
    except Exception:
        pass
    nt = m.node_tree
    b = nt.nodes.get("Principled BSDF")
    b.inputs["Base Color"].default_value = (*colour, 1)
    b.inputs["Roughness"].default_value = 0.62
    where = nt.nodes.new("ShaderNodeUVMap")
    where.uv_map = "UVMap"
    tex = nt.nodes.new("ShaderNodeTexImage")
    tex.image = _thread_normal()
    tex.image.colorspace_settings.name = "Non-Color"
    bump = nt.nodes.new("ShaderNodeNormalMap")
    bump.inputs["Strength"].default_value = 0.8
    nt.links.new(where.outputs["UV"], tex.inputs["Vector"])
    nt.links.new(tex.outputs["Color"], bump.inputs["Color"])
    nt.links.new(bump.outputs["Normal"], b.inputs["Normal"])
    m["keep_uv"] = 1
    return m


def _soft(k, m, x0, x1, y0, y1, z0, z1, radius):
    """A block with well-rounded edges and smooth shading, for cast and turned parts: a plain bevelled box shades in facets."""
    o = k.bx(m, x0, x1, y0, y1, z0, z1)
    md = o.modifiers.new("round", "BEVEL")
    md.width, md.segments, md.limit_method = radius, 5, "ANGLE"
    bpy.ops.object.modifier_apply(modifier=md.name)
    for poly in o.data.polygons:
        poly.use_smooth = True
    wn = o.modifiers.new("normals", "WEIGHTED_NORMAL")
    wn.keep_sharp = False
    bpy.ops.object.modifier_apply(modifier=wn.name)
    return o


def _reel(k, wood, thread, c, r=0.017, h=0.044, lying=None):
    """A wooden cotton reel wound with thread. `c` is the middle of its base when standing; `lying` ("x" or "z") lays it on its side."""
    x, y, z = c
    if lying:
        mid = (x, y + r + 0.004, z)
        k.cyl(thread, mid, r, h - 0.01, axis=lying, verts=20)
        for s in (-1, 1):
            off = (s * (h / 2 - 0.0025), 0, 0) if lying == "x" else (0, 0, s * (h / 2 - 0.0025))
            k.cyl(wood, (mid[0] + off[0], mid[1], mid[2] + off[2]), r + 0.004, 0.005, axis=lying, verts=20)
        return
    k.cyl(wood, (x, y + 0.0025, z), r + 0.004, 0.005, verts=20)
    k.cyl(thread, (x, y + h / 2, z), r, h - 0.01, verts=20)
    k.cyl(wood, (x, y + h - 0.0025, z), r + 0.004, 0.005, verts=20)


def _scanned(folder, place):
    """Bring in one of the public-domain scanned models (tools/store/models) and put it where `place` says. Returns its meshes, which keep
    their own textures and are not merged into the room's other surfaces."""
    before = set(bpy.data.objects)
    bpy.ops.import_scene.gltf(filepath=os.path.join(HERE, "models", folder, folder + ".gltf"))
    fresh = [o for o in bpy.data.objects if o not in before]
    meshes = [o for o in fresh if o.type == "MESH"]
    for o in meshes:
        world = o.matrix_world.copy()
        o.parent = None
        o.matrix_world = place @ world
    for o in fresh:
        if o.type != "MESH":
            bpy.data.objects.remove(o)
    # A scan's roughness picture is often single-channel (greyscale). The room is saved with WebP pictures, which cannot hold those, and the
    # exporter then drops the picture altogether. Rewrite any such picture as an ordinary three-channel one.
    import numpy as np
    for o in meshes:
        for slot in o.material_slots:
            for node in slot.material.node_tree.nodes:
                img = getattr(node, "image", None)
                # Blender reports such a file as three-channel, so the test is its depth on disk: 8 bits a pixel means greyscale.
                if node.type != "TEX_IMAGE" or img is None or img.depth > 8 or img.name.endswith("_rgb"):
                    continue
                w, h = img.size[0], img.size[1]
                ch = len(img.pixels) // (w * h)
                grey = np.empty(w * h * ch, np.float32)
                img.pixels.foreach_get(grey)
                grey = grey.reshape(h, w, ch)[..., :1]
                full = bpy.data.images.new(img.name + "_rgb", w, h, alpha=False, is_data=True)
                full.pixels.foreach_set(np.concatenate([grey, grey, grey, np.ones_like(grey)], -1).ravel())
                full.pack()
                node.image = full
    for o in meshes:
        bpy.ops.object.select_all(action="DESELECT")
        o.select_set(True)
        bpy.context.view_layer.objects.active = o
        bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
    return meshes


def sewing_station(k, mat, hexc, P, timber, centre=(2.9, -3.6), top=0.76):
    """The table Jesse works at, and everything on it (specs/10; rebuilt 6 Oct 2026 at the owner's request to bring the table to life).

    He SITS on the far side of it from the visitor, between the table and his wall, facing back across the room, as in the wide film: the
    machine's working side is towards him and its back towards the visitor, the handwheel on his right. The parts below are laid out for an
    operator on the near side, and the whole station is then turned half a turn about the table's centre.

    What is scanned and what is made:
      - The desk, the jointed work lamp and his stool are public-domain scans from Poly Haven (tools/store/models/README.md). The desk is a
        small one, scaled to sewing-table height (0.76 m) and stretched a fifth along its length to carry a machine.
      - No public-domain model of a sewing machine or of cotton reels exists in the libraries searched, so both are modelled here: a vintage
        black cast-iron machine on a wooden base, and wooden reels wound with thread. They are made shapes, not scans of real objects.
    Returns his seat position and the scanned meshes (kept as separate pieces of the room)."""
    from mathutils import Matrix
    cx, cz = centre
    length, depth = 1.57, 0.72                       # along the room's z, and across it
    x0, x1, z0, z1 = cx - depth / 2, cx + depth / 2, cz - length / 2, cz + length / 2
    first = len(k.made)
    extras = []

    enamel = mat("machine_enamel", hexc("#0b0b0c"), 0.2, 0.6)         # black japanned iron: glossy, so it catches every lamp
    bright = mat("machine_steel", hexc("#b4b6b8"), 0.16, 1.0)         # nickel plate
    gold = mat("machine_gold", hexc("#c9a046"), 0.3, 1.0)             # the gilt lining on the arm and bed
    spool = mat("reel_wood", hexc("#b98f5a"), 0.6)
    olive = _thread("thread_olive", hexc("#3b3f2a"))
    black = _thread("thread_black", hexc("#101010"))
    cream = _thread("thread_cream", hexc("#b9a98a"))
    red = _thread("thread_red", hexc("#7a1512"))
    navy = _thread("thread_navy", hexc("#1a2440"))
    ochre = _thread("thread_ochre", hexc("#a8772a"))
    pale = mat("bobbin_block", hexc("#b98f5a"), 0.7)

    # the desk: a scan, turned so its length runs down the room, scaled to sewing height
    extras += _scanned("small_wooden_table_01", Matrix.Translation(k.B((cx, 0, cz))) @ Matrix.Rotation(math.pi / 2, 4, "Z")
                       @ Matrix.Diagonal((length / 0.916, depth / 0.44, top / 0.533, 1)))

    # the machine: wooden base, bed, pillar at the handwheel end, arched arm, head
    mx, mz0, mz1 = cx + 0.03, cz - 0.26, cz + 0.22
    bed = top + 0.045
    _soft(k, timber, mx - 0.105, mx + 0.105, top, bed, mz0 - 0.025, mz1 + 0.03, 0.007)
    _soft(k, enamel, mx - 0.09, mx + 0.09, bed, bed + 0.03, mz0, mz1, 0.011)
    _soft(k, enamel, mx - 0.046, mx + 0.054, bed + 0.02, bed + 0.245, mz1 - 0.118, mz1 - 0.012, 0.03)                 # pillar
    _soft(k, enamel, mx - 0.04, mx + 0.044, bed + 0.165, bed + 0.25, mz0 + 0.03, mz1 - 0.06, 0.036)                   # arm
    _soft(k, enamel, mx - 0.046, mx + 0.046, bed + 0.07, bed + 0.255, mz0 - 0.004, mz0 + 0.088, 0.03)                 # head
    _soft(k, bright, mx - 0.034, mx + 0.034, bed + 0.085, bed + 0.235, mz0 - 0.011, mz0 - 0.003, 0.004)               # face plate
    k.cyl(bright, (mx - 0.004, bed + 0.05, mz0 + 0.042), 0.0045, 0.075, verts=10)                                      # needle bar
    k.cyl(bright, (mx + 0.018, bed + 0.055, mz0 + 0.042), 0.004, 0.06, verts=10)                                       # presser bar
    k.bx(bright, mx - 0.012, mx + 0.03, bed + 0.03, bed + 0.036, mz0 + 0.022, mz0 + 0.062, 0.002)                       # presser foot
    k.cyl(bright, (mx, bed + 0.031, mz0 + 0.07), 0.05, 0.002, verts=28)                                                # needle plate
    k.cyl(bright, (mx - 0.05, bed + 0.16, mz0 + 0.045), 0.021, 0.012, axis="x", verts=22)                              # tension dial
    k.cyl(bright, (mx - 0.058, bed + 0.16, mz0 + 0.045), 0.008, 0.014, axis="x", verts=12)
    k.cyl(gold, (mx - 0.05, bed + 0.125, mz1 - 0.065), 0.029, 0.006, axis="x", verts=26)                               # stitch regulator plate
    k.cyl(bright, (mx - 0.056, bed + 0.125, mz1 - 0.065), 0.006, 0.014, axis="x", verts=10)
    for dy in (0.185, 0.228):                                                                                          # gilt lines along the arm
        k.bx(gold, mx - 0.0415, mx - 0.0395, bed + dy, bed + dy + 0.003, mz0 + 0.11, mz1 - 0.14)
    k.bx(gold, mx - 0.0915, mx - 0.0895, bed + 0.012, bed + 0.015, mz0 + 0.03, mz1 - 0.03)                              # and along the bed
    k.ring(bright, (mx + 0.004, bed + 0.2, mz1 + 0.03), 0.064, 0.011)                                                  # balance wheel rim
    k.cyl(enamel, (mx + 0.004, bed + 0.2, mz1 + 0.03), 0.056, 0.016, axis="z", verts=30)
    k.cyl(bright, (mx + 0.004, bed + 0.2, mz1 + 0.04), 0.016, 0.022, axis="z", verts=16)
    k.cyl(bright, (mx + 0.03, bed + 0.262, mz1 - 0.02), 0.017, 0.008, axis="z", verts=16)                              # bobbin winder
    k.cyl(bright, (mx, bed + 0.285, mz1 - 0.2), 0.003, 0.075, verts=8)                                                 # spool pin
    _reel(k, spool, black, (mx, bed + 0.25, mz1 - 0.2))
    k.bx(P["leather"], mx - 0.2, mx + 0.16, bed + 0.031, bed + 0.036, mz0 - 0.03, mz0 + 0.13, 0.002)                    # the piece he is sewing

    # thread stand behind the machine, as on his real table: pole, tray with two big cones, guide arm
    sx, sz = x1 - 0.07, mz1 + 0.16
    k.cyl(P["steel"], (sx, top + 0.42, sz), 0.009, 0.84, verts=10)
    k.bx(P["steel"], sx - 0.07, sx + 0.07, top + 0.4, top + 0.408, sz - 0.2, sz + 0.2)
    for dz, m in ((-0.1, olive), (0.1, black)):
        k.cyl(P["steel"], (sx, top + 0.414, sz + dz), 0.075, 0.008, verts=20)
        k.taper(m, (sx, top + 0.418 + 0.09, sz + dz), 0.05, 0.03, 0.18, 16)
    k.bx(P["steel"], sx - 0.28, sx, top + 0.83, top + 0.84, sz - 0.006, sz + 0.006)

    # the work lamp: a scan of a jointed arm lamp, clamped to the desk at the needle end
    extras += _scanned("desk_lamp_arm_01", Matrix.Translation(k.B((x1 - 0.03, top, mz0 - 0.2))) @ Matrix.Rotation(math.radians(200), 4, "Z"))

    # on the desk: bobbin block with red pegs, cotton reels, big cones, a roll of leather, cutting mat, his rule on the near edge
    bx0, bz0 = x0 + 0.05, mz1 + 0.02
    k.bx(pale, bx0, bx0 + 0.05, top, top + 0.035, bz0 - 0.2, bz0, 0.003)
    for i in range(6):
        pz = bz0 - 0.02 - i * 0.032
        k.cyl(red, (bx0 + 0.025, top + 0.06, pz), 0.004, 0.05, verts=6)
        if i % 2 == 0:
            k.cyl(bright, (bx0 + 0.025, top + 0.045, pz), 0.011, 0.012, verts=10)
    rx, rz = x0 + 0.13, mz1 + 0.2
    _reel(k, spool, red, (rx, top, rz))
    _reel(k, spool, cream, (rx + 0.06, top, rz + 0.03))
    _reel(k, spool, navy, (rx + 0.02, top, rz + 0.08))
    _reel(k, spool, ochre, (rx + 0.1, top, rz + 0.1), r=0.02, h=0.05)
    _reel(k, spool, olive, (rx - 0.05, top, rz + 0.12), lying="x")
    _reel(k, spool, black, (rx + 0.16, top, rz - 0.02), lying="z")
    _reel(k, spool, cream, (rx + 0.21, top, rz + 0.09), r=0.014, h=0.036)
    for (tx, tz), m in (((x1 - 0.2, z1 - 0.1), cream), ((x1 - 0.09, z1 - 0.16), red)):
        k.cyl(P["steel"], (tx, top + 0.006, tz), 0.045, 0.012, verts=14)
        k.taper(m, (tx, top + 0.012 + 0.085, tz), 0.05, 0.022, 0.17, 16)
    k.cyl(P["leather"], (cx + 0.05, top + 0.07, z0 + 0.2), 0.07, 0.34, axis="x")
    k.cyl(mat("roll_tan", hexc("#8a6a44"), 0.6), (cx - 0.02, top + 0.05, z0 + 0.32), 0.05, 0.3, axis="x")
    k.bx(mat("cutting_mat", hexc("#1f3a2c"), 0.9), cx - 0.02, x1 - 0.06, top, top + 0.005, mz0 - 0.34, mz0 - 0.08)
    k.bx(bright, x0 + 0.008, x0 + 0.036, top, top + 0.002, cz - 0.45, cz + 0.45)

    # Turn the whole station half a turn about the middle of the table, so it faces the seat.
    c = k.B((cx, 0, cz))
    turn = Matrix.Translation(c) @ Matrix.Rotation(math.pi, 4, "Z") @ Matrix.Translation([-v for v in c])
    for o in k.made[first:] + extras:
        o.matrix_world = turn @ o.matrix_world
        bpy.ops.object.select_all(action="DESELECT")
        o.select_set(True)
        bpy.context.view_layer.objects.active = o
        bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)

    # His seat: a scanned turned-leg wooden stool, scaled to a 0.50 m seat, in line with the needle and 0.42 m back from the desk edge.
    seat_x, seat_z = x1 + 0.42, cz + 0.1
    extras += _scanned("wooden_stool_01", Matrix.Translation(k.B((seat_x, 0, seat_z))) @ Matrix.Scale(0.5 / 0.437, 4))
    return (seat_x, seat_z), extras


def workshop_wall(k, mat, hexc, P, timber, joinery, shade, bulb, wall_x=6.2, ceiling=3.18):
    """The wall behind Jesse (the room's right-hand wall): the collection display, the banner and the tool board.
    Returns the banner and the list of collection tiles, which are kept as separate pieces of the room."""
    gilt = mat("frame_gilt", hexc("#a97938"), 0.4, 0.9)
    board = mat("tool_board", hexc("#8d8271"), 0.9)
    tool = mat("tool_steel", hexc("#3a3c3f"), 0.35, 0.9)
    handle = mat("tool_handle", hexc("#1a1512"), 0.6)
    x = wall_x

    # The collection display (owner, 6 Oct 2026): this section of the wall, where the glove rail and the two frames were, shows what he has
    # made. A framed board with ten tiles, two rows of five, each over a small brass plate for its price. Every tile is its own piece of the
    # room with its own material (COLLECTION_TILE_0 to 9), so the site can lay a photograph on each from the collection list without the
    # room being rebuilt. With nothing in the list they are plain dark mounts: nothing is invented to fill them.
    z0, z1, y0, y1 = -5.0, -2.0, 1.26, 2.56
    k.bx(joinery, x - 0.03, x, y0, y1, z0, z1)
    f = 0.055
    for a, b, c, d in ((z0, z0 + f, y0, y1), (z1 - f, z1, y0, y1), (z0, z1, y1 - f, y1), (z0, z1, y0, y0 + f)):
        k.bx(timber, x - 0.06, x, c, d, a, b, 0.006)
    tile, cols, rows = 0.44, 5, 2
    gap = (z1 - z0 - 2 * f - cols * tile) / (cols + 1)
    tiles = []
    for r in range(rows):
        ty1 = y1 - f - 0.07 - r * 0.6
        for c in range(cols):
            tz0 = z0 + f + gap + c * (tile + gap)
            i = r * cols + c
            for a, b, cc, d in ((tz0 - 0.012, tz0, ty1 - tile, ty1), (tz0 + tile, tz0 + tile + 0.012, ty1 - tile, ty1),
                                (tz0 - 0.012, tz0 + tile + 0.012, ty1, ty1 + 0.012), (tz0 - 0.012, tz0 + tile + 0.012, ty1 - tile - 0.012, ty1 - tile)):
                k.bx(gilt, x - 0.045, x - 0.03, cc, d, a, b)
            k.bx(gilt, x - 0.036, x - 0.03, ty1 - tile - 0.075, ty1 - tile - 0.04, tz0 + 0.08, tz0 + tile - 0.08, 0.002)   # price plate (blank)
            face = _picture(k, mat(f"collection_tile_{i}", hexc("#17130f"), 0.85), x - 0.032, ty1 - tile, ty1, tz0, tz0 + tile)
            face.name = f"COLLECTION_TILE_{i}"
            tiles.append(face)
    k.pendant(shade, bulb, P["steel"], x - 0.9, 2.3, -3.5, ceiling, 0.18)

    # the tool board: shears, a mallet, an awl and a rule, hung on pegs
    k.bx(board, x - 0.02, x, 1.25, 2.15, -6.0, -5.2)
    for i, z in enumerate((-5.85, -5.68, -5.52)):
        ty = 1.95 - i * 0.03
        k.bx(tool, x - 0.03, x - 0.022, ty - 0.34, ty - 0.08, z - 0.014, z + 0.004)
        k.bx(tool, x - 0.036, x - 0.028, ty - 0.33, ty - 0.08, z - 0.002, z + 0.016)
        _ring(k, handle, (x - 0.03, ty - 0.03, z - 0.022), 0.026)
        _ring(k, handle, (x - 0.03, ty - 0.04, z + 0.026), 0.03)
    k.cyl(handle, (x - 0.035, 1.72, -5.36), 0.012, 0.26, verts=10)
    k.cyl(P["wood"], (x - 0.035, 1.87, -5.36), 0.035, 0.09, axis="z", verts=14)       # mallet head
    k.bx(tool, x - 0.026, x - 0.022, 1.3, 1.34, -5.95, -5.3)                          # steel rule along the bottom
    k.cyl(handle, (x - 0.03, 1.5, -5.28), 0.01, 0.1, verts=8)
    k.cyl(tool, (x - 0.03, 1.4, -5.28), 0.003, 0.1, verts=6)                          # awl

    # the Sanchez banner, nearer the door
    img = bpy.data.images.load(os.path.join(HERE, "textures", "sanchez-banner.png"), check_existing=True)
    img.pack()
    bm = bpy.data.materials.new("sanchez_banner")
    try:
        bm.use_nodes = True
    except Exception:
        pass
    b = bm.node_tree.nodes.get("Principled BSDF")
    b.inputs["Roughness"].default_value = 0.85
    where = bm.node_tree.nodes.new("ShaderNodeUVMap")   # the banner's own layout, by name (it also carries one for baked light)
    where.uv_map = "UVMap"
    tex = bm.node_tree.nodes.new("ShaderNodeTexImage")
    tex.image = img
    bm.node_tree.links.new(where.outputs["UV"], tex.inputs["Vector"])
    bm.node_tree.links.new(tex.outputs["Color"], b.inputs["Base Color"])
    k.bx(joinery, x - 0.03, x, 1.3, 2.16, -1.82, -0.42, 0.004)
    return _picture(k, bm, x - 0.032, 1.33, 2.13, -1.79, -0.45), tiles
