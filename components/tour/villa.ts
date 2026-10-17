export type RoomKey =
  | "living"
  | "dining"
  | "kitchen"
  | "foyer"
  | "bath"
  | "master"
  | "bed2"
  | "bed3"
  | "landing";

/** Every room has a ceiling light, a wall switch and a status LED. */
export const ROOMS: { key: RoomKey; label: string; floor: string }[] = [
  { key: "living", label: "Living", floor: "Ground" },
  { key: "dining", label: "Dining", floor: "Ground" },
  { key: "kitchen", label: "Kitchen", floor: "Ground" },
  { key: "foyer", label: "Foyer", floor: "Ground" },
  { key: "bath", label: "Bath", floor: "Ground" },
  { key: "master", label: "Master", floor: "First" },
  { key: "bed2", label: "Bedroom 2", floor: "First" },
  { key: "bed3", label: "Bedroom 3", floor: "First" },
  { key: "landing", label: "Landing", floor: "First" },
];

/** Ceiling fixture positions, matching buildVilla() exactly. */
export const LIGHT_POINTS: { room: RoomKey; p: [number, number, number] }[] = [
  { room: "living", p: [-2.2, 3.0, 2.1] },
  { room: "dining", p: [0.6, 3.0, -1.3] },
  { room: "kitchen", p: [-2.4, 3.0, -4.2] },
  { room: "foyer", p: [2.5, 3.0, 2.4] },
  { room: "bath", p: [3.5, 3.0, -3.8] },
  { room: "master", p: [-3.2, 6.2, -2.4] },
  { room: "bed2", p: [3.0, 6.2, -2.8] },
  { room: "bed3", p: [-3.0, 6.2, 2.7] },
  { room: "landing", p: [0.9, 6.0, 2.0] },
];

export const SWITCH_ROOMS: Record<string, RoomKey> = {};

export type TimeKey = "day" | "dusk" | "night";

export const TIMES: Record<
  TimeKey,
  {
    label: string;
    sky: string;
    sky2: string;
    sun: [number, number, number];
    sunColor: string;
    sunPower: number;
    ambient: number;
    hemi: number;
    fill: number;
    ground: string;
    sconce: number;
    exposure: number;
  }
> = {
  day: {
    label: "Day",
    sky: "#bcd9f2",
    sky2: "#e8f1fa",
    sun: [26, 30, 24],
    sunColor: "#fff7ea",
    sunPower: 2.6,
    ambient: 0.34,
    hemi: 0.7,
    fill: 0.34,
    ground: "#6b6350",
    sconce: 0.12,
    exposure: 0.94,
  },
  dusk: {
    label: "Dusk",
    sky: "#20304c",
    sky2: "#b8764e",
    sun: [-26, 11, 17],
    sunColor: "#ffb37a",
    sunPower: 3.0,
    ambient: 0.26,
    hemi: 0.4,
    fill: 0.34,
    ground: "#33291c",
    sconce: 3.4,
    exposure: 1.1,
  },
  night: {
    label: "Night",
    sky: "#05080f",
    sky2: "#111c2e",
    sun: [-16, 22, 18],
    sunColor: "#9dbdff",
    sunPower: 0.9,
    ambient: 0.16,
    hemi: 0.2,
    fill: 0.26,
    ground: "#140f0a",
    sconce: 3.8,
    exposure: 1.2,
  },
};

export type View = {
  id: string;
  n: string;
  label: string;
  title: string;
  blurb: string;
  pos: [number, number, number];
  target: [number, number, number];
  /** Vertical fov for this waypoint; interiors want a wider lens. */
  fov?: number;
  cut: boolean;
  /** How much scroll this leg of the journey consumes. */
  w: number;
};

/**
 * The journey. Two Catmull-Rom curves are built from these — one through `pos`,
 * one through `target` — exactly the technique the reference walkthrough uses.
 * `w` is the scroll weight per leg, so a corridor can take a flick and the
 * approach can take two.
 *
 * The path goes in through the garage, sweeps the ground floor, rises to the
 * first floor, lifts into a section, then returns outside.
 */
export const VIEWS: View[] = [
  {
    id: "approach",
    n: "01",
    label: "Approach",
    title: "Walk through it before it's built.",
    blurb:
      "A 3 BHK villa on a 12 by 10 metre footprint. Keep scrolling — the house opens and lets you in.",
    pos: [15.5, 5.6, 17.6],
    target: [1, 2.9, 2],
    fov: 50,
    cut: false,
    w: 1.4,
  },
  {
    id: "driveway",
    n: "02",
    label: "Driveway",
    title: "The porch light is already on.",
    blurb:
      "KNX presence detection picks you up at the gate and runs the arrival scene before you reach the door.",
    pos: [4.5, 2.4, 12],
    target: [2.4, 1.7, 5],
    fov: 60,
    cut: false,
    w: 1.2,
  },
  {
    id: "foyer",
    n: "03",
    label: "Foyer",
    title: "You are inside the house.",
    blurb:
      "One touch panel by the door holds every circuit on both floors.",
    pos: [2.5, 1.65, 6.2],
    target: [2.4, 1.6, 1.0],
    fov: 66,
    cut: false,
    w: 1.1,
  },
  {
    id: "living",
    n: "04",
    label: "Living",
    title: "Light that follows the evening.",
    blurb:
      "The living room dims to 9% at dusk without anyone touching a wall. Scene, not switch.",
    pos: [0.9, 1.62, 0.5],
    target: [-4.0, 1.42, 2.9],
    fov: 72,
    cut: false,
    w: 1.3,
  },
  {
    id: "dining",
    n: "05",
    label: "Dining",
    title: "One circuit, six chairs.",
    blurb:
      "The pendant over the table is on its own channel — dinner dim, breakfast bright.",
    pos: [2.45, 2.0, -0.6],
    target: [-0.9, 1.15, -3.3],
    fov: 74,
    cut: false,
    w: 1.1,
  },
  {
    id: "kitchen",
    n: "06",
    label: "Kitchen",
    title: "The busiest room, quietly managed.",
    blurb:
      "Task lighting over the counters, a hood that talks to the extractor, and a keypad by the door.",
    pos: [-1.9, 1.7, -1.4],
    target: [-4.6, 1.4, -3.6],
    fov: 70,
    cut: false,
    w: 1.2,
  },
  {
    id: "rise",
    n: "07",
    label: "Stair",
    title: "Up to the sleeping floor.",
    blurb:
      "Fourteen risers, a landing, and three bedrooms off it. Goodnight kills all of it at once.",
    pos: [4.6, 2.2, 4.4],
    target: [2.4, 4.0, 0.4],
    fov: 66,
    cut: false,
    w: 1.15,
  },
  {
    id: "master",
    n: "08",
    label: "Master",
    title: "One button, and the day is over.",
    blurb:
      "Shutters down, downstairs dark, perimeter armed, thermostat set. You never leave the bed.",
    pos: [-1.35, 4.86, 0.1],
    target: [-4.3, 4.25, -2.9],
    fov: 72,
    cut: false,
    w: 1.3,
  },
  {
    id: "bedrooms",
    n: "09",
    label: "Bedrooms",
    title: "Every room its own circuit.",
    blurb:
      "Bedroom two and three each get a wall switch, a temperature setpoint and their own blind.",
    pos: [5.1, 4.86, -1.15],
    target: [1.6, 4.15, -3.7],
    fov: 70,
    cut: false,
    w: 1.2,
  },
  {
    id: "section",
    n: "10",
    label: "Section",
    title: "Look at it the way we do.",
    blurb:
      "A clipping plane cuts the house in half. This is the drawing the electrician installs from.",
    pos: [10.4, 9.6, 11.2],
    target: [0.2, 3.1, -0.6],
    fov: 44,
    cut: true,
    w: 1.5,
  },
  {
    id: "return",
    n: "11",
    label: "Outside",
    title: "You have walked the whole house.",
    blurb: "",
    pos: [16, 9, 18],
    target: [1, 3, 0],
    fov: 50,
    cut: false,
    w: 1.3,
  },
];

/** Total scroll weight — the page is this many screens tall. */
export const TOTAL_WEIGHT = VIEWS.reduce((n, v) => n + v.w, 0);

/** Cumulative offsets, so an index maps to a scroll fraction and back. */
export const CUMULATIVE: number[] = (() => {
  const c = [0];
  for (let i = 0; i < VIEWS.length - 1; i++) c.push(c[i] + VIEWS[i].w);
  return c;
})();

/** Scroll fraction (0–1) → float index (0 … N-1). */
export function progressToIndex(p: number): number {
  const t = Math.min(Math.max(p, 0), 1) * TOTAL_WEIGHT;
  let seg = 0;
  while (seg < VIEWS.length - 2 && CUMULATIVE[seg + 1] <= t) seg++;
  const span = CUMULATIVE[seg + 1] - CUMULATIVE[seg] || 1;
  return Math.min(Math.max(seg + (t - CUMULATIVE[seg]) / span, 0), VIEWS.length - 1);
}

/** Float index → scroll fraction, for the chapter rail. */
export function indexToProgress(i: number): number {
  const n = Math.min(Math.max(Math.floor(i), 0), VIEWS.length - 2);
  return (CUMULATIVE[n] + (i - n) * VIEWS[n].w) / TOTAL_WEIGHT;
}

export type TourState = {
  lights: Record<RoomKey, boolean>;
  gate: boolean;
  curtains: boolean;
  time: TimeKey;
  autoCut: boolean;
};
