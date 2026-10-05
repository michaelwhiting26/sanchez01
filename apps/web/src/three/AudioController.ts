/**
 * Sound for the store (spec Part 1: audio starts only after the visitor's tap). Web Audio, no library.
 * Every sound is optional: a null or missing file is silently skipped, so the store runs the same before the recordings exist.
 */
export class AudioController {
  private ctx: AudioContext | null = null;
  private readonly buffers = new Map<string, AudioBuffer>();
  private readonly playing = new Map<string, { source: AudioBufferSourceNode; gain: GainNode }>();
  private muted = true;

  /** Call from the tap handler. Returns false when the browser has no Web Audio. */
  async resume(): Promise<boolean> {
    const Ctor = typeof window === "undefined" ? undefined : window.AudioContext;
    if (!Ctor) return false;
    this.ctx ??= new Ctor();
    if (this.ctx.state === "suspended") await this.ctx.resume().catch(() => undefined);
    return true;
  }

  setMuted(muted: boolean): void {
    this.muted = muted;
    for (const { gain } of this.playing.values()) gain.gain.value = muted ? 0 : 1;
  }

  async load(name: string, url: string | null): Promise<void> {
    if (!url || !this.ctx || this.buffers.has(name)) return;
    try {
      const data = await (await fetch(url)).arrayBuffer();
      this.buffers.set(name, await this.ctx.decodeAudioData(data));
    } catch {
      /* a missing recording must never stop the experience */
    }
  }

  /** Starts a sound; returns the time it started on the audio clock (for lip sync), or null if there is nothing to play. */
  play(name: string, opts: { loop?: boolean; fadeInMs?: number } = {}): number | null {
    const buffer = this.buffers.get(name);
    if (!this.ctx || !buffer) return null;
    this.stop(name);
    const source = this.ctx.createBufferSource();
    const gain = this.ctx.createGain();
    source.buffer = buffer;
    source.loop = opts.loop === true;
    const target = this.muted ? 0 : 1;
    if (opts.fadeInMs) {
      gain.gain.setValueAtTime(0, this.ctx.currentTime);
      gain.gain.linearRampToValueAtTime(target, this.ctx.currentTime + opts.fadeInMs / 1000);
    } else gain.gain.value = target;
    source.connect(gain).connect(this.ctx.destination);
    source.start();
    this.playing.set(name, { source, gain });
    source.onended = () => this.playing.delete(name);
    return this.ctx.currentTime;
  }

  fadeOut(name: string, ms: number): void {
    const hit = this.playing.get(name);
    if (!this.ctx || !hit) return;
    hit.gain.gain.cancelScheduledValues(this.ctx.currentTime);
    hit.gain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + ms / 1000);
    setTimeout(() => this.stop(name), ms + 40);
  }

  stop(name: string): void {
    const hit = this.playing.get(name);
    if (!hit) return;
    try {
      hit.source.stop();
    } catch {
      /* already stopped */
    }
    this.playing.delete(name);
  }

  get time(): number {
    return this.ctx?.currentTime ?? 0;
  }

  dispose(): void {
    for (const name of [...this.playing.keys()]) this.stop(name);
    void this.ctx?.close().catch(() => undefined);
    this.ctx = null;
  }
}
