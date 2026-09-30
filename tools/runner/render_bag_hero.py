"""
Render the heavy bag as a lit, coloured hero image with a transparent background (for the footer, like the portrait on the MR-2 footer).

  Blender -b -P render_bag_hero.py -- --out <file.png> [--w 1000] [--h 1500]

Source: apps/web/public/assets/bag3d/bag_4ft.glb with its own materials. Three-point lighting on black, slight three-quarter turn.
"""
import bpy, sys, os, math
from mathutils import Vector

argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
def opt(n, d): return argv[argv.index(n) + 1] if n in argv else d
OUT = opt("--out", "/tmp/bag_hero.png"); W = int(opt("--w", "1000")); H = int(opt("--h", "1500"))
root = os.path.dirname(os.path.abspath(__file__))
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=os.path.join(root, "..", "..", "apps", "web", "public", "assets", "bag3d", "bag_4ft.glb"))
scene = bpy.context.scene
meshes = [o for o in bpy.data.objects if o.type == "MESH"]

def mat(name, rgb, rough, metal=0.0, coat=0.0, image=None):
    m = bpy.data.materials.new(name); m.use_nodes = True
    b = m.node_tree.nodes["Principled BSDF"]
    b.inputs["Base Color"].default_value = (*rgb, 1); b.inputs["Roughness"].default_value = rough; b.inputs["Metallic"].default_value = metal
    if coat and "Coat Weight" in b.inputs: b.inputs["Coat Weight"].default_value = coat
    if image:
        t = m.node_tree.nodes.new("ShaderNodeTexImage"); t.image = bpy.data.images.load(image)
        m.node_tree.links.new(t.outputs["Color"], b.inputs["Base Color"])
    return m
assets = os.path.join(root, "..", "..", "apps", "web", "public", "assets", "bag3d")
RED = mat("red", (0.42, 0.02, 0.03), 0.34, 0.0, 0.5)
CREAM = mat("cream", (0.86, 0.80, 0.68), 0.5)
CHROME = mat("chrome", (0.8, 0.8, 0.82), 0.18, 1.0)
GOLD = mat("gold", (0.85, 0.62, 0.25), 0.4, 0.8)
PATCH = mat("patch", (0.9, 0.9, 0.9), 0.6, image=os.path.join(assets, "patch.png"))
for o in meshes:
    n = o.name
    pick = RED if n.startswith(("body", "crown")) else CHROME if n.startswith("metal") else GOLD if n.startswith("stitch") else PATCH if n.startswith("patch") else CREAM
    o.data.materials.clear(); o.data.materials.append(pick)
bpy.context.view_layer.update()
pts = [o.matrix_world @ Vector(c) for o in meshes for c in o.bound_box]
lo = Vector((min(p.x for p in pts), min(p.y for p in pts), min(p.z for p in pts)))
hi = Vector((max(p.x for p in pts), max(p.y for p in pts), max(p.z for p in pts)))
ctr = (lo + hi) / 2; height = hi.z - lo.z

target = bpy.data.objects.new("target", None); scene.collection.objects.link(target); target.location = ctr

def light(name, kind, loc, energy, color=(1, 1, 1), size=None):
    d = bpy.data.lights.new(name, kind); d.energy = energy; d.color = color
    if size is not None and hasattr(d, "size"): d.size = size
    o = bpy.data.objects.new(name, d); scene.collection.objects.link(o); o.location = loc
    c = o.constraints.new("TRACK_TO"); c.target = target; c.track_axis = "TRACK_NEGATIVE_Z"; c.up_axis = "UP_Y"
    return o
light("key", "AREA", ctr + Vector((-2.2, -2.6, 1.2)), 140, (1.0, 0.86, 0.68), 2.4)      # warm key from the left
light("rim", "AREA", ctr + Vector((2.6, 1.6, 0.9)), 220, (1.0, 0.62, 0.3), 2.0)         # amber rim from behind right
light("fill", "AREA", ctr + Vector((1.6, -2.8, -0.3)), 45, (0.7, 0.75, 0.9), 3.0)       # cool low fill

cd = bpy.data.cameras.new("cam"); cd.lens = 70
cam = bpy.data.objects.new("cam", cd); scene.collection.objects.link(cam); scene.camera = cam
ang = math.radians(-28)
cam.location = ctr + Vector((math.sin(ang) * -7.2 * -1, -math.cos(ang) * 7.2, 0.05))
tc = cam.constraints.new("TRACK_TO"); tc.target = target; tc.track_axis = "TRACK_NEGATIVE_Z"; tc.up_axis = "UP_Y"
cd.sensor_fit = "VERTICAL"; cd.sensor_height = 24
cd.lens = 24 * 7.2 / (height * 1.08)   # frame the bag with a little air
scene.render.engine = "BLENDER_EEVEE"; scene.render.film_transparent = True
scene.render.resolution_x, scene.render.resolution_y = W, H
scene.render.image_settings.file_format = "PNG"; scene.render.image_settings.color_mode = "RGBA"
scene.view_settings.view_transform = "Standard"
scene.render.filepath = OUT
bpy.ops.render.render(write_still=True)
print("DONE", OUT, height)
