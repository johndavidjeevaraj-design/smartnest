/**
 * The floor plan is generated from the same numbers buildVilla() builds with,
 * so the drawing cannot drift from the geometry. Rooms are true rectangles with
 * their real wall lines — this is a plan of the 3 BHK, not an abstraction.
 */
export type Wall = { x0: number; z0: number; x1: number; z1: number; kind: "wall" | "glass" };

const WT = 0.23;
const seg = (ax: number, az: number, bx: number, bz: number): Wall => {
  const horiz = Math.abs(bx - ax) > Math.abs(bz - az);
  return horiz
    ? { x0: Math.min(ax, bx), z0: az - WT / 2, x1: Math.max(ax, bx), z1: az + WT / 2, kind: "wall" }
    : { x0: ax - WT / 2, z0: Math.min(az, bz), x1: ax + WT / 2, z1: Math.max(az, bz), kind: "wall" };
};

export const GROUND_WALLS: Wall[] = [
  seg(-6, -5, 6, -5),
  seg(-6, -5, -6, 5),
  seg(6, -5, 6, 5),
  seg(-6, 5, 6, 5),
  seg(-6, -0.4, 6, -0.4),
  seg(1.6, -0.4, 1.6, 5),
  seg(3.4, -0.4, 3.4, 5),
  seg(-1.4, -5, -1.4, -0.4),
  seg(2.6, -5, 2.6, -0.4),
  seg(4.4, -5, 4.4, -0.4),
  seg(2.6, -2.6, 4.4, -2.6),
];

export const FIRST_WALLS: Wall[] = [
  seg(-6, -5, 6, -5),
  seg(-6, -5, -6, 5),
  seg(6, -5, 6, 5),
  seg(-6, 5, 6, 5),
  seg(-0.4, -5, -0.4, 5),
  seg(-6, 0.6, -0.4, 0.6),
  seg(-0.4, -0.6, 6, -0.6),
  seg(2.2, -0.6, 2.2, 5),
  seg(2.2, 2.0, 6, 2.0),
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

const room = (
  id: string,
  label: string,
  floor: "g" | "f",
  x0: number,
  z0: number,
  x1: number,
  z1: number,
  pos: [number, number, number],
  target: [number, number, number],
  chapter: number,
): PlanRoom => ({
  id,
  label,
  floor,
  x0,
  z0,
  x1,
  z1,
  cx: (x0 + x1) / 2,
  cz: (z0 + z1) / 2,
  pos,
  target,
  chapter,
});

export const PLAN_ROOMS: PlanRoom[] = [
  // ── ground ──
  room("living", "Living", "g", -5.9, -0.3, 1.5, 4.9, [0, 1.7, 3.6], [-4.2, 1.5, 2.4], 3),
  room("foyer", "Foyer", "g", 1.7, -0.3, 3.3, 4.9, [2.5, 1.65, 6.2], [2.4, 1.6, 1.0], 2),
  room("stair", "Stair", "g", 3.5, -0.3, 5.9, 4.9, [4.6, 2.2, 4.4], [2.4, 4.0, 0.4], 6),
  room("kitchen", "Kitchen", "g", -5.9, -4.9, -1.5, -0.5, [-1.9, 1.7, -1.4], [-4.6, 1.4, -3.6], 5),
  room("dining", "Dining", "g", -1.3, -4.9, 2.5, -0.5, [1.9, 1.7, -0.9], [-0.2, 1.3, -3.4], 4),
  room("bath", "Bath", "g", 2.7, -4.9, 4.3, -2.7, [3.5, 1.6, -1.0], [3.5, 1.3, -3.8], 3),
  room("store", "Store", "g", 4.5, -4.9, 5.9, -0.5, [5.2, 1.7, -1.0], [5.2, 1.4, -4.2], 3),
  // ── first ──
  room("master", "Master", "f", -5.9, -4.9, -0.5, 0.5, [-0.9, 4.9, 1.2], [-4.2, 4.4, -3.0], 7),
  room("bed3", "Bedroom 3", "f", -5.9, 0.7, -0.5, 4.9, [-0.9, 4.9, 2.6], [-3.4, 4.4, 3.4], 8),
  room("bed2", "Bedroom 2", "f", -0.3, -4.9, 5.9, -0.7, [2.4, 4.9, 1.4], [3.4, 4.3, -3.2], 8),
  room("baths", "Baths", "f", 2.3, -0.5, 4.2, 4.9, [3.0, 4.9, 3.4], [3.2, 4.2, 3.4], 8),
  room("landing", "Landing", "f", -0.3, -0.5, 2.1, 4.9, [1.6, 4.9, 3.4], [1.2, 4.4, 0.6], 6),
  room("balcony", "Balcony", "f", 4.3, 2.1, 5.9, 4.9, [8, 6.4, 8], [4.8, 4.4, 4.0], 8),
];

export const GROUND_OUTLINE = { x0: -6, z0: -5, x1: 6, z1: 5 };
export const FIRST_OUTLINE = { x0: -6, z0: -5, x1: 6, z1: 5 };
