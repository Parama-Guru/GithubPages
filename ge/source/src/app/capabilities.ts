import type { Tier } from "@/world/zones/shared";

type Capabilities = { webgl: boolean; reduced: boolean; saveData: boolean; slow: boolean; prefer3d: boolean; tier: Tier; has3d: boolean; probed: boolean };
type Connection = { saveData?: boolean; effectiveType?: string };

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

// The menu's one preference: the 3D experience, which brings its motion and sound with it. Stored values of the
// former pause, motion and sound switches (ge-pause, ge-motion, ge-sound) are ignored.
export const preferences = {
  prefer3d: () => store.get("ge-3d") !== "off",
  chose3d: () => store.get("ge-3d") === "on",
  set3d: (value: boolean) => store.set("ge-3d", value ? "on" : "off"),
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

/**
 * What the device and the visitor allow. `probe` false (every page but home, which never shows the 3D world) skips the
 * WebGL context and assumes WebGL 2 where the browser has it; the router probes for real on the way to the home page.
 */
export function detect(probe = true): Capabilities {
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const connection = (navigator as Navigator & { connection?: Connection }).connection;
  const saveData = Boolean(connection?.saveData);
  // 2G links skip the 3D download (as with Data Saver) unless the visitor switched 3D on in the menu.
  const slow = /(^|-)2g$/.test(connection?.effectiveType ?? "") && !preferences.chose3d();
  const prefer3d = preferences.prefer3d();
  const forced = new URLSearchParams(location.search).get("tier") as Tier | null;
  const supported = "WebGL2RenderingContext" in window;
  // Creating a WebGL context costs a few hundred milliseconds, so the 2D site never makes one. With 3D wanted the
  // context is made on the scene's own canvas with the renderer's settings, and the renderer then reuses it.
  if (reduced || saveData || slow || !prefer3d) return { webgl: supported, reduced, saveData, slow, prefer3d, tier: forced ?? "low", has3d: false, probed: true };
  if (!probe) return { webgl: supported, reduced, saveData, slow, prefer3d, tier: forced ?? "low", has3d: supported, probed: false };
  const phone = matchMedia("(pointer: coarse)").matches && Math.min(screen.width, screen.height) < 900;
  const canvas = document.querySelector<HTMLCanvasElement>("[data-canvas]") ?? document.createElement("canvas");
  let gl: WebGL2RenderingContext | null;
  try {
    gl = canvas.getContext("webgl2", { alpha: false, antialias: (forced ?? (phone ? "low" : "")) === "low", stencil: false, powerPreference: "high-performance" });
  } catch {
    gl = null;
  }
  const webgl = Boolean(gl);
  const tier = forced ?? detectTier(gl);
  return { webgl, reduced, saveData, slow, prefer3d, tier, has3d: webgl, probed: true };
}
