import type { World } from "@/world/world";
import type { ChapterRange } from "@/world/path";
import { gsap, ScrollTrigger, SplitText, type Motion } from "./motion";

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

export function splitHeading(element: HTMLElement): SplitText {
  return SplitText.create(element, { type: "lines,chars", mask: "lines", linesClass: "split-line", charsClass: "split-char" });
}

export function initJourney(root: HTMLElement, motion: Motion, world: World | null, onEnter: (y: number) => void): Controller {
  const journey = root.querySelector<HTMLElement>("[data-journey]");
  const chapters = [...root.querySelectorAll<HTMLElement>(".chapter")];
  const splits: SplitText[] = [];
  const triggers: ScrollTrigger[] = [];
  const timelines: gsap.core.Timeline[] = [];
  if (!journey) return { destroy: () => undefined };

  if (!world || !motion.enabled) {
    if (motion.enabled) {
      for (const panel of root.querySelectorAll<HTMLElement>(".chapter-panel")) {
        const tween = gsap.from(panel.children, { y: 26, opacity: 0, stagger: 0.06, duration: 0.8, ease: "power3.out", scrollTrigger: { trigger: panel, start: "top 85%", once: true } });
        timelines.push(tween as unknown as gsap.core.Timeline);
      }
    }
    return {
      destroy() {
        for (const timeline of timelines) {
          timeline.scrollTrigger?.kill();
          timeline.kill();
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

  chapters.forEach((chapter, index) => {
    const panel = chapter.querySelector<HTMLElement>(".chapter-panel");
    if (!panel) return;
    const heading = panel.querySelector<HTMLElement>("[data-split]");
    const split = heading ? splitHeading(heading) : null;
    if (split) splits.push(split);
    const others = [...panel.children].filter((child) => child !== heading);
    const chars = split?.chars ?? [];
    const timeline = gsap.timeline({
      defaults: { ease: "power3.out" },
      scrollTrigger: { trigger: chapter, start: "top top", end: "bottom bottom", scrub: 0.4 },
    });
    if (index > 0) {
      timeline.fromTo(chars, { yPercent: 110 }, { yPercent: 0, stagger: 0.004, duration: 0.12, immediateRender: true }, 0);
      timeline.fromTo(others, { y: 34, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.02, duration: 0.1, immediateRender: true }, 0.03);
      counters(panel, timeline, 0.04);
    }
    timeline.to({}, { duration: 0.62 }, index > 0 ? 0.2 : 0);
    if (index < chapters.length - 1) {
      timeline.to(chars, { yPercent: -110, stagger: 0.003, duration: 0.1, ease: "power2.in" }, 0.84);
      timeline.to(others, { y: -26, opacity: 0, stagger: 0.012, duration: 0.1, ease: "power2.in" }, 0.84);
    }
    timelines.push(timeline);
  });

  const first = chapters[0]?.querySelector<HTMLElement>(".chapter-panel");
  const firstSplit = splits[0];
  if (first && firstSplit) {
    const intro = gsap.timeline({ delay: 0.25 });
    intro.from(firstSplit.chars, { yPercent: 110, stagger: 0.025, duration: 1.1, ease: "expo.out" });
    intro.from([...first.children].filter((child) => !child.matches("[data-split]")), { y: 24, opacity: 0, stagger: 0.08, duration: 0.9, ease: "power3.out" }, 0.35);
    timelines.push(intro);
  }

  const enter = () => {
    const second = chapters[1];
    if (!second) return;
    onEnter(second.offsetTop + (second.offsetHeight - window.innerHeight) * 0.32);
  };
  const buttons = [...root.querySelectorAll<HTMLButtonElement>("[data-action='enter']")];
  for (const button of buttons) button.addEventListener("click", enter);
  ScrollTrigger.refresh();

  return {
    destroy() {
      for (const button of buttons) button.removeEventListener("click", enter);
      for (const timeline of timelines) {
        timeline.scrollTrigger?.kill();
        timeline.kill();
      }
      for (const trigger of triggers) trigger.kill();
      for (const split of splits) split.revert();
      document.documentElement.classList.remove("is-scrolled");
    },
  };
}

export function chapterScroll(root: HTMLElement, id: string): number | null {
  const chapter = root.querySelector<HTMLElement>(`#${CSS.escape(id)}`);
  if (!chapter) return null;
  return chapter.offsetTop + Math.max(0, chapter.offsetHeight - window.innerHeight) * 0.32;
}
