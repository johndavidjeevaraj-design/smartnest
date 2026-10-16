"use client";

import { motion, useReducedMotion, useScroll, useSpring } from "motion/react";

/**
 * Thin progress bar pinned to the top of the viewport.
 *
 * The page is long and mostly scroll-driven, so "how much is left" is
 * real information rather than decoration. Spring-smoothed so it trails
 * the scroll slightly instead of twitching on every wheel tick.
 *
 * Decorative for assistive tech — the sections themselves are the
 * navigation, and a progress readout would just be noise in the
 * reading order.
 */
export default function ScrollProgress() {
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 150,
    damping: 26,
    restDelta: 0.001,
  });

  if (reduce) return null;

  return <motion.div className="ap-progress" style={{ scaleX }} aria-hidden />;
}
