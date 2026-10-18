"use client";

import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import VillaScene, { type Journey } from "./VillaScene";
import { VIEWS, type RoomKey, type TimeKey } from "./villa";

export default function VillaCanvas({
  lights,
  brightness,
  doorOpen,
  curtains,
  time,
  cut,
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
  scroll: { current: Journey };
  onPick: (r: RoomKey) => void;
  onReady: () => void;
}) {
  return (
    <Canvas
      shadows
      dpr={[1, 1.25]}
      camera={{ fov: 58, position: [27, 10, 37], near: 0.05, far: 600 }}
      gl={{ antialias: false, powerPreference: "high-performance" }}
      style={{ touchAction: "pan-y" }}
    >
      <Suspense fallback={null}>
        <VillaScene
          lights={lights}
          brightness={brightness}
          doorOpen={doorOpen}
          curtains={curtains}
          time={time}
          cut={cut}
          views={VIEWS}
          scroll={scroll}
          onPick={onPick}
          onReady={onReady}
        />
      </Suspense>
    </Canvas>
  );
}
