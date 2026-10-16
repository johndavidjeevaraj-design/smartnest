import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Bell,
  Camera,
  Car,
  Check,
  Droplets,
  Fingerprint,
  Globe,
  Lock,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  ShieldCheck,
  Thermometer,
  Wifi,
  Zap,
} from "lucide-react";
import "./home.css";
import ImageFlip from "@/components/ImageFlip";
import RoundCarousel from "@/components/RoundCarousel";
import KnxDemo from "@/components/KnxDemo";
import ContactForm from "@/components/ContactForm";

export const metadata: Metadata = {
  title: "SmartNest — Certified KNX Smart Home Automation in Hosur & Bengaluru",
  description:
    "Certified KNX smart home and villa automation in Hosur and Bengaluru. Lighting, climate, gates, security, CCTV, door locks and water control — designed, installed and programmed by SmartNest.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "SmartNest — Certified KNX Smart Home Automation",
    description:
      "Certified KNX automation for luxury homes and villas across Hosur and Bengaluru.",
    url: "/",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630 }],
  },
};

const NAV = [
  { label: "Services", href: "#services" },
  { label: "KNX Demo", href: "#demo" },
  { label: "Spaces", href: "#spaces" },
  { label: "Why KNX", href: "#why" },
  { label: "Process", href: "#process" },
  { label: "Reviews", href: "#reviews" },
  { label: "Contact", href: "#contact" },
];

const SERVICES = [
  {
    icon: Globe,
    title: "KNX Wired Automation",
    desc: "The global open standard for building control. We design, install and program KNX systems end to end — the backbone that lets every other system in your home talk to one another.",
    points: [
      "ISO/IEC 14543 certified open standard",
      "ETS software programming & commissioning",
      "Works with 500+ ecosystem brands",
      "Runs locally — no internet dependency",
    ],
  },
  {
    icon: Wifi,
    title: "Wireless Home Automation",
    desc: "Seamless smart home control without structural rewiring. Manage lights, fans, curtains, AC climate and RGB scenes from your phone or voice assistant.",
    points: [
      "Smart touch switches & retrofit wireless modules",
      "Alexa, Google Assistant & Apple Siri integration",
      "Mood lighting, dimming & RGB scene control",
      "Smartphone remote access from anywhere",
    ],
  },
  {
    icon: Car,
    title: "Gate Automation",
    desc: "Heavy-duty motorised automation for sliding and swing gates, with the safety sensing a family driveway genuinely needs.",
    points: [
      "Motorised sliding & swing driveway openers",
      "Infrared anti-crush obstacle sensors",
      "Keyfob, RFID & mobile app opening",
      "Boom barriers & visitor gate control",
    ],
  },
  {
    icon: Bell,
    title: "Video Door Bell",
    desc: "See and speak to whoever is at your door from anywhere — with a clear 2K image, day or night.",
    points: [
      "2K live HD video streaming",
      "Real-time two-way audio talkback",
      "Infrared night vision & motion alerts",
      "Wireless indoor chime & mobile notifications",
    ],
  },
  {
    icon: Lock,
    title: "Smart Door Lock",
    desc: "Multi-layer biometric entry that removes the spare-key problem entirely, without ever locking you out.",
    points: [
      "3D semiconductor biometric fingerprint reader",
      "Illuminated digital touchscreen keypad",
      "Encrypted RFID card & manual emergency key",
      "Wi-Fi remote unlock & one-time guest OTP",
    ],
  },
  {
    icon: Camera,
    title: "Smart CCTV Automation",
    desc: "Edge-AI cameras that tell the difference between a person, a vehicle and a swaying tree — so alerts stay meaningful.",
    points: [
      "Edge-AI human & vehicle classification",
      "24/7 full-colour night vision",
      "Active perimeter defence & siren alarms",
      "Multi-screen NVR & encrypted cloud storage",
    ],
  },
  {
    icon: ShieldCheck,
    title: "Smart Alarm System",
    desc: "Wireless intrusion detection across every door, window and room, with instant alerts wherever you are.",
    points: [
      "Wireless door & window contact sensors",
      "Anti-pet PIR motion detectors",
      "High-decibel indoor & outdoor strobe siren",
      "Mobile push alerts & emergency SOS",
    ],
  },
  {
    icon: Droplets,
    title: "Automatic Water Control",
    desc: "Stop climbing to the terrace to check the tank. Automated pumps with level sensing and dry-run protection.",
    points: [
      "Real-time overhead & sump level sensing",
      "Automated pump auto-ON & auto-OFF",
      "Dry-run & voltage surge motor protection",
      "Mobile level monitoring & savings alerts",
    ],
  },
];

const STATS = [
  { value: "30+", label: "KNX projects completed" },
  { value: "100+", label: "Happy clients" },
  { value: "5+", label: "Years of experience" },
  { value: "24/7", label: "Technical support" },
];

const WHY = [
  {
    icon: BadgeCheck,
    title: "Certified, not self-taught",
    body: "KNX is an ISO/IEC 14543 standard and we are certified to work with it. That certification is what separates a proper installation from a hobbyist one.",
  },
  {
    icon: Globe,
    title: "Open standard, no lock-in",
    body: "Any certified manufacturer's device works on a KNX bus. You are never tied to one brand's app or one company's survival.",
  },
  {
    icon: Zap,
    title: "Up to 30% energy savings",
    body: "Sensors, timed scenes and daylight-aware dimming cut consumption measurably — lighting and climate stop running in empty rooms.",
  },
  {
    icon: Thermometer,
    title: "Works when the internet doesn't",
    body: "KNX runs on its own dedicated wiring. Your switches, dimming and scenes keep working in a power cut or broadband outage.",
  },
];

const PROCESS = [
  {
    n: "01",
    title: "Consultation",
    body: "We visit, or talk it through remotely, and work out what is genuinely worth automating in your home — and what isn't.",
  },
  {
    n: "02",
    title: "Design & engineering",
    body: "Circuit drawings, device schedules and ETS project planning, coordinated with your architect and electrician.",
  },
  {
    n: "03",
    title: "Installation & programming",
    body: "Wiring, commissioning and ETS programming by our own technicians — we don't subcontract this part.",
  },
  {
    n: "04",
    title: "Handover & support",
    body: "A walkthrough of your system, clear documentation, and 24/7 technical support after the invoice.",
  },
];

const REVIEWS = [
  {
    quote:
      "Honestly, the best decision we made for our villa in Hosur. The automated entrance gate and night lighting scenes when we arrive home after dark are so convenient. Raghul and Tamilvanan explained everything patiently.",
    name: "Soundarya Selvaraj",
    place: "Hosur",
  },
  {
    quote:
      "We got KNX touch switches and AC climate integration for our duplex home in Indiranagar. The team configured the ETS programming perfectly. Super responsive local support whenever we need tweaks.",
    name: "Shivakumar Swamy",
    place: "Bengaluru",
  },
  {
    quote:
      "Water pump automation saved us so much hassle! No more climbing upstairs to check tank levels or worrying about overflow. SmartNest did a very clean installation at our HSR home.",
    name: "Venkatesh Goud",
    place: "Bengaluru",
  },
  {
    quote:
      "Installed smart locks, video door phone, and Edge-AI CCTV cameras. My family feels 100% secure whether we are at home or traveling outside Hosur. Highly recommend SmartNest!",
    name: "Dr. Ananthakrishnan M.",
    place: "Hosur",
  },
  {
    quote:
      "Our home cinema room and motorized curtain automation work like magic with voice commands. The smooth dimming transition during movie mode is top tier!",
    name: "Divya Ramanathan",
    place: "Bengaluru",
  },
  {
    quote:
      "Automated our 3-floor office space in Koramangala with energy sensors and attendance access controls. Cut our monthly electricity bill by almost 22%. Excellent commercial solution!",
    name: "Chandrashekar Raju",
    place: "Bengaluru",
  },
];

/** Two letters from a name, for the avatar. */
function initials(name: string) {
  return name
    .replace(/^(Dr|Mr|Mrs|Ms)\.?\s+/i, "")
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

const WA = "https://wa.me/916384079529?text=" + encodeURIComponent(
  "Hello SmartNest! I would like to know more about KNX smart home automation."
);

export default function ApplePage() {
  return (
    <div className="ap-root">
      {/* ── Nav ─────────────────────────────────────────────────────── */}
      <header className="ap-nav">
        <div className="ap-nav-inner">
          <a href="#top" className="ap-logo">
            <span className="ap-logo-mark" aria-hidden>
              <span />
              <span />
              <span />
            </span>
            SmartNest
          </a>

          <nav className="ap-nav-links" aria-label="Main">
            {NAV.map((n) => (
              <a key={n.href} href={n.href}>
                {n.label}
              </a>
            ))}
          </nav>

          <a className="ap-nav-cta" href="#contact">
            Get a quote
          </a>
        </div>
      </header>

      <main id="top">
        {/* ── Hero ──────────────────────────────────────────────────── */}
        <section className="ap-hero ap-section">
          <div className="ap-wrap">
            <span className="ap-eyebrow ap-rise ap-rise-1">
              Certified KNX Partner · Hosur & Bengaluru
            </span>

            <h1 className="ap-h1 ap-rise ap-rise-2">
              Smart living.
              <br />
              Simplified.
            </h1>

            <p className="ap-lead ap-hero-lead ap-rise ap-rise-3">
              Certified KNX automation for luxury homes and villas — lighting, climate,
              gates, security and water, designed and programmed as one system.
            </p>

            <div className="ap-actions ap-hero-actions ap-rise ap-rise-4">
              <a className="ap-btn ap-btn-primary" href="#contact">
                Book a consultation <ArrowRight size={17} />
              </a>
              <a className="ap-btn ap-btn-ghost" href="#demo">
                Try the live KNX demo
              </a>
            </div>

            <div className="ap-hero-badges ap-rise ap-rise-4">
              <span className="ap-badge">
                <BadgeCheck /> ISO/IEC 14543 certified
              </span>
              <span className="ap-badge">
                <Zap /> Up to 30% energy savings
              </span>
              <span className="ap-badge">
                <ShieldCheck /> KNX Secure protocol
              </span>
            </div>
          </div>

          <div className="ap-wide">
            <div className="ap-hero-media ap-rise ap-rise-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/scene-villa-dusk.jpg"
                alt="Modern luxury villa at dusk with warm interior lighting and landscaped garden lighting, installed by SmartNest"
                width={1536}
                height={1024}
              />
            </div>
          </div>
        </section>

        {/* ── Partner strip ─────────────────────────────────────────── */}
        <section className="ap-section-sm ap-alt">
          <div className="ap-wrap ap-center">
            <p className="ap-small" style={{ marginBottom: 4 }}>
              Certified interoperability — we work with the hardware you trust
            </p>
            <div className="ap-partners">
              {[
                "Schneider Electric",
                "KNX",
                "GM Modular",
                "CP Plus",
                "Hikvision",
                "Ajax Systems",
                "DALI",
                "Honeywell",
                "Yale",
                "ZKTeco",
                "HomeMate",
                "Sonoff",
              ].map((p) => (
                <span key={p} className="ap-partner">
                  {p}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* ── Services ──────────────────────────────────────────────── */}
        <section className="ap-section-lg" id="services">
          <div className="ap-wrap">
            <div className="ap-center">
              <span className="ap-eyebrow">Our capabilities</span>
              <h2 className="ap-h2">
                Everything your home needs.
                <br />
                Under one roof.
              </h2>
              <p className="ap-lead" style={{ marginTop: 22 }}>
                From a single wireless switch to a fully wired KNX villa — we design,
                install, program and support every system we sell.
              </p>
            </div>

            <div className="ap-grid">
              {SERVICES.map((s, i) => {
                const Icon = s.icon;
                return (
                  <article
                    key={s.title}
                    className={`ap-card ${i % 2 === 1 ? "ap-alt" : ""}`}
                    style={i % 2 === 1 ? { background: "#f5f5f7" } : undefined}
                  >
                    <span className="ap-card-icon">
                      <Icon aria-hidden />
                    </span>
                    <h3 className="ap-h4">{s.title}</h3>
                    <p className="ap-card-desc">{s.desc}</p>
                    <ul className="ap-features">
                      {s.points.map((p) => (
                        <li key={p}>
                          <Check aria-hidden />
                          {p}
                        </li>
                      ))}
                    </ul>
                    <a className="ap-link" href="#contact">
                      Get a quote <ArrowRight />
                    </a>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── KNX interactive demo ──────────────────────────────────── */}
        <section className="ap-section-lg ap-dark" id="demo">
          <div className="ap-wide">
            <div className="ap-center">
              <span className="ap-eyebrow">Live interactive demonstration</span>
              <h2 className="ap-h2">
                See how KNX actually behaves.
              </h2>
              <p className="ap-lead" style={{ marginTop: 22 }}>
                Tap a room to switch its lighting, or choose a scene and watch every
                system respond together — exactly as it would on a real KNX bus.
              </p>
            </div>

            <KnxDemo />
          </div>
        </section>

        {/* ── Why KNX + stats ───────────────────────────────────────── */}
        <section className="ap-section-lg" id="why">
          <div className="ap-wrap">
            <div className="ap-split">
              <div>
                <span className="ap-eyebrow">Why KNX</span>
                <h2 className="ap-h2">
                  The difference is
                  <br />
                  the wiring.
                </h2>
                <p className="ap-body" style={{ marginTop: 20 }}>
                  Most &ldquo;smart homes&rdquo; are a collection of WiFi gadgets from
                  different brands held together by apps. KNX is a single, certified,
                  wired standard — which is why it behaves differently when it matters.
                </p>

                <ul className="ap-points">
                  {WHY.map((w) => {
                    const Icon = w.icon;
                    return (
                      <li key={w.title} className="ap-point">
                        <span className="ap-point-icon">
                          <Icon aria-hidden />
                        </span>
                        <div>
                          <h4 className="ap-h4">{w.title}</h4>
                          <p>{w.body}</p>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>

              <div className="ap-split-media">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/scene-living-ambient.jpg"
                  alt="Living room at night with layered warm lighting and automated curtains, controlled over KNX"
                  width={1536}
                  height={1024}
                />
              </div>
            </div>

            <ul className="ap-stats" style={{ marginTop: 96 }}>
              {STATS.map((s) => (
                <li key={s.label}>
                  <span className="ap-stat-value">{s.value}</span>
                  <span className="ap-stat-label">{s.label}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ── Process ───────────────────────────────────────────────── */}
        {/* ── Spaces ────────────────────────────────────────────────── */}
        <section className="ap-section-lg ap-dark" id="spaces">
          <div className="ap-wide">
            <div className="ap-center">
              <span className="ap-eyebrow">Spaces</span>
              <h2 className="ap-h2">
                Designed around
                <br />
                the way you live.
              </h2>
              <p className="ap-lead" style={{ marginTop: 22 }}>
                Every one of these is a scene your home shifts into with a single tap —
                morning light, cinema dark, garden at dusk. Flip through, then drag the
                gallery.
              </p>
            </div>

            <div className="ap-spaces">
              <div className="ap-spaces-flip">
                <ImageFlip
                  images={[
                    {
                      image: {
                        src: "/images/scene-living-ambient.jpg",
                        alt: "Living room in warm evening light with layered cove and sconce lighting",
                      },
                      focusY: 50,
                    },
                    {
                      image: {
                        src: "/images/scene-cinema.jpg",
                        alt: "Home cinema set to movie mode with low ambient lighting",
                      },
                      focusY: 50,
                    },
                    {
                      image: {
                        src: "/images/scene-foyer.jpg",
                        alt: "Entrance foyer with concealed step lighting switched on",
                      },
                      focusY: 50,
                    },
                    {
                      image: {
                        src: "/images/scene-terrace.jpg",
                        alt: "Villa terrace and pool lighting at dusk",
                      },
                      focusY: 50,
                    },
                  ]}
                  fit="cover"
                  rounded={18}
                  tilt
                  tiltOptions={{ effect: "repel", tiltLimit: 8, scale: 103 }}
                />
                <p className="ap-spaces-hint">
                  Click either side of the card to flip through scenes
                </p>
              </div>
            </div>
          </div>

          <div className="ap-spaces-carousel" aria-label="Rotating gallery of interiors">
            <RoundCarousel
              imageWidth={190}
              imageHeight={240}
              spacing={2.1}
              speed={1.4}
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
        </section>

        <section className="ap-section" id="process">
          <div className="ap-wrap">
            <div className="ap-center">
              <span className="ap-eyebrow">How we work</span>
              <h2 className="ap-h2">Four steps, no surprises.</h2>
            </div>

            <ol className="ap-steps">
              {PROCESS.map((p) => (
                <li key={p.n} className="ap-step">
                  <span className="ap-step-num">{p.n}</span>
                  <h4 className="ap-h4">{p.title}</h4>
                  <p>{p.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ── Reviews ───────────────────────────────────────────────── */}
        <section className="ap-section-lg ap-alt" id="reviews">
          <div className="ap-wrap">
            <div className="ap-center">
              <span className="ap-eyebrow">Client experiences</span>
              <h2 className="ap-h2">Homes we&apos;ve already done.</h2>
              <p className="ap-lead" style={{ marginTop: 22 }}>
                Real reviews from homeowners and business owners across Hosur and
                Bengaluru.
              </p>
            </div>

            <div className="ap-quotes">
              {REVIEWS.map((r) => (
                <figure key={r.name} className="ap-quote">
                  <span className="ap-quote-mark" aria-hidden>
                    &ldquo;
                  </span>
                  <blockquote style={{ margin: 0 }}>
                    <p>{r.quote}</p>
                  </blockquote>
                  <figcaption className="ap-quote-who">
                    <span className="ap-avatar" aria-hidden>
                      {initials(r.name)}
                    </span>
                    <span>
                      <strong>{r.name}</strong>
                      <small>{r.place}</small>
                    </span>
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>

        {/* ── Contact ───────────────────────────────────────────────── */}
        <section className="ap-section-lg ap-dark" id="contact">
          <div className="ap-wrap">
            <div className="ap-contact">
              <div>
                <span className="ap-eyebrow">Get started</span>
                <h2 className="ap-h2">
                  Tell us about
                  <br />
                  your home.
                </h2>
                <p className="ap-body" style={{ marginTop: 20, maxWidth: 460 }}>
                  No obligation, no pressure. We&apos;ll come back within one working
                  day with an honest view of what&apos;s worth doing.
                </p>

                <ul className="ap-contact-list">
                  <li>
                    <span className="ap-contact-icon">
                      <Phone aria-hidden />
                    </span>
                    <span>
                      <strong>Call us</strong>
                      <a href="tel:+916384079529">+91 63840 79529</a>
                      <br />
                      <a href="tel:+919655952225">+91 96559 52225</a>
                    </span>
                  </li>
                  <li>
                    <span className="ap-contact-icon">
                      <MessageCircle aria-hidden />
                    </span>
                    <span>
                      <strong>WhatsApp</strong>
                      <a href={WA} target="_blank" rel="noopener noreferrer">
                        Chat with us directly
                      </a>
                    </span>
                  </li>
                  <li>
                    <span className="ap-contact-icon">
                      <Mail aria-hidden />
                    </span>
                    <span>
                      <strong>Email</strong>
                      <a href="mailto:smartnest5030@gmail.com">
                        smartnest5030@gmail.com
                      </a>
                    </span>
                  </li>
                  <li>
                    <span className="ap-contact-icon">
                      <MapPin aria-hidden />
                    </span>
                    <span>
                      <strong>Where we work</strong>
                      <span>Hosur &amp; Bengaluru, India</span>
                    </span>
                  </li>
                </ul>

                <p className="ap-small" style={{ marginTop: 26 }}>
                  Led by <strong style={{ color: "#eef3fa" }}>Raghul S</strong> and{" "}
                  <strong style={{ color: "#eef3fa" }}>Tamilvanan B</strong> — the same
                  people who will answer your call.
                </p>
              </div>

              <ContactForm />
            </div>
          </div>
        </section>

        {/* ── Footer ────────────────────────────────────────────────── */}
        <footer className="ap-footer">
          <div className="ap-wrap">
            <div className="ap-footer-top">
              <a href="#top" className="ap-logo">
                <span className="ap-logo-mark" aria-hidden>
                  <span />
                  <span />
                  <span />
                </span>
                SmartNest
              </a>
              <p className="ap-small" style={{ margin: 0 }}>
                Smart living simplified and amplified.
              </p>
            </div>

            <nav className="ap-footer-links" aria-label="Footer">
              {NAV.map((n) => (
                <a key={n.href} href={n.href}>
                  {n.label}
                </a>
              ))}
              <Link href="/classic">Previous design</Link>
            </nav>

            <div className="ap-footer-bottom">
              <span>© 2026 SmartNest. All rights reserved.</span>
              <span>
                <Fingerprint
                  size={12}
                  style={{ verticalAlign: -2, marginRight: 6 }}
                  aria-hidden
                />
                LED &amp; KNX automation · Hosur &amp; Bengaluru
              </span>
            </div>
          </div>
        </footer>
      </main>

      {/* ── Floating WhatsApp ───────────────────────────────────────── */}
      <a
        className="ap-wa"
        href={WA}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with SmartNest on WhatsApp"
      >
        <MessageCircle aria-hidden />
        <span>WhatsApp</span>
      </a>
    </div>
  );
}
