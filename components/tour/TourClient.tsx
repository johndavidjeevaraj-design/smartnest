"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useProgress } from "@react-three/drei";
import { ROOMS, TIMES, VIEWS, TOTAL_WEIGHT, indexToProgress, progressToIndex, type RoomKey, type TimeKey } from "./villa";
import { PLAN_ROOMS, type PlanRoom } from "./plan";
import FloorPlan from "./FloorPlan";

const VillaCanvas = dynamic(() => import("./VillaCanvas"), { ssr: false });

type SceneKey = "welcome" | "relax" | "movie" | "away";

const SCENES: { key: SceneKey; label: string; note: string }[] = [
  { key: "welcome", label: "Welcome", note: "Lights up, blinds open" },
  { key: "relax", label: "Relax", note: "Warm and dimmed" },
  { key: "movie", label: "Movie night", note: "Lights down" },
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

const SCENE_STATE: Record<SceneKey, { lights: Partial<Record<RoomKey, boolean>>; time: TimeKey }> = {
  welcome: { lights: { living: true, dining: true, kitchen: true, guest: true, master: true, bedroom2: true }, time: "day" },
  relax: { lights: { living: true, dining: true, master: true }, time: "dusk" },
  movie: { lights: { living: true }, time: "night" },
  away: { lights: {}, time: "night" },
};

function Loader() {
  const { progress, active } = useProgress();
  const [stuck, setStuck] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setStuck(true), 30000);
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
  const [wallOverride, setWallOverride] = useState<boolean | null>(null);
  const [scene, setScene] = useState<SceneKey | null>(null);
  const [planOpen, setPlanOpen] = useState(false);
  const [planFloor, setPlanFloor] = useState<"g" | "f">("g");
  const [activeRoom, setActiveRoom] = useState<string | null>(null);
  const [chapter, setChapter] = useState(0);
  const [intro, setIntro] = useState(false);
  const [hint, setHint] = useState(true);
  const [railP, setRailP] = useState(0);

  // The scroll state the 3D loop reads. Lives in a ref so the camera can be
  // driven every frame without re-rendering React sixty times a second.
  const journey = useRef({ i: 0 });
  const target = useRef(0);

  const [nogl] = useState(() => {
    if (typeof document === "undefined") return false;
    try {
      const c = document.createElement("canvas");
      return !(c.getContext("webgl2") || c.getContext("webgl"));
    } catch {
      return true;
    }
  });

  const cut = wallOverride ?? false;

  useEffect(() => {
    let seen = false;
    try {
      seen = sessionStorage.getItem("sn-intro") === "1";
      sessionStorage.setItem("sn-intro", "1");
    } catch {
      /* private mode */
    }
    const raf = requestAnimationFrame(() => {
      if (!seen) setIntro(true);
    });
    const t = setTimeout(() => setHint(false), 9000);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(t);
    };
  }, []);

  // Lock the page while the entry curtain is up, otherwise the journey starts
  // scrolling behind the overlay.
  useEffect(() => {
    if (typeof document === "undefined") return;
    document.body.style.overflow = intro || planOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [intro, planOpen]);

  // ── the scroll engine ──────────────────────────────────────────────────
  useEffect(() => {
    let raf = 0;

    const reduced =
      typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const maxScroll = () => Math.max(1, document.documentElement.scrollHeight - window.innerHeight);

    const read = () => {
      const p = Math.min(Math.max(window.scrollY / maxScroll(), 0), 1);
      target.current = progressToIndex(p);
    };

    let prev = performance.now();
    let lastNear = -1;
    let lastRail = 0;
    const tick = (now = performance.now()) => {
      // Exponential smoothing toward the scroll-derived index. The rate is
      // expressed per 60th of a second and converted with the real frame delta,
      // so a slow machine converges in the same wall-clock time instead of
      // crawling — frame-rate-dependent easing is how a camera gets stuck.
      const dt = Math.min((now - prev) / 1000, 0.25);
      prev = now;
      const a = reduced ? 1 : 1 - Math.pow(1 - 0.085, dt * 60);
      journey.current.i += (target.current - journey.current.i) * a;
      if (Math.abs(target.current - journey.current.i) < 0.0008) {
        journey.current.i = target.current;
      }
      const last = VIEWS.length - 1;
      if (!Number.isFinite(journey.current.i)) journey.current.i = target.current;
      journey.current.i = Math.min(Math.max(journey.current.i, 0), last);

      const near = Math.round(journey.current.i);
      if (near !== lastNear) {
        lastNear = near;
        setChapter(near);
      }
      if (now - lastRail > 90) {
        lastRail = now;
        setRailP(journey.current.i / (VIEWS.length - 1));
      }
    };

    read();
    journey.current.i = target.current;
    window.addEventListener("scroll", read, { passive: true });
    window.addEventListener("resize", read);

    // Deliberately NOT requestAnimationFrame. The timeline is UI state, and rAF
    // is throttled by whatever the WebGL loop is doing — on a weak GPU a 1.5 fps
    // scene would leave the overlays a chapter behind for eight seconds. A plain
    // 30 Hz timer keeps the interface honest; the camera still reads the same ref
    // from inside rAF, so motion stays frame-synced on machines that can draw.
    raf = window.setInterval(tick, 33);

    return () => {
      window.removeEventListener("scroll", read);
      window.removeEventListener("resize", read);
      window.clearInterval(raf);
    };
  }, []);

  const goChapter = useCallback((i: number) => {
    const top = indexToProgress(i) * Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    window.scrollTo({ top, behavior: "smooth" });
    setActiveRoom(null);
  }, []);

  // arrow keys drive the journey
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown" || e.key === "ArrowRight") {
        e.preventDefault();
        goChapter(Math.min(Math.round(journey.current.i) + 1, VIEWS.length - 1));
      }
      if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
        e.preventDefault();
        goChapter(Math.max(Math.round(journey.current.i) - 1, 0));
      }
      if (e.key.toLowerCase() === "x") setWallOverride((v) => !(v ?? false));
      if (e.key.toLowerCase() === "g") setGate((g) => !g);
      if (e.key === "Escape") setPlanOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [goChapter]);

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
    setTime(s.time);
    setScene(k);
  };

  const onPlanRoom = (r: PlanRoom) => {
    setPlanOpen(false);
    setActiveRoom(r.id);
  };

  const onCount = useMemo(() => Object.values(lights).filter(Boolean).length, [lights]);
  const view = VIEWS[Math.min(Math.max(chapter || 0, 0), VIEWS.length - 1)] ?? VIEWS[0];

  return (
    <>
      {/* the timeline: one screen per unit of scroll weight */}
      <div className="vt-space" style={{ height: `${TOTAL_WEIGHT * 100 + 100}vh` }} aria-hidden />

      <main className={`vt-root${nogl ? " is-nogl" : ""}`}>
        <div className="vt-canvas">
          <VillaCanvas
            lights={lights}
            gate={gate}
            curtains={curtains}
            time={time}
            cut={cut}
            scroll={journey}
            onPick={onPick}
          />
        </div>

        <Loader />

        {intro && (
          <div className="vt-intro">
            <div className="vt-intro-inner">
              <span className="vt-intro-kicker">SmartNest · KNX Walkthrough</span>
              <h1 className="vt-intro-title">Experience Intelligent Living.</h1>
              <p className="vt-intro-sub">
                Scroll to walk through the villa — from the street, into the garage, across
                the ground floor and up to the master suite.
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
              <span className="vt-intro-note">A simulation — no hardware is connected.</span>
            </div>
          </div>
        )}

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

        <nav className="vt-chapters" aria-label="Chapters">
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

        <div className="vt-caption" key={view.id}>
          <span className="vt-cap-n">{view.n} — {view.label}</span>
          <h1>{view.title}</h1>
          {view.blurb && <p>{view.blurb}</p>}
        </div>

        {/* scroll progress, drawn as a hairline down the side */}
        <div className="vt-rail" aria-hidden>
          <i style={{ transform: `scaleY(${Math.min(1, Math.max(0, railP))})` }} />
        </div>

        {planOpen && (
          <FloorPlan
            floor={planFloor}
            onFloor={setPlanFloor}
            selected={activeRoom}
            onSelect={onPlanRoom}
            onClose={() => setPlanOpen(false)}
          />
        )}

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
              <span>Garage door</span>
              <b>{gate ? "Open" : "Auto"}</b>
            </button>
            <button type="button" className={cut ? "is-on" : ""} onClick={() => setWallOverride(!cut)}>
              <span>X-Ray</span>
              <b>{cut ? "On" : "Off"}</b>
            </button>
            <button type="button" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
              <span>Back to start</span>
              <b>↺</b>
            </button>
          </div>
        </aside>

        {chapter >= VIEWS.length - 1 && (
          <div className="vt-cta">
            <p className="vt-cta-k">Make your home intelligent</p>
            <p className="vt-cta-l">
              Discover how SmartNest KNX automation can transform your living spaces.
            </p>
            <div className="vt-cta-actions">
              <Link href="/#contact" className="vt-cta-solid">
                Book a consultation
              </Link>
              <a
                className="vt-cta-wa"
                href={
                  "https://wa.me/916384079529?text=" +
                  encodeURIComponent(
                    "Hello SmartNest! I walked through the 3D villa and would like to know more about KNX.",
                  )
                }
                target="_blank"
                rel="noopener noreferrer"
              >
                Enquire on WhatsApp
              </a>
            </div>
          </div>
        )}

        <div className={`vt-hint ${hint ? "" : "is-gone"}`}>
          Scroll to move through the house · drag to look around
        </div>

        <div className="vt-fallback">
          Your browser can&apos;t draw 3D. The villa is best viewed in a modern browser.
        </div>
      </main>
    </>
  );
}
