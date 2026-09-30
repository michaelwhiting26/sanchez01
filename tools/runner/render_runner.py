"""
Render a black-silhouette running character as a transparent sprite sheet, with a spray can in the raised arm and the can nozzle's position per frame.

  Blender -b -P render_runner.py -- --out <dir> [--frames 24] [--size 512] [--arm x,y,z] [--fore x,y,z] [--test]

Source: Xbot.glb (three.js examples, Mixamo "X Bot" mannequin with the stock run cycle). Output is only a rendered silhouette, no rig or mesh is shipped.
The runner faces screen-RIGHT. Frame size is square; the sheet is `cols` x `rows` frames left-to-right, top-to-bottom.
"""
import bpy, sys, os, json, math
from mathutils import Vector, Euler
from bpy_extras.object_utils import world_to_camera_view

argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
def opt(name, default):
    return argv[argv.index(name) + 1] if name in argv else default
OUT = opt("--out", "/tmp/runner")
N = int(opt("--frames", "24"))
SIZE = int(opt("--size", "512"))
ARM = [float(v) for v in opt("--arm", "0,0,-100").split(",")]     # degrees, bone-local euler for RightArm
FORE = [float(v) for v in opt("--fore", "0,0,0").split(",")]      # degrees, bone-local euler for RightForeArm
TEST = "--test" in argv
os.makedirs(OUT, exist_ok=True)

bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=os.path.join(os.path.dirname(os.path.abspath(__file__)), "Xbot.glb"))
scene = bpy.context.scene
arm = next(o for o in bpy.data.objects if o.type == "ARMATURE")
for o in list(bpy.data.objects):
    if o.name.startswith("Icosphere"):
        bpy.data.objects.remove(o, do_unlink=True)

# the stock run cycle
act = bpy.data.actions["run"]
arm.animation_data.action = act
start, end = act.frame_range

# free the right arm from the run action so it can hold the spray pose (legs, spine and the left arm keep running)
FREE = ("mixamorig:RightArm", "mixamorig:RightForeArm", "mixamorig:RightHand", "mixamorig:RightShoulder")
def free_right_arm(action):
    # Blender 5 stores curves in layered actions: layers -> strips -> channelbags -> fcurves (older versions: action.fcurves)
    if hasattr(action, "fcurves"):
        for fc in list(action.fcurves):
            if any(b in fc.data_path for b in FREE): action.fcurves.remove(fc)
        return
    for layer in action.layers:
        for strip in layer.strips:
            for cb in strip.channelbags:
                for fc in list(cb.fcurves):
                    if any(b in fc.data_path for b in FREE): cb.fcurves.remove(fc)
free_right_arm(act)
for name, e in (("mixamorig:RightArm", ARM), ("mixamorig:RightForeArm", FORE)):
    pb = arm.pose.bones[name]
    pb.rotation_mode = "XYZ"
    pb.rotation_euler = Euler([math.radians(v) for v in e], "XYZ")

# solid black silhouette: emission black, no lighting response
mat = bpy.data.materials.new("silhouette")
mat.use_nodes = True
nt = mat.node_tree
nt.nodes.clear()
lw = nt.nodes.new("ShaderNodeLayerWeight"); lw.inputs["Blend"].default_value = 0.5
ramp = nt.nodes.new("ShaderNodeValToRGB")
ramp.color_ramp.elements[0].position = 0.34; ramp.color_ramp.elements[0].color = (0, 0, 0, 1)
ramp.color_ramp.elements[1].position = 0.62; ramp.color_ramp.elements[1].color = (0.62, 0.45, 0.26, 1)   # thin tan rim so the silhouette reads on black
em = nt.nodes.new("ShaderNodeEmission")
out = nt.nodes.new("ShaderNodeOutputMaterial")
nt.links.new(lw.outputs["Fresnel"], ramp.inputs["Fac"]); nt.links.new(ramp.outputs["Color"], em.inputs["Color"]); nt.links.new(em.outputs["Emission"], out.inputs["Surface"])
for o in bpy.data.objects:
    if o.type == "MESH":
        o.data.materials.clear(); o.data.materials.append(mat)

# spray can: placed each frame from the right hand bone (head -> tail direction), plus the nozzle point at its top
bpy.ops.mesh.primitive_cylinder_add(radius=0.05, depth=0.2, location=(0, 0, 0))
can = bpy.context.active_object; can.name = "can"; can.data.materials.append(mat); can.rotation_mode = "QUATERNION"
HAND = arm.pose.bones["mixamorig:RightHand"]
FORE = arm.pose.bones["mixamorig:RightForeArm"]
def place_can():
    hand = arm.matrix_world @ HAND.head
    fore = arm.matrix_world @ FORE.head
    d = (hand - fore).normalized()
    mid = hand + d * 0.09
    can.location = mid
    can.rotation_quaternion = d.to_track_quat("Z", "Y")
    return hand + d * 0.18   # the nozzle: the top of the can

# camera: orthographic side view, character facing screen-right
cam_data = bpy.data.cameras.new("cam"); cam_data.type = "ORTHO"; cam_data.ortho_scale = 2.35
cam = bpy.data.objects.new("cam", cam_data); scene.collection.objects.link(cam); scene.camera = cam
cam.location = (-8, 0, 0.98); cam.rotation_euler = (math.radians(90), 0, math.radians(-90))

scene.render.engine = "BLENDER_EEVEE"
scene.render.film_transparent = True
scene.render.resolution_x = scene.render.resolution_y = SIZE
scene.render.resolution_percentage = 100
scene.render.image_settings.file_format = "PNG"
scene.render.image_settings.color_mode = "RGBA"
scene.view_settings.view_transform = "Standard"
scene.render.filter_size = 1.0

frames = []
nozzles = []
count = 1 if TEST else N
for i in range(count):
    f = start + (end - start) * i / N
    scene.frame_set(int(f), subframe=f - int(f))
    bpy.context.view_layer.update()
    nozzle_pos = place_can()
    bpy.context.view_layer.update()
    p = os.path.join(OUT, f"frame_{i:02d}.png")
    scene.render.filepath = p
    bpy.ops.render.render(write_still=True)
    frames.append(p)
    ndc = world_to_camera_view(scene, cam, nozzle_pos)
    nozzles.append({"x": round(ndc.x * SIZE, 1), "y": round((1 - ndc.y) * SIZE, 1)})

json.dump({"frames": count, "size": SIZE, "nozzle": nozzles}, open(os.path.join(OUT, "meta.json"), "w"))
print("DONE", count, nozzles[:3])
