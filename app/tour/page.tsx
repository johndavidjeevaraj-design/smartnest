import type { Metadata } from "next";
import TourClient from "@/components/tour/TourClient";
import "./tour.css";

export const metadata: Metadata = {
  title: "Walk the villa — SmartNest",
  description:
    "A real villa, modelled to scale and wired for KNX. Drag to walk around it, click any room to switch its lighting, open the gate and drop the curtains.",
};

export default function TourPage() {
  return <TourClient />;
}
