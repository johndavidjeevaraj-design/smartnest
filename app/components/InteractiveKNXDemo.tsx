"use client";

import { useState } from "react";

const rooms = ["Living Room", "Bedroom", "Kitchen", "Garden"] as const;
type Room = (typeof rooms)[number];

const roomLights: Record<Room, string[]> = {
  "Living Room": ["Ceiling Lights", "Ambient Lights", "Accent Lights"],
  Bedroom: ["Main Light", "Bedside Lights", "Wardrobe Lights"],
  Kitchen: ["Ceiling Lights", "Counter Lights"],
  Garden: ["Garden Lights", "Pathway Lights", "Entrance Lights"],
};

export default function InteractiveKNXDemo() {
  const [room, setRoom] = useState<Room>("Living Room");
  const [lights, setLights] = useState<Record<string, boolean>>({
    "Living Room-Ceiling Lights": true,
    "Living Room-Ambient Lights": false,
    "Living Room-Accent Lights": false,
  });
  const [brightness, setBrightness] = useState(75);
  const [curtains, setCurtains] = useState(false);
  const [climate, setClimate] = useState(true);
  const [security, setSecurity] = useState(true);
  const [activeStep, setActiveStep] = useState(0);

  const isOn = (name: string) => lights[`${room}-${name}`] ?? false;
  const roomIsOn = roomLights[room].some(isOn);
  const totalOn = Object.values(lights).filter(Boolean).length;

  function toggleLight(name: string) {
    setLights((current) => ({
      ...current,
      [`${room}-${name}`]: !current[`${room}-${name}`],
    }));
    setActiveStep(1);
  }

  function setAll(value: boolean) {
    setLights((current) => {
      const next = { ...current };
      Object.values(roomLights).flat().forEach((name) => {
        Object.keys(roomLights).forEach((roomName) => {
          next[`${roomName}-${name}`] = value;
        });
      });
      return next;
    });
    setActiveStep(1);
  }

  return (
    <section id="knx-demo" className="mx-auto w-full max-w-7xl px-4 py-16 text-white sm:px-6">
      <div className="mb-8">
        <p className="mb-3 text-xs font-semibold tracking-[0.3em] text-[#1687ff]">
          SMARTNEST · LIVE SIMULATION
        </p>
        <h2 className="text-3xl font-semibold tracking-tight sm:text-5xl">
          Experience KNX lighting.
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-white/60 sm:text-base">
          Select a room, control individual lights and adjust brightness.
          Explore how a smart home responds to a single touch.
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.35fr_0.85fr]">
        <div className="overflow-hidden rounded-3xl border border-white/10 bg-[#11151a]">
          <div className="flex items-center justify-between gap-3 border-b border-white/10 px-5 py-4">
            <div>
              <p className="text-xs tracking-widest text-white/45">PROPERTY VIEW</p>
              <p className="mt-1 font-medium">{room}</p>
            </div>
            <span className="rounded-full border border-[#1687ff]/30 px-3 py-1 text-xs text-[#1687ff]">
              {roomIsOn ? "LIGHTS ACTIVE" : "LIGHTS OFF"}
            </span>
          </div>

          <div className="relative overflow-hidden bg-[#171c22]">
            <img
              src="/images/smartnest-villa.png"
              alt="Modern SmartNest villa"
              className="block aspect-[4/3] w-full object-cover"
              style={{
                filter: roomIsOn
                  ? `brightness(${0.82 + brightness / 300}) saturate(${1 + brightness / 200})`
                  : "brightness(0.58) saturate(0.82)",
                transition: "filter 400ms ease",
              }}
            />

            <div
              className="pointer-events-none absolute inset-0 transition-opacity duration-500"
              style={{
                opacity: roomIsOn ? brightness / 100 : 0,
                background:
                  "radial-gradient(ellipse at 55% 42%, rgba(255,207,126,.32), transparent 42%), linear-gradient(0deg, rgba(255,177,79,.12), transparent 65%)",
                mixBlendMode: "screen",
              }}
            />

            <div className="absolute left-4 top-4 rounded-xl border border-white/15 bg-black/45 px-3 py-2 backdrop-blur-md">
              <p className="text-[10px] tracking-widest text-white/55">SIMULATED STATUS</p>
              <p className="mt-1 text-sm font-medium">
                {roomIsOn ? `Lighting · ${brightness}%` : "All selected lights off"}
              </p>
            </div>

            <div className="absolute bottom-4 left-4 right-4 rounded-xl border border-white/10 bg-black/50 p-3 backdrop-blur-md">
              <p className="text-xs leading-5 text-white/75">
                Demo only: the photograph responds visually to your controls.
                Real KNX equipment is not connected.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 p-4 sm:grid-cols-4">
            {rooms.map((item) => (
              <button
                key={item}
                onClick={() => setRoom(item)}
                className={`rounded-xl border px-3 py-3 text-sm transition ${
                  room === item
                    ? "border-[#1687ff]/60 bg-[#1687ff]/10 text-[#1687ff]"
                    : "border-white/10 bg-white/[0.03] text-white/65 hover:bg-white/[0.07]"
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-5">
          <div className="rounded-3xl border border-white/10 bg-[#11151a] p-5 sm:p-6">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-xs tracking-widest text-white/45">TOUCH PANEL</p>
                <h3 className="mt-1 text-xl font-semibold">{room}</h3>
              </div>
              <span className="text-xs text-[#1687ff]">{roomLights[room].filter(isOn).length} active</span>
            </div>

            <div className="space-y-2">
              {roomLights[room].map((name) => (
                <button
                  key={name}
                  onClick={() => toggleLight(name)}
                  aria-pressed={isOn(name)}
                  className={`flex w-full items-center justify-between rounded-xl border p-4 text-left transition ${
                    isOn(name)
                      ? "border-[#1687ff]/40 bg-[#1687ff]/[0.08]"
                      : "border-white/10 bg-white/[0.025] hover:bg-white/[0.06]"
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <span className={`flex h-10 w-10 items-center justify-center rounded-xl text-lg ${
                      isOn(name) ? "bg-[#1687ff]/15" : "bg-white/[0.06]"
                    }`}>
                      {isOn(name) ? "☀" : "○"}
                    </span>
                    <span>
                      <span className="block text-sm font-medium">{name}</span>
                      <span className="mt-1 block text-xs text-white/45">
                        {isOn(name) ? `On · ${brightness}% brightness` : "Off"}
                      </span>
                    </span>
                  </span>
                  <span className={`h-6 w-11 rounded-full p-1 transition ${
                    isOn(name) ? "bg-[#1687ff]" : "bg-white/15"
                  }`}>
                    <span className={`block h-4 w-4 rounded-full transition ${
                      isOn(name) ? "translate-x-5 bg-[#07100e]" : "bg-white/80"
                    }`} />
                  </span>
                </button>
              ))}
            </div>

            <div className="mt-6 rounded-xl bg-white/[0.035] p-4">
              <div className="mb-3 flex items-center justify-between">
                <label htmlFor="knx-brightness" className="text-sm text-white/75">
                  Brightness
                </label>
                <span className="font-semibold text-[#1687ff]">{brightness}%</span>
              </div>
              <input
                id="knx-brightness"
                type="range"
                min="10"
                max="100"
                value={brightness}
                onChange={(event) => setBrightness(Number(event.target.value))}
                className="w-full accent-[#1687ff]"
              />
              <div className="mt-2 flex justify-between text-xs text-white/35">
                <span>Dim</span><span>Bright</span>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <button
                onClick={() => setAll(true)}
                className="rounded-xl bg-[#1687ff] px-3 py-3 text-sm font-semibold text-[#06100d] transition hover:brightness-110"
              >
                Master ON
              </button>
              <button
                onClick={() => setAll(false)}
                className="rounded-xl border border-white/15 px-3 py-3 text-sm font-semibold transition hover:bg-white/[0.06]"
              >
                Master OFF
              </button>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-[#11151a] p-5">
            <p className="text-xs tracking-widest text-white/45">MORE SMART CONTROLS</p>
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3 lg:grid-cols-1">
              <button onClick={() => setCurtains(!curtains)} className="flex items-center justify-between rounded-xl border border-white/10 p-3 text-sm">
                <span>Curtains</span><span className={curtains ? "text-[#1687ff]" : "text-white/45"}>{curtains ? "Closed" : "Open"}</span>
              </button>
              <button onClick={() => setClimate(!climate)} className="flex items-center justify-between rounded-xl border border-white/10 p-3 text-sm">
                <span>Climate system</span><span className={climate ? "text-[#1687ff]" : "text-white/45"}>{climate ? "On" : "Off"}</span>
              </button>
              <button onClick={() => setSecurity(!security)} className="flex items-center justify-between rounded-xl border border-white/10 p-3 text-sm">
                <span>Security mode</span><span className={security ? "text-[#1687ff]" : "text-white/45"}>{security ? "Armed" : "Disarmed"}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-3xl border border-white/10 bg-[#11151a] p-5 sm:p-7">
        <p className="text-xs tracking-widest text-white/45">HOW KNX LIGHTING WORKS</p>
        <h3 className="mt-2 text-2xl font-semibold">One touch. A coordinated response.</h3>
        <div className="mt-6 grid gap-3 sm:grid-cols-4">
          {[
            ["01", "Touch switch", "You tap a light control."],
            ["02", "KNX bus", "The command travels across the KNX bus."],
            ["03", "Actuator", "The configured actuator switches or dims the circuit."],
            ["04", "Room light", "The light responds to the command."],
          ].map(([number, title, description], index) => (
            <button
              key={number}
              onClick={() => setActiveStep(index)}
              className={`rounded-2xl border p-4 text-left transition ${
                activeStep === index
                  ? "border-[#1687ff]/50 bg-[#1687ff]/[0.07]"
                  : "border-white/10 bg-white/[0.02]"
              }`}
            >
              <span className="text-xs text-[#1687ff]">{number} / STEP</span>
              <p className="mt-3 font-semibold">{title}</p>
              <p className="mt-2 text-sm leading-5 text-white/50">{description}</p>
            </button>
          ))}
        </div>
        <p className="mt-5 text-sm leading-6 text-white/55">
          {activeStep === 0 && "The user selects a light on the simulated touch panel."}
          {activeStep === 1 && "In a real KNX installation, a configured command is sent over the KNX bus to the relevant group address."}
          {activeStep === 2 && "The configured switching or dimming actuator operates the connected lighting circuit."}
          {activeStep === 3 && "The light changes state. Depending on the installation, status feedback can also be shown on the panel."}
        </p>
        <p className="mt-4 border-t border-white/10 pt-4 text-xs leading-5 text-white/40">
          Interactive browser simulation only. This demo does not communicate with a physical KNX installation.
        </p>
      </div>

      <p className="mt-4 text-sm text-white/45">
        Demo activity: {totalOn} simulated light(s) on across the villa.
      </p>
    </section>
  );
}
