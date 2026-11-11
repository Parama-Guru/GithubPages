import { looks, type Ink } from "./look";

export const ink: Ink = { ...looks.copper.ink };

export function setInk(next: Ink): void {
  Object.assign(ink, next);
}

export function tone(hex: string, alpha: number): string {
  const value = Number.parseInt(hex.slice(1), 16);
  return `rgba(${(value >> 16) & 255},${(value >> 8) & 255},${value & 255},${Math.max(0, Math.min(1, alpha))})`;
}
