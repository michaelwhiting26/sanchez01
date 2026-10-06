"use client";

import { useMachine } from "@xstate/react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { assetManager } from "@/experience/asset-manager";
import { flushEvents, track } from "@/experience/experience-events";
import { storeMachine, type StoreEventObject, type StoreStage } from "@/experience/store-machine";
import { TIMING } from "@/lib/storefront/config";
import { prefersReducedMotion, supportsWebGL2, wantsLightExperience } from "@/lib/storefront/device";
import { requestTiltPermission, startTilt, tiltNeedsPermission } from "@/lib/storefront/tilt";
import type { StoreBootstrap } from "@/lib/storefront/types";
import { AudioController } from "@/three/AudioController";
import { SwipeController } from "@/three/SwipeController";
import { StoreFallback } from "./StoreFallback";
import { StoreUI } from "./StoreUI";
import "../../styles/store.css";

// The 3D engine is its own chunk, loaded in the browser only: the page's first paint never waits for it.
const World = dynamic(() => import("@/three/World"), { ssr: false });

const SEEN_KEY = "sz_store_seen";

/** Parts 1 to 4 of the store on one screen: the 3D world, the thin interface over it, and the state machine that both obey. */
export function StoreExperience({ bootstrap }: { bootstrap: StoreBootstrap }) {
  const router = useRouter();
  const [snapshot, sendRaw] = useMachine(storeMachine, { input: { productCount: bootstrap.products.length } });
  const stage: StoreStage = snapshot.value;
  const { currentProductIndex: index, audioEnabled, returningCustomer } = snapshot.context;
  const send = useCallback((event: StoreEventObject) => sendRaw(event), [sendRaw]);

  const [mode, setMode] = useState<"pending" | "3d" | "fallback">("pending");
  const [reducedMotion, setReducedMotion] = useState(false);
  const [caption, setCaption] = useState<string | null>(null);
  const [tiltPrompt, setTiltPrompt] = useState(false);
  const stageEl = useRef<HTMLDivElement>(null);
  const audio = useMemo(() => new AudioController(), []);

  // Decide once whether this device gets the 3D store, and fetch the street and the room before the door can be tapped.
  useEffect(() => {
    const use3d = supportsWebGL2() && !wantsLightExperience();
    setMode(use3d ? "3d" : "fallback");
    setReducedMotion(prefersReducedMotion());
    if (!use3d) return;
    setTiltPrompt(tiltNeedsPermission() && !prefersReducedMotion());
    let live = true;
    let seen = false;
    try {
      seen = localStorage.getItem(SEEN_KEY) === "1";
    } catch {
      /* storage blocked: treat as a first visit */
    }
    void Promise.all([assetManager.load(bootstrap.scene.exterior), assetManager.load(bootstrap.scene.workshop)])
      .then(() => {
        if (!live) return;
        send({ type: "READY", returningCustomer: seen });
        track("store_loaded", { returning: seen });
      })
      .catch(() => live && setMode("fallback"));
    return () => {
      live = false;
    };
  }, [bootstrap.scene.exterior, bootstrap.scene.workshop, send]);

  useEffect(() => () => audio.dispose(), [audio]);

  // Tilting the phone looks around the shop front a little. Listening starts at once; on an iPhone readings begin when the visitor allows them.
  useEffect(() => (mode === "3d" && !reducedMotion ? startTilt() : undefined), [mode, reducedMotion]);
  const onEnableTilt = useCallback(() => {
    void requestTiltPermission().then(() => setTiltPrompt(false));
  }, []);

  const onEnter = useCallback(() => {
    if (stage !== "arrive") return;
    send({ type: "ENTER" });
    track("door_entered");
    // While the camera walks in, fetch what the room needs next (spec: streaming). The visitor never sees a loading screen after this tap.
    assetManager.preload([bootstrap.scene.jesse, ...bootstrap.products.map((p) => p.modelAsset)]);
    try {
      localStorage.setItem(SEEN_KEY, "1");
    } catch {
      /* fine */
    }
    void audio.resume().then(async (ok) => {
      if (!ok) return;
      audio.setMuted(!bootstrap.experience.soundDefault);
      send({ type: "SET_AUDIO", enabled: bootstrap.experience.soundDefault });
      await Promise.all([
        audio.load("door-open", bootstrap.audio.doorOpen),
        audio.load("workshop-roomtone", bootstrap.audio.roomTone),
        audio.load("welcome", bootstrap.voice.welcome.src),
        audio.load("welcome-back", bootstrap.voice.welcomeBack.src),
      ]);
      audio.play("door-open");
      audio.play("workshop-roomtone", { loop: true, fadeInMs: 800 });
    });
  }, [stage, send, audio, bootstrap]);

  const onToggleAudio = useCallback(() => {
    audio.setMuted(audioEnabled);
    send({ type: "SET_AUDIO", enabled: !audioEnabled });
  }, [audio, audioEnabled, send]);

  // Part 3: the greeting runs on a fixed timeline. Captions carry it when sound is off or the line is not recorded yet.
  const finishGreeting = useCallback(() => {
    if (stage !== "greeting") return;
    track("greeting_completed");
    send({ type: "GREETING_COMPLETE" });
  }, [stage, send]);

  useEffect(() => {
    if (stage !== "greeting") return;
    const clip = returningCustomer ? bootstrap.voice.welcomeBack : bootstrap.voice.welcome;
    const length = bootstrap.experience.greetingEnabled ? (returningCustomer ? TIMING.greetingBack : TIMING.greeting) : 0;
    track("greeting_started", { returning: returningCustomer });
    const timers: Array<ReturnType<typeof setTimeout>> = [];
    if (length > 0) {
      const first = clip.captions[0]?.start ?? 0;
      timers.push(setTimeout(() => void audio.play(returningCustomer ? "welcome-back" : "welcome"), first * 1000));
      for (const line of clip.captions) {
        timers.push(setTimeout(() => setCaption(line.text), line.start * 1000));
        timers.push(setTimeout(() => setCaption((c) => (c === line.text ? null : c)), line.end * 1000));
      }
    }
    timers.push(
      setTimeout(() => {
        track("greeting_completed");
        send({ type: "GREETING_COMPLETE" });
      }, length * 1000),
    );
    return () => {
      for (const t of timers) clearTimeout(t);
      setCaption(null);
    };
  }, [stage, returningCustomer, bootstrap.voice, bootstrap.experience.greetingEnabled, audio, send]);

  // Funnel events: when browsing starts, and how long each product held the visitor's attention.
  const viewed = useRef<{ index: number; at: number } | null>(null);
  useEffect(() => {
    if (stage !== "browsing") return;
    const now = performance.now();
    const last = viewed.current;
    if (!last) track("browse_started");
    else if (last.index !== index) {
      const prev = bootstrap.products[last.index];
      if (prev) track("product_viewed", { productId: prev.id, index: last.index, dwellMs: Math.round(now - last.at) });
      track("product_swiped", { from: last.index, to: index });
    }
    if (!last || last.index !== index) viewed.current = { index, at: now };
  }, [stage, index, bootstrap.products]);

  const selected = bootstrap.products[index];
  useEffect(() => {
    if (stage !== "productSelected" || !selected) return;
    track("product_selected", { productId: selected.id, index });
    router.prefetch(selected.builderRoute);
  }, [stage, selected, index, router]);

  const onDesign = useCallback(() => {
    if (stage !== "productSelected" || !selected) return;
    send({ type: "OPEN_BUILDER" });
    track("builder_started", { productId: selected.id });
    flushEvents();
    router.push(selected.builderRoute);
  }, [stage, selected, send, router]);

  // Swipe between products; arrow keys do the same on a keyboard.
  const stageRef = useRef(stage);
  stageRef.current = stage;
  useEffect(() => {
    const el = stageEl.current;
    if (!el || mode !== "3d") return;
    const swipe = new SwipeController(el, {
      enabled: () => stageRef.current === "browsing",
      onNext: () => send({ type: "NEXT_PRODUCT" }),
      onPrevious: () => send({ type: "PREV_PRODUCT" }),
    });
    const key = (e: KeyboardEvent): void => {
      if (e.key === "ArrowRight") send({ type: "NEXT_PRODUCT" });
      else if (e.key === "ArrowLeft") send({ type: "PREV_PRODUCT" });
      else if (e.key === "Escape") send({ type: "BACK" });
    };
    window.addEventListener("keydown", key);
    return () => {
      swipe.dispose();
      window.removeEventListener("keydown", key);
    };
  }, [mode, send]);

  if (mode === "fallback") return <StoreFallback bootstrap={bootstrap} />;
  return (
    <div className="store" ref={stageEl} data-stage={stage}>
      <div className="store__canvas" aria-hidden="true">
        {mode === "3d" ? <World bootstrap={bootstrap} stage={stage} index={index} returning={returningCustomer} reducedMotion={reducedMotion} send={send} /> : null}
      </div>
      <StoreUI
        bootstrap={bootstrap}
        stage={stage}
        index={index}
        caption={caption}
        audioEnabled={audioEnabled}
        canEnter={stage === "arrive"}
        tiltPrompt={tiltPrompt}
        send={send}
        onEnter={onEnter}
        onSkipGreeting={finishGreeting}
        onToggleAudio={onToggleAudio}
        onEnableTilt={onEnableTilt}
        onDesign={onDesign}
      />
    </div>
  );
}
