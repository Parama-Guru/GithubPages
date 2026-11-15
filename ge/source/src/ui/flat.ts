import { clients, credentials, leadership, projectImages, timeline, whyUs } from "@/content";
import { chapterNumber } from "@/timeline/chapters";
import { heroArt, motif } from "./art";
import { esc, img, photo } from "./html";

// The logo strip shows logos at most 116 px wide: 120 and 240 px copies of the wider ones (tools/build-media.mjs).
const logoCopies = [120, 240];

/* Markup only the 2D site shows (html:not(.has-3d), styles/flat.css): each home chapter's own composition next to
   its .chapter-panel. Hidden with display: none in the 3D site, so its images are never downloaded there. */
const extras: Record<string, () => string> = {
  welcome: () => `<div class="flat-extra flat-hero-art">${heroArt()}</div>`,
  about: () => `<div class="flat-extra"><ol class="flat-timeline" aria-label="Milestones">${[...timeline]
    .reverse()
    .map((item) => `<li><strong>${esc(item.year)}</strong><span>${esc(item.title)}</span><small>${esc(item.body)}</small></li>`)
    .join("")}</ol></div>`,
  "why-us": () => `<div class="flat-extra"><ol class="flat-principles" aria-label="${esc(whyUs.title)}">${whyUs.principles
    .map((item, index) => `<li><span class="mono-label">${chapterNumber(index + 1)}</span><p>${esc(item.title)}</p></li>`)
    .join("")}</ol></div>`,
  projects: () => `<div class="flat-extra flat-mosaic"><ul>${projectImages
    .map(
      (image, index) =>
        // The first photo spans the mosaic; the 2:1 tiles crop the 8:3 photos, which are then drawn a third wider than the tile.
        `<li><figure>${photo(image, index ? "(max-width: 560px) calc(100vw - 48px), (max-width: 999px) calc(66vw - 39px), 500px" : "(max-width: 999px) calc(100vw - 48px), 760px")}<figcaption>${esc(image.label)}</figcaption></figure></li>`,
    )
    .join("")}</ul></div>`,
  clients: () => `<div class="flat-extra flat-marquee"><div class="flat-belt"><ul class="flat-logos" aria-label="Client logos">${clients.logos
    .map((logo) => `<li>${photo({ ...logo, copies: logoCopies.filter((width) => width < logo.width) }, "116px")}</li>`)
    .join("")}</ul></div></div>`,
  quality: () => `<div class="flat-extra"><ul class="flat-creds" aria-label="Credentials">${credentials
    .map((item) => `<li><strong>${esc(item.title)}</strong><p>${esc(item.detail)}</p></li>`)
    .join("")}</ul></div>`,
  leadership: () => `<div class="flat-extra flat-leader"><figure class="flat-portrait">${img(leadership.photo.src, leadership.photo.width, leadership.photo.height, leadership.photo.alt)}</figure>
    <p class="flat-sign">${esc(leadership.name)}<span>${esc(leadership.title)}</span></p></div>`,
  contact: () => `<div class="flat-extra flat-contact-art">${motif("sld", "flat-art flat-art-sld")}</div>`,
};

export function homeExtra(id: string): string {
  return extras[id]?.() ?? "";
}
