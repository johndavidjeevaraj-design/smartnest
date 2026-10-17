"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useProgress } from "@react-three/drei";
import { ROOMS, TIMES, VIEWS, type RoomKey, type TimeKey } from "./villa";

const VillaCanvas = dynamic(() => import("./VillaCanvas"), { ssr: false });

function Loader() {
  const { progress, active } = useProgress();
  const [stuck, setStuck] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setStuck(true), 25000);
    return () => clearTimeout(t);
  }, []);
  if (stuck || (!active && progress >= 100)) return null;
  return (
    <div className="vt-loader">
      <div className="vt-loader-inner">
        <span className="vt-loader-k">Building the villa</span>
        <div className="vt-loader-bar">
          <i style={{ width: `${Math.max(6, progress)}%` }} />
        </div>
        <span className="vt-loader-n">{Math.round(progress)}%</span>
      </div>
    </div>
  );
}

export default function TourClient() {
  const [lights, setLights] = useState<Record<RoomKey, boolean>>({
    living: true,
    dining: false,
    kitchen: true,
    guest: false,
    master: true,
    bedroom2: false,
  });
  const [gate, setGate] = useState(false);
  const [curtains, setCurtains] = useState(true);
  const [time, setTime] = useState<TimeKey>("dusk");
  const [chapter, setChapter] = useState(0);
  const [wallOverride, setWallOverride] = useState<boolean | null>(null);
  const [hint, setHint] = useState(true);
  const [nogl] = useState(() => {
    if (typeof document === "undefined") return false;
    try {
      const c = document.createElement("canvas");
      return !(c.getContext("webgl2") || c.getContext("webgl"));
    } catch {
      return true;
    }
  });

  const view = VIEWS[chapter];
  const cut = wallOverride ?? view.cut;

  const goChapter = useCallback((i: number) => {
    setChapter((c) => (c === i ? c : i));
    setWallOverride(null);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setHint(false), 7000);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const n = Number(e.key);
      if (n >= 1 && n <= VIEWS.length) goChapter(n - 1);
      if (e.key === "ArrowRight") goChapter(Math.min(chapter + 1, VIEWS.length - 1));
      if (e.key === "ArrowLeft") goChapter(Math.max(chapter - 1, 0));
      if (e.key.toLowerCase() === "g") setGate((g) => !g);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [chapter, goChapter]);

  const onPick = useCallback((r: RoomKey) => {
    setLights((l) => ({ ...l, [r]: !l[r] }));
  }, []);

  const toggle = (r: RoomKey) => setLights((l) => ({ ...l, [r]: !l[r] }));
  const onCount = useMemo(() => Object.values(lights).filter(Boolean).length, [lights]);

  return (
    <main className={`vt-root${nogl ? " is-nogl" : ""}`}>
      <div className="vt-canvas">
        <VillaCanvas
          lights={lights}
          gate={gate}
          curtains={curtains}
          time={time}
          cut={cut}
          view={view}
          onPick={onPick}
        />
      </div>

      <Loader />

      {/* ── top bar ─────────────────────────────────────────────── */}
      <header className="vt-top">
        <Link href="/" className="vt-brand">
          <span className="vt-dot" />
          SmartNest
          <span className="vt-brand-sep">/</span>
          <span className="vt-brand-sub">Villa 01</span>
        </Link>

        <div className="vt-top-right">
          <div className="vt-seg" role="group" aria-label="Time of day">
            {(Object.keys(TIMES) as TimeKey[]).map((k) => (
              <button
                key={k}
                type="button"
                aria-pressed={time === k}
                className={time === k ? "is-on" : ""}
                onClick={() => setTime(k)}
              >
                {TIMES[k].label}
              </button>
            ))}
          </div>
          <Link href="/" className="vt-exit">
            Exit tour
          </Link>
        </div>
      </header>

      {/* ── chapters ────────────────────────────────────────────── */}
      <nav className="vt-chapters" aria-label="Tour chapters">
        {VIEWS.map((v, i) => (
          <button
            key={v.id}
            type="button"
            className={i === chapter ? "is-on" : ""}
            onClick={() => goChapter(i)}
          >
            <span className="vt-ch-n">{v.n}</span>
            <span className="vt-ch-l">{v.label}</span>
          </button>
        ))}
      </nav>

      {/* ── caption ─────────────────────────────────────────────── */}
      <div className="vt-caption" key={view.id}>
        <h1>{view.title}</h1>
        <p>{view.blurb}</p>
      </div>

      {/* ── systems panel ───────────────────────────────────────── */}
      <aside className="vt-panel">
        <div className="vt-panel-h">
          <span>Systems</span>
          <span className="vt-panel-live">
            <i className={onCount ? "is-on" : ""} />
            {onCount}/{ROOMS.length} on
          </span>
        </div>

        <ul className="vt-rooms">
          {ROOMS.map((r) => (
            <li key={r.key}>
              <button
                type="button"
                className={lights[r.key] ? "is-on" : ""}
                aria-pressed={lights[r.key]}
                onClick={() => toggle(r.key)}
              >
                <span className="vt-bulb" aria-hidden />
                <span className="vt-room-l">{r.label}</span>
                <span className="vt-room-f">{r.floor}</span>
              </button>
            </li>
          ))}
        </ul>

        <div className="vt-switches">
          <button type="button" className={gate ? "is-on" : ""} onClick={() => setGate((g) => !g)}>
            <span>Main gate</span>
            <b>{gate ? "Open" : "Closed"}</b>
          </button>
          <button
            type="button"
            className={curtains ? "is-on" : ""}
            onClick={() => setCurtains((c) => !c)}
          >
            <span>Curtains</span>
            <b>{curtains ? "Open" : "Drawn"}</b>
          </button>
          <button type="button" className={cut ? "is-on" : ""} onClick={() => setWallOverride(!cut)}>
            <span>Walls</span>
            <b>{cut ? "X-ray" : "Solid"}</b>
          </button>
        </div>
      </aside>

      {/* ── hint ────────────────────────────────────────────────── */}
      <div className={`vt-hint ${hint ? "" : "is-gone"}`}>
        Drag to walk around · click a room to switch its light · keys 1–6
      </div>

      <div className="vt-fallback">
        Your browser can&apos;t draw 3D. The control console above has the same six rooms.
      </div>
    </main>
  );
}
