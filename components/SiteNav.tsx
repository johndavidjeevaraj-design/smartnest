"use client";

import { useEffect, useState } from "react";

interface NavLink {
  href: string;
  label: string;
}

/**
 * The site header.
 *
 * Below 1024px the horizontal link row is hidden — there is no room for
 * seven items plus the logo — so the burger takes over. It has to be a
 * client component because the open/closed state and the scroll-spy are
 * the whole point; the link list itself is passed in from the server
 * component so there is still exactly one source of truth for the nav.
 *
 * The scroll-spy matters on a page this long: without it there is no way
 * to tell which section you are in from the header alone.
 */
export default function SiteNav({ links }: { links: NavLink[] }) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<string>("");

  // Escape closes the panel, and the panel closes itself whenever the
  // viewport grows back past the breakpoint where it is even shown.
  useEffect(() => {
    if (!open) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    const onResize = () => {
      if (window.innerWidth > 1024) setOpen(false);
    };

    window.addEventListener("keydown", onKey);
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onResize);
    };
  }, [open]);

  // Scroll-spy: whichever section owns an invisible "reading line" just
  // below the sticky header is the current one.
  //
  // An IntersectionObserver is the obvious tool here, but it only ever
  // reports the sections that are intersecting — so scrolling back to the
  // top leaves the last section it saw still lit up, because nothing new
  // ever fires to clear it. Reading the geometry on scroll is
  // deterministic: above the first section nothing is current, and that
  // is exactly what gets rendered.
  useEffect(() => {
    const sections = links
      .map((l) => document.querySelector(l.href))
      .filter((el): el is Element => el !== null);

    if (!sections.length) return;

    let frame = 0;

    const update = () => {
      frame = 0;
      const line = 120; // just under the 52px header
      let current = "";

      for (const el of sections) {
        const rect = el.getBoundingClientRect();
        if (rect.top <= line && rect.bottom > line) {
          current = `#${el.id}`;
          break;
        }
      }

      setActive((prev) => (prev === current ? prev : current));
    };

    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    update();

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [links]);

  return (
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
          {links.map((n) => (
            <a
              key={n.href}
              href={n.href}
              aria-current={active === n.href ? "true" : undefined}
              className={active === n.href ? "is-active" : undefined}
            >
              {n.label}
            </a>
          ))}
        </nav>

        <a className="ap-nav-cta" href="#contact">
          Get a quote
        </a>

        <button
          type="button"
          className="ap-burger"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          aria-controls="ap-mobile-menu"
          onClick={() => setOpen((v) => !v)}
        >
          <span className={`ap-burger-box${open ? " is-open" : ""}`} aria-hidden>
            <span />
            <span />
          </span>
        </button>
      </div>

      {open && (
        <div className="ap-mobile-menu" id="ap-mobile-menu">
          <nav aria-label="Sections">
            {links.map((n) => (
              <a
                key={n.href}
                href={n.href}
                aria-current={active === n.href ? "true" : undefined}
                onClick={() => setOpen(false)}
              >
                {n.label}
              </a>
            ))}
          </nav>

          <a
            className="ap-mobile-cta"
            href="#contact"
            onClick={() => setOpen(false)}
          >
            Book a consultation
          </a>
        </div>
      )}
    </header>
  );
}
