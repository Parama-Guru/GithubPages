import { gsap, ScrollTrigger } from "./motion";

/* Version 2.1 signatures (styles: styles/flat.css "Signatures"): scroll effects of the 2D home, and one quiet effect of
   its own on every other page, in both modes. Called by app/flat.ts only with motion. Everything moves through
   transform, opacity or clip-path, often via a custom property that a scroll trigger writes, so nothing reads layout
   while scrolling. Elements that may already be on screen at load start hidden from the first paint in CSS (scripting
   enabled, motion allowed) and play when .is-played arrives; reduced motion and no JavaScript show the final state. */

type Cleanup = () => void;

/** A scroll range whose progress (0–1) is written somewhere, typically into a custom property. */
function track(trigger: Element, start: string, end: string, write: (progress: number) => void): Cleanup {
  const range = ScrollTrigger.create({ trigger, start, end, onUpdate: (self) => write(self.progress), onRefresh: (self) => write(self.progress) });
  return () => range.kill();
}

function setVar(element: HTMLElement, name: string, value: number): void {
  element.style.setProperty(name, value.toFixed(3));
}

/** Adds .is-played when an element first comes into view (after the page's entrance when it is already in view). */
function play(elements: HTMLElement[], settleAfter = 0): Cleanup {
  const timers: number[] = [];
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const element = entry.target as HTMLElement;
        observer.unobserve(element);
        timers.push(
          window.setTimeout(() => {
            element.classList.add("is-played");
            if (settleAfter) timers.push(window.setTimeout(() => element.classList.add("is-settled"), settleAfter));
          }, entry.boundingClientRect.top < window.innerHeight * 0.75 ? 260 : 0),
        );
      }
    },
    { rootMargin: "0px 0px -8% 0px" },
  );
  for (const element of elements) observer.observe(element);
  return () => {
    observer.disconnect();
    for (const timer of timers) window.clearTimeout(timer);
    for (const element of elements) element.classList.remove("is-played", "is-settled");
  };
}

/* ---- 2D home ---- */

function home(root: HTMLElement): Cleanup[] {
  const cleanups: Cleanup[] = [];

  // Leaving the hero, the name, tagline, expertise and buttons drift up at different speeds.
  const hero = root.querySelector<HTMLElement>("#welcome");
  const layers = [".hero-title", ".hero-tagline", ".tags", ".actions"].map((selector) => hero?.querySelector<HTMLElement>(`:scope > .chapter-panel > ${selector}`) ?? null);
  if (hero) {
    const depth = gsap.timeline({ scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: 0.5 } });
    [-96, -66, -44, -26].forEach((y, index) => {
      const layer = layers[index];
      if (layer) depth.to(layer, { y, ease: "none" }, 0);
    });
    cleanups.push(() => {
      depth.scrollTrigger?.kill();
      depth.kill();
      gsap.set(layers.filter((layer): layer is HTMLElement => Boolean(layer)), { clearProps: "transform" });
    });
  }

  // The dark bands open from an inset, rounded card to the full width as they arrive.
  for (const band of root.querySelectorAll<HTMLElement>("#why-us, #contact")) {
    band.classList.add("is-band");
    cleanups.push(track(band, "top bottom", "top 30%", (progress) => setVar(band, "--band", progress)));
    cleanups.push(() => {
      band.classList.remove("is-band");
      band.style.removeProperty("--band");
    });
  }

  // The project photographs drift against the scroll and settle from a slight zoom.
  const mosaic = root.querySelector<HTMLElement>(".flat-mosaic");
  if (mosaic) {
    [...mosaic.querySelectorAll<HTMLElement>("li")].forEach((item, index) => item.style.setProperty("--dir", String([1, -1, 0.7, -0.7, 1][index] ?? 1)));
    mosaic.classList.add("is-drifting");
    cleanups.push(track(mosaic, "top bottom", "bottom top", (progress) => setVar(mosaic, "--kb", progress)));
    cleanups.push(() => {
      mosaic.classList.remove("is-drifting");
      mosaic.style.removeProperty("--kb");
    });
  }

  // The client belt runs faster while the page is scrolled, and eases back when it stops.
  const belt = root.querySelector<HTMLElement>(".flat-marquee.is-running .flat-belt");
  const run = belt?.getAnimations().find((animation) => (animation as CSSAnimation).animationName === "flat-belt");
  if (run) {
    const state = { rate: 1 };
    const apply = () => run.updatePlaybackRate(state.rate);
    const speed = ScrollTrigger.create({
      onUpdate: (self) => gsap.to(state, { rate: 1 + Math.min(Math.abs(self.getVelocity()) / 650, 3.5), duration: 0.35, overwrite: true, onUpdate: apply }),
    });
    const settle = () => gsap.to(state, { rate: 1, duration: 1.4, ease: "power2.out", overwrite: true, onUpdate: apply });
    ScrollTrigger.addEventListener("scrollEnd", settle);
    cleanups.push(() => {
      speed.kill();
      ScrollTrigger.removeEventListener("scrollEnd", settle);
      gsap.killTweensOf(state);
      run.updatePlaybackRate(1);
    });
  }

  // The milestone line fills with the scroll and each milestone lights as the current reaches it.
  const line = root.querySelector<HTMLElement>(".flat-timeline");
  if (line) {
    const stops = [...line.children] as HTMLElement[];
    stops.forEach((stop, index) => setVar(stop, "--at", stops.length > 1 ? index / (stops.length - 1) : 1));
    line.classList.add("is-scrubbed");
    cleanups.push(track(line, "top 85%", "bottom 50%", (progress) => setVar(line, "--fill", progress)));
    cleanups.push(() => {
      line.classList.remove("is-scrubbed");
      line.style.removeProperty("--fill");
      for (const stop of stops) stop.style.removeProperty("--at");
    });
  }

  // The founder's photograph and its emerald frame move apart a little, for depth.
  const portrait = root.querySelector<HTMLElement>(".flat-portrait");
  if (portrait) {
    portrait.classList.add("is-depth");
    cleanups.push(track(portrait, "top bottom", "bottom top", (progress) => setVar(portrait, "--pd", progress * 2 - 1)));
    cleanups.push(() => {
      portrait.classList.remove("is-depth");
      portrait.style.removeProperty("--pd");
    });
  }
  return cleanups;
}

/* ---- Pages ---- */

/** About: the brand statement writes itself word by word as it is read. */
function about(page: HTMLElement): Cleanup[] {
  const quote = page.querySelector<HTMLElement>(".brand-statement p");
  if (!quote) return [];
  const original = quote.textContent ?? "";
  const fragment = document.createDocumentFragment();
  let count = 0;
  for (const part of original.split(/(\s+)/)) {
    if (!part) continue;
    if (/^\s+$/.test(part)) {
      fragment.append(part);
      continue;
    }
    const word = document.createElement("span");
    word.className = "bw";
    word.textContent = part;
    word.style.setProperty("--w", String(count++));
    fragment.append(word);
  }
  quote.replaceChildren(fragment);
  quote.style.setProperty("--n", String(count));
  quote.classList.add("is-writing");
  const stop = track(quote, "top 90%", "bottom 55%", (progress) => setVar(quote, "--read", progress));
  return [
    stop,
    () => {
      quote.textContent = original;
      quote.classList.remove("is-writing");
      for (const name of ["--n", "--read"]) quote.style.removeProperty(name);
    },
  ];
}

/** How We Serve: the six principles light in turn, like indicator lamps, as the page is scrolled. */
function features(page: HTMLElement): Cleanup[] {
  const grid = page.querySelector<HTMLElement>(".principles");
  if (!grid) return [];
  const cards = [...grid.children] as HTMLElement[];
  cards.forEach((card, index) => card.style.setProperty("--k", String(index)));
  grid.classList.add("is-lamps");
  const stop = track(grid, "top 85%", "bottom 60%", (progress) => setVar(grid, "--lit", progress * cards.length));
  return [
    stop,
    () => {
      grid.classList.remove("is-lamps");
      grid.style.removeProperty("--lit");
      for (const card of cards) card.style.removeProperty("--k");
    },
  ];
}

/** How We Work: each role's bar (styles/main.css) runs out with its number as it comes into view (the same trigger and
    timing as the counters of app/flat.ts); a bar already on screen at load is never emptied. */
function execution(page: HTMLElement): Cleanup[] {
  const cells = [...page.querySelectorAll<HTMLElement>(".manpower > div")];
  const seen = new WeakSet<Element>();
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        const cell = entry.target as HTMLElement;
        const first = !seen.has(cell);
        seen.add(cell);
        if (!entry.isIntersecting) {
          if (first && entry.boundingClientRect.top > 0) cell.classList.add("bar-wait");
          continue;
        }
        observer.unobserve(cell);
        cell.classList.remove("bar-wait");
      }
    },
    { rootMargin: "0px 0px -8% 0px" },
  );
  for (const cell of cells) observer.observe(cell);
  return [
    () => {
      observer.disconnect();
      for (const cell of cells) cell.classList.remove("bar-wait");
    },
  ];
}

/** Projects: each photograph moves within its frame against the scroll. */
function projects(page: HTMLElement): Cleanup[] {
  const figures = [...page.querySelectorAll<HTMLElement>(".gallery figure")];
  const stops = figures.map((figure) => {
    figure.classList.add("is-parallax");
    return track(figure, "top bottom", "bottom top", (progress) => setVar(figure, "--py", progress * 2 - 1));
  });
  return [
    ...stops,
    () => {
      for (const figure of figures) {
        figure.classList.remove("is-parallax");
        figure.style.removeProperty("--py");
      }
    },
  ];
}

/** Project lists: tables below the fold cascade in row by row; a table already in view is scanned by a marigold light
    instead (its rows are never hidden); a marigold rule draws under each heading; the on-going list marks each project
    live. */
function projectList(page: HTMLElement): Cleanup[] {
  const tables = [...page.querySelectorAll<HTMLElement>(".table-block")];
  for (const table of tables) [...table.querySelectorAll<HTMLElement>("tbody tr")].forEach((row, index) => row.style.setProperty("--r", String(Math.min(index, 16))));
  const seen = new WeakSet<Element>();
  const timers: number[] = [];
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        const table = entry.target as HTMLElement;
        const first = !seen.has(table);
        seen.add(table);
        if (!entry.isIntersecting) {
          if (first && entry.boundingClientRect.top > 0) table.classList.add("cascade-wait");
          continue;
        }
        observer.unobserve(table);
        table.classList.add("is-played", first ? "is-scanning" : "is-cascading");
        table.classList.remove("cascade-wait");
        timers.push(window.setTimeout(() => table.classList.add("is-settled"), 2600));
      }
    },
    { rootMargin: "0px 0px -8% 0px" },
  );
  for (const table of tables) observer.observe(table);
  return [
    () => {
      observer.disconnect();
      for (const timer of timers) window.clearTimeout(timer);
      for (const table of tables) table.classList.remove("cascade-wait", "is-played", "is-scanning", "is-cascading", "is-settled");
      for (const row of page.querySelectorAll<HTMLElement>("tbody tr")) row.style.removeProperty("--r");
    },
  ];
}

/** Clients: the logo wall assembles in a diagonal wave. */
function clientWall(page: HTMLElement): Cleanup[] {
  const grid = page.querySelector<HTMLElement>(".logo-grid");
  if (!grid) return [];
  const items = [...grid.children] as HTMLElement[];
  // Read once at mount: how many logos a row holds at this width.
  const columns = Math.max(1, getComputedStyle(grid).gridTemplateColumns.split(" ").length);
  items.forEach((item, index) => item.style.setProperty("--d", String(Math.min((index % columns) + Math.floor(index / columns), 14))));
  return [
    play([grid], 2600),
    () => {
      for (const item of items) item.style.removeProperty("--d");
    },
  ];
}

/** Quality & Safety: beside each policy a line fills as it is read (its title stays in view, styles/flat.css). */
function quality(page: HTMLElement): Cleanup[] {
  const blocks = [...page.querySelectorAll<HTMLElement>(".policy")];
  const stops = blocks.map((block) => {
    block.classList.add("is-read");
    return track(block, "top 70%", "bottom 70%", (progress) => setVar(block, "--pp", progress));
  });
  return [
    ...stops,
    () => {
      for (const block of blocks) {
        block.classList.remove("is-read");
        block.style.removeProperty("--pp");
      }
    },
  ];
}

/** Organisation: the chart grows from the Proprietor down, level by level. */
function organisation(page: HTMLElement): Cleanup[] {
  const sections = [...page.querySelectorAll<HTMLElement>(".org-section")];
  const items = [...page.querySelectorAll<HTMLElement>(".org-chart li")];
  for (const item of items) {
    let depth = 0;
    for (let parent = item.parentElement; parent && !parent.classList.contains("org-section"); parent = parent.parentElement) if (parent.tagName === "LI") depth++;
    item.style.setProperty("--lvl", String(Math.min(depth, 8)));
  }
  return [
    play(sections, 2600),
    () => {
      for (const item of items) item.style.removeProperty("--lvl");
    },
  ];
}

/** Downloads, Contact, 404: entrances played in CSS once their block is in view. */
function entrance(selector: string, settleAfter: number) {
  return (page: HTMLElement): Cleanup[] => {
    const elements = [...page.querySelectorAll<HTMLElement>(selector)];
    elements.forEach((element) => [...element.children].forEach((child, index) => (child as HTMLElement).style.setProperty("--k", String(Math.min(index, 12)))));
    return [
      play(elements, settleAfter),
      () => {
        for (const element of elements) for (const child of element.children) (child as HTMLElement).style.removeProperty("--k");
      },
    ];
  };
}

// Leadership needs no script: its roles open with ::details-content (styles/flat.css).
const pages: Record<string, (page: HTMLElement) => Cleanup[]> = {
  about,
  features,
  execution,
  projects,
  "projects-ongoing": projectList,
  "projects-2023-2026": projectList,
  "projects-2019-2022": projectList,
  "projects-2012-2018": projectList,
  clients: clientWall,
  "quality-safety": quality,
  organisation,
  downloads: entrance(".documents", 2400),
  contact: entrance(".fields", 2600),
  "not-found": entrance(".year-cards", 2600),
};

/** Starts the home's scroll effects or the page's own effect; returns what undoes them. */
export function initSignatures(root: HTMLElement): Cleanup {
  let cleanups: Cleanup[] = [];
  const page = root.querySelector<HTMLElement>(".page[data-page]");
  try {
    if (root.querySelector(".journey")) cleanups = home(root);
    else if (page) cleanups = pages[page.dataset.page ?? ""]?.(page) ?? [];
  } catch (error) {
    // A failed effect never hides content: everything waiting in CSS is shown at once.
    for (const element of root.querySelectorAll<HTMLElement>(".table-block, .logo-grid, .org-section, .documents, .fields, .year-cards")) element.classList.add("is-played", "is-settled");
    console.error(error);
  }
  return () => {
    for (const cleanup of cleanups) cleanup();
  };
}
