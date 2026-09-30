"""
Render a black-silhouette running character as a transparent sprite sheet, with a spray can in the raised arm and the can nozzle's position per frame.

  Blender -b -P render_runner.py -- --out <dir> [--frames 24] [--size 512] [--arm x,y,z] [--fore x,y,z] [--test] [--look silhouette|shaded]
  JESSE (Xbot-structured; silhouette = live look, --look shaded = his own clothes):
    B=/Applications/Blender.app/Contents/MacOS/Blender; R=tools/runner; S=<scratch>/frames
    $B -b -P $R/render_runner.py -- --model jesse --size 320 --frames 24 --scale <s> [--flip] --arm <x,y,z> --fore <x,y,z> [--look shaded] --out $S/{sil|sh}/run
    python3 $R/assemble_beats.py --frames $S/sil --out apps/web/public/assets/runner --sheets <scratch>/sheets --suffix _jesse --beats run   (shaded: $S/sh, --suffix _jesse_shaded)
  live sheet args: --model soldier --size 320 --frames 24 --arm 83,29.1,-27.4 --fore -23.9,-44.1,-16.9   (reverse-fitted; nozzle track within 3.8 px of the live meta.json)

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
LOOK = opt("--look", "silhouette")
TEST = "--test" in argv
JESSE = "--jesse" in argv
MODEL = opt("--model", "xbot")   # xbot: the Mixamo mannequin; soldier: the Mixamo "Vanguard" (a real clothed human: jacket, trousers, boots, short hair)   # Jesse: a stockier build and short cropped hair, from the workshop footage
os.makedirs(OUT, exist_ok=True)

bpy.ops.wm.read_factory_settings(use_empty=True)
HERE = os.path.dirname(os.path.abspath(__file__))
GLB = {"soldier": "Soldier.glb", "jesse": "Jesse.glb"}.get(MODEL, "Xbot.glb")   # jesse = Xbot-structured (Jesse_Body skin, same mixamorig skeleton): Xbot code paths
bpy.ops.import_scene.gltf(filepath=os.path.join(HERE, GLB))
scene = bpy.context.scene
arm = next(o for o in bpy.data.objects if o.type == "ARMATURE")
SCALE = float(opt("--scale", "1.0"))   # uniform armature scale factor (match the live sheets' head height)
arm.scale = tuple(s * SCALE for s in arm.scale)
if "--flip" in argv:                   # turn 180 deg about Z if the model faces screen-left
    from mathutils import Matrix as _M
    arm.matrix_world = _M.Rotation(math.pi, 4, "Z") @ arm.matrix_world
for o in list(bpy.data.objects):
    if o.name.startswith("Icosphere") or o.name == "vanguard_visor":   # the helper sphere, and the soldier's goggles
        bpy.data.objects.remove(o, do_unlink=True)

if JESSE and MODEL != "soldier":
    arm.scale = (arm.scale[0], arm.scale[1] * 1.16, arm.scale[2])   # broader through the chest and back (depth, side-on), same height

if MODEL == "soldier":
    from mathutils import Matrix
    arm.matrix_world = Matrix.Rotation(math.pi, 4, "Z") @ arm.matrix_world   # the Vanguard faces -Y: turn him (about world up) to run screen-right like the mannequin

# the stock run cycle
act = bpy.data.actions["Run" if MODEL == "soldier" else "run"]
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
if LOOK != "shaded":
    for o in bpy.data.objects:
        if o.type == "MESH":
            o.data.materials.clear(); o.data.materials.append(mat)

# spray can: placed each frame from the right hand bone (head -> tail direction), plus the nozzle point at its top
bpy.ops.mesh.primitive_cylinder_add(radius=0.05, depth=0.2, location=(0, 0, 0))
can = bpy.context.active_object; can.name = "can"; can.data.materials.append(mat); can.rotation_mode = "QUATERNION"
HAND = arm.pose.bones["mixamorig:RightHand"]
HEAD = arm.pose.bones["mixamorig:Head"]
TOP = arm.pose.bones.get("mixamorig:HeadTop_End")
FOREB = arm.pose.bones["mixamorig:RightForeArm"]
extras = {}
def unit(kind):
    if kind == "sphere": bpy.ops.mesh.primitive_uv_sphere_add(radius=1.0, segments=24, ring_count=12)
    elif kind == "cyl": bpy.ops.mesh.primitive_cylinder_add(radius=1.0, depth=1.0, vertices=24)
    else: bpy.ops.mesh.primitive_cone_add(radius1=1.0, radius2=0.0, depth=1.0, vertices=16)
    o = bpy.context.active_object; o.data.materials.append(mat); o.rotation_mode = "QUATERNION"
    for p in o.data.polygons: p.use_smooth = True
    return o
if JESSE and MODEL != "soldier":
    # Jesse, from the Instagram footage: short dark cropped hair with a fade, a real profile (nose, jaw), a thick neck, a stocky build, dark hoodie
    for name, kind in [("hair", "sphere"), ("nose", "cone"), ("chin", "sphere"), ("neck", "cyl"), ("hood", "sphere"), ("torso", "sphere"), ("hips", "sphere"),
                       ("uaR", "cyl"), ("faR", "cyl"), ("uaL", "cyl"), ("faL", "cyl")]:
        extras[name] = unit(kind)
def pb(name): return arm.matrix_world @ arm.pose.bones["mixamorig:" + name].head
def limb(o, p, q, r):
    d = q - p; L = d.length or 1e-4
    o.location = (p + q) / 2; o.scale = (r, r, L); o.rotation_quaternion = d.normalized().to_track_quat("Z", "Y")
def place_jesse():
    if not JESSE or MODEL == "soldier": return
    h = pb("Head")
    top = arm.matrix_world @ (TOP.head if TOP else HEAD.tail)
    up = (top - h).normalized() if (top - h).length > 1e-4 else Vector((0, 0, 1))
    fwd = Vector((0, 1, 0))                                     # he runs screen-right, +Y
    c = h + up * 0.105                                           # centre of the head
    hair = extras["hair"]; hair.location = c + up * 0.028 - fwd * 0.004; hair.scale = (0.088, 0.098, 0.088)   # cropped close, fade at the sides
    n = extras["nose"]; n.location = c + fwd * 0.096 - up * 0.008; n.scale = (0.019, 0.019, 0.034); n.rotation_quaternion = fwd.to_track_quat("Z", "Y")
    ch = extras["chin"]; ch.location = c + fwd * 0.058 - up * 0.085; ch.scale = (0.034, 0.038, 0.03)          # square jaw
    limb(extras["neck"], h - up * 0.045, pb("Spine2") + up * 0.02, 0.062)                                   # thick neck
    hd = extras["hood"]; hd.location = h - fwd * 0.06 - up * 0.02; hd.scale = (0.075, 0.085, 0.07)           # the bunched hood behind the neck
    sp2 = pb("Spine2"); sp1 = pb("Spine")
    t = extras["torso"]; t.location = (sp2 + sp1) / 2; t.scale = (0.2, 0.185, 0.27); t.rotation_quaternion = (sp2 - sp1).normalized().to_track_quat("Z", "Y")   # hoodie body
    hp = extras["hips"]; hp.location = pb("Hips") + Vector((0, 0, 0.02)); hp.scale = (0.17, 0.165, 0.13)
    limb(extras["uaR"], pb("RightArm"), pb("RightForeArm"), 0.066); limb(extras["faR"], pb("RightForeArm"), pb("RightHand"), 0.052)
    limb(extras["uaL"], pb("LeftArm"), pb("LeftForeArm"), 0.066); limb(extras["faL"], pb("LeftForeArm"), pb("LeftHand"), 0.052)

def place_can():
    hand = arm.matrix_world @ HAND.head
    fore = arm.matrix_world @ FOREB.head
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
if LOOK == "shaded":
    sys.path.insert(0, os.path.dirname(os.path.abspath(__file__))); import shaded_look; shaded_look.setup(scene, can)

frames = []
nozzles = []
count = 1 if TEST else N
for i in range(count):
    f = start + (end - start) * i / N
    scene.frame_set(int(f), subframe=f - int(f))
    bpy.context.view_layer.update()
    place_jesse()
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
