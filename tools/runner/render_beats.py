"""
Render the hero "Custom" pass beats (walk / look / sneak / reach) as transparent frames + raw meta from the Mixamo Vanguard (Soldier.glb).
Same material, camera (ortho 2.35, cam at (-8,0,0.98)), 180 deg turn and goggle removal as render_runner.py, so the figure has exactly the same
size and ground baseline (footY = 293.4 px at size 320) as the live run sheet. Then assemble_beats.py packs frames into WebP + JSON + contact sheets.

  B=/Applications/Blender.app/Contents/MacOS/Blender; R=tools/runner; S=<scratch>/frames
  for b in walk look sneak reach crouch crouchlook crouchpeek; do
    $B -b -P $R/render_beats.py -- --beat $b --out $S/sil/$b --size 320                    # silhouette (default look)
    $B -b -P $R/render_beats.py -- --beat $b --out $S/sh/$b  --size 320 --look shaded      # shaded look (Vanguard's own materials, night-graffiti lights)
  done
  # run cycle (live args reverse-fitted to the live meta.json nozzle track, max 3.8 px off):
  $B -b -P $R/render_runner.py -- --model soldier --size 320 --frames 24 --arm 83,29.1,-27.4 --fore -23.9,-44.1,-16.9 [--look shaded] --out $S/sh/run
  python3 $R/assemble_beats.py --frames $S/sh  --out apps/web/public/assets/runner --sheets <scratch>/sheets --suffix _shaded --beats run,walk,look,sneak,reach,crouch,crouchlook,crouchpeek
  python3 $R/assemble_beats.py --frames $S/sil --out apps/web/public/assets/runner --sheets <scratch>/sheets --beats crouch,crouchlook,crouchpeek   # NEW silhouettes only; never re-run for walk/look/sneak/reach (live files)
  # NEW: Muay Thai teep + backward roll (Mixamo-bone driven; pass --model <glb> to re-render from any rig with the mixamorig:* skeleton, e.g. Jesse.glb, then --suffix _jesse):
  for b in teep roll; do $B -b -P $R/render_beats.py -- --beat $b --out $S/sil/$b --size 320 [--model $R/Jesse.glb --slim 0]; done
  python3 $R/assemble_beats.py --frames $S/sil --out apps/web/public/assets/runner --sheets <scratch>/sheets --beats teep,roll [--suffix _jesse]
  python3 $R/contact.py $S/sil/teep <scratch>/teep_zoom 6 40,60,260,200   # 2x zoom crop of every frame (use with frames 8-13 dir)
  python3 $R/contact.py <frames_dir> <out_prefix> <cols> [x,y,w,h]   # labelled 2-background contact sheets / 2x zoom crops

Flags: --beat walk|look|sneak|reach|crouch|crouchlook|crouchpeek  --look silhouette|shaded  --size 320  --slim 0.16 (slims the waist/belt/torso depth via skin weights, 0 = off)  --test (1 frame)
"""
import bpy, sys, os, json, math
import numpy as np
from mathutils import Vector, Matrix, Quaternion, Euler
from bpy_extras.object_utils import world_to_camera_view

argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
def opt(n, d): return argv[argv.index(n) + 1] if n in argv else d
MODEL = opt("--model", os.path.join(os.path.dirname(os.path.abspath(__file__)), "Soldier.glb"));
BEAT = opt("--beat", "walk"); OUT = opt("--out", "/tmp/beat"); SIZE = int(opt("--size", "320")); SLIM = float(opt("--slim", "0.22")); LOOK = opt("--look", "silhouette"); TEST = "--test" in argv
os.makedirs(OUT, exist_ok=True)

bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=MODEL)
scene = bpy.context.scene
arm = next(o for o in bpy.data.objects if o.type == "ARMATURE")
for o in list(bpy.data.objects):
    if o.name.startswith("Icosphere") or o.name == "vanguard_visor": bpy.data.objects.remove(o, do_unlink=True)
arm.matrix_world = Matrix.Rotation(math.pi, 4, "Z") @ arm.matrix_world   # face +Y = screen-right
MW = arm.matrix_world.copy()
MESHES = [o for o in bpy.data.objects if o.type == "MESH"]; mesh_obj = MESHES[0]

# ---- slim the belt / pouches / waist: pull hip+spine-weighted vertices toward the body centre along the depth axis (world X), rest pose, skin-weight blended
if SLIM > 0 and any(g.name == 'mixamorig:Hips' for g in mesh_obj.vertex_groups):
    vgi = {g.name: g.index for g in mesh_obj.vertex_groups}
    mw3 = mesh_obj.matrix_world.to_3x3()
    axis = max(range(3), key=lambda i: abs((mw3 @ Vector([1 if k == i else 0 for k in range(3)])).y))   # local axis most aligned with world Y (front-back depth seen by the side camera)
    ws = {vgi["mixamorig:Hips"]: 1.0, vgi["mixamorig:Spine"]: 1.0, vgi["mixamorig:Spine1"]: 0.6}
    W = []
    for v in mesh_obj.data.vertices:
        W.append(sum(ws.get(g.group, 0) * g.weight for g in v.groups))
    ys = [v.co[axis] for v, w in zip(mesh_obj.data.vertices, W) if w > 0.5]
    c = sorted(ys)[len(ys) // 2]
    k = (mw3 @ Vector([1 if i == axis else 0 for i in range(3)])).y      # world-Y metres per local unit along the depth axis (sign says which way is "behind")
    wys = sorted((mesh_obj.matrix_world @ v.co).y for v, w in zip(mesh_obj.data.vertices, W) if w > 0.5); yc = wys[len(wys) // 2]
    for v, w in zip(mesh_obj.data.vertices, W):
        wp = mesh_obj.matrix_world @ v.co; d = 0.0
        d += (c - v.co[axis]) * min(w, 1.0) * SLIM * k                       # pull toward the centre: slims waist, belt and pouches
        if w > 0.5 and 0.85 < wp.z < 1.4 and wp.y - yc > 0.12:               # rear belt pouch / holster sticking out behind the hips: flatten it
            d += -(wp.y - yc - 0.12) * 0.75
        v.co[axis] += d / k

# ---- material (identical to render_runner.py); --look shaded keeps the glb materials instead
mat = bpy.data.materials.new("silhouette"); mat.use_nodes = True; nt = mat.node_tree; nt.nodes.clear()
lw = nt.nodes.new("ShaderNodeLayerWeight"); lw.inputs["Blend"].default_value = 0.5
ramp = nt.nodes.new("ShaderNodeValToRGB")
ramp.color_ramp.elements[0].position = 0.34; ramp.color_ramp.elements[0].color = (0, 0, 0, 1)
ramp.color_ramp.elements[1].position = 0.62; ramp.color_ramp.elements[1].color = (0.62, 0.45, 0.26, 1)
em = nt.nodes.new("ShaderNodeEmission"); out = nt.nodes.new("ShaderNodeOutputMaterial")
nt.links.new(lw.outputs["Fresnel"], ramp.inputs["Fac"]); nt.links.new(ramp.outputs["Color"], em.inputs["Color"]); nt.links.new(em.outputs["Emission"], out.inputs["Surface"])
if LOOK != "shaded":
    for o in bpy.data.objects:
        if o.type == "MESH": o.data.materials.clear(); o.data.materials.append(mat)
bpy.ops.mesh.primitive_cylinder_add(radius=0.05, depth=0.2, location=(0, 0, 0))
can = bpy.context.active_object; can.name = "can"; can.data.materials.append(mat); can.rotation_mode = "QUATERNION"

cam_data = bpy.data.cameras.new("cam"); cam_data.type = "ORTHO"; cam_data.ortho_scale = 2.35
cam = bpy.data.objects.new("cam", cam_data); scene.collection.objects.link(cam); scene.camera = cam
cam.location = (-8, 0, 0.98); cam.rotation_euler = (math.radians(90), 0, math.radians(-90))
scene.render.engine = "BLENDER_EEVEE"; scene.render.film_transparent = True
scene.render.resolution_x = scene.render.resolution_y = SIZE; scene.render.resolution_percentage = 100
scene.render.image_settings.file_format = "PNG"; scene.render.image_settings.color_mode = "RGBA"
scene.view_settings.view_transform = "Standard"; scene.render.filter_size = 1.0
if LOOK == "shaded":
    sys.path.insert(0, os.path.dirname(os.path.abspath(__file__))); import shaded_look; shaded_look.setup(scene, can)

PB = lambda n: arm.pose.bones["mixamorig:" + n]
def upd(): bpy.context.view_layer.update()
def wpos(n): return arm.matrix_world @ PB(n).head
def px(p):
    n = world_to_camera_view(scene, cam, Vector(p)); return {"x": round(n.x * SIZE, 1), "y": round((1 - n.y) * SIZE, 1)}
PXM = SIZE / 2.35
upd()
FOOTY = px((0, 0, 0))["y"]
R3 = arm.matrix_world.to_quaternion().to_matrix()   # rotation only

def rot_world(name, q):
    """rotate a pose bone about its own head by world-space quaternion q (parents first, update after)"""
    b = PB(name); Ra = (R3.inverted() @ q.to_matrix() @ R3).to_4x4()
    h = b.head.copy()
    b.matrix = Matrix.Translation(h) @ Ra @ Matrix.Translation(-h) @ b.matrix
    upd()
def rot_axis(name, axis, deg): rot_world(name, Quaternion(Vector(axis), math.radians(deg)))
def aim(name, d):
    b = PB(name); cur = (R3 @ (b.tail - b.head)).normalized()
    rot_world(name, cur.rotation_difference(Vector(d).normalized()))
def unit_yz(deg_from_up):  # direction in the sagittal plane: 0 = up, 90 = forward(+Y), 180 = down
    a = math.radians(deg_from_up); return Vector((0, -math.sin(a), math.cos(a)))
X = (-1, 0, 0); Z = (0, 0, -1)   # screen-right (facing) is world -Y: X = pitch axis (+ = lean/thigh forward), Z = yaw axis (+ = head turns toward the camera then back to screen-left)

def free_right_arm(action):
    FREE = ("mixamorig:RightArm", "mixamorig:RightForeArm", "mixamorig:RightHand", "mixamorig:RightShoulder")
    for layer in action.layers:
        for strip in layer.strips:
            for cb in strip.channelbags:
                for fc in list(cb.fcurves):
                    if any(b in fc.data_path for b in FREE): cb.fcurves.remove(fc)

def set_can(d):
    """can held in the right fist, axis direction d (world, unit); returns nozzle world position (hand + 0.18 d, as render_runner.py)"""
    hand = wpos("RightHand"); d = Vector(d).normalized()
    can.location = hand + d * 0.09; can.rotation_quaternion = d.to_track_quat("Z", "Y")
    return hand + d * 0.18

def mesh_minz():
    dg = bpy.context.evaluated_depsgraph_get(); zs = []
    for mo in MESHES:
        m = mo.evaluated_get(dg); me = m.to_mesh()
        a = np.empty(len(me.vertices) * 3, dtype=np.float32); me.vertices.foreach_get("co", a); a = a.reshape(-1, 3)
        w = np.array(m.matrix_world); zs.append(float((a @ w[2, :3] + w[2, 3]).min())); m.to_mesh_clear()
    return min(zs)
def ground(): arm.location.z = 0; upd(); arm.location.z = -mesh_minz(); upd()

def render(i):
    # render re-evaluates the action and would overwrite the hand-edited pose of animated bones: detach the action for the still, pose stays as set
    act = arm.animation_data.action; arm.animation_data.action = None; upd()
    p = os.path.join(OUT, f"frame_{i:02d}.png"); scene.render.filepath = p; bpy.ops.render.render(write_still=True)
    arm.animation_data.action = act

def hang_arm(swing=0.0):
    """right arm relaxed at the side, hand a little ahead of the thigh, can tilted forward so it shows against the leg"""
    aim("RightArm", unit_yz(172 - swing)); aim("RightForeArm", unit_yz(128 - swing)); aim("RightHand", unit_yz(115))
    return set_can(unit_yz(38))

meta = {"beat": BEAT, "size": SIZE, "footY": FOOTY}
def cyc_action(name):
    a = bpy.data.actions[name]; arm.animation_data.action = a; return a
def at(a, f):
    arm.animation_data.action = a
    scene.frame_set(int(f), subframe=f - int(f)); upd()

def pose_walk(a, f, sneak):
    at(a, f)
    if sneak:
        rot_axis("Spine", X, -8); rot_axis("Hips", X, -6)                                   # torso forward
        for s in "LR":
            rot_axis(f"{'Left' if s=='L' else 'Right'}UpLeg", X, 12)
            rot_axis(f"{'Left' if s=='L' else 'Right'}Leg", X, -26)   # knees bent
            rot_axis(f"{'Left' if s=='L' else 'Right'}Foot", X, -15)     # net foot: compensate shank, then heel lifted (toes down)
            rot_axis(f"{'Left' if s=='L' else 'Right'}ToeBase", X, 30)  # toes stay flat on the floor
        rot_axis("Neck", X, 10); rot_axis("Head", X, 4)              # head back to level
    if sneak:
        aim("RightArm", unit_yz(172)); aim("RightForeArm", unit_yz(78)); aim("RightHand", unit_yz(62))   # tucked, can held close in front of the belly
        return set_can(unit_yz(18))
    return hang_arm()

def run_cycle(N, action, sneak):
    a = cyc_action(action); free_right_arm(a); s, e = a.frame_range
    hips0 = None; toes = {"L": [], "R": []}; hips = []; noz = []
    y0 = None
    for i in range(1 if TEST else N):
        f = s + (e - s) * i / N
        arm.location = (0, 0, 0)
        nz = pose_walk(a, f, sneak)
        hy = wpos("Hips").y
        if y0 is None: y0 = hy
        arm.location.y = y0 - hy; upd(); ground()
        set_can_after = set_can  # recompute can with final placement
        # re-place the can (hand moved with the shift)
        d = (unit_yz(18) if sneak else unit_yz(38)); set_can(d)
        upd()
        render(i)
        for k, nm in (("L", "LeftToeBase"), ("R", "RightToeBase")): toes[k].append(wpos(nm))
        if i == 0: hp = wpos("Hips"); meta["hips"] = px(hp)
    # planted-foot speed: toe world y change per sample while the toe is within 2.5 cm of its cycle minimum height
    ds = []
    for k in "LR":
        P = toes[k]; zmin = min(p.z for p in P)
        for j in range(len(P)):
            p, q = P[j], P[(j + 1) % len(P)]
            if p.z < zmin + 0.025 and q.z < zmin + 0.025: ds.append(q.y - p.y)   # (wrap is fine: ground snap keeps the cycle periodic)
    # the character is held in place, so a planted foot moves backward (world +Y) at the walking speed
    per_sample = sum(ds) / max(len(ds), 1)
    meta["frames"] = N; meta["cols"] = 4; meta["pxPerCycle"] = round(per_sample * N * PXM, 1); meta["plantedSamples"] = len(ds)
    meta["metresPerCycle"] = round(per_sample * N, 3)

def idle_frame(a):
    """the Idle frame with the feet closest together (the Vanguard idle is a wide rifle stance; this is its most neutral moment)"""
    best = None
    for f in range(0, 48):
        at(a, f); d = abs(wpos("LeftToeBase").y - wpos("RightToeBase").y) + abs(wpos("LeftFoot").y - wpos("RightFoot").y)
        if best is None or d < best[0]: best = (d, f)
    meta["idleFrame"] = best[1]; return best[1]

def neutral_legs():
    """the Idle is a wide rifle stance: stand him up, feet a shoe-length apart, flat on the floor"""
    for side, tilt in (("Right", -4), ("Left", 5)):
        aim(side + "UpLeg", unit_yz(180 + tilt)); aim(side + "Leg", unit_yz(180 + tilt * 0.3)); aim(side + "Foot", unit_yz(122)); aim(side + "ToeBase", unit_yz(95))

def run_look():
    a = cyc_action("Idle"); free_right_arm(a); N = 8; yaws = []; IF = idle_frame(a)
    for i in range(1 if TEST else N):
        t = i / (N - 1); e = t * t * (3 - 2 * t) * 0.6 + t * 0.4   # eased but not stalled at the ends
        at(a, IF); arm.location = (0, 0, 0); neutral_legs()
        if i == 0: upd(); ground(); base_off = arm.location.z
        arm.location.z = base_off; upd()
        sp, sp1, sp2, nk, hd = 12 * e, 12 * e, 12 * e, 40 * e, 76 * e     # spine twist 36, neck 40, head 76 -> ~152 deg total
        rot_axis("Spine", Z, sp); rot_axis("Spine1", Z, sp1); rot_axis("Spine2", Z, sp2); rot_axis("Neck", Z, nk); rot_axis("Head", Z, hd)
        hang_arm()
        yaws.append(round(sp + sp1 + sp2 + nk + hd, 1)); render(i)
        if i == 0: meta["hips"] = px(wpos("Hips"))
    meta.update({"frames": N, "cols": 4, "yawDeg": yaws, "headYawNote": "world yaw of the head about vertical, 0 = facing screen-right, + = turning back toward screen-left"})

def run_reach():
    a = cyc_action("Idle"); free_right_arm(a); IF = idle_frame(a)
    at(a, IF); arm.location = (0, 0, 0); upd(); neutral_legs(); ground(); off = arm.location.z
    F = [0.32, 0.58, 0.82]                     # nozzle forward of the chest (m)
    Zs = [1.05, 1.30, 1.52, 1.75, 2.00]         # nozzle height (m): hip .. just above head
    poses = []; i = 0
    for fi, fwd in enumerate(F):
        for zi, zt in enumerate(Zs):
            at(a, IF); arm.location = (0, 0, off); upd(); neutral_legs()
            rot_axis("Spine", X, -8 * fi); rot_axis("Spine1", X, -5 * fi); rot_axis("Spine2", X, -2 * fi)   # slight lean into the reach
            chest = wpos("Spine2")
            sh = wpos("RightArm"); L1 = (wpos("RightForeArm") - sh).length; L2 = (wpos("RightHand") - wpos("RightForeArm")).length
            tilt = 10 + 45 * max(0, (zt - 1.2)) / 0.8                       # can axis tilts up as the reach rises
            dcan = Vector((0, -math.cos(math.radians(tilt)), math.sin(math.radians(tilt))))
            tgt = Vector((0, chest.y - fwd, zt)); hand_t = tgt - 0.18 * dcan   # hand position that puts the nozzle on the target
            v = hand_t - Vector((0, sh.y, sh.z)); v.x = 0
            reach = L1 + L2 - 0.01
            if v.length > reach: v = v.normalized() * reach                 # unreachable: fully extended along the same ray
            dist = max(v.length, 0.12)
            # 2-bone IK in the Y-Z plane, elbow bends down/back
            ca = max(-1, min(1, (L1 * L1 + dist * dist - L2 * L2) / (2 * L1 * dist))); ang = math.acos(ca)
            base = math.atan2(-v.y, v.z)                                       # from up, toward forward
            th = base + ang                                                    # upper arm angle from up (elbow below the hand line)
            u_dir = Vector((0, -math.sin(th), math.cos(th)))
            elbow = Vector((0, sh.y, sh.z)) + u_dir * L1
            f_dir = (Vector((0, sh.y, sh.z)) + v - elbow).normalized()
            aim("RightArm", u_dir); aim("RightForeArm", f_dir); aim("RightHand", dcan)
            noz = set_can(dcan); upd(); render(i)
            poses.append({"i": i, "nozzle": px(noz), "hips": px(wpos("Hips")), "nozzleFwd": round(chest.y - noz.y, 3), "nozzleZ": round(noz.z, 3), "chestY": round(chest.y, 3), "target": [round(fwd, 2), zt]})
            i += 1
    meta.update({"cols": 5, "rows": 3, "poses": poses})

# ---------------------------------------------------------------- crouch family (crouch / crouchlook / crouchpeek)
def head_px():
    h = wpos("Head"); u = (h - wpos("Neck")).normalized(); return px(h + u * 0.10)   # centre of the skull (~10 cm above the head bone)
def sstep(t): t = max(0.0, min(1.0, t)); return t * t * (3 - 2 * t)
def bone_len(a, b): return (wpos(a) - wpos(b)).length

CR = {}
def crouch_refs(a, IF):
    """standing reference: idle frame, neutral legs, grounded. Toe / ankle world points stay planted for the whole crouch family"""
    at(a, IF); arm.location = (0, 0, 0); upd(); neutral_legs(); ground()
    CR["off"] = arm.location.z; CR["a"] = a; CR["IF"] = IF
    CR["T"] = {s: wpos(s + "ToeBase") for s in ("Left", "Right")}; CR["A"] = {s: wpos(s + "Foot") for s in ("Left", "Right")}
    CR["H0"] = wpos("Hips").copy()
    CR["L1"] = {s: bone_len(s + "UpLeg", s + "Leg") for s in ("Left", "Right")}; CR["L2"] = {s: bone_len(s + "Leg", s + "Foot") for s in ("Left", "Right")}
    CR["hangL"] = None
    # standing left-hand rest position (arm aimed like the right one)
    aim("LeftArm", unit_yz(172)); aim("LeftForeArm", unit_yz(128)); aim("LeftHand", unit_yz(115)); CR["P0"] = wpos("LeftHand").copy()

def ik2(p0, tgt, L1, L2, bend):
    """2 bone IK in the sagittal (Y-Z) plane. bend=-1 knee/elbow forward (-Y), +1 back. returns (mid joint, end) world points"""
    v = Vector((0, tgt.y - p0.y, tgt.z - p0.z)); dist = max(min(v.length, L1 + L2 - 1e-3), abs(L1 - L2) + 1e-3)
    ang = math.acos(max(-1, min(1, (L1 * L1 + dist * dist - L2 * L2) / (2 * L1 * dist))))
    base = math.atan2(-v.y, v.z)                      # angle from up toward forward
    th = base + bend * ang
    mid = Vector((0, p0.y, p0.z)) + Vector((0, -math.sin(th), math.cos(th))) * L1
    end = Vector((0, p0.y, p0.z)) + v.normalized() * dist
    return mid, end

def crouch_pose(c, yaw=0.0, pitch=0.0, peek_pitch=0.0):
    """c: 0 standing .. 1 deep crouch. yaw (deg, total, 0 = forward .. ~150 = looking back over the shoulder), pitch (deg, + = chin up)"""
    a = CR["a"]; at(a, CR["IF"]); arm.location = (0, 0, 0); upd(); neutral_legs()
    w = sstep(c)
    arm.location = (0, 0.16 * w, CR["off"] - 0.56 * w); upd()
    # pelvis tilts forward, back rounds: hips + 3 spine bones, then the head is brought back up to look ahead
    rot_axis("Hips", X, -8 * w); rot_axis("Spine", X, -9 * w); rot_axis("Spine1", X, -8 * w); rot_axis("Spine2", X, -7 * w)   # -X = lean forward (as the sneak / reach beats)
    rot_axis("Neck", X, 28 * w); rot_axis("Head", X, 22 * w)
    # torso twist about each spine bone's own axis (shoulders rotate), then neck + head yaw about vertical
    e = yaw / 152.0
    for n, d in (("Spine", 18), ("Spine1", 18), ("Spine2", 20)):
        b = PB(n); ax = R3 @ (b.tail - b.head)
        rot_world(n, Quaternion(-ax.normalized(), math.radians(d * e)))     # sign chosen so it matches the world-Z (0,0,-1) look sheet (turns back toward screen-left)
    rot_axis("Neck", Z, 46 * e); rot_axis("Head", Z, 76 * e)
    pit = pitch + peek_pitch
    rot_axis("Neck", X, 0.45 * pit); rot_axis("Head", X, 0.55 * pit)   # +X = chin up
    # legs: toes planted, heels raised, knees forward
    phi = math.radians(52 * w)
    for s in ("Left", "Right"):
        T = CR["T"][s]; A = CR["A"][s]; v = A - T; th = math.atan2(v.z, v.y) + phi; Lv = math.hypot(v.y, v.z)
        A2 = Vector((A.x, T.y + Lv * math.cos(th), T.z + Lv * math.sin(th)))
        p0 = wpos(s + "UpLeg"); knee, ank = ik2(p0, A2, CR["L1"][s], CR["L2"][s], -1)
        aim(s + "UpLeg", (knee - Vector((0, p0.y, p0.z)))); aim(s + "Leg", (ank - knee)); aim(s + "Foot", (T - wpos(s + "Foot")) if False else (T - A2)); aim(s + "ToeBase", unit_yz(92))
    # left hand: fingertips on the ground just ahead of the front foot; right hand: can hanging low by the knee
    G = Vector((0, min(CR["T"]["Left"].y, CR["T"]["Right"].y) - 0.02, 0.22))
    tgt = CR["P0"] * (1 - w) + G * w
    sh = wpos("LeftArm"); L1 = bone_len("LeftArm", "LeftForeArm"); L2 = bone_len("LeftForeArm", "LeftHand")
    el, hd = ik2(sh, tgt, L1, L2, +1)
    aim("LeftArm", el - Vector((0, sh.y, sh.z))); aim("LeftForeArm", hd - el); aim("LeftHand", unit_yz(160 - 40 * w))
    upd(); arm.location.z -= mesh_minz(); upd()      # rigid drop so the lowest sole point sits exactly on the ground (footY 293.4); toe pivot is above the sole
    hang_arm(-30 * w)
    # (the can is re-set after the pose; keeps it in the fist)
    upd()

def crouch_render(i, c, yaw=0.0, pitch=0.0, peek_pitch=0.0):
    crouch_pose(c, yaw, pitch, peek_pitch); render(i)
    return {"hips": px(wpos("Hips")), "head": head_px(), "minz": round(mesh_minz(), 3)}

def run_crouch():
    a = cyc_action("Idle"); free_right_arm(a); crouch_refs(a, idle_frame(a)); N = 10; hips = []; head = []; mz = []
    for i in range(1 if TEST else N):
        c = sstep(i / (N - 1)); r = crouch_render(i, c); hips.append(r["hips"]); head.append(r["head"]); mz.append(r["minz"])
    meta.update({"frames": N, "cols": 5, "hips": hips, "head": head, "minz": mz})

def run_crouchlook():
    a = cyc_action("Idle"); free_right_arm(a); crouch_refs(a, idle_frame(a)); N = 12
    Y = [0, 18, 48, 82, 116, 142, 156, 156, 132, 92, 46, 12]            # forward -> back over the shoulder -> half way home (loops)
    P = [0, 0, 4, 10, 16, 8, 0, 14, 20, 10, 2, 0]                         # chin lifts / peeks up on some frames
    hips = []; head = []; mz = []
    for i in range(1 if TEST else N):
        r = crouch_render(i, 1.0, Y[i], P[i]); head.append(r["head"]); mz.append(r["minz"])
    meta.update({"frames": N, "cols": 4, "yawDeg": Y, "pitchDeg": P, "head": head, "minz": mz})

def run_crouchpeek():
    a = cyc_action("Idle"); free_right_arm(a); crouch_refs(a, idle_frame(a)); N = 8; hips = []; head = []; mz = []
    C = [1.0, 0.80, 0.58, 0.42, 0.40, 0.55, 0.80, 0.96]; PK = [0, 0, 6, 12, 14, 8, 0, 0]
    for i in range(1 if TEST else N):
        r = crouch_render(i, C[i], 0, 0, PK[i]); hips.append(r["hips"]); head.append(r["head"]); mz.append(r["minz"])
    meta.update({"frames": N, "cols": 4, "hips": hips, "head": head, "minz": mz})


# ---------------------------------------------------------------- teep + roll: pure sagittal-plane bone aiming, Mixamo bone names only (no action, no model-specific names)
# Angle convention everywhere below: degrees from world UP toward the facing direction (screen-right = -Y). 0 up, 90 forward, 180 down, negative = leaning/rolling BACK.
# Forward coordinate f = -y (metres). Bones are aimed by direction (aim2), so the pose is independent of the rig's rest-pose quirks; only the bone NAMES must match.
def mreset():
    if arm.animation_data: arm.animation_data.action = None
    for pb in arm.pose.bones: pb.matrix_basis = Matrix()
    arm.location = (0, 0, 0); upd()
def aim2(name, d):
    b = PB(name); d = Vector(d).normalized(); cur = (R3 @ (b.tail - b.head)).normalized()
    if cur.dot(d) < -0.98: rot_world(name, Quaternion(Vector((1, 0, 0)), math.pi)); cur = (R3 @ (b.tail - b.head)).normalized()   # antiparallel: flip about the lateral axis, stays in the sagittal plane
    rot_world(name, cur.rotation_difference(d))
def aa(name, deg): aim2(name, unit_yz(deg))
def bang(name):
    b = PB(name); v = R3 @ (b.tail - b.head); return math.degrees(math.atan2(-v.y, v.z))
TORSO = ("Hips", "Spine", "Spine1", "Spine2", "Neck", "Head")
LIMB = ("UpLeg", "Leg", "Foot", "ToeBase")
ARMB = ("Arm", "ForeArm", "Hand")
def render_still(i):
    p = os.path.join(OUT, f"frame_{i:02d}.png"); scene.render.filepath = p; bpy.ops.render.render(write_still=True)
def hide_can(): can.hide_render = True; can.hide_viewport = True
def sole_snap(): upd(); arm.location.z -= mesh_minz(); upd()
def read_angles(): return {n: bang(n) for n in TORSO + tuple(s + l for s in ("Left", "Right") for l in LIMB + ARMB)}
def apply_angles(A):
    for n in TORSO: aa(n, A[n])
    for s in ("Left", "Right"):
        for l in LIMB + ARMB: aa(s + l, A[s + l])
def pchip(xs, ys, x):
    n = len(xs); h = [xs[i + 1] - xs[i] for i in range(n - 1)]; d = [(ys[i + 1] - ys[i]) / h[i] for i in range(n - 1)]
    m = [0.0] * n; m[0] = d[0]; m[-1] = d[-1]
    for i in range(1, n - 1):
        if d[i - 1] * d[i] > 0:
            w1 = 2 * h[i] + h[i - 1]; w2 = h[i] + 2 * h[i - 1]; m[i] = (w1 + w2) / (w1 / d[i - 1] + w2 / d[i])
    k = max(0, min(n - 2, next((j for j in range(n - 1) if xs[j] <= x < xs[j + 1]), n - 2))); t = (x - xs[k]) / h[k]
    h00 = 2 * t**3 - 3 * t**2 + 1; h10 = t**3 - 2 * t**2 + t; h01 = -2 * t**3 + 3 * t**2; h11 = t**3 - t**2
    return h00 * ys[k] + h10 * h[k] * m[k] + h01 * ys[k + 1] + h11 * h[k] * m[k + 1]
def cyc(anch, x, N=24, adv=0.0):
    """periodic PCHIP through {frame: value}; adv = value gained per cycle (forward travel)"""
    xs = []; ys = []
    for k in (-1, 0, 1):
        for fr in sorted(anch): xs.append(fr + N * k); ys.append(anch[fr] + adv * k)
    return pchip(xs, ys, x)

STEP = 0.27          # forward travel per teep cycle, metres (left foot lands one step ahead, rear foot follows)
F0 = -0.141          # hips are pinned at this forward coordinate in the sprite (x = 160 + F0*136 = 140.8 px, the crouch beat's hips x)
TP = {   # per-frame keys, frame: value.  H = hips forward (world, travelling), LF/RF = ankle forward, LZ/RZ = ankle lift above the planted height, L = torso lean back (deg)
 "H":  {0: .21, 2: .21, 3: .19, 4: .15, 5: .10, 6: .07, 7: .05, 8: .05, 9: .06, 10: .08, 11: .10, 12: .11, 13: .11, 14: .09, 15: .07, 16: .06, 17: .07, 18: .13, 19: .26, 20: .38, 21: .45, 22: .47, 23: .48},
 "LF": {0: .42, 2: .42, 3: .40, 4: .34, 5: .27, 6: .22, 7: .20, 8: .30, 9: .56, 10: .86, 11: 1.06, 12: 1.12, 13: 1.12, 14: .96, 15: .60, 16: .30, 17: .22, 18: .50, 19: .69, 23: .69},
 "LZ": {0: 0, 2: 0, 3: .12, 4: .30, 5: .48, 6: .58, 7: .62, 8: .68, 9: .80, 10: .93, 11: .99, 12: 1.0, 13: 1.0, 14: .95, 15: .80, 16: .66, 17: .62, 18: .30, 19: 0, 23: 0},
 "RF": {0: 0, 19: 0, 20: .06, 21: .16, 22: .25, 23: .27},
 "RZ": {0: 0, 19: 0, 20: .06, 21: .16, 22: .10, 23: .02},
 "LN": {0: -3, 2: -3, 3: -2, 4: -1, 5: 0, 6: 2, 7: 3, 8: 4, 9: 7, 10: 10, 11: 12, 12: 12, 13: 12, 14: 9, 15: 6, 16: 3, 17: 1, 18: -2, 19: -3, 23: -3},
 "BND": {0: .95, 3: .96, 5: .97, 8: .97, 13: .97, 17: .97, 18: .96, 19: .94, 21: .94, 23: .95},   # support-leg reach as a fraction of full leg length (0.955 = slight bend)
 "LA": {0: 0, 2: 0, 3: .4, 4: 1, 18: 1, 19: 0, 23: 0},                                                 # left foot "in the air" weight
 "RA": {0: 0, 19: 0, 20: .5, 21: 1, 22: .6, 23: 0},
}
GUARD = {"LeftArm": 146, "LeftForeArm": 40, "LeftHand": 30, "RightArm": 152, "RightForeArm": 34, "RightHand": 24}   # relative to the torso: elbows tucked at the ribs, gloves at the cheekbones
FLAT_FOOT, FLAT_TOE = 122, 95
CAL = {}
def calibrate():
    mreset(); h = wpos("Hips"); 
    CAL["L1"] = (wpos("LeftLeg") - wpos("LeftUpLeg")).length; CAL["L2"] = (wpos("LeftFoot") - wpos("LeftLeg")).length
    for s in ("Left", "Right"): aa(s + "Foot", FLAT_FOOT); aa(s + "ToeBase", FLAT_TOE)
    upd(); arm.location.z = -mesh_minz(); upd(); CAL["AZ"] = wpos("LeftFoot").z
    CAL["hipZ"] = wpos("Hips").z
    print("CAL", {k: round(v, 3) for k, v in CAL.items()}, "hipJointDz", round(wpos("LeftUpLeg").z - wpos("Hips").z, 3))

def teep_pose(i, ret=None):
    t = float(i); G = lambda k, adv=0.0: cyc(TP[k], t, 24, adv)
    Hf = G("H", STEP); Lf = G("LF", STEP); Rf = G("RF", STEP); Lz = G("LZ"); Rz = G("RZ"); L = G("LN"); B = G("BND"); LA = max(0, min(1, G("LA"))); RA = max(0, min(1, G("RA")))
    mreset()
    tor = -L                                                              # torso angle from up (negative = leaning back)
    A = {"Hips": tor * .3, "Spine": tor * .55, "Spine1": tor * .8, "Spine2": tor, "Neck": tor * .5 + 4, "Head": 4 + tor * .1}
    for n in TORSO: aa(n, A[n])
    shift = F0 - Hf                                                       # world -> sprite forward shift (hips pinned)
    p = wpos("Hips"); arm.location = (0, -F0 - p.y, 0); upd()
    # hips height: deepest bend that keeps every grounded ankle reachable (slight bend on the support leg)
    Lt = CAL["L1"] + CAL["L2"]; az = CAL["AZ"]; hz_need = []
    tgt = {"Left": (Lf + shift, az + Lz), "Right": (Rf + shift, az + Rz)}
    for s, lift in (("Left", Lz), ("Right", Rz)):
        if lift < 0.02:
            hj = wpos(s + "UpLeg"); df = -hj.y - tgt[s][0]; r = B * Lt
            hz_need.append(tgt[s][1] + math.sqrt(max(r * r - df * df, 0.01)) - (hj.z - wpos("Hips").z))
    hz = min(hz_need) if hz_need else CAL["hipZ"] - 0.08
    arm.location.z += hz - wpos("Hips").z; upd()
    shin = {}
    for s, air, lift in (("Left", LA, Lz), ("Right", RA, Rz)):
        p0 = wpos(s + "UpLeg"); T = Vector((0, -tgt[s][0], tgt[s][1]))
        knee, ank = ik2(p0, T, CAL["L1"], CAL["L2"], -1)
        aim2(s + "UpLeg", knee - Vector((0, p0.y, p0.z))); aim2(s + "Leg", ank - knee)
        sh = math.degrees(math.atan2(-(ank - knee).y, (ank - knee).z))
        pf = 12 if s == "Left" else 20
        fa = (1 - air) * FLAT_FOOT + air * (sh - pf if abs(sh) < 400 else FLAT_FOOT)
        ta = (1 - air) * FLAT_TOE + air * (fa + 4)
        aa(s + "Foot", fa); aa(s + "ToeBase", ta); shin[s] = sh
    for k, v in GUARD.items(): aa(k, v + tor)
    sole_snap()
    if ret is not None:
        sup = "Right" if i < 20 else "Left"
        ret.update({"hips": px(wpos("Hips")), "sup": px(wpos(sup + "ToeBase")), "supAnkle": px(wpos(sup + "Foot")), "kick": px(wpos("LeftToeBase")), "shin": round(shin["Left"], 1), "hz": round(hz, 3), "world_H": Hf, "world_supf": (Rf if i < 20 else Lf)})
    return A

def run_teep():
    calibrate(); N = 24; hips = []; sup = []; trav = []; diag = []
    for i in range(1 if TEST else N):
        r = {}; teep_pose(i, r); render_still(i); hips.append(r["hips"]); sup.append(r["sup"]); trav.append(round((r["world_H"] - cyc(TP["H"], 0, 24, STEP)) * PXM, 1))
        diag.append({k: r[k] for k in ("shin", "hz", "kick")})
    meta.update({"frames": N, "cols": 6, "stepPx": round(STEP * PXM, 1), "support": sup, "hips": hips, "travelAt": trav,
                 "note": "rendered in place, hips pinned at hips[0].x; travelAt[i] = px the sprite must advance (screen-right) so the planted foot stays put; support = planted foot ball (right foot f0-19, left foot f20-23); kicking bone = mixamorig:LeftUpLeg/LeftLeg/LeftFoot/LeftToeBase (near-camera-far leg, the figure's anatomical left)", "diag": diag})

# ---- backward roll
CROUCH = {"Hips": 22, "Spine": 32, "Spine1": 40, "Spine2": 46, "Neck": 58, "Head": 44,
          "LeftUpLeg": 96, "LeftLeg": 234, "LeftFoot": 165, "LeftToeBase": 100, "RightUpLeg": 92, "RightLeg": 231, "RightFoot": 165, "RightToeBase": 100,
          "LeftArm": 140, "LeftForeArm": 168, "LeftHand": 175, "RightArm": 165, "RightForeArm": 140, "RightHand": 130}
TUCK = {"Hips": 12, "Spine": 34, "Spine1": 55, "Spine2": 68, "Neck": 82, "Head": 112,
        "LeftUpLeg": 50, "LeftLeg": 222, "LeftFoot": 205, "LeftToeBase": 205, "RightUpLeg": 46, "RightLeg": 218, "RightFoot": 205, "RightToeBase": 205,
        "LeftArm": 96, "LeftForeArm": 330, "LeftHand": 322, "RightArm": 92, "RightForeArm": 328, "RightHand": 320}
# frame: (blend towards TUCK from CROUCH, roll psi in degrees, blend towards STAND, hips travel fraction)
RL = {0: (0, 0, 0, 0), 1: (.35, -12, 0, .04), 2: (.8, -45, 0, .12), 3: (1, -100, 0, .24), 4: (1, -158, 0, .38), 5: (1, -212, 0, .52), 6: (1, -262, 0, .64), 7: (1, -308, 0, .74),
      8: (.7, -340, 0, .84), 9: (.25, -358, 0, .92), 10: (0, -360, 0, .96), 11: (0, -360, 0, 1), 12: (0, -360, .12, 1), 13: (0, -360, .3, 1), 14: (0, -360, .5, 1), 15: (0, -360, .68, 1), 16: (0, -360, .82, 1), 17: (0, -360, .92, 1), 18: (0, -360, .98, 1), 19: (0, -360, 1, 1)}
ROLL_TRAVEL = 1.05   # metres backward (screen-left)
def sm(t): t = max(0., min(1., t)); return t * t * (3 - 2 * t)
def run_roll():
    calibrate(); teep_pose(0); STAND = read_angles()
    for k in STAND:
        while STAND[k] - CROUCH[k] > 180: STAND[k] -= 360
        while STAND[k] - CROUCH[k] < -180: STAND[k] += 360
    N = 20; hips = []; contact = []; trav = []; head = []
    for i in range(1 if TEST else N):
        tk, psi, st, tr = RL[i]; mreset()
        A = {}
        for k in CROUCH:
            base = CROUCH[k] * (1 - tk) + TUCK[k] * tk
            A[k] = (base + psi) * (1 - st) + STAND[k] * st if st > 0 else base + psi
        # crouch->stand and tuck->crouch never overlap; psi is -360 by the time the stand blend starts, so it is folded into CROUCH (same pose)
        if st > 0: A = {k: (CROUCH[k]) * (1 - sm(st)) + STAND[k] * sm(st) for k in CROUCH}
        apply_angles(A)
        p = wpos("Hips"); arm.location = (0, -F0 - p.y, 0); upd(); sole_snap()
        render_still(i); hips.append(px(wpos("Hips"))); head.append(head_px()); mz = mesh_minz()
        contact.append(px((0, 0, mz))["y"]); trav.append(round(ROLL_TRAVEL * tr * PXM, 1))
    meta.update({"frames": N, "cols": 5, "travelPx": round(ROLL_TRAVEL * PXM, 1), "hips": hips, "head": head, "contact": contact, "travelAt": trav,
                 "note": "rendered in place, hips pinned at x=hips.x; travelAt[i] = cumulative px the sprite advances BACKWARD (screen-left); frame 0 = crouch pose, frame 19 = teep frame 0"})


if BEAT == "walk": run_cycle(16, "Walk", False)
elif BEAT == "sneak": run_cycle(12, "Walk", True)
elif BEAT == "look": run_look()
elif BEAT == "reach": run_reach()
elif BEAT == "crouch": run_crouch()
elif BEAT == "crouchlook": run_crouchlook()
elif BEAT == "crouchpeek": run_crouchpeek()
elif BEAT == "teep": hide_can(); run_teep()
elif BEAT == "roll": hide_can(); run_roll()
json.dump(meta, open(os.path.join(OUT, "raw.json"), "w"), indent=1)
print("DONE", BEAT, {k: v for k, v in meta.items() if k not in ("poses",)})
