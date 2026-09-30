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
from mathutils import Vector, Matrix

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
BULK = {"Spine2": .018, "Spine1": .014, "Spine": .010, "LeftShoulder": .02, "RightShoulder": .02, "Neck": .022,
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

# ---- 1b. head, from the footage: a real face shape instead of the mannequin's egg (nose, brow ridge, cheekbones, a squarer jaw),
# a thick neck, and a little volume on top of the head (short on the sides, longer on top) ----
toe = arm.matrix_world @ arm.data.bones["mixamorig:LeftToeBase"].tail_local
foot = arm.matrix_world @ arm.data.bones["mixamorig:LeftFoot"].head_local
FWD = (toe - foot); FWD.z = 0; FWD.normalize()                     # world forward (the way he faces)
HC = H["Head"] + Vector((0, 0, 0.07))                               # centre of the skull
_hv = [world(v) for v in bm.verts if W(v).get("Head", 0) > 0.5]
FRONT = max((p - HC).dot(FWD) for p in _hv)                        # measured: face surface distance in front of the skull centre
SIDE = max(abs(p.x - HC.x) for p in _hv); TOP = max(p.z for p in _hv); CHIN = min(p.z for p in _hv if (p - HC).dot(FWD) > 0.03)
HH = TOP - CHIN
lvl = lambda f: CHIN + HH * f                                       # height on the head, 0 = chin, 1 = crown
side = Vector((-FWD.y, FWD.x, 0))
def bump(pw, centre, rad, amount, direction):
    d = (pw - centre).length
    return direction * (amount * math.exp(-(d / rad) ** 2)) if d < rad * 3 else Vector((0, 0, 0))
def on_face(fwd_frac, z, lateral=0.0):                              # a point ON the head surface: forward by a fraction of FRONT, at height z
    c = Vector((HC.x, HC.y, z)) + FWD * FRONT * fwd_frac + side * lateral
    return c
feat = []
feat.append((on_face(0.97, lvl(0.44)), 0.020, 0.020, FWD))           # nose bridge
feat.append((on_face(0.98, lvl(0.36)), 0.017, 0.022, FWD))           # nose tip
feat.append((on_face(0.93, lvl(0.55)), 0.045, 0.009, FWD))           # brow ridge
feat.append((on_face(0.95, lvl(0.09)), 0.024, 0.010, FWD))           # chin
for sg in (1, -1):
    feat.append((on_face(0.62, lvl(0.44), sg * SIDE * 0.72), 0.03, 0.008, (FWD * 0.5 + side * sg).normalized()))   # cheekbones
    feat.append((on_face(0.45, lvl(0.20), sg * SIDE * 0.82), 0.032, 0.010, (side * sg).normalized()))               # square jaw
    feat.append((on_face(0.55, lvl(0.50), sg * SIDE * 0.55), 0.016, -0.007, FWD))                                   # eye sockets (in)
    feat.append((on_face(-0.05, lvl(0.46), sg * SIDE * 0.98), 0.022, 0.020, (side * sg).normalized()))              # ears
for v in bm.verts:
    w = W(v); hw = w.get("Head", 0) + 0.5 * w.get("Neck", 0)
    if hw < 0.3: continue
    pw = world(v); disp = Vector((0, 0, 0))
    for c, rad, amt, dirn in feat: disp += bump(pw, c, rad, amt, dirn)
    rel = pw - HC
    if pw.z > lvl(0.66) and rel.dot(FWD) < FRONT * 0.55:           # hair: a buzz cut, a few mm proud of the scalp everywhere
        disp += (pw - HC).normalized() * 0.004
    v.co += MWI.to_3x3() @ disp * min(1.0, hw)
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
    if abs(p.x) <= abs(H["LeftArm"].x):      # torso; out past the collar the tee rises over the traps and shoulder tops
        return hem <= p.z <= (neck_line if abs(p.x - H["Neck"].x) < 0.07 else neck_line + 0.06)
    # arms: only near shoulder height, out to the sleeve end
    if abs(p.z - H["LeftArm"].z) > 0.20: return False
    return (p.x > 0 and p.x <= max(sleeve(lsx, lex), sleeve(rsx, rex))) or (p.x < 0 and p.x >= min(sleeve(lsx, lex), sleeve(rsx, rex)))
def in_shorts(p, w):
    legs = w.get("Hips", 0) + w.get("LeftUpLeg", 0) + w.get("RightUpLeg", 0) + w.get("Spine", 0)
    return knee_top <= p.z <= waist and legs > 0.5   # by weight, so the outer thigh is covered too
def in_scalp(p, w):   # buzz cut (his own 2017 photo): short, dark, even over the top, sides and back, hairline straight across the forehead
    if w.get("Head", 0) < 0.5: return False
    rel = p - HC; f = rel.dot(FWD); lat = abs(rel.dot(side))
    return (p.z > lvl(0.66) and f < FRONT * 0.55) or (f < -FRONT * 0.1 and p.z > lvl(0.32)) or (lat > SIDE * 0.8 and f < FRONT * 0.2 and p.z > lvl(0.50))
def in_stubble(p, w):   # a short beard: jawline, chin and upper lip, below the cheekbones
    if w.get("Head", 0) < 0.4: return False
    rel = p - HC; f = rel.dot(FWD)
    return f > FRONT * 0.15 and p.z < lvl(0.30) and not (f > FRONT * 0.9 and lvl(0.24) < p.z < lvl(0.30))
def in_shoe(p, w):
    return p.z < H["LeftFoot"].z + 0.035 or w.get("LeftToeBase", 0) + w.get("RightToeBase", 0) + w.get("LeftFoot", 0) + w.get("RightFoot", 0) > 0.6 and p.z < H["LeftFoot"].z + 0.06
def in_tattoo(p, w):   # sleeves: both forearms and the upper arm below the tee sleeve (the footage shows ink on both arms)
    return w.get("RightForeArm", 0) + w.get("LeftForeArm", 0) > 0.45 or (w.get("RightArm", 0) + w.get("LeftArm", 0) > 0.6 and not in_tee(p, w))
def ink_at(p):   # smooth value noise: large connected shapes like real sleeve work
    n = math.sin(p.x * 140 + math.sin(p.z * 60) * 3) * math.sin(p.y * 120 + 0.4) + math.sin(p.z * 110 + p.x * 70) * 0.7
    return n > 0.45
right_x_sign = 1 if H["RightArm"].x > 0 else -1

# ---- materials ----
def mat(name, rgb, rough=.6, sss=0.0, sheen=0.0):
    m = bpy.data.materials.new(name); m.use_nodes = True
    b = m.node_tree.nodes["Principled BSDF"]; b.inputs["Base Color"].default_value = (*rgb, 1); b.inputs["Roughness"].default_value = rough
    if sss: b.inputs["Subsurface Weight"].default_value = sss; b.inputs["Subsurface Radius"].default_value = (1.0, .35, .2)
    if sheen: b.inputs["Sheen Weight"].default_value = sheen
    return m
SKIN = mat("Skin", (.60, .42, .32), .5, sss=.12)   # light olive (his photo)
INK = mat("Ink", (.20, .17, .16), .55)   # grey-black shaded ink over olive skin
HAIR = mat("HairFade", (.13, .10, .085), .85)   # buzz cut: dark hair with scalp showing through
STUB = mat("Stubble", (.24, .17, .13), .8)   # short full stubble: jaw, chin, moustache
TEE = mat("BlackTee", (.022, .022, .024), .85, sheen=.25)
SHORTS = mat("BlackShorts", (.10, .13, .07), .8, sheen=.15)   # dark olive shorts (his photos: olive / navy); name kept for the pipeline
SHOE = mat("Trainers", (.88, .88, .86), .45)   # white runners
for m in (SKIN, INK, HAIR, STUB, TEE, SHORTS, SHOE): me.materials.append(m)
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
    elif allin(in_stubble): f.material_index = MI["Stubble"]
    elif allin(in_tattoo): f.material_index = MI["Ink"] if ink_at(ps[0][0]) else MI["Skin"]
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

# ---- 4. his mitts: the Sanchez "FREDDIE" / "ROACH" micro mitts (mitt_v3 render, the ones on the site), slimmed for real time, one on each hand,
# pad face out from the palm, skinned 100% to the hand bone so every pose and animation carries them ----
MITTS = os.path.expanduser("~/Library/CloudStorage/Dropbox/COMPUTER CODING/15. sanchezboxing/MW DESIGNS/3d-render-exports/mitt_v3_blender/sanchez_mitt_pair.glb")
if os.path.exists(MITTS) and "--no-mitts" not in argv:
    before = set(bpy.data.objects)
    bpy.ops.import_scene.gltf(filepath=MITTS)
    new = [o for o in bpy.data.objects if o not in before]
    for o in new:
        if o.type == "MESH" and not o.name.startswith("mitt_"): bpy.data.objects.remove(o, do_unlink=True)
    mitts = {o.name: o for o in bpy.data.objects if o.name.startswith("mitt_")}
    for o in list(bpy.data.objects):
        if o.type == "EMPTY" and o.name in ("pair", "target"): bpy.data.objects.remove(o, do_unlink=True)
    def bone_head(n): return arm.matrix_world @ arm.data.bones["mixamorig:" + n].head_local
    for side_name, mname in (("Right", "mitt_ROACH"), ("Left", "mitt_FREDDIE")):
        o = mitts.get(mname)
        if not o: continue
        # slim: 500k faces is for stills; a few thousand keeps the silhouette and the lettering colours
        bpy.context.view_layer.objects.active = o; o.select_set(True)
        bpy.ops.object.mode_set(mode="EDIT"); bpy.ops.mesh.select_all(action="SELECT"); bpy.ops.mesh.remove_doubles(threshold=0.0004); bpy.ops.object.mode_set(mode="OBJECT")
        dec = o.modifiers.new("dec", "DECIMATE"); dec.ratio = 25000 / max(1, len(o.data.polygons)); dec.use_collapse_triangulate = True
        bpy.ops.object.modifier_apply(modifier=dec.name)
        bpy.ops.object.mode_set(mode="EDIT"); bpy.ops.mesh.select_all(action="SELECT"); bpy.ops.mesh.normals_make_consistent(inside=False); bpy.ops.object.mode_set(mode="OBJECT")
        for poly in o.data.polygons: poly.use_smooth = True
        o.parent = None; o.matrix_world = Matrix.Identity(4); bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
        # palm frame from the rest skeleton: fingers along hand->middle knuckle, palm normal from the thumb side (palms face down in the T-pose)
        hnd = bone_head(side_name + "Hand"); mid = bone_head(side_name + "HandMiddle1"); th = bone_head(side_name + "HandThumb1")
        fing = (mid - hnd).normalized(); nrm = fing.cross((th - hnd).normalized()).normalized()
        if nrm.z > 0: nrm = -nrm                                      # palm side
        x = fing.cross(nrm).normalized()
        rot = Matrix((x, fing, nrm)).transposed().to_4x4()            # mitt local X, Y (long axis) and Z (pad face) onto the hand
        o.matrix_world = Matrix.Translation(hnd + fing * 0.07 + nrm * 0.045) @ rot
        bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
        o.name = f"Mitt_{side_name}"
        LEATHER = {"orange": (.80, .30, .08), "green": (.18, .55, .22), "white": (.92, .91, .88), "black": (.03, .03, .03)}
        for k, ms in enumerate(o.data.materials):   # solid leather, not the render's glass-like shaders
            col = next((c for n, c in LEATHER.items() if ms and n in ms.name.lower()), (.8, .3, .08))
            nm = bpy.data.materials.new(f"MittLeather_{side_name}_{k}"); nm.use_nodes = True
            b = nm.node_tree.nodes["Principled BSDF"]; b.inputs["Base Color"].default_value = (*col, 1); b.inputs["Roughness"].default_value = .45
            o.data.materials[k] = nm
        # skin it to the hand, under the armature, in the armature's space
        vg = o.vertex_groups.new(name="mixamorig:" + side_name + "Hand"); vg.add(range(len(o.data.vertices)), 1.0, "REPLACE")
        mw = o.matrix_world.copy(); o.parent = arm; o.matrix_world = mw
        mm = o.modifiers.new("Armature", "ARMATURE"); mm.object = arm
        o.select_set(False)
    print("JESSE_MITTS", list(mitts))

# ---- 5. the tee print: "LEGENDS GYM / KENSINGTON" in gold outline lettering across the chest (his gym tee), skinned to the upper spine ----
if "--no-print" not in argv:
    gold = bpy.data.materials.new("TeeGold"); gold.use_nodes = True
    gb = gold.node_tree.nodes["Principled BSDF"]; gb.inputs["Base Color"].default_value = (.78, .62, .36, 1); gb.inputs["Roughness"].default_value = .5
    ch_z = H["Spine2"].z + 0.02
    teeblack = bpy.data.materials.new("TeePrintInner"); teeblack.use_nodes = True
    teeblack.node_tree.nodes["Principled BSDF"].inputs["Base Color"].default_value = (.022, .022, .024, 1)
    bold = None                                                   # a tall condensed gym-print face if the Mac has one, else Blender's default
    for fp in ("/System/Library/Fonts/Supplemental/Impact.ttf", "/System/Library/Fonts/Supplemental/DIN Condensed Bold.ttf", "/Library/Fonts/Impact.ttf"):
        if os.path.exists(fp): bold = bpy.data.fonts.load(fp); break
    # the front of the tee at chest height: the furthest-forward vertex of the body there
    ev = [MW @ v.co for v in body.data.vertices if abs((MW @ v.co).z - ch_z) < 0.02 and abs((MW @ v.co).x - H["Spine2"].x) < 0.06]
    front = max(ev, key=lambda p: p.dot(FWD)) if ev else H["Spine2"] + FWD * 0.14
    lines = []
    for k, txt in enumerate(("LEGENDS GYM", "KENSINGTON")):
        for layer, (off, lift, matl) in enumerate(((0.0016, 0.0, gold), (-0.0006, 0.0012, teeblack))):   # gold rim, then the black inner letter on top
          cu = bpy.data.curves.new(f"print{k}_{layer}", "FONT"); cu.body = txt; cu.align_x = "CENTER"; cu.size = 0.056; cu.extrude = 0.0006
          cu.offset = off; cu.space_character = 1.08
          if bold: cu.font = bold
          ob = bpy.data.objects.new(f"TeePrint{k}_{layer}", cu); bpy.context.scene.collection.objects.link(ob); ob.data.materials.append(matl)
          up = Vector((0, 0, 1)); xr = FWD.cross(up).normalized() * -1   # text left-to-right as seen from the front
          rot = Matrix((xr, up, FWD)).transposed().to_4x4()
          ob.matrix_world = Matrix.Translation(front + FWD * (0.006 + lift) + Vector((0, 0, 0.02 - k * 0.066))) @ rot
          bpy.context.view_layer.objects.active = ob; ob.select_set(True); bpy.ops.object.convert(target="MESH"); ob.select_set(False)
          lines.append(ob)
    for ob in lines:
        vg = ob.vertex_groups.new(name="mixamorig:Spine2"); vg.add(range(len(ob.data.vertices)), 1.0, "REPLACE")
        mw = ob.matrix_world.copy(); ob.parent = arm; ob.matrix_world = mw
        mm = ob.modifiers.new("Armature", "ARMATURE"); mm.object = arm
    print("JESSE_PRINT ok")
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
        r = 4.2; cam.location = (math.sin(math.radians(yaw)) * -r, math.cos(math.radians(yaw)) * -r, tgt.location.z + 0.1)
        sc.render.filepath = os.path.join(PREV, f"jesse_{name}.png"); bpy.ops.render.render(write_still=True)
    idle = bpy.data.actions["idle"]; run = bpy.data.actions["run"]
    for nm, yaw in (("front", 0), ("three_quarter", 35), ("side", 90), ("back", 180)):   # he faces -Y: yaw 0 puts the camera in front of him
        shoot(nm, "idle", idle.frame_range[0] + 10, yaw)
    shoot("run_side", "run", (run.frame_range[0] + run.frame_range[1]) / 2, 90)
    tgt.location = (0, 0, 1.68); cam.data.lens = 160
    for nm, yaw in (("face_front", 0), ("face_side", 90)): shoot(nm, "idle", idle.frame_range[0] + 10, yaw)
    print("JESSE_PREVIEWS", PREV)
