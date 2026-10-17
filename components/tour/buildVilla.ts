import * as THREE from "three";
import type { RoomKey } from "./villa";

/**
 * A furnished 3BHK villa, built in code.
 *
 * There is no Blender in this pipeline, so the house is assembled from real
 * three-dimensional geometry at true architectural scale: 12 × 10 m footprint,
 * 3.0 m ceilings, 230 mm walls, two storeys around a stair void. Every room is
 * a closed volume with furniture, a ceiling light, a wall switch and — where it
 * makes sense — a curtain and a sensor.
 *
 * The important part for this site is not that it is pretty. It is that every
 * light, curtain, door and switch is a separate named object the KNX state can
 * drive, which is exactly what a walkthrough of an automation company has to
 * demonstrate.
 */

// ── dimensions ────────────────────────────────────────────────────────────
const WT = 0.23; // wall thickness
const H = 3.0; // floor-to-ceiling
const SLAB = 0.2; // slab thickness
const F2 = H + SLAB; // first-floor level (3.2)
const ROOF = F2 + H; // 6.2

// ── material library ──────────────────────────────────────────────────────
function M(color: string, roughness = 0.8, metalness = 0) {
  return new THREE.MeshStandardMaterial({ color: new THREE.Color(color), roughness, metalness });
}

const MAT = {
  plaster: M("#f1ede6", 0.92),
  plasterWarm: M("#e9e1d3", 0.9),
  marble: M("#e6e2da", 0.22, 0.04),
  marbleDark: M("#b9b4ac", 0.3, 0.04),
  teak: M("#8a5a34", 0.62),
  walnut: M("#5b3a22", 0.6),
  oak: M("#b98d5e", 0.68),
  charcoal: M("#2b2f34", 0.5, 0.35),
  black: M("#15171a", 0.55),
  brass: M("#b08438", 0.32, 0.9),
  fabric: M("#b8b0a4", 0.95),
  fabricDeep: M("#5d6b63", 0.95),
  fabricBed: M("#d8d0c2", 0.95),
  linen: M("#efe9e0", 0.95),
  granite: M("#33383d", 0.25, 0.1),
  steel: M("#9aa2ab", 0.35, 0.85),
  porcelain: M("#f7f7f5", 0.15),
  greenery: M("#3f6b35", 0.85),
  soil: M("#4a3a2a", 1),
  water: M("#2c93ad", 0.12, 0.2),
  rug: M("#8d8578", 0.98),
  glass: new THREE.MeshStandardMaterial({
    color: new THREE.Color("#bcd6dd"),
    transparent: true,
    opacity: 0.26,
    roughness: 0.05,
    metalness: 0.15,
    depthWrite: false,
  }),
  frame: M("#2f3438", 0.45, 0.55),
  concrete: M("#cfc7ba", 0.85),
  stone: M("#a9a196", 0.8),
  lawn: M("#4e7040", 0.98),
  paving: M("#8e8578", 0.9),
  hedge: M("#35552c", 0.95),
  bark: M("#4a3a2b", 0.95),
  canvas1: M("#71827b", 0.95),
  canvas2: M("#8a6f55", 0.95),
  canvas3: M("#4d5f6b", 0.95),
  screen: new THREE.MeshStandardMaterial({
    color: new THREE.Color("#141b22"),
    roughness: 0.24,
    metalness: 0.5,
  }),
};

const ACCENT = "#8fd14a";

// ── primitive helpers ─────────────────────────────────────────────────────
const BOX = new THREE.BoxGeometry(1, 1, 1);

function box(
  parent: THREE.Object3D,
  mat: THREE.Material,
  w: number,
  h: number,
  d: number,
  x: number,
  y: number,
  z: number,
  name = "",
) {
  const m = new THREE.Mesh(BOX, mat);
  m.scale.set(w, h, d);
  m.position.set(x, y, z);
  m.castShadow = true;
  m.receiveShadow = true;
  if (name) m.name = name;
  parent.add(m);
  return m;
}

/** A wall run between two points, with rectangular openings. */
function wall(
  parent: THREE.Object3D,
  mat: THREE.Material,
  ax: number,
  az: number,
  bx: number,
  bz: number,
  y0: number,
  height: number,
  openings: { from: number; to: number; bottom: number; top: number }[] = [],
) {
  const dx = bx - ax;
  const dz = bz - az;
  const len = Math.hypot(dx, dz);
  const horiz = Math.abs(dx) > Math.abs(dz);
  const g = new THREE.Group();
  g.position.set((ax + bx) / 2, 0, (az + bz) / 2);
  parent.add(g);

  const put = (u0: number, u1: number, v0: number, v1: number) => {
    const w = horiz ? u1 - u0 : WT;
    const d = horiz ? WT : u1 - u0;
    const h = v1 - v0;
    if (w <= 0.001 || h <= 0.001) return;
    box(g, mat, w, h, d, horiz ? (u0 + u1) / 2 - len / 2 : 0, y0 + (v0 + v1) / 2, horiz ? 0 : (u0 + u1) / 2 - len / 2);
  };

  // sort openings and fill the solid runs between them
  const ops = [...openings].sort((a, b) => a.from - b.from);
  let cursor = 0;
  for (const o of ops) {
    put(cursor, o.from, 0, height);
    // lintel above and sill below
    put(o.from, o.to, o.top, height);
    if (o.bottom > 0) put(o.from, o.to, 0, o.bottom);
    cursor = o.to;
  }
  put(cursor, len, 0, height);
  return g;
}

function glassPane(parent: THREE.Object3D, w: number, h: number, x: number, y: number, z: number, horiz: boolean) {
  const g = new THREE.Mesh(BOX, MAT.glass);
  g.scale.set(horiz ? w : 0.04, h, horiz ? 0.04 : w);
  g.position.set(x, y, z);
  g.name = "glass";
  parent.add(g);
}

/** A framed window: jambs, head, sill, mullions, glass. `rotY` = 0 on an
 *  x-running wall, PI/2 on a z-running wall. */
function windowUnit(
  parent: THREE.Object3D,
  cx: number,
  cz: number,
  w: number,
  sill: number,
  head: number,
  rotY: number,
  panes = 2,
) {
  const g = new THREE.Group();
  g.position.set(cx, 0, cz);
  g.rotation.y = rotY;
  parent.add(g);
  const h = head - sill;
  const F = 0.055;
  const D = WT + 0.07;
  const cy = sill + h / 2;

  box(g, MAT.frame, w, F, D, 0, sill + F / 2, 0, "frame");
  box(g, MAT.frame, w, F, D, 0, head - F / 2, 0, "frame");
  box(g, MAT.frame, F, h, D, -w / 2 + F / 2, cy, 0, "frame");
  box(g, MAT.frame, F, h, D, w / 2 - F / 2, cy, 0, "frame");
  for (let i = 1; i < panes; i++) {
    box(g, MAT.frame, F * 0.72, h, D, -w / 2 + (w * i) / panes, cy, 0, "frame");
  }
  box(g, MAT.glass, w - F * 2, h - F * 2, 0.024, 0, cy, 0, "glass");
  // projecting sill ledge
  box(g, MAT.concrete, w + 0.12, 0.055, D + 0.1, 0, sill - 0.028, 0, "sill");
}

type Glazing = { at: number; w: number; sill: number; head: number; panes?: number };

/** An outer wall run carrying framed windows: measures `at` from a→b. */
function facade(
  parent: THREE.Object3D,
  ax: number,
  az: number,
  bx: number,
  bz: number,
  y0: number,
  height: number,
  wins: Glazing[],
  extra: { from: number; to: number; bottom: number; top: number }[] = [],
  mat: THREE.Material = MAT.plaster,
) {
  const dx = bx - ax;
  const dz = bz - az;
  const len = Math.hypot(dx, dz);
  const ux = dx / len;
  const uz = dz / len;
  const horiz = Math.abs(dx) > Math.abs(dz);
  const rotY = horiz ? 0 : Math.PI / 2;

  const ops = [...extra];
  for (const w of wins) {
    ops.push({ from: w.at - w.w / 2, to: w.at + w.w / 2, bottom: w.sill - y0, top: w.head - y0 });
    windowUnit(parent, ax + ux * w.at, az + uz * w.at, w.w, w.sill, w.head, rotY, w.panes ?? 2);
  }
  wall(parent, mat, ax, az, bx, bz, y0, height, ops);
}

/** Framed artwork: a shadow-gap frame, a mat, a coloured canvas. */
function artwork(
  parent: THREE.Object3D,
  x: number,
  y: number,
  z: number,
  w: number,
  h: number,
  rot: number,
  mat: THREE.Material = MAT.canvas1,
) {
  const g = new THREE.Group();
  g.position.set(x, y, z);
  g.rotation.y = rot;
  parent.add(g);
  box(g, MAT.charcoal, w, h, 0.04, 0, 0, 0, "artwork");
  box(g, MAT.linen, w - 0.1, h - 0.1, 0.02, 0, 0, 0.026);
  box(g, mat, w - 0.24, h - 0.24, 0.02, 0, 0, 0.034);
  return g;
}

/** Low sideboard with legs and a couple of objects on top. */
function sideboard(parent: THREE.Object3D, x: number, z: number, rot: number, w = 1.9) {
  const g = new THREE.Group();
  g.position.set(x, 0, z);
  g.rotation.y = rot;
  parent.add(g);
  box(g, MAT.walnut, w, 0.62, 0.44, 0, 0.55, 0);
  box(g, MAT.charcoal, w + 0.06, 0.04, 0.5, 0, 0.24, 0);
  for (const sx of [-1, 1]) box(g, MAT.charcoal, 0.05, 0.24, 0.05, (sx * (w - 0.16)) / 2, 0.12, 0);
  for (let i = 1; i < 3; i++) box(g, MAT.charcoal, 0.02, 0.6, 0.02, -w / 2 + (w * i) / 3, 0.55, 0.22);
  box(g, MAT.brass, 0.14, 0.34, 0.14, -w / 2 + 0.34, 1.03, 0); // vase
  box(g, MAT.canvas2, 0.34, 0.06, 0.24, w / 2 - 0.42, 0.89, 0); // books
  return g;
}

// ── furniture ─────────────────────────────────────────────────────────────
function sofa(parent: THREE.Object3D, x: number, z: number, rot: number, seats = 3, mat = MAT.fabric) {
  const g = new THREE.Group();
  g.position.set(x, 0, z);
  g.rotation.y = rot;
  parent.add(g);
  const w = seats * 0.72;
  box(g, mat, w, 0.18, 0.95, 0, 0.24, 0); // seat base
  box(g, mat, w, 0.62, 0.18, 0, 0.55, -0.42); // back
  box(g, mat, 0.18, 0.46, 0.95, -w / 2 + 0.09, 0.4, 0); // arms
  box(g, mat, 0.18, 0.46, 0.95, w / 2 - 0.09, 0.4, 0);
  for (let i = 0; i < seats; i++) {
    box(g, MAT.linen, 0.64, 0.14, 0.82, -w / 2 + 0.36 + i * 0.72, 0.36, 0.02); // cushions
  }
  return g;
}

function coffeeTable(parent: THREE.Object3D, x: number, z: number) {
  const g = new THREE.Group();
  g.position.set(x, 0, z);
  parent.add(g);
  box(g, MAT.marbleDark, 1.1, 0.06, 0.62, 0, 0.42, 0);
  box(g, MAT.charcoal, 0.06, 0.42, 0.06, -0.45, 0.21, -0.22);
  box(g, MAT.charcoal, 0.06, 0.42, 0.06, 0.45, 0.21, -0.22);
  box(g, MAT.charcoal, 0.06, 0.42, 0.06, -0.45, 0.21, 0.22);
  box(g, MAT.charcoal, 0.06, 0.42, 0.06, 0.45, 0.21, 0.22);
  return g;
}

function bed(parent: THREE.Object3D, x: number, z: number, rot: number, king: boolean) {
  const g = new THREE.Group();
  g.position.set(x, 0, z);
  g.rotation.y = rot;
  parent.add(g);
  const w = king ? 1.9 : 1.55;
  const l = 2.05;
  box(g, MAT.walnut, w + 0.1, 0.28, l, 0, 0.14, 0); // base
  box(g, MAT.fabricBed, w, 0.22, l - 0.1, 0, 0.37, 0.02); // mattress
  box(g, MAT.linen, w - 0.08, 0.08, l - 0.5, 0, 0.5, 0.16); // duvet
  box(g, MAT.walnut, w + 0.3, 0.95, 0.11, 0, 0.62, -l / 2 - 0.02); // headboard
  box(g, MAT.linen, w / 2 - 0.16, 0.16, 0.42, -w / 4, 0.56, -l / 2 + 0.34); // pillows
  box(g, MAT.linen, w / 2 - 0.16, 0.16, 0.42, w / 4, 0.56, -l / 2 + 0.34);
  return g;
}

function wardrobe(parent: THREE.Object3D, x: number, z: number, rot: number, w = 1.8) {
  const g = new THREE.Group();
  g.position.set(x, 0, z);
  g.rotation.y = rot;
  parent.add(g);
  box(g, MAT.oak, w, 2.2, 0.6, 0, 1.1, 0);
  for (let i = 0; i < 3; i++) {
    box(g, MAT.charcoal, 0.02, 1.9, 0.02, -w / 2 + (i + 1) * (w / 3), 1.15, 0.31);
  }
  box(g, MAT.brass, 0.03, 0.22, 0.03, -0.25, 1.1, 0.32);
  box(g, MAT.brass, 0.03, 0.22, 0.03, 0.25, 1.1, 0.32);
  return g;
}

function nightstand(parent: THREE.Object3D, x: number, z: number) {
  const g = new THREE.Group();
  g.position.set(x, 0, z);
  parent.add(g);
  box(g, MAT.walnut, 0.45, 0.5, 0.4, 0, 0.25, 0);
  box(g, MAT.brass, 0.02, 0.02, 0.06, 0, 0.42, 0.2);
  return g;
}

function diningSet(parent: THREE.Object3D, x: number, z: number, chairs = 6) {
  const g = new THREE.Group();
  g.position.set(x, 0, z);
  parent.add(g);
  box(g, MAT.marbleDark, 1.85, 0.07, 0.95, 0, 0.74, 0); // top
  box(g, MAT.walnut, 0.12, 0.72, 0.12, -0.75, 0.37, -0.34);
  box(g, MAT.walnut, 0.12, 0.72, 0.12, 0.75, 0.37, -0.34);
  box(g, MAT.walnut, 0.12, 0.72, 0.12, -0.75, 0.37, 0.34);
  box(g, MAT.walnut, 0.12, 0.72, 0.12, 0.75, 0.37, 0.34);
  const seat = (cx: number, cz: number, flip: number) => {
    const c = new THREE.Group();
    c.position.set(cx, 0, cz);
    c.rotation.y = flip ? Math.PI : 0;
    g.add(c);
    box(c, MAT.walnut, 0.44, 0.06, 0.44, 0, 0.45, 0);
    box(c, MAT.fabricDeep, 0.42, 0.07, 0.42, 0, 0.49, 0);
    box(c, MAT.walnut, 0.44, 0.52, 0.06, 0, 0.72, -0.19);
    box(c, MAT.walnut, 0.05, 0.45, 0.05, -0.18, 0.22, -0.18);
    box(c, MAT.walnut, 0.05, 0.45, 0.05, 0.18, 0.22, -0.18);
    box(c, MAT.walnut, 0.05, 0.45, 0.05, -0.18, 0.22, 0.18);
    box(c, MAT.walnut, 0.05, 0.45, 0.05, 0.18, 0.22, 0.18);
  };
  for (let i = 0; i < Math.min(chairs, 6); i++) {
    if (i < 3) seat(-0.6 + i * 0.6, 0.72, 0);
    else seat(-0.6 + (i - 3) * 0.6, -0.72, 1);
  }
  return g;
}

function kitchenRun(parent: THREE.Object3D, x: number, z: number, w: number, d: number, along: "x" | "z") {
  const g = new THREE.Group();
  g.position.set(x, 0, z);
  parent.add(g);
  const W = along === "x" ? w : d;
  const D = along === "x" ? d : w;
  box(g, MAT.granite, W, 0.06, D, 0, 0.88, 0); // counter
  box(g, MAT.oak, W - 0.06, 0.8, D - 0.06, 0, 0.44, 0); // carcass
  // upper cabinets
  box(g, MAT.oak, W - 0.2, 0.7, 0.34, 0, 2.05, -D / 2 + 0.2);
  // sink
  box(g, MAT.steel, 0.5, 0.04, 0.36, -W * 0.22, 0.9, 0);
  // hob
  box(g, MAT.black, 0.55, 0.03, 0.42, W * 0.2, 0.91, 0);
  return g;
}

function island(parent: THREE.Object3D, x: number, z: number) {
  const g = new THREE.Group();
  g.position.set(x, 0, z);
  parent.add(g);
  box(g, MAT.marbleDark, 1.9, 0.07, 0.95, 0, 0.92, 0);
  box(g, MAT.charcoal, 1.7, 0.86, 0.8, 0, 0.45, 0);
  box(g, MAT.brass, 1.7, 0.03, 0.8, 0, 0.02, 0);
  return g;
}

function fridge(parent: THREE.Object3D, x: number, z: number, rot: number) {
  const g = new THREE.Group();
  g.position.set(x, 0, z);
  g.rotation.y = rot;
  parent.add(g);
  box(g, MAT.steel, 0.72, 1.85, 0.66, 0, 0.93, 0);
  box(g, MAT.black, 0.02, 1.6, 0.02, 0, 1.0, 0.34);
  return g;
}

function tvWall(parent: THREE.Object3D, x: number, z: number, rot: number) {
  const g = new THREE.Group();
  g.position.set(x, 0, z);
  g.rotation.y = rot;
  parent.add(g);
  box(g, MAT.walnut, 2.4, 2.4, 0.06, 0, 1.6, -0.14); // panelling
  box(g, MAT.screen, 1.62, 0.92, 0.05, 0, 1.62, 0.02); // panel
  box(g, MAT.charcoal, 1.86, 0.42, 0.42, 0, 0.21, 0.06); // console
  box(g, MAT.brass, 0.02, 0.9, 0.02, -0.82, 1.62, 0.06);
  return g;
}

function bathSuite(parent: THREE.Object3D, x: number, z: number, rot: number) {
  const g = new THREE.Group();
  g.position.set(x, 0, z);
  g.rotation.y = rot;
  parent.add(g);
  // WC
  box(g, MAT.porcelain, 0.38, 0.42, 0.62, -0.6, 0.21, 0.1);
  box(g, MAT.porcelain, 0.38, 0.5, 0.18, -0.6, 0.62, -0.14);
  // basin + counter
  box(g, MAT.marbleDark, 1.2, 0.08, 0.48, 0.45, 0.82, -0.2);
  box(g, MAT.porcelain, 0.44, 0.14, 0.32, 0.45, 0.9, -0.2);
  box(g, MAT.glass, 0.9, 0.8, 0.03, 0.45, 1.5, -0.42); // mirror
  // shower
  box(g, MAT.glass, 0.9, 1.9, 0.03, 0.45, 0.95, 0.62);
  box(g, MAT.steel, 0.08, 0.02, 0.08, 0.45, 2.2, 0.3);
  return g;
}

function plant(parent: THREE.Object3D, x: number, z: number, s = 1) {
  const g = new THREE.Group();
  g.position.set(x, 0, z);
  g.scale.setScalar(s);
  parent.add(g);
  box(g, MAT.soil, 0.34, 0.32, 0.34, 0, 0.16, 0);
  const leaves = new THREE.Mesh(new THREE.IcosahedronGeometry(0.36, 0), MAT.greenery);
  leaves.position.set(0, 0.72, 0);
  leaves.castShadow = true;
  g.add(leaves);
  const leaves2 = new THREE.Mesh(new THREE.IcosahedronGeometry(0.26, 0), MAT.greenery);
  leaves2.position.set(0.12, 0.98, 0.08);
  g.add(leaves2);
  return g;
}

function rug(parent: THREE.Object3D, x: number, z: number, w: number, d: number) {
  const m = new THREE.Mesh(BOX, MAT.rug);
  m.scale.set(w, 0.012, d);
  m.position.set(x, 0.008, z);
  m.receiveShadow = true;
  parent.add(m);
  return m;
}

function pendant(parent: THREE.Object3D, x: number, y: number, z: number, drop = 0.9) {
  const g = new THREE.Group();
  g.position.set(x, 0, z);
  parent.add(g);
  box(g, MAT.charcoal, 0.02, drop, 0.02, 0, y - drop / 2, 0);
  const shade = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.19, 0.2, 16), MAT.brass);
  shade.position.set(0, y - drop - 0.08, 0);
  shade.castShadow = true;
  g.add(shade);
  return g;
}

function floorLamp(parent: THREE.Object3D, x: number, z: number) {
  const g = new THREE.Group();
  g.position.set(x, 0, z);
  parent.add(g);
  box(g, MAT.charcoal, 0.3, 0.03, 0.3, 0, 0.015, 0);
  box(g, MAT.brass, 0.035, 1.5, 0.035, 0, 0.75, 0);
  const shade = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.2, 0.26, 14), MAT.linen);
  shade.position.set(0, 1.55, 0);
  g.add(shade);
  return g;
}

// ── the build ─────────────────────────────────────────────────────────────
export type RoomRefs = {
  fixtures: THREE.MeshStandardMaterial[];
  lights: THREE.PointLight[];
  leds: THREE.MeshStandardMaterial[];
};

export type VillaBuild = {
  root: THREE.Group;
  rooms: Record<RoomKey, RoomRefs>;
  curtains: { g: THREE.Group; closed: number; open: number; axis: "x" | "z" }[];
  wallMats: THREE.MeshStandardMaterial[];
  doorPivot: THREE.Group | null;
  glassMats: THREE.MeshStandardMaterial[];
};

export function buildVilla(): VillaBuild {
  const root = new THREE.Group();
  root.name = "villa";

  const rooms = {} as Record<RoomKey, RoomRefs>;
  const keys: RoomKey[] = ["living", "dining", "kitchen", "foyer", "bath", "master", "bed2", "bed3", "landing"];
  for (const k of keys) rooms[k] = { fixtures: [], lights: [], leds: [] };

  const curtains: VillaBuild["curtains"] = [];
  const wallMats = [MAT.plaster, MAT.plasterWarm];
  const glassMats = [MAT.glass];
  let doorPivot: THREE.Group | null = null;

  // A ceiling light: emissive disc + a real point light. Named so the rig can
  // find it, and returned by room.
  const ceilingLight = (room: RoomKey, x: number, y: number, z: number, r = 0.22) => {
    const mat = new THREE.MeshStandardMaterial({
      color: new THREE.Color("#fff2d8"),
      emissive: new THREE.Color("#ffb066"),
      emissiveIntensity: 0.02,
      roughness: 0.5,
    });
    const disc = new THREE.Mesh(new THREE.CylinderGeometry(r, r * 0.92, 0.05, 18), mat);
    disc.position.set(x, y - 0.03, z);
    disc.name = `LIGHT_FIXTURE_${room}`;
    root.add(disc);
    rooms[room].fixtures.push(mat);

    const trim = new THREE.Mesh(new THREE.TorusGeometry(r * 1.02, 0.02, 6, 20), MAT.brass);
    trim.rotation.x = Math.PI / 2;
    trim.position.set(x, y - 0.05, z);
    root.add(trim);

    // hung well below the ceiling: a point light 35cm under a slab burns a
    // square hotspot into the plaster at any intensity worth having
    const l = new THREE.PointLight(new THREE.Color("#ffb066"), 0, 10, 2);
    l.position.set(x, y - 1.15, z);
    l.name = `LIGHT_POINT_${room}`;
    root.add(l);
    rooms[room].lights.push(l);
    return l;
  };

  // A KNX wall switch: plate, rocker, status LED.
  const wallSwitch = (room: RoomKey, x: number, y: number, z: number, rotY: number) => {
    const g = new THREE.Group();
    g.position.set(x, y, z);
    g.rotation.y = rotY;
    root.add(g);
    box(g, MAT.linen, 0.09, 0.16, 0.014, 0, 0, 0);
    box(g, MAT.brass, 0.07, 0.13, 0.012, 0, 0, 0.01);
    const ledMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(ACCENT),
      emissive: new THREE.Color(ACCENT),
      emissiveIntensity: 0.15,
      toneMapped: false,
    });
    const led = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.008, 0.006), ledMat);
    led.position.set(0, 0.055, 0.02);
    g.add(led);
    rooms[room].leds.push(ledMat);
  };

  // A motorised curtain: two panels that slide apart.
  /**
   * Two sliding panels on a track. `floorY` is the floor they hang above —
   * passing it is the whole difference between curtains in a bedroom and
   * curtains in the basement.
   */
  const curtainPair = (x: number, z: number, width: number, rotY: number, floorY = 0) => {
    const trackY = floorY + 2.83;
    for (const side of [-1, 1]) {
      const g = new THREE.Group();
      const along = side * width * 0.25;
      g.position.set(x + (rotY ? 0 : along), floorY + 1.55, z + (rotY ? along : 0));
      root.add(g);
      const panel = box(g, MAT.linen, rotY ? 0.05 : width * 0.5, 2.5, rotY ? width * 0.5 : 0.05, 0, 0, 0);
      panel.name = "curtain";
      // closed = meet in the middle; open = gathered at each side
      curtains.push({
        g,
        closed: side * width * 0.19,
        open: side * width * 0.40,
        axis: rotY ? "z" : "x",
      });
    }
    // track
    box(root, MAT.charcoal, rotY ? 0.06 : width, 0.05, rotY ? width : 0.06, x, trackY, z);
  };

  // ══ GROUND FLOOR ═══════════════════════════════════════════════════════
  // slabs
  box(root, MAT.marble, 12, 0.02, 10, 0, 0, 0, "slab-ground");
  box(root, MAT.marble, 12, SLAB, 10, 0, H + SLAB / 2, 0, "slab-first");

  // outer walls — every facade carries framed windows
  facade(root, -6, -5, 6, -5, 0, H, [
    { at: 3.4, w: 2.6, sill: 0.5, head: 2.15 }, // kitchen back
    { at: 8.9, w: 2.2, sill: 0.5, head: 2.15 }, // dining back
  ]);
  facade(root, -6, -5, -6, 5, 0, H, [
    { at: 2.4, w: 2.6, sill: 0.5, head: 2.15 }, // kitchen side
    { at: 7.4, w: 2.4, sill: 0.5, head: 2.15 }, // living side
  ]);
  facade(root, 6, -5, 6, 5, 0, H, [
    { at: 3.0, w: 1.6, sill: 0.9, head: 2.15, panes: 1 }, // store side
  ]);
  facade(
    root,
    -6,
    5,
    6,
    5,
    0,
    H,
    [
      { at: 5.7, w: 3.4, sill: 0.4, head: 2.25, panes: 3 }, // living front
      { at: 10.7, w: 1.2, sill: 0.9, head: 2.15, panes: 1 }, // stair light
    ],
    [{ from: 7.6, to: 9.4, bottom: 0, top: 2.35 }],
  ); // front + door

  // inner walls, ground
  wall(root, MAT.plasterWarm, -6, -0.4, 6, -0.4, 0, H, [
    { from: 5.0, to: 6.2, bottom: 0, top: 2.2 },
    { from: 8.0, to: 9.2, bottom: 0, top: 2.2 },
  ]);
  wall(root, MAT.plasterWarm, 1.6, -0.4, 1.6, 5, 0, H, [{ from: 3.4, to: 4.3, bottom: 0, top: 2.2 }]);
  wall(root, MAT.plasterWarm, 3.4, -0.4, 3.4, 5, 0, H, [{ from: 3.2, to: 4.1, bottom: 0, top: 2.2 }]);
  wall(root, MAT.plasterWarm, -1.4, -5, -1.4, -0.4, 0, H, [{ from: 3.0, to: 3.9, bottom: 0, top: 2.2 }]);
  wall(root, MAT.plasterWarm, 2.6, -5, 2.6, -0.4, 0, H);
  wall(root, MAT.plasterWarm, 4.4, -5, 4.4, -0.4, 0, H, [{ from: 2.4, to: 3.2, bottom: 0, top: 2.2 }]);

  // glazed sidelight filling the rest of the entrance opening
  box(root, MAT.frame, 0.06, 2.3, WT + 0.06, 2.55, 1.15, 5, "frame");
  box(root, MAT.frame, 0.06, 2.3, WT + 0.06, 3.37, 1.15, 5, "frame");
  box(root, MAT.frame, 0.86, 0.06, WT + 0.06, 2.96, 2.28, 5, "frame");
  box(root, MAT.frame, 0.86, 0.06, WT + 0.06, 2.96, 0.03, 5, "frame");
  box(root, MAT.glass, 0.78, 2.18, 0.024, 2.96, 1.15, 5, "glass");

  // entrance door (hinged)
  doorPivot = new THREE.Group();
  doorPivot.position.set(1.6, 0, 4.97);
  root.add(doorPivot);
  box(doorPivot, MAT.teak, 0.92, 2.3, 0.06, 0.46, 1.15, 0, "front-door");
  box(doorPivot, MAT.brass, 0.03, 0.28, 0.03, 0.8, 1.1, 0.06);

  // ── LIVING ROOM (x -6..1.6, z -0.4..5) ──
  // TV on the solid west wall, seating facing it, window kept clear.
  rug(root, -3.3, 2.0, 4.6, 3.2);
  tvWall(root, -5.79, 2.0, Math.PI / 2);
  sofa(root, -3.1, 2.0, -Math.PI / 2, 3);
  sofa(root, -1.5, 0.2, 0, 2);
  coffeeTable(root, -4.6, 2.0);
  floorLamp(root, -5.5, 4.3);
  plant(root, -5.3, 0.1, 1.1);
  plant(root, 1.0, 4.3, 0.85);
  artwork(root, -2.2, 2.15, -0.29, 1.7, 0.95, 0, MAT.canvas3);
  sideboard(root, -2.2, -0.14, 0, 1.9);
  ceilingLight("living", -2.2, H, 2.1);
  wallSwitch("living", 1.45, 1.3, 3.6, -Math.PI / 2);
  curtainPair(0.2, 4.85, 3.2, 0);

  // ── FOYER (x 1.6..3.4, z -0.4..5) ──
  box(root, MAT.walnut, 1.5, 0.85, 0.38, 2.5, 0.42, 4.4); // console
  box(root, MAT.glass, 1.0, 1.2, 0.03, 2.5, 2.0, 4.85); // mirror
  plant(root, 1.95, 0.2, 0.7);
  ceilingLight("foyer", 2.5, H, 2.4, 0.15);
  wallSwitch("foyer", 1.78, 1.3, 3.9, -Math.PI / 2);

  // ── STAIR (x 3.4..6, z -0.4..5) ──
  for (let i = 0; i < 14; i++) {
    const y = (i + 1) * (F2 / 14);
    box(root, MAT.marbleDark, 2.3, 0.18, 0.3, 4.7, y - 0.09, 4.4 - i * 0.3);
  }
  // handrail
  for (let i = 0; i < 14; i += 2) {
    const y = (i + 1) * (F2 / 14);
    box(root, MAT.charcoal, 0.04, 0.95, 0.04, 3.62, y + 0.45, 4.4 - i * 0.3);
  }
  box(root, MAT.charcoal, 0.06, 0.06, 4.3, 3.62, 2.4, 2.35).rotation.x = -0.42;
  ceilingLight("landing", 4.7, H, 2.0, 0.15);
  wallSwitch("landing", 3.55, 1.35, 3.4, -Math.PI / 2);

  // ── KITCHEN (x -6..-1.4, z -5..-0.4) ──
  kitchenRun(root, -5.4, -2.7, 1.0, 3.6, "z");
  kitchenRun(root, -3.4, -4.4, 3.4, 1.0, "x");
  island(root, -3.3, -2.2);
  fridge(root, -5.5, -0.9, 0);
  pendant(root, -3.3, H, -2.2, 0.75);
  ceilingLight("kitchen", -2.4, H, -4.2, 0.18);
  wallSwitch("kitchen", -1.55, 1.3, -1.2, -Math.PI / 2);

  // ── DINING (x -1.4..2.6, z -5..-0.4) ──
  diningSet(root, 0.6, -2.7, 6);
  pendant(root, 0.6, H, -2.7, 0.95);
  plant(root, 2.2, -4.5, 0.9);
  artwork(root, 2.48, 1.95, -2.7, 1.5, 0.85, -Math.PI / 2, MAT.canvas2);
  sideboard(root, 2.36, -2.7, -Math.PI / 2, 1.7);
  ceilingLight("dining", 0.6, H, -1.3, 0.16);
  wallSwitch("dining", 2.45, 1.3, -3.4, -Math.PI / 2);

  // ── COMMON BATH (x 2.6..4.4, z -5..-2.6) ──
  bathSuite(root, 3.5, -3.8, 0);
  wall(root, MAT.plasterWarm, 2.6, -2.6, 4.4, -2.6, 0, H, [{ from: 0.3, to: 1.1, bottom: 0, top: 2.1 }]);
  ceilingLight("bath", 3.5, H, -3.8, 0.12);
  wallSwitch("bath", 2.75, 1.3, -2.75, 0);

  // ── STORE (x 4.4..6, z -5..-0.4) ──
  box(root, MAT.oak, 1.2, 2.0, 0.5, 5.2, 1.0, -4.6);
  ceilingLight("foyer", 5.2, H, -2.6, 0.12);

  // ══ FIRST FLOOR ════════════════════════════════════════════════════════
  // ceiling for ground = underside of the first slab, already solid.
  // FF floor is the top of the slab at y = F2.

  // first-floor slabs — leave a stair void at x 3.4..6, z -0.4..2.6
  const slabAt = (x0: number, z0: number, x1: number, z1: number) =>
    box(root, MAT.marble, x1 - x0, 0.02, z1 - z0, (x0 + x1) / 2, F2 + 0.01, (z0 + z1) / 2, "slab-ff");
  slabAt(-6, -5, 3.4, 5);
  slabAt(3.4, -5, 6, -0.4);
  slabAt(3.4, 2.6, 6, 5);

  // FF outer walls
  facade(root, -6, -5, 6, -5, F2, H, [
    { at: 3.4, w: 2.6, sill: F2 + 0.85, head: F2 + 2.4 }, // bed2 back
    { at: 8.6, w: 2.4, sill: F2 + 0.85, head: F2 + 2.4 }, // bed2 back, second bay
  ]);
  facade(root, -6, -5, -6, 5, F2, H, [
    { at: 2.4, w: 2.0, sill: F2 + 0.85, head: F2 + 2.4 }, // master side
    { at: 7.6, w: 2.2, sill: F2 + 0.85, head: F2 + 2.4 }, // bed3 side
  ]);
  facade(root, 6, -5, 6, 5, F2, H, [
    { at: 2.4, w: 1.2, sill: F2 + 1.5, head: F2 + 2.4, panes: 1 }, // bath
    { at: 8.4, w: 1.8, sill: F2 + 0.9, head: F2 + 2.4, panes: 1 }, // balcony
  ]);
  facade(
    root,
    -6,
    5,
    6,
    5,
    F2,
    H,
    [{ at: 4.1, w: 2.8, sill: F2 + 0.85, head: F2 + 2.4 }, { at: 10.7, w: 1.4, sill: F2 + 0.85, head: F2 + 2.4, panes: 1 }],
    [{ from: 6.0, to: 8.2, bottom: 0, top: 2.35 }],
  );

  // FF inner walls
  wall(root, MAT.plasterWarm, -0.4, -5, -0.4, 5, F2, H, [{ from: 5.0, to: 5.9, bottom: 0, top: 2.2 }]);
  wall(root, MAT.plasterWarm, -6, 0.6, -0.4, 0.6, F2, H, [{ from: 2.4, to: 3.3, bottom: 0, top: 2.2 }]);
  wall(root, MAT.plasterWarm, -0.4, -0.6, 6, -0.6, F2, H, [{ from: 1.4, to: 2.4, bottom: 0, top: 2.2 }]);
  wall(root, MAT.plasterWarm, 2.2, -0.6, 2.2, 5, F2, H, [{ from: 2.4, to: 3.3, bottom: 0, top: 2.2 }]);
  wall(root, MAT.plasterWarm, 2.2, 2.0, 6, 2.0, F2, H, [{ from: 0.4, to: 1.2, bottom: 0, top: 2.1 }]);

  // Everything on the first floor lives in this group, so the furniture
  // factories can keep their y=0 origins and still land on the upper slab.
  const ff = new THREE.Group();
  ff.position.y = F2;
  root.add(ff);

  // ── MASTER (x -6..-0.4, z -5..0.6) ──
  bed(ff, -3.2, -2.4, 0, true);
  nightstand(ff, -4.55, -3.35);
  nightstand(ff, -1.85, -3.35);
  wardrobe(ff, -5.35, 0.0, Math.PI / 2, 2.0);
  rug(ff, -3.2, -1.2, 3.4, 2.4);
  plant(ff, -0.9, -4.5, 0.9);
  ceilingLight("master", -3.2, F2 + H, -2.4);
  wallSwitch("master", -0.55, F2 + 1.3, -1.1, -Math.PI / 2);
  curtainPair(-1.9, 4.82, 2.8, 0, F2);

  // ── BEDROOM 2 (x -0.4..6, z -5..-0.6) ──
  bed(ff, 3.6, -2.6, 0, false);
  nightstand(ff, 2.4, -3.5);
  nightstand(ff, 4.8, -3.5);
  wardrobe(ff, 5.4, -1.4, -Math.PI / 2, 1.8);
  box(ff, MAT.walnut, 1.5, 0.75, 0.6, 1.2, 0.38, -4.4); // study desk
  ceilingLight("bed2", 3.0, F2 + H, -2.8);
  wallSwitch("bed2", 2.35, F2 + 1.3, -0.75, 0);
  curtainPair(2.6, -4.82, 2.2, 0, F2);

  // ── BEDROOM 3 (x -6..-0.4, z 0.6..5) ──
  bed(ff, -3.0, 2.7, 0, false);
  nightstand(ff, -4.35, 1.8);
  wardrobe(ff, -5.5, 3.2, Math.PI / 2, 1.7);
  ceilingLight("bed3", -3.0, F2 + H, 2.7);
  wallSwitch("bed3", -0.55, F2 + 1.3, 3.9, -Math.PI / 2);
  curtainPair(-1.9, 4.82, 2.6, 0, F2);

  // ── LANDING (x -0.4..2.2, z -0.6..5) ──
  box(ff, MAT.walnut, 0.9, 0.8, 0.35, 1.6, 0.4, 4.3);
  ceilingLight("landing", 0.9, F2 + H, 2.0, 0.15);
  wallSwitch("landing", 2.05, F2 + 1.3, 3.6, -Math.PI / 2);

  // ── BATHS (x 2.2..6, z -0.6..5) ──
  bathSuite(ff, 3.2, 3.5, 0); // master bath zone
  bathSuite(ff, 3.2, 0.7, 0); // common bath
  ceilingLight("bath", 3.2, F2 + H, 3.5, 0.12);
  ceilingLight("bath", 3.2, F2 + H, 0.7, 0.12);

  // ── BALCONY (x 4.2..6, z 1.6..5.2) ──
  box(root, MAT.marbleDark, 2.2, 0.06, 3.2, 5.1, F2 + 0.03, 3.3, "balcony-deck");
  for (let i = 0; i < 9; i++) {
    box(root, MAT.charcoal, 0.04, 1.0, 0.04, 4.25 + i * 0.22, F2 + 0.5, 4.85);
  }
  box(root, MAT.charcoal, 2.0, 0.06, 0.06, 5.1, F2 + 1.0, 4.85);
  sofa(ff, 5.1, 3.6, Math.PI, 2, MAT.fabricDeep);
  plant(ff, 4.6, 2.2, 0.8);

  // ── roof ──
  // projecting cornice mid-way (reads as the slab edge from outside)
  box(root, MAT.concrete, 12.5, SLAB, 10.5, 0, H + SLAB / 2, 0, "cornice");
  box(root, MAT.plaster, 12.6, SLAB, 10.6, 0, ROOF + SLAB / 2, 0, "roof");
  box(root, MAT.concrete, 12.7, 0.16, 10.7, 0, ROOF + SLAB, 0, "roof-cap");
  // parapet
  const PW = 0.16;
  const PH = 0.95;
  for (const [x, z, w, d] of [
    [0, 5.22, 12.6, PW],
    [0, -5.22, 12.6, PW],
    [-6.22, 0, PW, 10.6],
    [6.22, 0, PW, 10.6],
  ]) {
    box(root, MAT.plaster, w, PH, d, x, ROOF + SLAB + PH / 2, z, "parapet");
  }
  // parapet coping
  for (const [x, z, w, d] of [
    [0, 5.22, 12.7, PW + 0.1],
    [0, -5.22, 12.7, PW + 0.1],
    [-6.22, 0, PW + 0.1, 10.7],
    [6.22, 0, PW + 0.1, 10.7],
  ]) {
    box(root, MAT.concrete, w, 0.06, d, x, ROOF + SLAB + PH + 0.03, z, "coping");
  }
  // rooftop services, so the parapet line is not a bare rectangle
  box(root, MAT.steel, 1.5, 0.8, 1.1, -3.2, ROOF + SLAB + 0.4, -1.4, "ac-unit");
  box(root, MAT.steel, 0.5, 1.3, 0.5, 2.6, ROOF + SLAB + 0.65, -3.2, "water-tank");

  // plinth — the building sits on something
  box(root, MAT.stone, 12.36, 0.36, 10.36, 0, 0.18, 0, "plinth");

  // ground / landscape
  box(root, M("#5c6b52", 1), 90, 0.06, 90, 0, -0.04, 0, "ground");
  // lawn panels either side of the drive
  box(root, MAT.lawn, 11, 0.05, 9, -5.5, 0.0, 10.6, "lawn-w");
  box(root, MAT.lawn, 14, 0.05, 9, 8.5, 0.0, 10.6, "lawn-e");
  // entrance walk: driveway → porch → door
  box(root, MAT.paving, 4.4, 0.05, 11.6, 2.6, 0.03, 11.2, "driveway");
  box(root, MAT.paving, 3.4, 0.05, 3.4, 2.5, 0.03, 6.4, "porch");
  box(root, MAT.stone, 2.0, 0.06, 1.6, 2.5, 0.04, 5.6, "door-step");

  // low boundary wall with piers, broken for the gate
  const by = 0.0;
  const bz = 19.4;
  box(root, MAT.stone, 12.6, 1.05, 0.3, -4.7, by + 0.52, bz, "boundary");
  box(root, MAT.stone, 9.4, 1.05, 0.3, 9.3, by + 0.52, bz, "boundary");
  for (const px of [-10.9, -6.9, -2.9, 1.05, 4.75, 8.55, 12.35, 16.15]) {
    box(root, MAT.concrete, 0.48, 1.4, 0.48, px, by + 0.7, bz, "pier");
  }
  // railings sitting on the wall
  for (const [cx, cw] of [
    [-4.7, 12.6],
    [9.3, 9.4],
  ]) {
    for (let i = 0; i < Math.round(cw / 0.42); i++) {
      box(root, MAT.charcoal, 0.035, 0.72, 0.035, cx - cw / 2 + 0.2 + i * 0.42, 1.42, bz, "rail");
    }
    box(root, MAT.charcoal, cw, 0.05, 0.05, cx, 1.78, bz, "rail");
  }
  // open gate leaves, swung inward
  for (const gx of [0.72, 5.08]) {
    box(root, MAT.charcoal, 0.06, 1.7, 1.9, gx, 0.86, bz - 0.95, "gate");
  }
  // hedge inside the boundary, either side of the drive
  for (let i = 0; i < 6; i++) {
    box(root, MAT.hedge, 1.9, 0.8, 0.8, -7.9 + i * 2.2, 0.4, 18.4, "hedge");
  }
  for (let i = 0; i < 6; i++) {
    box(root, MAT.hedge, 1.9, 0.8, 0.8, 6.4 + i * 2.2, 0.4, 18.4, "hedge");
  }
  // lamp posts along the drive
  for (const lz of [9.0, 14.0]) {
    box(root, MAT.charcoal, 0.08, 1.0, 0.08, 5.5, 0.5, lz, "post");
    box(root, MAT.brass, 0.22, 0.22, 0.22, 5.5, 1.06, lz, "lamp");
  }

  // planting around the house
  plant(root, -1.2, 6.4, 1.4);
  plant(root, 5.9, 6.4, 1.4);
  plant(root, -7.4, 1.5, 1.8);
  plant(root, -7.4, -3.2, 1.5);
  plant(root, 7.6, 1.0, 1.7);
  // a couple of trees for scale
  for (const [tx, tz, th] of [
    [-10.5, 8.5, 4.2],
    [12.0, 9.0, 5.0],
    [-11.0, -4.0, 4.6],
  ]) {
    box(root, MAT.bark, 0.34, th, 0.34, tx, th / 2, tz, "trunk");
    const crown = new THREE.Mesh(new THREE.SphereGeometry(1, 12, 10), MAT.hedge);
    crown.scale.set(1.9, 1.5, 1.9);
    crown.position.set(tx, th + 0.9, tz);
    crown.castShadow = true;
    crown.name = "crown";
    root.add(crown);
  }

  // Tag every mesh with the zone whose volume contains it, so clicking any
  // piece of furniture or wall switches that room's circuit.
  const zoneAt = (p: THREE.Vector3): RoomKey => {
    const gf = p.y < F2;
    const x = p.x;
    const z = p.z;
    if (gf) {
      if (z > -0.4 && x < 1.6) return "living";
      if (z > -0.4 && x < 3.4) return "foyer";
      if (z > -0.4) return "landing";
      if (x < -1.4) return "kitchen";
      if (x < 2.6) return "dining";
      return "bath";
    }
    if (x < -0.4) return z < 0.6 ? "master" : "bed3";
    if (z < -0.6) return "bed2";
    return "landing";
  };

  root.updateMatrixWorld(true);
  const wp = new THREE.Vector3();
  root.traverse((o) => {
    const m = o as THREE.Mesh;
    if (!m.isMesh) return;
    m.castShadow = true;
    m.receiveShadow = true;
    if (m === undefined) return;
    if (m.name.startsWith("LIGHT_") || m.name === "curtain" || m.name === "ground") return;
    m.getWorldPosition(wp);
    m.userData.room = zoneAt(wp);
  });

  return { root, rooms, curtains, wallMats, doorPivot, glassMats };
}
