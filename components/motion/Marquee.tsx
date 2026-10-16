"use client";

import { useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

/**
 * Infinite horizontal scroller.
 *
 * The track holds two identical groups and translates by exactly -50%,
 * so the loop is seamless — the moment the first group has fully left,
 * the copy sits precisely where it started. The duplicate is hidden from
 * assistive tech so the list is not announced twice.
 *
 * Reduced motion gets a wrapped, static list instead of a slow crawl,
 * which is the honest fallback: motion that never stops is exactly what
 * the preference is asking us not to do.
 */
export default function Marquee({
  items,
  className,
  speed = 46,
  reverse = false,
}: {
  items: ReactNode[];
  className?: string;
  /** Seconds for one full pass. Higher is slower. */
  speed?: number;
  reverse?: boolean;
}) {
  const reduce = useReducedMotion();

  if (reduce) {
    return <ul className={`ap-marquee-static ${className ?? ""}`}>{items.map((item, i) => <li key={i}>{item}</li>)}</ul>;
  }

  return (
    <div className={`ap-marquee ${className ?? ""}`}>
      <div
        className={`ap-marquee-track${reverse ? " ap-marquee-reverse" : ""}`}
        style={{ animationDuration: `${speed}s` }}
      >
        <ul className="ap-marquee-group">{items.map((item, i) => <li key={i}>{item}</li>)}</ul>
        <ul className="ap-marquee-group" aria-hidden>
          {items.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
