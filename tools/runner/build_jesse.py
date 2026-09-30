"""
Build "Jesse" for the hero runner: a rigged Blender character that reads as Jesse from the Instagram pad-work footage (black fitted crew-neck tee, black
shorts above the knee, tight skin fade, stocky build: broad shoulders, thick neck, heavy arms, sleeve tattoo on the right forearm, trainers).

  Blender -b -P build_jesse.py -- [--out tools/runner/Jesse.glb] [--previews <dir>]

Base: Xbot.glb (three.js examples, Mixamo "X Bot": a clean mannequin on the standard 67-bone mixamorig skeleton, with idle/walk/run/sneak actions).
Everything is built procedurally on that mesh so it stays on the same skeleton and every existing animation and pose still drives it:
  - build: vertices pushed out along their normals by how strongly they belong to the chest/shoulders/neck/arms (weights), so the body thickens
    where Jesse is heavy without changing height or the rig;
  - clothes: tee and shorts are duplicated shells of the body faces in those regions (so they carry the same bone weights), offset outward;
  - materials: skin, ink sleeve, hair fade, black cotton, white trainers.
This is a likeness from low-resolution, side-on/back-on footage: proportions, clothing and hair, not a face scan (no usable face-on frame of him exists).
"""
import bpy, bmesh, sys, os, math
from mathutils import Vector

argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
opt = lambda n, d: argv[argv.index(n) + 1] if n in argv else d
HERE = os.path.dirname(os.path.abspath(__file__))
OUT = opt("--out", os.path.join(HERE, "Jesse.glb"))
PREV = opt("--previews", "")

bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=os.path.join(HERE, "Xbot.glb"))
for o in list(bpy.data.objects):
    if o.name.startswith("Icosphere"):
        bpy.data.objects.remove(o, do_unlink=True)
arm = next(o for o in bpy.data.objects if o.type == "ARMATURE")
surf = bpy.data.objects["Beta_Surface"]
joints = bpy.data.objects["Beta_Joints"]

# one body mesh: the joint rings become skin too
bpy.ops.object.select_all(action="DESELECT")
joints.select_set(True); surf.select_set(True); bpy.context.view_layer.objects.active = surf
bpy.ops.object.join()
orig = surf; orig.name = "Xbot_Source"
# The mannequin is built of separate plates with hard seams at every joint. Voxel-remesh a copy into ONE continuous skin, then copy the bone weights
# across from the original (nearest-surface interpolation), so the smooth body is skinned to the same skeleton.
for m in list(orig.modifiers):
    if m.type == "ARMATURE": orig.modifiers.remove(m)
body = orig.copy(); body.data = orig.data.copy(); bpy.context.scene.collection.objects.link(body); body.name = "Jesse_Body"
S0 = body.matrix_world.to_scale()[0]
rm = body.modifiers.new("remesh", "REMESH"); rm.mode = "VOXEL"; rm.voxel_size = 0.009 / S0; rm.use_smooth_shade = True
bpy.context.view_layer.objects.active = body; bpy.ops.object.modifier_apply(modifier=rm.name)
for g in orig.vertex_groups:
    if g.name not in body.vertex_groups: body.vertex_groups.new(name=g.name)
dt = body.modifiers.new("weights", "DATA_TRANSFER"); dt.object = orig; dt.use_vert_data = True; dt.data_types_verts = {"VGROUP_WEIGHTS"}
dt.vert_mapping = "POLYINTERP_NEAREST"; dt.layers_vgroup_select_src = "ALL"; dt.layers_vgroup_select_dst = "NAME"
bpy.ops.object.modifier_apply(modifier=dt.name)
sm0 = body.modifiers.new("relax", "SMOOTH"); sm0.factor = 0.7; sm0.iterations = 10
bpy.ops.object.modifier_apply(modifier=sm0.name)
body.data.materials.clear()
bpy.data.objects.remove(orig, do_unlink=True)

# rest pose, world-space bone heads (metres)
arm.data.pose_position = "REST"
bpy.context.view_layer.update()
def head(n): return arm.matrix_world @ arm.data.bones["mixamorig:" + n].head_local
H = {n: head(n) for n in ["Hips", "Spine", "Spine2", "Neck", "Head", "HeadTop_End", "LeftShoulder", "LeftArm", "LeftForeArm", "LeftHand",
                          "RightArm", "RightForeArm", "RightHand", "LeftUpLeg", "LeftLeg", "LeftFoot", "RightLeg", "RightFoot"]}
MW = body.matrix_world; MWI = MW.inverted(); S = MW.to_scale()[0]   # local units per metre = 1/S
to_local = lambda metres: metres / S

gi = {g.name.replace("mixamorig:", ""): g.index for g in body.vertex_groups}
def weights(v): return {k: 0.0 for k in ()} | {body.vertex_groups[g.group].name.replace("mixamorig:", ""): g.weight for g in v.groups}

me = body.data
bm = bmesh.new(); bm.from_mesh(me); bm.verts.ensure_lookup_table(); bm.faces.ensure_lookup_table()
dl = bm.verts.layers.deform.verify()
name_of = {g.index: g.name.replace("mixamorig:", "") for g in body.vertex_groups}
def W(v):
    return {name_of[i]: w for i, w in v[dl].items()}
def world(v): return MW @ v.co

# ---- 1. build: thicken chest, back, shoulders, neck, arms (Jesse is stocky), a little in the thighs; nothing in the head, hands, feet ----
BULK = {"Spine2": .018, "Spine1": .014, "Spine": .010, "LeftShoulder": .016, "RightShoulder": .016, "Neck": .016,
        "LeftArm": .013, "RightArm": .013, "LeftForeArm": .008, "RightForeArm": .008, "Hips": -.004}
bm.normal_update()
# the mannequin's pelvis is a big rounded shell: pull it in towards the hip centre front-to-back and side-to-side (a real, athletic pelvis)
hc = MWI @ H["Hips"]
for v in bm.verts:
    hw = W(v).get("Hips", 0) + 0.6 * (W(v).get("LeftUpLeg", 0) + W(v).get("RightUpLeg", 0)) * (1 if (MW @ v.co).z > H["LeftUpLeg"].z - 0.08 else 0)
    if hw > 0.05:
        k = min(1.0, hw)
        v.co.y = hc.y + (v.co.y - hc.y) * (1 - 0.30 * k)
        v.co.x = hc.x + (v.co.x - hc.x) * (1 - 0.10 * k)
for v in bm.verts:
    w = W(v)
    d = sum(BULK.get(k, 0) * x for k, x in w.items())
    if d > 0: v.co += v.normal * to_local(d)
bm.normal_update()

# ---- 2. regions (rest pose is a T-pose: arms along world X) ----
hem = H["Hips"].z + 0.07                     # tee hem: just below the belt line
neck_line = H["Neck"].z + 0.01               # crew neck
sleeve = lambda sx, ex: sx + 0.50 * (ex - sx) # sleeve ends half-way down the upper arm
lsx, lex = H["LeftArm"].x, H["LeftForeArm"].x
rsx, rex = H["RightArm"].x, H["RightForeArm"].x
waist = hem + 0.035                          # shorts come up under the tee hem: no skin band
knee_top = H["LeftLeg"].z + 0.10             # shorts end above the knee
def in_tee(p, w):
    if w.get("Head", 0) > 0.2 or any(k.endswith("Hand") or "Hand" in k for k in w if w[k] > 0.3): return False
    if abs(p.x) <= abs(H["LeftArm"].x):      # torso
        return hem <= p.z <= neck_line
    # arms: only near shoulder height, out to the sleeve end
    if abs(p.z - H["LeftArm"].z) > 0.20: return False
    return (p.x > 0 and p.x <= max(sleeve(lsx, lex), sleeve(rsx, rex))) or (p.x < 0 and p.x >= min(sleeve(lsx, lex), sleeve(rsx, rex)))
def in_shorts(p, w):
    legs = w.get("Hips", 0) + w.get("LeftUpLeg", 0) + w.get("RightUpLeg", 0) + w.get("Spine", 0)
    return knee_top <= p.z <= waist and legs > 0.5   # by weight, so the outer thigh is covered too
def in_scalp(p, w):
    return w.get("Head", 0) > 0.5 and p.z > H["Head"].z + 0.075
def in_shoe(p, w):
    return p.z < H["LeftFoot"].z + 0.035 or w.get("LeftToeBase", 0) + w.get("RightToeBase", 0) + w.get("LeftFoot", 0) + w.get("RightFoot", 0) > 0.6 and p.z < H["LeftFoot"].z + 0.06
def in_tattoo(p, w):   # right forearm sleeve (Jesse's right arm = character's right; in the rest pose that side is world -X)
    return w.get("RightForeArm", 0) > 0.45
right_x_sign = 1 if H["RightArm"].x > 0 else -1

# ---- materials ----
def mat(name, rgb, rough=.6, sss=0.0, sheen=0.0):
    m = bpy.data.materials.new(name); m.use_nodes = True
    b = m.node_tree.nodes["Principled BSDF"]; b.inputs["Base Color"].default_value = (*rgb, 1); b.inputs["Roughness"].default_value = rough
    if sss: b.inputs["Subsurface Weight"].default_value = sss; b.inputs["Subsurface Radius"].default_value = (1.0, .35, .2)
    if sheen: b.inputs["Sheen Weight"].default_value = sheen
    return m
SKIN = mat("Skin", (.72, .52, .42), .5, sss=.12)
INK = mat("Ink", (.20, .19, .21), .55)
HAIR = mat("HairFade", (.10, .075, .06), .8)
TEE = mat("BlackTee", (.022, .022, .024), .85, sheen=.25)
SHORTS = mat("BlackShorts", (.03, .03, .033), .7, sheen=.15)
SHOE = mat("Trainers", (.85, .84, .82), .45)
for m in (SKIN, INK, HAIR, TEE, SHORTS, SHOE): me.materials.append(m)
MI = {m.name: i for i, m in enumerate(me.materials)}
while len(me.materials) > 6 and me.materials[0].name not in MI: pass

# body faces: skin, with hair / ink / shoes by region (a face takes a region when all its verts are in it)
tee_faces, shorts_faces = [], []
for f in bm.faces:
    ps = [(world(v), W(v)) for v in f.verts]
    allin = lambda fn: all(fn(p, w) for p, w in ps)
    f.material_index = MI["Skin"]
    if allin(in_scalp): f.material_index = MI["HairFade"]
    elif allin(in_shoe): f.material_index = MI["Trainers"]
    elif allin(in_tattoo): f.material_index = MI["Ink"] if (hash((round(ps[0][0].x, 2), round(ps[0][0].z, 2))) % 3) else MI["Skin"]
    most = lambda fn: sum(fn(p, w) for p, w in ps) * 2 > len(ps)   # clothes take a face when most of its corners are inside: no ragged skin gaps
    if most(in_tee): tee_faces.append(f)
    elif most(in_shorts): shorts_faces.append(f)

# ---- 3. clothes: duplicate the region faces as shells, pushed out along the normal (they keep the bone weights, so they move with the body) ----
def shell(faces, offset, mat_name):
    res = bmesh.ops.duplicate(bm, geom=faces)
    new_faces = [g for g in res["geom"] if isinstance(g, bmesh.types.BMFace)]
    new_verts = {v for f in new_faces for v in f.verts}
    for f in new_faces: f.material_index = MI[mat_name]
    for v in new_verts: v.co += v.normal * to_local(offset)
    return new_faces
bm.normal_update()
shell(tee_faces, 0.011, "BlackTee")
shell(shorts_faces, 0.008, "BlackShorts")

bm.to_mesh(me); bm.free(); me.update()
# drop the imported mannequin materials (now unused)
used = {p.material_index for p in me.polygons}
for i in reversed(range(len(me.materials))):
    if i not in used and me.materials[i].name not in MI: pass
bpy.ops.object.select_all(action="DESELECT"); body.select_set(True); bpy.context.view_layer.objects.active = body
bpy.ops.object.material_slot_remove_unused()
am = body.modifiers.new("Armature", "ARMATURE"); am.object = arm
# (the copy keeps the original's parent: the armature, with its 0.01 scale)

arm.data.pose_position = "POSE"
os.makedirs(os.path.dirname(OUT), exist_ok=True)
bpy.ops.export_scene.gltf(filepath=OUT, export_format="GLB", export_animations=True, export_apply=False, export_yup=True)
print("JESSE_EXPORTED", OUT)

# ---- previews: shaded turnaround in the idle pose, and the run cycle mid-stride side-on ----
if PREV:
    os.makedirs(PREV, exist_ok=True)
    sc = bpy.context.scene
    sc.render.engine = "BLENDER_EEVEE_NEXT" if "BLENDER_EEVEE_NEXT" in [e.identifier for e in bpy.types.RenderSettings.bl_rna.properties["engine"].enum_items] else "BLENDER_EEVEE"
    sc.render.resolution_x, sc.render.resolution_y = 700, 1000
    sc.render.film_transparent = False
    w = bpy.data.worlds.new("w"); sc.world = w; w.use_nodes = True; w.node_tree.nodes["Background"].inputs[0].default_value = (.05, .045, .04, 1)
    def light(n, loc, e, size=2):
        d = bpy.data.lights.new(n, "AREA"); d.energy = e; d.size = size
        o = bpy.data.objects.new(n, d); sc.collection.objects.link(o); o.location = loc
        t = o.constraints.new("TRACK_TO"); t.target = body; t.track_axis = "TRACK_NEGATIVE_Z"; t.up_axis = "UP_Y"
    light("key", (2.2, -2.5, 2.4), 220); light("fill", (-2.5, -1.5, 1.4), 60); light("rim", (0, 2.8, 2.2), 260)
    sc.view_settings.view_transform = "Standard"
    cam = bpy.data.objects.new("cam", bpy.data.cameras.new("cam")); sc.collection.objects.link(cam); sc.camera = cam; cam.data.lens = 50
    tgt = bpy.data.objects.new("tgt", None); sc.collection.objects.link(tgt); tgt.location = (0, 0, 0.92)
    tc = cam.constraints.new("TRACK_TO"); tc.target = tgt; tc.track_axis = "TRACK_NEGATIVE_Z"; tc.up_axis = "UP_Y"
    def shoot(name, action, frame, yaw):
        arm.animation_data.action = bpy.data.actions[action]; sc.frame_set(int(frame))
        r = 4.2; cam.location = (math.sin(math.radians(yaw)) * -r, math.cos(math.radians(yaw)) * -r, 1.05)
        sc.render.filepath = os.path.join(PREV, f"jesse_{name}.png"); bpy.ops.render.render(write_still=True)
    idle = bpy.data.actions["idle"]; run = bpy.data.actions["run"]
    for nm, yaw in (("front", 180), ("side", 90), ("back", 0), ("three_quarter", 140)):
        shoot(nm, "idle", idle.frame_range[0] + 10, yaw)
    shoot("run_side", "run", (run.frame_range[0] + run.frame_range[1]) / 2, 90)
    print("JESSE_PREVIEWS", PREV)
