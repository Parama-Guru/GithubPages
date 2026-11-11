import type { Tier } from "@/world/zones/shared";

type Capabilities = { webgl: boolean; reduced: boolean; saveData: boolean; prefer3d: boolean; tier: Tier; has3d: boolean; sound: boolean };

const store = {
  get(key: string): string | null {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  set(key: string, value: string): void {
    try {
      localStorage.setItem(key, value);
    } catch {
      return;
    }
  },
};

export const preferences = {
  reduced: () => store.get("ge-motion") === "reduce",
  prefer3d: () => store.get("ge-3d") !== "off",
  sound: () => store.get("ge-sound") === "on",
  paused: () => store.get("ge-pause") === "on",
  set(name: "motion" | "3d" | "sound" | "pause", value: boolean) {
    if (name === "motion") store.set("ge-motion", value ? "reduce" : "full");
    if (name === "3d") store.set("ge-3d", value ? "on" : "off");
    if (name === "sound") store.set("ge-sound", value ? "on" : "off");
    if (name === "pause") store.set("ge-pause", value ? "on" : "off");
  },
};

function detectTier(gl: WebGL2RenderingContext | null): Tier {
  if (!gl) return "low";
  const coarse = matchMedia("(pointer: coarse)").matches;
  if (coarse && Math.min(screen.width, screen.height) < 900) return "low";
  const debug = gl.getExtension("WEBGL_debug_renderer_info");
  const renderer = debug ? String(gl.getParameter(debug.UNMASKED_RENDERER_WEBGL)) : "";
  if (/swiftshader|llvmpipe|software|basic render/i.test(renderer)) return "low";
  if ((navigator.hardwareConcurrency ?? 4) <= 4) return "medium";
  return "high";
}

export function detect(): Capabilities {
  const probe = document.createElement("canvas");
  let gl: WebGL2RenderingContext | null;
  try {
    gl = probe.getContext("webgl2");
  } catch {
    gl = null;
  }
  const webgl = Boolean(gl);
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches || preferences.reduced();
  const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
  const saveData = Boolean(connection?.saveData);
  const prefer3d = preferences.prefer3d();
  const forced = new URLSearchParams(location.search).get("tier") as Tier | null;
  const tier = forced ?? detectTier(gl);
  gl?.getExtension("WEBGL_lose_context")?.loseContext();
  return { webgl, reduced, saveData, prefer3d, tier, has3d: webgl && !reduced && !saveData && prefer3d, sound: preferences.sound() };
}
