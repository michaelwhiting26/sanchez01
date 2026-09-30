/**
 * Depth cards: tilt toward the cursor, layers parallax at their own depth, and a spotlight follows the pointer. Off for reduced motion and touch,
 * where the card gets `is-static` (captions visible, no tilt).
 */
const MAX_ROT = 14;
const MAX_T = 18;

export function attachDepthTilt(card: HTMLElement): () => void {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const touch = window.matchMedia("(hover: none)").matches;
  if (reduce || touch) {
    card.classList.add("is-static");
    return () => card.classList.remove("is-static");
  }
  const layers = Array.from(card.querySelectorAll<HTMLElement>("[data-depth]"));
  let tx = 0;
  let ty = 0;
  let cx = 0;
  let cy = 0;
  let raf = 0;
  let on = false;
  const frame = (): void => {
    cx += (tx - cx) * 0.12;
    cy += (ty - cy) * 0.12;
    card.style.transform = `perspective(900px) rotateX(${-cy * MAX_ROT}deg) rotateY(${cx * MAX_ROT}deg)`;
    for (const l of layers) {
      const d = Number(l.dataset["depth"]);
      l.style.transform = `translate3d(${cx * MAX_T * d}px,${cy * MAX_T * d}px,0) scale(${1 + 0.06 * Math.abs(d)})`;
    }
    raf = on || Math.abs(tx - cx) > 0.001 || Math.abs(ty - cy) > 0.001 ? requestAnimationFrame(frame) : 0;
  };
  const kick = (): void => {
    if (!raf) raf = requestAnimationFrame(frame);
  };
  const move = (e: PointerEvent): void => {
    const r = card.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top) / r.height;
    tx = x * 2 - 1;
    ty = y * 2 - 1;
    on = true;
    card.style.setProperty("--mx", `${x * 100}%`);
    card.style.setProperty("--my", `${y * 100}%`);
    kick();
  };
  const leave = (): void => {
    tx = 0;
    ty = 0;
    on = false;
    kick();
  };
  card.addEventListener("pointermove", move);
  card.addEventListener("pointerleave", leave);
  return () => {
    cancelAnimationFrame(raf);
    card.removeEventListener("pointermove", move);
    card.removeEventListener("pointerleave", leave);
  };
}
