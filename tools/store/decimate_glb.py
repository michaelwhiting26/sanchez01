"""Decimates a heavy GLB to a phone-sized one, dropping render-only objects (ground planes) by name:
Blender -b -P tools/store/decimate_glb.py -- in.glb out.glb <target_triangles> [name_to_drop ...]"""
import bpy, sys
a = sys.argv[sys.argv.index("--") + 1:]
src, dst, target = a[0], a[1], int(a[2])
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=src)
for o in list(bpy.context.scene.objects):
    if o.name in a[3:]:
        bpy.data.objects.remove(o, do_unlink=True)
meshes = [o for o in bpy.context.scene.objects if o.type == "MESH"]
total = sum(len(o.data.loop_triangles) or sum(len(p.vertices) - 2 for p in o.data.polygons) for o in meshes)
ratio = min(1.0, target / max(total, 1))
print("TRIS", total, "RATIO", round(ratio, 4), "OBJECTS", len(meshes))
for o in meshes:
    if len(o.data.polygons) < 200:
        continue
    bpy.context.view_layer.objects.active = o
    m = o.modifiers.new("dec", "DECIMATE")
    m.ratio = ratio
    bpy.ops.object.modifier_apply(modifier=m.name)
for img in bpy.data.images:
    if img.size[0] > 1024:
        img.scale(1024, int(1024 * img.size[1] / img.size[0]))
bpy.ops.export_scene.gltf(filepath=dst, export_format="GLB", export_apply=True, export_image_format="AUTO")
print("AFTER", sum(sum(len(p.vertices) - 2 for p in o.data.polygons) for o in bpy.context.scene.objects if o.type == "MESH"))
