"""
Render the heavy bag as a transparent turntable sprite sheet: black silhouette with a thin tan rim (Fresnel).

  Blender -b -P render_bag.py -- --out <dir> [--frames 36] [--size 256]

Source: apps/web/public/assets/bag3d/bag_4ft.glb. The bag spins about its vertical axis; frame 0 is side-on.
"""
import bpy, sys, os, json, math
from mathutils import Vector

argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
def opt(n, d): return argv[argv.index(n) + 1] if n in argv else d
OUT = opt("--out", "/tmp/bag"); N = int(opt("--frames", "36")); SIZE = int(opt("--size", "256"))
os.makedirs(OUT, exist_ok=True)
root = os.path.dirname(os.path.abspath(__file__))
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=os.path.join(root, "..", "..", "apps", "web", "public", "assets", "bag3d", "bag_4ft.glb"))
scene = bpy.context.scene
# only the bag itself: no chain, hook, swivel or straps
for o in [o for o in bpy.data.objects if o.type == "MESH" and (o.name.startswith("metal") or o.name.startswith("strap"))]:
    bpy.data.objects.remove(o, do_unlink=True)
meshes = [o for o in bpy.data.objects if o.type == "MESH"]

mat = bpy.data.materials.new("sil"); mat.use_nodes = True
nt = mat.node_tree; nt.nodes.clear()
lw = nt.nodes.new("ShaderNodeLayerWeight"); lw.inputs["Blend"].default_value = 0.5
ramp = nt.nodes.new("ShaderNodeValToRGB")
ramp.color_ramp.elements[0].position = 0.12; ramp.color_ramp.elements[0].color = (0, 0, 0, 1)
ramp.color_ramp.elements[1].position = 0.45; ramp.color_ramp.elements[1].color = (0.84, 0.71, 0.53, 1)
em = nt.nodes.new("ShaderNodeEmission"); out = nt.nodes.new("ShaderNodeOutputMaterial")
nt.links.new(lw.outputs["Fresnel"], ramp.inputs["Fac"]); nt.links.new(ramp.outputs["Color"], em.inputs["Color"]); nt.links.new(em.outputs["Emission"], out.inputs["Surface"])
for o in meshes:
    o.data.materials.clear(); o.data.materials.append(mat)

pivot = bpy.data.objects.new("pivot", None); scene.collection.objects.link(pivot)
for o in bpy.data.objects:
    if o.parent is None and o is not pivot and o.type in {"MESH", "EMPTY", "ARMATURE"}:
        o.parent = pivot
bpy.context.view_layer.update()
pts = [o.matrix_world @ Vector(c) for o in meshes for c in o.bound_box]
lo = Vector((min(p.x for p in pts), min(p.y for p in pts), min(p.z for p in pts)))
hi = Vector((max(p.x for p in pts), max(p.y for p in pts), max(p.z for p in pts)))
ctr = (lo + hi) / 2; height = hi.z - lo.z
print("BBOX", tuple(lo), tuple(hi))

cd = bpy.data.cameras.new("cam"); cd.type = "ORTHO"; cd.ortho_scale = height * 1.06
cam = bpy.data.objects.new("cam", cd); scene.collection.objects.link(cam); scene.camera = cam
cam.location = (ctr.x, ctr.y - 20, ctr.z); cam.rotation_euler = (math.radians(90), 0, 0)
scene.render.engine = "BLENDER_EEVEE"; scene.render.film_transparent = True
scene.render.resolution_x = scene.render.resolution_y = SIZE
scene.render.image_settings.file_format = "PNG"; scene.render.image_settings.color_mode = "RGBA"
scene.view_settings.view_transform = "Standard"

pivot.location = ctr
for o in pivot.children: o.location -= ctr if o.parent_type == "OBJECT" else Vector((0, 0, 0))
bpy.context.view_layer.update()
for i in range(N):
    pivot.rotation_euler = (0, 0, math.radians(360 * i / N))
    scene.render.filepath = os.path.join(OUT, f"frame_{i:02d}.png")
    bpy.ops.render.render(write_still=True)
json.dump({"frames": N, "size": SIZE, "height": height}, open(os.path.join(OUT, "meta.json"), "w"))
print("DONE", N)
