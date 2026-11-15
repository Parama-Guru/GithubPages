import type { Controller } from "./journey";
import { gsap, ScrollTrigger } from "./motion";

/* Animations of every page but home (in both modes) and of the 2D home (3D off: the menu switch, reduced motion, Data
   Saver, no WebGL or a failed 3D load). Styles in styles/main.css (pages) and styles/flat.css (2D home, line art, reveals).
   Without JavaScript or with reduced motion everything is shown in its final state; with motion, html gets .flat-motion
   and only content below the fold waits to rise in. Visibility comes from IntersectionObserver entries and the two scroll
   triggers measure only when ScrollTrigger refreshes, so nothing here reads layout while scrolling, and every animation
   is transform, opacity, clip-path or stroke-dashoffset. The entrance of a page opened by the router is main.is-entering
   (main.css). */

type Options = { animate: boolean; intro: boolean };

const html = document.documentElement;
// Lists whose items follow one another; any other target rises as one block.
const SEQUENCE =
  ".tags, .year-links, .flat-timeline, .flat-principles, .flat-extra > ul, .cards, .principles, .timeline, .gallery, .year-cards, .documents, .awards, .stats, .figures, .expertise, .manpower, .steps, .commitments, .logo-grid, .ehs-standards, .roles, .columns";
const HOME_TARGETS =
  ":scope > .chapter-panel > *, :scope > .flat-extra:is(.flat-marquee, .flat-contact-art), :scope > .flat-extra > :is(.flat-timeline, .flat-principles, ul, .flat-portrait, .flat-sign)";
// Two-column blocks reveal column by column; everything else in a sheet rises as it is.
const PAGE_TARGETS = ":scope > :not(.policy, .split, .split-text), :scope > :is(.policy, .split, .split-text) > *";

function revealTargets(root: HTMLElement): HTMLElement[] {
  const chapters = [...root.querySelectorAll<HTMLElement>(".journey > .chapter")];
  if (chapters.length) return chapters.slice(1).flatMap((chapter) => [...chapter.querySelectorAll<HTMLElement>(HOME_TARGETS)]);
  return [...root.querySelectorAll<HTMLElement>(".sheet")].flatMap((sheet) => [...sheet.querySelectorAll<HTMLElement>(PAGE_TARGETS)]);
}

function finalText(element: HTMLElement): string {
  return element.dataset.final ?? element.textContent ?? "";
}

/** The final text with its number replaced by the value reached so far ("2.67 million", "1,500", "230"). */
function counterText(element: HTMLElement, value: number): string {
  const final = finalText(element);
  const raw = element.dataset.count ?? element.dataset.tally ?? "";
  const decimals = raw.split(".")[1]?.length ?? 0;
  const match = /\d[\d,]*(\.\d+)?/.exec(final);
  if (!match) return final;
  const shown = decimals ? value.toFixed(decimals) : Math.round(value).toLocaleString("en-US");
  return final.slice(0, match.index) + shown + final.slice(match.index + match[0].length);
}

export function initFlat(root: HTMLElement, { animate, intro }: Options): Controller {
  const cleanups: (() => void)[] = [];
  const tweens: (gsap.core.Tween | gsap.core.Timeline)[] = [];
  const observers: IntersectionObserver[] = [];
  const arts = [...root.querySelectorAll<SVGSVGElement>("svg[data-art]")];

  if (!animate) {
    for (const art of arts) art.classList.add("is-drawn");
    return {
      destroy() {
        for (const art of arts) art.classList.remove("is-drawn");
      },
    };
  }

  html.classList.add("flat-motion");

  // Rise-in reveals: only what starts below the fold waits; what is already on screen stays put.
  const targets = revealTargets(root);
  for (const target of targets) {
    target.dataset.rv = target.matches(SEQUENCE) ? "seq" : "";
    if (target.dataset.rv === "seq") [...target.children].forEach((child, index) => (child as HTMLElement).style.setProperty("--i", String(Math.min(index, 12))));
  }
  const seen = new WeakSet<Element>();
  const timers: number[] = [];
  const reveal = new IntersectionObserver(
    (entries) => {
      let order = 0;
      for (const entry of entries) {
        const element = entry.target as HTMLElement;
        if (entry.isIntersecting) {
          if (element.classList.contains("rv-wait")) {
            element.style.setProperty("--rv-delay", `${Math.min(order++, 5) * 90}ms`);
            element.classList.remove("rv-wait");
            // Once risen, the element gets its own transitions back (hover states) without the reveal's delays.
            timers.push(window.setTimeout(() => element.removeAttribute("data-rv"), 4000));
          } else element.removeAttribute("data-rv");
          reveal.unobserve(element);
        } else if (!seen.has(element) && entry.boundingClientRect.top > 0) element.classList.add("rv-wait");
        seen.add(element);
      }
    },
    { rootMargin: "0px 0px -6% 0px" },
  );
  for (const target of targets) reveal.observe(target);
  observers.push(reveal);
  cleanups.push(() => {
    for (const timer of timers) window.clearTimeout(timer);
    for (const target of targets) {
      target.classList.remove("rv-wait");
      target.removeAttribute("data-rv");
      target.style.removeProperty("--rv-delay");
      for (const child of target.children) (child as HTMLElement).style.removeProperty("--i");
    }
  });

  // Line drawings draw themselves the first time they come into view, then current flows while they are on screen.
  const draw = (art: SVGSVGElement, instant: boolean) => {
    const strokes = [...art.querySelectorAll(".d")];
    const lights = [...art.querySelectorAll(".f, .n")];
    const needle = art.querySelector(".needle");
    const finish = () => {
      art.classList.add("is-drawn");
      gsap.set([...strokes, ...lights], { clearProps: "strokeDasharray,strokeDashoffset,opacity" });
    };
    if (instant) return finish();
    const hero = art.dataset.art === "hero";
    const timeline = gsap.timeline({ onComplete: finish, delay: art.closest(".page-hero") ? 0.25 : 0 });
    timeline.fromTo(strokes, { strokeDasharray: "1 1", strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: hero ? 1.3 : 1.1, ease: "power2.inOut", stagger: { amount: hero ? 2 : 0.9 } });
    if (needle) timeline.fromTo(needle, { rotation: -80, svgOrigin: "80 92" }, { rotation: 0, svgOrigin: "80 92", duration: 1.4, ease: "elastic.out(1, 0.55)" }, "-=0.6");
    timeline.fromTo(lights, { opacity: 0 }, { opacity: 1, duration: 0.35, stagger: 0.16, ease: "power1.out" }, "-=0.35");
    tweens.push(timeline);
  };
  const drawn = new WeakSet<Element>();
  const watched = new WeakSet<Element>();
  const lively = [...arts, ...root.querySelectorAll<HTMLElement>(".flat-marquee")];
  const watch = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        const element = entry.target as SVGSVGElement | HTMLElement;
        const first = !watched.has(element);
        watched.add(element);
        element.classList.toggle("is-live", entry.isIntersecting);
        if (!entry.isIntersecting || drawn.has(element) || !(element instanceof SVGSVGElement)) continue;
        drawn.add(element);
        // A page restored mid-way (Back, or the 3D world failing under it) shows the drawings on screen at once.
        draw(element, first && !intro);
      }
    },
    { rootMargin: "0px 0px -10% 0px" },
  );
  for (const element of lively) watch.observe(element);
  observers.push(watch);
  cleanups.push(() => {
    for (const element of lively) element.classList.remove("is-live", "is-drawn");
    for (const art of arts) gsap.set(art.querySelectorAll(".d, .f, .n, .needle"), { clearProps: "all" });
  });

  // Counters run from zero to their figure when they come into view.
  const counters = [...root.querySelectorAll<HTMLElement>("[data-count], [data-tally]")];
  const finals = new Map(counters.map((element) => [element, finalText(element)]));
  const counted = new WeakSet<Element>();
  const counting = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        const element = entry.target as HTMLElement;
        const first = !counted.has(element);
        counted.add(element);
        if (!entry.isIntersecting) {
          if (first && entry.boundingClientRect.top > 0) element.textContent = counterText(element, 0);
          continue;
        }
        counting.unobserve(element);
        if (first && !intro) continue;
        const target = Number(element.dataset.count ?? element.dataset.tally);
        const state = { value: 0 };
        element.textContent = counterText(element, 0);
        tweens.push(
          gsap.to(state, {
            value: target,
            duration: 1.8,
            ease: "power2.out",
            onUpdate: () => (element.textContent = counterText(element, state.value)),
            onComplete: () => (element.textContent = finals.get(element) ?? ""),
          }),
        );
      }
    },
    { rootMargin: "0px 0px -8% 0px" },
  );
  for (const element of counters) counting.observe(element);
  observers.push(counting);
  cleanups.push(() => {
    for (const [element, text] of finals) element.textContent = text;
  });

  // The client logos drift as a belt: a hidden copy follows the list so the loop has no seam.
  const marquee = root.querySelector<HTMLElement>(".flat-marquee");
  const belt = marquee?.querySelector<HTMLElement>(".flat-belt");
  const logos = belt?.querySelector<HTMLElement>(".flat-logos");
  if (marquee && belt && logos) {
    const copy = logos.cloneNode(true) as HTMLElement;
    copy.setAttribute("aria-hidden", "true");
    copy.removeAttribute("aria-label");
    for (const image of copy.querySelectorAll("img")) image.alt = "";
    belt.append(copy);
    marquee.classList.add("is-running");
    cleanups.push(() => {
      copy.remove();
      marquee.classList.remove("is-running");
    });
  }

  // A marigold line under the header shows how far down the page the visitor is.
  const progress = ScrollTrigger.create({ start: 0, end: "max", onUpdate: (self) => html.style.setProperty("--flat-progress", self.progress.toFixed(3)) });
  cleanups.push(() => {
    progress.kill();
    html.style.removeProperty("--flat-progress");
  });

  // The About milestones: the busbar fills down to the reading line (60 % of the screen) and lights each milestone it
  // reaches. The milestones' positions are read when ScrollTrigger measures, never while scrolling.
  const busbar = root.querySelector<HTMLElement>(".page .timeline");
  if (busbar) {
    const stops = [...busbar.children] as HTMLElement[];
    const fill = ScrollTrigger.create({
      trigger: busbar,
      start: "top 60%",
      end: "bottom 60%",
      onRefresh: (self) => {
        const height = Math.max(1, busbar.offsetHeight);
        for (const stop of stops) stop.style.setProperty("--at", ((stop.offsetTop + 30) / height).toFixed(3));
        busbar.style.setProperty("--fill", self.progress.toFixed(3));
      },
      onUpdate: (self) => busbar.style.setProperty("--fill", self.progress.toFixed(3)),
    });
    cleanups.push(() => {
      fill.kill();
      busbar.style.removeProperty("--fill");
      for (const stop of stops) stop.style.removeProperty("--at");
    });
  }

  // The hero drawing settles slightly slower than the page scrolls (wide screens only).
  const heroArt = root.querySelector<SVGSVGElement>(".flat-hero-art svg");
  const heroChapter = root.querySelector<HTMLElement>(".journey > .chapter");
  if (heroArt && heroChapter && matchMedia("(min-width: 1000px)").matches) {
    tweens.push(gsap.to(heroArt, { yPercent: 7, ease: "none", scrollTrigger: { trigger: heroChapter, start: "top top", end: "bottom top", scrub: true } }));
  }

  return {
    destroy() {
      for (const observer of observers) observer.disconnect();
      for (const tween of tweens) {
        tween.scrollTrigger?.kill();
        tween.kill();
      }
      for (const cleanup of cleanups) cleanup();
      gsap.set(heroArt ?? [], { clearProps: "transform" });
      html.classList.remove("flat-motion");
    },
  };
}
