import type { Metadata } from "next";
import "../globals.css";

/**
 * The classic (pre-redesign) homepage.
 *
 * Kept so the two designs can still be compared side by side, but set to
 * noindex: two near-identical URLs both indexed would split ranking
 * signals and let Google pick the wrong one as canonical.
 */
export const metadata: Metadata = {
  title: "SmartNest — Classic design (archived)",
  description:
    "The previous SmartNest homepage design, kept for comparison. The current site is at smartnests.in.",
  robots: { index: false, follow: false },
};

export default function ClassicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
