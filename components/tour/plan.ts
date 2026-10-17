/**
 * Plan data for the big villa (smartnest-3bhk-villa.glb).
 *
 * Unlike the furnished model, this one has no interior partition meshes — its
 * walls are single volumes — so the drawing shows the building's actual massing
 * (ground slab, first slab, roof, garage apron) measured from the model, plus
 * the six automation zones SmartNest would actually commission.
 */
export type Wall = { x0: number; z0: number; x1: number; z1: number; kind: "slab" | "mass" };

export const GROUND_WALLS: Wall[] = [
  { x0: -7.7, z0: -15.9, x1: 7.8, z1: 3.3, kind: "mass" },
  { x0: 1.5, z0: 3.3, x1: 7.0, z1: 7.5, kind: "slab" },
];

export const FIRST_WALLS: Wall[] = [
  { x0: -7.3, z0: -15.5, x1: 7.4, z1: 2.8, kind: "mass" },
  { x0: -4.6, z0: -15.5, x1: 7.4, z1: -3.3, kind: "slab" },
];

export type PlanRoom = {
  id: string;
  label: string;
  floor: "g" | "f";
  x0: number;
  z0: number;
  x1: number;
  z1: number;
  cx: number;
  cz: number;
  pos: [number, number, number];
  target: [number, number, number];
  chapter: number;
};

export const PLAN_ROOMS: PlanRoom[] = [
  {
    id: "living", label: "Living wing", floor: "g",
    x0: -7.3, z0: -9, x1: 1.5, z1: 2.5, cx: 0, cz: -6,
    pos: [-16, 6.5, 14], target: [-1, 2.2, -6], chapter: 2,
  },
  {
    id: "dining", label: "Dining", floor: "g",
    x0: -7.3, z0: -15.5, x1: 1.5, z1: -9, cx: -4, cz: -11,
    pos: [-14, 7.5, 2], target: [-4, 2.2, -11], chapter: 2,
  },
  {
    id: "kitchen", label: "Kitchen", floor: "g",
    x0: 1.5, z0: -15.5, x1: 7.4, z1: -9, cx: 4.5, cz: -11,
    pos: [19, 7.5, 10], target: [4.5, 2.0, -10], chapter: 3,
  },
  {
    id: "guest", label: "Garage", floor: "g",
    x0: 1.5, z0: 2.5, x1: 7.4, z1: 7.5, cx: 4.3, cz: 1.6,
    pos: [16, 5.5, 16], target: [4.3, 2.2, 1.6], chapter: 1,
  },
  {
    id: "master", label: "Master suite", floor: "f",
    x0: -7.3, z0: -15.5, x1: 1.0, z1: -3.3, cx: -2, cz: -9,
    pos: [-18, 13.5, 12], target: [-2, 5.4, -8], chapter: 4,
  },
  {
    id: "bedroom2", label: "East wing", floor: "f",
    x0: 1.0, z0: -15.5, x1: 7.4, z1: -3.3, cx: 4, cz: -6,
    pos: [20, 13.5, 8], target: [4, 5.4, -6], chapter: 4,
  },
];

export const GROUND_OUTLINE = { x0: -7.7, z0: -15.9, x1: 7.8, z1: 3.3 };
export const FIRST_OUTLINE = { x0: -7.3, z0: -15.5, x1: 7.4, z1: 2.8 };
