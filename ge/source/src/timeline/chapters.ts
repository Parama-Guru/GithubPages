import type { RouteId, ZoneKey } from "@/routes/routes";

export type Chapter = {
  id: string;
  zone: ZoneKey;
  label: string;
  route: RouteId;
};

export const chapters: Chapter[] = [
  { id: "welcome", zone: "approach", label: "Arrival", route: "home" },
  { id: "about", zone: "lobby", label: "About", route: "about" },
  { id: "why-us", zone: "control", label: "Why choose us", route: "features" },
  { id: "projects", zone: "hall", label: "Projects", route: "projects" },
  { id: "clients", zone: "gallery", label: "Clients", route: "clients" },
  { id: "quality", zone: "safety", label: "Quality & Safety", route: "quality-safety" },
  { id: "leadership", zone: "office", label: "Leadership", route: "leadership" },
  { id: "contact", zone: "yard", label: "Contact", route: "contact" },
];

export function chapterNumber(index: number): string {
  return String(index).padStart(2, "0");
}
