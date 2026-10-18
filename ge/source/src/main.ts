import "@fontsource-variable/big-shoulders-display";
import "@fontsource/ibm-plex-sans/latin-400.css";
import "@fontsource/ibm-plex-sans/latin-500.css";
import "@fontsource/ibm-plex-sans/latin-600.css";
import "@fontsource/ibm-plex-mono/latin-400.css";
import "@fontsource/ibm-plex-mono/latin-500.css";
import "./styles/main.css";
import { basePath, href, matchRoute, route, type Route, type RouteId } from "@/routes/routes";
import { renderFooter, renderHead, renderHeader, renderMenu } from "@/ui/layout";
import { renderMain } from "@/ui/pages";
import type { Target, World } from "@/world/world";
import { detect, preferences } from "./app/capabilities";
import { chapterScroll, initJourney, type Controller } from "./app/journey";
import { createMotion, gsap, scrollTo, ScrollTrigger } from "./app/motion";
import { initPage } from "./app/page";
import { play, quiet, setSound } from "./app/sound";

const html = document.documentElement;
const caps = detect();
const main = document.querySelector<HTMLElement>("#main") as HTMLElement;
const canvas = document.querySelector<HTMLCanvasElement>("[data-canvas]") as HTMLCanvasElement;
const stage = document.querySelector<HTMLElement>(".world") as HTMLElement;
const hoverLabel = document.querySelector<HTMLElement>("[data-hover-label]");
const params = new URLSearchParams(location.search);
const poster = params.get("poster");

let current: Route = matchRoute(location.pathname);
let controller: Controller = { destroy: () => undefined };
let world: World | null = null;
const panel = { value: 0 };

const managedHead = 'title, meta[name="description"], meta[name="robots"], link[rel="canonical"], meta[property^="og:"], meta[name^="twitter:"], script[data-seo]';

function updateHead(next: Route): void {
  for (const node of document.head.querySelectorAll(managedHead)) node.remove();
  const template = document.createElement("template");
  template.innerHTML = renderHead(next);
  document.head.append(template.content);
}

function hydrateShell(): void {
  if (main.children.length) return;
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

function targetFor(next: Route): Target {
  return next.id === "home" ? { kind: "journey" } : { kind: "route", id: next.id as Exclude<RouteId, "home"> };
}

const motion = createMotion(!caps.reduced && !poster);

function setPanel(open: boolean): void {
  gsap.to(panel, {
    value: open ? 1 : 0,
    duration: caps.reduced ? 0 : 2.2,
    ease: "power2.inOut",
    onUpdate: () => world?.setPanel(panel.value),
  });
  for (const button of document.querySelectorAll<HTMLButtonElement>("[data-action='panel']")) {
    button.setAttribute("aria-pressed", String(open));
    if (button.firstChild) button.firstChild.textContent = open ? "Close the switchgear panel" : "Open a switchgear panel";
  }
  if (open) play("breaker");
}

function enterFacility(y: number): void {
  play("door");
  scrollTo(motion, y, 3.4);
}

function mount(next: Route): Controller {
  if (next.id === "home") {
    const journey = initJourney(main, motion, world, enterFacility);
    const toggle = (event: Event) => {
      const button = (event.target as HTMLElement).closest("[data-action='panel']");
      if (button) setPanel(panel.value < 0.5);
    };
    main.addEventListener("click", toggle);
    return {
      destroy() {
        journey.destroy();
        main.removeEventListener("click", toggle);
      },
    };
  }
  return initPage(main, motion, world);
}

async function navigate(url: URL, push = true): Promise<void> {
  const next = matchRoute(url.pathname);
  if (next.id === current.id) {
    if (url.hash) jumpTo(url.hash.slice(1));
    return;
  }
  if (push) history.pushState(null, "", url.pathname + url.search + url.hash);
  main.classList.add("is-leaving");
  world?.goTo(targetFor(next), caps.reduced ? 0 : 2);
  if (panel.value > 0) setPanel(false);
  await new Promise((resolve) => setTimeout(resolve, world && !caps.reduced ? 420 : 60));
  controller.destroy();
  main.innerHTML = renderMain(next.id);
  updateHead(next);
  updateChrome(next);
  motion.lenis?.scrollTo(0, { immediate: true, force: true });
  window.scrollTo(0, 0);
  current = next;
  main.classList.remove("is-leaving");
  controller = mount(next);
  ScrollTrigger.refresh();
  main.focus({ preventScroll: true });
  if (url.hash) requestAnimationFrame(() => jumpTo(url.hash.slice(1)));
}

function jumpTo(id: string): void {
  const y = current.id === "home" && html.classList.contains("has-3d") ? chapterScroll(main, id) : null;
  const element = document.getElementById(id);
  if (y !== null) scrollTo(motion, y, 1.6);
  else if (element) scrollTo(motion, element, 1.2);
}

function internal(anchor: HTMLAnchorElement): URL | null {
  if (anchor.target === "_blank" || anchor.hasAttribute("download")) return null;
  const url = new URL(anchor.href, location.href);
  if (url.origin !== location.origin || !url.pathname.startsWith(basePath)) return null;
  if (/\.(xml|webp|png|jpg|pdf)$/.test(url.pathname)) return null;
  return url;
}

function syncPrefs(): void {
  for (const input of document.querySelectorAll<HTMLInputElement>("[data-pref]")) {
    const name = input.dataset.pref;
    if (name === "motion") input.checked = caps.reduced;
    if (name === "3d") input.checked = caps.has3d || (preferences.prefer3d() && caps.webgl && !caps.reduced && !caps.saveData);
    if (name === "sound") input.checked = preferences.sound();
    if (name === "pause") input.checked = preferences.paused();
  }
}

function uiTarget(target: EventTarget | null): boolean {
  return Boolean((target as HTMLElement | null)?.closest("a, button, input, textarea, select, label, dialog, .site-header, .site-footer, .sheet, .page-hero, .chapter-panel"));
}

function bindShell(): void {
  document.addEventListener("click", (event) => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const target = event.target as HTMLElement;
    if (target.closest("[data-menu-open]")) {
      document.querySelector<HTMLDialogElement>("#site-menu")?.showModal();
      motion.lenis?.stop();
      return;
    }
    if (target.closest("[data-menu-close]")) {
      document.querySelector<HTMLDialogElement>("#site-menu")?.close();
      return;
    }
    const anchor = target.closest<HTMLAnchorElement>("a[href]");
    if (anchor) {
      const url = internal(anchor);
      if (!url) return;
      event.preventDefault();
      document.querySelector<HTMLDialogElement>("#site-menu")?.close();
      void navigate(url);
      return;
    }
    if (world && !uiTarget(target)) {
      const id = world.pick();
      if (!id) return;
      if (id === "doors") {
        if (current.id === "home") {
          const second = main.querySelectorAll<HTMLElement>(".chapter")[1];
          if (second) enterFacility(second.offsetTop + (second.offsetHeight - window.innerHeight) * 0.32);
        } else void navigate(new URL(href("home"), location.href));
      } else if (id === "panel") setPanel(panel.value < 0.5);
      else if (id.startsWith("route:")) void navigate(new URL(href(id.slice(6) as RouteId), location.href));
    }
  });
  document.addEventListener(
    "close",
    (event) => {
      if ((event.target as HTMLElement).id === "site-menu") {
        motion.lenis?.start();
        document.querySelector<HTMLElement>("[data-menu-open]")?.focus();
      }
    },
    true,
  );
  document.addEventListener("change", (event) => {
    const input = (event.target as HTMLElement).closest<HTMLInputElement>("[data-pref]");
    if (!input) return;
    const name = input.dataset.pref as "motion" | "3d" | "sound" | "pause";
    preferences.set(name, input.checked);
    if (name === "pause") world?.setMotion(!input.checked);
    else if (name === "sound") {
      setSound(input.checked);
      if (input.checked) play("hum");
      else quiet();
    } else location.reload();
  });
  window.addEventListener("popstate", () => void navigate(new URL(location.href), false));
  const header = () => document.querySelector("[data-header]")?.classList.toggle("is-solid", window.scrollY > 24);
  window.addEventListener("scroll", header, { passive: true });
  header();
  syncPrefs();
  setSound(caps.sound);
}

function bindPointer(active: World): void {
  window.addEventListener(
    "pointermove",
    (event) => {
      if (event.pointerType === "touch" || uiTarget(event.target)) {
        active.clearPointer();
        return;
      }
      active.setPointer(event.clientX, event.clientY);
    },
    { passive: true },
  );
  document.addEventListener("pointerleave", () => active.clearPointer());
}

function onHover(label: string | null, x: number, y: number): void {
  if (!hoverLabel) return;
  hoverLabel.classList.toggle("is-visible", Boolean(label));
  if (!label) return;
  hoverLabel.textContent = label;
  hoverLabel.style.left = `${x}px`;
  hoverLabel.style.top = `${y}px`;
}

function fallback(reason: string): void {
  console.warn(`3D experience unavailable: ${reason}`);
  world?.dispose();
  world = null;
  stage.dataset.world = "static";
  html.classList.remove("has-3d", "is-loading");
  html.classList.add("is-loaded");
  controller.destroy();
  controller = mount(current);
  ScrollTrigger.refresh();
}

async function bootWorld(): Promise<void> {
  html.classList.add("has-3d", "is-loading");
  stage.dataset.world = "loading";
  const bar = document.querySelector<HTMLElement>("[data-loader-bar]");
  const value = document.querySelector<HTMLElement>("[data-loader-value]");
  const started = performance.now();
  const timeout = setTimeout(() => fallback("loading took too long"), 25000);
  try {
    const { World } = await import("@/world/world");
    world = new World({
      canvas,
      tier: caps.tier,
      motion: !caps.reduced && !preferences.paused(),
      onHover,
      onProgress: (progress) => {
        if (bar) bar.style.width = `${Math.round(progress * 100)}%`;
        if (value) value.textContent = `${Math.round(progress * 100)}%`;
      },
    });
    await world.load(targetFor(current));
    clearTimeout(timeout);
    if (!world) return;
    const wait = Math.max(0, 900 - (performance.now() - started));
    await new Promise((resolve) => setTimeout(resolve, wait));
    stage.dataset.world = "ready";
    stage.classList.add("is-interactive");
    world.start();
    bindPointer(world);
    window.addEventListener("resize", () => world?.resize());
    document.addEventListener("visibilitychange", () => (document.hidden ? world?.stop() : world?.start()));
    canvas.addEventListener("webglcontextlost", () => fallback("graphics context lost"));
    window.setInterval(() => {
      if (world && world.averageFrame > 24 && world.downgrade()) console.info(`Quality lowered to ${world.currentTier}`);
    }, 3000);
    html.classList.add("is-loaded");
    setTimeout(() => html.classList.remove("is-loading"), 1000);
  } catch (error) {
    clearTimeout(timeout);
    fallback(error instanceof Error ? error.message : String(error));
  }
}

async function renderPoster(name: string): Promise<void> {
  html.classList.add("is-poster", "has-3d");
  const { World } = await import("@/world/world");
  world = new World({ canvas, tier: (params.get("tier") as "high" | "medium" | "low" | null) ?? "high", motion: false });
  stage.dataset.world = "ready";
  const progress = Number(params.get("p") ?? "0");
  const target: Target = name === "journey" ? { kind: "journey" } : { kind: "route", id: name as Exclude<RouteId, "home"> };
  await world.load(target);
  if (target.kind === "journey") {
    const { evenRanges } = await import("@/world/path");
    world.setJourney(progress, evenRanges(8));
  }
  await world.renderPose(target, progress);
  html.dataset.poster = "ready";
}

async function start(): Promise<void> {
  hydrateShell();
  if (poster) {
    await renderPoster(poster);
    return;
  }
  bindShell();
  if (caps.has3d) await bootWorld();
  else {
    html.classList.remove("has-3d");
    stage.dataset.world = "static";
    html.classList.add("is-loaded");
  }
  controller = mount(current);
  if (location.hash) requestAnimationFrame(() => jumpTo(location.hash.slice(1)));
  Object.assign(window, { __ge: { route: () => current.id, world: () => world, caps, label: (id: RouteId) => route(id).label } });
}

void start();
