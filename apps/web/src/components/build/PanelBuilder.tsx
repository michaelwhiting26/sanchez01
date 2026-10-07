"use client";

import Link from "next/link";
import { lazy, Suspense, useEffect, useMemo, useRef, useState } from "react";
import { WAITLIST_HREF } from "@/lib/catalogue";
import type { Finish } from "@/lib/configurator/schema";
import {
  FINISH_LIST, FINISH_NAMES, FONTS, PALETTE, SIZE_MAX, SIZE_MIN, TEXT_MAX, THREAD_COLOURS, UPLOAD_MAX_BYTES, UPLOAD_TYPES, builderSpec, look as makeLook, zoneOf,
  type BuilderArt, type BuilderPanels, type BuilderProduct, type FontId, type LogoArt, type PanelLook, type TextArt,
} from "@/lib/builder/product";
import { builderFor } from "@/lib/builder/registry";
import { loadDesign, saveDesign } from "@/lib/builder/save";
import { LOGO_SRC } from "@/lib/site";
import type { PanelStageHandle } from "./PanelStage";
import "../../styles/cockpit.v3.css";
import "../../styles/panel-builder.css";

// The 3D is its own download: the page and its controls arrive first.
const PanelStage = lazy(() => import("./PanelStage").then((m) => ({ default: m.PanelStage })));

const STEPS = [
  { id: "colours", label: "Colours" },
  { id: "logos", label: "Logos" },
  { id: "words", label: "Words" },
  { id: "review", label: "Review" },
] as const;
type StepId = (typeof STEPS)[number]["id"];
const pad = (n: number): string => String(n).padStart(2, "0");
const newId = (): string => (typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `a${Date.now()}${Math.round(Math.random() * 1e6)}`);

/**
 * The panel builder: one screen for every product that is made of coloured panels (gloves, the head guard). What differs between products is data
 * (lib/builder/product.ts), not this screen. Same cockpit as the bag: the product fills the screen, the camera turns to the panel being decided, and
 * one thin dock asks one thing at a time. Four steps: colour every panel, add logos, add words, then review four pictures of the finished design.
 * Nothing is sold here yet: no price is confirmed and these orders are not open, so the last step leads to the waiting list.
 * An uploaded logo never leaves the visitor's device.
 */
export function PanelBuilder({ slug }: { slug: string }) {
  const found = builderFor(slug);
  if (!found) throw new Error(`panel builder: no product is set up for "${slug}"`);
  return <Builder product={found} />;
}

const FALLBACK: PanelLook = makeLook("#808080");

function Builder({ product }: { product: BuilderProduct }) {
  const [step, setStep] = useState<StepId>("colours");
  const [panels, setPanels] = useState<BuilderPanels>(product.defaults);
  const [art, setArt] = useState<readonly BuilderArt[]>([]);
  const [active, setActive] = useState<string>(product.panels[0] ?? "");
  const at = (p: string): PanelLook => panels[p] ?? FALLBACK;
  const nameOf = (p: string): string => product.panelNames[p] ?? p;
  const startOf = (p: string): { u: number; v: number } => product.artStart[p] ?? { u: 0.5, v: 0.5 };
  const [selected, setSelected] = useState<string | null>(null);
  const [split, setSplit] = useState<Partial<Record<string, boolean>>>({});
  const [more, setMore] = useState(false);
  const [imagesVersion, setImagesVersion] = useState(0);
  const [shots, setShots] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [ready, setReady] = useState(false);
  const images = useRef(new Map<string, HTMLImageElement>());
  const stage = useRef<PanelStageHandle>(null);
  const root = useRef<HTMLDivElement>(null);
  const restored = useRef(false);

  // pick up the colours and words from the last visit (uploaded pictures are not kept: they never leave the page)
  useEffect(() => {
    setMounted(true);
    const saved = loadDesign(product);
    if (saved) {
      setPanels(saved.panels);
      setArt(saved.words);
    }
    restored.current = true;
  }, [product]);
  useEffect(() => {
    if (restored.current) saveDesign(product, panels, art);
  }, [product, panels, art]);

  const stepIndex = STEPS.findIndex((s) => s.id === step);
  const go = (to: StepId): void => {
    setProblem(null);
    if (to === "review") setShots(stage.current?.capture() ?? []);
    if (to === "logos") setSelected(art.find((a) => a.kind === "logo")?.id ?? null);
    if (to === "words") setSelected(art.find((a) => a.kind === "text")?.id ?? null);
    setStep(to);
  };
  const next = (): void => go((STEPS[Math.min(STEPS.length - 1, stepIndex + 1)] as (typeof STEPS)[number]).id);
  const prev = (): void => go((STEPS[Math.max(0, stepIndex - 1)] as (typeof STEPS)[number]).id);

  /* ---- colours ---- */
  const zone = zoneOf(product, active);
  const isSplit = !!split[zone.id];
  const look = at(active);
  const targets: readonly string[] = zone.linked && !isSplit && zone.linked.includes(active) ? zone.linked : [active];
  const write = (patch: Partial<{ hex: string; finish: Finish }>): void => {
    const nextPanels = { ...panels };
    for (const t of targets) nextPanels[t] = { ...at(t), ...patch };
    setPanels(nextPanels);
  };
  const pos = product.panels.indexOf(active) + 1;

  /* ---- logos and words ---- */
  const current = art.find((a) => a.id === selected) ?? null;
  const patchArt = (id: string, patch: Partial<Pick<BuilderArt, "panel" | "u" | "v" | "size" | "turn">> | Partial<Pick<TextArt, "text" | "font" | "hex">>): void =>
    setArt((list) => list.map((a) => (a.id === id ? { ...a, ...patch } : a)));
  const removeArt = (id: string): void => {
    images.current.delete(id);
    setImagesVersion((v) => v + 1);
    setArt((list) => list.filter((a) => a.id !== id));
    setSelected(null);
  };
  const place = (panel: string, u: number, v: number): void => {
    if (!selected) return;
    patchArt(selected, { panel, u, v });
    setActive(panel);
  };
  const addLogo = (file: File | undefined): void => {
    setProblem(null);
    if (!file) return;
    if (!(UPLOAD_TYPES as readonly string[]).includes(file.type)) return setProblem("That file type is not supported. Use a PNG, JPG, WEBP or SVG.");
    if (file.size > UPLOAD_MAX_BYTES) return setProblem("That file is over 8 MB. Use a smaller one.");
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const id = newId();
      images.current.set(id, img);
      const logo: LogoArt = { id, kind: "logo", fileName: file.name, aspect: img.naturalWidth > 0 && img.naturalHeight > 0 ? img.naturalWidth / img.naturalHeight : 1, panel: product.logoStart.panel, ...startOf(product.logoStart.panel), size: product.logoStart.size, turn: 0 };
      setArt((list) => [...list, logo]);
      setImagesVersion((v) => v + 1);
      setSelected(id);
      setActive(product.logoStart.panel);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      setProblem("That picture could not be opened. Try another file.");
    };
    img.src = url;
  };
  const addWords = (): void => {
    const id = newId();
    const words: TextArt = { id, kind: "text", text: "YOUR NAME", font: "block", hex: THREAD_COLOURS[0].hex, panel: product.wordsStart.panel, ...startOf(product.wordsStart.panel), size: product.wordsStart.size, turn: 0 };
    setArt((list) => [...list, words]);
    setSelected(id);
    setActive(product.wordsStart.panel);
  };
  const logos = art.filter((a): a is LogoArt => a.kind === "logo");
  const words = art.filter((a): a is TextArt => a.kind === "text");

  /* ---- review ---- */
  const spec = useMemo(() => builderSpec(product, panels, art), [product, panels, art]);
  const copySpec = async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText(spec);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setProblem("The spec could not be copied on this device.");
    }
  };
  const savePictures = (): void => {
    shots.forEach((src, i) => {
      const a = document.createElement("a");
      a.href = src;
      a.download = `${product.fileStem}-${i + 1}.jpg`;
      a.click();
    });
  };

  const review = step === "review";
  return (
    <div className="ck gb" ref={root} data-parts="" data-gb-step={step} data-sheet={review ? "open" : undefined}>
      <h1 className="visually-hidden">{product.copy.heading}</h1>
      <div className="ck__stage">
        {mounted && (
          <Suspense fallback={null}>
            <PanelStage
              ref={stage} product={product} panels={panels} art={art} images={images.current} imagesVersion={imagesVersion} mode={step === "colours" || review ? "colour" : "art"}
              focus={active} selectedArt={review ? null : selected} fontRoot={root} onPickPanel={(p) => { if (step === "colours") setActive(p); }} onPlace={place}
              onSelectArt={setSelected} onReady={() => setReady(true)}
            />
          </Suspense>
        )}
        {!ready && <p className="gb__loading" role="status">Loading the {product.copy.noun}</p>}
        <p className="gb__standin">{product.copy.standIn}</p>
      </div>

      <header className="ck__top">
        <Link href="/" className="ck__brand" aria-label="Sanchez Custom Boxing Equipment, back to the store"><img src={LOGO_SRC} alt="" width={44} height={38} /></Link>
        <div className="ck__mid">
          <ol className="ck__track" aria-label="Build progress">
            {STEPS.map((s, i) => (
              <li key={s.id} data-state={i < stepIndex ? "answered" : undefined} aria-current={s.id === step ? "step" : undefined}>
                <button type="button" aria-label={`${s.label}, step ${i + 1} of ${STEPS.length}`} onClick={() => go(s.id)} />
              </li>
            ))}
          </ol>
          <p className="ck__price">{product.copy.priceLabel} · <strong>Price to come</strong></p>
        </div>
        <Link href="/" className="ck__save">Back</Link>
      </header>

      {!review && (
        <section className="ck__dock" aria-label={STEPS[stepIndex]?.label}>
          <p className="ck__ask"><span>{pad(stepIndex + 1)} / {pad(STEPS.length)}</span>{step === "colours" ? "Colour each panel" : step === "logos" ? "Add your logo" : "Add your words"}</p>
          <div className="ck__row">
            <button type="button" className="ck__icon" onClick={prev} disabled={stepIndex === 0} aria-label="Previous step">‹</button>
            <div className="ck__scroll">
              {step === "colours" && (
                <div className="pp">
                  <div className="pp__zones gb__zones" role="tablist" aria-label={`Part of the ${product.copy.noun}`} style={{ gridTemplateColumns: `repeat(${product.zones.length}, 1fr)` }}>
                    {product.zones.map((z) => (
                      <button key={z.id} type="button" role="tab" aria-selected={z.id === zone.id} onClick={() => setActive(z.parts[0] ?? active)}>{z.label}</button>
                    ))}
                  </div>
                  <p className="pp__hint"><span>Part {pos} of {product.panels.length}</span>{nameOf(active)} · {zone.hint}</p>
                  <div className="pp__parts">
                    {zone.linked && (
                      <button type="button" className="pp__link" aria-pressed={isSplit} onClick={() => setSplit((s) => ({ ...s, [zone.id]: !isSplit }))}>
                        {isSplit ? "Edit each ✓" : `${zone.linkedName ?? "Together"} · edit each`}
                      </button>
                    )}
                    {zone.parts.filter((p) => isSplit || !zone.linked?.includes(p) || p === zone.linked[0]).map((p) => (
                      <button key={p} type="button" aria-pressed={p === active || (!isSplit && !!zone.linked?.includes(p) && zone.linked.includes(active))} onClick={() => setActive(p)}>
                        <i style={{ background: at(p).hex }} />
                        {!isSplit && zone.linked?.includes(p) ? zone.linkedName : nameOf(p)}
                      </button>
                    ))}
                  </div>
                  <div className="pp__sw" role="radiogroup" aria-label={`${nameOf(active)} colour`}>
                    {PALETTE.map((c) => (
                      <button key={c.hex} type="button" role="radio" aria-checked={look.hex.toLowerCase() === c.hex.toLowerCase()} aria-label={c.name} title={c.name} style={{ background: c.hex }} onClick={() => write({ hex: c.hex })} />
                    ))}
                    <label className="pp__custom" title="Custom colour">
                      <i style={{ background: look.hex }} />
                      Custom
                      <input type="color" value={look.hex} aria-label="Custom colour" onChange={(e) => write({ hex: e.target.value })} />
                    </label>
                  </div>
                  {!product.clothPanels.includes(active) && (
                    <div className="pp__more">
                      <button type="button" className="pp__moretoggle" aria-expanded={more} onClick={() => setMore((v) => !v)}>{more ? "Hide finish" : `Finish · ${FINISH_NAMES[look.finish]}`}</button>
                      {more && (
                        <div className="pp__finish" role="radiogroup" aria-label="Finish">
                          {FINISH_LIST.map((f) => <button key={f} type="button" role="radio" aria-checked={look.finish === f} onClick={() => write({ finish: f })}>{FINISH_NAMES[f]}</button>)}
                        </div>
                      )}
                    </div>
                  )}
                  {zone.id === product.colourwayZone && (
                    <div className="pp__ways" aria-label="Start from a colourway">
                      {product.colourways.map((w) => (
                        <button key={w.name} type="button" onClick={() => setPanels(w.apply(panels))} title={`${w.name}: sets every panel`}>
                          <i style={{ background: `linear-gradient(90deg, ${w.swatch[0]} 50%, ${w.swatch[1]} 50%)` }} />{w.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {step === "logos" && (
                <div className="pp">
                  <div className="pp__parts">
                    {logos.map((a) => (
                      <button key={a.id} type="button" aria-pressed={a.id === selected} onClick={() => { setSelected(a.id); setActive(a.panel); }}>{a.fileName}</button>
                    ))}
                    <label className="pp__custom gb__add">
                      + Add a logo
                      <input type="file" accept={UPLOAD_TYPES.join(",")} aria-label="Add a logo from this device" onChange={(e) => { addLogo(e.target.files?.[0]); e.target.value = ""; }} />
                    </label>
                  </div>
                  {current?.kind === "logo"
                    ? <ArtControls product={product} art={current} patch={(p) => patchArt(current.id, p)} goTo={(panel) => { patchArt(current.id, { panel, ...startOf(panel) }); setActive(panel); }} remove={() => removeArt(current.id)} />
                    : <p className="gb__note">PNG, JPG, WEBP or SVG, up to 8 MB. A clear background works best. Your file stays on this device.</p>}
                </div>
              )}

              {step === "words" && (
                <div className="pp">
                  <div className="pp__parts">
                    {words.map((a) => (
                      <button key={a.id} type="button" aria-pressed={a.id === selected} onClick={() => { setSelected(a.id); setActive(a.panel); }}>{a.text || "Empty"}</button>
                    ))}
                    <button type="button" className="pp__link" onClick={addWords}>+ Add words</button>
                  </div>
                  {current?.kind === "text" ? (
                    <>
                      <div className="gb__wordrow">
                        <input className="ck__input" type="text" maxLength={TEXT_MAX} value={current.text} aria-label="Your words" placeholder={`Up to ${TEXT_MAX} characters`} onChange={(e) => patchArt(current.id, { text: e.target.value })} />
                        <div className="pp__finish gb__fonts" role="radiogroup" aria-label="Lettering">
                          {FONTS.map((f) => <button key={f.id} type="button" role="radio" aria-checked={current.font === f.id} onClick={() => patchArt(current.id, { font: f.id satisfies FontId })}>{f.name}</button>)}
                        </div>
                      </div>
                      <div className="pp__sw" role="radiogroup" aria-label="Thread colour">
                        {THREAD_COLOURS.map((c) => (
                          <button key={c.hex} type="button" role="radio" aria-checked={current.hex.toLowerCase() === c.hex.toLowerCase()} aria-label={c.name} title={c.name} style={{ background: c.hex }} onClick={() => patchArt(current.id, { hex: c.hex })} />
                        ))}
                      </div>
                      <ArtControls product={product} art={current} patch={(p) => patchArt(current.id, p)} goTo={(panel) => { patchArt(current.id, { panel, ...startOf(panel) }); setActive(panel); }} remove={() => removeArt(current.id)} />
                    </>
                  ) : <p className="gb__note">A name, a nickname, a gym. Up to {TEXT_MAX} characters a line.</p>}
                </div>
              )}
            </div>
            <button type="button" className="ck__icon ck__icon--go" onClick={next} aria-label="Next step">›</button>
          </div>
          {problem && <p className="ck__err" role="alert">{problem}</p>}
        </section>
      )}

      {review && (
        <section className="ck__sheet gb__sheet" aria-label="Review">
          <p className="ck__tele">Review</p>
          <h2 className="ck__sq ck__sq--yours">{product.copy.reviewTitle}</h2>
          {shots.length > 0
            ? <div className="gb__shots">{shots.map((src, i) => <img key={i} src={src} alt={`Your ${product.copy.noun}, view ${i + 1} of ${shots.length}`} width={900} height={900} />)}</div>
            : <p className="ck__note ck__note--err" role="alert">The pictures could not be made on this device. Your design is still saved.</p>}
          <ul className="ck__list gb__list">
            {product.panels.map((p) => (
              <li key={p}>
                <span>{nameOf(p)}</span>
                <span className="gb__val"><i style={{ background: at(p).hex }} />{PALETTE.find((c) => c.hex.toLowerCase() === at(p).hex.toLowerCase())?.name ?? at(p).hex.toUpperCase()}{product.clothPanels.includes(p) ? "" : ` · ${FINISH_NAMES[at(p).finish]}`}</span>
                <button type="button" onClick={() => { setActive(p); go("colours"); }}>Edit</button>
              </li>
            ))}
            {art.map((a) => (
              <li key={a.id}>
                <span>{a.kind === "logo" ? "Logo" : "Words"}</span>
                <span className="gb__val">{a.kind === "logo" ? a.fileName : a.text} · {nameOf(a.panel)}</span>
                <button type="button" onClick={() => { setActive(a.panel); go(a.kind === "logo" ? "logos" : "words"); setSelected(a.id); }}>Edit</button>
              </li>
            ))}
          </ul>
          <p className="ck__note">{product.copy.reviewNote}</p>
          {problem && <p className="ck__note ck__note--err" role="alert">{problem}</p>}
          <div className="ck__sheetrow gb__actions">
            <Link className="ck__btn" href={WAITLIST_HREF}>Join the list</Link>
            <button type="button" className="ck__btn ck__btn--ghost" onClick={savePictures} disabled={shots.length === 0}>Save pictures</button>
            <button type="button" className="ck__btn ck__btn--ghost" onClick={() => void copySpec()}>{copied ? "Copied" : "Copy spec"}</button>
            <button type="button" className="ck__btn ck__btn--ghost" onClick={() => go("colours")}>Keep designing</button>
          </div>
        </section>
      )}
    </div>
  );
}

/** Where a mark sits, how big, which way up. The model can be tapped or the mark dragged; these controls do the same without touching the 3D. */
function ArtControls({ product, art, patch, goTo, remove }: { product: BuilderProduct; art: BuilderArt; patch: (p: Partial<Pick<BuilderArt, "size" | "turn" | "u" | "v">>) => void; goTo: (panel: string) => void; remove: () => void }) {
  return (
    <div className="gb__art">
      <p className="pp__hint"><span>Where</span>Tap the {product.copy.noun} to place it, or drag it</p>
      <div className="pp__parts" role="radiogroup" aria-label="Panel">
        {product.artPanels.map((p) => <button key={p} type="button" role="radio" aria-checked={art.panel === p} aria-pressed={art.panel === p} onClick={() => goTo(p)}>{product.panelNames[p] ?? p}</button>)}
      </div>
      <div className="gb__sliders">
        <label>Size<input type="range" min={SIZE_MIN} max={SIZE_MAX} step={0.01} value={art.size} onChange={(e) => patch({ size: Number(e.target.value) })} /></label>
        <label>Turn<input type="range" min={-180} max={180} step={1} value={art.turn} onChange={(e) => patch({ turn: Number(e.target.value) })} /></label>
        <label>Across<input type="range" min={0} max={1} step={0.005} value={art.u} onChange={(e) => patch({ u: Number(e.target.value) })} /></label>
        <label>Up and down<input type="range" min={0} max={1} step={0.005} value={art.v} onChange={(e) => patch({ v: Number(e.target.value) })} /></label>
      </div>
      <button type="button" className="pp__moretoggle gb__remove" onClick={remove}>Remove</button>
    </div>
  );
}
