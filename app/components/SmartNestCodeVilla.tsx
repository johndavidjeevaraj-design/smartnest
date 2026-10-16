
"use client";

import { useState } from "react";
import { Canvas } from "@react-three/fiber";
import {
  ContactShadows,
  Environment,
  OrbitControls,
} from "@react-three/drei";

type RoomName =
  | "Living Room"
  | "Kitchen"
  | "Master Bedroom"
  | "Bedroom 2"
  | "Bedroom 3"
  | "Garden";

type Lights = Record<RoomName, boolean>;

const rooms: RoomName[] = [
  "Living Room",
  "Kitchen",
  "Master Bedroom",
  "Bedroom 2",
  "Bedroom 3",
  "Garden",
];

const roomPositions: Record<RoomName, [number, number, number]> = {
  "Living Room": [-2, 0.12, 1.35],
  Kitchen: [2, 0.12, 1.35],
  "Master Bedroom": [-2, 3.15, -1.35],
  "Bedroom 2": [0, 3.15, -1.35],
  "Bedroom 3": [2, 3.15, -1.35],
  Garden: [0, 0.02, 5],
};

function Building({
  cutaway,
  lights,
  selectedRoom,
  curtainsOpen,
  rgbColor,
  onSelectRoom,
}: {
  cutaway: boolean;
  lights: Lights;
  selectedRoom: RoomName;
  curtainsOpen: boolean;
  rgbColor: string;
  onSelectRoom: (room: RoomName) => void;
}) {
  const wall = "#d8d5ca";
  const concrete = "#555b58";
  const wood = "#916b4c";
  const glass = "#172d35";

  function RoomFloor({
    room,
    position,
    size,
  }: {
    room: RoomName;
    position: [number, number, number];
    size: [number, number, number];
  }) {
    const active = selectedRoom === room;
    return (
      <group position={position}>
        <mesh
          position={[0, 0, 0]}
          onClick={(e) => {
            e.stopPropagation();
            onSelectRoom(room);
          }}
          onPointerOver={(e) => {
            e.stopPropagation();
            document.body.style.cursor = "pointer";
          }}
          onPointerOut={() => {
            document.body.style.cursor = "auto";
          }}
          receiveShadow
        >
          <boxGeometry args={size} />
          <meshStandardMaterial
            color={active ? "#d4e4dc" : "#b8b5aa"}
            roughness={0.83}
            emissive={active ? "#1687ff" : "#000000"}
            emissiveIntensity={active ? 0.13 : 0}
          />
        </mesh>

        <mesh position={[0, 0.09, 0]}>
          <boxGeometry args={[0.65, 0.08, 0.55]} />
          <meshStandardMaterial color={wood} roughness={0.72} />
        </mesh>

        {lights[room] && (
          <pointLight
            position={[0, 1.1, 0]}
            color={rgbColor}
            intensity={2.5}
            distance={4.2}
            decay={2}
          />
        )}

        <mesh position={[0, 0.22, 0]}>
          <boxGeometry args={[0.8, 0.06, 0.8]} />
          <meshStandardMaterial
            color={lights[room] ? rgbColor : "#e8e2d4"}
            emissive={lights[room] ? rgbColor : "#000000"}
            emissiveIntensity={lights[room] ? 1.8 : 0}
            roughness={0.25}
          />
        </mesh>
      </group>
    );
  }

  return (
    <group>
      {/* Site, foundation and garden */}
      <mesh position={[0, -0.3, 0]} receiveShadow>
        <boxGeometry args={[10.8, 0.35, 9]} />
        <meshStandardMaterial color="#77796f" roughness={0.95} />
      </mesh>

      <mesh position={[0, -0.08, 0]} receiveShadow>
        <boxGeometry args={[8.5, 0.18, 6.4]} />
        <meshStandardMaterial color={concrete} roughness={0.82} />
      </mesh>

      {/* Ground floor: living room and kitchen */}
      <RoomFloor
        room="Living Room"
        position={roomPositions["Living Room"]}
        size={[3.9, 0.16, 2.8]}
      />
      <RoomFloor
        room="Kitchen"
        position={roomPositions.Kitchen}
        size={[3.9, 0.16, 2.8]}
      />

      {/* Upper floor: three bedrooms */}
      <RoomFloor
        room="Master Bedroom"
        position={roomPositions["Master Bedroom"]}
        size={[2.55, 0.16, 2.8]}
      />
      <RoomFloor
        room="Bedroom 2"
        position={roomPositions["Bedroom 2"]}
        size={[2.55, 0.16, 2.8]}
      />
      <RoomFloor
        room="Bedroom 3"
        position={roomPositions["Bedroom 3"]}
        size={[2.55, 0.16, 2.8]}
      />

      {/* Structural exterior walls */}
      <mesh position={[-4.1, 1.45, 0]}>
        <boxGeometry args={[0.22, 2.9, 6.3]} />
        <meshStandardMaterial color={wall} roughness={0.86} />
      </mesh>
      <mesh position={[4.1, 1.45, 0]}>
        <boxGeometry args={[0.22, 2.9, 6.3]} />
        <meshStandardMaterial color={wall} roughness={0.86} />
      </mesh>
      <mesh position={[0, 1.45, -3.1]}>
        <boxGeometry args={[8.3, 2.9, 0.22]} />
        <meshStandardMaterial color={wall} roughness={0.86} />
      </mesh>

      {/* Upper-storey walls */}
      <mesh position={[-4.1, 4.4, 0]}>
        <boxGeometry args={[0.22, 2.8, 6.3]} />
        <meshStandardMaterial color={wall} roughness={0.86} />
      </mesh>
      <mesh position={[4.1, 4.4, 0]}>
        <boxGeometry args={[0.22, 2.8, 6.3]} />
        <meshStandardMaterial color={wall} roughness={0.86} />
      </mesh>
      <mesh position={[0, 4.4, -3.1]}>
        <boxGeometry args={[8.3, 2.8, 0.22]} />
        <meshStandardMaterial color={wall} roughness={0.86} />
      </mesh>

      {/* Front facade: hidden to reveal rooms in cutaway mode */}
      {!cutaway && (
        <>
          <mesh position={[0, 1.45, 3.1]}>
            <boxGeometry args={[8.3, 2.9, 0.18]} />
            <meshStandardMaterial color={wall} roughness={0.8} />
          </mesh>
          <mesh position={[0, 4.4, 3.1]}>
            <boxGeometry args={[8.3, 2.8, 0.18]} />
            <meshStandardMaterial color={wall} roughness={0.8} />
          </mesh>
        </>
      )}

      {/* Interior partitions */}
      <mesh position={[0, 1.45, 0.0]}>
        <boxGeometry args={[0.12, 2.9, 6.0]} />
        <meshStandardMaterial color="#c4c0b5" />
      </mesh>
      <mesh position={[0, 4.4, 0.0]}>
        <boxGeometry args={[0.12, 2.8, 6.0]} />
        <meshStandardMaterial color="#c4c0b5" />
      </mesh>
      <mesh position={[0, 4.4, 0]}>
        <boxGeometry args={[8.0, 2.8, 0.12]} />
        <meshStandardMaterial color="#c4c0b5" />
      </mesh>
      <mesh position={[-1.35, 4.4, 0]}>
        <boxGeometry args={[0.1, 2.8, 6.0]} />
        <meshStandardMaterial color="#c4c0b5" />
      </mesh>
      <mesh position={[1.35, 4.4, 0]}>
        <boxGeometry args={[0.1, 2.8, 6.0]} />
        <meshStandardMaterial color="#c4c0b5" />
      </mesh>

      {/* Window glass and switchable warm illumination */}
      {[ -2.8, -1.8, 1.8, 2.8 ].map((x) => (
        <group key={x}>
          <mesh position={[x, 1.75, 3.0]}>
            <boxGeometry args={[0.85, 1.15, 0.035]} />
            <meshStandardMaterial
              color={glass}
              metalness={0.3}
              roughness={0.16}
              emissive={
                (x < 0 ? lights["Living Room"] : lights.Kitchen)
                  ? rgbColor
                  : "#000000"
              }
              emissiveIntensity={
                (x < 0 ? lights["Living Room"] : lights.Kitchen) ? 1.2 : 0
              }
            />
          </mesh>
          <mesh position={[x, 4.35, 3.0]}>
            <boxGeometry args={[0.85, 1.1, 0.035]} />
            <meshStandardMaterial
              color={glass}
              metalness={0.3}
              roughness={0.16}
              emissive={
                (x < -2 ? lights["Master Bedroom"] :
                  x < 0 ? lights["Bedroom 2"] : lights["Bedroom 3"])
                  ? rgbColor
                  : "#000000"
              }
              emissiveIntensity={
                (x < -2 ? lights["Master Bedroom"] :
                  x < 0 ? lights["Bedroom 2"] : lights["Bedroom 3"])
                  ? 1.2
                  : 0
              }
            />
          </mesh>
          {!curtainsOpen && (
            <>
              <mesh position={[x - 0.32, 1.75, 2.94]}>
                <boxGeometry args={[0.18, 1.2, 0.06]} />
                <meshStandardMaterial color="#6e776f" roughness={0.9} />
              </mesh>
              <mesh position={[x + 0.32, 1.75, 2.94]}>
                <boxGeometry args={[0.18, 1.2, 0.06]} />
                <meshStandardMaterial color="#6e776f" roughness={0.9} />
              </mesh>
            </>
          )}
        </group>
      ))}

      {/* Sofa and coffee table */}
      <mesh position={[-2.3, 0.48, 1.8]}>
        <boxGeometry args={[1.5, 0.5, 0.65]} />
        <meshStandardMaterial color="#777c78" roughness={0.92} />
      </mesh>
      <mesh position={[-2.3, 0.78, 1.5]}>
        <boxGeometry args={[1.5, 0.12, 0.18]} />
        <meshStandardMaterial color="#777c78" roughness={0.92} />
      </mesh>
      <mesh position={[-2.3, 0.3, 0.8]}>
        <boxGeometry args={[0.8, 0.1, 0.5]} />
        <meshStandardMaterial color={wood} roughness={0.45} />
      </mesh>

      {/* Kitchen island and cabinets */}
      <mesh position={[2.0, 0.5, 1.5]}>
        <boxGeometry args={[1.8, 0.65, 0.65]} />
        <meshStandardMaterial color="#d2d0c7" roughness={0.55} />
      </mesh>
      <mesh position={[2.0, 0.85, 1.5]}>
        <boxGeometry args={[1.9, 0.08, 0.72]} />
        <meshStandardMaterial color="#393f3c" roughness={0.28} />
      </mesh>

      {/* Beds in the three bedrooms */}
      {[
        [-2.1, 3.48, -1.65],
        [-0.05, 3.48, -1.65],
        [2.1, 3.48, -1.65],
      ].map((p, i) => (
        <group key={i} position={p as [number, number, number]}>
          <mesh>
            <boxGeometry args={[1.45, 0.35, 1.5]} />
            <meshStandardMaterial color="#a5a49b" roughness={0.95} />
          </mesh>
          <mesh position={[0, 0.2, 0.08]}>
            <boxGeometry args={[1.35, 0.1, 1.2]} />
            <meshStandardMaterial color="#ece8df" roughness={0.98} />
          </mesh>
          <mesh position={[0, 0.28, -0.45]}>
            <boxGeometry args={[0.48, 0.09, 0.3]} />
            <meshStandardMaterial color="#b9c5bd" roughness={0.95} />
          </mesh>
        </group>
      ))}

      {/* Balcony slab and glass balustrade */}
      <mesh position={[0, 3.12, 3.75]}>
        <boxGeometry args={[5.4, 0.16, 1.1]} />
        <meshStandardMaterial color={concrete} roughness={0.75} />
      </mesh>
      <mesh position={[0, 3.55, 4.25]}>
        <boxGeometry args={[5.2, 0.72, 0.055]} />
        <meshStandardMaterial
          color="#8da5a4"
          metalness={0.45}
          roughness={0.12}
          transparent
          opacity={0.65}
        />
      </mesh>

      {/* Roof: visible in exterior mode, removed for cutaway */}
      {!cutaway && (
        <mesh position={[0, 5.88, 0]} castShadow>
          <boxGeometry args={[8.7, 0.25, 6.7]} />
          <meshStandardMaterial color={concrete} roughness={0.75} />
        </mesh>
      )}

      {/* Garden and pathway */}
      <mesh position={[0, -0.04, 5.1]} receiveShadow>
        <boxGeometry args={[8.8, 0.08, 2.3]} />
        <meshStandardMaterial color="#68785d" roughness={1} />
      </mesh>
      {[-2.8, -1.4, 0, 1.4, 2.8].map((x) => (
        <mesh key={x} position={[x, 0.02, 5.0]} receiveShadow>
          <boxGeometry args={[0.8, 0.08, 0.6]} />
          <meshStandardMaterial color="#c4c1b6" roughness={0.92} />
        </mesh>
      ))}
      {[-3.5, 3.5].map((x) => (
        <group key={x} position={[x, 0, 5.4]}>
          <mesh position={[0, 0.28, 0]}>
            <cylinderGeometry args={[0.38, 0.45, 0.55, 12]} />
            <meshStandardMaterial color="#777b70" roughness={0.95} />
          </mesh>
          <mesh position={[0, 0.85, 0]}>
            <sphereGeometry args={[0.55, 12, 10]} />
            <meshStandardMaterial color="#1687ff" roughness={1} />
          </mesh>
        </group>
      ))}

      {/* Garden light */}
      {lights.Garden && (
        <>
          <pointLight position={[-3.5, 1, 5]} color={rgbColor} intensity={3} distance={5} />
          <pointLight position={[3.5, 1, 5]} color={rgbColor} intensity={3} distance={5} />
        </>
      )}
    </group>
  );
}

export default function SmartNestCodeVilla() {
  const [cutaway, setCutaway] = useState(true);
  const [selectedRoom, setSelectedRoom] = useState<RoomName>("Living Room");
  const [lights, setLights] = useState<Lights>({
    "Living Room": false,
    Kitchen: false,
    "Master Bedroom": false,
    "Bedroom 2": false,
    "Bedroom 3": false,
    Garden: false,
  });
  const [curtainsOpen, setCurtainsOpen] = useState(true);
  const [climateOn, setClimateOn] = useState(false);
  const [temperature, setTemperature] = useState(23);
  const [securityOn, setSecurityOn] = useState(true);
  const [rgbColor, setRgbColor] = useState("#ffca83");
  const [brightness, setBrightness] = useState(70);

  const selectedLight = lights[selectedRoom];

  function toggleRoomLight() {
    setLights((current) => ({
      ...current,
      [selectedRoom]: !current[selectedRoom],
    }));
  }

  function setAllLights(on: boolean) {
    setLights({
      "Living Room": on,
      Kitchen: on,
      "Master Bedroom": on,
      "Bedroom 2": on,
      "Bedroom 3": on,
      Garden: on,
    });
  }

  return (
    <section className="w-full overflow-hidden rounded-3xl border border-white/10 bg-[#0b100f] text-white">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 p-5">
        <div>
          <p className="text-xs font-semibold tracking-[0.25em] text-[#1687ff]">
            SMARTNEST · KNX EXPERIENCE
          </p>
          <h2 className="mt-2 text-2xl font-semibold sm:text-3xl">
            Your home. Your intelligence.
          </h2>
          <p className="mt-2 text-sm text-white/60">
            Explore the villa and control each space.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setCutaway(false)}
            aria-pressed={!cutaway}
            className={`rounded-full border px-4 py-2 text-sm transition ${
              !cutaway
                ? "border-[#1687ff] bg-[#1687ff] text-black"
                : "border-white/20 text-white"
            }`}
          >
            Exterior
          </button>
          <button
            type="button"
            onClick={() => setCutaway(true)}
            aria-pressed={cutaway}
            className={`rounded-full border px-4 py-2 text-sm transition ${
              cutaway
                ? "border-[#1687ff] bg-[#1687ff] text-black"
                : "border-white/20 text-white"
            }`}
          >
            Cutaway
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="relative min-h-[380px] bg-[#141b18] sm:min-h-[540px]">
          <div className="absolute left-4 top-4 z-10 rounded-full border border-white/10 bg-black/50 px-3 py-2 text-xs text-white/80 backdrop-blur">
            {cutaway ? "INTERIOR CUTAWAY" : "EXTERIOR VIEW"} · DRAG TO ORBIT
          </div>
          <Canvas
            shadows
            dpr={[1, 1.5]}
            camera={{ position: [12, 9, 14], fov: 38 }}
            gl={{ antialias: true, powerPreference: "high-performance" }}
          >
            <color attach="background" args={["#141b18"]} />
            <fog attach="fog" args={["#141b18", 19, 34]} />
            <ambientLight intensity={0.8} />
            <directionalLight
              position={[8, 12, 7]}
              intensity={2.1}
              castShadow
              shadow-mapSize-width={1024}
              shadow-mapSize-height={1024}
            />
            <Environment preset="city" />
            <Building
              cutaway={cutaway}
              lights={lights}
              selectedRoom={selectedRoom}
              curtainsOpen={curtainsOpen}
              rgbColor={rgbColor}
              onSelectRoom={setSelectedRoom}
            />
            <ContactShadows
              position={[0, -0.11, 0]}
              opacity={0.4}
              scale={24}
              blur={2.5}
            />
            <OrbitControls
              makeDefault
              target={[0, 2.1, 0]}
              enableDamping
              dampingFactor={0.07}
              minDistance={8}
              maxDistance={22}
              maxPolarAngle={Math.PI / 2.02}
            />
          </Canvas>
          <div className="pointer-events-none absolute bottom-4 left-4 rounded-lg bg-black/45 px-3 py-2 text-xs text-white/70">
            Select a room from the controls to operate its lighting.
          </div>
        </div>

        <aside className="border-t border-white/10 bg-[#101613] p-4 sm:p-5 lg:border-l lg:border-t-0">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold tracking-[0.2em] text-white/50">
              VILLA CONTROLS
            </p>
            <span className="rounded-full bg-[#1687ff]/10 px-2 py-1 text-xs text-[#1687ff]">
              DEMO
            </span>
          </div>

          <h3 className="mt-4 text-lg font-semibold">{selectedRoom}</h3>
          <p className="mt-1 text-sm text-white/50">
            Select a room, then control its devices.
          </p>

          <div className="mt-4 grid grid-cols-2 gap-2">
            {rooms.map((room) => (
              <button
                key={room}
                type="button"
                onClick={() => setSelectedRoom(room)}
                className={`rounded-xl border px-3 py-3 text-left text-xs transition ${
                  selectedRoom === room
                    ? "border-[#1687ff] bg-[#1687ff]/10 text-[#1687ff]"
                    : "border-white/10 bg-white/[0.03] text-white/75 hover:border-white/30"
                }`}
              >
                <span className="block">{room}</span>
                <span className="mt-1 block text-[10px] opacity-60">
                  {lights[room] ? "Light on" : "Light off"}
                </span>
              </button>
            ))}
          </div>

          <div className="mt-5 rounded-2xl border border-white/10 p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-medium">Room lighting</p>
                <p className="mt-1 text-xs text-white/50">
                  {selectedLight ? "Currently on" : "Currently off"}
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={selectedLight}
                onClick={toggleRoomLight}
                className={`relative h-7 w-12 rounded-full transition ${
                  selectedLight ? "bg-[#1687ff]" : "bg-white/20"
                }`}
              >
                <span
                  className={`absolute top-1 h-5 w-5 rounded-full bg-white transition ${
                    selectedLight ? "left-6" : "left-1"
                  }`}
                />
              </button>
            </div>

            <label className="mt-5 block text-sm text-white/75">
              Brightness <span className="float-right">{brightness}%</span>
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={brightness}
              onChange={(e) => setBrightness(Number(e.target.value))}
              className="mt-3 w-full accent-[#1687ff]"
            />

            <label className="mt-5 block text-sm text-white/75">
              Light colour
            </label>
            <div className="mt-3 flex gap-3">
              {["#ffca83", "#ffffff", "#1687ff", "#83aaff"].map((colour) => (
                <button
                  key={colour}
                  type="button"
                  aria-label={`Set light colour ${colour}`}
                  onClick={() => setRgbColor(colour)}
                  className={`h-7 w-7 rounded-full border-2 ${
                    rgbColor === colour ? "border-white" : "border-white/20"
                  }`}
                  style={{ backgroundColor: colour }}
                />
              ))}
            </div>

            <div className="mt-5 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setAllLights(true)}
                className="rounded-xl bg-[#1687ff] px-3 py-3 text-sm font-semibold text-black"
              >
                All lights on
              </button>
              <button
                type="button"
                onClick={() => setAllLights(false)}
                className="rounded-xl border border-white/15 px-3 py-3 text-sm"
              >
                All lights off
              </button>
            </div>
          </div>

          <div className="mt-4 space-y-3 rounded-2xl border border-white/10 p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium">Curtains</p>
                <p className="mt-1 text-xs text-white/50">
                  {curtainsOpen ? "Open" : "Closed"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setCurtainsOpen((v) => !v)}
                className="rounded-full border border-white/15 px-3 py-2 text-xs"
              >
                {curtainsOpen ? "Close" : "Open"}
              </button>
            </div>

            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium">Climate control</p>
                <p className="mt-1 text-xs text-white/50">
                  {climateOn ? `${temperature}°C · Active` : "Standby"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setClimateOn((v) => !v)}
                className="rounded-full border border-white/15 px-3 py-2 text-xs"
              >
                {climateOn ? "Turn off" : "Turn on"}
              </button>
            </div>

            {climateOn && (
              <div>
                <label className="flex justify-between text-xs text-white/65">
                  Temperature <span>{temperature}°C</span>
                </label>
                <input
                  type="range"
                  min="16"
                  max="30"
                  value={temperature}
                  onChange={(e) => setTemperature(Number(e.target.value))}
                  className="mt-3 w-full accent-[#1687ff]"
                />
              </div>
            )}

            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium">Security system</p>
                <p className="mt-1 text-xs text-white/50">
                  {securityOn ? "Armed (demo)" : "Disarmed (demo)"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSecurityOn((v) => !v)}
                className="rounded-full border border-white/15 px-3 py-2 text-xs"
              >
                {securityOn ? "Disarm" : "Arm"}
              </button>
            </div>
          </div>

          <p className="mt-4 text-[11px] leading-5 text-white/40">
            Interactive concept only. These controls simulate KNX behaviour;
            they are not connected to real building devices.
          </p>
        </aside>
      </div>
    </section>
  );
}
