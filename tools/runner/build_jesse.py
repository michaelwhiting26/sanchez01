"""
Build "Jesse" for the hero runner: a rigged Blender character that reads as Jesse Sanchez from the reference photos in tools/runner/refs/jesse/
(a tanned, stocky man: strong brow, dark eyes, square jaw, dark stubble and moustache, short skin-fade buzz cut with a sharp temple line, thick neck,
heavy black-and-grey ink on both arms, black Legends Gym Kensington tee with a gold outline print, olive shorts, white runners, orange/green Freddie / Roach mitts).

  /Applications/Blender.app/Contents/MacOS/Blender -b -P tools/runner/build_jesse.py -- [--out tools/runner/Jesse.glb] [--previews <dir>] [--no-mitts] [--no-print] [--no-tee] [--dump-atlas <png>]

Everything is generated here (reproducible: fixed seeds, so the geometry and textures are the same every run, though the compressed GLB bytes can differ; no outside assets except Xbot.glb next to this file and macOS system fonts);
a missing asset stops the build with a clear error instead of substituting a placeholder.
Base: Xbot.glb (three.js examples, Mixamo "X Bot": a clean mannequin on the standard 67-bone mixamorig skeleton, with idle/walk/run/sneak actions). The skeleton is
untouched, so every existing animation, pose and sprite script (render_runner.py / render_beats.py / render_rally.py) still drives him.
  1. body: voxel-remesh the mannequin into one smooth skin, subdivide once (~4.5 mm), copy the bone weights across, then bulk it up (neck, traps, waist, heavy thighs/calves).
  2. head: scale / narrow it to a man's proportions, subdivide again (~2 mm) and sculpt it from a frontal "heightmap" (see FACE: brow, eye openings with lid folds, cheekbones,
     nose bridge / tip / wings / nostrils, lips with mouth corners, chin, square jaw, ears with helix + concha), flatten the back of the skull, add the neck cords; textured
     eyeballs sit in the sockets. Skin, stubble, moustache, brows, lips and the hair fade are painted per vertex; the hair is a thin grained shell.
  3. clothes: tee, shorts and trainers are shells of the body (normal offset), cut by exact planes (level hem, sleeve ends, knee) with a rib collar; the tee hangs from the chest
     (hang_shape) and the body under cloth is sunk a little so skinning can't poke through.
  4. tattoos: an image atlas is authored with numpy (arm sleeves unwrapped as cylinders along the bones, chest piece, "In God's Hands" script) and multiplied over the skin by real UVs.
  5. mitts: procedural Freddie / Roach mitts skinned to the hands. The tee print is draped on the tee and copies its bone weights.
Exported as Draco-compressed GLB (the dense skin would be ~28 MB otherwise).
"""
import bpy, bmesh, sys, os, math
import numpy as np
from mathutils import Vector, Matrix

argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
opt = lambda n, d: argv[argv.index(n) + 1] if n in argv else d
HERE = os.path.dirname(os.path.abspath(__file__))
OUT = opt("--out", os.path.join(HERE, "Jesse.glb"))
PREV = opt("--previews", "")

bpy.ops.wm.read_factory_settings(use_empty=True)
if not os.path.exists(os.path.join(HERE, "Xbot.glb")): raise RuntimeError("build_jesse: Xbot.glb (the Mixamo X Bot base mesh) is missing next to this script")
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
# the remeshed body is ~9 mm per quad: subdivide once (and relax only the new vertices) so garment cuts, hems and collars can follow clean lines
_ov = set(bm.verts)
bmesh.ops.subdivide_edges(bm, edges=list(bm.edges), cuts=1, use_grid_fill=True)
bm.verts.ensure_lookup_table(); bm.faces.ensure_lookup_table()
_nv0 = [v for v in bm.verts if v not in _ov]
for _ in range(3): bmesh.ops.smooth_vert(bm, verts=_nv0, factor=0.5, use_axis_x=True, use_axis_y=True, use_axis_z=True)
name_of = {g.index: g.name.replace("mixamorig:", "") for g in body.vertex_groups}
def W(v):
    return {name_of[i]: w for i, w in v[dl].items()}
def world(v): return MW @ v.co

# ---- 1. build: thicken chest, back, shoulders, neck, arms (Jesse is stocky), a little in the thighs; nothing in the head, hands, feet ----
BULK = {"Spine2": .004, "Spine1": .010, "Spine": .024, "LeftShoulder": .018, "RightShoulder": .018, "Neck": .036,
        "LeftArm": .014, "RightArm": .014, "LeftForeArm": .010, "RightForeArm": .010, "Hips": .020,
        "LeftUpLeg": .026, "RightUpLeg": .026, "LeftLeg": .020, "RightLeg": .020}   # stocky: thick neck and traps, a deeper waist, heavy thighs and calves (the mannequin's long thin legs read as "not him")
bm.normal_update()
# the mannequin's pelvis is a big rounded shell: pull it in towards the hip centre front-to-back and side-to-side (a real, athletic pelvis)
hc = MWI @ H["Hips"]
for v in bm.verts:
    hw = W(v).get("Hips", 0) + 0.6 * (W(v).get("LeftUpLeg", 0) + W(v).get("RightUpLeg", 0)) * (1 if (MW @ v.co).z > H["LeftUpLeg"].z - 0.08 else 0)
    if hw > 0.05:
        k = min(1.0, hw)
        v.co.y = hc.y + (v.co.y - hc.y) * (1 - 0.15 * k)
        v.co.x = hc.x + (v.co.x - hc.x) * (1 - 0.03 * k)
for v in bm.verts:
    w = W(v)
    d = sum(BULK.get(k, 0) * x for k, x in w.items())
    if d > 0: v.co += v.normal * to_local(d)
bm.normal_update()

# the mannequin's knees are lumpy plates: relax the skin round the knee joint so the thighs and calves flow into each other
_kv = [v for v in bm.verts if abs(world(v).z - H["LeftLeg"].z) < 0.11 and sum(W(v).get(k, 0) for k in ("LeftLeg", "RightLeg", "LeftUpLeg", "RightUpLeg")) > 0.5]
for _ in range(14): bmesh.ops.smooth_vert(bm, verts=_kv, factor=0.6, use_axis_x=True, use_axis_y=True, use_axis_z=True)
bm.normal_update()

# ---- 1b. head, from the reference photos: subdivide the head to ~2 mm, then sculpt it with a frontal "heightmap" (brow ridge, eye sockets with lids, cheekbones,
# nose bridge / tip / wings / nostrils, philtrum, lips, chin), a squarer jaw and real ears. All likeness dimensions are in FACE (metres, or fractions of the head). ----
toe = arm.matrix_world @ arm.data.bones["mixamorig:LeftToeBase"].tail_local
foot = arm.matrix_world @ arm.data.bones["mixamorig:LeftFoot"].head_local
FWD = (toe - foot); FWD.z = 0; FWD.normalize()                     # world forward (the way he faces)
HC = H["Head"] + Vector((0, 0, 0.07))                               # centre of the skull
# the mannequin's head is big and round (0.176 wide, 0.245 deep); a man's is about 0.15 x 0.20, so scale it about the base of the skull, blending into the neck by bone weight
HEAD_SCALE = 0.92
HEAD_NARROW = 0.92   # extra squeeze side to side: Jesse's face is long and square, not wide
HEAD_LIFT = 0.022   # the mannequin's head sits straight on its shoulders: lift it a little so there is a neck to see
_piv = HC - Vector((0, 0, 0.12))
for v in bm.verts:
    hw = W(v).get("Head", 0)
    if hw < 0.1: continue
    pw = world(v); k = min(1.0, max(0.0, (hw - 0.1) / 0.5))
    _t = (pw - _piv) * HEAD_SCALE; _t.x *= HEAD_NARROW
    v.co += MWI.to_3x3() @ ((_piv + _t + Vector((0, 0, HEAD_LIFT))) - pw) * (k * k * (3 - 2 * k))
HC = _piv + (HC - _piv) * HEAD_SCALE + Vector((0, 0, HEAD_LIFT))
_hv = [world(v) for v in bm.verts if W(v).get("Head", 0) > 0.5]
FRONT = max((p - HC).dot(FWD) for p in _hv)                        # measured: face surface distance in front of the skull centre
SIDE = max(abs(p.x - HC.x) for p in _hv); TOP = max(p.z for p in _hv); CHIN = min(p.z for p in _hv if (p - HC).dot(FWD) > 0.03)
HH = TOP - CHIN
lvl = lambda f: CHIN + HH * f                                       # height on the head, 0 = chin, 1 = crown
side = Vector((-FWD.y, FWD.x, 0))
def sstep(a, b, x):                                                  # smoothstep from a to b (a may be > b for a falling edge)
    t = (x - a) / (b - a) if b != a else 1.0
    t = 0.0 if t < 0 else 1.0 if t > 1 else t
    return t * t * (3 - 2 * t)
def gauss(x, c, r): return math.exp(-((x - c) / r) ** 2)

# every number that decides the likeness lives here. a = lateral position / half head width (0 centre, 1 side), h = height (0 chin .. 1 crown). Depths are metres.
FACE = dict(
    brow_h=0.590, brow_depth=0.026, brow_rad=0.038,               # heavy brow ridge
    eye_a=0.35, eye_h=0.525, eye_ra=0.165, eye_rh=0.021, eye_recess=0.011, lid_ridge=0.0055,   # eye opening (the eyeball sits in it) and the lid ring around it
    fold_h=0.050, fold=0.0045,                                       # upper-lid fold above the eye
    cheek_a=0.64, cheek_h=0.405, cheek_depth=0.0085,                # defined cheekbones
    nose_bridge=0.017, nose_tip_h=0.362, nose_tip=0.043, nose_wing=0.0105, nostril=0.0095, nose_w=0.105,   # nose: bridge, tip, wings, nostrils
    lip_up_h=0.255, lip_up=0.0085, lip_lo_h=0.195, lip_lo=0.0115, mouth_h=0.2230, mouth_depth=0.0085, mouth_half=0.36,   # lips and the mouth line
    chin_h=0.060, chin=0.017, jaw_push=0.022, jaw_h=0.34,           # square jaw, chin mass
    ear_h=0.47, ear_out=0.013, ear_len=0.16, ear_wid=0.20, ear_f=-0.12,   # ears: how far they stand off the head, size, and where front-to-back
)
FP = FACE
def face_depth(aa, h):
    """Forward displacement (m) of the face surface at lateral aa (0..1) and height h (0..1)."""
    d = 0.0
    d += FP["brow_depth"] * gauss(h, FP["brow_h"], FP["brow_rad"]) * (1 - 0.40 * sstep(0.35, 0.95, aa))                     # brow ridge, heavier at the nose end
    d += 0.005 * gauss(h, FP["brow_h"] - 0.05, 0.05) * gauss(aa, 0.0, 0.18)                                                 # glabella
    r = math.hypot((aa - FP["eye_a"]) / FP["eye_ra"], (h - FP["eye_h"]) / FP["eye_rh"])
    d -= FP["eye_recess"] * sstep(1.0, 0.82, r)                                                                              # eye opening (recess for the eyeball)
    d += FP["lid_ridge"] * gauss(r, 1.20, 0.26)                                                                              # lids around it
    d -= FP["fold"] * gauss(h, FP["eye_h"] + FP["fold_h"], 0.011) * gauss(aa, FP["eye_a"], 0.22)                             # the crease above the upper lid (the fold)
    d += 0.5 * FP["fold"] * gauss(h, FP["eye_h"] + FP["fold_h"] - 0.022, 0.014) * gauss(aa, FP["eye_a"], 0.2)                # the lid bulging under the fold
    d += FP["cheek_depth"] * math.exp(-(((aa - FP["cheek_a"]) / 0.22) ** 2 + ((h - FP["cheek_h"]) / 0.075) ** 2))             # cheekbone
    d -= 0.0055 * math.exp(-(((aa - 0.72) / 0.16) ** 2 + ((h - 0.30) / 0.07) ** 2))                                          # hollow under the cheekbone
    nw = FP["nose_w"]
    ny = FP["nose_tip_h"]
    t = sstep(ny + 0.012, 0.60, h)                                                   # 1 at the bridge top, 0 at the tip level
    nose_prof = FP["nose_bridge"] * t + FP["nose_tip"] * (1 - t) * sstep(ny - 0.045, ny + 0.012, h)                           # the profile ramps from bridge to tip, then falls under the nose
    d += nose_prof * sstep(0.62, 0.55, h) * gauss(aa, 0.0, nw * (0.55 + 0.75 * (1 - t)))                                      # nose width grows towards the tip
    d += 0.004 * gauss(h, ny + 0.012, 0.03) * gauss(aa, 0.0, 0.07)                                                          # rounded tip
    d += FP["nose_wing"] * math.exp(-(((aa - 0.225) / 0.07) ** 2 + ((h - (ny - 0.016)) / 0.026) ** 2))                      # nostril wings
    d -= 0.0045 * math.exp(-(((aa - 0.33) / 0.05) ** 2 + ((h - (ny - 0.004)) / 0.034) ** 2))                                # groove round each wing
    d -= FP["nostril"] * math.exp(-(((aa - 0.10) / 0.040) ** 2 + ((h - (ny - 0.046)) / 0.014) ** 2))                         # nostrils
    d -= 0.0035 * gauss(aa, 0.0, 0.065) * sstep(0.24, 0.285, h) * sstep(0.345, 0.31, h)                                      # philtrum groove
    ul = FP["lip_up"] * gauss(h, FP["lip_up_h"], 0.024) * gauss(aa, 0.0, 0.30)                                               # upper lip
    ul += 0.0035 * gauss(h, FP["lip_up_h"] + 0.004, 0.012) * gauss(aa, 0.0, 0.085)                                           # the tubercle at the centre of the upper lip
    ul -= 0.0025 * gauss(h, FP["lip_up_h"] + 0.012, 0.01) * gauss(aa, 0.0, 0.03)                                             # cupid's bow notch
    d += ul
    d += FP["lip_lo"] * gauss(h, FP["lip_lo_h"], 0.026) * gauss(aa, 0.0, 0.28)                                               # lower lip (fuller)
    mh = FP["mouth_h"] - 0.006 * (aa / FP["mouth_half"]) ** 2                                                                # the mouth line sags slightly at the corners
    d -= FP["mouth_depth"] * gauss(h, mh, 0.0075) * sstep(FP["mouth_half"] + 0.06, FP["mouth_half"] - 0.12, aa)                # the mouth line
    d -= 0.0045 * gauss(h, FP["mouth_h"] - 0.012, 0.016) * gauss(aa, FP["mouth_half"] + 0.03, 0.045)                         # corner of the mouth
    d -= 0.0055 * gauss(h, 0.140, 0.020) * gauss(aa, 0.0, 0.32)                                                              # groove under the lower lip
    d += FP["chin"] * gauss(h, FP["chin_h"], 0.060) * gauss(aa, 0.0, 0.58)                                                   # chin mass
    d += 0.003 * gauss(h, 0.80, 0.08) * gauss(aa, 0.0, 0.7)                                                                  # forehead
    return d

# subdivide the head region once more (~2 mm quads), relax only the new vertices
for v in bm.verts: v.select = False
region_edges = {e for f in bm.faces if any(W(v).get("Head", 0) > 0.05 for v in f.verts) for e in f.edges}
old_verts = set(bm.verts)
bmesh.ops.subdivide_edges(bm, edges=list(region_edges), cuts=1, use_grid_fill=True)
bm.verts.ensure_lookup_table(); bm.faces.ensure_lookup_table()
new_verts = [v for v in bm.verts if v not in old_verts]
for _ in range(6): bmesh.ops.smooth_vert(bm, verts=new_verts, factor=0.5, use_axis_x=True, use_axis_y=True, use_axis_z=True)
bm.normal_update()
ear_pts = []
for v in bm.verts:
    hw = W(v).get("Head", 0)
    if hw < 0.12: continue
    pw = world(v); rel = pw - HC
    lat = rel.dot(side); f = rel.dot(FWD)
    aa = abs(lat) / SIDE; h = (pw.z - CHIN) / HH; fr = f / FRONT
    k = sstep(0.12, 0.5, hw)
    disp = FWD * (face_depth(aa, h) * sstep(0.05, 0.5, fr))
    sg = 1.0 if lat >= 0 else -1.0
    # square jaw: widen the lower face on both sides, strongest at the jaw angle (below the ear, behind the chin)
    jaw = FP["jaw_push"] * sstep(FP["jaw_h"] + 0.18, 0.08, h) * sstep(-0.1, 0.2, h) * sstep(-0.6, 0.15, fr) * sstep(0.2, 0.7, aa)
    # ears: a flap standing off the side of the head, with a scooped bowl inside the rim
    ea = ((h - FP["ear_h"]) / FP["ear_len"]); eb = ((fr - FP["ear_f"]) / FP["ear_wid"])
    eb *= 1.0 + 0.45 * sstep(-0.2, -1.0, ea)                                  # narrower at the lobe: a teardrop, not a disc
    er = math.hypot(ea, eb)
    # ears: a flap standing off the side of the head with a raised rim (helix), an inner ridge (antihelix), a scooped bowl (concha) and a small tragus
    ear = (FP["ear_out"] * sstep(1.10, 0.60, er) + 0.0075 * gauss(er, 0.92, 0.13) * sstep(-1.0, 0.1, ea)
           + 0.0045 * gauss(math.hypot(ea + 0.05, eb + 0.18), 0.55, 0.10) - 0.0070 * math.exp(-(((ea - 0.05) / 0.28) ** 2 + ((eb + 0.28) / 0.22) ** 2))
           + 0.0050 * math.exp(-(((ea + 0.12) / 0.12) ** 2 + ((eb + 0.78) / 0.10) ** 2))) * sstep(0.72, 0.86, aa)
    disp += side * sg * (jaw + ear)
    v.co += MWI.to_3x3() @ disp * k
bm.normal_update()
# skull and neck: a flatter back to the skull with the nape dropping away, a clear line where the jaw meets the neck, and the two sternocleidomastoid cords
for v in bm.verts:
    w = W(v); hw = w.get("Head", 0); nw_ = w.get("Neck", 0)
    if hw < 0.12 and nw_ < 0.2: continue
    pw = world(v); rel = pw - HC
    fr = rel.dot(FWD) / FRONT; lat = rel.dot(side); aa = abs(lat) / SIDE; h = (pw.z - CHIN) / HH
    disp = Vector()
    back = sstep(-0.35, -0.95, fr)
    disp += FWD * (0.014 * back * sstep(0.95, 0.55, h) * sstep(0.10, 0.40, h))                         # flatten the back of the skull; the occipital sits low
    if nw_ > 0.2 and hw < 0.6:
        t = (pw.z - (H["Neck"].z + 0.02)) / max(0.02, (CHIN - (H["Neck"].z + 0.02)))                    # 0 at the collar, 1 at the jaw
        if 0.0 < t < 1.15:
            fn = H["Neck"].y - pw.y                                                                      # forward of the neck axis
            dist = math.hypot(abs(lat) - (0.016 + 0.040 * t), fn - (0.045 - 0.065 * t))
            radial = Vector((pw.x - 0.0, pw.y - H["Neck"].y, 0)); radial = radial.normalized() if radial.length > 1e-6 else Vector((0, 0, 0))
            disp += radial * (0.0050 * gauss(dist, 0.0, 0.024) * sstep(-0.08, 0.02, fn + 0.01 * t))       # the cord, standing proud of the neck
    if disp.length: v.co += MWI.to_3x3() @ disp * min(1.0, max(hw, nw_ * 0.8))
bm.normal_update()

# ---- 2. regions (rest pose is a T-pose: arms along world X) ----
hem = H["Hips"].z + 0.03                     # tee hem: over the belt line (the tee and shorts overlap, so no skin shows when the pose moves the hips)
neck_line = H["Neck"].z + 0.01               # crew neck
sleeve = lambda sx, ex: sx + 0.50 * (ex - sx) # sleeve ends half-way down the upper arm
lsx, lex = H["LeftArm"].x, H["LeftForeArm"].x
rsx, rex = H["RightArm"].x, H["RightForeArm"].x
waist = hem + 0.10                           # shorts come well up under the tee hem: the pose moves the hips against the spine, so they need real overlap
knee_top = H["LeftLeg"].z + 0.10             # shorts end above the knee
# the neck, measured after bulking and lifting the head: the crew-neck opening is an ellipse a little wider than it
_nv = [world(v) for v in bm.verts if W(v).get("Neck", 0) > 0.5 and W(v).get("Head", 0) < 0.3 and 0.045 < world(v).z - H["Neck"].z < 0.07]
if len(_nv) < 20: raise RuntimeError("build_jesse: could not measure the neck (only %d Neck-weighted vertices in the collar band)" % len(_nv))
_pct = lambda vals, q: sorted(vals)[int(q * (len(vals) - 1))]
NECK_C = Vector((0.0, _pct([p.y for p in _nv], 0.5), 0))              # the neck leans forward from the shoulders: centre it on the vertices, not on the bone
NRX = _pct([abs(p.x) for p in _nv], 0.8); NRY = _pct([abs(p.y - NECK_C.y) for p in _nv], 0.8)
COLLAR_GAP = 0.006
CUT_MARGIN = 0.03   # garments are cut a little over-size, then clipped by exact planes (level hem, flat sleeve ends)
def collar_r(p): return math.hypot((p.x - NECK_C.x) / (NRX + COLLAR_GAP), (p.y - NECK_C.y) / (NRY + COLLAR_GAP))
SLEEVE_X = max(abs(sleeve(lsx, lex)), abs(sleeve(rsx, rex)))
TORSO_BONES = ("Spine", "Spine1", "Spine2", "LeftShoulder", "RightShoulder", "Neck", "LeftArm", "RightArm")
def in_tee(p, w):   # by bone weight (torso + upper arm) so the shell is continuous over the shoulders, with a round neck opening and sleeves that stop half way down the arm
    if p.z < hem - CUT_MARGIN or w.get("Head", 0) > 0.2: return False
    if any(("Hand" in k or k.endswith("ForeArm")) and x > 0.3 for k, x in w.items()): return False
    if w.get("Neck", 0) > 0.5: return False   # the neck column is not tee: the cut follows where the neck bone's influence fades, which is a smooth ring round the base of the neck
    if abs(p.x) > SLEEVE_X + CUT_MARGIN: return False
    return sum(w.get(k, 0) for k in TORSO_BONES) + w.get("Hips", 0) > 0.5
def in_shorts(p, w):   # by height over the hips and legs (not by weight: the weights blend into the spine at the waist and gave a ragged top edge); the top is cut exactly by a plane
    if not (knee_top - CUT_MARGIN <= p.z <= waist + CUT_MARGIN): return False
    if any(("Hand" in k or "Arm" in k) and x > 0.3 for k, x in w.items()): return False
    return sum(w.get(k, 0) for k in ("Hips", "LeftUpLeg", "RightUpLeg", "LeftLeg", "RightLeg", "Spine", "Spine1")) > 0.4
def in_shoe(p, w):
    return p.z < H["LeftFoot"].z + 0.035 or w.get("LeftToeBase", 0) + w.get("RightToeBase", 0) + w.get("LeftFoot", 0) + w.get("RightFoot", 0) > 0.6 and p.z < H["LeftFoot"].z + 0.06

# ---- head colouring (vertex colours: the face is ~2 mm per vertex, so skin tone, hair fade, brows, moustache / stubble and lips are painted per vertex, with soft edges) ----
def head_coords(pw):
    rel = pw - HC
    return abs(rel.dot(side)) / SIDE, (pw.z - CHIN) / HH, rel.dot(FWD) / FRONT
def hair_density(aa, h, fr):
    """0 = bare skin .. 1 = full hair. Crisp straight hairline across the forehead and a sharp, high temple line; a long skin fade round the sides and back."""
    back = sstep(0.10, -0.40, fr)                            # 0 on the face side, 1 round the back of the head
    lim = 0.775 - 0.05 * sstep(0.60, 0.84, aa) - 0.15 * back  # the line above which hair is full: dips at the temples, much lower at the nape
    width = 0.013 + 0.26 * sstep(0.05, -0.30, fr)             # crisp at the front and temples, a gradual fade over the ears and round the back
    return sstep(lim - width, lim, h)
SKIN_RGB = Vector((0.37, 0.205, 0.130))
STUB_RGB = Vector((0.050, 0.037, 0.030))
HAIR_RGB = Vector((0.045, 0.034, 0.028))
LIP_RGB = Vector((0.30, 0.115, 0.095))
def mixc(a, b, t): return a + (b - a) * max(0.0, min(1.0, t))
def grain(p):   # deterministic 0..1 speckle from the position (so rebuilds are identical)
    n = math.sin(p.x * 9100.0 + p.y * 7300.0 + p.z * 5300.0) * 43758.5453
    return n - math.floor(n)
def skin_colour(pw, w):
    c = SKIN_RGB.copy()
    hwt = w.get("Head", 0)
    if hwt < 0.2: return tuple(c)
    aa, h, fr = head_coords(pw)
    front = sstep(0.0, 0.35, fr)
    c = mixc(c, Vector((0.55, 0.26, 0.17)), 0.5 * math.exp(-(((aa - 0.62) / 0.25) ** 2 + ((h - 0.40) / 0.12) ** 2)) * front)       # warmer cheeks
    c = mixc(c, Vector((0.50, 0.22, 0.15)), 0.5 * gauss(h, FP["nose_tip_h"], 0.04) * gauss(aa, 0, 0.22) * front)                   # nose tip
    eye_r = math.hypot((aa - FP["eye_a"]) / (FP["eye_ra"] * 1.7), (h - FP["eye_h"]) / (FP["eye_rh"] * 2.2))
    c = mixc(c, Vector((0.26, 0.15, 0.11)), 0.55 * sstep(1.1, 0.4, eye_r) * front)                                                   # shaded eye sockets
    c = mixc(c, Vector((0.12, 0.075, 0.055)), 0.6 * sstep(0.12, 0.0, math.hypot((aa - 0.095) / 0.045, (h - (FP["nose_tip_h"] - 0.045)) / 0.016) - 1.0) * front)  # nostrils
    # stubble: heavy on the jaw, chin and round the mouth, lighter up the cheeks, joined to the hair by sideburns; a full moustache
    stub = sstep(0.43, 0.30, h) * (0.55 + 0.45 * sstep(0.40, 0.18, h)) * sstep(0.0, 0.30, fr)
    stub = max(stub, gauss(h, 0.305, 0.045) * sstep(0.62, 0.35, aa) * front)           # moustache over the upper lip
    stub = max(stub, 0.85 * sstep(0.05, -0.05, h - 0.02) * sstep(-0.10, -0.03, h) * sstep(0.0, 0.3, fr) * sstep(0.35, 0.6, hwt))                              # under the chin (head only: the neck stays clean)
    stub *= 0.72 + 0.56 * grain(pw)   # grainy, not a flat tint
    stub *= 1 - 0.85 * (gauss(h, FP["lip_lo_h"], 0.022) * gauss(aa, 0, 0.30) + gauss(h, FP["lip_up_h"] - 0.004, 0.015) * gauss(aa, 0, 0.30))   # lips themselves stay bare
    c = mixc(c, STUB_RGB, 0.82 * stub * sstep(0.30, 0.55, hwt))
    c = c * (1.0 - 0.28 * sstep(0.06, -0.02, h) * sstep(-0.3, 0.2, fr))   # the underside of the jaw sits in shadow
    lips = (gauss(h, FP["lip_lo_h"] + 0.002, 0.021) * 0.85 + gauss(h, FP["lip_up_h"] - 0.002, 0.016) * 0.7) * gauss(aa, 0, 0.34) * front
    c = mixc(c, LIP_RGB, lips)
    c = mixc(c, Vector((0.10, 0.075, 0.055)), 0.55 * gauss(h, FP["mouth_h"], 0.006) * sstep(0.62, 0.3, aa) * front)   # the mouth line
    brow_h = FP["brow_h"] + 0.012 + 0.03 * (1 - ((aa - 0.42) / 0.42) ** 2) - 0.012 * sstep(0.7, 1.0, aa)                           # brows arch over each eye
    c = mixc(c, Vector((0.022, 0.017, 0.014)), 0.97 * gauss(h, brow_h - 0.012, 0.021) * sstep(0.10, 0.22, aa) * sstep(0.95, 0.74, aa) * front)
    # hair fade on the scalp, sides and back: skin -> grey-brown stubble -> near-black hair
    d = hair_density(aa, h, fr)
    c = mixc(c, mixc(Vector((0.085, 0.058, 0.046)), HAIR_RGB * 1.4, sstep(0.55, 1.0, d)), min(1.0, d * 1.15) ** 0.85)
    return tuple(c)
def hair_colour(pw):
    aa, h, fr = head_coords(pw)
    d = hair_density(aa, h, fr)
    return tuple(mixc(Vector((0.11, 0.08, 0.063)), HAIR_RGB, sstep(0.5, 1.0, d)) * (0.65 + 0.7 * grain(pw)))

# ---- materials: skin and hair take their colour from the vertex colours ----
def mat(name, rgb, rough=.6, sss=0.0, sheen=0.0):
    m = bpy.data.materials.new(name); m.use_nodes = True
    b = m.node_tree.nodes["Principled BSDF"]; b.inputs["Base Color"].default_value = (*rgb, 1); b.inputs["Roughness"].default_value = rough
    if sss: b.inputs["Subsurface Weight"].default_value = sss; b.inputs["Subsurface Radius"].default_value = (1.0, .35, .2)
    if sheen: b.inputs["Sheen Weight"].default_value = sheen
    return m
def vcol_mat(name, rough, sss=0.0):
    m = mat(name, (1, 1, 1), rough, sss)
    nt = m.node_tree; b = nt.nodes["Principled BSDF"]
    ca = nt.nodes.new("ShaderNodeVertexColor"); ca.layer_name = "Col"
    nt.links.new(ca.outputs["Color"], b.inputs["Base Color"])
    return m
SKIN = vcol_mat("Skin", .62, sss=.12)
HAIR = vcol_mat("HairFade", .85)
TEE = mat("BlackTee", (.6, .05, .05) if "--debug-colour" in argv else (.022, .022, .024), .85, sheen=.25)
SHORTS = mat("BlackShorts", (.10, .13, .07), .8, sheen=.15)   # dark olive shorts (his photos: olive / navy); name kept for the pipeline
TRAINER = vcol_mat("TrainerShell", .5)   # white runners: upper, midsole, outsole, black collar and laces are painted per vertex
for m in (SKIN, HAIR, TEE, SHORTS, TRAINER): me.materials.append(m)
MI = {m.name: i for i, m in enumerate(me.materials)}

# body faces: skin, with shoes by region (a face takes a region when all its verts are in it)
tee_faces, shorts_faces, shoe_faces = [], [], []
for f in bm.faces:
    ps = [(world(v), W(v)) for v in f.verts]
    allin = lambda fn: all(fn(p, w) for p, w in ps)
    f.material_index = MI["Skin"]
    if allin(in_shoe): shoe_faces.append(f)   # the foot underneath stays skin; the trainer is a shell over it
    most = lambda fn: sum(fn(p, w) for p, w in ps) * 2 > len(ps)   # clothes take a face when most of its corners are inside: no ragged skin gaps
    if most(in_tee): tee_faces.append(f)
    if most(in_shorts): shorts_faces.append(f)   # the same faces may be under the tee as well: the shorts overlap it

def trainer_colour(pw):
    z = pw.z; ay = H["LeftFoot"].y
    c = Vector((0.80, 0.80, 0.78))                                                          # white upper
    c = mixc(c, Vector((0.62, 0.62, 0.60)), sstep(0.040, 0.030, z))                         # grey midsole
    c = mixc(c, Vector((0.020, 0.020, 0.020)), sstep(0.013, 0.007, z))                       # black outsole
    c = mixc(c, Vector((0.025, 0.025, 0.027)), sstep(H["LeftFoot"].z + 0.018, H["LeftFoot"].z + 0.030, z))   # black padded collar at the ankle
    lace = sstep(0.30, 0.50, math.sin((pw.y - ay) * 2 * math.pi / 0.016)) * sstep(0.040, 0.052, z) * sstep(0.110, 0.090, z) * sstep(ay + 0.015, ay - 0.012, pw.y) * sstep(ay - 0.115, ay - 0.095, pw.y)
    c = mixc(c, Vector((0.30, 0.30, 0.31)), lace)                                          # laces across the instep, dark against the white upper
    c = mixc(c, Vector((0.025, 0.025, 0.027)), 0.85 * sstep(ay + 0.045, ay + 0.075, pw.y) * sstep(0.02, 0.05, z) * sstep(0.12, 0.09, z))   # black heel counter
    return tuple(c)
# hair: faces that are fully in the hair give a thin shell of hair, a little fuller on top (the fade stays flush on the sides)
hair_faces = []
for f in bm.faces:
    if f.material_index != MI["Skin"]: continue
    if all(W(v).get("Head", 0) > 0.5 for v in f.verts):
        ds = [hair_density(*head_coords(world(v))) for v in f.verts]
        if min(ds) > 0.55: hair_faces.append(f)

# ---- 3. clothes: duplicate the region faces as shells, pushed out along the normal (they keep the bone weights, so they move with the body) ----
COLLAR_LOOPS = []
def hang_shape(verts, z_top, z_bot, slope, yc=0.0, nb=48, dz=0.004):
    """A tee hangs from the chest instead of following the waist: the radius at each height and bearing is at least the radius above it minus `slope` per metre (a gentle cone)."""
    nz = int((z_top - z_bot) / dz) + 2
    rb = [[0.0] * nb for _ in range(nz)]
    info = []
    for v in verts:
        p = world(v)
        if abs(p.x) > 0.19 or p.z > z_top or p.z < z_bot: continue
        dx, dy = p.x, p.y - yc; r = math.hypot(dx, dy)
        k = int((z_top - p.z) / dz); b = int((math.atan2(dy, dx) + math.pi) / (2 * math.pi) * nb) % nb
        if r > rb[k][b]: rb[k][b] = r
        info.append((v, p, r, k, b))
    hang = [row[:] for row in rb]
    for k in range(1, nz):
        for b in range(nb): hang[k][b] = max(hang[k][b], hang[k - 1][b] - slope * dz)
    for k in range(nz):   # smooth over bearing so the cone has no spikes
        row = hang[k]; hang[k] = [(row[b - 1] + 2 * row[b] + row[(b + 1) % nb]) / 4 for b in range(nb)]
    for v, p, r, k, b in info:
        t = hang[k][b]
        if t > r and r > 1e-6:
            sc = t / r; v.co = MWI @ Vector((p.x * sc, yc + (p.y - yc) * sc, p.z))

def shell(faces, offset, mat_name, collar=False, cuts=(), smooth=0, loose=0, hang=False):
    """Duplicate faces as a shell pushed out along the normals (offset in metres, or a function of the world position).
    `cuts`: (world point, world normal) planes; geometry on the normal's side is removed, so hems and sleeve ends are exact.
    `collar`: snap the cut edge round the neck opening onto its ellipse. `smooth`: Laplacian passes over the interior to iron out grid noise."""
    res = bmesh.ops.duplicate(bm, geom=faces)
    new_faces = [g for g in res["geom"] if isinstance(g, bmesh.types.BMFace)]
    new_verts = {v for f in new_faces for v in f.verts}
    for f in new_faces: f.material_index = MI[mat_name]
    off = offset if callable(offset) else (lambda p: offset)
    if hang: hang_shape(new_verts, 1.36, hem - 0.04, 0.18)
    if loose:   # cloth hangs straight over concave places (waist, rib-cage step) instead of following the body: smooth a copy heavily and only ever push OUT to it
        base = {v: v.co.copy() for v in new_verts}
        inner0 = [v for v in new_verts if not any(e.is_boundary for e in v.link_edges)]
        for _ in range(loose): bmesh.ops.smooth_vert(bm, verts=inner0, factor=0.8, use_axis_x=True, use_axis_y=True, use_axis_z=True)
        extra = {v: max(0.0, (v.co - base[v]).dot(v.normal)) for v in new_verts}
        for v in new_verts: v.co = base[v]
    else:
        extra = {v: 0.0 for v in new_verts}
    for v in new_verts: v.co += v.normal * (to_local(off(world(v))) + extra[v])
    for _ in range(smooth):
        inner = [v for v in new_verts if not any(e.is_boundary for e in v.link_edges)]
        bmesh.ops.smooth_vert(bm, verts=inner, factor=0.5, use_axis_x=True, use_axis_y=True, use_axis_z=True)
    for co, n in cuts:
        geom = [f for f in bm.faces if f.material_index == MI[mat_name]]
        geom = geom + list({e for f in geom for e in f.edges}) + list({v for f in geom for v in f.verts})
        nl = (MW.to_3x3().inverted_safe().transposed() @ n).normalized()
        bmesh.ops.bisect_plane(bm, geom=geom, dist=1e-6, plane_co=MWI @ Vector(co), plane_no=nl, clear_outer=True)
    if collar:   # relax the neck opening along the cut so the grid's sawtooth becomes a smooth curve; a rib collar is built over it afterwards
        cv = [v for v in {v for f in bm.faces if f.material_index == MI[mat_name] for v in f.verts}
              if any(e.is_boundary for e in v.link_edges) and world(v).z > 1.40 and abs(world(v).x) < 0.16]
        cset = set(cv)
        for _ in range(30):
            newp = {}
            for v in cv:
                nb = [e.other_vert(v) for e in v.link_edges if e.is_boundary and e.other_vert(v) in cset]
                if len(nb) == 2: newp[v] = (nb[0].co + nb[1].co) * 0.25 + v.co * 0.5
            for v, c in newp.items(): v.co = c
        COLLAR_LOOPS.clear()
        left = set(cv)
        while left:   # order each boundary loop so a curve can be run along it
            start = next(iter(left)); loop = [start]; left.discard(start); cur = start
            while True:
                nxt = [e.other_vert(cur) for e in cur.link_edges if e.is_boundary and e.other_vert(cur) in left]
                if not nxt: break
                cur = nxt[0]; loop.append(cur); left.discard(cur)
            if len(loop) > 8: COLLAR_LOOPS.append([world(v) for v in loop])
    bm.faces.ensure_lookup_table()
    if "--debug-boundary" in argv:   # boundary loops of the shell: a clean garment has just its hem / sleeve ends / collar; anything else is a hole
        bedges = {e for f in bm.faces if f.material_index == MI[mat_name] for e in f.edges if e.is_boundary}
        seen = set(); loops = []
        for e in bedges:
            if e in seen: continue
            stack = [e]; comp = []
            while stack:
                x = stack.pop()
                if x in seen: continue
                seen.add(x); comp.append(x)
                for v in x.verts: stack.extend(o for o in v.link_edges if o in bedges and o not in seen)
            pts = [world(v) for x in comp for v in x.verts]; c = sum(pts, Vector()) / len(pts)
            loops.append((len(comp), tuple(round(t, 3) for t in c)))
        zs = [world(v).z for f in bm.faces if f.material_index == MI[mat_name] for v in f.verts]
        print("BOUNDARY", mat_name, "z-range", round(min(zs), 3), round(max(zs), 3), "hem", round(hem, 3), "waist", round(waist, 3), sorted(loops, reverse=True))
    return [f for f in bm.faces if f.material_index == MI[mat_name]]
bm.normal_update()
if "--no-tee" not in argv:
    shell(tee_faces, lambda p: (0.004 + 0.011 * sstep(1.1, 1.9, collar_r(p))), "BlackTee", collar=True, smooth=3, loose=60, hang=True,
          cuts=(((0, 0, hem), Vector((0, 0, -1))), ((SLEEVE_X, 0, 0), Vector((1, 0, 0))), ((-SLEEVE_X, 0, 0), Vector((-1, 0, 0)))))
    # the collar: a rib-knit band along the smoothed neck opening (hides the cut edge and reads as a crew neck)
    for k_, pts in enumerate(COLLAR_LOOPS):
        cu = bpy.data.curves.new(f"collar{k_}", "CURVE"); cu.dimensions = "3D"; cu.bevel_depth = 0.0065; cu.bevel_resolution = 3; cu.use_fill_caps = False
        sp = cu.splines.new("POLY"); sp.points.add(len(pts) - 1); sp.use_cyclic_u = True
        for i_, p_ in enumerate(pts): sp.points[i_].co = (p_.x, p_.y, p_.z, 1.0)
        cob = bpy.data.objects.new(f"CollarRib{k_}", cu); bpy.context.scene.collection.objects.link(cob); cob.data.materials.append(TEE)
        bpy.context.view_layer.objects.active = cob; cob.select_set(True); bpy.ops.object.convert(target="MESH"); cob.select_set(False)
        vg = cob.vertex_groups.new(name="mixamorig:Spine2"); vg.add(range(len(cob.data.vertices)), 1.0, "REPLACE")
        mw_ = cob.matrix_world.copy(); cob.parent = arm; cob.matrix_world = mw_
        mm_ = cob.modifiers.new("Armature", "ARMATURE"); mm_.object = arm
shell(shorts_faces, 0.008, "BlackShorts", smooth=3, cuts=(((0, 0, knee_top), Vector((0, 0, -1))), ((0, 0, waist), Vector((0, 0, 1)))))
# the body under the garments is never seen: sink it a little so skinning at the shoulders and hips (the pose rotates the arm against the spine) can't poke through the cloth
def under(faces, fade):
    for v in {v for f in faces for v in f.verts}:
        k = fade(world(v))
        if k > 0: v.co -= v.normal * to_local(0.009 * k)
if "--no-tee" not in argv: under(tee_faces, lambda p: min(sstep(hem, hem + 0.03, p.z), sstep(SLEEVE_X, SLEEVE_X - 0.03, abs(p.x)), sstep(1.0, 1.4, collar_r(p))))
under(shorts_faces, lambda p: sstep(knee_top, knee_top + 0.03, p.z))
shell(shoe_faces, lambda p: 0.010 + 0.011 * sstep(0.036, 0.010, p.z), "TrainerShell", smooth=2)
def hair_len(p):   # a little fuller on top (slightly longer hair), flush on the sides and nape
    aa, h, fr = head_coords(p)
    return 0.0030 + 0.0070 * sstep(0.80, 0.97, h) * sstep(-0.9, 0.2, fr) + 0.0016 * (grain(p) - 0.5)   # a little fuller on top, with a fine grain so it isn't a smooth helmet
shell(hair_faces, hair_len, "HairFade")

# per-vertex colours (linear): skin and hair from the head colouring, everything else white (it has its own flat material colour)
bm.faces.ensure_lookup_table()
col = bm.loops.layers.float_color.new("Col")
for f in bm.faces:
    for l in f.loops:
        v = l.vert
        if f.material_index == MI["Skin"]: c = skin_colour(world(v), W(v))
        elif f.material_index == MI["HairFade"]: c = hair_colour(world(v))
        elif f.material_index == MI["TrainerShell"]: c = trainer_colour(world(v))
        else: c = (1.0, 1.0, 1.0)
        l[col] = (*c, 1.0)

# where the eyes go: after sculpting, the bottom of each eye opening (so the eyeball sits in the socket, a little proud of its floor)
EYES = []
for sg in (1, -1):
    ec = HC + side * sg * SIDE * FP["eye_a"] + Vector((0, 0, lvl(FP["eye_h"]) - HC.z))
    near = [world(v) for v in bm.verts if W(v).get("Head", 0) > 0.5 and abs((world(v) - ec).dot(side)) < 0.004 and abs(world(v).z - ec.z) < 0.004 and (world(v) - HC).dot(FWD) > 0.03]
    EYES.append((sg, ec, min((p - HC).dot(FWD) for p in near)))


# ---- 4. tattoos: an image atlas authored here (deterministic, numpy) and mapped with real UVs: each arm is unwrapped as a cylinder along its bones (the seam under the arm),
# the torso is projected from the front. The atlas multiplies the skin colour, so ink reads as dark grey-black under the skin tone. ----
ATLAS_N = 1024
PITCH = 0.0012                                                     # metres per atlas pixel
ARM_W = 236                                                        # arm band width in px (circumference 0.283 m at ~4.5 cm radius)
ARM_R = ARM_W * PITCH / (2 * math.pi)
ARM_PAD = 12
BANDS = {"Left": (20, 20), "Right": (300, 20)}                     # (x0, y0) of each arm band; length 0.78 m = 650 px
ARM_LEN_PX = 650
TORSO_BAND = (590, 20, 380, 420)                                   # x0, y0, w, h (px); x centred on the spine, z from TORSO_Z0 up
TORSO_Z0 = 1.04
WHITE_UV = (0.995, 0.995)                                          # untouched white corner: everything that is not tattooed maps here
def bone_tail(n): return arm.matrix_world @ arm.data.bones["mixamorig:" + n].tail_local
def arm_chain(side_name):
    pts = [H[side_name + "Arm"], H[side_name + "ForeArm"], H[side_name + "Hand"], head("%sHandMiddle1" % side_name), bone_tail("%sHandMiddle4" % side_name)]
    return pts
CHAINS = {sn: arm_chain(sn) for sn in ("Left", "Right")}
CHAIN_S = {}
for sn, pts in CHAINS.items():
    acc = [0.0]
    for a_, b_ in zip(pts, pts[1:]): acc.append(acc[-1] + (b_ - a_).length)
    CHAIN_S[sn] = acc
def arm_uv(sn, p):
    """(arc position in px from the seam, distance along the arm in px, bool inside the band) for point p, plus a continuous bearing."""
    pts = CHAINS[sn]; best = None
    for i in range(len(pts) - 1):
        a_, b_ = pts[i], pts[i + 1]; d = b_ - a_; L = d.length
        t = max(0.0, min(1.0, (p - a_).dot(d) / (L * L))); q = a_ + d * t; dist = (p - q).length
        if best is None or dist < best[0]: best = (dist, i, t, q, d / L)
    dist, i, t, q, d = best
    s = CHAIN_S[sn][i] + t * (pts[i + 1] - pts[i]).length
    up = Vector((0, 0, 1)); up = (up - d * up.dot(d)).normalized(); bn = d.cross(up)
    r = p - q
    theta = math.atan2(r.dot(bn), r.dot(up))                      # 0 = straight up, +-pi = under the arm: the seam
    return theta, s
def ink_uv(face_loops_pos, region, sn=None):
    out = []
    if region == "arm":
        res = [arm_uv(sn, p) for p in face_loops_pos]
        th0 = res[0][0]
        x0, y0 = BANDS[sn]
        for th, s in res:
            if th - th0 > math.pi: th -= 2 * math.pi
            elif th0 - th > math.pi: th += 2 * math.pi
            px = x0 + (th + math.pi) / (2 * math.pi) * ARM_W
            py = y0 + s / PITCH
            out.append((px / ATLAS_N, py / ATLAS_N))
    elif region == "torso":
        x0, y0, w_, h_ = TORSO_BAND
        for p in face_loops_pos:
            out.append(((x0 + w_ / 2 + p.x / PITCH) / ATLAS_N, (y0 + (p.z - TORSO_Z0) / PITCH) / ATLAS_N))
    return out

def wave_field(seed, n=28):
    rng = np.random.default_rng(seed)
    dirs = rng.normal(size=(n, 3)); dirs /= np.linalg.norm(dirs, axis=1, keepdims=True)
    freqs = np.exp(rng.uniform(math.log(1.0), math.log(6.0), n)); ph = rng.uniform(0, 2 * math.pi, n); amp = 1.0 / freqs ** 0.6
    return dirs, freqs, ph, amp / amp.sum()
def fbm(field, x, y, z, scale):
    dirs, freqs, ph, amp = field
    acc = np.zeros_like(x)
    for dvec, f_, p_, a_ in zip(dirs, freqs, ph, amp):
        acc += a_ * np.sin((dvec[0] * x + dvec[1] * y + dvec[2] * z) * f_ * scale + p_)
    return 0.5 + 0.9 * acc                                         # roughly 0..1
def ss_np(a, b, x):
    t = np.clip((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t)
def raster_text(text, fontpath, size, centre_px, mask, scale_px):
    """Rasterise a text curve (flattened to triangles) into `mask` (rows = atlas y). `size` in metres."""
    cu = bpy.data.curves.new("inktext", "FONT"); cu.body = text; cu.size = size; cu.align_x = "CENTER"; cu.font = bpy.data.fonts.load(fontpath)
    ob = bpy.data.objects.new("inktext", cu); bpy.context.scene.collection.objects.link(ob)
    bpy.context.view_layer.update()
    me2 = ob.evaluated_get(bpy.context.evaluated_depsgraph_get()).to_mesh()
    bm2 = bmesh.new(); bm2.from_mesh(me2); bmesh.ops.triangulate(bm2, faces=bm2.faces[:])
    cx, cy = centre_px
    for f in bm2.faces:
        tri = np.array([[cx + v.co.x / PITCH * scale_px, cy + v.co.y / PITCH * scale_px] for v in f.verts])
        x0_, y0_ = np.floor(tri.min(0)).astype(int); x1_, y1_ = np.ceil(tri.max(0)).astype(int)
        xs, ys = np.meshgrid(np.arange(max(x0_, 0), min(x1_ + 1, mask.shape[1])), np.arange(max(y0_, 0), min(y1_ + 1, mask.shape[0])))
        if xs.size == 0: continue
        (ax, ay), (bx, by), (cx2, cy2) = tri
        den = (by - cy2) * (ax - cx2) + (cx2 - bx) * (ay - cy2)
        if abs(den) < 1e-9: continue
        l1 = ((by - cy2) * (xs + .5 - cx2) + (cx2 - bx) * (ys + .5 - cy2)) / den
        l2 = ((cy2 - ay) * (xs + .5 - cx2) + (ax - cx2) * (ys + .5 - cy2)) / den
        inside = (l1 >= 0) & (l2 >= 0) & (1 - l1 - l2 >= 0)
        mask[ys[inside], xs[inside]] = 1.0
    bm2.free(); ob.evaluated_get(bpy.context.evaluated_depsgraph_get()).to_mesh_clear(); bpy.data.objects.remove(ob); bpy.data.curves.remove(cu)

def make_ink_atlas():
    N = ATLAS_N
    atlas = np.ones((N, N), dtype=np.float32)                        # 1 = bare skin
    yy, xx = np.mgrid[0:N, 0:N]
    for sn, seed in (("Left", 11), ("Right", 23)):
        x0, y0 = BANDS[sn]
        f1, f2, f3 = wave_field(seed), wave_field(seed + 100), wave_field(seed + 200)
        cols = np.arange(x0 - ARM_PAD, x0 + ARM_W + ARM_PAD)
        rows = np.arange(y0, y0 + ARM_LEN_PX)
        CX, RY = np.meshgrid(cols, rows)
        th = (CX - x0) / ARM_W * 2 * math.pi - math.pi                    # bearing round the arm: the band wraps seamlessly (noise is evaluated on a cylinder)
        s = (RY - y0) * PITCH                                              # metres along the arm from the shoulder
        px_, py_, pz_ = ARM_R * np.cos(th), ARM_R * np.sin(th), s
        smoke = fbm(f1, px_, py_, pz_, 14.0)                                # large masses of black-and-grey shading (smoke, clouds, portraits)
        mid = fbm(f2, px_, py_, pz_, 55.0)
        fine = fbm(f3, px_, py_, pz_, 140.0)
        tone = 0.30 + 0.40 * ss_np(0.25, 0.75, smoke) * (0.7 + 0.5 * mid)  # dark grey, lighter where the shading thins out (black-and-grey realism, not solid black)
        ridge = lambda fld, sc: 1.0 - np.abs(2 * fbm(fld, px_, py_, pz_, sc) - 1.0)
        lines = np.maximum(ss_np(0.86, 0.95, ridge(f2, 40.0)), 0.8 * ss_np(0.88, 0.96, ridge(f3, 95.0)))   # engraved black linework (scrolls, feathers, script)
        stipple = fbm(f3, px_ + 1.7, py_, pz_, 300.0)                                                      # fine stipple shading
        ink = tone * (1 - 0.60 * lines) * (0.78 + 0.44 * stipple)
        gaps = ss_np(0.80, 0.93, fine) * 0.35 + ss_np(0.70, 0.84, fbm(f1, px_ + 3, py_, pz_, 30.0)) * 0.55  # patches of bare skin where the design opens up
        cover = np.clip(0.97 - gaps, 0, 1)
        hand = ss_np(CHAIN_S[sn][2] - 0.02, CHAIN_S[sn][2] + 0.02, s)       # beyond the wrist: sparser
        fingers = ss_np(CHAIN_S[sn][3] + 0.01, CHAIN_S[sn][3] + 0.04, s)
        cover = cover * (1 - 0.30 * hand) * (1 - 0.80 * fingers)
        val = 1.0 - cover * (1.0 - np.clip(ink, 0.10, 0.88))
        atlas[y0:y0 + ARM_LEN_PX, x0 - ARM_PAD:x0 + ARM_W + ARM_PAD] = val.astype(np.float32)
    # torso: a chest piece over both pecs and shoulders, a script across the stomach
    x0, y0, w_, h_ = TORSO_BAND
    X = (np.arange(x0, x0 + w_) - (x0 + w_ / 2)) * PITCH
    Z = TORSO_Z0 + (np.arange(y0, y0 + h_) - y0) * PITCH
    XM, ZM = np.meshgrid(X, Z)
    f1, f2 = wave_field(31), wave_field(131)
    zero = np.zeros_like(XM)
    pec = np.maximum(1 - (((np.abs(XM) - 0.095) / 0.115) ** 2 + ((ZM - 1.385) / 0.105) ** 2), 0)
    shoulder = np.maximum(1 - (((np.abs(XM) - 0.17) / 0.07) ** 2 + ((ZM - 1.45) / 0.10) ** 2), 0)
    shape = np.clip(pec * 2.2 + shoulder * 1.5, 0, 1) * (0.6 + 0.8 * fbm(f1, XM, ZM, zero, 14.0))
    cover = ss_np(0.35, 0.6, shape)
    tone = 0.24 + 0.24 * fbm(f2, XM, ZM, zero, 30.0)
    ink = 1.0 - cover * (1 - np.clip(tone, 0.1, 0.7))
    atlas[y0:y0 + h_, x0:x0 + w_] = np.minimum(atlas[y0:y0 + h_, x0:x0 + w_], ink.astype(np.float32))
    script = np.zeros((N, N), dtype=np.float32)
    font = next((p_ for p_ in ("/System/Library/Fonts/Supplemental/Apple Chancery.ttf", "/System/Library/Fonts/Supplemental/Brush Script.ttf") if os.path.exists(p_)), None)
    if font is None: raise RuntimeError("build_jesse: no script font found for the stomach tattoo (looked for Apple Chancery / Brush Script)")
    raster_text("In God's Hands", font, 0.055, (x0 + w_ / 2, y0 + (1.12 - TORSO_Z0) / PITCH), script, 1.0)
    atlas = np.minimum(atlas, 1.0 - 0.78 * script)
    atlas[int(N * 0.985):, :] = 1.0                                   # the white strip every untattooed vertex maps to
    img = bpy.data.images.new("JesseInk", N, N, alpha=False)
    rgba = np.repeat(atlas[..., None], 3, axis=2); rgba = np.concatenate([rgba, np.ones((N, N, 1), np.float32)], axis=2)
    img.pixels.foreach_set(rgba.ravel()); img.pack()
    return img, atlas
INK_IMG, INK_ATLAS = make_ink_atlas()
if "--dump-atlas" in argv:
    INK_IMG.filepath_raw = argv[argv.index("--dump-atlas") + 1]; INK_IMG.file_format = "PNG"; INK_IMG.save()
# the skin's base colour = vertex colour x ink atlas (multiply): bare skin maps to white, so only the tattoos darken it
_nt = SKIN.node_tree; _bsdf = _nt.nodes["Principled BSDF"]
_vc = next(n for n in _nt.nodes if n.bl_idname == "ShaderNodeVertexColor")
_ti = _nt.nodes.new("ShaderNodeTexImage"); _ti.image = INK_IMG; _ti.interpolation = "Linear"; _ti.extension = "REPEAT"
_mx = _nt.nodes.new("ShaderNodeMix"); _mx.data_type = "RGBA"; _mx.blend_type = "MULTIPLY"; _mx.inputs[0].default_value = 1.0
_nt.links.new(_vc.outputs["Color"], _mx.inputs[6]); _nt.links.new(_ti.outputs["Color"], _mx.inputs[7]); _nt.links.new(_mx.outputs[2], _bsdf.inputs["Base Color"])

# unwrap: per-face regions
bm.normal_update()
uvl = bm.loops.layers.uv.new("UVMap")
for f in bm.faces:
    if f.material_index != MI["Skin"]:
        for l in f.loops: l[uvl].uv = WHITE_UV
        continue
    ps = [world(v) for v in f.verts]; ws = [W(v) for v in f.verts]
    avg = lambda keys: sum(sum(w.get(k, 0) for k in keys) for w in ws) / len(ws)
    la = avg(("LeftArm", "LeftForeArm", "LeftHand")) + avg(["Left" + n for n in ("HandThumb1", "HandThumb2", "HandThumb3", "HandIndex1", "HandIndex2", "HandIndex3", "HandMiddle1", "HandMiddle2", "HandMiddle3", "HandRing1", "HandRing2", "HandRing3", "HandPinky1", "HandPinky2", "HandPinky3")])
    ra = avg(("RightArm", "RightForeArm", "RightHand")) + avg(["Right" + n for n in ("HandThumb1", "HandThumb2", "HandThumb3", "HandIndex1", "HandIndex2", "HandIndex3", "HandMiddle1", "HandMiddle2", "HandMiddle3", "HandRing1", "HandRing2", "HandRing3", "HandPinky1", "HandPinky2", "HandPinky3")])
    tor = avg(("Spine", "Spine1", "Spine2", "LeftShoulder", "RightShoulder", "Hips"))
    centre = sum(ps, Vector()) / len(ps)
    uvs = None
    if (la > 0.5 or ra > 0.5):
        sn = "Left" if la >= ra else "Right"
        uvs = ink_uv(ps, "arm", sn)
    elif tor > 0.5 and centre.y < H["Spine2"].y + 0.02 and abs(centre.x) < 0.22 and TORSO_Z0 < centre.z < TORSO_Z0 + 0.42:
        # front of the torso only (the back stays bare)
        n = f.normal.copy()
        uvs = ink_uv(ps, "torso") if (MW.to_3x3() @ n).normalized().dot(FWD) > 0.2 else None
    for l, uv in zip(f.loops, uvs or [WHITE_UV] * len(f.loops)): l[uvl].uv = uv

bm.to_mesh(me); bm.free(); me.update()
# drop the imported mannequin materials (now unused)
used = {p.material_index for p in me.polygons}
for i in reversed(range(len(me.materials))):
    if i not in used and me.materials[i].name not in MI: pass
bpy.ops.object.select_all(action="DESELECT"); body.select_set(True); bpy.context.view_layer.objects.active = body
bpy.ops.object.material_slot_remove_unused()
am = body.modifiers.new("Armature", "ARMATURE"); am.object = arm

# ---- 3b. eyes: a textured ball (sclera, limbal ring, fibred iris, pupil) in each socket, so the iris and pupil are smooth at any size; skinned to the head ----
EYE_R = 0.0125
def make_eye_image():
    w_, h_ = 1024, 512
    U, V = np.meshgrid((np.arange(w_) + 0.5) / w_, (np.arange(h_) + 0.5) / h_)
    deg = np.degrees((1.0 - V) * math.pi)                       # angle from the front pole (the front of the eye is the north pole of the UV sphere)
    ang = U * 2 * math.pi
    fibres = 0.5 + 0.5 * np.sin(ang * 53 + np.sin(ang * 11) * 2.2)
    def ss(a_, b_, x):
        t = np.clip((x - a_) / (b_ - a_), 0, 1); return t * t * (3 - 2 * t)
    sclera = np.stack([0.90 + 0 * U, 0.85 + 0 * U, 0.80 + 0 * U], -1) * (1.0 - 0.10 * ss(40, 80, deg))[..., None]
    iris = np.stack([0.26 + 0.14 * fibres, 0.15 + 0.09 * fibres, 0.07 + 0.04 * fibres], -1)
    iris = iris * (0.75 + 0.5 * ss(20, 10, deg))[..., None]       # lighter collarette round the pupil
    img = sclera * (1 - ss(29.5, 28.0, deg))[..., None] + iris * ss(29.5, 28.0, deg)[..., None]
    img = img * (1.0 - 0.55 * np.exp(-((deg - 28.5) / 1.6) ** 2))[..., None]                 # dark limbal ring
    img = img * ss(9.0, 11.0, deg)[..., None] + np.array([0.01, 0.01, 0.01]) * (1 - ss(9.0, 11.0, deg))[..., None]   # pupil
    out = np.concatenate([img, np.ones((h_, w_, 1))], -1).astype(np.float32)
    im = bpy.data.images.new("JesseEye", w_, h_, alpha=False)
    im.pixels.foreach_set(out.ravel()); im.pack()
    return im
EYE_IMG = make_eye_image()
EYE_MAT = bpy.data.materials.new("Eye"); EYE_MAT.use_nodes = True
_nt = EYE_MAT.node_tree; _b = _nt.nodes["Principled BSDF"]; _b.inputs["Roughness"].default_value = 0.14
_tex = _nt.nodes.new("ShaderNodeTexImage"); _tex.image = EYE_IMG; _nt.links.new(_tex.outputs["Color"], _b.inputs["Base Color"])
ROT_Z_TO_FWD = Matrix.Rotation(math.radians(90), 4, "X")           # the sphere's pole (+Z) turns to face -Y, the way he looks
for sg, ec, f_floor in EYES:
    bme = bmesh.new()
    bmesh.ops.create_uvsphere(bme, u_segments=64, v_segments=36, radius=EYE_R)
    bmesh.ops.rotate(bme, verts=bme.verts, cent=(0, 0, 0), matrix=ROT_Z_TO_FWD.to_3x3())
    uvl = bme.loops.layers.uv.new("UVMap")                                  # explicit UVs: u = bearing round the pupil axis, v = angle from the front pole (1 = straight ahead)
    for f in bme.faces:
        us = []
        for l in f.loops:
            d = l.vert.co.normalized()
            phi = math.acos(max(-1.0, min(1.0, d.dot(FWD))))
            u = math.atan2(d.dot(Vector((0, 0, 1))), d.dot(side)) / (2 * math.pi) + 0.5
            us.append((l, u, 1.0 - phi / math.pi))
        u0 = us[0][1]
        for l, u, v_ in us:
            if u - u0 > 0.5: u -= 1.0
            elif u0 - u > 0.5: u += 1.0
            l[uvl].uv = (u, v_)
    bmesh.ops.translate(bme, vec=ec + FWD * (f_floor + FP["eye_recess"] - 0.0012 - EYE_R), verts=bme.verts)   # bake the position into the verts: the object stays at the origin, like the mitts, so the armature deforms it correctly
    for f in bme.faces: f.smooth = True
    meye = bpy.data.meshes.new(f"Eye{'L' if sg > 0 else 'R'}"); bme.to_mesh(meye); bme.free()
    meye.materials.append(EYE_MAT)
    oe = bpy.data.objects.new(meye.name, meye); bpy.context.scene.collection.objects.link(oe)
    vg = oe.vertex_groups.new(name="mixamorig:Head"); vg.add(range(len(meye.vertices)), 1.0, "REPLACE")
    mw = oe.matrix_world.copy(); oe.parent = arm; oe.matrix_world = mw
    me_ = oe.modifiers.new("Armature", "ARMATURE"); me_.object = arm

# ---- 4. his mitts: procedural Freddie / Roach micro mitts (no outside assets): a flattened, curved ellipsoid with an orange striking face, green palm side, white piping and stitching,
# and the name in white across the top; one on each hand, pad face out from the palm, skinned 100% to the hand bone so every pose and animation carries them ----
MITT_A, MITT_B, MITT_C = 0.080, 0.120, 0.026                     # semi-axes (m): width, length, thickness
MITT_BEND = 2.1                                                   # how far the ends curl round the fist
MITT_COL = {"orange": (.60, .17, .02), "green": (.06, .36, .09), "white": (.80, .78, .74), "black": (.018, .018, .018)}
def mitt_surface_z(x, y):
    q = 1.0 - (x / MITT_A) ** 2 - (y / MITT_B) ** 2
    return MITT_C * max(q, 0.0) ** 0.31 - MITT_BEND * y * y   # (sqrt(q) ** 0.62: the same flattened profile as the mesh)
def build_mitt(name, label):
    m = bmesh.new()
    bmesh.ops.create_uvsphere(m, u_segments=64, v_segments=32, radius=1.0)
    for v in m.verts:
        x, y, z = v.co.x * MITT_A, v.co.y * MITT_B, v.co.z * MITT_C
        z = math.copysign(abs(z / MITT_C) ** 0.62 * MITT_C, z)           # squarer in section: a flatter striking face with a rounded edge, not an egg
        v.co = Vector((x, y, z - MITT_BEND * y * y))
    for f in m.faces: f.smooth = True
    me_m = bpy.data.meshes.new(name)
    col_m = m.loops.layers.float_color.new("Col")
    for f in m.faces:
        for l in f.loops:
            p = l.vert.co; zc = p.z + MITT_BEND * p.y * p.y     # height above the mid-plane of the ellipsoid
            ang = math.atan2(p.y / MITT_B, p.x / MITT_A)
            rim = math.exp(-(zc / 0.0045) ** 2)
            c = Vector(MITT_COL["orange"]) if zc > 0 else Vector(MITT_COL["green"])
            dash = 1.0 if math.sin(ang * 46.0) > 0.15 else 0.0
            c = mixc(c, Vector(MITT_COL["white"]), min(1.0, rim * 1.3))                          # white piping all round the edge
            c = mixc(c, Vector(MITT_COL["black"]), rim * dash * 0.9 * (1.0 if abs(zc) < 0.0035 else 0.0))   # stitch dashes along it
            if zc > 0:   # the stitched seam just inside the edge on the orange face, and the thumb/finger bar on the green palm side
                c = mixc(c, Vector(MITT_COL["white"]), 0.8 * math.exp(-((math.hypot(p.x / MITT_A, p.y / MITT_B) - 0.80) / 0.035) ** 2) * (1.0 if math.sin(ang * 60.0) > 0.0 else 0.0))
            else:
                c = mixc(c, Vector(MITT_COL["black"]), 0.55 * math.exp(-((p.y + 0.03) / 0.012) ** 2) * (1.0 if abs(p.x) < 0.05 else 0.0))   # the palm bar
            l[col_m] = (c.x, c.y, c.z, 1.0)
    m.to_mesh(me_m); m.free()
    o = bpy.data.objects.new(name, me_m); bpy.context.scene.collection.objects.link(o)
    o.data.materials.append(MITT_MAT)
    # the name in white across the top, lying on the dome
    cu = bpy.data.curves.new(name + "_txt", "FONT"); cu.body = label; cu.size = 0.026; cu.extrude = 0.0006; cu.align_x = "CENTER"; cu.align_y = "CENTER"; cu.space_character = 1.05
    fp = "/System/Library/Fonts/Supplemental/Impact.ttf"
    if not os.path.exists(fp): raise RuntimeError("build_jesse: Impact.ttf missing (needed for the mitt lettering)")
    cu.font = bpy.data.fonts.load(fp)
    to = bpy.data.objects.new(name + "_txt", cu); bpy.context.scene.collection.objects.link(to)
    bpy.context.view_layer.update()
    tm = to.evaluated_get(bpy.context.evaluated_depsgraph_get()).to_mesh()
    bt = bmesh.new(); bt.from_mesh(tm)
    for v in bt.verts:   # the text runs along the mitt's long axis (local Y); drape it over the dome
        tx, ty = v.co.x, v.co.y
        px, py = ty, tx
        v.co = Vector((px, py, mitt_surface_z(px, py) + 0.0012 + v.co.z))
    tcol = bt.loops.layers.float_color.new("Col")
    for f in bt.faces:
        for l in f.loops: l[tcol] = (*MITT_COL["white"], 1.0)
    tmesh = bpy.data.meshes.new(name + "_txtm"); bt.to_mesh(tmesh); bt.free()
    to.evaluated_get(bpy.context.evaluated_depsgraph_get()).to_mesh_clear(); bpy.data.objects.remove(to); bpy.data.curves.remove(cu)
    tmesh.materials.append(MITT_MAT)
    ot = bpy.data.objects.new(name + "_text", tmesh); bpy.context.scene.collection.objects.link(ot)
    bpy.ops.object.select_all(action="DESELECT")
    bpy.context.view_layer.objects.active = o; o.select_set(True); ot.select_set(True); bpy.ops.object.join(); o.select_set(False)
    return o
MITT_MAT = vcol_mat("MittLeather", .42)
if "--no-mitts" not in argv:
    def bone_head(n): return arm.matrix_world @ arm.data.bones["mixamorig:" + n].head_local
    for side_name, label in (("Right", "ROACH"), ("Left", "FREDDIE")):
        o = build_mitt("Mitt_" + side_name, label)
        # palm frame from the rest skeleton: fingers along hand->middle knuckle, palm normal from the thumb side (palms face down in the T-pose)
        hnd = bone_head(side_name + "Hand"); mid = bone_head(side_name + "HandMiddle1"); th = bone_head(side_name + "HandThumb1")
        fing = (mid - hnd).normalized(); nrm = fing.cross((th - hnd).normalized()).normalized()
        if nrm.z > 0: nrm = -nrm                                      # palm side
        x = fing.cross(nrm).normalized()
        rot = Matrix((x, fing, nrm)).transposed().to_4x4()            # mitt local X, Y (long axis) and Z (orange face) onto the hand: orange out, green against the palm
        o.matrix_world = Matrix.Translation(hnd + fing * 0.06 + nrm * 0.050) @ rot
        bpy.ops.object.select_all(action="DESELECT")
        bpy.context.view_layer.objects.active = o; o.select_set(True)
        bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
        # skin it to the hand, under the armature, in the armature's space
        vg = o.vertex_groups.new(name="mixamorig:" + side_name + "Hand"); vg.add(range(len(o.data.vertices)), 1.0, "REPLACE")
        mw = o.matrix_world.copy(); o.parent = arm; o.matrix_world = mw
        mm = o.modifiers.new("Armature", "ARMATURE"); mm.object = arm
        o.select_set(False)
    print("JESSE_MITTS built")

# ---- 5. the tee print: "LEGENDS GYM / KENSINGTON" in gold outline lettering across the chest (his gym tee), draped on the tee and skinned like it ----
if "--no-print" not in argv and "--no-tee" not in argv:
    gold = bpy.data.materials.new("TeeGold"); gold.use_nodes = True
    gb = gold.node_tree.nodes["Principled BSDF"]; gb.inputs["Base Color"].default_value = (.78, .62, .36, 1); gb.inputs["Roughness"].default_value = .5
    ch_z = H["Spine2"].z + 0.02
    teeblack = bpy.data.materials.new("TeePrintInner"); teeblack.use_nodes = True
    teeblack.node_tree.nodes["Principled BSDF"].inputs["Base Color"].default_value = (.022, .022, .024, 1)
    bold = None                                                   # a tall condensed gym-print face from the Mac's system fonts
    for fp in ("/System/Library/Fonts/Supplemental/Impact.ttf", "/System/Library/Fonts/Supplemental/DIN Condensed Bold.ttf", "/Library/Fonts/Impact.ttf"):
        if os.path.exists(fp): bold = bpy.data.fonts.load(fp); break
    if bold is None: raise RuntimeError("build_jesse: no condensed bold font found for the tee print (looked for Impact / DIN Condensed Bold)")
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
    # drape the print on the tee: bake each object's transform into its verts, drop every vertex onto the tee surface (ray from the front), and copy the bone weights of the nearest tee vertex,
    # so the print follows the cloth through every pose instead of floating on one bone
    from mathutils.bvhtree import BVHTree
    from mathutils.kdtree import KDTree
    tee_mi = [i_ for i_, m_ in enumerate(me.materials) if m_ and m_.name == "BlackTee"]
    if not tee_mi: raise RuntimeError("build_jesse: the tee print needs the tee (use --no-print together with --no-tee)")
    tee_polys = [p_ for p_ in me.polygons if p_.material_index == tee_mi[0]]
    tee_vidx = sorted({vi for p_ in tee_polys for vi in p_.vertices})
    wpos = {vi: MW @ me.vertices[vi].co for vi in tee_vidx}
    remap = {vi: n_ for n_, vi in enumerate(tee_vidx)}
    bvh = BVHTree.FromPolygons([wpos[vi] for vi in tee_vidx], [tuple(remap[vi] for vi in p_.vertices) for p_ in tee_polys])
    kd = KDTree(len(tee_vidx))
    for vi in tee_vidx: kd.insert(wpos[vi], vi)
    kd.balance()
    gname = {g.index: g.name for g in body.vertex_groups}
    lift_of = {0: 0.0014, 1: 0.0026}                              # gold rim, then the black inner letter on top of it
    for ob in lines:
        bpy.ops.object.select_all(action="DESELECT"); bpy.context.view_layer.objects.active = ob; ob.select_set(True)
        bpy.ops.object.transform_apply(location=True, rotation=True, scale=True); ob.select_set(False)
        layer = int(ob.name.rsplit("_", 1)[1])
        for v in ob.data.vertices:
            hit = bvh.ray_cast(v.co + FWD * 0.10, -FWD, 0.3)
            if hit[0] is not None: v.co = hit[0] + hit[1] * lift_of[layer]
            _, vi, _ = kd.find(v.co)
            for g_ in me.vertices[vi].groups:
                nm = gname[g_.group]
                vg = ob.vertex_groups.get(nm) or ob.vertex_groups.new(name=nm)
                vg.add([v.index], g_.weight, "REPLACE")
        mw = ob.matrix_world.copy(); ob.parent = arm; ob.matrix_world = mw
        mm = ob.modifiers.new("Armature", "ARMATURE"); mm.object = arm
    print("JESSE_PRINT ok")
# (the copy keeps the original's parent: the armature, with its 0.01 scale)

arm.data.pose_position = "POSE"
os.makedirs(os.path.dirname(OUT), exist_ok=True)
bpy.ops.export_scene.gltf(filepath=OUT, export_format="GLB", export_animations=True, export_apply=False, export_yup=True,
                          export_draco_mesh_compression_enable=True, export_draco_mesh_compression_level=6)   # Draco: the dense head / skin mesh would otherwise be ~28 MB
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
    def shoot(name, action, frame, yaw, r=4.2):
        arm.animation_data.action = bpy.data.actions[action]; sc.frame_set(int(frame))
        cam.location = (math.sin(math.radians(yaw)) * -r, math.cos(math.radians(yaw)) * -r, tgt.location.z + 0.1)
        sc.render.filepath = os.path.join(PREV, f"jesse_{name}.png"); bpy.ops.render.render(write_still=True)
    idle = bpy.data.actions["idle"]; run = bpy.data.actions["run"]
    for nm, yaw in (("front", 0), ("three_quarter", 35), ("side", 90), ("back", 180)):   # he faces -Y: yaw 0 puts the camera in front of him
        shoot(nm, "idle", idle.frame_range[0] + 10, yaw, r=3.3)
    shoot("run_side", "run", (run.frame_range[0] + run.frame_range[1]) / 2, 90)
    tgt.location = (0, 0, HC.z + 0.005); cam.data.lens = 85
    for nm, yaw in (("face_front", 0), ("face_34", 35), ("face_side", 90)): shoot(nm, "idle", idle.frame_range[0] + 10, yaw, r=0.95)
    cam.data.lens = 85
    for nm, yaw, zt, rr in (("upper_front", 0, 1.38, 2.0), ("upper_34", 40, 1.38, 2.0), ("upper_back", 180, 1.38, 2.0), ("lower_34", 35, 0.55, 2.4), ("arm_close", 70, 1.15, 1.5), ("hand_close", 60, 0.95, 1.1), ("torso_front", 0, 1.3, 2.0)):
        tgt.location = (0, 0, zt); shoot(nm, "idle", idle.frame_range[0] + 10, yaw, r=rr)
    # a pad-work guard pose, to judge how the mitts sit in the hands: upper arms down, forearms up and forward, both mitts facing the camera
    def pose_arms(sx_sign_for):
        arm.animation_data.action = None                                                # manual pose: no action driving the bones
        for pb in arm.pose.bones: pb.rotation_mode = "QUATERNION"; pb.rotation_quaternion = (1, 0, 0, 0); pb.location = (0, 0, 0)
        bpy.context.view_layer.update()
        def rot(pb, axis, deg):
            h_ = pb.matrix.translation.copy()
            R = Matrix.Rotation(math.radians(deg), 4, axis)
            pb.matrix = Matrix.Translation(h_) @ R @ Matrix.Translation(-h_) @ pb.matrix
            bpy.context.view_layer.update()
        for sn in ("Left", "Right"):
            sg = 1 if H[sn + "Arm"].x > 0 else -1
            rot(arm.pose.bones["mixamorig:" + sn + "Arm"], "Y", 80 * sg)                  # upper arm down
            rot(arm.pose.bones["mixamorig:" + sn + "ForeArm"], "X", -125)                 # elbow bent: forearm up and forward
    pose_arms(None)
    cam.data.lens = 85
    for nm, yaw, zt, rr in (("mitts_front", 0, 1.38, 1.7), ("mitts_34", 35, 1.38, 1.7), ("mitts_side", 90, 1.38, 1.7)):
        tgt.location = (0, 0, zt)
        r = rr; cam.location = (math.sin(math.radians(yaw)) * -r, math.cos(math.radians(yaw)) * -r, tgt.location.z + 0.1)
        sc.render.filepath = os.path.join(PREV, f"jesse_{nm}.png"); bpy.ops.render.render(write_still=True)
    print("JESSE_PREVIEWS", PREV)
