"""Builds the 3D store's grey-box world for the mobile store (docs/STORE-3D.md): the shop front, the workshop shell with fixtures, the camera anchors
and the stand-in product forms. Run headless:

    /Applications/Blender.app/Contents/MacOS/Blender -b -P tools/store/build_store.py -- --out apps/web/public/assets/store

All coordinates below are written in the web scene's space (three.js: x right, y up, z towards the viewer; the door is at z = 0, the street is z > 0,
the workshop is z < 0) and converted to Blender's on the way in, so they match the numbers in src/lib/storefront/config.ts.
Camera composition is owned here: move a CAM_* / LOOK_* empty, re-run, and the site follows with no code change.

GREY-BOX: plain materials, no baked lighting yet, and the room is not modelled on Jesse's real workshop (no footage of it yet).
"""
import bpy, sys, os, math

argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
OUT = argv[argv.index("--out") + 1] if "--out" in argv else "."
os.makedirs(OUT, exist_ok=True)


def B(p):  # web (x, y, z) -> Blender (x, -z, y)
    return (p[0], -p[2], p[1])


def reset():
    bpy.ops.wm.read_factory_settings(use_empty=True)


MATS = {}


def mat(name, color, rough=0.8, metal=0.0, emit=0.0, alpha=1.0):
    if name in MATS:
        return MATS[name]
    m = bpy.data.materials.new(name)
    try:
        m.use_nodes = True
    except Exception:
        pass
    b = m.node_tree.nodes.get("Principled BSDF")
    b.inputs["Base Color"].default_value = (*color, 1)
    b.inputs["Roughness"].default_value = rough
    b.inputs["Metallic"].default_value = metal
    if emit:
        b.inputs["Emission Color"].default_value = (*color, 1)
        b.inputs["Emission Strength"].default_value = emit
    if alpha < 1:
        b.inputs["Alpha"].default_value = alpha
        for attr, val in (("blend_method", "BLEND"), ("surface_render_method", "BLENDED")):
            try:
                setattr(m, attr, val)
            except Exception:
                pass
    MATS[name] = m
    return m


def hexc(h):
    h = h.lstrip("#")
    return tuple(pow(int(h[i:i + 2], 16) / 255, 2.2) for i in (0, 2, 4))


def box(name, c, s, m):
    bpy.ops.mesh.primitive_cube_add(size=1, location=B(c))
    o = bpy.context.object
    o.name = name
    o.scale = (s[0], s[2], s[1])
    o.data.materials.append(m)
    return o


def cyl(name, c, r, h, m, axis="y", verts=20):
    bpy.ops.mesh.primitive_cylinder_add(radius=r, depth=h, vertices=verts, location=B(c))
    o = bpy.context.object
    o.name = name
    if axis == "x":
        o.rotation_euler = (0, math.pi / 2, 0)
    elif axis == "z":
        o.rotation_euler = (math.pi / 2, 0, 0)
    o.data.materials.append(m)
    bpy.ops.object.shade_smooth()
    return o


def ball(name, c, s, m):
    bpy.ops.mesh.primitive_uv_sphere_add(radius=0.5, segments=24, ring_count=14, location=B(c))
    o = bpy.context.object
    o.name = name
    o.scale = (s[0], s[2], s[1])
    o.data.materials.append(m)
    bpy.ops.object.shade_smooth()
    return o


def empty(name, p):
    o = bpy.data.objects.new(name, None)
    o.location = B(p)
    o.empty_display_size = 0.1
    bpy.context.scene.collection.objects.link(o)
    return o


def text(name, body, c, size, m, extrude=0.02):
    bpy.ops.object.text_add(location=B(c))
    o = bpy.context.object
    o.name = name
    o.data.body = body
    o.data.size = size
    o.data.align_x = "CENTER"
    o.data.extrude = extrude
    o.rotation_euler = (math.pi / 2, 0, 0)  # stand it up, facing the street (+z in web space)
    bpy.ops.object.convert(target="MESH")
    o = bpy.context.object
    o.data.materials.append(m)
    return o


def export(path):
    bpy.ops.object.select_all(action="SELECT")
    bpy.ops.export_scene.gltf(filepath=path, export_format="GLB", export_apply=True, export_yup=True, export_extras=True, use_selection=False)
    print("WROTE", path, os.path.getsize(path))


# ---------------------------------------------------------------- palette
def palette():
    return dict(
        wall=mat("wall", hexc("#1d1a17"), 0.9),
        facade=mat("facade", hexc("#16130f"), 0.85),
        floor=mat("floor", hexc("#3a2a1e"), 0.65),
        pave=mat("pavement", hexc("#24231f"), 0.95),
        board=mat("board", hexc("#2a241d"), 0.9),
        wood=mat("bench_wood", hexc("#5a4130"), 0.6),
        steel=mat("steel", hexc("#2c2e31"), 0.45, 0.9),
        brass=mat("brass", hexc("#b08d57"), 0.35, 1.0),
        glow=mat("lamp_glow", hexc("#ffd9a0"), 0.5, 0.0, 6.0),
        sign=mat("sign_glow", hexc("#e8c98c"), 0.4, 0.0, 2.2),
        glass=mat("glass", hexc("#9fb2b8"), 0.08, 0.0, 0.0, 0.22),
        leather=mat("leather_roll", hexc("#6b3f24"), 0.55),
        leather2=mat("leather_roll_dark", hexc("#2a1712"), 0.5),
        cloth=mat("standin_cloth", hexc("#4a443c"), 0.95),
        rug=mat("rug", hexc("#3b1512"), 0.98),
    )


# ---------------------------------------------------------------- exterior
def build_exterior():
    reset()
    MATS.clear()
    P = palette()
    box("EXT_pavement", (0, -0.05, 4.0), (16, 0.1, 8.5), P["pave"])
    box("EXT_facade_left", (-3.325, 2.1, 0.125), (5.35, 4.2, 0.25), P["facade"])
    box("EXT_facade_right", (3.325, 2.1, 0.125), (5.35, 4.2, 0.25), P["facade"])
    box("EXT_facade_lintel", (0, 3.225, 0.125), (1.3, 1.95, 0.25), P["facade"])
    box("EXT_doorframe_left", (-0.68, 1.125, 0.14), (0.06, 2.25, 0.3), P["brass"])
    box("EXT_doorframe_right", (0.68, 1.125, 0.14), (0.06, 2.25, 0.3), P["brass"])
    box("EXT_doorframe_top", (0, 2.28, 0.14), (1.42, 0.06, 0.3), P["brass"])
    box("EXT_step", (0, 0.02, 0.5), (1.9, 0.04, 0.7), P["steel"])
    # The door leaf is its own node, hinged on its left edge, so the site can swing it open.
    hinge = empty("DOOR", (-0.65, 0, 0.14))
    for nm, c, s, m in (
        ("DOOR_stile_l", (0.04, 1.11, 0), (0.08, 2.2, 0.05), P["steel"]),
        ("DOOR_stile_r", (1.26, 1.11, 0), (0.08, 2.2, 0.05), P["steel"]),
        ("DOOR_rail_top", (0.65, 2.17, 0), (1.3, 0.08, 0.05), P["steel"]),
        ("DOOR_rail_mid", (0.65, 1.0, 0), (1.3, 0.06, 0.05), P["steel"]),
        ("DOOR_rail_bot", (0.65, 0.09, 0), (1.3, 0.16, 0.05), P["steel"]),
        ("DOOR_glass", (0.65, 1.11, 0), (1.18, 2.0, 0.012), P["glass"]),
        ("DOOR_handle", (1.16, 1.05, 0.05), (0.03, 0.32, 0.04), P["brass"]),
    ):
        o = box(nm, (c[0] - 0.65, c[1], c[2] + 0.14), s, m)
        o.parent = hinge
        o.matrix_parent_inverse = hinge.matrix_world.inverted()
    text("EXT_sign_sanchez", "SANCHEZ", (0, 2.98, 0.27), 0.36, P["sign"])
    text("EXT_sign_custom", "CUSTOM BOXING", (0, 2.72, 0.27), 0.125, P["sign"])
    box("EXT_lamp_bar", (0, 3.48, 0.42), (1.9, 0.04, 0.08), P["glow"])
    # Shop window on the left: a glazed opening with warm light behind it.
    box("EXT_window_glow", (-3.0, 1.55, 0.26), (2.4, 1.7, 0.02), mat("window_glow", hexc("#c98f4a"), 0.6, 0.0, 1.1))
    for nm, c, s in (("EXT_window_frame_t", (-3.0, 2.43, 0.28), (2.52, 0.06, 0.06)), ("EXT_window_frame_b", (-3.0, 0.67, 0.28), (2.52, 0.06, 0.06)),
                     ("EXT_window_frame_l", (-4.23, 1.55, 0.28), (0.06, 1.82, 0.06)), ("EXT_window_frame_r", (-1.77, 1.55, 0.28), (0.06, 1.82, 0.06)),
                     ("EXT_window_frame_m", (-3.0, 1.55, 0.28), (0.04, 1.76, 0.05))):
        box(nm, c, s, P["brass"])
    empty("CAM_ARRIVAL", (0.15, 1.68, 4.2))
    empty("LOOK_ARRIVAL", (0, 1.55, 0))
    export(os.path.join(OUT, "exterior.glb"))


# ---------------------------------------------------------------- workshop
PRODUCTS = [  # id, x along the back wall, hangs (camera sits further back and looks higher)
    ("GLOVES", -4.4, False), ("BAG", -2.2, True), ("THAI_PADS", 0.0, False), ("MITTS", 2.2, False), ("GUARDS", 4.4, False)]


def build_workshop():
    reset()
    MATS.clear()
    P = palette()
    W, D, H = 12.4, 7.2, 3.4  # room: x -6.2..6.2, z -7.2..0
    box("WS_floor", (0, -0.05, -D / 2), (W, 0.1, D), P["floor"])
    box("WS_ceiling", (0, H + 0.05, -D / 2), (W, 0.1, D), P["wall"])
    box("WS_wall_back", (0, H / 2, -D - 0.1), (W, H, 0.2), P["wall"])
    box("WS_wall_left", (-W / 2 - 0.1, H / 2, -D / 2), (0.2, H, D), P["wall"])
    box("WS_wall_right", (W / 2 + 0.1, H / 2, -D / 2), (0.2, H, D), P["wall"])
    box("WS_wall_front_l", (-3.44, H / 2, -0.06), (5.52, H, 0.12), P["wall"])
    box("WS_wall_front_r", (3.44, H / 2, -0.06), (5.52, H, 0.12), P["wall"])
    box("WS_wall_front_top", (0, 2.83, -0.06), (1.36, 1.14, 0.12), P["wall"])
    for i, z in enumerate((-1.6, -3.6, -5.6)):
        box(f"WS_beam_{i}", (0, H - 0.12, z), (W, 0.2, 0.22), P["wood"])
    box("WS_rug", (-0.2, 0.006, -2.6), (2.6, 0.012, 3.6), P["rug"])
    box("WS_rail", (0, 2.72, -6.55), (11.4, 0.05, 0.05), P["brass"])
    for pid, x, hangs in PRODUCTS:
        box(f"BAY_{pid}_board", (x, 1.55, -7.06), (1.7, 2.3, 0.06), P["board"])
        box(f"BAY_{pid}_plate", (x, 0.52, -7.0), (0.5, 0.09, 0.02), P["brass"])
        box(f"BAY_{pid}_lamp", (x, 2.98, -6.3), (0.5, 0.04, 0.12), P["glow"])
        if not hangs:
            box(f"BAY_{pid}_shelf", (x, 1.02, -6.78), (1.1, 0.05, 0.5), P["wood"])
            for sx in (-0.5, 0.5):
                box(f"BAY_{pid}_bracket_{'l' if sx < 0 else 'r'}", (x + sx, 0.9, -6.9), (0.04, 0.24, 0.26), P["steel"])
        # Where the product model is attached, and where the camera stands and looks for it.
        empty(f"PRODUCT_{pid}", (x, 2.69 if hangs else 1.05, -6.3 if hangs else -6.78))
        # The phone's lower third carries the product name and button, so the camera looks below the product: it then sits in the upper part of the screen.
        empty(f"CAM_PRODUCT_{pid}", (x - 0.1, 1.55 if hangs else 1.35, -3.4 if hangs else -5.5))
        empty(f"LOOK_PRODUCT_{pid}", (x, 1.35 if hangs else 0.98, -6.3 if hangs else -6.78))
        empty(f"CAM_FOCUS_{pid}", (x - 0.05, 1.6 if hangs else 1.28, -4.3 if hangs else -5.98))
    # Workbench on the right, where Jesse is working when the visitor walks in.
    box("WS_bench_top", (2.9, 0.92, -3.6), (0.85, 0.07, 2.0), P["wood"])
    for i, (lx, lz) in enumerate(((2.55, -2.7), (3.25, -2.7), (2.55, -4.5), (3.25, -4.5))):
        box(f"WS_bench_leg_{i}", (lx, 0.44, lz), (0.07, 0.88, 0.07), P["steel"])
    box("WS_bench_shelf", (2.9, 0.3, -3.6), (0.75, 0.04, 1.86), P["steel"])
    cyl("WS_roll_a", (2.95, 1.03, -3.1), 0.075, 0.7, P["leather"], axis="z")
    cyl("WS_roll_b", (2.85, 1.02, -3.95), 0.065, 0.62, P["leather2"], axis="z")
    box("WS_cutting_mat", (2.85, 0.962, -3.55), (0.6, 0.008, 0.45), mat("cutting_mat", hexc("#1f3a2c"), 0.9))
    cyl("WS_stool_seat", (2.0, 0.62, -3.0), 0.17, 0.05, P["leather2"])
    cyl("WS_stool_leg", (2.0, 0.3, -3.0), 0.03, 0.6, P["steel"])
    # Shelving on the left wall with leather rolls and boxes.
    for i, y in enumerate((0.5, 1.1, 1.7, 2.3)):
        box(f"WS_shelf_{i}", (-5.9, y, -2.6), (0.5, 0.04, 2.6), P["wood"])
    for i, z in enumerate((-1.4, -3.8)):
        box(f"WS_shelf_post_{i}", (-5.9, 1.2, z), (0.5, 2.4, 0.05), P["steel"])
    for i, (y, z, m) in enumerate(((0.61, -1.9, "leather"), (0.61, -2.3, "leather2"), (1.21, -2.9, "leather"), (1.81, -2.0, "leather2"), (1.81, -3.2, "leather"), (2.41, -2.6, "leather2"))):
        cyl(f"WS_shelf_roll_{i}", (-5.9, y + 0.07, z), 0.09, 0.44, P[m], axis="x")
    for i, x in enumerate((-3.2, 0.0, 3.2)):
        cyl(f"WS_pendant_cord_{i}", (x, 3.05, -3.0), 0.008, 0.7, P["steel"], verts=8)
        ball(f"WS_pendant_{i}", (x, 2.66, -3.0), (0.22, 0.16, 0.22), P["glow"])
    # Path and character marks (read by the site at run time).
    empty("JESSE_BENCH", (2.25, 0, -3.5))   # at the bench, working
    empty("JESSE_GREET", (1.35, 0, -3.3))   # one step towards the visitor
    empty("JESSE_ASIDE", (1.7, 0, -5.2))    # stepped aside, by the product wall
    empty("CAM_GREETING", (-0.2, 1.66, -1.8))
    empty("LOOK_GREETING", (1.3, 1.5, -3.3))
    export(os.path.join(OUT, "workshop.glb"))


# ---------------------------------------------------------------- stand-in product forms
def build_standins():
    """Cloth-covered forms for products that have no real model yet. They are deliberately anonymous: not a claim about what the product looks like."""
    shapes = {
        "gloves": [((-0.11, 0.17, 0), (0.19, 0.34, 0.17)), ((0.11, 0.17, 0), (0.19, 0.34, 0.17))],
        "thai-pads": [((-0.13, 0.21, 0), (0.22, 0.42, 0.12)), ((0.13, 0.21, 0), (0.22, 0.42, 0.12))],
        "guards": [((-0.16, 0.14, 0), (0.25, 0.28, 0.26)), ((0.17, 0.2, 0), (0.14, 0.4, 0.13))],
    }
    for pid, parts in shapes.items():
        reset()
        MATS.clear()
        P = palette()
        for i, (c, s) in enumerate(parts):
            ball(f"STANDIN_{pid}_{i}", c, s, P["cloth"])
        export(os.path.join(OUT, f"standin-{pid}.glb"))


build_exterior()
build_workshop()
build_standins()
