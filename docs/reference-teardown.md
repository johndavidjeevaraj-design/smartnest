# How `3d-house-tour.inishchithava.workers.dev` actually works

A full teardown of the Aether Villa 01 walkthrough — stack, asset pipeline, and the
exact scroll math — plus what it means for SmartNest.

---

## 1. The stack, in one line

**Vite + three.js (raw, no React Three Fiber) + GLTFLoader + Lenis smooth scroll.**
No GSAP, no ScrollTrigger, no Framer Motion. One 703 KB bundle (`index-BJFk7r6s.js`),
one 16 KB stylesheet, and a single `<canvas id="scene">` stretched over the viewport.

Everything else is hand-rolled.

---

## 2. The asset pipeline

This is the part that separates it from a toy. It is a **pre-baked Blender pipeline**,
not a runtime-lighting scene.

```
house/manifest.json          14 KB   ← the whole scene described as data
house/house.glb.0            20 MB   ┐ model, split into 20 MB chunks
house/house.glb.1            15 MB   ┘ (Cloudflare Workers asset limit)
house/sky.hdr             13.98 MB   ← 4K HDRI world
house/lightmaps/walls.webp   302 KB  ← 4096px baked indirect light
house/lightmaps/furn.webp   1.28 MB  ← 4096px
house/lightmaps/floors.webp   71 KB  ← 2048px
house/lightmaps/ceil.webp    142 KB  ← 2048px
house/lightmaps/ext.webp     143 KB  ← 2048px
house/lightmaps/ground.webp   28 KB  ← 1024px
house/probes/*.hdr       ~12.8 MB    ← 9 reflection probes, one per room
─────────────────────────────────────
TOTAL                    ≈ 64 MB
```

**Key idea:** they never compute lighting at runtime. Blender bakes the sun, the
bounce light and the contact shadows into six lightmap atlases, one per surface
group. The browser just multiplies `map × lightmap`. That is why an indoor shot at
dusk looks like a photograph while the scene still runs at 60 fps on a laptop.

They also ship **nine HDR environment probes** — `living`, `dining`, `kitchen`,
`hall`, `bed1`, `bed2`, `bath`, `porch`, `garden` — and swap the `scene.environment`
as the camera crosses room boundaries. Correct reflections in every room without
screen-space reflections.

The manifest is the interesting part:

```json
{
  "lightmaps": { "walls": {"file":"lightmaps/walls.webp","res":4096}, ... },
  "probes":    [ {"name":"living","pos":[3,1.6,-2],"file":"probes/living.hdr"}, ... ],
  "colliders": [ [0,0,3.2,0.23], ... ],      // 242 axis-aligned boxes
  "walkable":  ["Forecourt","Floor_","Porch_Slab","Steps","Lawn",...],
  "rooms":     { "living":[0.23,0.23,5.54,10.97], "bed1":[...], ... },
  "spawn":     { "pos":[3.7,-6.3,0], "yaw":0 },
  "encoding":  "reinhard-gamma2.2",
  "coords":    "blender (x right, y back, z up); three = (x, z, -y)"
}
```

That `coords` line tells you how much of a blender→three port this was.

---

## 3. The scroll engine — the actual mechanism

This is the whole trick, decompiled. Strip the minification and it is ~30 lines.

### 3a. The camera is a list of keyframes with weights

```js
// each entry: p = camera position, l = look-at target, w = weight (segment length)
const VIEWS = [
  { p: [ … ], l: [ … ], w: 1.2 },   // 01 materialize
  { p: [ 7, 20, 14.5 ], l: [ 5.2, 5.6, 0 ], w: 1.2 },  // 02 arrival
  { p: [ -9, 6, 12 ],  l: [ 5.2, 5.4, 0 ], w: 1.2 },   // 03 living
  …
  { p: [ -6, -10.5, 5.8 ], l: [ 5, 3.8, 1 ], w: 1 }    // 07 yours
];
```

`w` is why some chapters take two scroll-flicks and others take half a one.
The chapter list is separate:

```js
const CHAPTERS = [
  { id:"materialize", at:0,  n:"01", name:"Materialize" },
  { id:"arrival",     at:3,  n:"02", name:"Arrival" },
  { id:"living",      at:6,  n:"03", name:"Living" },
  { id:"gather",      at:10, n:"04", name:"Gather" },
  { id:"retreat",     at:14, n:"05", name:"Retreat" },
  { id:"blueprint",   at:25, n:"06", name:"Blueprint" },
  { id:"yours",       at:31, n:"07", name:"Yours" }
];
```

`at` is a position on the same weight axis — which is how the rail highlights
"05 Retreat" without any IntersectionObserver.

### 3b. Page height is generated from the weights

```js
const Tn = [0];
for (let i = 0; i < N-1; i++) Tn.push(Tn[i] + (VIEWS[i].w ?? 1));
const total = Tn[N-1];

scrollSpace.style.height = `${total * 100 + 100}vh`;
```

With weights summing to ~32, the page is **3,300 vh tall**. You are not scrolling a
document — you are scrubbing a timeline that happens to be 33 screens long.

### 3c. Scroll position → float index

```js
function index() {
  const t     = clamp(scrollY / maxScroll, 0, 1) * total;
  let seg = 0;
  while (seg < N - 2 && Tn[seg+1] <= t) seg++;
  return clamp(seg + (t - Tn[seg]) / (Tn[seg+1] - Tn[seg]), 0, N - 1);
}
```

Returns `0 … N-1`, continuously — e.g. `4.37` means "37% through the Retreat
chapter". The inverse function maps an index back to a scroll pixel, which is what
the chapter rail uses when you click it.

### 3d. Two Catmull-Rom curves, not a lerp

```js
const posCurve = new CatmullRomCurve3(VIEWS.map(v => v.p), false, "centripetal", 0.5);
const tgtCurve = new CatmullRomCurve3(VIEWS.map(v => v.l), false, "centripetal", 0.5);

function frame(i, time, outPos, outTgt) {
  const s = clamp(i / (N - 1), 0, 1);
  posCurve.getPoint(s, outPos);
  tgtCurve.getPoint(s, outTgt);
  // handheld sway, strongest at the start and the end
  const r = Math.sin(time*0.11) * 0.45 * (1 - smoothstep(i, 0, 1.1))
          + Math.sin(time*0.09) * 0.16 * smoothstep(i, N-1.6, N-1);
  if (r) outPos.sub(pivot).applyAxisAngle(UP, r).add(pivot);
}
```

**Two independent curves** — one for where the camera *is*, one for what it *looks
at*. That decoupling is why the camera can slide sideways down a corridor while
still staring at the kitchen island: the two curves are doing different things.
`centripetal` Catmull-Rom is chosen because the uniform variant overshoots on
sharp turns and would put the camera through a wall.

The sway term is a sine on elapsed time, faded in at the start and end — camera
drift that sells "handheld" without a visible loop.

### 3e. Smoothing comes from Lenis, not from the camera

```js
const lenis = new Lenis({ lerp: 0.08, smoothWheel: true, wheelMultiplier: 0.85, touchMultiplier: 1.3 });
```

Lenis intercepts the wheel, drives `window.scrollTo` itself with inertia, and the
rAF loop reads the interpolated `scrollY`. So the camera faithfully follows scroll
and the *scroll itself* is the easing. Under `prefers-reduced-motion`, `lerp` goes
to `1` — instant, no smoothing.

### 3f. Everything else is keyed to the same axis

```js
const RANGES = {
  reveal:    [0.15, 1.35, 2.5],   // blueprint fades into the finished house
  cutDown:   [24.15, 25.15],      // roof starts slicing away
  cutLow:    [25.5, 27],          // section drops to waist height
  blueprint: [25.4, 26.6],        // drawing mode crossfade
  rebuild:   [30, 31]             // walls come back
};
```

The section cut is a **clipping plane**, not opacity:

```js
const plane = new Plane(new Vector3(0, -1, 0), 1000);
renderer.clippingPlanes = [plane];
```

Scroll moves the plane's `constant` down through the building. That is why the
cutaway has crisp edges and correct interiors — it is a real plane intersect, the
same technique used by architectural apps.

---

## 4. Rendering setup

```js
new WebGLRenderer({ canvas, antialias: false, powerPreference: "high-performance" });
renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
renderer.toneMappingExposure = 1.15;

const camera = new PerspectiveCamera(58, aspect, 0.05, 600);
camera.fov = w < h ? 74 : 58;     // wider lens in portrait, so rooms still fit
```

`antialias: false` because they run post-processing instead:

```js
composer = new EffectComposer(renderer, target);
composer.addPass(new RenderPass(scene, camera));
composer.addPass(new SSAOPass(scene, camera, 256, 276) + params(0.25, 0.55, 1.4));  // SSAO
composer.addPass(new OutputPass());
```

So: **no MSAA, SSAO for contact shadow, lightmaps for the big light, HDRI probes for
reflections.** That combination is why it looks like a render without costing like one.

---

## 5. Movement and collision

- **242 axis-aligned box colliders** in the manifest — a swept-AABB system, not a
  physics engine. Camera slides along walls instead of stopping dead.
- **8 walkable surface names** so the camera knows what is floor.
- **Room bounds** (`living`, `hall`, `bed1`, `bath`, `bed2`, `porch`) — used to
  drive the room label and to switch the HDRI probe at the right moment.
- **Spawn point + yaw** — the experience always opens from the same place.
- Drag = **look around** (yaw/pitch offset), *not* orbit. Scroll owns position.

---

## 6. Performance and UX decisions worth copying

| Decision | Why |
|---|---|
| Model chunked into 20 MB pieces | Cloudflare Worker per-asset cap |
| `pixelRatio` capped at 1.5 | Retina screens were the framerate killer |
| FOV 74 in portrait | Phones would otherwise crop every room |
| Generated page height | Scroll length = content length, automatically |
| Loader with real log lines | "Streaming geometry · 214 objects" — makes a 64 MB wait feel like work |
| Two entry buttons (sound / silent) | A forced autoplay would be blocked by every browser |
| Chapter rail = scroll link | One source of truth; no scroll-spy drift |
| Reduced-motion path | `lerp: 1`, duration `0`, no sway |

---

## 7. What this means for SmartNest

**What I can build now, in this project:** everything in sections 3, 4 and 6. The
scroll engine is ~120 lines with three.js already installed — keyframes, weighted
timeline, two Catmull-Rom curves, damped follow, clipping-plane cut, chapter rail
bound to scroll.

**What we cannot fake:** the interior quality in section 2. Their villa is a
Blender-authored, lightmap-baked, professionally furnished model with per-room HDR
probes. Our `smartnest-3bhk-villa.glb` is a 13.5 MB exterior with slabs and a
ceiling but **no furniture, no partitions and no baked lightmaps**. The camera can
travel inside it, but it will show an empty shell lit in real time.

**The honest fix, in order of cost:**

1. **Scroll engine on the current model** — exterior approach, through the garage,
   interior sweep, rise to first floor, cutaway, CTA. Doable now.
2. **Real-time interior lighting** — add area-ish lights per room so the empty
   shell reads as an intentional "before it's furnished" architectural study.
3. **A furnished GLB** — buy or commission one. Then adding lightmaps (Blender bake)
   is the step that gets us to the reference's fidelity.

Step 1 is what I'm implementing now.
