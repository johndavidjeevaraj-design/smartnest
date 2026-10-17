"use client";

import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import VillaScene from "./VillaScene";
import type { RoomKey, TimeKey, View } from "./villa";

export default function VillaCanvas({
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
  return (
    <Canvas
      shadows
      dpr={[1, 1.5]}
      camera={{ fov: 38, position: [17, 9.5, 21], near: 0.4, far: 500 }}
      gl={{ antialias: true, powerPreference: "high-performance" }}
    >
      <Suspense fallback={null}>
        <VillaScene
          lights={lights}
          gate={gate}
          curtains={curtains}
          time={time}
          cut={cut}
          view={view}
          onPick={onPick}
        />
      </Suspense>
      <OrbitControls
        makeDefault
        enableDamping
        dampingFactor={0.07}
        enablePan={false}
        minDistance={5}
        maxDistance={52}
        minPolarAngle={0.08}
        maxPolarAngle={Math.PI * 0.495}
        target={[0, 3.2, 1.5]}
      />
    </Canvas>
  );
}
