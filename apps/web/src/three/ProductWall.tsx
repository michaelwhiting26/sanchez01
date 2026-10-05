"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import { Box3, Euler, MathUtils, Matrix4, Vector3, type Group } from "three";
import type { StoreProduct } from "@/lib/storefront/types";
import { useGltf } from "./use-gltf";
import { useScene } from "./scene-store";
import type { WorldProps } from "./types";

/** Part 4: the five products, each a real object at its own place in the room (not cards, not a carousel). */
export function ProductWall(props: WorldProps) {
  return (
    <>
      {props.bootstrap.products.map((product, i) => (
        <ProductModel key={product.id} product={product} position={i} {...props} />
      ))}
    </>
  );
}

function ProductModel({ product, position, stage, index, send }: WorldProps & { product: StoreProduct; position: number }) {
  const anchor = useScene((s) => s.anchors.get(`PRODUCT_${product.cameraAnchor}`));
  // The first product is needed as soon as the visitor is inside; the rest load once the store is open (spec: streaming).
  const wanted = position === 0 || stage !== "boot";
  const gltf = useGltf(wanted ? product.modelAsset : null);
  const spin = useRef<Group>(null);

  // Scale the model to its display height and stand it on (or hang it from) its mark, centred. A file authored lying down is turned upright first.
  // Nothing is re-parented here: this runs twice in development, and the model must end up exactly where React draws it.
  const fit = useMemo(() => {
    if (!gltf) return null;
    gltf.scene.updateMatrixWorld(true);
    const box = new Box3().setFromObject(gltf.scene);
    const rotation = new Euler(...(product.modelRotation ?? [0, 0, 0]));
    box.applyMatrix4(new Matrix4().makeRotationFromEuler(rotation));
    const size = box.getSize(new Vector3());
    const centre = box.getCenter(new Vector3());
    const scale = size.y > 0 ? product.displayHeight / size.y : 1;
    const y = product.hangs ? -box.max.y * scale : -box.min.y * scale;
    return { rotation, scale, offset: new Vector3(-centre.x * scale, y, -centre.z * scale) };
  }, [gltf, product.displayHeight, product.hangs, product.modelRotation]);

  const active = index === position && (stage === "browsing" || stage === "productSelected");
  useFrame((_, dt) => {
    const g = spin.current;
    if (!g) return;
    if (active) g.rotation.y += dt * (stage === "productSelected" ? 0.55 : 0.22);
    else g.rotation.y = MathUtils.damp(g.rotation.y, Math.round(g.rotation.y / (Math.PI * 2)) * Math.PI * 2, 4, dt);
  });

  if (!gltf || !fit || !anchor) return null;
  return (
    <group
      position={anchor}
      onClick={(e) => {
        if (stage !== "browsing") return;
        e.stopPropagation();
        if (index === position) send({ type: "SELECT_PRODUCT", productId: product.id, index: position });
        else send({ type: "GO_TO_PRODUCT", index: position });
      }}
    >
      <group ref={spin}>
        <group position={fit.offset} scale={fit.scale} rotation={fit.rotation}>
          <primitive object={gltf.scene} />
        </group>
      </group>
    </group>
  );
}
