# Build the SmartNest 3BHK villa GLB

The Blender script creates an **original**, two-storey furnished 3BHK villa with architectural openings, glass, interior partitions, furniture, landscaping, lighting fixtures, KNX switch plates, motorised curtain panels, and named automation nodes. It is designed for the SmartNest demo and does not copy ICG's proprietary gallery model.

## Requirements

- Blender 3.6 or newer (the script uses Blender's bundled `bpy` module).
- No pip packages or external model assets are required.

## Build on macOS

From the repository root, run Blender in background mode:

```bash
/Applications/Blender.app/Contents/MacOS/Blender \
  -b --python scripts/build_smartnest_3bhk_villa.py -- \
  public/models/smartnest-3bhk-villa.glb
```

Or open Blender, go to **Scripting**, open `scripts/build_smartnest_3bhk_villa.py`, and press **Run Script**. With no output path, it writes `smartnest_3bhk_villa.glb` to Blender's current working directory.

## Scale and contents

- Footprint: approximately 12 m × 10 m; two 3.05 m storeys.
- Rooms: living, dining, kitchen, foyer, shared bath, master suite, bedrooms 2 and 3, landing, and upper bath.
- GLB node names prefixed with `KNX_` identify lighting, switches, curtain tracks, climate setpoint, away-scene, and the front-door pivot.

The current `/tour` renderer still builds its villa procedurally in `components/tour/buildVilla.ts`. Once Blender has produced the GLB, add it to the repo and the viewer can be switched to load that asset and connect the named KNX nodes to the control panel.
