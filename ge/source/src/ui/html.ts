const entities: Record<string, string> = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };

export function esc(value: string): string {
  return value.replace(/[&<>"']/g, (char) => entities[char] ?? char);
}

function asset(path: string): string {
  return `/GithubPages/ge/${path.replace(/^\//, "")}`;
}

export const arrow = `<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>`;
export const arrowUp = `<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 17 17 7M8 7h9v9" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>`;
export const arrowLeft = `<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M19 12H5M11 6l-6 6 6 6" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>`;

export function img(src: string, width: number, height: number, alt: string, extra = ""): string {
  return `<img src="${asset(src)}" width="${width}" height="${height}" alt="${esc(alt)}" loading="lazy" decoding="async" ${extra}>`;
}

type Photo = { src: string; width: number; height: number; alt: string; copies: readonly number[] };

/** An image with smaller copies (name-520.webp …), so the browser picks the one that fits the displayed width. */
export function photo(image: Photo, sizes: string): string {
  const candidates = [...image.copies.map((width) => `${asset(image.src.replace(/\.webp$/, `-${width}.webp`))} ${width}w`), `${asset(image.src)} ${image.width}w`];
  return img(image.src, image.width, image.height, image.alt, `srcset="${candidates.join(", ")}" sizes="${sizes}"`);
}
