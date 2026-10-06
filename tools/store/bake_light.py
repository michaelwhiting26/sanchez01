"""Baked light for the store's fixed geometry (specs/09, 6 Oct 2026). Blender's ray tracer works out the room's light once, shadows and bounce
included, and this saves the result as one picture laid over every fixed surface. The site only has to read the picture.
Imported by build_store.py; it does not run on its own. No manual Blender steps.

What is baked is LIGHT ONLY (Cycles "diffuse" bake with the surface colour left out), so the room's own textures still show through on the site.
The numbers that must agree with the site were measured, not assumed (one white plane, one light a metre above it, 6 Oct 2026, Blender 5.2):
  - A Blender point or spot light of P watts at distance d bakes to a lighting-only value of P / (4 pi^2 d^2). The value is what the surface's
    colour gets multiplied by. Measured: P = 4 pi^2 at 1 m gives 0.9998.
  - three.js shows a light of I candela at distance d as colour * I / (pi d^2). For the bake to equal the site's live lights, watts = 4 pi * I.
    Light sources below are given in the site's candela figures and converted with exactly that.
  - three.js divides baked light by pi when it shades, so the site applies the picture at pi times `scale` to get the measured value back.
  - The picture is stored sRGB-encoded in 8 bits (more steps in the dark end, where most of this room lives) after dividing by `scale`: the
    smallest power of two that covers nine tenths of the lit surface. The brightest tenth, surfaces within arm's reach of a lamp, stops at the top
    of the range instead of stretching it and costing the rest of the room its fine steps. The site loads it as sRGB and multiplies `scale` back.

A room whose geometry or lights have changed must be baked again: `fingerprint` covers both, and a build without --bake stops if it has moved.
"""
import bpy, bmesh, hashlib, json, math, os, time
import numpy as np

UV_NAME = "lightmap"
WATTS_PER_CANDELA = 4 * math.pi   # measured: see the note at the top of this file


def strip_hidden(objs, lo, hi, eps=0.002):
    """Remove faces that can never be seen or lit from inside: those lying outside the room's inner box (the outer skins of the floor, ceiling
    and walls), and those sitting exactly on the box's boundary but facing out of it (the street side of the front wall).
    `lo` and `hi` are opposite corners of that box in Blender's axes, in either order. Saves download size and a third of the light picture."""
    lo, hi = [min(a, b) for a, b in zip(lo, hi)], [max(a, b) for a, b in zip(lo, hi)]
    removed = 0
    for o in objs:
        bm = bmesh.new()
        bm.from_mesh(o.data)
        mw = o.matrix_world
        rot = mw.to_3x3()
        dead = []
        for f in bm.faces:
            c = mw @ f.calc_center_median()
            n = rot @ f.normal
            outside = any(c[i] < lo[i] - eps or c[i] > hi[i] + eps for i in range(3))
            facing_out = any((abs(c[i] - lo[i]) <= eps and n[i] < -0.5) or (abs(c[i] - hi[i]) <= eps and n[i] > 0.5) for i in range(3))
            if outside or facing_out:
                dead.append(f)
        removed += len(dead)
        if dead:
            bmesh.ops.delete(bm, geom=dead, context="FACES")
            bm.to_mesh(o.data)
        bm.free()
    return removed


def unwrap(objs, margin=0.0035):
    """Give every object a second layout, shared across all of them with no overlaps: the light picture's own coordinates.
    The first layout (the tiling one the textures use) is left exactly as it is and stays the one materials read."""
    for o in objs:
        me = o.data
        layer = me.uv_layers.get(UV_NAME) or me.uv_layers.new(name=UV_NAME)
        me.uv_layers.active = layer                       # the layout the unwrapping tools below write to
    bpy.ops.object.select_all(action="DESELECT")
    for o in objs:
        o.select_set(True)
    bpy.context.view_layer.objects.active = objs[0]
    bpy.ops.object.mode_set(mode="EDIT")
    bpy.ops.mesh.select_all(action="SELECT")
    bpy.ops.uv.smart_project(angle_limit=math.radians(66), island_margin=0.0, area_weight=0.0, correct_aspect=True, scale_to_bounds=False)
    bpy.ops.uv.select_all(action="SELECT")
    bpy.ops.uv.average_islands_scale()                    # the same number of texels per metre everywhere
    bpy.ops.uv.pack_islands(rotate=True, margin=margin)
    bpy.ops.object.mode_set(mode="OBJECT")


def _canonical(o):
    """Every face corner of an object in one fixed order, with a description of each that does not depend on Blender's own numbering.
    Blender builds the same room with its face corners listed in a different order from run to run (measured, on anything with a rounded
    shape in it), so nothing here may rely on corner numbers. A corner is described by where it is: the points of its face, which way the
    face looks, and its own point. Returns the corner numbers in that fixed order, and the descriptions as bytes for fingerprinting."""
    me = o.data
    n = len(me.vertices)
    co = np.empty(n * 3, np.float32)
    me.vertices.foreach_get("co", co)
    pts = [tuple(float(v) + 0.0 for v in row) for row in np.round(co.reshape(n, 3), 4)]   # + 0.0 turns minus zero into zero
    keys = []
    for poly in me.polygons:
        face = tuple(sorted(pts[v] for v in poly.vertices))
        looks = tuple(round(float(c), 1) + 0.0 for c in poly.normal)
        for li, v in zip(poly.loop_indices, poly.vertices):
            keys.append((face, looks, pts[v], li))
    keys.sort(key=lambda k: k[:3])
    order = np.fromiter((k[3] for k in keys), np.int64, len(keys))
    described = repr([k[:3] for k in keys]).encode()
    return order, described


def fingerprint(objs, lights, settings):
    """A short code for everything the baked light depends on: where every face of every fixed surface is, the lights and the bake settings.
    The light layout is not part of it: Blender packs that differently on every run, so it is made once and stored (see below)."""
    h = hashlib.sha256()
    for o in sorted(objs, key=lambda o: o.name):
        h.update(o.name.encode())
        h.update(_canonical(o)[1])
    h.update(json.dumps([lights, settings], sort_keys=True, default=str).encode())
    return h.hexdigest()[:20]


STEPS = 65535  # the layout is kept in 16 bits a coordinate: a thirty-second of a texel at 2048, far finer than the picture can show


def store_layout(objs, path):
    """Round the freshly made light layout to 16 bits, write it back so the bake uses exactly what is stored, and save it corner by corner
    in the fixed order. Blender's packing is not repeatable, so this file IS the layout: every later build loads it instead of making another."""
    saved = {}
    for o in objs:
        data = o.data.uv_layers[UV_NAME].data
        uv = np.empty(len(o.data.loops) * 2, np.float32)
        data.foreach_get("uv", uv)
        q = np.round(np.clip(uv, 0, 1) * STEPS).astype(np.uint16)
        data.foreach_set("uv", (q.astype(np.float32) / STEPS))
        saved[o.name] = q.reshape(-1, 2)[_canonical(o)[0]]
    os.makedirs(os.path.dirname(path), exist_ok=True)
    np.savez_compressed(path, **saved)


def load_layout(objs, path):
    """Give every corner of every object the place on the light picture it was baked with, whatever number Blender has given it this time."""
    saved = np.load(path)
    for o in objs:
        me = o.data
        if o.name not in saved or len(saved[o.name]) != len(me.loops):
            raise SystemExit(f"\nSTORED LIGHT LAYOUT does not fit {o.name}: the room has changed since the light was baked.\nRun the build again with --bake.\n")
        uv = np.empty((len(me.loops), 2), np.float32)
        uv[_canonical(o)[0]] = saved[o.name].astype(np.float32) / STEPS
        layer = me.uv_layers.get(UV_NAME) or me.uv_layers.new(name=UV_NAME)
        layer.data.foreach_set("uv", uv.ravel())


def _add_lights(lights, B, hexc):
    """Real light sources where the room's fixtures are. Each entry: kind, web-space position, candela, colour, and for strips their length.
    A strip is laid out as three points along its length sharing its candela: point lights are the kind whose strength has been measured."""
    made = []

    def add(kind, pos, cd, colour):
        if kind == "down":
            data = bpy.data.lights.new("bake_down", "SPOT")
            data.spot_size, data.spot_blend = math.radians(70), 0.6   # points straight down by default, which is what a downlight wants
            data.shadow_soft_size = 0.03
        else:
            data = bpy.data.lights.new("bake_point", "POINT")
            data.shadow_soft_size = 0.045               # a bulb, not a pinpoint: shadows soften with distance
        data.energy = cd * WATTS_PER_CANDELA
        data.color = hexc(colour)
        o = bpy.data.objects.new(data.name, data)
        o.location = B(pos)
        bpy.context.scene.collection.objects.link(o)
        made.append(o)

    for spec in lights:
        kind, pos, cd, colour = spec[0], spec[1], spec[2], spec[3]
        if kind == "strip":
            for f in (-1 / 3, 0, 1 / 3):
                add("point", (pos[0] + f * spec[4], pos[1], pos[2]), cd / 3, colour)
        else:
            add(kind, pos, cd, colour)
    return made


def _use_gpu():
    try:
        prefs = bpy.context.preferences.addons["cycles"].preferences
        prefs.compute_device_type = "METAL"
        prefs.get_devices()
        for d in prefs.devices:
            d.use = True
        bpy.context.scene.cycles.device = "GPU"
        return True
    except Exception:
        return False


def _bake(objs, size, samples):
    sc = bpy.context.scene
    sc.render.engine = "CYCLES"
    gpu = _use_gpu()
    sc.cycles.samples = samples
    sc.cycles.use_denoising = True
    sc.cycles.max_bounces, sc.cycles.diffuse_bounces = 6, 4
    sc.cycles.sample_clamp_indirect = 3.0                 # caps the rare over-bright bounce sample that shows up as a white speck
    # No sky: the room is lit only by its own fixtures. A new world comes with a dim grey sky switched on, and setting its plain colour does
    # not turn that off; the strength of its background has to be set to nothing.
    world = bpy.data.worlds.new("bake_night")
    try:
        world.use_nodes = True
    except Exception:
        pass
    for node in world.node_tree.nodes:
        if node.type == "BACKGROUND":
            node.inputs["Color"].default_value = (0, 0, 0, 1)
            node.inputs["Strength"].default_value = 0.0
    sc.world = world
    img = bpy.data.images.new("bake_target", size, size, alpha=False, float_buffer=True, is_data=True)
    nodes = []
    for o in objs:
        for slot in o.material_slots:
            nt = slot.material.node_tree
            n = nt.nodes.new("ShaderNodeTexImage")
            n.image = img
            nt.nodes.active = n                           # the bake writes to each material's active picture
            nodes.append((nt, n))
    # Blender bakes into the layout marked "for render", not the selected one. Point that at the light layout for the bake and put it back
    # afterwards, so the exported file still lists the texture layout first. (Textures name their own layout, so they are unaffected.)
    before = []
    for o in objs:
        layers = o.data.uv_layers
        before.append((layers, next(i for i, l in enumerate(layers) if l.active_render)))
        layers[UV_NAME].active_render = True
    bpy.ops.object.select_all(action="DESELECT")
    for o in objs:
        o.select_set(True)
    bpy.context.view_layer.objects.active = objs[0]
    t0 = time.time()
    bpy.ops.object.bake(type="DIFFUSE", pass_filter={"DIRECT", "INDIRECT"}, margin=8, margin_type="EXTEND", use_clear=True)
    seconds = time.time() - t0
    for layers, i in before:
        layers[i].active_render = True
    px = np.empty(size * size * 4, np.float32)
    img.pixels.foreach_get(px)
    for nt, n in nodes:
        nt.nodes.remove(n)
    bpy.data.images.remove(img)
    return px.reshape(size, size, 4)[..., :3], seconds, gpu


def _clean(rgb):
    """Take the grain out of the bake. Blender's denoiser is not applied to bakes, so stray specks are removed here: each texel becomes the
    middle value of itself and its eight neighbours, then is blended a little with their average. Empty texels (no surface) are left out of
    both, so nothing dark bleeds in from the gaps between pieces."""
    used = rgb.max(-1) > 0
    out = np.empty_like(rgb)
    shifts = [(dy, dx) for dy in (-1, 0, 1) for dx in (-1, 0, 1)]
    mask = np.stack([np.roll(used, s, (0, 1)) for s in shifts])
    weight = mask.sum(0).clip(1)
    for c in range(3):
        stack = np.stack([np.roll(rgb[..., c], s, (0, 1)) for s in shifts])
        stack = np.where(mask, stack, np.nan)
        middle = np.nan_to_num(np.nanmedian(stack, 0))
        mean = np.nan_to_num(np.nansum(stack, 0) / weight)
        out[..., c] = np.where(used, 0.6 * middle + 0.4 * mean, rgb[..., c])
    return out


def _save(rgb, path):
    """Store the light picture: divided by a power-of-two scale, sRGB-encoded, dithered by under one step so smooth walls do not band."""
    level = rgb.max(-1)
    lit = level[level > 1e-4]
    peak = float(np.percentile(lit, 90)) if lit.size else 1.0   # nine tenths of the lit surface sits under this
    scale = float(min(16.0, 2.0 ** max(0, math.ceil(math.log2(max(peak, 1e-6))))))
    v = np.clip(rgb / scale, 0, 1)
    srgb = np.where(v <= 0.0031308, v * 12.92, 1.055 * np.power(v, 1 / 2.4) - 0.055)
    rng = np.random.default_rng(5)
    srgb = np.clip(srgb + (rng.random(srgb.shape) - 0.5) / 255.0, 0, 1)
    size = rgb.shape[0]
    out = bpy.data.images.new("bake_out", size, size, alpha=False, is_data=True)
    out.pixels.foreach_set(np.concatenate([srgb, np.ones((size, size, 1))], -1).astype(np.float32).ravel())
    out.file_format = "WEBP"
    out.filepath_raw = path
    out.save(quality=93)
    bpy.data.images.remove(out)
    return scale, peak


def run(objs, lights, out_dir, name, B, hexc, layout_dir, size=2048, samples=192, bake=False):
    """Fingerprint the room, then either bake it or confirm the existing bake still fits. Returns what the site needs: the scale to multiply
    back, and the fingerprint. Without `bake`, an up-to-date picture and its stored layout must already exist, otherwise the build stops:
    a changed room never ships with old light."""
    settings = dict(size=size, samples=samples, version=5)
    code = fingerprint(objs, lights, settings)
    meta_path = os.path.join(out_dir, f"{name}.json")
    image_path = os.path.join(out_dir, f"{name}.webp")
    layout_path = os.path.join(layout_dir, f"{name}.layout.npz")
    old = json.load(open(meta_path)) if os.path.exists(meta_path) else None
    if not bake:
        if not old or old.get("fingerprint") != code or not os.path.exists(image_path) or not os.path.exists(layout_path):
            raise SystemExit(f"\nSTALE BAKED LIGHT for {name}: the room or its lights have changed since the light was baked "
                             f"(have {old and old.get('fingerprint')}, need {code}).\nRun the build again with --bake.\n")
        load_layout(objs, layout_path)
        print("LIGHT up to date", name, code)
        return old
    unwrap(objs)
    store_layout(objs, layout_path)
    made = _add_lights(lights, B, hexc)
    rgb, seconds, gpu = _bake(objs, size, samples)
    for o in made:
        bpy.data.objects.remove(o)
    rgb = _clean(rgb)
    scale, peak = _save(rgb, image_path)
    lit = float((rgb.max(-1) > 1e-4).mean())
    meta = dict(fingerprint=code, scale=scale, size=size, samples=samples, seconds=round(seconds, 1), gpu=gpu, peak=round(peak, 3),
                covered=round(lit, 3), bytes=os.path.getsize(image_path))
    json.dump(meta, open(meta_path, "w"), indent=1)
    print("BAKED", name, json.dumps(meta))
    return meta
