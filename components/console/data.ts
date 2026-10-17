/**
 * Data for the interactive smart-home console.
 *
 * Room coordinates are percentages of public/images/smartnest-villa.jpg so
 * the light pools stay locked to the architecture at any width. They are
 * the same numbers the KNX demo uses — one source of truth for where each
 * room is on that photograph.
 */

export type DeviceId =
  | "lights"
  | "climate"
  | "curtains"
  | "security"
  | "cameras"
  | "ev"
  | "intercom";

export type RoomId =
  | "master"
  | "bedroom2"
  | "living"
  | "dining"
  | "kitchen"
  | "garden"
  | "entrance";

export interface Room {
  id: RoomId;
  label: string;
  /** Light footprint centre, as a % of the image. */
  lx: number;
  ly: number;
  lw: number;
  lh: number;
}

export const ROOMS: Room[] = [
  { id: "master", label: "Master", lx: 24, ly: 30, lw: 26, lh: 24 },
  { id: "bedroom2", label: "Bedroom 2", lx: 67, ly: 32, lw: 24, lh: 24 },
  { id: "living", label: "Living", lx: 44, ly: 53, lw: 26, lh: 22 },
  { id: "dining", label: "Dining", lx: 62, ly: 56, lw: 22, lh: 20 },
  { id: "kitchen", label: "Kitchen", lx: 33, ly: 40, lw: 22, lh: 18 },
  { id: "garden", label: "Garden", lx: 24, ly: 78, lw: 34, lh: 26 },
  { id: "entrance", label: "Entrance", lx: 55, ly: 76, lw: 22, lh: 20 },
];

export interface Device {
  id: DeviceId;
  label: string;
  /** Short readout shown on the rail. */
  hint: string;
}

export const DEVICES: Device[] = [
  { id: "lights", label: "Lights", hint: "Rooms" },
  { id: "climate", label: "Climate", hint: "23°" },
  { id: "curtains", label: "Curtains", hint: "Open" },
  { id: "security", label: "Security", hint: "Armed" },
  { id: "cameras", label: "Cameras", hint: "4 live" },
  { id: "ev", label: "EV charge", hint: "41%" },
  { id: "intercom", label: "Intercom", hint: "Idle" },
];

export type SceneId = "morning" | "away" | "movie" | "night";

export interface Scene {
  id: SceneId;
  label: string;
  rooms: RoomId[];
  brightness: number;
  curtains: number;
  temperature: number;
  security: boolean;
  ev: number;
}

export const SCENES: Scene[] = [
  {
    id: "morning",
    label: "Morning",
    rooms: ["kitchen", "dining", "living"],
    brightness: 82,
    curtains: 100,
    temperature: 24,
    security: false,
    ev: 41,
  },
  {
    id: "away",
    label: "Goodbye",
    rooms: [],
    brightness: 0,
    curtains: 0,
    temperature: 27,
    security: true,
    ev: 41,
  },
  {
    id: "movie",
    label: "Movie",
    rooms: ["living"],
    brightness: 16,
    curtains: 0,
    temperature: 22,
    security: false,
    ev: 41,
  },
  {
    id: "night",
    label: "Goodnight",
    rooms: ["master", "bedroom2"],
    brightness: 14,
    curtains: 0,
    temperature: 23,
    security: true,
    ev: 41,
  },
];

export const CAMERAS = [
  { id: "front", label: "Front gate", status: "Motion · 2m ago" },
  { id: "drive", label: "Driveway", status: "Clear" },
  { id: "garden", label: "Garden", status: "Clear" },
  { id: "rear", label: "Rear entry", status: "Clear" },
];
