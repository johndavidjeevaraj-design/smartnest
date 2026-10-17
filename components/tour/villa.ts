export type RoomKey =
  | "living"
  | "dining"
  | "kitchen"
  | "guest"
  | "master"
  | "bedroom2";

/** Automation zones — SmartNest lights the house by zone, not by bulb. */
export const ROOMS: { key: RoomKey; label: string; floor: string }[] = [
  { key: "living", label: "Living wing", floor: "Ground" },
  { key: "dining", label: "Dining", floor: "Ground" },
  { key: "kitchen", label: "Kitchen", floor: "Ground" },
  { key: "guest", label: "Garage", floor: "Ground" },
  { key: "master", label: "Master suite", floor: "First" },
  { key: "bedroom2", label: "East wing", floor: "First" },
];

/**
 * Zone anchors, in villa metres. The big villa is 17.2 × 24.7 m on plan with
 * the street at +z; these sit inside each zone so the light reads through the
 * glazing the way a real circuit would.
 */
export const LIGHT_POINTS: { room: RoomKey; p: [number, number, number] }[] = [
  { room: "living", p: [0.0, 2.6, -6.0] },
  { room: "dining", p: [-4.0, 2.6, -11.0] },
  { room: "kitchen", p: [4.5, 2.6, -11.0] },
  { room: "guest", p: [4.3, 2.4, 1.6] },
  { room: "master", p: [-2.0, 5.6, -9.0] },
  { room: "bedroom2", p: [4.0, 5.6, -6.0] },
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
    sun: [30, 9, 20],
    sunColor: "#ffa869",
    sunPower: 2.5,
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
      "Twenty-four metres of frontage on a 1,254 sq ft plot line. Keep scrolling — the house lets you in.",
    pos: [27, 10, 37],
    target: [0.8, 3.2, -2],
    cut: false,
    w: 1.4,
  },
  {
    id: "forecourt",
    n: "02",
    label: "Forecourt",
    title: "The gate knows the car.",
    blurb:
      "The driveway lights come up as you approach and the garage door lifts on its own.",
    pos: [11.5, 3.6, 21],
    target: [3.6, 2.2, 3],
    cut: false,
    w: 1.2,
  },
  {
    id: "threshold",
    n: "03",
    label: "Threshold",
    title: "No key. No remote.",
    blurb:
      "A KNX presence sensor sees you, and the house starts its arrival scene before you touch a switch.",
    pos: [4.6, 1.85, 11],
    target: [4.3, 1.75, 0],
    cut: false,
    w: 1.1,
  },
  {
    id: "garage",
    n: "04",
    label: "Garage",
    title: "You are inside the building.",
    blurb:
      "Scroll on and the camera walks the ground floor. The far wall is the back of the plot.",
    pos: [4.4, 1.75, 5.4],
    target: [2.6, 1.7, -5],
    cut: true,
    w: 1.0,
  },
  {
    id: "ground",
    n: "05",
    label: "Ground floor",
    title: "Living, dining, kitchen — one volume.",
    blurb:
      "The plan is open on purpose. Every circuit in here is addressable from one keypad by the door.",
    pos: [3.4, 1.75, -1],
    target: [-1.5, 1.8, -11],
    cut: true,
    w: 1.35,
  },
  {
    id: "back",
    n: "06",
    label: "Rear",
    title: "Fourteen windows, one bus.",
    blurb:
      "Every window has a contact sensor. Open one and the air conditioning in that zone drops out.",
    pos: [0.6, 1.75, -9],
    target: [4.5, 1.7, -15],
    cut: true,
    w: 1.2,
  },
  {
    id: "rise",
    n: "07",
    label: "Stair",
    title: "Up to the sleeping floor.",
    blurb:
      "Landing, master suite, east wing. Goodnight drops all of this at once from the keypad downstairs.",
    pos: [0.2, 5.0, -6],
    target: [-3.5, 4.6, -13],
    cut: true,
    w: 1.1,
  },
  {
    id: "master",
    n: "08",
    label: "Master",
    title: "One button, and the day is over.",
    blurb:
      "Shutters down, downstairs dark, perimeter armed, thermostat set. You never leave the bed.",
    pos: [-4.6, 4.85, -7],
    target: [-5.2, 4.4, -14.5],
    cut: true,
    w: 1.3,
  },
  {
    id: "section",
    n: "09",
    label: "Section",
    title: "Look at it the way we do.",
    blurb:
      "A clipping plane cuts the house in half. This is the drawing the electrician installs from.",
    pos: [13, 11, 12],
    target: [0.8, 2.4, -6],
    cut: true,
    w: 1.5,
  },
  {
    id: "return",
    n: "10",
    label: "Outside",
    title: "You have walked the whole house.",
    blurb: "",
    pos: [21, 13.5, 31],
    target: [0.8, 3, -4],
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
