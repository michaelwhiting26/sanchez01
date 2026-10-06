"""Jesse's own corner of the workshop, taken from the two sewing films on his current site (saved in the project's Dropbox folder under
assets/workshop-reference, 6 Oct 2026): the industrial sewing machine and everything round it on his table, and the wall behind him with its
row of hanging gloves, two big frames, the Sanchez banner and the tool board. Imported by build_store.py; it does not run on its own.

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
    uv = me.uv_layers.new().data
    for i, co in enumerate(((0, 0), (1, 0), (1, 1), (0, 1))):
        uv[i].uv = co
    o = bpy.data.objects.new("banner", me)
    bpy.context.scene.collection.objects.link(o)
    o.data.materials.append(m)
    return o


def sewing_station(k, mat, hexc, P, timber, x0=2.475, x1=3.325, z0=-4.6, z1=-2.6, top=0.955):
    """The table Jesse works at. He stands on the low-x side facing the machine; the handwheel is to his right (towards the door)."""
    enamel = mat("machine_enamel", hexc("#141516"), 0.34, 0.55)       # the machine's dark body
    bright = mat("machine_steel", hexc("#9a9c9e"), 0.3, 1.0)          # face plate, needle bar, handwheel rim
    olive = mat("thread_olive", hexc("#3b3f2a"), 0.85)
    black = mat("thread_black", hexc("#101010"), 0.85)
    cream = mat("thread_cream", hexc("#b9a98a"), 0.85)
    red = mat("thread_red", hexc("#7a1512"), 0.85)
    clamp = mat("clamp_orange", hexc("#c8561a"), 0.6)
    pale = mat("bobbin_block", hexc("#b98f5a"), 0.7)
    lamp = mat("task_lamp_glow", hexc("#fff0d0"), 0.5, 0.0, 5.0)

    # table: top, legs, undershelf, and the steel rule let into the front edge
    k.bx(timber, x0, x1, top - 0.07, top, z0, z1, 0.008)
    for lx, lz in ((x0 + 0.075, z1 - 0.1), (x1 - 0.075, z1 - 0.1), (x0 + 0.075, z0 + 0.1), (x1 - 0.075, z0 + 0.1)):
        k.bx(P["steel"], lx - 0.035, lx + 0.035, 0, top - 0.07, lz - 0.035, lz + 0.035)
    k.bx(P["steel"], x0 + 0.05, x1 - 0.05, 0.28, 0.32, z0 + 0.07, z1 - 0.07)
    k.bx(bright, x0 + 0.004, x0 + 0.034, top, top + 0.002, -4.25, -3.05)

    # the machine: bed, pillar at the handwheel end, arm, head with needle bar and foot
    mx, mz0, mz1 = 2.95, -3.86, -3.36
    k.bx(enamel, mx - 0.09, mx + 0.09, top, top + 0.02, mz0, mz1, 0.004)
    k.bx(enamel, mx - 0.07, mx + 0.07, top + 0.02, top + 0.31, mz1 - 0.13, mz1, 0.012)
    k.bx(enamel, mx - 0.06, mx + 0.06, top + 0.2, top + 0.31, mz0, mz1 - 0.1, 0.016)
    k.bx(enamel, mx - 0.065, mx + 0.065, top + 0.085, top + 0.32, mz0 - 0.005, mz0 + 0.115, 0.012)
    k.bx(bright, mx - 0.055, mx + 0.055, top + 0.1, top + 0.3, mz0 - 0.009, mz0 - 0.004, 0.003)                # face plate
    k.cyl(bright, (mx - 0.02, top + 0.06, mz0 + 0.05), 0.005, 0.09, verts=8)                                    # needle bar
    k.bx(bright, mx - 0.035, mx - 0.005, top + 0.02, top + 0.03, mz0 + 0.02, mz0 + 0.08)                        # presser foot
    k.bx(bright, mx - 0.06, mx + 0.02, top + 0.02, top + 0.022, mz0 + 0.0, mz0 + 0.12)                          # needle plate
    k.cyl(enamel, (mx, top + 0.25, mz1 + 0.025), 0.085, 0.04, axis="z", verts=28)                               # handwheel
    k.cyl(bright, (mx, top + 0.25, mz1 + 0.05), 0.05, 0.012, axis="z", verts=20)
    for i in range(2):                                                                                          # tension discs, facing him
        k.cyl(bright, (mx - 0.068, top + 0.24 - i * 0.07, mz0 + 0.19), 0.018, 0.014, axis="x", verts=14)
    k.cyl(bright, (mx, top + 0.335, mz1 - 0.2), 0.012, 0.05, verts=10)                                          # bobbin winder
    k.bx(enamel, mx - 0.1, mx + 0.1, 0.6, 0.78, -3.72, -3.44, 0.01)                                             # motor under the table
    k.bx(P["leather2"], mx - 0.008, mx + 0.008, 0.7, top + 0.2, mz1 + 0.02, mz1 + 0.03)                          # drive belt
    k.bx(P["steel"], 2.56, 2.86, 0.03, 0.05, -3.8, -3.45, 0.004)                                                # treadle

    # thread stand: pole, tray with two big cones on discs, guide arm above
    sx, sz = 3.2, -3.22
    k.cyl(P["steel"], (sx, top + 0.42, sz), 0.009, 0.84, verts=10)
    k.bx(P["steel"], sx - 0.07, sx + 0.07, top + 0.4, top + 0.408, sz - 0.2, sz + 0.2)
    for dz, m in ((-0.1, olive), (0.1, black)):
        k.cyl(P["steel"], (sx, top + 0.414, sz + dz), 0.075, 0.008, verts=20)
        k.taper(m, (sx, top + 0.418 + 0.09, sz + dz), 0.05, 0.03, 0.18, 16)
    k.bx(P["steel"], sx - 0.28, sx, top + 0.83, top + 0.84, sz - 0.006, sz + 0.006)
    # jointed work lamp with orange clamps, aimed at the needle
    lx, lz = 3.22, -3.9
    k.cyl(P["steel"], (lx, top + 0.17, lz), 0.008, 0.34, verts=8)
    k.bx(P["steel"], mx - 0.02, lx, top + 0.335, top + 0.347, lz - 0.006, lz + 0.006)
    k.bx(clamp, lx - 0.03, lx + 0.03, top + 0.0, top + 0.07, lz - 0.02, lz + 0.02, 0.004)
    k.bx(clamp, lx - 0.025, lx + 0.025, top + 0.3, top + 0.36, lz - 0.018, lz + 0.018, 0.004)
    k.bx(enamel, mx - 0.07, mx - 0.01, top + 0.31, top + 0.35, lz - 0.03, lz + 0.03, 0.004)
    k.bx(lamp, mx - 0.065, mx - 0.015, top + 0.305, top + 0.31, lz - 0.025, lz + 0.025)
    # on the table: bobbin block with red pegs, loose cones of thread, rolls of material, cutting mat
    bx0, bz0 = 2.56, -3.2
    k.bx(pale, bx0, bx0 + 0.05, top, top + 0.035, bz0 - 0.2, bz0, 0.003)
    for i in range(6):
        pz = bz0 - 0.02 - i * 0.032
        k.cyl(red, (bx0 + 0.025, top + 0.06, pz), 0.004, 0.05, verts=6)
        if i % 2 == 0:
            k.cyl(bright, (bx0 + 0.025, top + 0.045, pz), 0.011, 0.012, verts=10)
    for (tx, tz), m in (((2.6, -2.86), cream), ((2.72, -2.78), cream), ((2.63, -2.72), olive), ((2.76, -2.9), red)):
        k.cyl(P["steel"], (tx, top + 0.006, tz), 0.045, 0.012, verts=14)
        k.taper(m, (tx, top + 0.012 + 0.085, tz), 0.05, 0.022, 0.17, 16)
    k.cyl(P["leather"], (2.95, top + 0.075, -4.3), 0.075, 0.5, axis="z")
    k.cyl(P["leather2"], (2.82, top + 0.06, -4.28), 0.06, 0.46, axis="z")
    k.cyl(mat("roll_tan", hexc("#8a6a44"), 0.6), (3.1, top + 0.055, -4.32), 0.055, 0.42, axis="z")
    k.bx(mat("cutting_mat", hexc("#1f3a2c"), 0.9), 2.84, 3.26, top, top + 0.006, -3.05, -2.68)


def workshop_wall(k, mat, hexc, P, timber, joinery, shade, bulb, wall_x=6.2, ceiling=3.18):
    """The wall behind Jesse (the room's right-hand wall): gloves on a rail, two frames, the banner, the tool board."""
    red = mat("glove_red", hexc("#8a1714"), 0.45)
    gold = mat("glove_gold", hexc("#9a7a3a"), 0.4, 0.2)
    dark = mat("glove_black", hexc("#131211"), 0.45)
    lace = mat("glove_lace", hexc("#b9a98a"), 0.9)
    mount = mat("frame_mount", hexc("#0f0d0b"), 0.9)
    print_a = mat("frame_panel_sepia", hexc("#4a3a28"), 0.85)
    print_b = mat("frame_panel_cream", hexc("#6a5d48"), 0.85)
    print_c = mat("frame_panel_red", hexc("#5a1a16"), 0.85)
    gilt = mat("frame_gilt", hexc("#a97938"), 0.4, 0.9)
    board = mat("tool_board", hexc("#8d8271"), 0.9)
    tool = mat("tool_steel", hexc("#3a3c3f"), 0.35, 0.9)
    handle = mat("tool_handle", hexc("#1a1512"), 0.6)
    x = wall_x

    # rail and gloves: hung cuff-up in a row, the way they hang over his machine
    k.bx(timber, x - 0.2, x, 2.5, 2.54, -5.0, -2.0, 0.006)
    for z in (-4.9, -3.5, -2.1):
        k.bx(P["steel"], x - 0.18, x, 2.36, 2.5, z - 0.012, z + 0.012)
    colours = (dark, red, red, red, gold, gold, gold, dark, red)
    for i, m in enumerate(colours):
        z = -4.78 + i * 0.32
        gx = x - 0.14
        lean = 0.02 * ((i * 7) % 3 - 1)
        k.cyl(lace, (gx, 2.43, z), 0.004, 0.14, verts=6)
        k.cyl(m, (gx, 2.31, z + lean), 0.055, 0.11, verts=14)                       # cuff
        _blob(k, m, (gx, 2.14, z + lean), (0.15, 0.27, 0.13))                        # the fist
        _blob(k, m, (gx - 0.035, 2.17, z + lean + 0.065), (0.07, 0.15, 0.07))        # thumb

    # two frames, as on his wall: a big black one and a gilt one. Plain panels inside (his hold other people's photographs).
    def frame(m, z0, z1, y0, y1, cols, rows, tones):
        k.bx(mount, x - 0.02, x, y0, y1, z0, z1)
        f = 0.045
        for a, b, c, d in ((z0, z0 + f, y0, y1), (z1 - f, z1, y0, y1), (z0, z1, y1 - f, y1), (z0, z1, y0, y0 + f)):
            k.bx(m, x - 0.04, x, c, d, a, b, 0.006)
        pw, ph = (z1 - z0 - 2 * f - 0.06) / cols, (y1 - y0 - 2 * f - 0.06) / rows
        for r in range(rows):
            for c in range(cols):
                pz, py = z0 + f + 0.03 + c * pw, y0 + f + 0.03 + r * ph
                k.bx(tones[(r * cols + c) % len(tones)], x - 0.024, x - 0.02, py + 0.015, py + ph - 0.015, pz + 0.015, pz + pw - 0.015)

    frame(joinery, -4.7, -3.55, 1.28, 2.02, 3, 2, (print_a, print_b, print_a, print_a, print_a, print_b))
    frame(gilt, -3.25, -2.25, 1.3, 2.0, 3, 2, (print_c, print_b, print_b, print_a, print_b, print_a))
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
    tex = bm.node_tree.nodes.new("ShaderNodeTexImage")
    tex.image = img
    bm.node_tree.links.new(tex.outputs["Color"], b.inputs["Base Color"])
    k.bx(joinery, x - 0.03, x, 1.3, 2.16, -1.82, -0.42, 0.004)
    return _picture(k, bm, x - 0.032, 1.33, 2.13, -1.79, -0.45)
