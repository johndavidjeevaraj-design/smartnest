"use client";

/**
 * react-three-fiber is built on mutation: every per-frame animation writes
 * straight onto objects that live outside React's tree (materials, lights,
 * matrices). The React Compiler's immutability rule cannot see that boundary,
 * so it is switched off for this file only — there is no React state here for
 * it to protect.
 */
/* eslint-disable react-hooks/immutability */

import { useEffect, useMemo, useRef } from "react";
import { useThree } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import { useFrame, type ThreeEvent } from "@react-three/fiber";
import * as THREE from "three";
import {
  LIGHT_POINTS,
  ROOMS,
  SWITCH_ROOMS,
  TIMES,
  type RoomKey,
  type TimeKey,
  type View,
} from "./villa";

const MODEL = "/models/smartnest-luxury-indian-villa.glb";

const ROOM_PREFIX: [string, RoomKey][] = [
  ["LIVING", "living"],
  ["DINING", "dining"],
  ["KITCHEN", "kitchen"],
  ["GUEST", "guest"],
  ["MASTER", "master"],
  ["BEDROOM", "bedroom2"],
];

type Rig = {
  scene: THREE.Object3D;
  lights: Record<RoomKey, THREE.PointLight[]>;
  fixtureMats: Record<RoomKey, THREE.MeshStandardMaterial[]>;
  ledMats: THREE.MeshStandardMaterial[];
  sconceMats: THREE.MeshStandardMaterial[];
  wallMats: THREE.MeshStandardMaterial[];
  gatePivot: THREE.Group | null;
  curtainGroups: { g: THREE.Group; dir: number }[];
};

const WARM = new THREE.Color("#ffb066");

function nearestRoom(p: THREE.Vector3): RoomKey {
  let best: RoomKey = "living";
  let d = Infinity;
  for (const lp of LIGHT_POINTS) {
    const dd = (lp.p[0] - p.x) ** 2 + (lp.p[1] - p.y) ** 2 + (lp.p[2] - p.z) ** 2;
    if (dd < d) {
      d = dd;
      best = lp.room;
    }
  }
  return best;
}

function buildRig(root: THREE.Object3D): Rig {
  const lights = {} as Record<RoomKey, THREE.PointLight[]>;
  const fixtureMats = {} as Record<RoomKey, THREE.MeshStandardMaterial[]>;
  for (const r of ROOMS) {
    lights[r.key] = [];
    fixtureMats[r.key] = [];
  }
  const ledMats: THREE.MeshStandardMaterial[] = [];
  const sconceMats: THREE.MeshStandardMaterial[] = [];
  const wallMats: THREE.MeshStandardMaterial[] = [];
  const gateSlats: THREE.Object3D[] = [];
  const curtains: THREE.Object3D[] = [];
  const tuned = new Set<string>();

  root.updateMatrixWorld(true);

  root.traverse((o) => {
    const name = o.name;

    // Drop the Blender punctual lights — they are far too hot for realtime.
    if ((o as THREE.Light).isLight) {
      o.visible = false;
      return;
    }

    const mesh = o as THREE.Mesh;
    if (mesh.isMesh) {
      mesh.castShadow = true;
      mesh.receiveShadow = true;

      if (name === "SMART_GATE_Panel") {
        mesh.visible = false;
        return;
      }

      const p = new THREE.Vector3();
      mesh.getWorldPosition(p);

      const mm = mesh.material as THREE.MeshStandardMaterial;

      // One pass over every material: this model's surfaces are matte, and a
      // low-roughness dielectric under a bright env map turns into a mirror at
      // grazing angles. Clamp them before anything is cloned.
      if (mm && !tuned.has(mm.uuid)) {
        tuned.add(mm.uuid);
        if ((mm as THREE.MeshStandardMaterial).isMeshStandardMaterial) {
          mm.roughness = Math.max(mm.roughness ?? 0.5, 0.58);
          mm.envMapIntensity = 0.38;
          if (mm.metalness > 0.25) mm.metalness = 0.25;
        }
      }

      if (mm?.name === "SN_Microcement") {
        mm.color.multiplyScalar(0.7);
        mm.roughness = 0.85;
      }
      if (mm?.name && /Landscape|Tropical|Ground/i.test(mm.name)) {
        const hsl = { h: 0, s: 0, l: 0 };
        mm.color.getHSL(hsl);
        mm.color.setHSL(hsl.h, hsl.s * 0.62, hsl.l * 0.86);
      }
      if (mm?.name === "SN_Charcoal_Metal") {
        mm.color.multiplyScalar(1.35);
        mm.needsUpdate = true;
      }

      if (name.startsWith("LIGHT_FIXTURE")) {
        const mat = (mesh.material as THREE.MeshStandardMaterial).clone();
        mat.emissive = WARM.clone();
        mat.emissiveIntensity = 0.02;
        mesh.material = mat;
        fixtureMats[nearestRoom(p)].push(mat);
      } else if (name.startsWith("SWITCH_") && name.endsWith("_LED")) {
        const mat = (mesh.material as THREE.MeshStandardMaterial).clone();
        mat.emissive = new THREE.Color("#33f2ae");
        mat.emissiveIntensity = 0.2;
        mat.toneMapped = false;
        mesh.material = mat;
        ledMats.push(mat);
      } else if (name.startsWith("EXTERIOR_SCONCE_GLOW")) {
        const mat = (mesh.material as THREE.MeshStandardMaterial).clone();
        mat.emissive = WARM.clone();
        mat.emissiveIntensity = 0.1;
        mesh.material = mat;
        sconceMats.push(mat);
      } else if (/^(GF|FF)_(Wall|Front|Partition)|^GLAZING_/.test(name)) {
        const mat = (mesh.material as THREE.MeshStandardMaterial).clone();
        mat.transparent = true;
        mesh.material = mat;
        wallMats.push(mat);
      }
    }

    // clickable room surfaces
    for (const [prefix, room] of ROOM_PREFIX) {
      if (name.startsWith(prefix)) o.userData.room = room;
    }
    if (name in SWITCH_ROOMS) o.userData.room = SWITCH_ROOMS[name];

    if (name.startsWith("GATE_Slat")) gateSlats.push(o);
    if (name.startsWith("CURTAIN_LIVING")) curtains.push(o);
  });

  // ── gate: one hinge at the left post ──────────────────────────────────
  let gatePivot: THREE.Group | null = null;
  if (gateSlats.length) {
    gatePivot = new THREE.Group();
    gatePivot.position.set(-4.8, 0, 12);
    root.add(gatePivot);
    root.updateMatrixWorld(true);
    for (const s of gateSlats) gatePivot.attach(s);
  }

  // ── curtains: a group per panel so we can slide them apart ────────────
  const curtainGroups: { g: THREE.Group; dir: number }[] = [];
  curtains.forEach((c) => {
    const wp = new THREE.Vector3();
    c.getWorldPosition(wp);
    const g = new THREE.Group();
    g.position.set(0, 0, 0);
    root.add(g);
    root.updateMatrixWorld(true);
    g.attach(c);
    curtainGroups.push({ g, dir: wp.x < 2.6 ? -1 : 1 });
  });

  return { scene: root, lights, fixtureMats, ledMats, sconceMats, wallMats, gatePivot, curtainGroups };
}

/** Vertical gradient dome — cheap, no texture, no CDN. */
function SkyDome({ top, bottom }: { top: string; bottom: string }) {
  const mat = useMemo(() => {
    return new THREE.ShaderMaterial({
      side: THREE.BackSide,
      depthWrite: false,
      fog: false,
      uniforms: {
        uTop: { value: new THREE.Color(top) },
        uBottom: { value: new THREE.Color(bottom) },
      },
      vertexShader: `varying vec3 vP; void main(){ vP = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
      fragmentShader: `uniform vec3 uTop; uniform vec3 uBottom; varying vec3 vP;
        void main(){
          float h = clamp(normalize(vP).y * 0.5 + 0.5, 0.0, 1.0);
          h = pow(h, 0.85);
          gl_FragColor = vec4(mix(uBottom, uTop, h), 1.0);
        }`,
    });
  }, [top, bottom]);
  return (
    <mesh material={mat} scale={300} frustumCulled={false}>
      <sphereGeometry args={[1, 32, 16]} />
    </mesh>
  );
}

/** Bakes the gradient dome into a PMREM environment so materials get real reflections. */
function EnvDome({ top, bottom, intensity }: { top: string; bottom: string; intensity: number }) {
  const gl = useThree((s) => s.gl);
  const scene = useThree((s) => s.scene);

  useEffect(() => {
    const pmrem = new THREE.PMREMGenerator(gl);
    pmrem.compileEquirectangularShader();
    const s = new THREE.Scene();
    const mat = new THREE.ShaderMaterial({
      side: THREE.BackSide,
      uniforms: {
        uTop: { value: new THREE.Color(top) },
        uBottom: { value: new THREE.Color(bottom) },
      },
      vertexShader: `varying vec3 vP; void main(){ vP = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
      fragmentShader: `uniform vec3 uTop; uniform vec3 uBottom; varying vec3 vP;
        void main(){
          float h = clamp(normalize(vP).y * 0.5 + 0.5, 0.0, 1.0);
          gl_FragColor = vec4(mix(uBottom, uTop, pow(h, 0.85)), 1.0);
        }`,
    });
    const dome = new THREE.Mesh(new THREE.SphereGeometry(1, 32, 16), mat);
    s.add(dome);
    const sun = new THREE.Mesh(
      new THREE.SphereGeometry(0.18, 12, 8),
      new THREE.MeshBasicMaterial({ color: "#fff2df" }),
    );
    sun.position.set(0.6, 0.5, 0.6);
    s.add(sun);

    const rt = pmrem.fromScene(s, 0.02);
    scene.environment = rt.texture;
    if ("environmentIntensity" in scene) {
      (scene as THREE.Scene & { environmentIntensity: number }).environmentIntensity = intensity;
    }

    return () => {
      scene.environment = null;
      rt.dispose();
      pmrem.dispose();
      dome.geometry.dispose();
      mat.dispose();
      sun.geometry.dispose();
      (sun.material as THREE.Material).dispose();
    };
  }, [gl, scene, top, bottom, intensity]);

  return null;
}

function Exposure({ value }: { value: number }) {
  const gl = useThree((s) => s.gl);
  useEffect(() => {
    gl.toneMappingExposure = value;
  }, [gl, value]);
  return null;
}

function CameraRig({ view, cut }: { view: View; cut: boolean }) {
  const { camera, controls, size } = useThree() as unknown as {
    camera: THREE.PerspectiveCamera;
    size: { width: number; height: number };
    controls: { target: THREE.Vector3; enabled: boolean; update: () => void } | null;
  };
  // A portrait screen has far less horizontal field of view at the same fov,
  // so every framed view would crop. Back the camera off instead of changing
  // the lens, which keeps the perspective consistent across devices.
  const aspect = size.width / Math.max(1, size.height);
  const dolly = aspect < 0.8 ? 1.9 : aspect < 1.1 ? 1.5 : aspect < 1.45 ? 1.18 : 1;
  const flying = useRef(0);
  const pos = useRef(new THREE.Vector3(...view.pos));
  const tgt = useRef(new THREE.Vector3(...view.target));

  useEffect(() => {
    const t = new THREE.Vector3(...view.target);
    const p = new THREE.Vector3(...view.pos).sub(t).multiplyScalar(dolly).add(t);
    pos.current.copy(p);
    tgt.current.copy(t);
    flying.current = 1;
    if (controls) {
      controls.enabled = false;
    }
  }, [view, controls, dolly]);

  useFrame((_, dt) => {
    const k = 1 - Math.pow(0.0015, Math.min(dt, 0.05));
    camera.position.lerp(pos.current, k);
    if (controls) {
      controls.target.lerp(tgt.current, k);
      controls.update();
    }
    if (flying.current > 0) {
      flying.current -= dt;
      if (flying.current <= 0 && controls) controls.enabled = true;
    }
  });

  // unused, keeps `cut` in the dependency story honest for callers
  void cut;
  return null;
}

function Interior({
  rig,
  lights,
  gate,
  curtains,
  time,
  cut,
  onPick,
}: {
  rig: Rig;
  lights: Record<RoomKey, boolean>;
  gate: boolean;
  curtains: boolean;
  time: TimeKey;
  cut: boolean;
  onPick: (r: RoomKey) => void;
}) {
  const hover = useRef(false);

  useFrame((_, dt) => {
    const k = 1 - Math.pow(0.0008, Math.min(dt, 0.05));

    // room fixtures
    for (const r of ROOMS) {
      const on = lights[r.key];
      for (const m of rig.fixtureMats[r.key]) {
        m.emissiveIntensity = THREE.MathUtils.lerp(m.emissiveIntensity, on ? 3.4 : 0.02, k);
      }
      for (const l of rig.lights[r.key]) {
        l.intensity = THREE.MathUtils.lerp(l.intensity, on ? 22 : 0, k);
      }
    }

    // switch LEDs
    for (const m of rig.ledMats) {
      const anyOn = Object.values(lights).some(Boolean);
      m.emissiveIntensity = THREE.MathUtils.lerp(m.emissiveIntensity, anyOn ? 3.2 : 0.2, k);
    }

    // exterior sconces
    const sc = TIMES[time].sconce;
    for (const m of rig.sconceMats) {
      m.emissiveIntensity = THREE.MathUtils.lerp(m.emissiveIntensity, sc, k);
    }

    // walls ghost out for the section view
    const wallTarget = cut ? 0.05 : 1;
    for (const m of rig.wallMats) {
      m.opacity = THREE.MathUtils.lerp(m.opacity, wallTarget, k);
      m.depthWrite = m.opacity > 0.7;
    }

    // gate swing
    if (rig.gatePivot) {
      rig.gatePivot.rotation.y = THREE.MathUtils.lerp(
        rig.gatePivot.rotation.y,
        gate ? -Math.PI * 0.52 : 0,
        k,
      );
    }

    // curtain slide
    for (const { g, dir } of rig.curtainGroups) {
      g.position.x = THREE.MathUtils.lerp(g.position.x, curtains ? dir * 0.95 : 0, k);
    }
  });

  const onMove = (e: ThreeEvent<PointerEvent>) => {
    const r = e.object.userData.room as RoomKey | undefined;
    if (r && !hover.current) {
      hover.current = true;
      document.body.style.cursor = "pointer";
    } else if (!r && hover.current) {
      hover.current = false;
      document.body.style.cursor = "";
    }
  };

  return (
    <primitive
      object={rig.scene}
      onPointerMove={onMove}
      onPointerOut={() => {
        hover.current = false;
        document.body.style.cursor = "";
      }}
      onClick={(e: ThreeEvent<MouseEvent>) => {
        const r = e.object.userData.room as RoomKey | undefined;
        if (r) {
          e.stopPropagation();
          onPick(r);
        }
      }}
    />
  );
}

export default function VillaScene({
  lights,
  gate,
  curtains,
  time,
  cut,
  view,
  onPick,
}: {
  lights: Record<RoomKey, boolean>;
  gate: boolean;
  curtains: boolean;
  time: TimeKey;
  cut: boolean;
  view: View;
  onPick: (r: RoomKey) => void;
}) {
  const { scene } = useGLTF(MODEL);
  const rig = useMemo(() => buildRig(scene), [scene]);
  const t = TIMES[time];

  useEffect(() => {
    return () => {
      document.body.style.cursor = "";
    };
  }, []);

  return (
    <>
      <fog attach="fog" args={[t.sky2, 55, 190]} />

      <SkyDome top={t.sky} bottom={t.sky2} />
      <EnvDome top={t.sky} bottom={t.sky2} intensity={time === "day" ? 0.45 : 0.5} />
      <Exposure value={t.exposure} />

      <ambientLight intensity={t.ambient} color="#cfd9e8" />
      <hemisphereLight args={[t.sky2, t.ground, t.hemi]} />
      <directionalLight position={[-t.sun[0] * 0.75, t.sun[1] * 1.3, t.sun[2] * 0.85]} intensity={t.fill} color="#cfe0ff" />
      <directionalLight
        position={t.sun}
        intensity={t.sunPower}
        color={t.sunColor}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-26}
        shadow-camera-right={26}
        shadow-camera-top={26}
        shadow-camera-bottom={-26}
        shadow-camera-near={1}
        shadow-camera-far={90}
        shadow-bias={-0.0006}
      />

      {LIGHT_POINTS.map((lp, i) => (
        <pointLight
          key={i}
          position={lp.p}
          color={WARM}
          intensity={0}
          distance={9}
          decay={2}
          ref={(l) => {
            if (l && !rig.lights[lp.room].includes(l)) rig.lights[lp.room].push(l);
          }}
        />
      ))}

      <Interior
        rig={rig}
        lights={lights}
        gate={gate}
        curtains={curtains}
        time={time}
        cut={cut}
        onPick={onPick}
      />
      <CameraRig view={view} cut={cut} />
    </>
  );
}

useGLTF.preload(MODEL);
