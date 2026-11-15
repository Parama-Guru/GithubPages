import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { SplitText } from "gsap/SplitText";
import type Lenis from "lenis";

gsap.registerPlugin(ScrollTrigger);

/** `split` is GSAP's SplitText while the 3D tour runs; heading splits and smooth scrolling belong to it alone. */
export type Motion = { lenis: Lenis | null; enabled: boolean; split: typeof SplitText | null; destroy(): void };

// Lenis and SplitText are loaded only for the 3D tour, so the 2D site never downloads or parses them.
export async function createMotion(enabled: boolean): Promise<Motion> {
  if (!enabled) {
    ScrollTrigger.config({ ignoreMobileResize: true });
    return { lenis: null, enabled, split: null, destroy: () => undefined };
  }
  const [{ default: Smooth }, { SplitText: Split }] = await Promise.all([import("lenis"), import("gsap/SplitText")]);
  gsap.registerPlugin(Split);
  // Phones show and hide their address bar while scrolling; the chapters are sized in svh, so that resize must not
  // trigger a full refresh (a forced layout of the page) mid-scroll.
  ScrollTrigger.config({ ignoreMobileResize: true });
  const lenis = new Smooth({ autoRaf: false, lerp: 0.085, wheelMultiplier: 0.9, touchMultiplier: 1.2, anchors: true });
  lenis.on("scroll", ScrollTrigger.update);
  const raf = (time: number) => lenis.raf(time * 1000);
  gsap.ticker.add(raf);
  gsap.ticker.lagSmoothing(0);
  return {
    lenis,
    enabled,
    split: Split,
    destroy() {
      gsap.ticker.remove(raf);
      lenis.destroy();
    },
  };
}

export function scrollTo(motion: Motion, target: number | HTMLElement, duration = 1.2): void {
  if (motion.lenis) motion.lenis.scrollTo(target, { duration, easing: (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2) });
  else if (typeof target === "number") window.scrollTo({ top: target });
  else target.scrollIntoView();
}

export { gsap, ScrollTrigger };
export type { SplitText };
