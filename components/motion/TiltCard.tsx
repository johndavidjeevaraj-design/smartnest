"use client";

import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "motion/react";
import { useRef, type CSSProperties, type ReactNode } from "react";

/**
 * A card that tilts toward the pointer, with a soft light that follows
 * the cursor across its surface.
 *
 * The tilt is on the outer element, which is also the grid item — so the
 * card itself moves rather than its contents sliding around inside a
 * static frame. Entrance animation rides on the same element so there is
 * no wrapper to break the grid.
 *
 * The pointer tracking is capped low (default 5deg). Past about 8deg it
 * stops reading as depth and starts reading as a gimmick, and text on
 * the card starts to look like it is sliding.
 */
export default function TiltCard({
  children,
  className,
  style,
  index = 0,
  max = 5,
  glow = "rgba(0, 168, 232, 0.16)",
}: {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  index?: number;
  max?: number;
  glow?: string;
}) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLElement>(null);

  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);
  const spring = { stiffness: 170, damping: 20, restDelta: 0.001 };
  const sx = useSpring(px, spring);
  const sy = useSpring(py, spring);

  const rotateY = useTransform(sx, [0, 1], [-max, max]);
  const rotateX = useTransform(sy, [0, 1], [max, -max]);

  const lightX = useTransform(sx, (v) => `${v * 100}%`);
  const lightY = useTransform(sy, (v) => `${v * 100}%`);
  const background = useMotionTemplate`radial-gradient(320px circle at ${lightX} ${lightY}, ${glow}, transparent 72%)`;

  const handleMove = (event: React.PointerEvent<HTMLElement>) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    px.set((event.clientX - rect.left) / rect.width);
    py.set((event.clientY - rect.top) / rect.height);
  };

  const handleLeave = () => {
    px.set(0.5);
    py.set(0.5);
  };

  if (reduce) {
    return (
      <article className={className} style={style}>
        {children}
      </article>
    );
  }

  return (
    <motion.article
      ref={ref as React.Ref<HTMLElement>}
      className={className}
      style={{ ...style, rotateX, rotateY, transformPerspective: 1000 }}
      onPointerMove={handleMove}
      onPointerLeave={handleLeave}
      initial={{ opacity: 0, y: 26 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-70px" }}
      transition={{
        duration: 0.62,
        delay: Math.min(index, 6) * 0.055,
        ease: [0.16, 1, 0.3, 1],
      }}
    >
      <motion.span
        className="ap-tilt-glow"
        aria-hidden
        style={{ background }}
      />
      {children}
    </motion.article>
  );
}
