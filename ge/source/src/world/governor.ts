/**
 * Adaptive render scale. Fed with the GPU time of each frame, it lowers the resolution while frames are too slow and
 * raises it again only when the faster frames leave room for the extra pixels (time grows with the scale squared),
 * with a cooldown between steps and a longer wait after a step down, so the scale never oscillates.
 */
export type GovernorOptions = {
  /** Lowest scale (share of the tier's pixel ratio). */
  min: number;
  /** A frame budget in ms: above it (75th percentile of `window` frames) the scale steps down. */
  budget: number;
  window?: number;
  /** Frames looked at before stepping up. */
  calm?: number;
  /** Factor of one step down (its inverse steps up). */
  step?: number;
  /** ms between any two steps. */
  cooldown?: number;
  /** ms after a step down before a step up. */
  settle?: number;
};

export type Governor = { readonly scale: number; sample(ms: number, now: number): number | null; reset(): void };

function percentile(values: readonly number[], share: number): number {
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * share))] ?? 0;
}

export function createGovernor({ min, budget, window = 24, calm = 90, step = 0.85, cooldown = 1500, settle = 6000 }: GovernorOptions): Governor {
  let scale = 1;
  let samples: number[] = [];
  let changed = -Infinity;
  let lowered = -Infinity;
  const round = (value: number) => Math.round(value * 100) / 100;
  return {
    get scale() {
      return scale;
    },
    sample(ms, now) {
      samples.push(ms);
      if (samples.length > calm) samples.shift();
      if (now - changed < cooldown) return null;
      const recent = samples.slice(-window);
      if (recent.length >= window && scale > min && percentile(recent, 0.75) > budget) {
        scale = Math.max(min, round(scale * step));
        changed = lowered = now;
        samples = [];
        return scale;
      }
      if (samples.length >= calm && scale < 1 && now - lowered > settle) {
        const next = Math.min(1, round(scale / step));
        // Raise only if the slower frames would still fit the budget with a margin at the larger size.
        if (percentile(samples, 0.9) * (next / scale) ** 2 < budget * 0.8) {
          scale = next;
          changed = now;
          samples = [];
          return scale;
        }
      }
      return null;
    },
    reset() {
      scale = 1;
      samples = [];
      changed = lowered = -Infinity;
    },
  };
}

type TimerQuery = { TIME_ELAPSED_EXT: number; GPU_DISJOINT_EXT: number };

/** GPU time of whole frames through EXT_disjoint_timer_query_webgl2 (results arrive a few frames later). */
export class GpuTimer {
  private readonly extension: TimerQuery | null;
  private readonly pending: WebGLQuery[] = [];
  private active: WebGLQuery | null = null;

  constructor(private readonly gl: WebGL2RenderingContext) {
    this.extension = gl.getExtension("EXT_disjoint_timer_query_webgl2") as TimerQuery | null;
  }

  get available(): boolean {
    return this.extension !== null;
  }

  begin(): void {
    if (!this.extension || this.active || this.pending.length > 6) return;
    const query = this.gl.createQuery();
    if (!query) return;
    this.gl.beginQuery(this.extension.TIME_ELAPSED_EXT, query);
    this.active = query;
  }

  end(): void {
    if (!this.extension || !this.active) return;
    this.gl.endQuery(this.extension.TIME_ELAPSED_EXT);
    this.pending.push(this.active);
    this.active = null;
  }

  /** Milliseconds of each frame measured since the last call, oldest first; a disjoint event voids the batch. */
  collect(): number[] {
    const { gl, extension } = this;
    if (!extension) return [];
    const results: number[] = [];
    while (this.pending.length) {
      const query = this.pending[0] as WebGLQuery;
      if (!gl.getQueryParameter(query, gl.QUERY_RESULT_AVAILABLE)) break;
      results.push(gl.getQueryParameter(query, gl.QUERY_RESULT) / 1e6);
      gl.deleteQuery(query);
      this.pending.shift();
    }
    return gl.getParameter(extension.GPU_DISJOINT_EXT) ? [] : results;
  }

  dispose(): void {
    if (this.active && this.extension) this.gl.endQuery(this.extension.TIME_ELAPSED_EXT);
    for (const query of [...this.pending, ...(this.active ? [this.active] : [])]) this.gl.deleteQuery(query);
    this.pending.length = 0;
    this.active = null;
  }
}
