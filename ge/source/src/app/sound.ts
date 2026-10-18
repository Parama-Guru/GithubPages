type Voice = "door" | "breaker" | "hum";

let context: AudioContext | null = null;
let humGain: GainNode | null = null;
let enabled = false;

function audio(): AudioContext | null {
  if (!enabled) return null;
  if (!context) {
    const Constructor = window.AudioContext ?? (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Constructor) return null;
    context = new Constructor();
  }
  if (context.state === "suspended") void context.resume();
  return context;
}

function noise(ctx: AudioContext, seconds: number): AudioBuffer {
  const buffer = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * seconds), ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  return buffer;
}

export function setSound(value: boolean): void {
  enabled = value;
  if (!value) {
    humGain?.gain.setTargetAtTime(0, context?.currentTime ?? 0, 0.2);
    void context?.suspend();
  } else {
    audio();
  }
}

export function play(voice: Voice): void {
  const ctx = audio();
  if (!ctx) return;
  const now = ctx.currentTime;
  if (voice === "hum") {
    if (!humGain) {
      humGain = ctx.createGain();
      humGain.gain.value = 0;
      humGain.connect(ctx.destination);
      for (const [frequency, level] of [
        [50, 0.5],
        [100, 0.3],
        [150, 0.12],
      ] as const) {
        const oscillator = ctx.createOscillator();
        const gain = ctx.createGain();
        oscillator.frequency.value = frequency;
        gain.gain.value = level;
        oscillator.connect(gain).connect(humGain);
        oscillator.start();
      }
    }
    humGain.gain.setTargetAtTime(0.025, now, 0.6);
    return;
  }
  const source = ctx.createBufferSource();
  source.buffer = noise(ctx, voice === "door" ? 1.4 : 0.3);
  const filter = ctx.createBiquadFilter();
  const gain = ctx.createGain();
  if (voice === "door") {
    filter.type = "bandpass";
    filter.frequency.setValueAtTime(400, now);
    filter.frequency.exponentialRampToValueAtTime(1800, now + 1.2);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.09, now + 0.3);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.4);
  } else {
    filter.type = "lowpass";
    filter.frequency.value = 900;
    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.28);
    const thump = ctx.createOscillator();
    const thumpGain = ctx.createGain();
    thump.frequency.setValueAtTime(110, now);
    thump.frequency.exponentialRampToValueAtTime(40, now + 0.2);
    thumpGain.gain.setValueAtTime(0.3, now);
    thumpGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.25);
    thump.connect(thumpGain).connect(ctx.destination);
    thump.start(now);
    thump.stop(now + 0.3);
  }
  source.connect(filter).connect(gain).connect(ctx.destination);
  source.start(now);
}

export function quiet(): void {
  if (context && humGain) humGain.gain.setTargetAtTime(0, context.currentTime, 0.4);
}
