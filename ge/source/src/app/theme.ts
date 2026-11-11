export const themes = [
  { id: "light", label: "Light", description: "White with the blue of the original website", color: "#004a99" },
  { id: "copper", label: "Copper", description: "Night and copper", color: "#06090d" },
  { id: "signal", label: "Signal", description: "Petrol teal with safety yellow", color: "#061b1e" },
] as const;

export type ThemeId = (typeof themes)[number]["id"];

export const defaultTheme: ThemeId = "light";
const key = "ge-theme";

export function isTheme(value: unknown): value is ThemeId {
  return themes.some((theme) => theme.id === value);
}

export function storedTheme(): ThemeId {
  try {
    const value = localStorage.getItem(key);
    return isTheme(value) ? value : defaultTheme;
  } catch {
    return defaultTheme;
  }
}

export function applyTheme(id: ThemeId): void {
  const root = document.documentElement;
  root.dataset.theme = id;
  const meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
  if (meta) meta.content = themes.find((theme) => theme.id === id)?.color ?? themes[0].color;
  try {
    localStorage.setItem(key, id);
  } catch {
    return;
  }
}
