import { matchRoute } from "@/routes/routes";
import { chapters } from "@/timeline/chapters";
import type { ChapterRange } from "@/world/path";

// Where the visitor left the home tour: kept in memory, for this tab (sessionStorage) and on the home history entry,
// so the Back link and the browser's Back button resume there instead of at the front.
const storageKey = "ge-tour";
let remembered: string | null = null;

const known = (value: unknown): string | null =>
  typeof value === "string" && chapters.some((chapter) => chapter.id === value) ? value : null;

/** Index of the chapter in view: the last one whose top has reached the line (the middle of the viewport). */
export function chapterAt(tops: readonly number[], line: number): number {
  let index = 0;
  tops.forEach((top, position) => {
    if (top <= line) index = position;
  });
  return index;
}

export function chapterInView(root: ParentNode): string | null {
  const sections = [...root.querySelectorAll<HTMLElement>(".chapter")];
  const index = chapterAt(
    sections.map((section) => section.offsetTop),
    window.scrollY + window.innerHeight * 0.5,
  );
  return sections[index]?.id ?? null;
}

export const entryChapter = (state: unknown): string | null => known((state as { chapter?: unknown } | null)?.chapter);

/** Records the chapter, also on the current history entry, which must be the home page's. */
export function rememberChapter(id: string | null): void {
  const chapter = known(id);
  if (!chapter) return;
  if (chapter !== remembered) {
    remembered = chapter;
    try {
      sessionStorage.setItem(storageKey, chapter);
    } catch {
      // Storage can be blocked; memory and history still remember the chapter.
    }
  }
  if (entryChapter(history.state) !== chapter) history.replaceState({ ...history.state, chapter }, "");
}

export function rememberedChapter(): string | null {
  if (remembered) return remembered;
  try {
    return known(sessionStorage.getItem(storageKey));
  } catch {
    return null;
  }
}

/** The chapter to return to, or null for the start of the tour (the first chapter is the start). */
export function resumeChapter(id: string | null): string | null {
  const chapter = known(id);
  return chapter && chapter !== chapters[0]?.id ? chapter : null;
}

/** A journey position inside the chapter's hold, used to load and aim at its room before the home page is laid out. */
export function chapterProgress(id: string): { progress: number; ranges: ChapterRange[] } {
  const count = chapters.length;
  const index = Math.max(
    0,
    chapters.findIndex((chapter) => chapter.id === id),
  );
  // Camera keys are authored in chapter-local time, so even ranges reach the same room as the ranges measured later.
  const ranges = chapters.map((_, position) => ({ start: position / count, end: (position + 1) / count }));
  return { progress: (index + 0.2) / count, ranges };
}

export function labelBack(root: ParentNode): void {
  const chapter = chapters.find((entry) => entry.id === resumeChapter(rememberedChapter()));
  const label = chapter ? `Back to the tour: ${chapter.label}` : "Back to the start of the tour";
  for (const link of root.querySelectorAll<HTMLElement>("[data-back]")) link.setAttribute("aria-label", label);
}

/** Keeps the remembered chapter current while the tour scrolls, so leaving by any route (even browser history) is covered. */
export function trackTour(root: HTMLElement): () => void {
  const sections = [...root.querySelectorAll<HTMLElement>(".chapter")];
  let tops: number[] = [];
  const update = () => {
    // Once the URL has moved on, the home entry keeps what it recorded last.
    if (!tops.length || matchRoute(location.pathname).id !== "home") return;
    rememberChapter(sections[chapterAt(tops, window.scrollY + window.innerHeight * 0.5)]?.id ?? null);
  };
  // Chapter tops are measured only when the layout has changed: resize observations arrive right after layout, so neither
  // they nor the scroll handler force a reflow. Observing the body also catches content above the tour changing height.
  const resized = new ResizeObserver(() => {
    tops = sections.map((section) => section.offsetTop);
    update();
  });
  for (const element of [document.body, root, ...sections]) resized.observe(element);
  window.addEventListener("scroll", update, { passive: true });
  return () => {
    resized.disconnect();
    window.removeEventListener("scroll", update);
  };
}
