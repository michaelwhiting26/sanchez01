/**
 * The rise panel's scroll curve: early rise, an eased plateau where the shaped top edge lingers, then the final rise. Velocity eases to about zero at
 * the plateau edges, so there is no kink. A pure function of scroll progress (0..1), reversible and repeatable.
 */
export const TEASE = { A: 0.34, B: 0.57, LO: 0.42, HI: 0.46 } as const;

const smooth = (x: number): number => x * x * (3 - 2 * x);

export function teaseRise(raw: number): number {
  if (raw < TEASE.A) return TEASE.LO * smooth(raw / TEASE.A);
  if (raw < TEASE.B) return TEASE.LO + (TEASE.HI - TEASE.LO) * smooth((raw - TEASE.A) / (TEASE.B - TEASE.A));
  return TEASE.HI + (1 - TEASE.HI) * smooth((raw - TEASE.B) / (1 - TEASE.B));
}
