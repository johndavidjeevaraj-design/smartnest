"use client";

import { useState, type CSSProperties } from "react";
import {
  ArrowRight,
  BedDouble,
  Blinds,
  Car,
  DoorOpen,
  Droplets,
  Info,
  Lightbulb,
  Moon,
  ShieldCheck,
  Sun,
  Sunset,
  Thermometer,
  TreePine,
  Utensils,
  Waves,
} from "lucide-react";

/* ─────────────────────────────────────────────────────────────────────────
   Interactive KNX demonstration

   A simulation only — it drives CSS state, not hardware. The disclaimer
   at the bottom says so plainly, which matters: a visitor should never
   leave thinking they just operated a real house.

   Hotspot positions are percentages of the villa cutaway in
   public/images/smartnest-villa.jpg, so they stay aligned at any width.
   ───────────────────────────────────────────────────────────────────────── */

type RoomId = "master" | "bedroom2" | "living" | "dining" | "kitchen" | "garden" | "entrance";

type Room = {
  id: RoomId;
  label: string;
  x: number;
  y: number;
};

const ROOMS: Room[] = [
  { id: "master", label: "Master Bedroom", x: 21, y: 22 },
  { id: "bedroom2", label: "Bedroom 2", x: 63, y: 24 },
  { id: "living", label: "Living Room", x: 43, y: 46 },
  { id: "dining", label: "Dining", x: 63, y: 48 },
  { id: "kitchen", label: "Kitchen", x: 30, y: 33 },
  { id: "garden", label: "Garden", x: 22, y: 70 },
  { id: "entrance", label: "Entrance", x: 52, y: 68 },
];

type SceneId = "morning" | "away" | "movie" | "night";

type Scene = {
  id: SceneId;
  name: string;
  icon: typeof Sun;
  rooms: RoomId[];
  brightness: number;
  curtains: number;
  temperature: number;
  security: boolean;
  gate: boolean;
};

const SCENES: Scene[] = [
  {
    id: "morning",
    name: "Morning",
    icon: Sun,
    rooms: ["kitchen", "dining", "living"],
    brightness: 80,
    curtains: 100,
    temperature: 24,
    security: false,
    gate: true,
  },
  {
    id: "away",
    name: "Away",
    icon: DoorOpen,
    rooms: [],
    brightness: 0,
    curtains: 0,
    temperature: 26,
    security: true,
    gate: false,
  },
  {
    id: "movie",
    name: "Movie night",
    icon: Sunset,
    rooms: ["living"],
    brightness: 18,
    curtains: 100,
    temperature: 22,
    security: false,
    gate: false,
  },
  {
    id: "night",
    name: "Goodnight",
    icon: Moon,
    rooms: ["master", "bedroom2"],
    brightness: 12,
    curtains: 0,
    temperature: 23,
    security: true,
    gate: false,
  },
];

const ALL_ON: RoomId[] = ROOMS.map((r) => r.id);

export default function KnxDemo() {
  const [scene, setScene] = useState<SceneId | null>(null);
  const [on, setOn] = useState<RoomId[]>(["living", "dining"]);
  const [brightness, setBrightness] = useState(72);
  const [curtains, setCurtains] = useState(68);
  const [temperature, setTemperature] = useState(23);
  const [security, setSecurity] = useState(true);
  const [gate, setGate] = useState(false);
  const [water, setWater] = useState(true);

  const lightsActive = on.length > 0;

  function applyScene(next: Scene) {
    // Clicking the active scene again clears it, back to manual control.
    if (scene === next.id) {
      setScene(null);
      return;
    }
    setScene(next.id);
    setOn(next.rooms);
    setBrightness(next.brightness);
    setCurtains(next.curtains);
    setTemperature(next.temperature);
    setSecurity(next.security);
    setGate(next.gate);
  }

  function toggleRoom(id: RoomId) {
    setScene(null);
    setOn((prev) => (prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]));
  }

  return (
    <div className="ap-demo-grid">
      {/* ── The villa + hotspots ── */}
      <div className="ap-demo-stage">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/smartnest-villa.jpg"
          alt="Cutaway view of a luxury smart villa showing the master bedroom, living room, kitchen, dining area, garden and entrance that can each be controlled independently"
          width={1600}
          height={1067}
        />

        <div className="ap-demo-glow" style={{ opacity: lightsActive ? brightness / 145 : 0 }} aria-hidden />
        <div className="ap-demo-warm" style={{ opacity: lightsActive ? 1 : 0 }} aria-hidden />
        <div className="ap-demo-veil" style={{ opacity: 1 }} aria-hidden />
        <div className="ap-demo-scan" style={{ opacity: security ? 1 : 0 }} aria-hidden />

        <div className="ap-demo-topbar">
          <span className="ap-demo-live">
            <span className="ap-demo-dot" />
            KNX BUS · LIVE
          </span>
          <span className="ap-demo-readout">
            {on.length}/{ROOMS.length} ROOMS · <strong>{lightsActive ? `${brightness}%` : "OFF"}</strong>
          </span>
        </div>

        {ROOMS.map((room) => {
          const isOn = on.includes(room.id);
          return (
            <button
              key={room.id}
              type="button"
              className={`ap-hotspot ${isOn ? "ap-hotspot-on" : ""}`}
              style={{ left: `${room.x}%`, top: `${room.y}%` }}
              onClick={() => toggleRoom(room.id)}
              aria-pressed={isOn}
            >
              <span className="ap-hotspot-bulb" />
              {room.label}
            </button>
          );
        })}
      </div>

      {/* ── Control panel ── */}
      <div className="ap-panel">
        <div className="ap-panel-block">
          <p className="ap-panel-title">Scenes</p>
          <div className="ap-scenes">
            {SCENES.map((s) => {
              const Icon = s.icon;
              return (
                <button
                  key={s.id}
                  type="button"
                  className={`ap-scene ${scene === s.id ? "ap-scene-active" : ""}`}
                  onClick={() => applyScene(s)}
                  aria-pressed={scene === s.id}
                >
                  <Icon aria-hidden />
                  {s.name}
                </button>
              );
            })}
          </div>
        </div>

        <div className="ap-panel-block">
          <p className="ap-panel-title">Lighting</p>

          <div className="ap-slider-row">
            <span>Brightness</span>
            <strong>{lightsActive ? `${brightness}%` : "Off"}</strong>
          </div>
          <input
            type="range"
            min={0}
            max={100}
            value={brightness}
            onChange={(e) => {
              setBrightness(Number(e.target.value));
              setScene(null);
            }}
            className="ap-slider"
            style={{ "--fill": `${brightness}%` } as CSSProperties}
            aria-label="Lighting brightness"
          />

          <div className="ap-slider-row">
            <span>Curtains</span>
            <strong>{curtains === 0 ? "Closed" : `${curtains}% open`}</strong>
          </div>
          <input
            type="range"
            min={0}
            max={100}
            value={curtains}
            onChange={(e) => {
              setCurtains(Number(e.target.value));
              setScene(null);
            }}
            className="ap-slider"
            style={{ "--fill": `${curtains}%` } as CSSProperties}
            aria-label="Curtain position"
          />
        </div>

        <div className="ap-panel-block">
          <p className="ap-panel-title">Climate</p>
          <div className="ap-slider-row">
            <span>Living room setpoint</span>
            <strong>{temperature}°C</strong>
          </div>
          <input
            type="range"
            min={18}
            max={30}
            value={temperature}
            onChange={(e) => {
              setTemperature(Number(e.target.value));
              setScene(null);
            }}
            className="ap-slider"
            style={{ "--fill": `${((temperature - 18) / 12) * 100}%` } as CSSProperties}
            aria-label="Temperature setpoint"
          />
        </div>

        <div className="ap-panel-block">
          <p className="ap-panel-title">Systems</p>

          <div className="ap-toggle-row">
            <span className="ap-toggle-label">
              <ShieldCheck aria-hidden />
              <span className="ap-toggle-text">
                <strong>Security</strong>
                <small>{security ? "Armed · perimeter active" : "Disarmed"}</small>
              </span>
            </span>
            <button
              type="button"
              role="switch"
              aria-checked={security}
              aria-label="Toggle security"
              className={`ap-switch ${security ? "ap-switch-on" : ""}`}
              onClick={() => setSecurity((v) => !v)}
            />
          </div>

          <div className="ap-toggle-row">
            <span className="ap-toggle-label">
              <Car aria-hidden />
              <span className="ap-toggle-text">
                <strong>Entrance gate</strong>
                <small>{gate ? "Open" : "Closed & locked"}</small>
              </span>
            </span>
            <button
              type="button"
              role="switch"
              aria-checked={gate}
              aria-label="Toggle entrance gate"
              className={`ap-switch ${gate ? "ap-switch-on" : ""}`}
              onClick={() => setGate((v) => !v)}
            />
          </div>

          <div className="ap-toggle-row">
            <span className="ap-toggle-label">
              <Waves aria-hidden />
              <span className="ap-toggle-text">
                <strong>Water pump</strong>
                <small>{water ? "Auto · tank at 78%" : "Manual override"}</small>
              </span>
            </span>
            <button
              type="button"
              role="switch"
              aria-checked={water}
              aria-label="Toggle water pump automation"
              className={`ap-switch ${water ? "ap-switch-on" : ""}`}
              onClick={() => setWater((v) => !v)}
            />
          </div>
        </div>

        <button
          type="button"
          className="ap-btn ap-btn-neutral ap-btn-sm"
          onClick={() => {
            setOn(ALL_ON);
            setBrightness(100);
            setCurtains(100);
            setScene(null);
          }}
        >
          <Lightbulb size={16} />
          Turn everything on
        </button>

        <p className="ap-demo-note">
          <Info aria-hidden />
          <span>
            This is a live simulation running in your browser to show how scene logic behaves on a
            real KNX bus. It is not connected to any physical installation.
          </span>
        </p>
      </div>
    </div>
  );
}

/* Re-exported so the page can reuse the same icon vocabulary without
   importing lucide directly in two places. */
export const demoIcons = { BedDouble, Blinds, Droplets, Thermometer, TreePine, Utensils, ArrowRight };
