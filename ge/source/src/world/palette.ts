export type ScenePalette = {
  background: string;
  fogInside: string;
  fogOutside: string;
  fogScale: number;
  skyTop: string;
  skyHorizon: string;
  skyTopLow: string;
  skyHorizonLow: string;
  skyGlow: string;
  stars: number;
  hemiSky: string;
  hemiGround: string;
  hemi: number;
  sun: string;
  sunIntensity: number;
  environment: number;
  lights: number;
  exposure: number;
  bloom: number;
  bloomThreshold: number;
  vignette: number;
};

/** Golden-hour daylight of the 3D world: a teal sky over a warm horizon, a low warm sun outdoors, little haze and a soft
 * fill so the coloured light pools carry the rooms (surfaces and inks are in look.json). Both tiers use neutral tone
 * mapping, which keeps the brand colours; the low tier (no post-processing) has its own sky values. */
export const palette: ScenePalette = {
  background: "#d9c09a",
  fogInside: "#3b3833",
  fogOutside: "#d9c09a",
  fogScale: 0.16,
  skyTop: "#3f8f93",
  skyHorizon: "#f0cf9c",
  skyTopLow: "#3f8f93",
  skyHorizonLow: "#f0cf9c",
  skyGlow: "#ffb866",
  stars: 0,
  hemiSky: "#f4e3c4",
  hemiGround: "#2a3b31",
  hemi: 0.6,
  sun: "#ffd29a",
  sunIntensity: 1.6,
  environment: 0.85,
  lights: 1.35,
  exposure: 1,
  bloom: 0.55,
  bloomThreshold: 0.86,
  vignette: 0.34,
};
