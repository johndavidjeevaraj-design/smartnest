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
 * client component because the open/closed state is the whole point;
 * the link list itself is passed in from the server component so there
 * is still exactly one source of truth for the nav.
 */
export default function SiteNav({ links }: { links: NavLink[] }) {
  const [open, setOpen] = useState(false);

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
            <a key={n.href} href={n.href}>
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
              <a key={n.href} href={n.href} onClick={() => setOpen(false)}>
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
