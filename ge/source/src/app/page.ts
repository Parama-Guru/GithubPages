import { company } from "@/content/company";
import type { Controller } from "./journey";

/* The controls of the pages other than home, the same in the 2D and 3D modes: the enquiry form and the organisation
   chart's fit. Their animations come from app/flat.ts. */

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
    const href = `mailto:${company.emails[0]}?subject=${encodeURIComponent(`Enquiry from ${value("name")}`)}&body=${encodeURIComponent(body)}`;
    if (status) status.innerHTML = `Your email is ready. <a class="text-link" href="${href}">Open it in your mail app</a>`;
    window.location.href = href;
  };
  form.addEventListener("submit", submit);
  return () => form.removeEventListener("submit", submit);
}

/** Scales a chart slightly wider than the screen down to fit; much wider charts scroll sideways instead. */
function fitChart(root: HTMLElement): () => void {
  const scroll = root.querySelector<HTMLElement>(".org-scroll");
  const chart = scroll?.querySelector<HTMLElement>(".org-chart");
  if (!scroll || !chart) return () => undefined;
  let frame = 0;
  const fit = () => {
    // Every measurement first, then every write, so a fit costs one layout. A transform does not change these sizes.
    const available = scroll.clientWidth - 56;
    const natural = chart.scrollWidth;
    const height = chart.offsetHeight;
    const scale = Math.min(1, available / natural);
    const fitted = window.innerWidth > 700 && scale < 1 && scale >= 0.55;
    scroll.classList.toggle("is-fitted", fitted);
    chart.style.transform = fitted ? `translateX(${(available - natural * scale) / 2}px) scale(${scale})` : "";
    scroll.style.height = fitted ? `${height * scale + 80}px` : "";
  };
  const schedule = () => {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(fit);
  };
  schedule();
  window.addEventListener("resize", schedule);
  return () => {
    cancelAnimationFrame(frame);
    window.removeEventListener("resize", schedule);
  };
}

export function initPage(root: HTMLElement): Controller {
  const cleanups = [enquiry(root), fitChart(root)];
  return {
    destroy() {
      for (const cleanup of cleanups) cleanup();
    },
  };
}
