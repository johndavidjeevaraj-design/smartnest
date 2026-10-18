"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ROOMS, TIMES, VIEWS, TOTAL_WEIGHT, indexToProgress, progressToIndex, type RoomKey, type TimeKey } from "./villa";
import type { PlanRoom } from "./plan";
import type Lenis from "lenis";
import FloorPlan from "./FloorPlan";

const VillaCanvas = dynamic(() => import("./VillaCanvas"), { ssr: false });

type SceneKey = "welcome" | "relax" | "movie" | "away";

const SCENES: { key: SceneKey; label: string; note: string }[] = [
  { key: "welcome", label: "Welcome", note: "Lighting on, blinds open" },
  { key: "relax", label: "Relax", note: "Warm evening lighting" },
  { key: "movie", label: "Movie night", note: "Living room on, blinds closed" },
  { key: "away", label: "Away", note: "Lights off, blinds closed" },
];

const ALL_OFF: Record<RoomKey, boolean> = {
  living: false,
  dining: false,
  kitchen: false,
  foyer: false,
  bath: false,
  master: false,
  bed2: false,
  bed3: false,
  landing: false,
};

const SCENE_STATE: Record<SceneKey, { lights: Partial<Record<RoomKey, boolean>>; time: TimeKey; curtains: boolean; brightness: number }> = {
  welcome: {
    lights: { living: true, dining: true, kitchen: true, foyer: true, master: true, bed2: true, bed3: true, landing: true },
    time: "day",
    curtains: false,
    brightness: 88,
  },
  relax: { lights: { living: true, dining: true, master: true, bed3: true }, time: "dusk", curtains: true, brightness: 42 },
  movie: { lights: { living: true }, time: "night", curtains: true, brightness: 16 },
  away: { lights: {}, time: "night", curtains: true, brightness: 28 },
};

function Loader({ ready }: { ready: boolean }) {
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    if (!ready) {
      const fallback = window.setTimeout(() => setVisible(false), 12000);
      return () => window.clearTimeout(fallback);
    }
    const hide = window.setTimeout(() => setVisible(false), 520);
    return () => window.clearTimeout(hide);
  }, [ready]);
  if (!visible) return null;
  return (
    <div className={`vt-loader${ready ? " is-leaving" : ""}`} aria-live="polite">
      <div className="vt-loader-inner">
        <span className="vt-loader-k">{ready ? "Villa ready" : "Preparing 3D villa"}</span>
        <div className="vt-loader-bar"><i /></div>
        <span className="vt-loader-n">{ready ? "READY" : "3D"}</span>
      </div>
    </div>
  );
}

export default function TourClient() {
  const [lights, setLights] = useState<Record<RoomKey, boolean>>({
    living: true,
    dining: false,
    kitchen: true,
    foyer: false,
    bath: false,
    master: true,
    bed2: false,
    bed3: false,
    landing: false,
  });
  const [brightness, setBrightness] = useState(72);
  const [doorOpen, setDoorOpen] = useState(false);
  const [curtains, setCurtains] = useState(true);
  const [time, setTime] = useState<TimeKey>("dusk");
  const [wallOverride, setWallOverride] = useState<boolean | null>(null);
  const [scene, setScene] = useState<SceneKey | null>(null);
  const [planOpen, setPlanOpen] = useState(false);
  const [planFloor, setPlanFloor] = useState<"g" | "f">("g");
  const [activeRoom, setActiveRoom] = useState<string | null>(null);
  const [chapter, setChapter] = useState(0);
  const [intro, setIntro] = useState(false);
  const [canvasReady, setCanvasReady] = useState(false);
  const [hint, setHint] = useState(true);
  const [railP, setRailP] = useState(0);

  // The scroll state the 3D loop reads. Lives in a ref so the camera can be
  // driven every frame without re-rendering React sixty times a second.
  const journey = useRef({ i: 0 });
  const target = useRef(0);
  const lenisRef = useRef<Lenis | null>(null);

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
  const markCanvasReady = useCallback(() => setCanvasReady(true), []);

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

  // ── smooth scroll + scroll-linked camera ───────────────────────────────
  useEffect(() => {
    let disposed = false;
    let disposeEngine: (() => void) | null = null;

    const setup = async () => {
      const [{ default: LenisEngine }, { gsap }, { ScrollTrigger }] = await Promise.all([
        import("lenis"),
        import("gsap"),
        import("gsap/ScrollTrigger"),
      ]);
      if (disposed) return;

      gsap.registerPlugin(ScrollTrigger);
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const lenis = new LenisEngine({
        autoRaf: false,
        lerp: reduced ? 1 : 0.085,
        duration: reduced ? 0 : 1.05,
        smoothWheel: !reduced,
        syncTouch: !reduced,
        wheelMultiplier: 0.9,
        touchMultiplier: 1.15,
      });
      lenisRef.current = lenis;

      const updateTarget = (progress: number) => {
        target.current = progressToIndex(Math.min(Math.max(progress, 0), 1));
      };
      const initialMax = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      updateTarget(window.scrollY / initialMax);
      journey.current.i = target.current;

      let prev = performance.now();
      let lastNear = -1;
      let lastRail = 0;
      const tick = (now = performance.now()) => {
        const dt = Math.min((now - prev) / 1000, 0.25);
        prev = now;
        // Lenis supplies the wheel/touch easing; this small camera settle keeps
        // the 3D rig feeling weighted without doubling the scroll duration.
        const a = reduced ? 1 : 1 - Math.pow(1 - 0.14, dt * 60);
        journey.current.i += (target.current - journey.current.i) * a;
        if (Math.abs(target.current - journey.current.i) < 0.0008) journey.current.i = target.current;
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

      const scrollTrigger = ScrollTrigger.create({
        start: 0,
        end: "max",
        onUpdate: (self) => updateTarget(self.progress),
        onRefresh: (self) => updateTarget(self.progress),
      });
      const onLenisScroll = () => ScrollTrigger.update();
      lenis.on("scroll", onLenisScroll);
      const onGsapTick = (time: number) => lenis.raf(time * 1000);
      gsap.ticker.lagSmoothing(0);
      gsap.ticker.add(onGsapTick);
      ScrollTrigger.refresh();
      scrollTrigger.update();

      const uiTimer = window.setInterval(tick, 33);
      disposeEngine = () => {
        window.clearInterval(uiTimer);
        scrollTrigger.kill();
        lenis.off("scroll", onLenisScroll);
        lenis.destroy();
        gsap.ticker.remove(onGsapTick);
        gsap.ticker.lagSmoothing(500, 33);
        if (lenisRef.current === lenis) lenisRef.current = null;
      };
    };

    void setup();
    return () => {
      disposed = true;
      disposeEngine?.();
    };
  }, []);

  /** Chapter jumps use Lenis' own cancellable easing, with a native fallback
   * only for the brief window before the async scroll engine is ready. */
  const smoothTo = useCallback((top: number) => {
    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (lenisRef.current) {
      lenisRef.current.scrollTo(top, {
        immediate: reduced,
        duration: reduced ? 0 : 1.05,
        easing: (t) => 1 - Math.pow(1 - t, 4),
      });
    } else {
      window.scrollTo(0, top);
    }
  }, []);

  const goChapter = useCallback(
    (i: number) => {
      const top =
        indexToProgress(i) * Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      smoothTo(top);
      setActiveRoom(null);
    },
    [smoothTo],
  );

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
      if (e.key.toLowerCase() === "g") setDoorOpen((g) => !g);
      if (e.key === "Escape") setPlanOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [goChapter]);

  const onPick = useCallback((r: RoomKey) => {
    setActiveRoom(r);
    setLights((l) => ({ ...l, [r]: !l[r] }));
    setScene(null);
  }, []);

  const toggle = (r: RoomKey) => {
    setActiveRoom(r);
    setLights((l) => ({ ...l, [r]: !l[r] }));
    setScene(null);
  };

  const applyScene = (k: SceneKey) => {
    const s = SCENE_STATE[k];
    const next = { ...ALL_OFF };
    for (const room of Object.keys(s.lights) as RoomKey[]) next[room] = true;
    setLights(next);
    setBrightness(s.brightness);
    setTime(s.time);
    setCurtains(s.curtains);
    setDoorOpen(false);
    setScene(k);
  };

  const onPlanRoom = (r: PlanRoom) => {
    setPlanOpen(false);
    setActiveRoom(r.id);
    goChapter(r.chapter);
  };

  const onCount = useMemo(() => Object.values(lights).filter(Boolean).length, [lights]);
  const activeZone = ROOMS.find((r) => r.key === activeRoom) ?? null;
  const groundActive = chapter >= 2 && chapter <= 6;
  const firstActive = chapter >= 7 && chapter <= 8;
  const view = VIEWS[Math.min(Math.max(chapter || 0, 0), VIEWS.length - 1)] ?? VIEWS[0];

  return (
    <>
      {/* the timeline: one screen per unit of scroll weight */}
      <div className="vt-space" style={{ height: `${TOTAL_WEIGHT * 100 + 100}vh` }} aria-hidden />

      <main className={`vt-root${nogl ? " is-nogl" : ""}`}>
        <div className="vt-canvas">
          <VillaCanvas
            lights={lights}
            brightness={brightness}
            doorOpen={doorOpen}
            curtains={curtains}
            time={time}
            cut={cut}
            scroll={journey}
            onPick={onPick}
            onReady={markCanvasReady}
          />
        </div>

        <Loader ready={canvasReady || nogl} />

        {intro && (
          <div className="vt-intro">
            <div className="vt-intro-inner">
              <span className="vt-intro-kicker">SmartNest · KNX Home Experience</span>
              <h1 className="vt-intro-title">Welcome to a home that responds.</h1>
              <p className="vt-intro-sub">
                Move through a connected 3BHK villa. Explore the rooms, then see how lighting,
                motorised blinds and comfort scenes work together through KNX.
              </p>
              <div className="vt-intro-actions">
                <button type="button" className="vt-intro-primary" onClick={() => setIntro(false)}>
                  Enter the experience
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
              <div className="vt-intro-cue" aria-hidden="true"><i /> Enter, then scroll or drag to explore</div>
              <span className="vt-intro-note">KNX HOME · 3 BEDROOMS · 2 FLOORS · INTERACTIVE SIMULATION</span>
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
            <div className="vt-floor-switch" role="group" aria-label="Choose a floor">
              <button type="button" className={groundActive ? "is-on" : ""} aria-pressed={groundActive} onClick={() => goChapter(3)}>
                Ground
              </button>
              <button type="button" className={firstActive ? "is-on" : ""} aria-pressed={firstActive} onClick={() => goChapter(7)}>
                First
              </button>
            </div>
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
            <div className="vt-panel-title">
              <span className="vt-panel-kicker">SMARTNEST · KNX</span>
              <strong>Home controls</strong>
            </div>
            <span className="vt-panel-live">
              <i className="is-on" />
              SIMULATION
            </span>
          </div>
          <div className="vt-panel-metric">
            <span>Lighting zones</span>
            <b>{onCount} <i>/ {ROOMS.length} active</i></b>
          </div>
          {activeZone && (
            <div className="vt-active-zone" aria-live="polite">
              <span>Selected room</span>
              <strong>{activeZone.label}</strong>
              <i>{activeZone.floor === "Ground" ? "GROUND FLOOR" : "FIRST FLOOR"}</i>
            </div>
          )}

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

          <div className="vt-dimmer">
            <div className="vt-dimmer-label">
              <span>Light level</span>
              <b>{brightness}%</b>
            </div>
            <input
              type="range"
              min="10"
              max="100"
              value={brightness}
              aria-label="Lighting brightness"
              style={{ background: `linear-gradient(90deg, var(--vt-green) ${brightness}%, rgba(255,255,255,.12) ${brightness}%)` }}
              onChange={(e) => {
                setBrightness(Number(e.currentTarget.value));
                setScene(null);
              }}
            />
          </div>

          <ul className="vt-rooms">
            {ROOMS.map((r) => (
              <li key={r.key}>
                <button
                  type="button"
                  className={`${lights[r.key] ? "is-on" : ""}${activeRoom === r.key ? " is-selected" : ""}`}
                  aria-pressed={lights[r.key]}
                  aria-current={activeRoom === r.key ? "location" : undefined}
                  onClick={() => toggle(r.key)}
                >
                  <span className="vt-bulb" aria-hidden />
                  <span className="vt-room-l">{r.label}</span>
                  <span className="vt-room-f">{r.floor}</span>
                </button>
              </li>
            ))}
          </ul>

          <div className="vt-automation">
            <p className="vt-group-title">Automation</p>
            <button
              type="button"
              className="vt-device-control"
              aria-pressed={!curtains}
              onClick={() => {
                setCurtains((closed) => !closed);
                setScene(null);
              }}
            >
              <span className="vt-device-icon" aria-hidden="true">⌁</span>
              <span className="vt-device-copy">
                <strong>Motorised blinds</strong>
                <small>{curtains ? "Closed · whole home" : "Open · whole home"}</small>
              </span>
              <span className={`vt-toggle ${curtains ? "" : "is-on"}`} aria-hidden="true"><i /></span>
            </button>
            <button
              type="button"
              className={`vt-device-control ${doorOpen ? "is-on" : ""}`}
              aria-pressed={doorOpen}
              onClick={() => setDoorOpen((open) => !open)}
            >
              <span className="vt-device-icon" aria-hidden="true">↗</span>
              <span className="vt-device-copy">
                <strong>Front door</strong>
                <small>{doorOpen ? "Open override" : "Presence · automatic"}</small>
              </span>
              <span className="vt-device-state">{doorOpen ? "OPEN" : "AUTO"}</span>
            </button>
          </div>

          <div className="vt-switches">
            <button type="button" className={cut ? "is-on" : ""} onClick={() => setWallOverride(!cut)}>
              <span>Wall cutaway</span>
              <b>{cut ? "On" : "Off"}</b>
            </button>
            <button type="button" onClick={() => smoothTo(0)}>
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
