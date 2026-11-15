import { CanvasTexture, ClampToEdgeWrapping, ImageBitmapLoader, LinearMipmapLinearFilter, RepeatWrapping, SRGBColorSpace, Texture } from "three";

const cache = new Map<string, Texture>();
const bitmaps = new ImageBitmapLoader().setOptions({ imageOrientation: "flipY", premultiplyAlpha: "none" });

function seeded(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

function canvas(width: number, height = width) {
  const element = document.createElement("canvas");
  element.width = width;
  element.height = height;
  const context = element.getContext("2d");
  if (!context) throw new Error("2D canvas unavailable");
  return { element, context };
}

function finish(texture: Texture, repeat = true, srgb = true) {
  texture.wrapS = texture.wrapT = repeat ? RepeatWrapping : ClampToEdgeWrapping;
  texture.anisotropy = 8;
  texture.minFilter = LinearMipmapLinearFilter;
  if (srgb) texture.colorSpace = SRGBColorSpace;
  return texture;
}

function cached<T extends Texture>(key: string, create: () => T): T {
  const existing = cache.get(key);
  if (existing) return existing as T;
  const texture = create();
  cache.set(key, texture);
  return texture;
}

export function concrete(tone = 46, size = 512): Texture {
  return cached(`concrete-${tone}`, () => {
    const { element, context } = canvas(size);
    const random = seeded(tone * 31);
    context.fillStyle = `rgb(${tone},${tone + 2},${tone + 5})`;
    context.fillRect(0, 0, size, size);
    for (let i = 0; i < 2600; i++) {
      const shade = tone + (random() - 0.5) * 22;
      context.fillStyle = `rgba(${shade},${shade},${shade + 3},${0.18 + random() * 0.25})`;
      const radius = random() * 3.2;
      context.beginPath();
      context.arc(random() * size, random() * size, radius, 0, Math.PI * 2);
      context.fill();
    }
    for (let i = 0; i < 40; i++) {
      const gradient = context.createRadialGradient(random() * size, random() * size, 0, random() * size, random() * size, 40 + random() * 90);
      gradient.addColorStop(0, `rgba(255,255,255,${random() * 0.04})`);
      gradient.addColorStop(1, "rgba(0,0,0,0)");
      context.fillStyle = gradient;
      context.fillRect(0, 0, size, size);
    }
    return finish(new CanvasTexture(element));
  });
}

export function floorTiles(tone = 40): Texture {
  return cached(`tiles-${tone}`, () => {
    const size = 512;
    const { element, context } = canvas(size);
    context.drawImage(concrete(tone).image as HTMLCanvasElement, 0, 0);
    context.strokeStyle = "rgba(0,0,0,0.55)";
    context.lineWidth = 2;
    for (let i = 0; i <= 2; i++) {
      context.beginPath();
      context.moveTo((i * size) / 2, 0);
      context.lineTo((i * size) / 2, size);
      context.moveTo(0, (i * size) / 2);
      context.lineTo(size, (i * size) / 2);
      context.stroke();
    }
    return finish(new CanvasTexture(element));
  });
}

export function wallPanels(tone = 30): Texture {
  return cached(`panels-${tone}`, () => {
    const size = 512;
    const { element, context } = canvas(size);
    context.drawImage(concrete(tone).image as HTMLCanvasElement, 0, 0);
    context.fillStyle = "rgba(0,0,0,0.6)";
    for (let x = 0; x < size; x += size / 4) context.fillRect(x, 0, 2, size);
    context.fillStyle = "rgba(255,255,255,0.05)";
    for (let x = 3; x < size; x += size / 4) context.fillRect(x, 0, 1, size);
    return finish(new CanvasTexture(element));
  });
}

export function asphalt(tone = 22): Texture {
  return cached(`asphalt-${tone}`, () => {
    const size = 512;
    const { element, context } = canvas(size);
    const random = seeded(7);
    context.fillStyle = `rgb(${tone},${tone + 3},${tone + 6})`;
    context.fillRect(0, 0, size, size);
    for (let i = 0; i < 9000; i++) {
      const shade = tone - 2 + random() * 40;
      context.fillStyle = `rgba(${shade},${shade},${shade},${0.5})`;
      context.fillRect(random() * size, random() * size, 1.4, 1.4);
    }
    return finish(new CanvasTexture(element));
  });
}

export function gravel(tone = 42): Texture {
  return cached(`gravel-${tone}`, () => {
    const size = 512;
    const { element, context } = canvas(size);
    const random = seeded(11);
    context.fillStyle = `rgb(${tone},${tone + 1},${tone + 2})`;
    context.fillRect(0, 0, size, size);
    for (let i = 0; i < 7000; i++) {
      const shade = tone - 2 + random() * 70;
      context.fillStyle = `rgb(${shade},${shade - 2},${shade - 6})`;
      context.beginPath();
      context.arc(random() * size, random() * size, 0.8 + random() * 2.2, 0, Math.PI * 2);
      context.fill();
    }
    return finish(new CanvasTexture(element));
  });
}

export function radial(inner = "rgba(255,255,255,1)"): Texture {
  return cached(`radial-${inner}`, () => {
    const size = 256;
    const { element, context } = canvas(size);
    const gradient = context.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    gradient.addColorStop(0, inner);
    gradient.addColorStop(0.4, inner.replace(/[\d.]+\)$/, "0.35)"));
    gradient.addColorStop(1, "rgba(0,0,0,0)");
    context.fillStyle = gradient;
    context.fillRect(0, 0, size, size);
    return finish(new CanvasTexture(element), false);
  });
}

export function cornerShade(): Texture {
  return cached("corner-shade", () => {
    const { element, context } = canvas(256, 8);
    const gradient = context.createLinearGradient(0, 0, 256, 0);
    gradient.addColorStop(0, "rgba(0,0,0,0.72)");
    gradient.addColorStop(0.25, "rgba(0,0,0,0.38)");
    gradient.addColorStop(1, "rgba(0,0,0,0)");
    context.fillStyle = gradient;
    context.fillRect(0, 0, 256, 8);
    return finish(new CanvasTexture(element), false, false);
  });
}

/**
 * A photo or logo, decoded off the main thread (fetch + createImageBitmap) and flipped while decoding, which matches
 * the upside-down upload of an <img> (flipY): uploading the <img> itself decoded and flipped it on the main thread, a
 * long task per photo. `userData.ready` resolves when the bitmap is in place (or the file failed).
 */
export function image(url: string): Texture {
  return cached(`image-${url}`, () => {
    const texture = finish(new Texture(), false);
    texture.flipY = false;
    texture.userData.ready = new Promise<void>((resolve) => {
      bitmaps.load(
        url,
        (bitmap) => {
          texture.image = bitmap;
          texture.needsUpdate = true;
          resolve();
        },
        undefined,
        () => resolve(),
      );
    });
    return texture;
  });
}

type Label = { texture: CanvasTexture; aspect: number; redraw: (draw: (context: CanvasRenderingContext2D, width: number, height: number) => void) => void };

type Paint = (context: CanvasRenderingContext2D, width: number, height: number) => void;

export function label(key: string, width: number, height: number, draw: Paint): Label {
  const existing = cache.get(`label-${key}`) as CanvasTexture | undefined;
  const element = existing ? (existing.image as HTMLCanvasElement) : canvas(width, height).element;
  const context = element.getContext("2d") as CanvasRenderingContext2D;
  const texture = existing ?? (finish(new CanvasTexture(element), false) as CanvasTexture);
  if (!existing) cache.set(`label-${key}`, texture);
  const redraw = (next: Paint) => {
    context.clearRect(0, 0, width, height);
    next(context, width, height);
    texture.needsUpdate = true;
  };
  redraw(draw);
  return { texture, aspect: width / height, redraw };
}

export const fonts = {
  display: (size: number, weight = 600) => `${weight} ${size}px "Spectral", "Spectral Fallback", Georgia, serif`,
  sans: (size: number, weight = 500) => `${weight} ${size}px "Hanken Grotesk Variable", "Hanken Grotesk Fallback", Arial, sans-serif`,
  /** Small technical labels: the UI face in tracked capitals (set `letterSpacing` on the context for long captions). */
  mono: (size: number) => `600 ${size}px "Hanken Grotesk Variable", "Hanken Grotesk Fallback", Arial, sans-serif`,
  script: (size: number) => `400 ${size}px "Parisienne", "Segoe Script", cursive`,
};

/** Sets the font at `size`, or smaller when `text` would be wider than `maxWidth`. */
export function fitFont(context: CanvasRenderingContext2D, text: string, maxWidth: number, font: (size: number) => string, size: number): void {
  context.font = font(size);
  const width = context.measureText(text).width;
  if (width > maxWidth) context.font = font(Math.floor((size * maxWidth) / width));
}

export async function fontsReady(): Promise<void> {
  await Promise.all([document.fonts.load(fonts.display(64)), document.fonts.load(fonts.sans(32)), document.fonts.load(fonts.mono(24)), document.fonts.load(fonts.script(48))]).catch(() => undefined);
}

export function disposeTextures(): void {
  for (const texture of cache.values()) texture.dispose();
  cache.clear();
}
