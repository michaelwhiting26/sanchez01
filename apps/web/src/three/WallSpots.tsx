"use client";

import { Html } from "@react-three/drei";
import { COLLECTION_SPOT } from "@/lib/storefront/config";
import type { WorldProps } from "./types";

/**
 * The things on the wall a visitor can tap while looking around (owner, 6 Oct 2026). Each is a small marker pinned to its place in the room.
 * They only exist in that stage: a visitor who came to buy never has to notice them. The same stories are also listed as ordinary buttons in
 * the interface (StoreUI), so nobody has to find a marker to reach one.
 */
export function WallSpots({ bootstrap, stage, onOpenStory }: WorldProps) {
  if (stage !== "lookingAround") return null;
  return (
    <>
      {/* The collection display on his wall opens the collection: everything he has made. */}
      <Html position={[COLLECTION_SPOT[0], COLLECTION_SPOT[1], COLLECTION_SPOT[2]]} center zIndexRange={[4, 0]}>
        <button type="button" className="store-spot" onClick={() => onOpenStory("collection")} tabIndex={-1} aria-hidden="true">
          <span className="store-spot__dot" />
        </button>
      </Html>
      {bootstrap.wall.map((story) => (
        <Html key={story.id} position={[story.position[0], story.position[1], story.position[2]]} center zIndexRange={[4, 0]}>
          <button type="button" className="store-spot" onClick={() => onOpenStory(story.id)} tabIndex={-1} aria-hidden="true">
            <span className="store-spot__dot" />
          </button>
        </Html>
      ))}
    </>
  );
}
