"use client";

import { Camera, DoorOpen, Lock, Minus, Plus, ShieldCheck, Unlock } from "lucide-react";
import { CAMERAS, ROOMS, type RoomId } from "./data";

/* ── Lights ────────────────────────────────────────────────────────────── */

export function LightsPanel({
  on,
  toggle,
  brightness,
  setBrightness,
}: {
  on: RoomId[];
  toggle: (id: RoomId) => void;
  brightness: number;
  setBrightness: (v: number) => void;
}) {
  return (
    <>
      <div className="sc-room-grid">
        {ROOMS.map((room) => {
          const isOn = on.includes(room.id);
          return (
            <button
              key={room.id}
              type="button"
              className={`sc-room${isOn ? " is-on" : ""}`}
              onClick={() => toggle(room.id)}
              aria-pressed={isOn}
            >
              <span className="sc-room-dot" aria-hidden />
              {room.label}
            </button>
          );
        })}
      </div>

      <div className="sc-slider-row">
        <span>Brightness</span>
        <strong>{brightness}%</strong>
      </div>
      <input
        className="sc-range"
        type="range"
        min={0}
        max={100}
        value={brightness}
        onChange={(e) => setBrightness(Number(e.target.value))}
        aria-label="Brightness"
        style={{ "--fill": `${brightness}%` } as React.CSSProperties}
      />
    </>
  );
}

/* ── Climate ───────────────────────────────────────────────────────────── */

export function ClimatePanel({
  target,
  setTarget,
  roomTemp,
}: {
  target: number;
  setTarget: (v: number) => void;
  roomTemp: number;
}) {
  const cooling = target < roomTemp;
  return (
    <>
      <div className="sc-thermo">
        <button type="button" onClick={() => setTarget(target - 1)} aria-label="Lower target temperature">
          <Minus size={17} />
        </button>
        <div className="sc-thermo-read">
          <span className="sc-thermo-value">{target}°</span>
          <span className="sc-thermo-mode">{cooling ? "Cooling" : "Idle"}</span>
        </div>
        <button type="button" onClick={() => setTarget(target + 1)} aria-label="Raise target temperature">
          <Plus size={17} />
        </button>
      </div>
      <p className="sc-note">
        Room is at {roomTemp}° · {cooling ? "cooling to target" : "holding at setpoint"}
      </p>
    </>
  );
}

/* ── Curtains ──────────────────────────────────────────────────────────── */

export function CurtainsPanel({
  value,
  setValue,
}: {
  value: number;
  setValue: (v: number) => void;
}) {
  return (
    <>
      <div className="sc-seg">
        {[
          { label: "Closed", v: 0 },
          { label: "Half", v: 50 },
          { label: "Open", v: 100 },
        ].map((o) => (
          <button
            key={o.label}
            type="button"
            className={value === o.v ? "is-active" : ""}
            onClick={() => setValue(o.v)}
          >
            {o.label}
          </button>
        ))}
      </div>
      <div className="sc-slider-row">
        <span>Position</span>
        <strong>{value}% open</strong>
      </div>
      <input
        className="sc-range"
        type="range"
        min={0}
        max={100}
        value={value}
        onChange={(e) => setValue(Number(e.target.value))}
        aria-label="Curtain position"
        style={{ "--fill": `${value}%` } as React.CSSProperties}
      />
    </>
  );
}

/* ── Security ──────────────────────────────────────────────────────────── */

export function SecurityPanel({
  armed,
  setArmed,
}: {
  armed: boolean;
  setArmed: (v: boolean) => void;
}) {
  return (
    <>
      <div className={`sc-arm ${armed ? "is-armed" : ""}`}>
        <span className="sc-arm-icon" aria-hidden>
          {armed ? <Lock size={19} /> : <Unlock size={19} />}
        </span>
        <div>
          <strong>{armed ? "System armed" : "System disarmed"}</strong>
          <small>
            {armed
              ? "Perimeter, motion and door sensors are live."
              : "Nothing is being monitored right now."}
          </small>
        </div>
      </div>
      <button
        type="button"
        className={`sc-btn-wide${armed ? " is-danger" : " is-primary"}`}
        onClick={() => setArmed(!armed)}
      >
        <ShieldCheck size={16} />
        {armed ? "Disarm system" : "Arm system"}
      </button>

      <ul className="sc-zones">
        {["Front gate", "Perimeter", "Ground floor", "First floor"].map((z) => (
          <li key={z}>
            <span>{z}</span>
            <em className={armed ? "is-live" : ""}>{armed ? "Monitoring" : "Off"}</em>
          </li>
        ))}
      </ul>
    </>
  );
}

/* ── Cameras ───────────────────────────────────────────────────────────── */

export function CamerasPanel() {
  return (
    <div className="sc-cams">
      {CAMERAS.map((c) => (
        <div key={c.id} className="sc-cam">
          <span className="sc-cam-live" aria-hidden>
            <i />
            LIVE
          </span>
          <span className="sc-cam-icon" aria-hidden>
            <Camera size={22} />
          </span>
          <span className="sc-cam-label">{c.label}</span>
          <small>{c.status}</small>
        </div>
      ))}
    </div>
  );
}

/* ── EV charging ───────────────────────────────────────────────────────── */

export function EvPanel({
  charge,
  charging,
  setCharging,
}: {
  charge: number;
  charging: boolean;
  setCharging: (v: boolean) => void;
}) {
  const minutes = Math.round((100 - charge) * 1.0);
  return (
    <>
      <div className="sc-ev">
        <div className="sc-ev-ring" style={{ "--pct": `${charge}%` } as React.CSSProperties}>
          <strong>{charge}%</strong>
        </div>
        <div className="sc-ev-meta">
          <strong>{charging ? "Charging" : "Paused"}</strong>
          <small>{charging ? `~${minutes} min to full` : "Cable connected, not drawing"}</small>
        </div>
      </div>
      <button
        type="button"
        className={`sc-btn-wide${charging ? " is-danger" : " is-primary"}`}
        onClick={() => setCharging(!charging)}
      >
        {charging ? "Stop charging" : "Start charging"}
      </button>
    </>
  );
}

/* ── Intercom ──────────────────────────────────────────────────────────── */

export function IntercomPanel({
  unlocked,
  setUnlocked,
}: {
  unlocked: boolean;
  setUnlocked: (v: boolean) => void;
}) {
  return (
    <>
      <div className={`sc-visor${unlocked ? " is-open" : ""}`}>
        <span className="sc-visor-icon" aria-hidden>
          <DoorOpen size={20} />
        </span>
        <div>
          <strong>{unlocked ? "Door unlocked" : "Front door locked"}</strong>
          <small>{unlocked ? "Visitor may enter. Relocks in 8s." : "Nobody at the door right now."}</small>
        </div>
      </div>
      <button
        type="button"
        className={`sc-btn-wide${unlocked ? " is-danger" : " is-primary"}`}
        onClick={() => setUnlocked(!unlocked)}
      >
        {unlocked ? "Lock again" : "Unlock door"}
      </button>
    </>
  );
}
