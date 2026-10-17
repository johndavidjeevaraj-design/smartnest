"use client";

import { FIRST_WALLS, GROUND_WALLS, PLAN_ROOMS, type PlanRoom } from "./plan";

const VB = { x: -7.2, y: -6.2, w: 14.4, h: 13.0 };

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
          const w = r.x1 - r.x0;
          const d = r.z1 - r.z0;
          const area = Math.round(w * d);
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
              aria-label={`${r.label}, ${area} square metres`}
            >
              <rect x={r.x0} y={r.z0} width={w} height={d} rx={0.04} />
              <text
                x={r.cx}
                y={r.cz - (w < 1.4 ? 0.1 : 0)}
                textAnchor="middle"
                dominantBaseline="middle"
                className={w < 1.4 ? "vt-plan-label vt-plan-label-sm" : "vt-plan-label"}
              >
                {w < 1.4 ? "" : r.label}
              </text>
              {w >= 1.4 && (
                <text
                  x={r.cx}
                  y={r.cz + 0.55}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="vt-plan-area"
                >
                  {area} m²
                </text>
              )}
              {w < 1.4 && (
                <text x={r.cx} y={r.cz} textAnchor="middle" dominantBaseline="middle" className="vt-plan-area">
                  {area}
                </text>
              )}
            </g>
          );
        })}

        {walls.map((w, i) => (
          <rect
            key={i}
            className="vt-plan-wall"
            x={w.x0}
            y={w.z0}
            width={Math.max(0.05, w.x1 - w.x0)}
            height={Math.max(0.05, w.z1 - w.z0)}
          />
        ))}

        <text x={-7} y={5.9} className="vt-plan-note">
          front of house
        </text>
      </svg>

      <p className="vt-plan-foot">
        Drawn from the same dimensions the house is built with. Pick a room to
        walk into it.
      </p>
    </div>
  );
}
