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
import { useFrame, type ThreeEvent } from "@react-three/fiber";
import * as THREE from "three";
import { buildVilla, type VillaBuild } from "./buildVilla";
import { LIGHT_POINTS, ROOMS, TIMES, type RoomKey, type TimeKey, type View } from "./villa";

const WARM = new THREE.Color("#ffd0a4");

export type Journey = { i: number };

/** Vertical gradient dome — cheap, procedural, no texture download. */
function SkyDome({ top, bottom }: { top: string; bottom: string }) {
  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
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
          float t = normalize(vP).y;
          // tight horizon band: warm at eye level, deep overhead. A wide
          // blend turns every frame into muddy brown at dusk.
          float k = smoothstep(0.0, 0.44, t);
          vec3 c = mix(uBottom, uTop, pow(k, 0.85));
          c = mix(c, uBottom * 0.42, smoothstep(0.0, -0.4, t));
          gl_FragColor = vec4(c, 1.0);
          // custom shaders do not get the renderer's tone-map / colour-space
          // pass for free; without these the sky reads as muddy brown.
          #include <tonemapping_fragment>
          #include <colorspace_fragment>
        }`,
      }),
    [top, bottom],
  );
  return (
    <mesh material={mat} scale={300} frustumCulled={false}>
      <sphereGeometry args={[1, 32, 16]} />
    </mesh>
  );
}

/** Bakes the same gradient into a PMREM env so materials get real reflections. */
function EnvDome({ top, bottom, intensity }: { top: string; bottom: string; intensity: number }) {
  const gl = useThree((s) => s.gl);
  const scene = useThree((s) => s.scene);
  useEffect(() => {
    const pmrem = new THREE.PMREMGenerator(gl);
    const s = new THREE.Scene();
    const mat = new THREE.ShaderMaterial({
      side: THREE.BackSide,
      uniforms: { uTop: { value: new THREE.Color(top) }, uBottom: { value: new THREE.Color(bottom) } },
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

/** Scroll → two Catmull-Rom curves → camera. Drag adds a look offset. */
function ScrollRig({ scroll, views }: { scroll: { current: Journey }; views: View[] }) {
  const { camera, gl, size } = useThree();
  const posCurve = useMemo(
    () => new THREE.CatmullRomCurve3(views.map((v) => new THREE.Vector3(...v.pos)), false, "centripetal", 0.5),
    [views],
  );
  const tgtCurve = useMemo(
    () => new THREE.CatmullRomCurve3(views.map((v) => new THREE.Vector3(...v.target)), false, "centripetal", 0.5),
    [views],
  );

  const look = useRef({ yaw: 0, pitch: 0, drag: false, x: 0, y: 0 });

  useEffect(() => {
    const el = gl.domElement;
    const onDown = (e: PointerEvent) => {
      // Keep vertical touch gestures native so mobile users can scroll the
      // chapter journey; desktop pointer drags remain free-look controls.
      if (e.pointerType === "touch") return;
      look.current.drag = true;
      look.current.x = e.clientX;
      look.current.y = e.clientY;
      el.setPointerCapture?.(e.pointerId);
      el.style.cursor = "grabbing";
    };
    const onMove = (e: PointerEvent) => {
      if (!look.current.drag) return;
      const dx = e.clientX - look.current.x;
      const dy = e.clientY - look.current.y;
      look.current.x = e.clientX;
      look.current.y = e.clientY;
      look.current.yaw = THREE.MathUtils.clamp(look.current.yaw - dx * 0.0034, -1.15, 1.15);
      look.current.pitch = THREE.MathUtils.clamp(look.current.pitch - dy * 0.0028, -0.62, 0.62);
    };
    const onUp = () => {
      look.current.drag = false;
      el.style.cursor = "grab";
    };
    el.style.cursor = "grab";
    el.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      el.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, [gl]);

  const aspect = size.width / Math.max(1, size.height);
  const bonus = aspect < 0.85 ? 14 : aspect < 1.15 ? 7 : 0;
  const aspectRef = useRef(aspect);
  aspectRef.current = aspect;
  const bonusRef = useRef(bonus);
  bonusRef.current = bonus;

  const tmp = useMemo(
    () => ({
      p: new THREE.Vector3(),
      t: new THREE.Vector3(),
      d: new THREE.Vector3(),
      e: new THREE.Euler(0, 0, 0, "YXZ"),
      add: new THREE.Vector3(),
    }),
    [],
  );

  useFrame((state, dt) => {
    const i = scroll.current.i;
    const s = THREE.MathUtils.clamp(i / (views.length - 1), 0, 1);

    posCurve.getPoint(s, tmp.p);
    tgtCurve.getPoint(s, tmp.t);

    // easing the lens between waypoints is what makes a bedroom feel like a
    // room instead of a cupboard
    const n = views.length - 1;
    const a = Math.floor(i);
    const f = i - a;
    const fovA = views[Math.min(a, n)].fov ?? 58;
    const fovB = views[Math.min(a + 1, n)].fov ?? 58;
    const cam = camera as THREE.PerspectiveCamera;
    const want = THREE.MathUtils.lerp(fovA, fovB, f) + bonusRef.current;
    if (Math.abs(cam.fov - want) > 0.01) {
      cam.fov = want;
      cam.updateProjectionMatrix();
    }

    const time = state.clock.elapsedTime;
    // A barely-there exterior drift adds life without making the camera feel
    // seasick; the interior tour itself stays composed and architectural.
    const r =
      Math.sin(time * 0.11) * 0.045 * (1 - THREE.MathUtils.smoothstep(i, 0, 1.1)) +
      Math.sin(time * 0.09) * 0.015 * THREE.MathUtils.smoothstep(i, views.length - 1.6, views.length - 1);
    if (r) tmp.p.sub(tmp.t).applyAxisAngle(THREE.Object3D.DEFAULT_UP, r).add(tmp.t);

    camera.position.copy(tmp.p);

    tmp.d.copy(tmp.t).sub(tmp.p).normalize();
    if (!look.current.drag) {
      const k = Math.pow(0.015, dt);
      look.current.yaw *= k;
      look.current.pitch *= k;
    }
    tmp.e.set(look.current.pitch, look.current.yaw, 0);
    tmp.d.applyEuler(tmp.e);
    tmp.add.copy(tmp.p).add(tmp.d);
    camera.lookAt(tmp.add);
  });

  return null;
}

/** A real clipping plane for the section chapter. */
function SectionPlane({ scroll }: { scroll: { current: Journey } }) {
  const gl = useThree((s) => s.gl);
  const plane = useMemo(() => new THREE.Plane(new THREE.Vector3(0, -1, 0), 1000), []);

  useEffect(() => {
    gl.localClippingEnabled = true;
    return () => {
      gl.clippingPlanes = [];
    };
  }, [gl]);

  useFrame(() => {
    const i = scroll.current.i;
    // fully open at the section waypoint itself (index 9), released by 10
    const a = THREE.MathUtils.smoothstep(i, 8.45, 9.0);
    const b = 1 - THREE.MathUtils.smoothstep(i, 9.6, 9.98);
    const on = a * b;
    if (on < 0.004) {
      gl.clippingPlanes = [];
      return;
    }
    // sweep from above the roof (6.6 m) down to 2.4 m — low enough that the
    // section takes the floor slab with it and you get a real plan, not a lid
    plane.constant = 6.6 - 4.2 * on;
    gl.clippingPlanes = [plane];
  });

  return null;
}

function Interior({
  build,
  lights,
  brightness,
  doorOpen,
  curtains,
  cut,
  scroll,
  onPick,
}: {
  build: VillaBuild;
  lights: Record<RoomKey, boolean>;
  brightness: number;
  doorOpen: boolean;
  curtains: boolean;
  cut: boolean;
  scroll: { current: Journey };
  onPick: (r: RoomKey) => void;
}) {
  const hover = useRef(false);
  const clock = useRef(0);

  useFrame((_, dt) => {
    clock.current += dt;
    const k = 1 - Math.pow(0.0012, Math.min(dt, 0.06));

    for (const r of ROOMS) {
      const on = lights[r.key];
      for (const m of build.rooms[r.key].fixtures) {
        m.emissiveIntensity = THREE.MathUtils.lerp(m.emissiveIntensity, on ? 2.4 * (brightness / 100) : 0.02, k);
      }
      for (const l of build.rooms[r.key].lights) {
        l.intensity = THREE.MathUtils.lerp(l.intensity, on ? 12 * (brightness / 100) : 0, k);
      }
      for (const m of build.rooms[r.key].leds) {
        m.emissiveIntensity = THREE.MathUtils.lerp(m.emissiveIntensity, on ? 3 : 0.12, k);
      }
    }

    // manual x-ray and the automatic cutaway while inside
    const ghost = Math.max(cut ? 1 : 0, 0);
    for (const m of build.wallMats) {
      m.transparent = true;
      m.opacity = THREE.MathUtils.lerp(m.opacity, 1 - ghost * 0.94, k);
      m.depthWrite = m.opacity > 0.7;
    }

    // front door swings as you reach the foyer leg
    if (build.doorPivot) {
      const auto =
        THREE.MathUtils.smoothstep(scroll.current.i, 1.6, 2.6) *
        (1 - THREE.MathUtils.smoothstep(scroll.current.i, 3.2, 3.9));
      build.doorPivot.rotation.y = THREE.MathUtils.lerp(
        build.doorPivot.rotation.y,
        -Math.max(auto, doorOpen ? 1 : 0) * 1.35,
        k,
      );
    }

    // motorised drapes: settle closed when the scene says so, otherwise open
    for (const c of build.curtains) {
      const want = curtains ? c.closed : c.open;
      if (c.axis === "x") c.g.position.x = THREE.MathUtils.lerp(c.g.position.x, want, k);
      else c.g.position.z = THREE.MathUtils.lerp(c.g.position.z, want, k);
    }
  });

  const pick = (e: ThreeEvent<PointerEvent>) => {
    const r = e.object.userData.room as RoomKey | undefined;
    if (r && !hover.current) {
      hover.current = true;
      document.body.style.cursor = "pointer";
    }
  };

  return (
    <primitive
      object={build.root}
      onPointerMove={pick}
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
  brightness,
  doorOpen,
  curtains,
  cut,
  time,
  views,
  scroll,
  onPick,
  onReady,
}: {
  lights: Record<RoomKey, boolean>;
  brightness: number;
  doorOpen: boolean;
  curtains: boolean;
  time: TimeKey;
  cut: boolean;
  views: View[];
  scroll: { current: Journey };
  onPick: (r: RoomKey) => void;
  onReady: () => void;
}) {
  const build = useMemo(() => buildVilla(), []);
  const t = TIMES[time];

  useEffect(() => {
    const frame = requestAnimationFrame(onReady);
    return () => cancelAnimationFrame(frame);
  }, [onReady]);

  useEffect(() => {
    return () => {
      document.body.style.cursor = "";
      build.root.traverse((o) => {
        const m = o as THREE.Mesh;
        if (m.isMesh && m.geometry !== undefined && m.geometry !== null) {
          // shared BOX geometry is reused by hundreds of meshes; only dispose
          // anything that was created uniquely for this build
          if (m.geometry.type !== "BoxGeometry") m.geometry.dispose();
        }
      });
    };
  }, [build]);

  return (
    <>
      <fog attach="fog" args={[t.sky2, 40, 160]} />

      <SkyDome top={t.sky} bottom={t.sky2} />
      <EnvDome top={t.sky} bottom={t.sky2} intensity={time === "day" ? 0.5 : 0.42} />
      <Exposure value={t.exposure} />

      <ambientLight intensity={t.ambient} color="#cfd9e8" />
      <hemisphereLight args={[t.sky2, t.ground, t.hemi]} />
      <directionalLight position={[-t.sun[0] * 0.7, t.sun[1] * 1.3, t.sun[2] * 0.9]} intensity={t.fill} color="#cfe0ff" />
      <directionalLight
        position={t.sun}
        intensity={t.sunPower}
        color={t.sunColor}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-16}
        shadow-camera-right={16}
        shadow-camera-top={16}
        shadow-camera-bottom={-16}
        shadow-camera-near={0.5}
        shadow-camera-far={60}
        shadow-bias={-0.0004}
        shadow-normalBias={0.03}
      />

      <Interior build={build} lights={lights} brightness={brightness} doorOpen={doorOpen} curtains={curtains} cut={cut} scroll={scroll} onPick={onPick} />
      <ScrollRig scroll={scroll} views={views} />
      <SectionPlane scroll={scroll} />
    </>
  );
}
