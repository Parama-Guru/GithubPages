import "./styles/fonts.css";
import "@fontsource/parisienne/latin-400.css";
import "./styles/main.css";
import "./styles/flat.css";
import { basePath, href, matchRoute, route, type Route, type RouteId } from "@/routes/routes";
import { renderFooter, renderHead, renderHeader, renderMenu } from "@/ui/layout";
import type { Target, World } from "@/world/world";
import { detect, preferences } from "./app/capabilities";
import { initFlat } from "./app/flat";
import { chapterScroll, initJourney, type Controller } from "./app/journey";
import { createMotion, gsap, scrollTo, ScrollTrigger, type Motion } from "./app/motion";
import { initPage } from "./app/page";
import { createHotspot, type Hotspot } from "./app/hotspot";
import { chapterInView, chapterProgress, entryChapter, labelBack, rememberChapter, rememberedChapter, resumeChapter, trackTour } from "./app/tour";
import { play, setSound } from "./app/sound";

const html = document.documentElement;
const params = new URLSearchParams(location.search);
const poster = params.get("poster");
// Pages other than home never show the 3D world, so there the WebGL probe waits for the way home (bootWorld).
const caps = detect(matchRoute(location.pathname).id === "home" || Boolean(poster));
const main = document.querySelector<HTMLElement>("#main") as HTMLElement;
let canvas = document.querySelector<HTMLCanvasElement>("[data-canvas]") as HTMLCanvasElement;
const stage = document.querySelector<HTMLElement>(".world") as HTMLElement;
const hoverLabel = document.querySelector<HTMLElement>("[data-hover-label]");
const curtain = document.querySelector<HTMLElement>("[data-curtain]");

let current: Route = matchRoute(location.pathname);
let controller: Controller = { destroy: () => undefined };
let world: World | null = null;
const panel = { value: 0 };
// The switchyard's breaker (3D: the bay in the yard; HTML: the button anchored on it, app/hotspot.ts).
const energy = { value: 0 };
let energised = false;
let hotspot: Hotspot | null = null;
let marker = { x: 0, y: 0, visible: false };
const JOURNEY: Target = { kind: "journey" };
// <main> fades out for this long (main.css main.is-leaving) before the next page is swapped in.
const LEAVE_MS = caps.reduced ? 0 : 220;

const managedHead = 'title, meta[name="description"], meta[name="robots"], link[rel="canonical"], meta[property^="og:"], meta[name^="twitter:"], script[data-seo]';

type Templates = typeof import("@/ui/pages");
let templates: Promise<Templates> | null = null;

// Every page arrives prerendered, so the page templates and the full content (a chunk of their own) are only needed for
// page changes: fetched when the browser is idle after loading, or at the first page change, whichever comes first.
function loadTemplates(): Promise<Templates> {
  templates ??= import("@/ui/pages").catch((error: unknown) => {
    templates = null;
    throw error;
  });
  return templates;
}

function prefetchTemplates(): void {
  const prefetch = () => void loadTemplates().catch(() => undefined);
  // Safari has no requestIdleCallback.
  const idle = () => (typeof window.requestIdleCallback === "function" ? window.requestIdleCallback(prefetch, { timeout: 4000 }) : setTimeout(prefetch, 1500));
  if (document.readyState === "complete") idle();
  else window.addEventListener("load", idle, { once: true });
}

type WorldModule = typeof import("@/world/world");
let worldModule: Promise<WorldModule> | null = null;

function loadWorld(): Promise<WorldModule> {
  worldModule ??= import("@/world/world").catch((error: unknown) => {
    worldModule = null;
    throw error;
  });
  return worldModule;
}

function updateHead(next: Route): void {
  for (const node of document.head.querySelectorAll(managedHead)) node.remove();
  const template = document.createElement("template");
  template.innerHTML = renderHead(next);
  document.head.append(template.content);
}

async function hydrateShell(): Promise<void> {
  if (main.children.length) return;
  const { renderMain } = await loadTemplates();
  updateHead(current);
  main.innerHTML = renderMain(current.id);
  main.insertAdjacentHTML("beforebegin", renderHeader(current));
  main.insertAdjacentHTML("afterend", renderFooter() + renderMenu(current));
}

function updateChrome(next: Route): void {
  const header = document.querySelector("[data-header]");
  header?.insertAdjacentHTML("afterend", renderHeader(next));
  header?.remove();
  const menu = document.querySelector<HTMLDialogElement>("#site-menu");
  menu?.insertAdjacentHTML("afterend", renderMenu(next));
  menu?.remove();
  syncPrefs();
}

const has3d = () => html.classList.contains("has-3d");
const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Smooth scrolling (Lenis) and SplitText belong to the 3D tour on the home page; every other page, and the whole 2D site,
// scrolls natively and animates through app/flat.ts.
const smooth = !caps.reduced && !poster && caps.has3d;
let motion: Motion = await createMotion(smooth && current.id === "home");
const flatMotion = !caps.reduced && !poster;
let wanted = motion.enabled;
let navigation = 0;

async function useMotion(tour: boolean): Promise<void> {
  wanted = tour;
  if (tour === motion.enabled) return;
  motion.destroy();
  let next: Motion;
  try {
    next = await createMotion(tour);
  } catch {
    next = await createMotion(false);
  }
  motion = next;
  // A page change made while this one loaded may want the other kind of scrolling.
  if (wanted !== motion.enabled) await useMotion(wanted);
}

function setPanel(open: boolean): void {
  gsap.to(panel, {
    value: open ? 1 : 0,
    duration: caps.reduced ? 0 : 2.2,
    ease: "power2.inOut",
    onUpdate: () => world?.setPanel(panel.value),
  });
  if (open) play("breaker");
}

/** Closes or opens the switchyard's breaker: a power-up runs out along the line (or back) and the load hum follows. */
function setEnergy(on: boolean, quiet = false): void {
  energised = on;
  gsap.to(energy, {
    value: on ? 1 : 0,
    duration: caps.reduced || quiet ? 0 : on ? 2.6 : 1.8,
    ease: on ? "power1.inOut" : "power2.out",
    overwrite: true,
    onUpdate: () => world?.setEnergy(energy.value),
  });
  hotspot?.setPressed(on);
  if (!quiet) play(on ? "energise" : "release");
}

/** The button for the switchyard's breaker, in the last chapter of the 3D tour. */
function energiseControl(): Hotspot | null {
  const host = main.querySelector<HTMLElement>("#contact");
  if (!host) return null;
  const created = createHotspot(host, {
    label: "Energise the switchyard",
    short: "Energise",
    pressed: energised,
    onToggle: () => setEnergy(!energised),
    onFocusAway: () => {
      const y = chapterScroll(main, "contact");
      if (y !== null) scrollTo(motion, y, 1.2);
    },
  });
  created.place(marker.x, marker.y, marker.visible);
  return created;
}

function onMarker(id: string, x: number, y: number, visible: boolean): void {
  if (id !== "energise") return;
  marker = { x, y, visible };
  hotspot?.place(x, y, visible);
}

function enterFacility(y: number): void {
  play("door");
  scrollTo(motion, y, 3.4);
}

function mount(next: Route, intro = true): Controller {
  if (next.id !== "home") {
    // Every page but home is one design in both modes: its controls (app/page.ts) and the page animations (app/flat.ts).
    const page = initPage(main);
    const site = initFlat(main, { animate: flatMotion, intro });
    return {
      destroy() {
        site.destroy();
        page.destroy();
      },
    };
  }
  // The home page differs: the 3D tour (app/journey.ts) or, without 3D, the 2D home animated by app/flat.ts.
  const flat = !has3d();
  const journey = initJourney(main, flat ? { ...motion, enabled: false } : motion, world, enterFacility, intro);
  const untrack = trackTour(main);
  const site = flat ? initFlat(main, { animate: flatMotion, intro }) : null;
  hotspot = !flat && world ? energiseControl() : null;
  return {
    destroy() {
      site?.destroy();
      journey.destroy();
      untrack();
      hotspot?.destroy();
      hotspot = null;
    },
  };
}

/** The 3D world runs only on the home page: it fades out (main.css html.is-page), stops drawing and falls silent elsewhere. */
function parkWorld(): void {
  html.classList.add("is-page");
  world?.clearPointer();
  setSound(false);
}

async function navigate(url: URL, push = true, resume: string | null = null): Promise<void> {
  const loading = loadTemplates();
  void loading.catch(() => undefined);
  const next = matchRoute(url.pathname);
  if (next.id === current.id) {
    if (url.hash) jumpTo(url.hash.slice(1));
    else if (next.id === "home") {
      // Home or the logo on the home page rewinds the tour to its front; the menu may still have Lenis stopped.
      motion.lenis?.start();
      scrollTo(motion, 0, Math.min(2.4, 1 + window.scrollY / window.innerHeight / 10));
    }
    return;
  }
  // A later page change (a quick second click, or Back) supersedes this one at its next wait.
  const token = ++navigation;
  // The home history entry keeps the chapter being left, for the Back link and the browser's Back button.
  if (push && current.id === "home") rememberChapter(chapterInView(main));
  const home = next.id === "home";
  const chapter = home ? resumeChapter(resume) : null;
  if (push) history.pushState(chapter ? { chapter } : null, "", url.pathname + url.search + url.hash);
  const leaving = wait(LEAVE_MS);
  main.classList.remove("is-entering");
  main.classList.add("is-leaving");
  if (panel.value > 0) setPanel(false);
  if (energised && !home) setEnergy(false, true);
  if (!home) parkWorld();
  else if (world && has3d()) {
    // The tour opens where it was left (or at its front): that room loads while the page fades out.
    const resumed = chapter ? chapterProgress(chapter) : null;
    world.setJourney(resumed?.progress ?? 0, resumed?.ranges);
    const preparing = world.prepare(JOURNEY).catch(() => undefined);
    const slow = window.setTimeout(() => curtain?.classList.add("is-visible"), 160);
    // On a slow link the page changes after a short wait while the room keeps streaming in behind it.
    await Promise.race([preparing, wait(1600)]);
    window.clearTimeout(slow);
    curtain?.classList.remove("is-visible");
  }
  await leaving;
  let renderMain: Templates["renderMain"];
  try {
    ({ renderMain } = await loading);
  } catch {
    // Without the templates (offline, or a newer deployment replaced the chunk) the browser loads the prerendered page.
    if (token === navigation) location.assign(url.href);
    return;
  }
  if (token !== navigation) return;
  controller.destroy();
  controller = { destroy: () => undefined };
  if (!home) world?.stop();
  await useMotion(home && smooth && has3d());
  if (token !== navigation) return;
  // A tour resumed mid-way shows no "Scroll to enter" cue, not even fading out.
  if (chapter) html.classList.add("is-scrolled");
  main.innerHTML = renderMain(next.id);
  labelBack(main);
  updateHead(next);
  updateChrome(next);
  // The new page is laid out in this frame and set up in the next, so a page change makes no single long task.
  await new Promise((resolve) => requestAnimationFrame(resolve));
  if (token !== navigation) return;
  // Back resumes the tour at the chapter's hold at once; every other way to a page starts at its top.
  const y = chapter ? resumeScroll(chapter) : 0;
  motion.lenis?.resize();
  motion.lenis?.scrollTo(y, { immediate: true, force: true });
  window.scrollTo(0, y);
  current = next;
  html.classList.toggle("is-page", !home);
  main.classList.remove("is-leaving");
  // A page opened afresh (not the tour resumed mid-way) plays its entrance (main.css main.is-entering).
  if (!chapter && flatMotion) main.classList.add("is-entering");
  controller = mount(next, !chapter);
  if (home && has3d()) {
    if (world) {
      world.goTo(JOURNEY, 0);
      world.start();
      setSound(true);
    } else void bootWorld(chapter);
  }
  ScrollTrigger.refresh();
  const heading = chapter ? document.getElementById(`${chapter}-title`) : null;
  heading?.setAttribute("tabindex", "-1");
  (heading ?? main).focus({ preventScroll: true });
  if (url.hash && !chapter) requestAnimationFrame(() => jumpTo(url.hash.slice(1)));
}

function jumpTo(id: string): void {
  motion.lenis?.resize();
  ScrollTrigger.refresh();
  const y = current.id === "home" && has3d() ? chapterScroll(main, id) : null;
  const element = document.getElementById(id);
  if (y !== null) scrollTo(motion, y, 1.6);
  else if (element) scrollTo(motion, element, 1.2);
}

function resumeScroll(id: string): number {
  const section = document.getElementById(id);
  if (!section) return 0;
  return has3d() ? (chapterScroll(main, id) ?? 0) : section.offsetTop;
}

function internal(anchor: HTMLAnchorElement): URL | null {
  if (anchor.target === "_blank" || anchor.hasAttribute("download")) return null;
  const url = new URL(anchor.href, location.href);
  if (url.origin !== location.origin || !url.pathname.startsWith(basePath)) return null;
  if (/\.(xml|webp|png|jpg|pdf)$/.test(url.pathname)) return null;
  return url;
}

function syncPrefs(): void {
  const on = caps.has3d || (preferences.prefer3d() && caps.webgl && !caps.reduced && !caps.saveData && !caps.slow);
  for (const input of document.querySelectorAll<HTMLInputElement>("[data-pref='3d']")) input.checked = on;
}

/** The 3D scene takes pointer input only on the home page, and never through the text and controls over it. */
function sceneTarget(target: EventTarget | null): boolean {
  if (!world || current.id !== "home") return false;
  return !(target as HTMLElement | null)?.closest("a, button, input, textarea, select, label, dialog, .site-header, .site-footer, .chapter-panel");
}

function menu(): HTMLDialogElement | null {
  return document.querySelector<HTMLDialogElement>("#site-menu");
}

function bindShell(): void {
  document.addEventListener("click", (event) => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const target = event.target as HTMLElement;
    if (target.closest("[data-menu-open]")) {
      menu()?.showModal();
      motion.lenis?.stop();
      // The menu covers the whole screen, so the scene stops drawing behind it.
      world?.setCovered(true);
      return;
    }
    if (target.closest("[data-menu-close]")) {
      menu()?.close();
      return;
    }
    const anchor = target.closest<HTMLAnchorElement>("a[href]");
    if (anchor) {
      const url = internal(anchor);
      if (!url) return;
      event.preventDefault();
      menu()?.close();
      void navigate(url, true, anchor.hasAttribute("data-back") ? rememberedChapter() : null);
      return;
    }
    if (!world || !sceneTarget(target)) return;
    world.setPointer(event.clientX, event.clientY);
    const id = world.pick();
    if (!id) return;
    if (id === "doors") {
      const second = main.querySelectorAll<HTMLElement>(".chapter")[1];
      if (second) enterFacility(second.offsetTop + (second.offsetHeight - window.innerHeight) * 0.32);
    } else if (id === "panel") setPanel(panel.value < 0.5);
    else if (id === "energise") setEnergy(!energised);
    else if (id.startsWith("route:")) {
      const destination = new URL(href(id.slice(6) as RouteId), location.href);
      void world.presentPick().then(() => navigate(destination));
    }
  });
  document.addEventListener(
    "close",
    (event) => {
      if ((event.target as HTMLElement).id === "site-menu") {
        world?.setCovered(false);
        motion.lenis?.start();
        document.querySelector<HTMLElement>("[data-menu-open]")?.focus();
      }
    },
    true,
  );
  document.addEventListener("change", (event) => {
    const input = (event.target as HTMLElement).closest<HTMLInputElement>("[data-pref='3d']");
    if (!input) return;
    preferences.set3d(input.checked);
    location.reload();
  });
  window.addEventListener("popstate", (event) => void navigate(new URL(location.href), false, entryChapter(event.state)));
  // The router sets the scroll after every page change, so browser history must not first jump the outgoing page (and the
  // camera with it); reloads and returns from other sites keep the browser's own restoration. ScrollTrigger owns the setting.
  const manual = () => ScrollTrigger.clearScrollMemory("manual");
  if (document.readyState === "complete") manual();
  else window.addEventListener("load", manual, { once: true });
  window.addEventListener("pagehide", () => ScrollTrigger.clearScrollMemory("auto"));
  window.addEventListener("pageshow", (event) => {
    if (event.persisted) manual();
  });
  const header = () => document.querySelector("[data-header]")?.classList.toggle("is-solid", window.scrollY > 24);
  window.addEventListener("scroll", header, { passive: true });
  header();
  // The page templates load at the first idle moment, or as soon as the visitor points at a link (the 3D home is
  // rarely idle), so their parsing never lands in the page change itself.
  const intents = ["pointerover", "focusin", "touchstart"] as const;
  const warmTemplates = (event: Event) => {
    if (!(event.target as Element | null)?.closest?.("a[href]")) return;
    for (const type of intents) document.removeEventListener(type, warmTemplates, true);
    void loadTemplates().catch(() => undefined);
  };
  for (const type of intents) document.addEventListener(type, warmTemplates, { capture: true, passive: true });
  syncPrefs();
  // Sound comes with the 3D world once it runs (bootWorld) and stays off in the static site and on the other pages.
  setSound(false);
}

/** On a page entered directly with 3D on, the world is fetched as soon as the visitor points at a way to the home page. */
function warmOnIntent(): void {
  const types = ["pointerover", "focusin", "touchstart"] as const;
  const warm = (event: Event) => {
    const anchor = (event.target as Element | null)?.closest?.<HTMLAnchorElement>("a[href]");
    const url = anchor ? internal(anchor) : null;
    if (!url || matchRoute(url.pathname).id !== "home") return;
    for (const type of types) document.removeEventListener(type, warm, true);
    if (world || !has3d()) return;
    void loadWorld().catch(() => undefined);
    // The tour's smooth scrolling and heading splits (app/motion.ts) come with it.
    if (smooth) void Promise.all([import("lenis"), import("gsap/SplitText")]).catch(() => undefined);
  };
  for (const type of types) document.addEventListener(type, warm, { capture: true, passive: true });
}

function bindPointer(): void {
  window.addEventListener(
    "pointermove",
    (event) => {
      if (!world || current.id !== "home") return;
      if (event.pointerType === "touch" || !sceneTarget(event.target)) {
        world.clearPointer();
        return;
      }
      world.setPointer(event.clientX, event.clientY);
    },
    { passive: true },
  );
  window.addEventListener(
    "pointerdown",
    (event) => {
      if (world && event.pointerType === "touch" && sceneTarget(event.target)) world.setPointer(event.clientX, event.clientY);
    },
    { passive: true },
  );
  document.addEventListener("pointerleave", () => world?.clearPointer());
  window.addEventListener("resize", () => world?.resize());
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) world?.stop();
    else if (current.id === "home") world?.start();
  });
  window.setInterval(() => {
    if (world && current.id === "home" && world.animating && world.averageFrame > 24 && world.downgrade()) console.info(`Quality lowered to ${world.currentTier}`);
  }, 3000);
}

function onHover(label: string | null, x: number, y: number): void {
  if (!hoverLabel) return;
  hoverLabel.classList.toggle("is-visible", Boolean(label));
  if (!label) return;
  hoverLabel.textContent = label;
  hoverLabel.style.left = `${x}px`;
  hoverLabel.style.top = `${y}px`;
}

let bound = false;
let booting = false;
let recoveries = 0;
let pending: World | null = null;

function fallback(reason: string, recover = false): void {
  console.warn(`3D experience unavailable: ${reason}`);
  (world ?? pending)?.dispose();
  world = null;
  pending = null;
  booting = false;
  setSound(false);
  stage.dataset.world = "static";
  stage.classList.remove("is-interactive");
  html.classList.remove("has-3d", "is-streaming");
  html.classList.add("is-loaded");
  controller.destroy();
  void useMotion(false);
  controller = mount(current, false);
  ScrollTrigger.refresh();
  if (recover && recoveries < 2) {
    recoveries++;
    const fresh = canvas.cloneNode(false) as HTMLCanvasElement;
    for (const key of Object.keys(fresh.dataset)) if (key !== "canvas") delete fresh.dataset[key];
    canvas.replaceWith(fresh);
    canvas = fresh;
    window.setTimeout(() => {
      // The 3D world comes back on the home page; on the other pages it waits for the next visit there.
      if (current.id === "home") void bootWorld();
      else {
        html.classList.add("has-3d");
        stage.dataset.world = "idle";
      }
    }, 1200);
  }
}

// The prerendered home page is usable straight away; the 3D world streams in behind it (its chapter posters cover the
// wait) and takes over once ready. `resume` is the chapter the tour reopens at, whose room loads first.
async function bootWorld(resume: string | null = null): Promise<void> {
  if (booting || world) return;
  if (!caps.probed) {
    Object.assign(caps, detect());
    if (!caps.has3d) {
      fallback("WebGL unavailable");
      return;
    }
  }
  booting = true;
  html.classList.add("has-3d", "is-streaming");
  html.classList.remove("is-loaded");
  stage.dataset.world = "loading";
  const bar = document.querySelector<HTMLElement>("[data-loader-bar]");
  const browse = () => {
    if (window.scrollY < window.innerHeight * 0.4) return;
    html.classList.add("is-browsing");
    window.removeEventListener("scroll", browse);
  };
  window.addEventListener("scroll", browse, { passive: true });
  browse();
  let stalled = 0;
  const watch = () => {
    window.clearTimeout(stalled);
    stalled = window.setTimeout(() => fallback("loading stalled"), 40000);
  };
  watch();
  let created: World | null = null;
  try {
    const { World } = await loadWorld();
    // Starting the world's code and creating its graphics context in one task made a long one; give each its own.
    await new Promise((resolve) => setTimeout(resolve, 0));
    watch();
    if (bar) bar.style.width = "25%";
    created = new World({
      canvas,
      tier: caps.tier,
      motion: !caps.reduced,
      onHover,
      onMarker,
      onProgress: (progress) => {
        watch();
        if (bar) bar.style.width = `${Math.round(25 + progress * 75)}%`;
      },
    });
    pending = created;
    if (resume) {
      const resumed = chapterProgress(resume);
      created.setJourney(resumed.progress, resumed.ranges);
    }
    await created.load(JOURNEY);
    window.clearTimeout(stalled);
    window.removeEventListener("scroll", browse);
    if (pending !== created) return;
    pending = null;
    booting = false;
    world = created;
    created.setPanel(panel.value);
    created.setEnergy(energy.value);
    created.goTo(JOURNEY, 0);
    stage.dataset.world = "ready";
    stage.classList.add("is-interactive");
    if (!bound) {
      bound = true;
      bindPointer();
    }
    canvas.addEventListener("webglcontextlost", () => fallback("graphics context lost", true), { once: true });
    html.classList.remove("is-streaming");
    html.classList.add("is-loaded");
    // Left for another page while it loaded: the world waits, stopped, for the next visit to the home page.
    if (current.id !== "home") return;
    created.start();
    setSound(true);
    controller.destroy();
    controller = mount(current, false);
    ScrollTrigger.refresh();
  } catch (error) {
    window.clearTimeout(stalled);
    window.removeEventListener("scroll", browse);
    if (created && pending !== created) return;
    fallback(error instanceof Error ? error.message : String(error));
  }
}

// Poster mode (tools/render-posters.mjs): one pose of the journey, `?poster=journey&p=<progress>`.
async function renderPoster(): Promise<void> {
  html.classList.add("is-poster", "has-3d");
  const { World } = await loadWorld();
  world = new World({ canvas, tier: (params.get("tier") as "high" | "medium" | "low" | null) ?? "high", motion: false });
  stage.dataset.world = "ready";
  const progress = Number(params.get("p") ?? "0");
  await world.load(JOURNEY);
  const { evenRanges } = await import("@/world/path");
  world.setJourney(progress, evenRanges(8));
  await world.renderPose(JOURNEY, progress);
  html.dataset.poster = "ready";
}

async function start(): Promise<void> {
  await hydrateShell();
  labelBack(main);
  if (poster) {
    await renderPoster();
    return;
  }
  bindShell();
  html.classList.toggle("is-page", current.id !== "home");
  if (!caps.has3d) {
    html.classList.remove("has-3d");
    stage.dataset.world = "static";
    html.classList.add("is-loaded");
  } else if (current.id !== "home") {
    // The other pages never show the 3D world: it is downloaded and started on the way to the home page.
    stage.dataset.world = "idle";
    warmOnIntent();
  }
  // An entrance animation only reads as intended right after first paint; later it would hide text already being read.
  controller = mount(current, (current.id !== "home" || !caps.has3d) && performance.now() < 1500);
  // Controllers no longer measure on their own: one refresh places every scroll trigger the mount created.
  ScrollTrigger.refresh();
  if (caps.has3d && current.id === "home") void bootWorld();
  if (location.hash) requestAnimationFrame(() => jumpTo(location.hash.slice(1)));
  prefetchTemplates();
  Object.assign(window, { __ge: { route: () => current.id, world: () => world, caps, label: (id: RouteId) => route(id).label } });
}

void start();
