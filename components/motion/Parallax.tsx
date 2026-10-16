"use client";

import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "motion/react";
import { useRef, type ReactNode } from "react";

/**
 * Scroll-linked parallax.
 *
 * The element drifts against the page as it passes through the viewport.
 * Kept shallow (a few dozen px) on purpose — parallax reads as depth at
 * 30px and as a broken layout at 300px.
 */
export default function Parallax({
  children,
  className,
  /** Total travel in px across the full scroll pass. Negative moves up. */
  distance = -60,
}: {
  children: ReactNode;
  className?: string;
  distance?: number;
}) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  // Spring-smoothed so a trackpad flick doesn't jolt the layer.
  const smooth = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    restDelta: 0.001,
  });
  const y = useTransform(smooth, [0, 1], [-distance, distance]);

  if (reduce) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div ref={ref} className={className} style={{ y }}>
      {children}
    </motion.div>
  );
}
