"use client";



import { useState } from "react";

import { motion } from "motion/react";
import ImageFlip from "../components/ImageFlip";
import RoundCarousel from "../components/RoundCarousel";


import {

  ArrowDownRight,

  ArrowRight,

  ArrowUpRight,

  Check,



  Fingerprint,

  Lightbulb,

  Menu,

  Moon,

  Music2,

  MessageCircle,

  ShieldCheck,

  Smartphone,

  Sparkles,

  Thermometer,

  VenetianMask,

  Wifi,

  X,

  Zap,

} from "lucide-react";





// SMARTNEST WHATSAPP ENQUIRIES

// Replace this with your business WhatsApp number.

// India example format: 91 followed by 10 digits.

// Use digits only: no +, spaces, or hyphens.

const WHATSAPP_NUMBER = "918072568386";



const features = [

  {

    icon: Lightbulb,

    title: "Intelligent lighting",

    text: "Set the perfect atmosphere with precise dimming, scenes and effortless control.",

  },

  {

    icon: Thermometer,

    title: "Climate that thinks",

    text: "Make every room comfortable while reducing unnecessary energy consumption.",

  },

  {

    icon: VenetianMask,

    title: "Curtains & blinds",

    text: "Welcome the morning light, protect your privacy and follow the sun automatically.",

  },

  {

    icon: ShieldCheck,

    title: "Security & peace",

    text: "Bring door access, sensors and security into one thoughtful experience.",

  },

];



const scenes = [

  { id: "welcome", name: "Welcome", icon: Sparkles, light: 75, temp: 23 },

  { id: "relax", name: "Relax", icon: Moon, light: 25, temp: 24 },

  { id: "movie", name: "Movie night", icon: Music2, light: 8, temp: 22 },

];



export default function Home() {

  const [menuOpen, setMenuOpen] = useState(false);

  const [lightsOn, setLightsOn] = useState(true);

  const [brightness, setBrightness] = useState(72);

  const [temperature, setTemperature] = useState(23);

  const [curtains, setCurtains] = useState(68);

  const [securityOn, setSecurityOn] = useState(true);

  const [activeScene, setActiveScene] = useState("welcome");
  const [selectedRoom, setSelectedRoom] = useState("Living room");

  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  async function handleContactSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    setSubmitError("");

    const form = event.currentTarget;
    const formData = new FormData(form);
    formData.set("_subject", "New SmartNest Website Enquiry");

    try {
      const response = await fetch("https://formspree.io/f/xkjoqeyl", {
        method: "POST",
        body: formData,
        headers: { Accept: "application/json" },
      });

      if (!response.ok) {
        let message = "Your enquiry could not be sent. Please try again or contact us on WhatsApp.";
        try {
          const result = await response.json();
          if (result?.errors?.length) {
            message = result.errors.map((item: { message: string }) => item.message).join(" ");
          }
        } catch {
          // Keep the fallback message if Formspree does not return JSON.
        }
        setSubmitError(message);
        return;
      }

      setSubmitted(true);
      form.reset();
    } catch {
      setSubmitError("Connection error. Please check your internet and try again.");
    } finally {
      setIsSubmitting(false);
    }
  }



  function chooseScene(scene: (typeof scenes)[number]) {

    setActiveScene(scene.id);

    setBrightness(scene.light);

    setLightsOn(scene.light > 0);

    setTemperature(scene.temp);
    setCurtains(scene.id === "movie" ? 100 : scene.id === "relax" ? 55 : 25);
    setSecurityOn(scene.id !== "welcome");

  }



  return (

    <main>

      <nav className="navbar">

        <a href="#home" className="brand" aria-label="SmartNest home">

          <span className="brand-symbol"><span /><span /><span /></span>

          <span>smart<span className="brand-light">nest</span><small>INTELLIGENT LIVING</small></span>

        </a>



        <div className={`nav-links ${menuOpen ? "nav-open" : ""}`}>

          <a href="#solutions" onClick={() => setMenuOpen(false)}>Solutions</a>

          <a href="#experience" onClick={() => setMenuOpen(false)}>Experience</a>

          <a href="#spaces" onClick={() => setMenuOpen(false)}>Spaces</a>

          <a href="#technology" onClick={() => setMenuOpen(false)}>Technology</a>

          <a href="#contact" onClick={() => setMenuOpen(false)}>Contact</a>

          <a className="nav-cta" href="#contact" onClick={() => setMenuOpen(false)}>

            Plan your home <ArrowUpRight size={16} />

          </a>

        </div>



        <button type="button" className="menu-button" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle navigation">

          {menuOpen ? <X /> : <Menu />}

        </button>

      </nav>



      <section className="hero" id="home">

        <div className="hero-image" />

        <div className="hero-overlay" />

        <div className="hero-content">

          <div className="eyebrow hero-rise hero-rise-1">

            <span className="status-dot" /> THE FUTURE OF HOME, TODAY

          </div>

          <h1 className="hero-rise hero-rise-2">

            Your home.<br />

            <span>Your intelligence.</span>

          </h1>

          <p className="hero-rise hero-rise-3">

            Thoughtfully engineered KNX automation that brings lighting,

            comfort, security and design together in perfect harmony.

          </p>

          <div className="hero-actions hero-rise hero-rise-4">

            <a className="button button-primary" href="#contact">Build your smart home <ArrowRight size={17} /></a>

            <a className="button button-ghost" href="#experience"><span className="play-icon">↗</span> Explore the experience</a>

          </div>

          <div className="hero-footnote">

            <span>BUILT AROUND YOU</span><span className="foot-line" /><span>POWERED BY KNX</span>

          </div>

        </div>



        <motion.div

          className="floating-card"

          initial={{ opacity: 0, x: 20 }}

          animate={{ opacity: 1, x: 0 }}

          transition={{ delay: 0.6 }}

        >

          <div className="floating-top"><span className="tiny-live" /> YOUR HOME AT A GLANCE <Wifi size={14} /></div>

          <div className="floating-main">

            <div className="floating-icon"><Lightbulb size={20} /></div>

            <div><strong>Evening ambience</strong><small>Living room · Active</small></div>

            <span className="toggle toggle-on"><i /></span>

          </div>

          <div className="floating-bottom"><span>Lighting</span><strong>72%</strong><div className="mini-track"><i /></div></div>

        </motion.div>

        <a className="scroll-indicator" href="#solutions"><span>SCROLL TO DISCOVER</span><ArrowDownRight size={17} /></a>

      </section>



      <section className="trust-strip">

        <div><span className="trust-mark">01</span><p>DESIGNED AROUND<br /><strong>YOUR LIFESTYLE</strong></p></div>

        <div><span className="trust-mark">02</span><p>ENGINEERED FOR<br /><strong>RELIABLE CONTROL</strong></p></div>

        <div><span className="trust-mark">03</span><p>READY FOR<br /><strong>WHAT COMES NEXT</strong></p></div>

        <div className="trust-knx">SMART LIVING, <span>SIMPLIFIED.</span></div>

      </section>



      <section className="section solutions-section" id="solutions">

        <div className="section-heading">

          <div>

            <div className="eyebrow dark-eyebrow"><span className="status-dot" /> THE SMARTNEST APPROACH</div>

            <h2>Technology that<br /><span>feels effortless.</span></h2>

          </div>

          <p>Great automation isn’t about adding more technology. It’s about making everyday living feel beautifully simple.</p>

        </div>

        <div className="feature-grid">

          {features.map((feature, index) => {

            const Icon = feature.icon;

            return (

              <motion.article

                className="feature-card"

                key={feature.title}

                initial={{ opacity: 0, y: 20 }}

                whileInView={{ opacity: 1, y: 0 }}

                viewport={{ once: true }}

                transition={{ delay: index * 0.08 }}

              >

                <div className="feature-number">0{index + 1}</div>

                <div className="feature-icon"><Icon size={23} strokeWidth={1.5} /></div>

                <h3>{feature.title}</h3>

                <p>{feature.text}</p>

                <a href="#contact" aria-label={`Enquire about ${feature.title}`}><ArrowUpRight size={18} /></a>

              </motion.article>

            );

          })}

        </div>

      </section>


      
<section className="experience-section" id="experience">

        <div className="experience-copy">

          <div className="eyebrow"><span className="status-dot" /> YOUR HOME, YOUR RULES</div>

          <h2>One touch.<br /><span>A different world.</span></h2>

          <p>Start your morning, settle into the evening or set the scene for movie night. Your home responds to the way you live.</p>

          <div className="experience-points">

            <div><Check size={16} /> Personalised scenes</div>

            <div><Check size={16} /> Intuitive control</div>

            <div><Check size={16} /> A connected experience</div>

          </div>

          <a href="#contact" className="text-link">Create your experience <ArrowRight size={17} /></a>

        </div>



        <motion.div className="control-panel" aria-label="Interactive smart home demo" initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.7, ease: "easeOut" }}>

          <div className="panel-top">

            <div><span className="panel-label">SMARTNEST / HOME</span><h3>Good evening.</h3><p>Your home is ready for you.</p></div>

            <div className="panel-avatar"><Fingerprint size={22} /></div>

          </div>

          <div className="panel-status"><span><i className="status-dot" /> SYSTEM ONLINE</span><span>DEMO MODE</span></div>

          <div className="room-selector" aria-label="Choose a room">
            {["Living room", "Bedroom", "Kitchen"].map((room) => (
              <button type="button" key={room} className={selectedRoom === room ? "room-tab room-tab-active" : "room-tab"} onClick={() => { setSelectedRoom(room); setActiveScene(""); }}>
                {room}
              </button>
            ))}
          </div>

          
<div
  className={`demo-visual demo-visual-${activeScene || "custom"}`}
  style={{
    "--demo-brightness": `${lightsOn ? brightness : 0}%`,
    backgroundImage: `url("${
      selectedRoom === "Bedroom"
        ? "/images/scene-bedroom.jpg"
        : selectedRoom === "Kitchen"
          ? "/images/scene-kitchen.jpg"
          : "/images/scene-living-ambient.jpg"
    }")`,
    backgroundSize: "cover",
    backgroundPosition: "center",
  } as React.CSSProperties}
>

            <div className="demo-visual-sky" />
            <div className="demo-window"><span /><span /><span /></div>
            <div className="demo-sofa" />
            <div className="demo-floor-glow" />
            <div className="demo-visual-caption"><span className="tiny-live" /> {selectedRoom.toUpperCase()} <strong>{lightsOn ? `${brightness}% LIGHTING` : "LIGHTS OFF"}</strong></div>
          </div>

          <div className="scene-label">CHOOSE A SCENE</div>

          <div className="scene-grid">

            {scenes.map(scene => {

              const Icon = scene.icon;

              return (

                <button type="button" key={scene.id} className={`scene-button ${activeScene === scene.id ? "scene-active" : ""}`} onClick={() => chooseScene(scene)}>

                  <Icon size={19} /><span>{scene.name}</span>

                </button>

              );

            })}

          </div>



          <div className="control-row">

            <div className="control-icon"><Lightbulb size={20} /></div>

            <div className="control-info"><strong>{selectedRoom} lights</strong><small>{lightsOn ? "Lights are on" : "Lights are off"}</small></div>

            <button type="button" className={`toggle ${lightsOn ? "toggle-on" : ""}`} onClick={() => setLightsOn(!lightsOn)} aria-label="Toggle living room lights"><i /></button>

          </div>

          <div className="range-control">

            <div className="range-label"><span>Brightness</span><strong>{lightsOn ? brightness : 0}%</strong></div>

            <input type="range" min="0" max="100" value={brightness} onChange={e => { setBrightness(Number(e.target.value)); setActiveScene(""); }} aria-label="Brightness" style={{ "--range-value": `${brightness}%` } as React.CSSProperties} />

          </div>



          <div className="control-row">

            <div className="control-icon"><Thermometer size={20} /></div>

            <div className="control-info"><strong>Climate control</strong><small>{selectedRoom} temperature</small></div>

            <div className="temperature-control">

              <button type="button" onClick={() => setTemperature(Math.max(16, temperature - 1))} aria-label="Decrease temperature">−</button>

              <strong>{temperature}°</strong>

              <button type="button" onClick={() => setTemperature(Math.min(30, temperature + 1))} aria-label="Increase temperature">+</button>

            </div>

          </div>



          <div className="range-control">

            <div className="range-label"><span>Curtain position</span><strong>{curtains}%</strong></div>

            <input type="range" min="0" max="100" value={curtains} onChange={e => setCurtains(Number(e.target.value))} aria-label="Curtain position" style={{ "--range-value": `${curtains}%` } as React.CSSProperties} />

          </div>



          <div className="control-row security-row">

            <div className="control-icon"><ShieldCheck size={20} /></div>

            <div className="control-info"><strong>Home security</strong><small>{securityOn ? "Your home is protected" : "Security demo disabled"}</small></div>

            <button type="button" className={`toggle ${securityOn ? "toggle-on" : ""}`} onClick={() => setSecurityOn(!securityOn)} aria-label="Toggle security demo"><i /></button>

          </div>

          <div className="demo-note"><Zap size={14} /> Interactive website demo — not connected to physical devices.</div>

        </motion.div>

      </section>






      <section className="visual-gallery-section" id="spaces">
        <div className="gallery-heading">
          <div>
            <div className="eyebrow"><span className="status-dot" /> THOUGHTFUL DESIGN, INTELLIGENT LIVING</div>
            <h2>Spaces that feel<br /><span>effortlessly yours.</span></h2>
          </div>
          <p>Explore the mood, materials and atmosphere of considered living. Every detail can work together — quietly, beautifully, intelligently.</p>
        </div>

        <div className="gallery-feature-grid">
          <div className="gallery-flip-card">
            <div className="gallery-card-kicker">A CLOSER LOOK <span>01 / 04</span></div>
            <div className="gallery-flip-frame">
              <ImageFlip
                images={[
                  { image: { src: "/images/scene-villa-dusk.jpg", alt: "Modern SmartNest villa exterior at dusk" }, focusY: 50 },
                  { image: { src: "/images/scene-living-ambient.jpg", alt: "Living room with layered ambient lighting" }, focusY: 50 },
                  { image: { src: "/images/scene-foyer.jpg", alt: "Entrance foyer with concealed step lighting" }, focusY: 50 },
                  { image: { src: "/images/scene-terrace.jpg", alt: "Villa terrace and pool lighting at dusk" }, focusY: 50 },
                ]}
                fit="cover"
                rounded={18}
                tilt
                tiltOptions={{ effect: "repel", tiltLimit: 8, scale: 103 }}
              />
            </div>
            <div className="gallery-card-footer"><strong>Designed around your life</strong><span>Click either side to flip <span aria-hidden="true">↗</span></span></div>
          </div>

          <div className="gallery-copy-card">
            <span className="gallery-index">02 — ATMOSPHERE</span>
            <h3>Technology should disappear into the experience.</h3>
            <p>Lighting, climate and shading can respond as one — helping each room feel right throughout the day.</p>
            <a href="#experience" className="text-link">Explore the interactive home <ArrowRight size={17} /></a>
            <div className="gallery-stats">
              <div><span className="stat-orb"><Lightbulb size={18} /></span><strong>Lighting</strong><small>Set the mood</small></div>
              <div><span className="stat-orb"><Thermometer size={18} /></span><strong>Climate</strong><small>Find your comfort</small></div>
              <div><span className="stat-orb"><ShieldCheck size={18} /></span><strong>Control</strong><small>One connected home</small></div>
            </div>
          </div>
        </div>

        <div className="carousel-gallery-block">
          <div className="carousel-gallery-copy">
            <span className="gallery-index">03 — INSPIRED SPACES</span>
            <h3>Move through ideas.<br /><span>Find your feeling.</span></h3>
            <p>Drag the gallery to explore the imagery. This is an inspiration gallery, not a portfolio of completed SmartNest projects.</p>
          </div>
          <div className="round-carousel-frame" aria-label="Interactive rotating inspiration gallery">
            <RoundCarousel
              imageWidth={190}
              imageHeight={230}
              spacing={2.1}
              speed={1.6}
              direction="right"
              drag
              sensitivity={3.2}
              tilt={-5}
              perspective={1250}
              cornerRadius={16}
              innerDim={2.5}
              background="transparent"
            />
          </div>
        </div>
      </section>

      <section className="technology-section" id="technology">

        <div className="tech-visual">

          <div className="tech-orbit orbit-one" /><div className="tech-orbit orbit-two" /><div className="tech-orbit orbit-three" />

          <div className="tech-core"><span className="brand-symbol large"><span /><span /><span /></span><strong>SMARTNEST</strong><small>CONNECTED LIVING</small></div>

          <div className="orbit-tag tag-one"><Lightbulb size={17} /> Lighting</div>

          <div className="orbit-tag tag-two"><Thermometer size={17} /> Climate</div>

          <div className="orbit-tag tag-three"><ShieldCheck size={17} /> Security</div>

          <div className="orbit-tag tag-four"><Smartphone size={17} /> Control</div>

        </div>

        <div className="tech-copy">

          <div className="eyebrow dark-eyebrow"><span className="status-dot" /> BUILT ON A PROVEN STANDARD</div>

          <h2>Beautifully designed.<br /><span>Intelligently connected.</span></h2>

          <p>KNX is a globally recognised standard for building control. SmartNest brings the technology and thoughtful design together to create a home that works as one.</p>

          <div className="tech-benefits">

            <div><span className="benefit-check"><Check size={15} /></span><div><strong>One connected ecosystem</strong><p>Coordinate lighting, climate, shading and more.</p></div></div>

            <div><span className="benefit-check"><Check size={15} /></span><div><strong>Designed to evolve</strong><p>Plan for your needs today and tomorrow.</p></div></div>

            <div><span className="benefit-check"><Check size={15} /></span><div><strong>Personalised to your space</strong><p>Control experiences designed around your routine.</p></div></div>

          </div>

          <a href="#contact" className="text-link">Explore a SmartNest project <ArrowRight size={17} /></a>

        </div>

      </section>



      <section className="quote-section">

        <span className="quote-mark">“</span>

        <p>The best technology is the kind you don’t have to think about.</p>

        <span className="quote-caption">SMARTER SPACES. MORE MEANINGFUL MOMENTS.</span>

      </section>



      <section className="contact-section" id="contact">

        <div className="contact-copy">

          <div className="eyebrow"><span className="status-dot" /> LET’S BUILD SOMETHING BETTER</div>

          <h2>Your vision.<br /><span>Our expertise.</span></h2>

          <p>Planning a new home, renovating a space or exploring automation? Tell us what you have in mind.</p>

          <div className="contact-note"><span className="contact-note-icon"><Sparkles size={20} /></span><span><strong>Start with a conversation.</strong><small>We’ll help you explore the right possibilities for your home.</small></span></div>

        </div>

        <form className="contact-form" onSubmit={handleContactSubmit}>
          {submitted ? (

            <div className="form-success"><span><Check size={24} /></span><h3>Thanks for reaching out.</h3><p>Your enquiry has been submitted. The SmartNest team will be in touch soon.</p><button type="button" className="text-link" onClick={() => { setSubmitted(false); setSubmitError(""); }}>Send another enquiry <ArrowRight size={16} /></button></div>

          ) : (

            <>

              <span className="form-kicker">YOUR SMART HOME STARTS HERE</span>

              <h3>Tell us about your project.</h3>

              <label>Your name<input required name="name" placeholder="Full name" /></label>

              <label>Email address<input required name="email" type="email" placeholder="you@example.com" /></label>

              <label>What are you planning?

                <select name="project" defaultValue="" required>

                  <option value="" disabled>Select project type</option>

                  <option>New home / villa</option>

                  <option>Apartment</option>

                  <option>Renovation</option>

                  <option>Commercial space</option>

                  <option>Just exploring</option>

                </select>

              </label>

              <label>Tell us a little more<textarea name="message" rows={3} placeholder="Your ideas, requirements or questions..." /></label>

              <button type="submit" className="button button-primary form-submit" disabled={isSubmitting}>{isSubmitting ? "Sending enquiry..." : "Send enquiry"} <ArrowRight size={17} /></button>

              {submitError && <p className="form-disclaimer" role="alert">{submitError}</p>}

              <p className="form-disclaimer">Your details will be sent to SmartNest for follow-up.</p>

            </>

          )}

        </form>

      </section>



      {/* SMARTNEST WHATSAPP ENQUIRIES */}

      <a

        className="whatsapp-float"

        href={"https://wa.me/" + WHATSAPP_NUMBER + "?text=" + encodeURIComponent("Hello SmartNest! I would like to know more about KNX smart home automation.")}

        target="_blank"

        rel="noopener noreferrer"

        aria-label="Chat with SmartNest on WhatsApp"

        onClick={e => {

          if (WHATSAPP_NUMBER.includes("YOURNUMBER")) {

            e.preventDefault();

            alert("Please add your SmartNest WhatsApp number in app/page.tsx first.");

          }

        }}

      >

        <MessageCircle size={23} />

        <span>Chat with us</span>

      </a>



      <footer className="footer">

        <div className="footer-top">

          <a href="#home" className="brand">

            <span className="brand-symbol"><span /><span /><span /></span>

            <span>smart<span className="brand-light">nest</span><small>INTELLIGENT LIVING</small></span>

          </a>

          <p>Thoughtful technology.<br />A more intuitive way to live.</p>

          <a className="footer-top-link" href="#home">BACK TO TOP <ArrowUpRight size={15} /></a>

        </div>

        <div className="footer-bottom"><span>© 2026 SmartNest. All rights reserved.</span><span>DESIGNED FOR BETTER LIVING <span className="footer-dot">●</span></span></div>

      </footer>

    </main>

  );

}
