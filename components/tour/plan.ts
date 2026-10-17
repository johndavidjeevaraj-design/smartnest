/**
 * The floor plan is not drawn by hand — every wall rectangle below was measured
 * from the wall meshes in smartnest-luxury-indian-villa.glb (world-space bounds,
 * projected to plan). If the model changes, these change with it.
 *
 * Units are metres, the same as the model: x runs west→east, z runs
 * back→front (the street is +z).
 */

export type Wall = { x0: number; z0: number; x1: number; z1: number };

export const GROUND_WALLS: Wall[] = [
  { x0: -7.0, z0: -5.0, x1: 7.0, z1: -4.64 },
  { x0: -7.0, z0: -4.8, x1: -6.64, z1: 4.8 },
  { x0: 6.64, z0: 0.9, x1: 7.0, z1: 4.9 },
  { x0: 6.64, z0: -4.8, x1: 7.0, z1: -1.4 },
  { x0: 6.64, z0: -1.35, x1: 7.0, z1: 0.45 },
  { x0: -7.0, z0: 4.64, x1: -2.9, z1: 5.0 },
  { x0: -3.8, z0: 4.64, x1: -0.9, z1: 5.0 },
  { x0: -1.05, z0: 4.64, x1: 1.05, z1: 5.0 },
  { x0: 3.0, z0: 4.64, x1: 7.0, z1: 5.0 },
  { x0: 1.1, z0: -2.69, x1: 6.7, z1: -2.51 },
  { x0: 5.91, z0: -2.45, x1: 6.09, z1: 2.25 },
  { x0: -1.09, z0: -2.5, x1: -0.91, z1: 0.5 },
  { x0: -1.09, z0: -4.55, x1: -0.91, z1: -3.45 },
  { x0: -6.7, z0: -3.09, x1: -4.1, z1: -2.91 },
  { x0: -4.29, z0: -3.0, x1: -4.11, z1: -1.0 },
];

export const FIRST_WALLS: Wall[] = [
  { x0: -5.4, z0: -4.6, x1: 7.0, z1: -4.3 },
  { x0: -5.4, z0: -4.3, x1: -5.1, z1: 4.0 },
  { x0: 6.7, z0: -4.3, x1: 7.0, z1: 4.0 },
  { x0: -5.1, z0: 4.05, x1: -2.1, z1: 4.35 },
  { x0: -3.1, z0: 4.05, x1: 3.3, z1: 4.35 },
  { x0: 3.0, z0: 4.05, x1: 6.8, z1: 4.35 },
  { x0: -1.29, z0: -2.8, x1: -1.11, z1: 2.8 },
  { x0: 2.71, z0: -4.4, x1: 2.89, z1: 1.2 },
  { x0: 2.95, z0: -2.69, x1: 6.35, z1: -2.51 },
  { x0: 5.51, z0: -2.6, x1: 5.69, z1: -0.1 },
];

export type PlanRoom = {
  id: string;
  label: string;
  floor: "g" | "f";
  x0: number;
  z0: number;
  x1: number;
  z1: number;
  /** Where the camera lands when this room is chosen. */
  pos: [number, number, number];
  target: [number, number, number];
  chapter: number;
};

export const PLAN_ROOMS: PlanRoom[] = [
  // ── ground ────────────────────────────────────────────────────
  {
    id: "living",
    label: "Living",
    floor: "g",
    x0: -0.9, z0: 0.5, x1: 5.9, z1: 4.6,
    pos: [11.5, 9.1, 10.2], target: [1.5, 1.4, 1.2], chapter: 2,
  },
  {
    id: "dining",
    label: "Dining",
    floor: "g",
    x0: -4.1, z0: -2.5, x1: -0.95, z1: 4.6,
    pos: [-9.5, 7.6, 9.5], target: [-2.5, 1.4, 0.2], chapter: 2,
  },
  {
    id: "kitchen",
    label: "Kitchen",
    floor: "g",
    x0: 1.1, z0: -2.5, x1: 5.9, z1: 0.5,
    pos: [13.6, 9.1, 6.9], target: [3.6, 1.4, -2.1], chapter: 3,
  },
  {
    id: "guest",
    label: "Bedroom 3",
    floor: "g",
    x0: -6.6, z0: -2.9, x1: -4.15, z1: 4.6,
    pos: [-12.5, 6.8, 8.5], target: [-5.3, 1.3, 0.2], chapter: 1,
  },
  {
    id: "bathg",
    label: "Bath",
    floor: "g",
    x0: -6.6, z0: -4.6, x1: -4.15, z1: -2.95,
    pos: [-12, 6.2, 2.5], target: [-5.4, 1.0, -3.7], chapter: 1,
  },
  // ── first ─────────────────────────────────────────────────────
  {
    id: "master",
    label: "Master",
    floor: "f",
    x0: -5.1, z0: -4.3, x1: -1.2, z1: 4.0,
    pos: [6.7, 12.2, 7.4], target: [-3.3, 4.5, -1.6], chapter: 4,
  },
  {
    id: "landing",
    label: "Landing",
    floor: "f",
    x0: -1.1, z0: -4.3, x1: 2.8, z1: 4.0,
    pos: [4.5, 11.8, 12.5], target: [0.8, 4.3, 0.2], chapter: 4,
  },
  {
    id: "bed2",
    label: "Bedroom 2",
    floor: "f",
    x0: 2.9, z0: -4.3, x1: 6.7, z1: 4.0,
    pos: [13.5, 12.4, 8.5], target: [4.8, 4.5, 0.8], chapter: 4,
  },
  {
    id: "balcony",
    label: "Balcony",
    floor: "f",
    x0: -2.5, z0: 4.0, x1: 6.6, z1: 5.8,
    pos: [5.5, 8.2, 14.5], target: [0.5, 4.2, 4.6], chapter: 1,
  },
];

/** Outline of each floor slab, used to frame the drawing. */
export const GROUND_OUTLINE = { x0: -7, z0: -5, x1: 7, z1: 5 };
export const FIRST_OUTLINE = { x0: -5.4, z0: -4.6, x1: 7, z1: 4.4 };
