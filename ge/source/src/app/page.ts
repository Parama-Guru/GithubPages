import type { World } from "@/world/world";
import { splitHeading, type Controller } from "./journey";
import { gsap, ScrollTrigger, type Motion, type SplitText } from "./motion";

function enquiry(root: HTMLElement): () => void {
  const form = root.querySelector<HTMLFormElement>("[data-enquiry]");
  if (!form) return () => undefined;
  const status = form.querySelector<HTMLElement>(".form-status");
  const submit = (event: SubmitEvent) => {
    event.preventDefault();
    const data = new FormData(form);
    const value = (name: string) => String(data.get(name) ?? "").trim();
    const missing = ["name", "email", "message"].filter((name) => !value(name));
    const email = form.querySelector<HTMLInputElement>("input[name=email]");
    if (missing.length || (email && !email.checkValidity())) {
      if (status) status.textContent = "Please add your name, a valid email address and your project details.";
      form.querySelector<HTMLElement>(`[name=${missing[0] ?? "email"}]`)?.focus();
      return;
    }
    const body = [`Name: ${value("name")}`, `Email: ${value("email")}`, `Phone: ${value("phone")}`, `Company: ${value("company")}`, "", value("message")].join("\n");
    const href = `mailto:ganeshvar@yahoo.com?subject=${encodeURIComponent(`Enquiry from ${value("name")}`)}&body=${encodeURIComponent(body)}`;
    if (status) status.innerHTML = `Your email is ready. <a class="text-link" href="${href}">Open it in your mail app</a>`;
    window.location.href = href;
  };
  form.addEventListener("submit", submit);
  return () => form.removeEventListener("submit", submit);
}

function fitChart(root: HTMLElement): () => void {
  const scroll = root.querySelector<HTMLElement>(".org-scroll");
  const chart = scroll?.querySelector<HTMLElement>(".org-chart");
  if (!scroll || !chart) return () => undefined;
  const fit = () => {
    scroll.classList.remove("is-fitted");
    chart.style.transform = "";
    scroll.style.height = "";
    if (window.innerWidth <= 700) return;
    const available = scroll.clientWidth - 56;
    const scale = Math.min(1, available / chart.scrollWidth);
    if (scale >= 1 || scale < 0.55) return;
    scroll.classList.add("is-fitted");
    chart.style.transform = `translateX(${(available - chart.scrollWidth * scale) / 2}px) scale(${scale})`;
    scroll.style.height = `${chart.offsetHeight * scale + 80}px`;
  };
  fit();
  window.addEventListener("resize", fit);
  return () => window.removeEventListener("resize", fit);
}

export function initPage(root: HTMLElement, motion: Motion, world: World | null): Controller {
  const cleanups: (() => void)[] = [enquiry(root), fitChart(root)];
  const tweens: (gsap.core.Tween | gsap.core.Timeline)[] = [];
  const triggers: ScrollTrigger[] = [];
  let split: SplitText | null = null;

  if (motion.enabled) {
    const heading = root.querySelector<HTMLElement>(".page-title");
    if (heading) {
      split = splitHeading(heading);
      tweens.push(gsap.from(split.chars, { yPercent: 110, stagger: 0.02, duration: 1, ease: "expo.out", delay: 0.2 }));
    }
    const heroItems = root.querySelectorAll<HTMLElement>(".page-hero > :not(.page-title)");
    tweens.push(gsap.from(heroItems, { y: 22, opacity: 0, stagger: 0.07, duration: 0.8, ease: "power3.out", delay: 0.35 }));
    for (const sheet of root.querySelectorAll<HTMLElement>(".sheet")) {
      const items = sheet.querySelectorAll<HTMLElement>(".timeline > li, .principles > article, .gallery > li, .year-cards > li, .logo-grid > li, .testimonials > figure, .documents > li, .commitments > li, .stats > div");
      const reveal = gsap.timeline({ scrollTrigger: { trigger: sheet, start: "top 94%", once: true } });
      reveal.from(sheet, { y: 50, opacity: 0, duration: 0.8, ease: "power3.out" });
      if (items.length) reveal.from(items, { y: 24, opacity: 0, stagger: 0.04, duration: 0.6, ease: "power3.out" }, 0.12);
      tweens.push(reveal);
      for (const element of sheet.querySelectorAll<HTMLElement>("[data-count]")) {
        const final = element.dataset.final ?? "";
        const target = Number(element.dataset.count);
        const state = { value: 0 };
        tweens.push(
          gsap.to(state, {
            value: target,
            duration: 1.6,
            ease: "power2.out",
            scrollTrigger: { trigger: element, start: "top 90%", once: true },
            onUpdate: () => {
              element.textContent = state.value >= target ? final : Math.round(state.value).toLocaleString("en-US");
            },
          }),
        );
      }
    }
  }

  if (world) {
    triggers.push(
      ScrollTrigger.create({
        trigger: root,
        start: "top top",
        end: "bottom bottom",
        onUpdate: (self) => world.setRouteProgress(self.progress),
      }),
    );
  }

  return {
    destroy() {
      for (const cleanup of cleanups) cleanup();
      for (const tween of tweens) {
        tween.scrollTrigger?.kill();
        tween.kill();
      }
      for (const trigger of triggers) trigger.kill();
      split?.revert();
    },
  };
}
