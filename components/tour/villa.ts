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
};

export const VIEWS: View[] = [
  {
    id: "arrival",
    n: "01",
    label: "Arrival",
    title: "It starts at the gate.",
    blurb:
      "Twenty-four metres of frontage. The garage knows the car, the path lights come up, and the house is already awake.",
    pos: [17, 7.6, 25],
    target: [0.8, 3.2, -2],
    cut: false,
  },
  {
    id: "house",
    n: "02",
    label: "The house",
    title: "Two storeys, one system.",
    blurb:
      "Ground floor for living, first floor for sleeping, a wraparound terrace between them. Everything below it is yours to switch.",
    pos: [21, 16.5, 22],
    target: [0.8, 2.4, -6],
    cut: true,
  },
  {
    id: "living",
    n: "03",
    label: "Living",
    title: "Light that follows the evening.",
    blurb:
      "Scenes, not switches. The living wing drops to 9% at dusk without anyone touching a wall.",
    pos: [-16, 6.5, 14],
    target: [-1, 2.2, -6],
    cut: true,
  },
  {
    id: "kitchen",
    n: "04",
    label: "Kitchen",
    title: "The busiest room, quietly managed.",
    blurb:
      "Task lighting over the counters, a hood that talks to the extractor, and a panel by the door.",
    pos: [19, 7.5, 10],
    target: [4.5, 2.0, -10],
    cut: true,
  },
  {
    id: "master",
    n: "05",
    label: "Master",
    title: "One button, and the day is over.",
    blurb:
      "Goodnight drops the shutters, kills the lights downstairs, arms the perimeter and sets the thermostat.",
    pos: [-18, 13.5, 12],
    target: [-2, 5.4, -8],
    cut: true,
  },
  {
    id: "plan",
    n: "06",
    label: "The plan",
    title: "Look at it the way we do.",
    blurb:
      "Walls go transparent so you can see the whole system at once — the drawing the electrician installs from.",
    pos: [1, 40, 14],
    target: [1, 1, -5],
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
