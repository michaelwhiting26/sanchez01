import { describe, expect, it } from "vitest";
import { attentionFor, hasSeatedClips, jointKey, seatedClipFor, SEATED_CLIPS } from "./jesse-pose";

describe("Jesse seated", () => {
  it("uses a character's own clips only when all five are there", () => {
    expect(hasSeatedClips(SEATED_CLIPS)).toBe(true);
    expect(hasSeatedClips([...SEATED_CLIPS, "walk", "idle"])).toBe(true);
    expect(hasSeatedClips(SEATED_CLIPS.slice(1))).toBe(false);
    expect(hasSeatedClips(["idle", "walk", "agree"])).toBe(false); // the stand-in: the code-made pose is used instead
  });

  it("reads a joint's name whatever prefix the skeleton uses", () => {
    expect(jointKey("mixamorig:LeftForeArm")).toBe("LeftForeArm");
    expect(jointKey("Head")).toBe("Head");
    expect(jointKey("Armature_Spine2")).toBe("Spine2");
  });

  it("looks up only to greet", () => {
    expect(attentionFor("greeting")).toBe(1);
    for (const stage of ["boot", "arrive", "entering", "browsing", "lookingAround", "productSelected", "builderLoading"] as const) expect(attentionFor(stage)).toBe(0);
  });

  it("picks the clip for each change of stage", () => {
    expect(seatedClipFor("greeting", "entering")).toBe("sit_look_up");
    expect(seatedClipFor("browsing", "greeting")).toBe("sit_nod");
    expect(seatedClipFor("lookingAround", "greeting")).toBe("sit_nod");
    expect(seatedClipFor("productSelected", "browsing")).toBe("sit_nod");
    expect(seatedClipFor("browsing", "browsing")).toBeNull();
    expect(seatedClipFor("entering", "arrive")).toBeNull();
  });
});
