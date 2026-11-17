import type { Vec3 } from "./math";

/**
 * Positions shared by the rooms (zones/*.ts) and the effects drawn across them (effects/*.ts). The effects are built
 * once for the whole facility, so they cannot import the rooms' modules, which load on demand.
 */
export const layout = {
  approach: {
    /** Canopy downlights over the entrance. */
    canopy: { y: 3.47, xs: [-2.4, 0, 2.4], zs: [0.9, 2.6] },
  },
  lobby: {
    /** The bus under the milestone plaques, from the entrance end towards the control room. */
    bus: { x: 5.86, y: 1.32, from: -9.3, to: -16.7 },
  },
  control: {
    videoWall: { x: 6.9, y: 2.6, z: -25.2 },
    screen: { width: 2.55, height: 1.5, gap: 0.12 },
  },
  hall: {
    heroPanel: [-4.2, 0, -48.5] as Vec3,
    /** Busbar trunk under the ceiling and the two cable trays beside it. */
    trunk: { y: 6.58, from: -32.5, to: -63.5 },
    trays: { xs: [-4.6, 4.6], y: 6.0 },
  },
  yard: {
    gantries: [-134, -150],
    phases: [-6, 0, 6],
    conductorY: 9.2,
    /** Where the line leaves the far gantry for the first tower. */
    towerTop: (x: number): Vec3 => [x * 1.6, 20, -240],
    /** The line bay: one circuit-breaker pole under each phase, below the span between the gantries, and the pole's
     * operating mechanism beside the middle pole (where the scene's control for it is anchored). */
    bay: { z: -137.2, top: 4.5, mechanism: 1.15 },
    floodlights: [
      [-16, -122],
      [16, -122],
      [-16, -160],
      [16, -160],
    ] as [number, number][],
  },
} as const;
