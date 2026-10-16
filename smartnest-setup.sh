#!/bin/bash
set -e

# SmartNest complete cinematic homepage setup
# Run from the root of your existing Next.js project.

if [ ! -f "package.json" ] || [ ! -d "app" ]; then
  echo "Please run this script from the root of your Next.js project (the folder containing package.json and app/)."
  exit 1
fi

mkdir -p app

cat > app/page.tsx <<'EOF'
"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Blinds,
  Check,
  ChevronDown,
  Lightbulb,
  Menu,
  Power,
  ShieldCheck,
  Sparkles,
  Sun,
  Thermometer,
  Zap,
} from "lucide-react";

type SceneName = "Welcome" | "Movie Night" | "Relax" | "Away" | "Custom";

const scenes = [
  { name: "Welcome" as const, symbol: "✳", subtitle: "Warm & welcoming", lights: true, brightness: 85, temperature: 23, blinds: true },
  { name: "Movie Night" as const, symbol: "◒", subtitle: "Immersive ambience", lights: true, brightness: 22, temperature: 22, blinds: false },
  { name: "Relax" as const, symbol: "☾", subtitle: "Calm & comfortable", lights: true, brightness: 38, temperature: 24, blinds: false },
  { name: "Away" as const, symbol: "↗", subtitle: "Home secured", lights: false, brightness: 0, temperature: 20, blinds: false },
];

const sceneVisuals: Record<SceneName, { tint: string; glow: string; label: string }> = {
  Welcome: { tint: "rgba(255, 173, 89, .10)", glow: "rgba(255, 174, 93, .40)", label: "Warm & welcoming" },
  "Movie Night": { tint: "rgba(0, 60, 150, .25)", glow: "rgba(0, 140, 255, .52)", label: "Immersive ambience" },
  Relax: { tint: "rgba(77, 35, 130, .18)", glow: "rgba(139, 92, 246, .42)", label: "Calm & comfortable" },
  Away: { tint: "rgba(0, 0, 0, .42)", glow: "rgba(0, 0, 0, 0)", label: "Home secured" },
  Custom: { tint: "rgba(0, 100, 190, .10)", glow: "rgba(0, 140, 255, .28)", label: "Your personal settings" },
};

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: () => void; label: string }) {
  return (
    <button type="button" role="switch" aria-checked={checked} aria-label={label} onClick={onChange}
      className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${checked ? "bg-[#008CFF]" : "bg-white/20"}`}>
      <span className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-all ${checked ? "left-6" : "left-1"}`} />
    </button>
  );
}

function SectionEyebrow({ children }: { children: React.ReactNode }) {
  return <p className="mb-4 text-[11px] font-semibold tracking-[.25em] text-[#8ACBFF]">{children}</p>;
}

export default function Home() {
  const [lightsOn, setLightsOn] = useState(true);
  const [brightness, setBrightness] = useState(75);
  const [temperature, setTemperature] = useState(23);
  const [blindsOpen, setBlindsOpen] = useState(true);
  const [activeScene, setActiveScene] = useState<SceneName>("Welcome");
  const [menuOpen, setMenuOpen] = useState(false);

  const visual = useMemo(() => sceneVisuals[activeScene], [activeScene]);

  function chooseScene(scene: (typeof scenes)[number]) {
    setActiveScene(scene.name);
    setLightsOn(scene.lights);
    setBrightness(scene.brightness);
    setTemperature(scene.temperature);
    setBlindsOpen(scene.blinds);
  }

  function markCustom() {
    setActiveScene("Custom");
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[#050609] text-white">
      {/* Navigation */}
      <header className="absolute inset-x-0 top-0 z-40">
        <nav className="mx-auto flex max-w-[1500px] items-center justify-between px-5 py-5 sm:px-8 lg:px-16">
          <a href="#top" className="flex items-center gap-2.5" aria-label="SmartNest home">
            <span className="flex h-10 w-10 items-center justify-center rounded-[14px] bg-[#008CFF] text-white shadow-lg shadow-blue-500/20">
              <Zap size={21} fill="currentColor" />
            </span>
            <span className="text-xl font-semibold tracking-[-.05em]">smart<span className="text-[#29F0C4]">nest</span></span>
          </a>

          <div className="hidden items-center gap-8 rounded-full border border-white/10 bg-black/20 px-7 py-3 text-[13px] text-white/75 backdrop-blur-xl md:flex">
            <a className="transition hover:text-white" href="#experience">Experience</a>
            <a className="transition hover:text-white" href="#solutions">Solutions</a>
            <a className="transition hover:text-white" href="#approach">Our approach</a>
          </div>

          <a href="#contact" className="hidden items-center gap-2 rounded-full bg-white px-5 py-3 text-xs font-semibold text-black transition hover:bg-[#8ACBFF] sm:flex">
            Plan your smart home <ArrowUpRight size={15} />
          </a>
          <button className="rounded-xl border border-white/15 bg-black/30 p-2.5 md:hidden" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">
            <Menu size={21} />
          </button>
        </nav>
        <AnimatePresence>
          {menuOpen && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              className="mx-4 flex flex-col gap-4 rounded-2xl border border-white/10 bg-[#090B10]/95 p-5 text-sm backdrop-blur-xl md:hidden">
              {[["Experience", "#experience"], ["Solutions", "#solutions"], ["Our approach", "#approach"], ["Contact", "#contact"]].map(([label, href]) =>
                <a key={href} href={href} onClick={() => setMenuOpen(false)}>{label}</a>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Cinematic photographic hero */}
      <section id="top" className="relative isolate flex min-h-[900px] items-center overflow-hidden pt-24 sm:min-h-[850px] lg:min-h-[900px]">
        <div className="absolute inset-0 -z-30 bg-[#090B10]" />
        <div
          className="absolute inset-0 -z-20 bg-cover bg-[center_55%] transition-transform duration-[1200ms]"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=2600&q=90')" }}
          role="img"
          aria-label="Contemporary luxury villa with expansive glass windows"
        />
        <div className="absolute inset-0 -z-10 transition-colors duration-700" style={{ backgroundColor: visual.tint }} />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#050609]/95 via-[#050609]/75 to-[#050609]/15" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-[#050609] via-transparent to-[#050609]/55" />
        <motion.div
          className="pointer-events-none absolute inset-0 -z-10"
          animate={{ opacity: lightsOn && activeScene !== "Away" ? Math.max(.15, brightness / 100) : 0 }}
          transition={{ duration: .7 }}
          style={{ background: `radial-gradient(ellipse at 75% 54%, ${visual.glow}, transparent 52%)` }}
        />

        <div className="mx-auto grid w-full max-w-[1500px] items-center gap-12 px-5 pb-20 pt-12 sm:px-8 lg:grid-cols-[minmax(0,1fr)_390px] lg:gap-14 lg:px-16 lg:pb-24 lg:pt-20">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .8 }} className="max-w-3xl">
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/25 px-4 py-2.5 text-[10px] font-medium tracking-[.18em] text-white/80 backdrop-blur-lg sm:text-[11px]">
              <span className="h-2 w-2 rounded-full bg-[#29F0C4] shadow-[0_0_12px_#29F0C4]" />
              INTELLIGENT LIVING, REIMAGINED
            </div>
            <h1 className="max-w-3xl text-[clamp(3.4rem,8vw,7.6rem)] font-medium leading-[.91] tracking-[-.075em]">
              A home that
              <br /> understands
              <br /><span className="bg-gradient-to-r from-white via-[#B7DFFF] to-[#008CFF] bg-clip-text text-transparent">your world.</span>
            </h1>
            <p className="mt-7 max-w-xl text-base leading-7 text-white/70 sm:text-lg sm:leading-8">
              Thoughtful KNX automation for lighting, climate and shading — bringing every part of your home into harmony.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <a href="#contact" className="group inline-flex items-center gap-3 rounded-full bg-[#008CFF] px-6 py-4 text-sm font-semibold shadow-xl shadow-blue-950/40 transition hover:-translate-y-0.5 hover:bg-[#167DDF]">
                Design your smart home <ArrowRight size={17} className="transition group-hover:translate-x-1" />
              </a>
              <a href="#solutions" className="inline-flex items-center gap-2 px-3 py-4 text-sm text-white/80 transition hover:text-white">
                Explore the experience <ArrowDownRight size={17} />
              </a>
            </div>
            <div className="mt-12 flex flex-wrap gap-x-7 gap-y-3 border-t border-white/20 pt-5 text-xs text-white/70">
              <span className="flex items-center gap-2"><ShieldCheck size={16} className="text-[#29F0C4]" /> KNX-based automation</span>
              <span className="flex items-center gap-2"><Sparkles size={16} className="text-[#29F0C4]" /> Designed around you</span>
            </div>
          </motion.div>

          {/* Interactive demo control card */}
          <motion.aside initial={{ opacity: 0, x: 22 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: .75, delay: .18 }}
            className="w-full max-w-md justify-self-center lg:justify-self-end" aria-label="Interactive SmartNest home controls">
            <div className="overflow-hidden rounded-[28px] border border-white/20 bg-[#080B12]/80 shadow-2xl shadow-black/40 backdrop-blur-2xl">
              <div className="flex items-center justify-between border-b border-white/10 px-5 py-5 sm:px-6">
                <div>
                  <p className="text-sm font-semibold tracking-tight">Your home</p>
                  <p className="mt-1 text-xs text-white/45">SmartNest experience</p>
                </div>
                <span className="flex items-center gap-2 rounded-full border border-[#29F0C4]/20 bg-[#29F0C4]/10 px-3 py-1.5 text-[10px] text-[#29F0C4]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#29F0C4]" /> DEMO ONLINE
                </span>
              </div>

              <div className="space-y-3 p-4 sm:p-5">
                <div className="grid grid-cols-2 gap-2">
                  {scenes.map((scene) => (
                    <button key={scene.name} onClick={() => chooseScene(scene)}
                      className={`rounded-2xl border p-3.5 text-left transition duration-200 ${activeScene === scene.name ? "border-[#008CFF]/65 bg-[#008CFF]/15 shadow-[inset_0_0_24px_rgba(0,140,255,.07)]" : "border-white/10 bg-white/[.025] hover:border-white/25 hover:bg-white/[.05]"}`}>
                      <span className={`flex h-8 w-8 items-center justify-center rounded-xl text-lg ${activeScene === scene.name ? "bg-[#008CFF]/20 text-[#8ACBFF]" : "bg-white/[.06] text-white/70"}`}>{scene.symbol}</span>
                      <span className="mt-2.5 block text-xs font-medium">{scene.name}</span>
                      <span className="mt-1 block text-[10px] text-white/40">{scene.subtitle}</span>
                    </button>
                  ))}
                </div>

                <div className={`rounded-2xl border p-4 transition-colors duration-300 ${lightsOn ? "border-[#008CFF]/30 bg-[#008CFF]/[.07]" : "border-white/10 bg-white/[.025]"}`}>
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className={`rounded-xl p-2.5 ${lightsOn ? "bg-[#008CFF]/15 text-[#8ACBFF]" : "bg-white/[.06] text-white/45"}`}><Lightbulb size={19} /></span>
                      <div><p className="text-xs font-medium">Lighting</p><p className="mt-1 text-[10px] text-white/45">{lightsOn ? `${brightness}% brightness` : "Lights switched off"}</p></div>
                    </div>
                    <Toggle checked={lightsOn} label="Toggle lights" onChange={() => { setLightsOn(!lightsOn); setActiveScene("Custom"); }} />
                  </div>
                  <div className={`mt-4 transition-opacity ${lightsOn ? "opacity-100" : "opacity-40"}`}>
                    <div className="mb-2 flex justify-between text-[10px] text-white/55"><span className="flex items-center gap-1.5"><Sun size={13} /> Brightness</span><span className="text-white">{lightsOn ? brightness : 0}%</span></div>
                    <input type="range" min="0" max="100" value={brightness} disabled={!lightsOn} aria-label="Adjust brightness"
                      onChange={(e) => { setBrightness(Number(e.target.value)); setActiveScene("Custom"); }}
                      className="h-1.5 w-full cursor-pointer accent-[#008CFF] disabled:cursor-not-allowed" />
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[.025] p-4">
                  <div className="flex items-center gap-3">
                    <span className="rounded-xl bg-[#8B5CF6]/15 p-2.5 text-[#B6A2FF]"><Thermometer size={19} /></span>
                    <div><p className="text-xs font-medium">Climate</p><p className="mt-1 text-[10px] text-white/45">Living room temperature</p></div>
                    <div className="ml-auto flex items-center gap-3">
                      <button onClick={() => { setTemperature(t => Math.max(16, t - 1)); markCustom(); }} disabled={temperature <= 16} aria-label="Decrease temperature" className="flex h-8 w-8 items-center justify-center rounded-full border border-white/15 text-lg transition hover:bg-white/10 disabled:opacity-30">−</button>
                      <span className="min-w-[48px] text-center text-2xl font-light tracking-tight">{temperature}<span className="text-sm text-white/40">°C</span></span>
                      <button onClick={() => { setTemperature(t => Math.min(30, t + 1)); markCustom(); }} disabled={temperature >= 30} aria-label="Increase temperature" className="flex h-8 w-8 items-center justify-center rounded-full border border-white/15 text-lg transition hover:bg-white/10 disabled:opacity-30">+</button>
                    </div>
                  </div>
                </div>

                <button onClick={() => { setBlindsOpen(!blindsOpen); markCustom(); }} aria-pressed={blindsOpen}
                  className="flex w-full items-center justify-between rounded-2xl border border-white/10 bg-white/[.025] p-4 text-left transition hover:border-[#29F0C4]/30 hover:bg-white/[.05]">
                  <div className="flex items-center gap-3">
                    <span className="rounded-xl bg-[#29F0C4]/10 p-2.5 text-[#29F0C4]"><Blinds size={19} /></span>
                    <div><p className="text-xs font-medium">Smart blinds</p><p className="mt-1 text-[10px] text-white/45">{blindsOpen ? "Open · Natural light" : "Closed · More privacy"}</p></div>
                  </div>
                  <span className={`rounded-full px-3 py-1.5 text-[10px] ${blindsOpen ? "bg-[#29F0C4]/10 text-[#29F0C4]" : "bg-white/10 text-white/60"}`}>{blindsOpen ? "OPEN" : "CLOSED"}</span>
                </button>

                <div className="flex items-center justify-between gap-3 border-t border-white/10 pt-3 text-[10px] text-white/40">
                  <span className="flex items-center gap-2"><Power size={13} className="text-[#29F0C4]" /> {activeScene === "Custom" ? "Custom settings" : `${activeScene} scene active`}</span>
                  <span>Website demo</span>
                </div>
              </div>
            </div>
            <p className="mt-3 text-center text-[9px] tracking-[.18em] text-white/40">A PREVIEW OF INTELLIGENT LIVING</p>
          </motion.aside>
        </div>
        <a href="#solutions" className="absolute bottom-7 left-1/2 hidden -translate-x-1/2 items-center gap-2 text-[10px] tracking-[.22em] text-white/45 transition hover:text-white/80 md:flex">
          SCROLL TO DISCOVER <ChevronDown size={14} />
        </a>
      </section>

      {/* Trust strip */}
      <section className="border-y border-white/[.08] bg-[#07090D]">
        <div className="mx-auto grid max-w-[1500px] gap-5 px-5 py-7 text-center sm:grid-cols-3 sm:px-8 lg:px-16">
          <div><p className="text-xs font-medium text-white/85">One connected experience</p><p className="mt-1 text-[11px] text-white/40">Lighting, climate and shading</p></div>
          <div><p className="text-xs font-medium text-white/85">Thoughtful by design</p><p className="mt-1 text-[11px] text-white/40">Technology that feels natural</p></div>
          <div><p className="text-xs font-medium text-white/85">Built around KNX</p><p className="mt-1 text-[11px] text-white/40">A considered foundation for automation</p></div>
        </div>
      </section>

      {/* Solutions */}
      <section id="solutions" className="mx-auto max-w-[1500px] px-5 py-24 sm:px-8 lg:px-16 lg:py-32">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div><SectionEyebrow>THE SMARTNEST EXPERIENCE</SectionEyebrow><h2 className="max-w-2xl text-4xl font-medium leading-[1.05] tracking-[-.055em] sm:text-6xl">Everything working<br /><span className="text-white/40">beautifully together.</span></h2></div>
          <p className="max-w-md text-sm leading-7 text-white/55">Technology should simplify your life, not complicate it. Bring the everyday systems of your home together in one seamless experience.</p>
        </div>
        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {[
            { n: "01", title: "Intelligent lighting", desc: "Set the mood, tune the brightness, and create scenes that move with your day.", icon: Lightbulb, tag: "ATMOSPHERE" },
            { n: "02", title: "Effortless climate", desc: "Make comfort feel instinctive with considered temperature control and scheduling.", icon: Thermometer, tag: "COMFORT" },
            { n: "03", title: "Adaptive shading", desc: "Balance daylight, privacy, and the changing rhythm of the sun.", icon: Blinds, tag: "DAYLIGHT" },
          ].map((item) => {
            const Icon = item.icon;
            return <motion.article key={item.n} whileHover={{ y: -5 }} className="group rounded-[26px] border border-white/10 bg-gradient-to-b from-white/[.045] to-white/[.015] p-7 transition-colors hover:border-[#008CFF]/40 sm:p-8">
              <div className="flex items-start justify-between"><span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#008CFF]/20 bg-[#008CFF]/10 text-[#8ACBFF]"><Icon size={22} /></span><span className="text-[10px] tracking-[.18em] text-white/35">{item.n}</span></div>
              <p className="mt-8 text-[9px] tracking-[.22em] text-[#8ACBFF]">{item.tag}</p><h3 className="mt-2 text-xl font-medium">{item.title}</h3><p className="mt-3 text-sm leading-7 text-white/50">{item.desc}</p>
              <div className="mt-7 flex items-center gap-2 text-xs text-white/55 transition group-hover:text-[#8ACBFF]">Explore solution <ArrowUpRight size={14} /></div>
            </motion.article>;
          })}
        </div>
      </section>

      {/* Approach */}
      <section id="approach" className="relative overflow-hidden border-y border-white/10 bg-[#080A0F]">
        <div className="pointer-events-none absolute -right-40 top-0 h-[500px] w-[500px] rounded-full bg-[#008CFF]/10 blur-[120px]" />
        <div className="relative mx-auto grid max-w-[1500px] items-center gap-12 px-5 py-20 sm:px-8 lg:grid-cols-2 lg:px-16 lg:py-28">
          <div>
            <SectionEyebrow>TECHNOLOGY, THOUGHTFULLY INTEGRATED</SectionEyebrow>
            <h2 className="text-4xl font-medium leading-[1.05] tracking-[-.055em] sm:text-6xl">Less managing.<br /><span className="text-white/40">More living.</span></h2>
            <p className="mt-6 max-w-lg text-sm leading-7 text-white/55">SmartNest brings intelligent automation into your home with considered design and KNX-based solutions. The aim is simple: technology that quietly supports the way you want to live.</p>
            <a href="#contact" className="mt-8 inline-flex items-center gap-2 text-sm font-medium text-[#8ACBFF] transition hover:text-white">Let's plan your space <ArrowRight size={16} /></a>
          </div>
          <div className="relative min-h-[330px] overflow-hidden rounded-[28px] border border-white/10 sm:min-h-[440px]">
            <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1500&q=85')" }} />
            <div className="absolute inset-0 bg-gradient-to-t from-[#050609]/90 via-[#050609]/10 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8"><span className="inline-flex items-center gap-2 text-[10px] tracking-[.18em] text-[#8ACBFF]"><Check size={14} /> DESIGNED AROUND YOU</span><p className="mt-3 text-2xl font-medium tracking-tight sm:text-3xl">A more intuitive way to live.</p></div>
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section id="contact" className="relative px-5 py-24 text-center sm:px-8 lg:py-32">
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#008CFF]/10 blur-[100px]" />
        <div className="relative mx-auto max-w-3xl">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-[#008CFF]/30 bg-[#008CFF]/10 text-[#8ACBFF]"><Sparkles size={23} /></span>
          <SectionEyebrow>LET'S MAKE IT PERSONAL</SectionEyebrow>
          <h2 className="text-4xl font-medium leading-[1.05] tracking-[-.055em] sm:text-6xl">Your home, in harmony.</h2>
          <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-white/55 sm:text-base">Tell us about your space and the life you want it to support. Let's explore what's possible together.</p>
          <a href="mailto:hello@smartnests.in?subject=SmartNest%20Home%20Automation%20Enquiry" className="mt-8 inline-flex items-center gap-3 rounded-full bg-[#008CFF] px-7 py-4 text-sm font-semibold transition hover:-translate-y-0.5 hover:bg-[#167DDF]">Start a conversation <ArrowRight size={17} /></a>
          <p className="mt-4 text-[10px] text-white/35">Update the email address in app/page.tsx if your business contact differs.</p>
        </div>
      </section>

      <footer className="border-t border-white/10">
        <div className="mx-auto flex max-w-[1500px] flex-col items-center justify-between gap-4 px-5 py-7 text-center sm:px-8 md:flex-row md:text-left lg:px-16">
          <a href="#top" className="text-lg font-semibold tracking-[-.05em]">smart<span className="text-[#29F0C4]">nest</span></a>
          <p className="text-xs text-white/40">Intelligent living, thoughtfully connected.</p>
          <p className="text-[10px] text-white/35">© {new Date().getFullYear()} SmartNest. All rights reserved.</p>
        </div>
      </footer>
    </main>
  );
}
EOF

cat > app/globals.css <<'EOF'
@import "tailwindcss";

:root {
  color-scheme: dark;
  --background: #050609;
  --foreground: #ffffff;
}

* {
  box-sizing: border-box;
}

html {
  scroll-behavior: smooth;
  scroll-padding-top: 24px;
}

body {
  margin: 0;
  background: var(--background);
  color: var(--foreground);
  font-family: Arial, Helvetica, sans-serif;
  -webkit-font-smoothing: antialiased;
}

::selection {
  background: rgba(0, 140, 255, 0.35);
  color: white;
}

button, input, a {
  -webkit-tap-highlight-color: transparent;
}

button {
  cursor: pointer;
}

button:focus-visible, a:focus-visible, input:focus-visible {
  outline: 2px solid #8ACBFF;
  outline-offset: 3px;
}

input[type="range"] {
  accent-color: #008CFF;
}

@media (prefers-reduced-motion: reduce) {
  html { scroll-behavior: auto; }
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
EOF

cat > app/layout.tsx <<'EOF'
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SmartNest | Intelligent Living, Reimagined",
  description:
    "Thoughtful KNX home automation for lighting, climate and shading. Discover a more intuitive way to live with SmartNest.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
EOF

echo ""
echo "Installing required packages..."
npm install motion lucide-react

echo ""
echo "SmartNest homepage files have been created."
echo "Start the website with: npm run dev"
echo "Then visit: http://localhost:3000"
