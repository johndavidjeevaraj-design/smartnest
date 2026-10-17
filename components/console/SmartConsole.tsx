"use client";

import { useState, type CSSProperties } from "react";
import {
  Car,
  Camera,
  Blinds,
  DoorOpen,
  Lightbulb,
  ShieldCheck,
  Thermometer,
} from "lucide-react";
import {
  DEVICES,
  ROOMS,
  SCENES,
  type DeviceId,
  type RoomId,
  type SceneId,
} from "./data";
import {
  CamerasPanel,
  ClimatePanel,
  CurtainsPanel,
  EvPanel,
  IntercomPanel,
  LightsPanel,
  SecurityPanel,
} from "./panels";

const ICONS = {
  lights: Lightbulb,
  climate: Thermometer,
  curtains: Blinds,
  security: ShieldCheck,
  cameras: Camera,
  ev: Car,
  intercom: DoorOpen,
} as const;

/**
 * The interactive console.
 *
 * One state object drives both the control panel and the villa render, so
 * pressing a room in the panel visibly lights that room in the house. The
 * point is that the controls and the picture can never disagree — a demo
 * where they drift apart is worse than no demo.
 */
export default function SmartConsole() {
  const [device, setDevice] = useState<DeviceId>("lights");
  const [on, setOn] = useState<RoomId[]>(["living", "kitchen"]);
  const [brightness, setBrightness] = useState(72);
  const [curtains, setCurtains] = useState(100);
  const [temperature, setTemperature] = useState(23);
  const [armed, setArmed] = useState(false);
  const [charging, setCharging] = useState(true);
  const [unlocked, setUnlocked] = useState(false);
  const [scene, setScene] = useState<SceneId | null>(null);

  const roomTemp = 27;

  const toggle = (id: RoomId) => {
    setScene(null);
    setOn((prev) =>
      prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]
    );
  };

  const applyScene = (id: SceneId) => {
    const s = SCENES.find((x) => x.id === id);
    if (!s) return;
    setScene(id);
    setOn(s.rooms);
    setBrightness(s.brightness);
    setCurtains(s.curtains);
    setTemperature(s.temperature);
    setArmed(s.security);
  };

  const lightPower = on.length ? 0.45 + (brightness / 100) * 0.55 : 0;

  return (
    <div className="sc">
      {/* ── header ── */}
      <div className="sc-head">
        <div className="sc-head-left">
          <span className="sc-live">
            <i />
            My villa · live
          </span>
          <h3 className="sc-title">Control the villa</h3>
          <p className="sc-sub">
            Tap a system, change a setting, and watch the house below respond.
            This is a simulation — no hardware is connected.
          </p>
        </div>

        <div className="sc-scenes" role="group" aria-label="Scenes">
          {SCENES.map((s) => (
            <button
              key={s.id}
              type="button"
              className={scene === s.id ? "is-active" : ""}
              onClick={() => applyScene(s.id)}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <div className="sc-body">
        {/* ── device rail ── */}
        <nav className="sc-rail" aria-label="Devices">
          {DEVICES.map((d) => {
            const Icon = ICONS[d.id];
            return (
              <button
                key={d.id}
                type="button"
                className={device === d.id ? "is-active" : ""}
                onClick={() => setDevice(d.id)}
                aria-pressed={device === d.id}
              >
                <Icon size={18} aria-hidden />
                <span>{d.label}</span>
              </button>
            );
          })}
        </nav>

        {/* ── the villa ── */}
        <div className="sc-stage" data-device={device}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/smartnest-villa.jpg"
            alt="SmartNest villa showing every room that can be controlled from one system"
            width={1600}
            height={1067}
          />
          <span className="sc-night" aria-hidden />

          {/* Room lights follow the light state exactly. */}
          {ROOMS.map((room) => {
            const isOn = on.includes(room.id);
            return (
              <span
                key={room.id}
                className="sc-room-light"
                aria-hidden
                style={
                  {
                    "--cx": `${room.lx}%`,
                    "--cy": `${room.ly}%`,
                    "--rw": `${room.lw * 0.8}%`,
                    "--rh": `${room.lh * 0.8}%`,
                    opacity: isOn ? lightPower : 0,
                  } as CSSProperties
                }
              />
            );
          })}

          {/* Curtains close across the glazing. */}
          <span
            className="sc-curtain"
            aria-hidden
            style={{ width: `${(100 - curtains) * 0.62}%` }}
          />
          {/* Armed state draws a live perimeter. */}
          <span className="sc-perimeter" aria-hidden data-armed={armed} />
          {/* Charging draws a cable pulse to the car port. */}
          <span className="sc-ev-cable" aria-hidden data-charging={charging} />
          {/* Unlocking shows the door glow. */}
          <span className="sc-door" aria-hidden data-open={unlocked} />

          <div className="sc-stage-bar">
            <span className="sc-stage-chip">
              {on.length}/{ROOMS.length} lights
            </span>
            <span className="sc-stage-chip">{temperature}°C</span>
            <span className="sc-stage-chip">
              Curtains {curtains === 0 ? "closed" : `${curtains}%`}
            </span>
            <span className={`sc-stage-chip${armed ? " is-on" : ""}`}>
              {armed ? "Armed" : "Disarmed"}
            </span>
          </div>
        </div>

        {/* ── control panel ── */}
        <div className="sc-panel">
          <div className="sc-panel-head">
            <span>{DEVICES.find((d) => d.id === device)?.label}</span>
            <small>Live</small>
          </div>

          {device === "lights" && (
            <LightsPanel
              on={on}
              toggle={toggle}
              brightness={brightness}
              setBrightness={(v) => {
                setScene(null);
                setBrightness(v);
              }}
            />
          )}
          {device === "climate" && (
            <ClimatePanel
              target={temperature}
              setTarget={(v) => {
                setScene(null);
                setTemperature(v);
              }}
              roomTemp={roomTemp}
            />
          )}
          {device === "curtains" && (
            <CurtainsPanel
              value={curtains}
              setValue={(v) => {
                setScene(null);
                setCurtains(v);
              }}
            />
          )}
          {device === "security" && (
            <SecurityPanel
              armed={armed}
              setArmed={(v) => {
                setScene(null);
                setArmed(v);
              }}
            />
          )}
          {device === "cameras" && <CamerasPanel />}
          {device === "ev" && (
            <EvPanel charge={41} charging={charging} setCharging={setCharging} />
          )}
          {device === "intercom" && (
            <IntercomPanel unlocked={unlocked} setUnlocked={setUnlocked} />
          )}
        </div>
      </div>
    </div>
  );
}
