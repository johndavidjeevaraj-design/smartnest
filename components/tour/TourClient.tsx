"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useProgress } from "@react-three/drei";
import { ROOMS, TIMES, VIEWS, type RoomKey, type TimeKey } from "./villa";
import { PLAN_ROOMS, type PlanRoom } from "./plan";
import FloorPlan from "./FloorPlan";

const VillaCanvas = dynamic(() => import("./VillaCanvas"), { ssr: false });

type SceneKey = "welcome" | "relax" | "movie" | "away";

const SCENES: { key: SceneKey; label: string; note: string }[] = [
  { key: "welcome", label: "Welcome", note: "Lights up, curtains open" },
  { key: "relax", label: "Relax", note: "Warm and dimmed" },
  { key: "movie", label: "Movie night", note: "Curtains shut, lights down" },
  { key: "away", label: "Away", note: "Dark, secured" },
];

const ALL_OFF: Record<RoomKey, boolean> = {
  living: false,
  dining: false,
  kitchen: false,
  guest: false,
  master: false,
  bedroom2: false,
};

const SCENE_STATE: Record<
  SceneKey,
  { lights: Partial<Record<RoomKey, boolean>>; curtains: boolean; time: TimeKey }
> = {
  welcome: { lights: { living: true, dining: true, kitchen: true, guest: true, master: true, bedroom2: true }, curtains: true, time: "day" },
  relax: { lights: { living: true, dining: true, master: true }, curtains: true, time: "dusk" },
  movie: { lights: { living: true }, curtains: false, time: "night" },
  away: { lights: {}, curtains: false, time: "night" },
};

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
  const [scene, setScene] = useState<SceneKey | null>(null);
  const [planOpen, setPlanOpen] = useState(false);
  const [planFloor, setPlanFloor] = useState<"g" | "f">("g");
  const [activeRoom, setActiveRoom] = useState<string | null>(null);
  const [resetKey, setResetKey] = useState(0);
  const [intro, setIntro] = useState(false);

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

  // The cinematic entry shows once per session, not on every internal click.
  useEffect(() => {
    try {
      if (!sessionStorage.getItem("sn-intro")) {
        setIntro(true);
        sessionStorage.setItem("sn-intro", "1");
      }
    } catch {
      /* private mode — skip the intro */
    }
    const t = setTimeout(() => setHint(false), 8000);
    return () => clearTimeout(t);
  }, []);

  const goChapter = useCallback((i: number) => {
    setChapter((c) => (c === i ? c : i));
    setWallOverride(null);
    setActiveRoom(null);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const n = Number(e.key);
      if (n >= 1 && n <= VIEWS.length) goChapter(n - 1);
      if (e.key === "ArrowRight") goChapter(Math.min(chapter + 1, VIEWS.length - 1));
      if (e.key === "ArrowLeft") goChapter(Math.max(chapter - 1, 0));
      if (e.key.toLowerCase() === "g") setGate((g) => !g);
      if (e.key.toLowerCase() === "x") setWallOverride(!cut);
      if (e.key === "Escape") setPlanOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [chapter, goChapter, cut]);

  const onPick = useCallback((r: RoomKey) => {
    setLights((l) => ({ ...l, [r]: !l[r] }));
    setScene(null);
  }, []);

  const toggle = (r: RoomKey) => {
    setLights((l) => ({ ...l, [r]: !l[r] }));
    setScene(null);
  };

  const applyScene = (k: SceneKey) => {
    const s = SCENE_STATE[k];
    const next = { ...ALL_OFF };
    for (const room of Object.keys(s.lights) as RoomKey[]) next[room] = true;
    setLights(next);
    setCurtains(s.curtains);
    setTime(s.time);
    setScene(k);
  };

  const onPlanRoom = (r: PlanRoom) => {
    setPlanOpen(false);
    setActiveRoom(r.id);
    setWallOverride(true);
    goChapter(r.chapter);
    setActiveRoom(r.id);
  };

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
          resetKey={resetKey}
          onPick={onPick}
        />
      </div>

      <Loader />

      {/* ── cinematic entry ─────────────────────────────────────── */}
      {intro && (
        <div className="vt-intro">
          <div className="vt-intro-inner">
            <span className="vt-intro-kicker">SmartNest · KNX Walkthrough</span>
            <h1 className="vt-intro-title">
              Experience Intelligent Living.
            </h1>
            <p className="vt-intro-sub">
              Explore your 3 BHK SmartNest villa — every room, every device,
              answering as you touch it.
            </p>
            <div className="vt-intro-actions">
              <button type="button" className="vt-intro-primary" onClick={() => setIntro(false)}>
                Explore the villa
              </button>
              <button
                type="button"
                className="vt-intro-ghost"
                onClick={() => {
                  setIntro(false);
                  setPlanOpen(true);
                }}
              >
                View floor plan
              </button>
            </div>
            <span className="vt-intro-note">
              A simulation — no hardware is connected.
            </span>
          </div>
        </div>
      )}

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
          <button
            type="button"
            className={`vt-plan-btn${planOpen ? " is-on" : ""}`}
            onClick={() => setPlanOpen((p) => !p)}
          >
            Floor plan
          </button>
          <Link href="/" className="vt-exit">
            Exit
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
      <div className="vt-caption" key={activeRoom ?? view.id}>
        <h1>{view.title}</h1>
        <p>{view.blurb}</p>
      </div>

      {/* ── floor plan ──────────────────────────────────────────── */}
      {planOpen && (
        <FloorPlan
          floor={planFloor}
          onFloor={setPlanFloor}
          selected={activeRoom}
          onSelect={onPlanRoom}
          onClose={() => setPlanOpen(false)}
        />
      )}

      {/* ── systems panel ───────────────────────────────────────── */}
      <aside className="vt-panel">
        <div className="vt-panel-h">
          <span>Devices</span>
          <span className="vt-panel-live">
            <i className={onCount ? "is-on" : ""} />
            {onCount}/{ROOMS.length} on
          </span>
        </div>

        <div className="vt-scenes" role="group" aria-label="Scenes">
          {SCENES.map((s) => (
            <button
              key={s.key}
              type="button"
              title={s.note}
              className={scene === s.key ? "is-on" : ""}
              aria-pressed={scene === s.key}
              onClick={() => applyScene(s.key)}
            >
              {s.label}
            </button>
          ))}
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
            <span>X-Ray</span>
            <b>{cut ? "On" : "Off"}</b>
          </button>
          <button type="button" onClick={() => setResetKey((k) => k + 1)}>
            <span>Reset view</span>
            <b>↺</b>
          </button>
        </div>

        {activeRoom && (
          <p className="vt-panel-note">
            {PLAN_ROOMS.find((r) => r.id === activeRoom)?.label} selected.
          </p>
        )}
      </aside>

      <div className={`vt-hint ${hint ? "" : "is-gone"}`}>
        Drag to look around · click a room to switch its light · keys 1–6
      </div>

      <div className="vt-fallback">
        Your browser can&apos;t draw 3D. The villa is best viewed in a modern browser.
      </div>
    </main>
  );
}
