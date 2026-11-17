/**
 * A button anchored on an object in the 3D scene (the switchyard's breaker bay): the keyboard, touch and screen-reader
 * equivalent of clicking the object, and a visible cue that it can be clicked. The world reports where the object is
 * on screen (World onMarker); the button shows there while the object is held in view and never covers the chapter text.
 */
export type Hotspot = { element: HTMLButtonElement; place(x: number, y: number, visible: boolean): void; setPressed(pressed: boolean): void; destroy(): void };

type Options = { label: string; short: string; pressed: boolean; onToggle(): void; onFocusAway(): void };

const SIZE = 44;
const MARGIN = 8;

export function createHotspot(host: HTMLElement, { label, short, pressed, onToggle, onFocusAway }: Options): Hotspot {
  const element = document.createElement("button");
  element.type = "button";
  element.className = "scene-hotspot";
  element.dataset.hotspot = "";
  element.setAttribute("aria-pressed", String(pressed));
  // Narrow screens show the short label; the rest of the name stays readable to screen readers (main.css).
  const rest = label.startsWith(short) ? label.slice(short.length) : "";
  element.innerHTML = `<span class="scene-hotspot-mark" aria-hidden="true"><svg viewBox="0 0 24 24" width="20" height="20"><path d="M12 3.5v7.5"/><path d="M6.6 6.9a7.4 7.4 0 1 0 10.8 0"/></svg></span><span class="scene-hotspot-label"><span></span><span class="scene-hotspot-more"></span></span>`;
  const [first, more] = element.querySelectorAll<HTMLElement>(".scene-hotspot-label > span");
  if (first) first.textContent = rest ? short : label;
  if (more) more.textContent = rest;
  host.append(element);
  let shown = false;
  // Geometry is read only when the button appears or the window changes size, never while the scene moves it.
  let text: DOMRect | null = null;
  let viewport = window.innerWidth;
  let width = 0;
  const panel = host.querySelector<HTMLElement>(".chapter-panel");
  const click = () => onToggle();
  // Reached with the keyboard before the yard is in view: bring the yard into view first.
  const focus = () => {
    if (!shown) onFocusAway();
  };
  const resize = () => {
    viewport = window.innerWidth;
    text = null;
    width = 0;
  };
  element.addEventListener("click", click);
  element.addEventListener("focus", focus);
  window.addEventListener("resize", resize, { passive: true });

  /** The chapter's text card (main.css .chapter-panel::after), which the button must not cover. */
  function card(): DOMRect | null {
    const firstRect = panel?.firstElementChild?.getBoundingClientRect();
    const lastRect = panel?.lastElementChild?.getBoundingClientRect();
    const box = panel?.getBoundingClientRect();
    if (!firstRect || !lastRect || !box) return null;
    return new DOMRect(box.left - 40, firstRect.top - 40, box.width + 80, lastRect.bottom - firstRect.top + 80);
  }

  return {
    element,
    place(x, y, visible) {
      if (visible && !shown) {
        text = card();
        width = element.offsetWidth;
      }
      let left = x;
      let top = y;
      if (visible) {
        const covers = text && left + SIZE / 2 > text.left && left - SIZE / 2 < text.right && top + SIZE / 2 > text.top && top - SIZE / 2 < text.bottom;
        // Over the text (narrow screens): above the card if there is room below the header, else not shown.
        if (covers && text) top = text.top - SIZE;
        visible = top > 96;
      }
      shown = visible;
      element.classList.toggle("is-visible", visible);
      if (!visible) return;
      // The label reads towards the chapter text when there is room, keeping the scene beyond the control clear;
      // otherwise it reads away from it, and the whole control is kept on screen.
      const label = Math.max(0, width - SIZE);
      const before = text && top > text.top - SIZE && top < text.bottom ? text.right : 0;
      const leftward = left - SIZE / 2 - label >= before + MARGIN || left + SIZE / 2 + label > viewport - MARGIN;
      left = leftward ? Math.max(left, MARGIN + label + SIZE / 2) : Math.min(left, viewport - MARGIN - label - SIZE / 2);
      element.classList.toggle("is-left", leftward);
      element.style.setProperty("--x", `${Math.round(left)}px`);
      element.style.setProperty("--y", `${Math.round(top)}px`);
    },
    setPressed(value) {
      element.setAttribute("aria-pressed", String(value));
    },
    destroy() {
      element.removeEventListener("click", click);
      element.removeEventListener("focus", focus);
      window.removeEventListener("resize", resize);
      element.remove();
    },
  };
}
