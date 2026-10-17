export type RoomKey =
  | "living"
  | "dining"
  | "kitchen"
  | "guest"
  | "master"
  | "bedroom2";

/** Room metadata shown in the panel. */
export const ROOMS: { key: RoomKey; label: string; floor: string }[] = [
  { key: "living", label: "Living", floor: "Ground" },
  { key: "dining", label: "Dining", floor: "Ground" },
  { key: "kitchen", label: "Kitchen", floor: "Ground" },
  { key: "guest", label: "Guest room", floor: "Ground" },
  { key: "master", label: "Master", floor: "First" },
  { key: "bedroom2", label: "Bedroom 2", floor: "First" },
];

/**
 * Ceiling fixtures, read out of the exported model. Each point is in villa
 * metres — ground-floor ceiling at 2.98 m, first floor at 6.25 m.
 */
export const LIGHT_POINTS: { room: RoomKey; p: [number, number, number] }[] = [
  { room: "living", p: [2.0, 2.86, 0] },
  { room: "kitchen", p: [5.0, 2.86, 0] },
  { room: "dining", p: [-1.5, 2.86, 0] },
  { room: "guest", p: [-4.5, 2.86, 0] },
  { room: "bedroom2", p: [4.5, 6.13, 0] },
  { room: "master", p: [-3.5, 6.13, 0] },
];

export const SWITCH_ROOMS: Record<string, RoomKey> = {
  SWITCH_LIVING_MAIN: "living",
  SWITCH_DINING: "dining",
  SWITCH_KITCHEN: "kitchen",
  SWITCH_GUEST_BEDROOM: "guest",
  SWITCH_MASTER_BEDROOM: "master",
  SWITCH_BEDROOM_2: "bedroom2",
};

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
    sun: [24, 27, 21],
    sunColor: "#fff7ea",
    sunPower: 2.1,
    ambient: 0.26,
    hemi: 0.5,
    fill: 0.28,
    ground: "#6b6350",
    sconce: 0.12,
    exposure: 0.92,
  },
  dusk: {
    label: "Dusk",
    sky: "#20304c",
    sky2: "#b8764e",
    sun: [27, 8.5, 17],
    sunColor: "#ffa869",
    sunPower: 2.4,
    ambient: 0.22,
    hemi: 0.34,
    fill: 0.34,
    ground: "#33291c",
    sconce: 3.4,
    exposure: 1.12,
  },
  night: {
    label: "Night",
    sky: "#05080f",
    sky2: "#111c2e",
    sun: [-14, 20, 17],
    sunColor: "#9dbdff",
    sunPower: 0.9,
    ambient: 0.16,
    hemi: 0.2,
    fill: 0.28,
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
};

export const VIEWS: View[] = [
  {
    id: "arrival",
    n: "01",
    label: "Arrival",
    title: "It starts at the gate.",
    blurb:
      "The gate knows the car. It opens before you reach for a remote — and closes behind you.",
    pos: [11.5, 8.4, 27],
    target: [-0.6, 3.4, 4],
    cut: false,
  },
  {
    id: "hero",
    n: "02",
    label: "The house",
    title: "Every room, on one keypad.",
    blurb:
      "Six rooms, one system. Drag to walk around it — everything you can see is controllable.",

    pos: [11.5, 15.5, 21],
    target: [0, 2.2, 0],
    cut: true,
  },
  {
    id: "living",
    n: "03",
    label: "Living",
    title: "Light that follows the evening.",
    blurb:
      "Scenes, not switches. The living room dims to 9% at dusk without anyone touching a wall.",
    pos: [11.5, 9.1, 10.2],
    target: [1.5, 1.4, 1.2],
    cut: true,
  },
  {
    id: "kitchen",
    n: "04",
    label: "Kitchen",
    title: "The busiest room, quietly managed.",
    blurb:
      "Task lighting over the counters, a hood that talks to the extractor, and a keypad by the door.",
    pos: [13.6, 9.1, 6.9],
    target: [3.6, 1.4, -2.1],
    cut: true,
  },
  {
    id: "master",
    n: "05",
    label: "Master",
    title: "One button, and the day is over.",
    blurb:
      "Goodnight drops the shutters, kills the lights downstairs, arms the perimeter and sets the thermostat.",
    pos: [6.7, 12.2, 7.4],
    target: [-3.3, 4.5, -1.6],
    cut: true,
  },
  {
    id: "plan",
    n: "06",
    label: "The plan",
    title: "Look at it the way we do.",
    blurb:
      "Walls go transparent so you can see the whole system at once. This is the drawing the electrician installs from.",
    pos: [0.5, 26, 13],
    target: [0, 1.2, -0.6],
    cut: true,
  },
];

export type TourState = {
  lights: Record<RoomKey, boolean>;
  gate: boolean;
  curtains: boolean;
  time: TimeKey;
  autoCut: boolean;
};
