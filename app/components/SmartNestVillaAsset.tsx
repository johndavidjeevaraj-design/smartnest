
"use client";

import { useMemo } from "react";
import { useGLTF } from "@react-three/drei";
import { Box3, Vector3 } from "three";

export type SmartNestVillaAssetProps = {
  lightsOn: boolean;
  curtainsOpen: boolean;
  rgbColor: string;
  livingRoomOn: boolean;
  bedroomOn: boolean;
  outdoorLightsOn: boolean;
};

export default function SmartNestVillaAsset({
  lightsOn,
  curtainsOpen,
  rgbColor,
  livingRoomOn,
  bedroomOn,
  outdoorLightsOn,
}: SmartNestVillaAssetProps) {
  const { scene } = useGLTF("/models/smartnest-3bhk-villa.glb");

  const model = useMemo(() => {
    const clonedScene = scene.clone(true);

    clonedScene.traverse((object) => {
      if ((object as { isMesh?: boolean }).isMesh) {
        const mesh = object as import("three").Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
      }
    });

    // Normalize the villa to fit the viewer.
    const bounds = new Box3().setFromObject(clonedScene);
    const size = bounds.getSize(new Vector3());
    const center = bounds.getCenter(new Vector3());
    const maxDimension = Math.max(size.x, size.y, size.z);

    if (maxDimension > 0) {
      const fitScale = 8.5 / maxDimension;

      clonedScene.scale.setScalar(fitScale);
      clonedScene.position.set(
        -center.x * fitScale,
        -bounds.min.y * fitScale,
        -center.z * fitScale
      );
    }

    return clonedScene;
  }, [scene]);

  // The controls will be mapped to the GLB's named objects next.
  void lightsOn;
  void curtainsOpen;
  void rgbColor;
  void livingRoomOn;
  void bedroomOn;
  void outdoorLightsOn;

  return (
    <group>
      <primitive object={model} />
    </group>
  );
}

useGLTF.preload("/models/smartnest-3bhk-villa.glb");
