"""
Jesse's waitlist rally: Jesse (Jesse.glb) holding his red focus pad and swinging it like a tennis racket (a forehand: ready, backswing, swing, contact,
follow-through, recover), rendered as a transparent sprite sheet, facing screen-LEFT, with the pad-face position per frame so the site can launch the
ball from exactly where it is struck.

  Blender -b -P render_rally.py -- --out <dir> [--frames 20] [--size 512] [--test]

How the swing is made: the right arm is driven by an IK chain (upper arm + forearm) to an empty that travels a forehand arc around the right shoulder,
the spine twists into the backswing and unwinds through contact, and the legs keep a planted athletic stance (from the idle action). The pad is a red
rounded disc parented to the right hand. Output: rally_raw_XX.png frames + rally.json (frame count, size, pad-face uv per frame, contact frame).
The site's flat-colour look is applied afterwards by posterise_rally.py.
"""
import bpy, sys, os, json, math
from mathutils import Vector, Matrix
from bpy_extras.object_utils import world_to_camera_view

argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
opt = lambda n, d: argv[argv.index(n) + 1] if n in argv else d
HERE = os.path.dirname(os.path.abspath(__file__))
OUT = opt("--out", "/tmp/rally"); N = int(opt("--frames", "20")); SIZE = int(opt("--size", "512")); TEST = "--test" in argv
os.makedirs(OUT, exist_ok=True)

bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=os.path.join(HERE, "Jesse.glb"), bone_heuristic="TEMPERANCE")   # bones point at their child joint, so IK aims along the real limb
sc = bpy.context.scene
arm = next(o for o in bpy.data.objects if o.type == "ARMATURE")
body = next(o for o in bpy.data.objects if o.type == "MESH")
PB = arm.pose.bones
bn = lambda n: PB["mixamorig:" + n]

# base: the idle action at a fixed frame (planted stance, relaxed arms)
idle = bpy.data.actions.get("idle") or bpy.data.actions[0]
arm.animation_data.action = idle
sc.frame_set(int(idle.frame_range[0]) + 5)
bpy.context.view_layer.update()
def wpos(name, tail=False):
    b = bn(name); return arm.matrix_world @ (b.tail if tail else b.head)

# bake the idle pose as the rest of every frame, then drop the action so our keys are the only animation
pose_snapshot = {b.name: (b.location.copy(), b.rotation_quaternion.copy(), b.rotation_euler.copy(), b.rotation_mode) for b in PB}
arm.animation_data.action = None
for b in PB:
    loc, q, e, mode = pose_snapshot[b.name]
    b.location, b.rotation_quaternion, b.rotation_euler = loc, q, e
bpy.context.view_layer.update()

# body frame: forward = foot -> toe, up = world Z, right = forward x up
F = (wpos("LeftToeBase", tail=True) - wpos("LeftFoot")); F.z = 0; F.normalize()
U = Vector((0, 0, 1)); R = F.cross(U); R.normalize()
SH = wpos("RightArm")
L_ARM = (wpos("RightArm") - wpos("RightForeArm")).length + (wpos("RightForeArm") - wpos("RightHand")).length

# the pad: a red rounded disc in the right hand, face pointing along the palm
bpy.ops.mesh.primitive_uv_sphere_add(segments=32, ring_count=16, radius=1)
pad = bpy.context.active_object; pad.name = "Pad"
pad.scale = (0.115, 0.03, 0.14)
m = bpy.data.materials.new("PadRed"); m.use_nodes = True
bsdf = m.node_tree.nodes["Principled BSDF"]; bsdf.inputs["Base Color"].default_value = (0.78, 0.13, 0.06, 1); bsdf.inputs["Roughness"].default_value = 0.45
pad.data.materials.append(m)
hand = bn("RightHand")
def place_pad():   # not parented (the 0.01-scaled bone parent distorts it): put it on the hand every frame, past the fingers, at its real size
    hand_w = arm.matrix_world @ hand.matrix
    rot = hand_w.to_3x3().normalized()
    pos = hand_w.translation + rot.col[1] * 0.11
    pad.matrix_world = Matrix.Translation(pos) @ rot.to_4x4() @ Matrix.Diagonal((0.115, 0.14, 0.03, 1))

# IK target travelling the forehand arc
tgt = bpy.data.objects.new("SwingTarget", None); sc.collection.objects.link(tgt)
ik = bn("RightForeArm").constraints.new("IK"); ik.target = tgt; ik.chain_count = 2; ik.use_tail = True
reach = L_ARM * 0.92
def around(f, r, u):   # a point relative to the right shoulder, in the body frame (forward, right, up), scaled to his arm
    return SH + (F * f + R * r + U * u) * reach
# key poses (frame fraction, hand position, spine twist deg, hips twist deg)
KEYS = [
    (0.00, around(0.35, 0.45, -0.55), 0, 0),       # ready: pad low in front, relaxed
    (0.25, around(-0.55, 0.75, 0.05), -34, -14),   # backswing: pad back and out, shoulders turned away
    (0.42, around(-0.10, 0.85, -0.25), -18, -8),   # drop into the swing
    (0.52, around(0.70, 0.55, -0.30), 6, 4),       # contact: pad out in front, face square to the ball
    (0.70, around(0.55, -0.45, 0.25), 32, 14),     # follow-through: across the body to the left shoulder
    (1.00, around(0.35, 0.45, -0.55), 0, 0),       # recover to ready (loops)
]
CONTACT = int(round(0.52 * N))
def lerp_keys(t):
    for (t0, p0, s0, h0), (t1, p1, s1, h1) in zip(KEYS, KEYS[1:]):
        if t0 <= t <= t1:
            k = (t - t0) / (t1 - t0); k = k * k * (3 - 2 * k)   # smoothstep between keys: no hard corners in the arc
            return p0.lerp(p1, k), s0 + (s1 - s0) * k, h0 + (h1 - h0) * k
    return KEYS[-1][1], 0, 0

spine = bn("Spine1"); hips = bn("Hips")
spine.rotation_mode = hips.rotation_mode = "XYZ"
base_sp = spine.rotation_euler.copy(); base_hp = hips.rotation_euler.copy()

# camera: orthographic, from his left side turned 25 deg towards his front, so he faces screen-left and the pad arm stays visible
cam = bpy.data.objects.new("cam", bpy.data.cameras.new("cam")); sc.collection.objects.link(cam); sc.camera = cam
cam.data.type = "ORTHO"; cam.data.ortho_scale = 2.35
centre = (wpos("Hips") + Vector((0, 0, 0.12)))
view = (-R).lerp(F, 0.42).normalized()        # direction from the subject towards the camera: his left side, a little in front
cam.location = centre + view * 6
cam.rotation_euler = (centre - cam.location).to_track_quat("-Z", "Y").to_euler()
sc.render.resolution_x = sc.render.resolution_y = SIZE
sc.render.film_transparent = True
sc.render.engine = "BLENDER_EEVEE_NEXT" if "BLENDER_EEVEE_NEXT" in [e.identifier for e in bpy.types.RenderSettings.bl_rna.properties["engine"].enum_items] else "BLENDER_EEVEE"
sc.view_settings.view_transform = "Standard"
w = bpy.data.worlds.new("w"); sc.world = w; w.use_nodes = True; w.node_tree.nodes["Background"].inputs[1].default_value = 0.35
def light(n, loc, e):
    d = bpy.data.lights.new(n, "AREA"); d.energy = e; d.size = 2.5
    o = bpy.data.objects.new(n, d); sc.collection.objects.link(o); o.location = loc
    c = o.constraints.new("TRACK_TO"); c.target = body; c.track_axis = "TRACK_NEGATIVE_Z"; c.up_axis = "UP_Y"
light("key", centre + view * 3 + U * 2.5 + F * 1.5, 260); light("rim", centre - view * 3 + U * 2, 300); light("fill", centre + view * 3 - F * 2, 70)

meta = {"frames": N, "size": SIZE, "contact": CONTACT, "pad": []}
frames = [CONTACT] if TEST else range(N)
for i in frames:
    t = i / N
    p, sd, hd = lerp_keys(t)
    tgt.location = p
    spine.rotation_euler = (base_sp.x, base_sp.y + math.radians(sd), base_sp.z)   # mixamo spine: local Y runs up the bone, so Y is the twist
    hips.rotation_euler = (base_hp.x, base_hp.y + math.radians(hd), base_hp.z)
    bpy.context.view_layer.update()
    place_pad(); bpy.context.view_layer.update()
    uv = world_to_camera_view(sc, cam, pad.matrix_world.translation)
    meta["pad"].append([round(uv.x, 4), round(1 - uv.y, 4)])
    sc.render.filepath = os.path.join(OUT, f"rally_raw_{i:02d}.png")
    bpy.ops.render.render(write_still=True)
json.dump(meta, open(os.path.join(OUT, "rally.json"), "w"))
print("RALLY_DONE", OUT, "contact", CONTACT)
