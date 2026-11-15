import type { World } from "@/world/world";
import type { ChapterRange } from "@/world/path";
import { gsap, ScrollTrigger, type Motion, type SplitText } from "./motion";

export type Controller = { destroy(): void };

function counters(root: HTMLElement, timeline?: gsap.core.Timeline, at = 0) {
  for (const element of root.querySelectorAll<HTMLElement>("[data-count]")) {
    const final = element.dataset.final ?? element.textContent ?? "";
    const target = Number(element.dataset.count);
    const state = { value: 0 };
    const tween = gsap.to(state, {
      value: target,
      duration: 0.14,
      ease: "power2.out",
      onUpdate: () => {
        element.textContent = state.value >= target ? final : Math.round(state.value).toLocaleString("en-US");
      },
    });
    if (timeline) timeline.add(tween, at);
  }
}

// Script lettering joins letter to letter, so it is kept whole instead of being split into characters.
const SCRIPT = ".title-script";
/** How far (in % of a character's height) characters travel to hide inside their line mask, deep descenders included. */
const RISE = 135;

/** Splits a heading for its masked reveal; `Split` is GSAP's SplitText, loaded with the 3D tour (motion.split). */
function splitHeading(Split: typeof SplitText, element: HTMLElement): SplitText {
  return Split.create(element, { type: "lines,chars", mask: "lines", linesClass: "split-line", charsClass: "split-char", ignore: [...element.querySelectorAll(SCRIPT)] });
}

/** The characters of a split heading followed by its script words, which move as single pieces. */
function headingPieces(split: SplitText): Element[] {
  return [...split.chars, ...split.elements.flatMap((element) => [...element.querySelectorAll(SCRIPT)])];
}

const inView = (element: Element, edge = 0.85) => element.getBoundingClientRect().top < window.innerHeight * edge;

/** Fades a frosted card (main.css --card) through a plain object: GSAP reads computed styles to tween CSS variables. */
function card(panel: HTMLElement, from: number, to: number, vars: gsap.TweenVars): gsap.core.Tween {
  const state = { value: from };
  return gsap.fromTo(state, { value: from }, { value: to, ...vars, onUpdate: () => panel.style.setProperty("--card", String(state.value)) });
}

export function initJourney(root: HTMLElement, motion: Motion, world: World | null, onEnter: (y: number) => void, intro = true): Controller {
  const journey = root.querySelector<HTMLElement>("[data-journey]");
  const chapters = [...root.querySelectorAll<HTMLElement>(".chapter")];
  const splits: SplitText[] = [];
  const triggers: ScrollTrigger[] = [];
  const timelines: gsap.core.Timeline[] = [];
  if (!journey) return { destroy: () => undefined };

  const enter = () => {
    const second = chapters[1];
    if (!second) return;
    onEnter(world ? second.offsetTop + (second.offsetHeight - window.innerHeight) * 0.32 : second.offsetTop);
  };
  const buttons = [...root.querySelectorAll<HTMLButtonElement>("[data-action='enter']")];
  for (const button of buttons) button.addEventListener("click", enter);

  if (!world || !motion.enabled) {
    if (motion.enabled) {
      for (const panel of root.querySelectorAll<HTMLElement>(".chapter-panel")) {
        // Content that is already on screen stays put; animating it again would make it flash.
        if (!intro && inView(panel)) continue;
        const tween = gsap.from(panel.children, { y: 26, opacity: 0, stagger: 0.06, duration: 0.8, ease: "power3.out", scrollTrigger: { trigger: panel, start: "top 85%", once: true } });
        timelines.push(tween as unknown as gsap.core.Timeline);
      }
    }
    return {
      destroy() {
        for (const button of buttons) button.removeEventListener("click", enter);
        for (const timeline of timelines) {
          timeline.scrollTrigger?.kill();
          timeline.revert();
        }
      },
    };
  }

  const ranges = (): ChapterRange[] => {
    const scrollable = Math.max(1, journey.offsetHeight - window.innerHeight);
    const top = journey.offsetTop;
    return chapters.map((chapter, index) => {
      const start = (chapter.offsetTop - top) / scrollable;
      const next = chapters[index + 1];
      const end = next ? (next.offsetTop - top) / scrollable : 1;
      return { start, end };
    });
  };
  let current = ranges();

  triggers.push(
    ScrollTrigger.create({
      trigger: journey,
      start: "top top",
      end: "bottom bottom",
      onRefresh: (self) => {
        current = ranges();
        world.setJourney(self.progress, current);
      },
      onUpdate: (self) => {
        world.setJourney(self.progress, current);
        document.documentElement.classList.toggle("is-scrolled", self.scroll() > 40);
      },
    }),
  );

  // Split every heading first, then let GSAP read every element it will animate in one pass, before any tween writes
  // a style: interleaving reads and writes per chapter forced a style and layout recalculation for each character.
  const panels = chapters.map((chapter) => chapter.querySelector<HTMLElement>(".chapter-panel"));
  const parts = panels.map((panel) => {
    if (!panel) return null;
    const heading = panel.querySelector<HTMLElement>("[data-split]");
    const split = heading && motion.split ? splitHeading(motion.split, heading) : null;
    if (split) splits.push(split);
    return { panel, split, chars: split ? headingPieces(split) : [], others: [...panel.children].filter((child) => child !== heading) };
  });
  for (const part of parts) for (const element of [...(part?.chars ?? []), ...(part?.others ?? [])]) gsap.getProperty(element, "y");
  const opens = intro && Boolean(parts[0]?.split);

  chapters.forEach((chapter, index) => {
    const part = parts[index];
    if (!part) return;
    const { panel, chars, others } = part;
    // Later cards start hidden (their entry below fades them in); the first is shown unless the intro fades it in.
    panel.style.setProperty("--card", index > 0 || opens ? "0" : "1");
    const timeline = gsap.timeline({
      defaults: { ease: "power3.out" },
      scrollTrigger: { trigger: chapter, start: "top top", end: "bottom bottom", scrub: 0.4 },
    });
    if (index > 0) {
      timeline.fromTo(chars, { yPercent: RISE }, { yPercent: 0, stagger: 0.004, duration: 0.12, immediateRender: true }, 0);
      timeline.fromTo(others, { y: 34, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.02, duration: 0.1, immediateRender: true }, 0.03);
      // The frosted card behind the text (main.css) fades with it, so the scene is clear while travelling.
      timeline.add(card(panel, 0, 1, { duration: 0.1, ease: "power3.out", immediateRender: true }), 0.03);
      counters(panel, timeline, 0.04);
    }
    timeline.to({}, { duration: 0.62 }, index > 0 ? 0.2 : 0);
    if (index < chapters.length - 1) {
      timeline.to(chars, { yPercent: -RISE, stagger: 0.003, duration: 0.1, ease: "power2.in" }, 0.84);
      timeline.to(others, { y: -26, opacity: 0, stagger: 0.012, duration: 0.1, ease: "power2.in" }, 0.84);
      timeline.add(card(panel, 1, 0, { duration: 0.1, ease: "power2.in", immediateRender: false }), 0.86);
    }
    timelines.push(timeline);
  });

  const first = parts[0]?.panel;
  const firstSplit = parts[0]?.split;
  if (opens && first && firstSplit) {
    const opening = gsap.timeline({ delay: 0.25 });
    opening.from(headingPieces(firstSplit), { yPercent: RISE, stagger: 0.025, duration: 1.1, ease: "expo.out" });
    opening.add(card(first, 0, 1, { duration: 0.9, ease: "power2.out" }), 0);
    opening.from([...first.children].filter((child) => !child.matches("[data-split]")), { y: 24, opacity: 0, stagger: 0.08, duration: 0.9, ease: "power3.out" }, 0.35);
    timelines.push(opening);
  }

  // No ScrollTrigger.refresh() here: every caller refreshes once after mounting (main.ts), and each refresh measures the
  // whole page again (a forced layout).

  return {
    destroy() {
      for (const button of buttons) button.removeEventListener("click", enter);
      for (const timeline of timelines) {
        timeline.scrollTrigger?.kill();
        timeline.kill();
      }
      for (const trigger of triggers) trigger.kill();
      for (const split of splits) split.revert();
      for (const chapter of chapters) chapter.querySelector<HTMLElement>(".chapter-panel")?.style.removeProperty("--card");
      document.documentElement.classList.remove("is-scrolled");
    },
  };
}

export function chapterScroll(root: HTMLElement, id: string): number | null {
  const chapter = root.querySelector<HTMLElement>(`#${CSS.escape(id)}`);
  if (!chapter) return null;
  return chapter.offsetTop + Math.max(0, chapter.offsetHeight - window.innerHeight) * 0.32;
}
