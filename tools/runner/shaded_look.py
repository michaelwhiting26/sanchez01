"""Shared 'shaded' look for the Vanguard sprites: keep the glb's own materials, light like a night graffiti scene on a black site.
Imported by render_runner.py and render_beats.py (only when --look shaded). Screen-right = world -Y, camera at world -X."""
import bpy, math
from mathutils import Vector

def _sun(name, frm, strength, rgb, angle_deg=3.0):
    d = bpy.data.lights.new(name, "SUN"); d.energy = strength; d.color = rgb; d.angle = math.radians(angle_deg)
    o = bpy.data.objects.new(name, d); bpy.context.scene.collection.objects.link(o)
    o.rotation_euler = (-Vector(frm)).normalized().to_track_quat("-Z", "Y").to_euler()
    return o

def setup(scene, can):
    # low warm key from the front-right (spray side), thin strong tan rim from behind-left, faint cool fill from the camera side
    _sun("key", (-0.45, -0.85, 0.55), 1.6, (1.0, 0.78, 0.58), 6)
    _sun("rim", (0.10, 1.00, 0.30), 10.0, (0.84, 0.50, 0.26), 2)
    _sun("rim2", (0.25, 0.55, 0.95), 2.5, (0.84, 0.50, 0.26), 2)          # top-back glint on hair/shoulders
    _sun("fill", (-1.0, 0.25, 0.15), 0.6, (0.42, 0.55, 1.0), 20)
    w = bpy.data.worlds.new("w"); w.use_nodes = True
    bg = w.node_tree.nodes["Background"]; bg.inputs["Color"].default_value = (0.006, 0.007, 0.012, 1); bg.inputs["Strength"].default_value = 1.0
    scene.world = w
    scene.view_settings.view_transform = "Standard"
    try: scene.view_settings.look = "AgX - Medium High Contrast" if scene.view_settings.view_transform == "AgX" else "None"
    except Exception: pass
    scene.view_settings.exposure = 0.0
    for o in bpy.data.objects:
        if o.type == "MESH" and o is not can:
            for s in o.material_slots:
                m = s.material
                if m and m.use_nodes:
                    for n in m.node_tree.nodes:
                        if n.type == "BSDF_PRINCIPLED":
                            for k in ("Specular IOR Level", "Specular"):
                                if k in n.inputs: n.inputs[k].default_value = 0.25
                            if "Roughness" in n.inputs and not n.inputs["Roughness"].is_linked: n.inputs["Roughness"].default_value = max(0.6, n.inputs["Roughness"].default_value)
    cm = bpy.data.materials.new("can"); cm.use_nodes = True
    b = cm.node_tree.nodes["Principled BSDF"]; b.inputs["Base Color"].default_value = (0.32, 0.34, 0.36, 1); b.inputs["Metallic"].default_value = 0.7; b.inputs["Roughness"].default_value = 0.35
    can.data.materials.clear(); can.data.materials.append(cm)
    for o in bpy.data.objects:
        if o.type == "MESH": o.hide_render = o.hide_render
