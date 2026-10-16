"use client";

import {
  animate,
  useInView,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
} from "motion/react";
import { useEffect, useRef } from "react";

/**
 * Counts a number up the first time it scrolls into view.
 *
 * The proof points on this page (30+ projects, 100+ clients) are the only
 * hard evidence a visitor gets, and a number that arrives by counting
 * reads as measured rather than asserted.
 *
 * Three details worth keeping:
 *
 * - The motion value starts at the *final* number, so the server-rendered
 *   HTML and the no-JS view both show the real figure. A counter that
 *   renders "0+" to a crawler would be worse than no counter at all.
 * - It fires 120px before the element is actually visible, so the reset to
 *   zero happens off-screen. Resetting on the frame the number scrolls
 *   into view is the classic way this effect looks broken.
 * - The digits are written straight to the DOM node rather than through
 *   React state. Sixty re-renders a second to change one text node is a
 *   lot of work for a flourish.
 */
export default function CountUp({
  to,
  suffix = "",
  duration = 1500,
  className,
}: {
  to: number;
  suffix?: string;
  duration?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px 120px 0px" });
  const reduce = useReducedMotion();

  const count = useMotionValue(to);

  useMotionValueEvent(count, "change", (value) => {
    const el = ref.current;
    if (el) el.textContent = `${Math.round(value)}${suffix}`;
  });

  useEffect(() => {
    if (!inView || reduce) return;

    count.set(0);
    const controls = animate(count, to, {
      duration: duration / 1000,
      ease: [0.16, 1, 0.3, 1],
    });
    return () => controls.stop();
  }, [inView, reduce, to, duration, count]);

  return (
    <span ref={ref} className={className}>
      {to}
      {suffix}
    </span>
  );
}
