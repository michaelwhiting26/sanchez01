"""Builds the 3D store's grey-box world for the mobile store (docs/STORE-3D.md): the shop front, the workshop shell with fixtures, the camera anchors
and the stand-in product forms. Run headless:

    /Applications/Blender.app/Contents/MacOS/Blender -b -P tools/store/build_store.py -- --out apps/web/public/assets/store

All coordinates below are written in the web scene's space (three.js: x right, y up, z towards the viewer; the door is at z = 0, the street is z > 0,
the workshop is z < 0) and converted to Blender's on the way in, so they match the numbers in src/lib/storefront/config.ts.
Camera composition is owned here: move a CAM_* / LOOK_* empty, re-run, and the site follows with no code change.

GREY-BOX: plain materials, no baked lighting yet, and the room is not modelled on Jesse's real workshop (no footage of it yet).
"""
import bpy, sys, os, math

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import iron_door  # the wrought-iron front door (owner's reference photo, 6 Oct 2026)
import shop_front  # the timber shop front, brick, setts and lanterns (owner's storyboard, 6 Oct 2026)
import jesse_workshop  # his sewing table and the wall behind it, from the films on his current site (6 Oct 2026)
import bake_light  # the room's light and shadow, ray-traced once and saved as a picture (specs/09, 6 Oct 2026)

argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
OUT = argv[argv.index("--out") + 1] if "--out" in argv else "."
BAKE = "--bake" in argv  # ray-trace the room's light again (needed whenever the room or its lights change; a build without it stops if they have)
BAKE_SIZE = int(argv[argv.index("--bake-size") + 1]) if "--bake-size" in argv else 2048
BAKE_SAMPLES = int(argv[argv.index("--bake-samples") + 1]) if "--bake-samples" in argv else 256
PREVIEW = argv[argv.index("--preview") + 1] if "--preview" in argv else None  # straight-on picture of one door leaf, for checking against the photo
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


def export(path, webp=False):
    bpy.ops.object.select_all(action="SELECT")
    extra = dict(export_image_format="WEBP", export_image_quality=88) if webp else {}  # textures travel as WebP; a file with none is unaffected
    bpy.ops.export_scene.gltf(filepath=path, export_format="GLB", export_apply=True, export_yup=True, export_extras=True, use_selection=False, **extra)
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


# ---------------------------------------------------------------- check picture
def preview_leaf(path):
    """A straight-on, evenly lit picture of the left leaf against a pale backing, to lay beside the reference photo. Not part of the site."""
    bpy.ops.mesh.primitive_plane_add(size=6, location=B((-0.4, 1.1, -0.4)), rotation=(math.pi / 2, 0, 0))
    bpy.context.object.data.materials.append(mat("preview_backing", (0.9, 0.86, 0.78), 1.0, 0.0, 1.6))
    for o in bpy.data.objects:
        if "glass" in o.name:
            o.hide_render = True
    cam = bpy.data.objects.new("PREVIEW_CAM", bpy.data.cameras.new("PREVIEW_CAM"))
    bpy.context.scene.collection.objects.link(cam)
    cam.data.type, cam.data.ortho_scale = "ORTHO", 2.34
    cam.location, cam.rotation_euler = B((-0.4, 1.11, 3.0)), (math.pi / 2, 0, 0)
    for loc, energy in (((-1.8, 2.6, 2.5), 3.0), ((1.2, 0.8, 2.5), 1.2)):
        light = bpy.data.objects.new("PREVIEW_SUN", bpy.data.lights.new("PREVIEW_SUN", "SUN"))
        bpy.context.scene.collection.objects.link(light)
        light.data.energy = energy
        light.location = B(loc)
        light.rotation_euler = (math.radians(62), 0, math.radians(-28 if loc[0] < 0 else 24))
    sc = bpy.context.scene
    sc.camera = cam
    for engine in ("BLENDER_EEVEE", "BLENDER_EEVEE_NEXT"):
        try:
            sc.render.engine = engine
            break
        except Exception:
            pass
    sc.render.resolution_x, sc.render.resolution_y, sc.render.filepath = 800, 2240, path
    bpy.ops.render.render(write_still=True)
    print("PREVIEW", path)


# ---------------------------------------------------------------- exterior
def build_exterior():
    reset()
    MATS.clear()
    P = palette()
    # Each leaf is its own node (DOOR, DOOR_R), hinged on its outer edge, so the site can swing the pair open.
    _, _, iron = iron_door.build_double_door(B, hexc, half_width=0.8, door_z=0.14, empty=empty)
    for nm, c, s, bevel in (
        ("EXT_doorframe_left", (-0.83, 1.155, 0.14), (0.06, 2.31, 0.26), 0.003),
        ("EXT_doorframe_right", (0.83, 1.155, 0.14), (0.06, 2.31, 0.26), 0.003),
        ("EXT_doorframe_top", (0, 2.2675, 0.14), (1.6, 0.085, 0.26), 0.003),
        ("EXT_doorframe_sill", (0, 0.008, 0.14), (1.6, 0.016, 0.26), 0.002),
        # the stepped face casing that stands a little proud of the wall
        ("EXT_doorcasing_left", (-0.87, 1.1775, 0.3), (0.11, 2.355, 0.03), 0.004),
        ("EXT_doorcasing_right", (0.87, 1.1775, 0.3), (0.11, 2.355, 0.03), 0.004),
        ("EXT_doorcasing_top", (0, 2.30, 0.3), (1.63, 0.11, 0.03), 0.004),
    ):
        o = box(nm, c, s, iron["iron"])
        bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
        md = o.modifiers.new("edge", "BEVEL")
        md.width, md.segments, md.limit_method = bevel, 2, "ANGLE"
    shop_front.build(B, mat, hexc, iron["iron"])
    # Where the visitor stands on arrival: back across the street, a touch off-centre, eyes on the door and the sign above it.
    empty("CAM_ARRIVAL", (0.45, 1.62, 7.65))
    empty("LOOK_ARRIVAL", (0, 1.95, 0))
    export(os.path.join(OUT, "exterior.glb"), webp=True)
    if PREVIEW:
        preview_leaf(PREVIEW)


# ---------------------------------------------------------------- workshop
PRODUCTS = [  # id, x along the back wall, hangs (camera sits further back and looks higher)
    ("GLOVES", -4.4, False), ("BAG", -2.2, True), ("THAI_PADS", 0.0, False), ("MITTS", 2.2, False), ("GUARDS", 4.4, False)]


def build_workshop():
    """The room, dressed as a working leather shop (owner's storyboard, 6 Oct 2026). Still invented: there is no footage of Jesse's real workshop yet."""
    reset()
    MATS.clear()
    P = palette()
    sf = shop_front
    k = sf.Kit(B, mat, hexc)
    W, D, H = 12.4, 7.2, 3.4  # room: x -6.2..6.2, z -7.2..0
    floor = sf._textured("floor_boards", *sf.plank_maps("floor", (0.27, 0.165, 0.1), boards=6, seed=31), rough=0.58)
    timber = sf._textured("aged_timber", *sf.plank_maps("timber", (0.2, 0.125, 0.078), boards=3, seed=47, gap=0), rough=0.52)
    panel = sf._textured("wall_panelling", *sf.plank_maps("panel", (0.085, 0.062, 0.046), boards=8, seed=59, joints=False), rough=0.5)
    plaster = sf._textured("plaster", *sf.plaster_maps(), rough=0.92)
    # From the owner's reference pictures (6 Oct 2026): woven timber behind the products, polished green marble lining each display alcove,
    # and woven leather on the bench. The ideas are borrowed; no other maker's name or mark is.
    woven = sf._textured("woven_timber", *sf.weave_maps("woven", (0.17, 0.1, 0.06), cells=8), rough=0.55, normal_strength=1.0)
    marble = sf._textured("green_marble", *sf.marble_maps(), rough=0.36)
    woven_leather = sf._textured("woven_leather", *sf.weave_maps("leatherweave", (0.045, 0.085, 0.06), cells=8, seed=91), rough=0.42)
    niche_light = mat("niche_light", hexc("#ffcf94"), 0.5, 0.0, 3.5)
    wrap_cream = mat("wrap_cream", hexc("#a99a7c"), 0.9)
    wrap_olive = mat("wrap_olive", hexc("#5a5c43"), 0.9)
    rope = mat("rope_leather", hexc("#4a2f1c"), 0.6)
    joinery = mat("dark_joinery", hexc("#15110d"), 0.5)
    shade = mat("lamp_shade", hexc("#0b0a09"), 0.38, 0.6)
    bulb = mat("lamp_bulb", hexc("#ffb866"), 0.5, 0.0, 4.5)
    kraft = mat("kraft_box", hexc("#6f5435"), 0.92)
    cream = mat("thread_cream", hexc("#b9a98a"), 0.85)
    oxblood = mat("thread_oxblood", hexc("#4a1512"), 0.85)

    # shell
    k.bx(floor, -W / 2, W / 2, -0.1, 0, -D, 0)
    k.bx(panel, -W / 2, W / 2, H, H + 0.1, -D, 0)                                   # boarded ceiling
    k.bx(plaster, -W / 2, W / 2, 0, H, -D - 0.2, -D)
    k.bx(plaster, -W / 2 - 0.2, -W / 2, 0, H, -D, 0)
    k.bx(plaster, W / 2, W / 2 + 0.2, 0, H, -D, 0)
    k.wall(plaster, -W / 2, W / 2, 0, H, -0.12, 0, (sf.DOOR, *sf.WINDOWS))            # the street wall: door and a window each side
    for i, z in enumerate((-1.2, -2.7, -4.2, -5.7)):
        k.bx(timber, -W / 2, W / 2, H - 0.22, H, z - 0.11, z + 0.11, 0.006)          # beams
    # panelling to dado height on the three solid walls, with a rail on top
    for x0, x1, z0, z1 in ((-W / 2, W / 2, -D, -D + 0.025), (-W / 2, -W / 2 + 0.025, -D, 0), (W / 2 - 0.025, W / 2, -D, 0)):
        k.bx(panel, x0, x1, 0, 1.12, z0, z1)
    k.bx(joinery, -W / 2, W / 2, 1.12, 1.17, -D, -D + 0.05, 0.006)
    k.bx(joinery, -W / 2, -W / 2 + 0.05, 1.12, 1.17, -D, 0, 0.006)
    k.bx(joinery, W / 2 - 0.05, W / 2, 1.12, 1.17, -D, 0, 0.006)
    k.bx(P["rug"], -1.5, 1.1, 0, 0.012, -4.4, -0.8, 0.004)
    # the product wall: woven timber above the dado, a brass line let into the floor in front of it, brass downlights overhead
    k.bx(woven, -W / 2, W / 2, 1.17, H, -D, -D + 0.02)
    k.bx(P["brass"], -5.6, 5.2, 0, 0.003, -5.72, -5.7)
    for x in (-5.6, 5.2):
        k.bx(P["brass"], x - 0.01, x + 0.01, 0, 0.003, -D + 0.6, -5.7)
    for x in (-4.5, -1.5, 1.5, 4.5):
        for z in (-1.95, -4.95):
            k.cyl(P["brass"], (x, H - 0.07, z), 0.045, 0.14, verts=16)
            k.lights.append(("down", (x, H - 0.16, z), 5.0, "#ffcf94"))
            k.cyl(niche_light, (x, H - 0.142, z), 0.034, 0.004, verts=16)
    # a long bench in the middle of the room: woven green leather on a steel frame
    k.bx(woven_leather, -0.5, 0.06, 0.36, 0.47, -3.3, -1.75, 0.02)
    k.bx(P["steel"], -0.47, 0.03, 0.33, 0.36, -3.27, -1.78)
    for lx in (-0.45, 0.01):
        for lz in (-3.24, -1.81):
            k.bx(P["steel"], lx - 0.015, lx + 0.015, 0, 0.33, lz - 0.015, lz + 0.015)
    # between the stations, boxing's own tools hung on brass T-hooks: a skipping rope, hand wraps, a speed bag, another rope
    for gx, what in ((-3.3, "rope"), (-1.1, "wraps"), (1.1, "speedbag"), (3.3, "rope")):
        k.t_hook(P["brass"], gx, 2.1, -D + 0.02)
        hz = -D + 0.09
        if what == "rope":
            k.ring(rope, (gx, 1.9, hz), 0.17)
            k.ring(rope, (gx + 0.015, 1.88, hz + 0.012), 0.15)
            for dx in (-0.05, 0.06):
                k.cyl(P["wood"], (gx + dx, 1.6, hz), 0.014, 0.16, verts=10)
        elif what == "wraps":
            for dx, m in ((-0.035, wrap_cream), (0.035, wrap_olive)):
                k.bx(m, gx + dx - 0.022, gx + dx + 0.022, 1.45, 2.1, hz - 0.003, hz + 0.003)
                k.bx(m, gx + dx - 0.022, gx + dx + 0.022, 1.52, 2.1, hz + 0.008, hz + 0.014)
        else:
            k.bx(P["leather2"], gx - 0.012, gx + 0.012, 1.93, 2.1, hz - 0.004, hz + 0.004)
            k.blob(P["leather2"], (gx, 1.72, hz + 0.02), (0.24, 0.34, 0.24))
            k.taper(P["leather2"], (gx, 1.9, hz + 0.02), 0.07, 0.02, 0.12, 14)

    # the five product stations along the back wall
    for pid, x, hangs in PRODUCTS:
        if hangs:
            # the bag hangs from a beam bracket on a chain, in front of a full-height marble slab framed in timber
            k.bx(marble, x - 0.62, x + 0.62, 1.17, 2.9, -D + 0.02, -D + 0.05)
            for a_, b_, c_, d_ in ((x - 0.7, x - 0.62, 1.17, 2.98), (x + 0.62, x + 0.7, 1.17, 2.98), (x - 0.7, x + 0.7, 2.9, 2.98)):
                k.bx(timber, a_, b_, c_, d_, -D + 0.02, -D + 0.1, 0.006)
            k.bx(timber, x - 0.09, x + 0.09, H - 0.34, H - 0.22, -6.9, -5.9, 0.006)
            k.cyl(P["steel"], (x, (2.69 + H - 0.34) / 2, -6.3), 0.012, H - 0.34 - 2.69, verts=8)
            k.pendant(shade, bulb, P["steel"], x, 2.86, -6.25, H, 0.13, cd=4.0)
        else:
            # a thick timber counter on a panelled cabinet, under a marble-lined alcove with a concealed light along its head
            k.bx(joinery, x - 0.6, x + 0.6, 0, 0.955, -D + 0.02, -6.46, 0.006)
            for a_, b_ in ((x - 0.52, x - 0.04), (x + 0.04, x + 0.52)):
                k.bx(joinery, a_, b_, 0.14, 0.86, -6.46, -6.445, 0.012)                # raised door panels
            k.bx(timber, x - 0.68, x + 0.68, 0.955, 1.045, -D + 0.0, -6.4, 0.01)
            k.bx(P["brass"], x - 0.2, x + 0.2, 0.975, 1.025, -6.4, -6.392, 0.003)       # name plate on the counter edge (blank)
            k.bx(marble, x - 0.62, x + 0.62, 1.045, 2.5, -D + 0.02, -D + 0.05)          # back of the alcove
            for sx in (-1, 1):
                k.bx(marble, x + sx * 0.62, x + sx * 0.66, 1.045, 2.5, -D + 0.02, -6.78)  # cheeks
                k.bx(timber, x + sx * 0.66, x + sx * 0.74, 1.045, 2.66, -D + 0.02, -6.72, 0.006)
            k.bx(joinery, x - 0.66, x + 0.66, 2.5, 2.58, -D + 0.02, -6.76)              # soffit
            k.bx(timber, x - 0.74, x + 0.74, 2.58, 2.66, -D + 0.02, -6.72, 0.006)       # head
            k.bx(niche_light, x - 0.58, x + 0.58, 2.488, 2.5, -6.86, -6.8)              # the light, tucked behind the head
            k.lights.append(("strip", (x, 2.48, -6.83), 3.5, "#ffcf94", 1.16))
            if pid in ("GLOVES", "THAI_PADS"):
                # a stone bowl of rolled hand wraps at the end of the counter
                k.blob(marble, (x + 0.47, 1.075, -6.62), (0.2, 0.09, 0.2))
                for dx, dz, m in ((-0.03, 0.0, wrap_cream), (0.035, 0.02, wrap_olive)):
                    k.cyl(m, (x + 0.47 + dx, 1.135, -6.62 + dz), 0.034, 0.05, axis="z", verts=14)
        # Where the product model is attached, and where the camera stands and looks for it. Composed for a phone held upright with a 48 degree lens:
        # the product fills a little over half the width, sits above centre, and the name and button have the bottom fifth to themselves.
        empty(f"PRODUCT_{pid}", (x, 2.69 if hangs else 1.05, -6.3 if hangs else -6.72))
        empty(f"CAM_PRODUCT_{pid}", (x - 0.1, 1.6 if hangs else 1.38, -3.15 if hangs else -4.72))
        empty(f"LOOK_PRODUCT_{pid}", (x, 1.35 if hangs else 1.1, -6.3 if hangs else -6.72))
        empty(f"CAM_FOCUS_{pid}", (x - 0.05, 1.62 if hangs else 1.34, -3.6 if hangs else -5.02))

    # Jesse's sewing table (where he is working when the visitor walks in) and the wall behind him, both taken from his real workshop
    seat_x, seat_z = jesse_workshop.sewing_station(k, mat, hexc, P, timber)
    banner, wall_tiles = jesse_workshop.workshop_wall(k, mat, hexc, P, timber, joinery, shade, bulb, wall_x=W / 2, ceiling=H - 0.22)
    k.pendant(shade, bulb, P["steel"], 2.9, 2.5, -3.6, H - 0.22, cd=10.0)   # high enough to stay out of the shot of him at the machine
    # a second table on the left: hides laid out, thread, a box of offcuts
    k.bx(timber, -4.1, -3.2, 0.87, 0.94, -3.5, -1.7, 0.008)
    for lx, lz in ((-4.02, -3.42), (-3.28, -3.42), (-4.02, -1.78), (-3.28, -1.78)):
        k.bx(joinery, lx - 0.04, lx + 0.04, 0, 0.87, lz - 0.04, lz + 0.04)
    k.bx(P["leather"], -4.0, -3.35, 0.94, 0.948, -2.6, -1.85, 0.003)
    k.bx(P["leather2"], -3.9, -3.3, 0.948, 0.955, -3.35, -2.75, 0.003)
    for i, (tx, tz, m) in enumerate(((-3.38, -2.5, cream), (-3.45, -2.32, oxblood), (-3.32, -2.2, P["leather2"]), (-3.5, -2.62, P["brass"]))):
        k.taper(m, (tx, 0.94 + 0.065, tz), 0.035, 0.014, 0.13, 12)
    k.bx(kraft, -4.05, -3.75, 0.94, 1.1, -3.4, -3.05, 0.004)
    k.pendant(shade, bulb, P["steel"], -3.65, 2.05, -2.6, H - 0.22)
    for sx, sz in ((2.0, -3.0), (-2.95, -2.3)):
        k.cyl(P["leather2"], (sx, 0.62, sz), 0.17, 0.05)
        k.cyl(P["steel"], (sx, 0.3, sz), 0.03, 0.6, verts=10)
        k.cyl(P["steel"], (sx, 0.02, sz), 0.16, 0.03)
    # shelving on the left wall: leather rolls and packed orders
    for y in (0.5, 1.1, 1.7, 2.3):
        k.bx(timber, -6.15, -5.65, y - 0.02, y + 0.02, -3.9, -1.3, 0.004)
    for z in (-1.4, -2.6, -3.8):
        k.bx(P["steel"], -6.15, -5.65, 0, 2.4, z - 0.02, z + 0.02)
    for y, z, m in ((0.61, -1.9, "leather"), (0.61, -2.25, "leather2"), (1.21, -3.0, "leather"), (1.81, -2.0, "leather2"), (1.81, -3.3, "leather"), (2.41, -2.2, "leather2")):
        k.cyl(P[m], (-5.9, y + 0.07, z), 0.09, 0.44, axis="x")
    for y, z0, z1, h in ((0.52, -3.6, -3.15, 0.3), (1.12, -2.2, -1.75, 0.26), (1.12, -1.7, -1.42, 0.2), (1.72, -2.9, -2.45, 0.3), (2.32, -3.7, -3.3, 0.22), (2.32, -3.25, -2.9, 0.3), (0.52, -3.05, -2.75, 0.2)):
        k.bx(kraft, -6.1, -5.72, y, y + h, z0, z1, 0.004)
    # a heavy bag hanging in the far right corner, part of the room rather than part of the range
    k.cyl(P["leather2"], (5.6, 1.75, -6.35), 0.18, 1.3, verts=20)
    k.cyl(P["steel"], (5.6, 2.9, -6.35), 0.01, 1.0, verts=6)
    # general light: one large pendant in the middle of the room (the bench and the table have their own)
    k.pendant(shade, bulb, P["steel"], 0.0, 2.5, -3.0, H - 0.22, 0.24, cd=13.0)

    joined = sf.join_by_material(k.made, "WS")
    textured = {"floor_boards": (0.84, 0.84), "aged_timber": (0.6, 0.6), "wall_panelling": (0.96, 0.96), "plaster": (2.4, 2.4),
                "woven_timber": (0.56, 0.56), "green_marble": (1.9, 1.9), "woven_leather": (0.32, 0.32)}
    for name, tiles in textured.items():
        sf._uv_from_world(joined[name], *tiles)
    banner.name = "WS_banner"
    for name, o in joined.items():
        if name not in textured:
            while o.data.uv_layers:
                o.data.uv_layers.remove(o.data.uv_layers[0])
    # Baked light: everything in this file is fixed, so everything except the glowing parts themselves gets it.
    glowing = ("lamp_bulb", "niche_light", "task_lamp_glow")
    fixed = [o for name, o in joined.items() if name not in glowing] + [banner] + wall_tiles
    bake_light.strip_hidden(fixed, B((-W / 2, 0, 0)), B((W / 2, H, -D)))  # opposite corners: Blender's depth axis runs the other way to web z
    light = bake_light.run(fixed, k.lights, OUT, "workshop-light", B, hexc, os.path.join(os.path.dirname(os.path.abspath(__file__)), "baked"),
                           size=BAKE_SIZE, samples=BAKE_SAMPLES, bake=BAKE)
    mark = empty("LIGHTMAP", (0, 0, 0))   # read by the site: how much to multiply the light picture by, and which bake it belongs to
    mark["scale"], mark["fingerprint"] = float(light["scale"]), light["fingerprint"]
    # Path and character marks (read by the site at run time).
    # Jesse sits at his machine for the whole visit (specs/10). JESSE_SEAT is where he sits; JESSE_HANDS is the needle plate, which also tells
    # the site which way he faces. The three standing marks below are only used if a build has no seat.
    empty("JESSE_SEAT", (seat_x, 0, seat_z))
    empty("JESSE_HANDS", (2.9, 0.79, seat_z))
    empty("JESSE_BENCH", (2.25, 0, -3.5))   # at the bench, working
    empty("JESSE_GREET", (1.35, 0, -3.3))   # one step towards the visitor
    empty("JESSE_ASIDE", (1.7, 0, -5.2))    # stepped aside, by the product wall
    # The film's shot: low, at about table height, across the machine at him, with the gloves and frames above his head.
    empty("CAM_GREETING", (1.0, 1.22, -3.95))
    empty("LOOK_GREETING", (3.3, 1.12, -3.55))
    export(os.path.join(OUT, "workshop.glb"), webp=True)


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
