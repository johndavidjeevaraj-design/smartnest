
"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import {
  Activity,
  Blinds,
  Lightbulb,
  Mic,
  MicOff,
  Moon,
  Plane,
  RotateCcw,
  ShieldCheck,
  Thermometer,
  Volume2,
} from "lucide-react";
import type { BriefcaseMode } from "./SmartNestBriefcaseScene";

const BriefcaseScene = dynamic(
  () => import("./SmartNestBriefcaseScene"),
  {
    ssr: false,
    loading: () => <div className="snkb-loading">Preparing 3D demonstration…</div>,
  }
);

const COLORS = [
  "#ff3030", "#ff7028", "#ffd52a", "#1687ff",
  "#1687ff", "#28cfff", "#3678ff", "#743bff",
  "#bd35ff", "#ff38b9", "#ff4c76", "#ffffff",
];

interface RecognitionResult {
  transcript: string;
}

interface RecognitionEvent {
  results: ArrayLike<ArrayLike<RecognitionResult>>;
}

interface Recognition {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((event: RecognitionEvent) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
}

type SpeechWindow = Window & {
  SpeechRecognition?: new () => Recognition;
  webkitSpeechRecognition?: new () => Recognition;
};

export default function SmartNestKNXBriefcase() {
  const [lightsOn, setLightsOn] = useState(true);
  const [curtainsOpen, setCurtainsOpen] = useState(true);
  const [temperature, setTemperature] = useState(23);
  const [securityArmed, setSecurityArmed] = useState(false);
  const [rgbColor, setRgbColor] = useState("#1687ff");
  const [mode, setMode] = useState<BriefcaseMode>("HOME");
  const [voiceStatus, setVoiceStatus] = useState("Ready for a command");
  const [listening, setListening] = useState(false);

  function applyScene(scene: "HOME" | "AWAY" | "NIGHT") {
    setMode(scene);

    if (scene === "HOME") {
      setLightsOn(true);
      setCurtainsOpen(true);
      setTemperature(23);
      setSecurityArmed(false);
      setRgbColor("#1687ff");
    }

    if (scene === "AWAY") {
      setLightsOn(false);
      setCurtainsOpen(false);
      setTemperature(20);
      setSecurityArmed(true);
    }

    if (scene === "NIGHT") {
      setLightsOn(true);
      setCurtainsOpen(false);
      setTemperature(22);
      setSecurityArmed(true);
    }
  }

  function handleVoiceCommand(command: string) {
    const text = command.toLowerCase();

    if (text.includes("night scene") || text.includes("good night")) {
      applyScene("NIGHT");
      setVoiceStatus("Night scene activated");
    } else if (text.includes("away scene") || text.includes("leaving")) {
      applyScene("AWAY");
      setVoiceStatus("Away scene activated");
    } else if (text.includes("home scene") || text.includes("welcome home")) {
      applyScene("HOME");
      setVoiceStatus("Home scene activated");
    } else if (text.includes("light") && (text.includes("off") || text.includes("turn off"))) {
      setLightsOn(false);
      setMode("CUSTOM");
      setVoiceStatus("Lights switched off");
    } else if (text.includes("light") && (text.includes("on") || text.includes("turn on"))) {
      setLightsOn(true);
      setMode("CUSTOM");
      setVoiceStatus("Lights switched on");
    } else if (text.includes("curtain") && (text.includes("close") || text.includes("shut"))) {
      setCurtainsOpen(false);
      setMode("CUSTOM");
      setVoiceStatus("Curtains closed");
    } else if (text.includes("curtain") && (text.includes("open"))) {
      setCurtainsOpen(true);
      setMode("CUSTOM");
      setVoiceStatus("Curtains opened");
    } else if (text.includes("arm") || text.includes("secure")) {
      setSecurityArmed(true);
      setMode("CUSTOM");
      setVoiceStatus("Security armed");
    } else if (text.includes("disarm")) {
      setSecurityArmed(false);
      setMode("CUSTOM");
      setVoiceStatus("Security disarmed");
    } else {
      setVoiceStatus(`Command not recognised: "${command}"`);
    }
  }

  function startVoiceControl() {
    if (typeof window === "undefined") return;

    const browser = window as SpeechWindow;
    const RecognitionConstructor =
      browser.SpeechRecognition || browser.webkitSpeechRecognition;

    if (!RecognitionConstructor) {
      setVoiceStatus("Speech recognition isn't supported in this browser. Try Chrome.");
      return;
    }

    const recognition = new RecognitionConstructor();
    recognition.lang = "en-IN";
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onresult = (event) => {
      const command = event.results[0]?.[0]?.transcript ?? "";
      if (command) handleVoiceCommand(command);
    };

    recognition.onerror = () => {
      setVoiceStatus("Microphone unavailable or permission denied");
      setListening(false);
    };

    recognition.onend = () => setListening(false);

    setVoiceStatus("Listening… try “turn on the lights”");
    setListening(true);

    try {
      recognition.start();
    } catch {
      setListening(false);
      setVoiceStatus("Could not start microphone. Please try again.");
    }
  }

  function reset() {
    applyScene("HOME");
    setVoiceStatus("Ready for a command");
  }

  return (
    <section className="snkb-section" id="knx-briefcase">
      <div className="snkb-wrap">
        <div className="snkb-heading">
          <div className="snkb-eyebrow">
            <span /> SMARTNEST AUTOMATION LAB
          </div>
          <h2>
            The KNX Experience
            <br />
            <span>Briefcase.</span>
          </h2>
          <p>
            Explore the technology behind a smart home. Rotate the case,
            touch the demonstration modules, and watch the miniature villa
            respond to your commands.
          </p>
        </div>

        <div className="snkb-stage">
          <div className="snkb-stagebar">
            <span><span className="snkb-live-dot" /> INTERACTIVE 3D MODEL</span>
            <span>DRAG TO ROTATE · SCROLL TO ZOOM</span>
          </div>

          <div className="snkb-canvas">
            <BriefcaseScene
              lightsOn={lightsOn}
              curtainsOpen={curtainsOpen}
              temperature={temperature}
              securityArmed={securityArmed}
              rgbColor={rgbColor}
              mode={mode}
              onLights={() => {
                setLightsOn((value) => !value);
                setMode("CUSTOM");
              }}
              onCurtains={() => {
                setCurtainsOpen((value) => !value);
                setMode("CUSTOM");
              }}
              onSecurity={() => {
                setSecurityArmed((value) => !value);
                setMode("CUSTOM");
              }}
              onColor={(color) => {
                setRgbColor(color);
                setLightsOn(true);
                setMode("CUSTOM");
              }}
            />
          </div>

          <div className="snkb-stagebar snkb-stagebottom">
            <span>SMARTNEST · KNX DEMONSTRATION CONCEPT</span>
            <span>SIMULATED CONTROLS</span>
          </div>
        </div>

        <div className="snkb-console">
          <div className="snkb-consolehead">
            <div>
              <span className="snkb-label">CONTROL INTERFACE</span>
              <h3>Command centre</h3>
            </div>
            <div className="snkb-online"><span /> DEMO ONLINE</div>
          </div>

          <div className="snkb-presets">
            <button
              className={mode === "HOME" ? "selected" : ""}
              onClick={() => applyScene("HOME")}
              type="button"
            >
              <Lightbulb size={18} /> Home
            </button>
            <button
              className={mode === "AWAY" ? "selected" : ""}
              onClick={() => applyScene("AWAY")}
              type="button"
            >
              <Plane size={18} /> Away
            </button>
            <button
              className={mode === "NIGHT" ? "selected" : ""}
              onClick={() => applyScene("NIGHT")}
              type="button"
            >
              <Moon size={18} /> Night
            </button>
          </div>

          <div className="snkb-controlgrid">
            <div className="snkb-control">
              <div className="snkb-controlicon"><Lightbulb size={20} /></div>
              <div className="snkb-controltext">
                <strong>RGB lighting</strong>
                <span>{lightsOn ? "Lights on" : "Lights off"}</span>
              </div>
              <button
                type="button"
                aria-label="Toggle lighting"
                aria-pressed={lightsOn}
                className={`snkb-toggle ${lightsOn ? "on" : ""}`}
                onClick={() => {
                  setLightsOn((value) => !value);
                  setMode("CUSTOM");
                }}
              ><span /></button>
            </div>

            <div className="snkb-control">
              <div className="snkb-controlicon"><Blinds size={20} /></div>
              <div className="snkb-controltext">
                <strong>Motorised curtains</strong>
                <span>{curtainsOpen ? "Open" : "Closed"}</span>
              </div>
              <button
                type="button"
                aria-label="Toggle curtains"
                aria-pressed={curtainsOpen}
                className={`snkb-toggle ${curtainsOpen ? "on" : ""}`}
                onClick={() => {
                  setCurtainsOpen((value) => !value);
                  setMode("CUSTOM");
                }}
              ><span /></button>
            </div>

            <div className="snkb-control">
              <div className="snkb-controlicon"><ShieldCheck size={20} /></div>
              <div className="snkb-controltext">
                <strong>Security</strong>
                <span>{securityArmed ? "Armed" : "Disarmed"}</span>
              </div>
              <button
                type="button"
                aria-label="Toggle security"
                aria-pressed={securityArmed}
                className={`snkb-toggle ${securityArmed ? "on" : ""}`}
                onClick={() => {
                  setSecurityArmed((value) => !value);
                  setMode("CUSTOM");
                }}
              ><span /></button>
            </div>

            <div className="snkb-control snkb-climate">
              <div className="snkb-controlicon"><Thermometer size={20} /></div>
              <div className="snkb-climatebody">
                <div className="snkb-controltext">
                  <strong>Climate control</strong>
                  <span>Target temperature</span>
                </div>
                <div className="snkb-temp">{temperature}<small>°C</small></div>
                <input
                  aria-label="Temperature setpoint"
                  type="range"
                  min="16"
                  max="30"
                  value={temperature}
                  onChange={(event) => {
                    setTemperature(Number(event.target.value));
                    setMode("CUSTOM");
                  }}
                />
              </div>
            </div>
          </div>

          <div className="snkb-colorrow">
            <div>
              <span className="snkb-label">TOUCHSCREEN COLOUR WHEEL</span>
              <p>Choose a colour for the lighting demonstration.</p>
            </div>
            <div className="snkb-colors">
              {COLORS.map((color) => (
                <button
                  type="button"
                  key={color}
                  aria-label={`Set lighting colour ${color}`}
                  title={color}
                  className={rgbColor === color ? "active" : ""}
                  style={{ background: color }}
                  onClick={() => {
                    setRgbColor(color);
                    setLightsOn(true);
                    setMode("CUSTOM");
                  }}
                />
              ))}
            </div>
          </div>

          <div className="snkb-voice">
            <div className="snkb-voiceicon"><Volume2 size={20} /></div>
            <div className="snkb-voicecopy">
              <strong>Voice control demonstration</strong>
              <span>{voiceStatus}</span>
              <small>Try: “Turn on the lights”, “Open curtains”, “Night scene”.</small>
            </div>
            <button
              type="button"
              className="snkb-voicebutton"
              onClick={startVoiceControl}
            >
              {listening ? <MicOff size={17} /> : <Mic size={17} />}
              {listening ? "Listening" : "Try voice"}
            </button>
          </div>

          <button className="snkb-reset" onClick={reset} type="button">
            <RotateCcw size={15} /> Reset demonstration
          </button>
        </div>

        <div className="snkb-footnote">
          <Activity size={15} />
          <span>
            Website simulation only. No physical KNX devices are connected.
            Voice recognition requires browser support and microphone permission.
          </span>
        </div>
      </div>

      <style jsx>{`
        .snkb-section {
          padding: 100px 22px;
          color: #f5faf7;
          background:
            radial-gradient(ellipse at 50% 0%, rgba(22, 135, 255,.08), transparent 44%),
            #080d0c;
          overflow: hidden;
        }
        .snkb-wrap { max-width: 1160px; margin: auto; }
        .snkb-heading { text-align: center; max-width: 740px; margin: 0 auto 40px; }
        .snkb-eyebrow { display:flex; align-items:center; justify-content:center; gap:9px; color:#1687ff; font-size:10px; font-weight:800; letter-spacing:2px; margin-bottom:17px; }
        .snkb-eyebrow > span,.snkb-live-dot { width:7px;height:7px;border-radius:50%;background:#1687ff;box-shadow:0 0 12px #1687ff;display:inline-block; }
        .snkb-heading h2 { font-size:clamp(36px,5.4vw,64px);line-height:1.04;letter-spacing:-2.5px;margin:0;font-weight:750; }
        .snkb-heading h2 span { color:#1687ff; }
        .snkb-heading p { max-width:620px;margin:19px auto 0;color:#9baaa2;font-size:14px;line-height:1.8; }
        .snkb-stage { overflow:hidden;border:1px solid rgba(22, 135, 255, .16);border-radius:22px;background:#101613;box-shadow:0 30px 100px rgba(0,0,0,.35); }
        .snkb-stagebar { min-height:45px;padding:0 17px;display:flex;align-items:center;justify-content:space-between;gap:10px;font-size:9px;letter-spacing:1.2px;color:#96a69d;border-bottom:1px solid rgba(255,255,255,.07); }
        .snkb-stagebar > span:first-child { display:flex;align-items:center;gap:8px;color:#1687ff;font-weight:800; }
        .snkb-canvas { height:610px;background:radial-gradient(ellipse at 50% 40%,rgba(22, 135, 255,.06),transparent 50%),#101412; }
        .snkb-canvas canvas { display:block;outline:none;touch-action:pan-y; }
        .snkb-stagebottom { border-top:1px solid rgba(255,255,255,.07);border-bottom:0;font-size:8px; }
        .snkb-console { margin-top:20px;padding:26px;border:1px solid rgba(22, 135, 255, .14);border-radius:20px;background:linear-gradient(145deg,#121b16,#0c120f); }
        .snkb-consolehead { display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:22px; }
        .snkb-label { color:#809187;font-size:9px;font-weight:800;letter-spacing:1.6px; }
        .snkb-consolehead h3 { font-size:24px;margin:5px 0 0;letter-spacing:-.7px; }
        .snkb-online { display:flex;align-items:center;gap:7px;color:#1687ff;font-size:9px;font-weight:800;letter-spacing:.7px; }
        .snkb-online span { width:6px;height:6px;border-radius:50%;background:#1687ff; }
        .snkb-presets { display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;margin-bottom:23px; }
        .snkb-presets button { display:flex;justify-content:center;align-items:center;gap:9px;min-height:49px;border:1px solid rgba(255,255,255,.09);border-radius:11px;background:rgba(255,255,255,.025);color:#a7b5ac;font:inherit;font-size:12px;cursor:pointer;transition:.18s; }
        .snkb-presets button:hover,.snkb-presets button.selected { border-color:rgba(22, 135, 255,.48);background:rgba(22, 135, 255,.08);color:#1687ff; }
        .snkb-controlgrid { display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px; }
        .snkb-control { display:flex;align-items:center;gap:12px;min-width:0;padding:16px;border:1px solid rgba(255,255,255,.075);border-radius:13px;background:rgba(255,255,255,.02); }
        .snkb-controlicon,.snkb-voiceicon { display:grid;place-items:center;flex-shrink:0;width:42px;height:42px;border:1px solid rgba(22, 135, 255,.15);border-radius:12px;background:rgba(22, 135, 255,.07);color:#1687ff; }
        .snkb-controltext { display:flex;flex-direction:column;gap:5px;min-width:0; }
        .snkb-controltext strong,.snkb-voicecopy strong { font-size:12px;color:#edf7f1; }
        .snkb-controltext span,.snkb-voicecopy span { font-size:10px;color:#899a90; }
        .snkb-toggle { width:40px;height:23px;display:flex;align-items:center;flex-shrink:0;margin-left:auto;padding:3px;border:1px solid rgba(255,255,255,.1);border-radius:99px;background:#303b34;cursor:pointer; }
        .snkb-toggle span { width:15px;height:15px;border-radius:50%;background:#a4b0a8;transition:transform .18s; }
        .snkb-toggle.on { background:#1687ff;border-color:#1687ff; }
        .snkb-toggle.on span { transform:translateX(15px);background:white; }
        .snkb-climate { align-items:flex-start; }
        .snkb-climatebody { flex:1;min-width:0;display:grid;grid-template-columns:1fr auto;gap:8px; }
        .snkb-temp { font-size:25px;font-weight:750; }
        .snkb-temp small { color:#8c9b92;font-size:11px;font-weight:500; }
        .snkb-climate input { grid-column:1/-1;width:100%;accent-color:#1687ff;cursor:pointer; }
        .snkb-colorrow { display:flex;align-items:center;justify-content:space-between;gap:20px;margin-top:20px;padding:19px;border:1px solid rgba(255,255,255,.075);border-radius:13px; }
        .snkb-colorrow p { margin:7px 0 0;color:#899a90;font-size:11px; }
        .snkb-colors { display:flex;flex-wrap:wrap;gap:9px;max-width:330px;justify-content:flex-end; }
        .snkb-colors button { width:24px;height:24px;border:2px solid transparent;border-radius:50%;cursor:pointer; }
        .snkb-colors button.active { outline:2px solid #fff;outline-offset:3px; }
        .snkb-voice { display:flex;align-items:center;gap:13px;margin-top:12px;padding:17px;border:1px solid rgba(22, 135, 255,.16);border-radius:13px;background:rgba(22, 135, 255,.035); }
        .snkb-voicecopy { display:flex;flex:1;flex-direction:column;gap:5px;min-width:0; }
        .snkb-voicecopy small { color:#1687ff;font-size:10px;line-height:1.5; }
        .snkb-voicebutton { display:flex;align-items:center;justify-content:center;gap:8px;flex-shrink:0;padding:11px 15px;border:1px solid rgba(22, 135, 255,.35);border-radius:10px;background:rgba(22, 135, 255,.09);color:#1687ff;font:inherit;font-size:11px;font-weight:700;cursor:pointer; }
        .snkb-reset { display:flex;align-items:center;justify-content:center;gap:8px;margin:17px auto 0;padding:10px 16px;border:0;background:transparent;color:#8fa197;font:inherit;font-size:11px;cursor:pointer; }
        .snkb-reset:hover { color:#1687ff; }
        .snkb-footnote { display:flex;align-items:flex-start;gap:9px;margin:16px 3px 0;color:#829288;font-size:10px;line-height:1.7; }
        .snkb-footnote :global(svg) { flex-shrink:0;color:#1687ff; }
        .snkb-loading { height:610px;display:grid;place-items:center;color:#1687ff;font-size:13px; }
        @media(max-width:700px) {
          .snkb-section { padding:70px 14px; }
          .snkb-heading h2 { letter-spacing:-1.6px; }
          .snkb-canvas,.snkb-loading { height:430px; }
          .snkb-stagebar { padding:0 11px;font-size:8px;letter-spacing:.5px; }
          .snkb-console { padding:16px; }
          .snkb-controlgrid { grid-template-columns:1fr; }
          .snkb-colorrow { align-items:flex-start;flex-direction:column; }
          .snkb-colors { justify-content:flex-start; }
          .snkb-voice { flex-wrap:wrap; }
          .snkb-voicecopy { flex-basis:calc(100% - 60px); }
          .snkb-voicebutton { margin-left:54px; }
        }
      `}</style>
    </section>
  );
}
