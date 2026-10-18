"use client";

import { motion, useReducedMotion, type Variants } from "motion/react";
import { createElement, type ComponentType, type ReactNode } from "react";

/**
 * Scroll-triggered entrance.
 *
 * Deliberately polymorphic and hover-free: it renders the element the
 * caller asks for and takes the caller's className, so it can *be* the
 * grid item rather than wrapping one. A wrapper div inside a CSS grid
 * or a <ul> would silently break the layout, which is exactly the kind
 * of bug that only shows up on screen.
 *
 * `index` gives cheap stagger without needing a container component in
 * the tree, so any list can stagger itself from a .map().
 */

const TAGS = {
  div: motion.div,
  li: motion.li,
  article: motion.article,
  section: motion.section,
  span: motion.span,
  ol: motion.ol,
  ul: motion.ul,
  p: motion.p,
  figure: motion.figure,
} as const;

type Tag = keyof typeof TAGS;

/** Stable shared props for the dynamically selected motion primitive. */
type RevealMotionProps = {
  children?: ReactNode;
  className?: string;
  initial: { opacity: number; y: number };
  whileInView: { opacity: number; y: number };
  viewport: { once: boolean; margin: string };
  transition: { duration: number; delay: number; ease: number[] };
};

interface RevealProps {
  children: ReactNode;
  /** Which element to render. Defaults to div. */
  as?: Tag;
  /** Position in a list — drives the stagger delay. */
  index?: number;
  /** Per-item delay on top of the stagger, in seconds. */
  delay?: number;
  /** How far it travels, in px. */
  y?: number;
  className?: string;
  /** Set false for large blocks that would feel sluggish travelling. */
  fade?: boolean;
}

export default function Reveal({
  children,
  as = "div",
  index = 0,
  delay = 0,
  y = 24,
  className,
  fade = true,
}: RevealProps) {
  const reduce = useReducedMotion();
  const Tag = TAGS[as] as unknown as ComponentType<RevealMotionProps>;

  // Reduced motion and no-JS both get a plain, fully visible element.
  // createElement avoids intersecting the incompatible prop unions that
  // React 19 and newer Motion types produce for a runtime-selected tag.
  if (reduce) return createElement(as, { className }, children);

  const step = Math.min(index, 6) * 0.055;

  return createElement(
    Tag,
    {
      className,
      initial: { opacity: fade ? 0 : 1, y },
      whileInView: { opacity: 1, y: 0 },
      viewport: { once: true, margin: "-70px" },
      transition: {
        duration: 0.62,
        delay: step + delay,
        ease: [0.16, 1, 0.3, 1],
      },
    },
    children,
  );
}

/** Variants for callers that want to drive a whole subtree themselves. */
export const staggerParent: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06, delayChildren: 0.05 } },
};

export const staggerChild: Variants = {
  hidden: { opacity: 0, y: 22 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
};
