import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import Lenis from "lenis";

gsap.registerPlugin(ScrollTrigger, SplitText);

export type Motion = { lenis: Lenis | null; enabled: boolean; destroy(): void };

export function createMotion(enabled: boolean): Motion {
  if (!enabled) {
    ScrollTrigger.config({ ignoreMobileResize: true });
    return { lenis: null, enabled, destroy: () => undefined };
  }
  const lenis = new Lenis({ autoRaf: false, lerp: 0.085, wheelMultiplier: 0.9, touchMultiplier: 1.2, anchors: true });
  lenis.on("scroll", ScrollTrigger.update);
  const raf = (time: number) => lenis.raf(time * 1000);
  gsap.ticker.add(raf);
  gsap.ticker.lagSmoothing(0);
  return {
    lenis,
    enabled,
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

export { gsap, ScrollTrigger, SplitText };
