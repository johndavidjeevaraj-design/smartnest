"use client";

import { FIRST_WALLS, GROUND_WALLS, PLAN_ROOMS, type PlanRoom } from "./plan";

const VB = { x: -9.5, y: -17.6, w: 20.5, h: 27.4 };

export default function FloorPlan({
  floor,
  onFloor,
  selected,
  onSelect,
  onClose,
}: {
  floor: "g" | "f";
  onFloor: (f: "g" | "f") => void;
  selected: string | null;
  onSelect: (r: PlanRoom) => void;
  onClose: () => void;
}) {
  const walls = floor === "g" ? GROUND_WALLS : FIRST_WALLS;
  const rooms = PLAN_ROOMS.filter((r) => r.floor === floor);

  return (
    <div className="vt-plan">
      <div className="vt-plan-head">
        <div>
          <span className="vt-plan-kicker">Floor plan</span>
          <h2 className="vt-plan-title">
            {floor === "g" ? "Ground floor" : "First floor"}
          </h2>
        </div>
        <button type="button" className="vt-plan-x" onClick={onClose} aria-label="Close floor plan">
          ×
        </button>
      </div>

      <div className="vt-plan-seg" role="group" aria-label="Floor">
        <button
          type="button"
          className={floor === "g" ? "is-on" : ""}
          aria-pressed={floor === "g"}
          onClick={() => onFloor("g")}
        >
          Ground
        </button>
        <button
          type="button"
          className={floor === "f" ? "is-on" : ""}
          aria-pressed={floor === "f"}
          onClick={() => onFloor("f")}
        >
          First
        </button>
      </div>

      <svg className="vt-plan-svg" viewBox={`${VB.x} ${VB.y} ${VB.w} ${VB.h}`} role="img"
        aria-label={`${floor === "g" ? "Ground" : "First"} floor plan`}>
        <defs>
          <pattern id="vt-grid" width="1" height="1" patternUnits="userSpaceOnUse">
            <path d="M 1 0 L 0 0 0 1" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="0.03" />
          </pattern>
        </defs>

        <rect x={VB.x} y={VB.y} width={VB.w} height={VB.h} fill="url(#vt-grid)" />

        {rooms.map((r) => {
          const on = selected === r.id;
          return (
            <g
              key={r.id}
              className={`vt-plan-room${on ? " is-on" : ""}`}
              onClick={() => onSelect(r)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onSelect(r);
                }
              }}
              aria-label={r.label}
            >
              <circle cx={r.cx} cy={r.cz} r={on ? 0.62 : 0.46} className="vt-zone-dot" />
              <circle cx={r.cx} cy={r.cz} r={0.16} className="vt-zone-core" />
              <text x={r.cx} y={r.cz + 1.15} textAnchor="middle" className="vt-plan-label">
                {r.label}
              </text>
            </g>
          );
        })}

        {walls.map((w, i) => (
          <rect
            key={i}
            className={w.kind === "mass" ? "vt-plan-wall" : "vt-plan-slab"}
            x={w.x0}
            y={w.z0}
            width={w.x1 - w.x0}
            height={w.z1 - w.z0}
          />
        ))}

        <text x={-9} y={8.3} className="vt-plan-note">
          street
        </text>
      </svg>

      <p className="vt-plan-foot">
        Massing measured from the model. Dots are the automation zones — pick one
        to walk to it.
      </p>
    </div>
  );
}
