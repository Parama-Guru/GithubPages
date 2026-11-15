type Voice = "door" | "breaker" | "hum";

let context: AudioContext | null = null;
let humGain: GainNode | null = null;
let enabled = false;
let interacted = false;

// Browsers start audio only after a user gesture, and a touch only counts once it ends, so the hum waits for the
// visitor's first click, tap or key press on the page.
const gestures = ["pointerdown", "pointerup", "touchend", "keydown"] as const;

function gesture(): void {
  if (navigator.userActivation && !navigator.userActivation.isActive) return;
  interacted = true;
  for (const type of gestures) window.removeEventListener(type, gesture, { capture: true });
  if (enabled) play("hum");
}

for (const type of gestures) window.addEventListener(type, gesture, { capture: true, passive: true });

function audio(): AudioContext | null {
  if (!enabled) return null;
  if (!context) {
    const Constructor = window.AudioContext ?? (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Constructor) return null;
    const created = new Constructor();
    const track = () => {
      document.documentElement.dataset.audio = created.state;
    };
    created.addEventListener("statechange", track);
    context = created;
    track();
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

// Sound belongs to the 3D experience: on while the world runs, off in the static site.
export function setSound(value: boolean): void {
  enabled = value;
  document.documentElement.dataset.sound = value ? "on" : "off";
  if (value) {
    if (interacted) play("hum");
    return;
  }
  humGain?.gain.setTargetAtTime(0, context?.currentTime ?? 0, 0.2);
  void context?.suspend();
}

// Hidden tabs fall silent, as the 3D world stops drawing.
document.addEventListener("visibilitychange", () => {
  if (!context || !enabled) return;
  if (document.hidden) void context.suspend();
  else void context.resume();
});

export function play(voice: Voice): void {
  const ctx = audio();
  if (!ctx) return;
  document.documentElement.dataset.lastSound = voice;
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
