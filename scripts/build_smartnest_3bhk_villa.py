"""Build an original, furnished SmartNest 3BHK villa and export it as GLB.

This is an original procedural residential model inspired by refined, material-led
architecture. It does NOT extract or reproduce the ICG Gallery's proprietary model.

Run with Blender 3.6+ (Blender's bundled Python has bpy):
    blender -b --python scripts/build_smartnest_3bhk_villa.py -- /path/to/smartnest_3bhk_villa.glb

If no output path is supplied, writes smartnest_3bhk_villa.glb in the current folder.
The model is metres-at-scale: 12m x 10m, two storeys, three bedrooms.
"""
from __future__ import annotations

import os
import sys
import math
import bpy
from mathutils import Matrix, Vector


# ---------------------------- scene / materials ----------------------------

def output_path() -> str:
    args = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
    path = args[0] if args else os.path.abspath("smartnest_3bhk_villa.glb")
    return os.path.abspath(os.path.expanduser(path))


def clear_scene() -> None:
    bpy.ops.object.select_all(action="SELECT")
    bpy.ops.object.delete(use_global=False)
    for datablocks in (bpy.data.meshes, bpy.data.curves, bpy.data.materials, bpy.data.cameras, bpy.data.lights):
        for datablock in list(datablocks):
            if datablock.users == 0:
                datablocks.remove(datablock)


def make_mat(name: str, color, roughness=0.55, metallic=0.0, alpha=1.0, emission=None, emission_strength=0.0):
    mat = bpy.data.materials.new(name)
    mat.diffuse_color = (*color, alpha)
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes.get("Principled BSDF")
    bsdf.inputs["Base Color"].default_value = (*color, alpha)
    bsdf.inputs["Roughness"].default_value = roughness
    bsdf.inputs["Metallic"].default_value = metallic
    if "Alpha" in bsdf.inputs:
        bsdf.inputs["Alpha"].default_value = alpha
    if emission:
        socket = bsdf.inputs.get("Emission Color") or bsdf.inputs.get("Emission")
        if socket:
            socket.default_value = (*emission, 1.0)
        strength = bsdf.inputs.get("Emission Strength")
        if strength:
            strength.default_value = emission_strength
    if alpha < 0.999:
        # Blender 4.x renamed the old blend_method setting.
        if hasattr(mat, "surface_render_method"):
            mat.surface_render_method = "DITHERED"
        elif hasattr(mat, "blend_method"):
            mat.blend_method = "BLEND"
    return mat


M = {}

def materials():
    M.update({
        "plaster": make_mat("Warm limestone plaster", (0.76, 0.70, 0.60), 0.82),
        "interior": make_mat("Soft ivory interior", (0.88, 0.84, 0.76), 0.82),
        "stone": make_mat("Sandstone", (0.46, 0.42, 0.35), 0.86),
        "concrete": make_mat("Architectural concrete", (0.28, 0.30, 0.29), 0.78),
        "wood": make_mat("Natural oak", (0.39, 0.22, 0.11), 0.48),
        "oak_light": make_mat("Light oak", (0.65, 0.46, 0.27), 0.55),
        "dark": make_mat("Graphite metal", (0.055, 0.075, 0.085), 0.32, 0.65),
        "glass": make_mat("Blue grey glazing", (0.24, 0.40, 0.48), 0.16, 0.12, 0.30),
        "brass": make_mat("Brushed champagne metal", (0.55, 0.37, 0.16), 0.28, 0.72),
        "fabric": make_mat("Warm greige upholstery", (0.47, 0.42, 0.35), 0.9),
        "linen": make_mat("Cream linen", (0.87, 0.82, 0.73), 0.95),
        "sage": make_mat("Sage green textile", (0.27, 0.37, 0.31), 0.95),
        "black": make_mat("Obsidian", (0.025, 0.032, 0.04), 0.18, 0.18),
        "white": make_mat("Ceramic white", (0.93, 0.93, 0.89), 0.24),
        "green": make_mat("SmartNest KNX status", (0.03, 0.65, 0.46), 0.28, emission=(0.03, 0.8, 0.55), emission_strength=2.0),
        "warm_light": make_mat("Warm LED diffuser", (1.0, 0.70, 0.35), 0.24, emission=(1.0, 0.55, 0.25), emission_strength=2.4),
        "leaf": make_mat("Landscape foliage", (0.12, 0.23, 0.15), 0.94),
        "soil": make_mat("Garden earth", (0.13, 0.18, 0.13), 1.0),
        "rug": make_mat("Woven rug", (0.69, 0.61, 0.49), 1.0),
    })


def bevel(obj, amount=0.018, segments=2):
    if amount <= 0:
        return
    mod = obj.modifiers.new("Soft architectural edges", "BEVEL")
    mod.width = amount
    mod.segments = segments
    mod.limit_method = "ANGLE"
    normal = obj.modifiers.new("Weighted corner normals", "WEIGHTED_NORMAL")
    normal.keep_sharp = True


def box(name, loc, dims, mat, edge=0.012, parent=None):
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=loc)
    obj = bpy.context.object
    obj.name = name
    obj.dimensions = dims
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    if mat:
        obj.data.materials.append(mat)
    if parent:
        # When parented, `loc` is intentionally a local coordinate (door leaf
        # within its exported hinge pivot), so keep the parent inverse identity.
        obj.parent = parent
        obj.matrix_parent_inverse = Matrix.Identity(4)
    bevel(obj, edge)
    return obj


def empty(name, loc):
    bpy.ops.object.empty_add(type="PLAIN_AXES", location=loc)
    obj = bpy.context.object
    obj.name = name
    obj.empty_display_size = 0.18
    return obj


def cylinder(name, loc, radius, depth, mat, vertices=20, rotation=None):
    bpy.ops.mesh.primitive_cylinder_add(vertices=vertices, radius=radius, depth=depth, location=loc)
    obj = bpy.context.object
    obj.name = name
    if rotation:
        obj.rotation_euler = rotation
    if mat:
        obj.data.materials.append(mat)
    bevel(obj, 0.008, 2)
    return obj


def sphere(name, loc, scale, mat, segments=16, rings=10):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=segments, ring_count=rings, radius=1, location=loc)
    obj = bpy.context.object
    obj.name = name
    obj.scale = scale
    if mat:
        obj.data.materials.append(mat)
    bpy.ops.object.shade_smooth()
    return obj


# ------------------------------ architecture ------------------------------

WT = 0.22
FLOOR_H = 3.05
UPPER_Y = FLOOR_H
ROOF_Y = FLOOR_H * 2


def wall_x(name, z, y0, x0, x1, height, mat=None):
    return box(name, ((x0 + x1) / 2, y0 + height / 2, z), (x1 - x0, height, WT), mat or M["interior"], 0.018)


def wall_z(name, x, y0, z0, z1, height, mat=None):
    return box(name, (x, y0 + height / 2, (z0 + z1) / 2), (WT, height, z1 - z0), mat or M["interior"], 0.018)


def exterior_x(name, z, floor_y, x0, x1, height, windows=(), door=None):
    """Build an x-running outer wall, leaving real window/door openings.
    windows: (center_x,width,sill,head); door: (center_x,width,head).
    """
    openings = []
    for cx, width, sill, head in windows:
        openings.append((cx - width / 2, cx + width / 2, sill, head, "window", (cx, width, sill, head)))
    if door:
        cx, width, head = door
        openings.append((cx - width / 2, cx + width / 2, 0.0, head, "door", (cx, width, 0.0, head)))
    openings.sort(key=lambda op: op[0])
    cursor = x0
    for a, b, sill, head, kind, info in openings:
        if a > cursor:
            wall_x(name + " wall run", z, floor_y, cursor, a, height, M["plaster"])
        if sill > 0:
            box(name + " spandrel", ((a + b) / 2, floor_y + sill / 2, z), (b - a, sill, WT), M["plaster"], 0.012)
        if head < height:
            box(name + " lintel", ((a + b) / 2, floor_y + (head + height) / 2, z), (b - a, height - head, WT), M["plaster"], 0.012)
        if kind == "window":
            window_frame_x(name, z, floor_y, *info)
        cursor = b
    if cursor < x1:
        wall_x(name + " wall run", z, floor_y, cursor, x1, height, M["plaster"])


def window_frame_x(name, z, floor_y, cx, width, sill, head):
    frame = M["dark"]
    hh = head - sill
    box(name + " glazing", (cx, floor_y + sill + hh / 2, z), (width - 0.08, hh - 0.08, 0.045), M["glass"], 0.002)
    for x in (cx - width / 2, cx + width / 2):
        box(name + " jamb", (x, floor_y + sill + hh / 2, z), (0.065, hh + 0.04, 0.09), frame, 0.006)
    box(name + " head frame", (cx, floor_y + head, z), (width + 0.03, 0.065, 0.09), frame, 0.006)
    box(name + " sill frame", (cx, floor_y + sill, z), (width + 0.08, 0.075, 0.13), M["stone"], 0.008)
    if width > 1.15:
        box(name + " mullion", (cx, floor_y + sill + hh / 2, z), (0.035, hh, 0.065), frame, 0.003)


def exterior_z(name, x, floor_y, z0, z1, height, windows=()):
    openings = sorted([(cz - width / 2, cz + width / 2, sill, head, cz, width) for cz, width, sill, head in windows])
    cursor = z0
    for a, b, sill, head, cz, width in openings:
        if a > cursor:
            wall_z(name + " wall run", x, floor_y, cursor, a, height, M["plaster"])
        if sill > 0:
            box(name + " spandrel", (x, floor_y + sill / 2, (a + b) / 2), (WT, sill, b - a), M["plaster"], 0.01)
        if head < height:
            box(name + " lintel", (x, floor_y + (head + height) / 2, (a + b) / 2), (WT, height - head, b - a), M["plaster"], 0.01)
        hh = head - sill
        box(name + " glazing", (x, floor_y + sill + hh / 2, cz), (0.045, hh - 0.08, width - 0.08), M["glass"], 0.002)
        for z in (a, b):
            box(name + " jamb", (x, floor_y + sill + hh / 2, z), (0.09, hh + 0.03, 0.065), M["dark"], 0.005)
        box(name + " head frame", (x, floor_y + head, cz), (0.1, 0.065, width + 0.04), M["dark"], 0.005)
        box(name + " sill", (x, floor_y + sill, cz), (0.14, 0.075, width + 0.08), M["stone"], 0.006)
        if width > 1.2:
            box(name + " mullion", (x, floor_y + sill + hh / 2, cz), (0.065, hh, 0.035), M["dark"], 0.003)
        cursor = b
    if cursor < z1:
        wall_z(name + " wall run", x, floor_y, cursor, z1, height, M["plaster"])


def shell():
    # Base, ground plane and full-scale floor plates.
    box("Stone plinth", (0, -0.12, 0), (12.35, 0.24, 10.35), M["stone"], 0.035)
    box("Ground floor slab", (0, 0.05, 0), (12.0, 0.18, 10.0), M["concrete"], 0.02)
    box("Ground interior floor", (0, 0.15, 0), (11.7, 0.035, 9.7), M["oak_light"], 0.006)
    box("First floor slab", (0, FLOOR_H, 0), (12.0, 0.22, 10.0), M["concrete"], 0.02)
    box("First floor finish", (0, FLOOR_H + 0.13, 0), (11.7, 0.035, 9.7), M["oak_light"], 0.006)

    # Ground-floor façades. The front is +Z and has a full-height glazed entrance.
    exterior_x("Front ground façade", 5.0, 0.15, -6, 6, FLOOR_H - 0.15,
               windows=((-3.9, 2.15, 0.85, 2.45), (0.0, 1.65, 0.85, 2.45)), door=(2.7, 1.05, 2.35))
    exterior_x("Rear ground façade", -5.0, 0.15, -6, 6, FLOOR_H - 0.15,
               windows=((-3.8, 2.3, 0.78, 2.4), (0.0, 2.0, 0.78, 2.4), (4.5, 1.2, 1.0, 2.2)))
    exterior_z("West ground façade", -6.0, 0.15, -5, 5, FLOOR_H - 0.15,
               windows=((-2.8, 1.8, 0.8, 2.35), (2.7, 2.2, 0.8, 2.35)))
    exterior_z("East ground façade", 6.0, 0.15, -5, 5, FLOOR_H - 0.15,
               windows=((-3.1, 1.5, 0.85, 2.3), (2.8, 1.55, 0.85, 2.3)))

    # Upper-storey façades, set back slightly to create a crisp shadow line.
    exterior_x("Front first façade", 4.92, FLOOR_H + 0.15, -5.82, 5.82, FLOOR_H - 0.15,
               windows=((-3.8, 2.4, 0.82, 2.4), (0.0, 1.9, 0.82, 2.4), (4.0, 1.4, 0.82, 2.4)))
    exterior_x("Rear first façade", -4.92, FLOOR_H + 0.15, -5.82, 5.82, FLOOR_H - 0.15,
               windows=((-3.6, 2.2, 0.82, 2.35), (1.2, 1.8, 0.82, 2.35), (4.2, 1.3, 0.82, 2.3)))
    exterior_z("West first façade", -5.92, FLOOR_H + 0.15, -4.92, 4.92, FLOOR_H - 0.15,
               windows=((-2.8, 1.7, 0.85, 2.35), (2.7, 2.0, 0.85, 2.35)))
    exterior_z("East first façade", 5.92, FLOOR_H + 0.15, -4.92, 4.92, FLOOR_H - 0.15,
               windows=((-2.9, 1.6, 0.85, 2.35), (2.9, 1.6, 0.85, 2.35)))

    # Flat roof, parapet and slim dark reveals.
    box("Flat roof", (0, ROOF_Y + 0.15, 0), (12.0, 0.26, 10.0), M["concrete"], 0.03)
    for x in (-5.9, 5.9):
        box("Roof parapet", (x, ROOF_Y + 0.62, 0), (0.18, 0.68, 10.0), M["plaster"], 0.018)
    for z in (-4.92, 4.92):
        box("Roof parapet", (0, ROOF_Y + 0.62, z), (12.0, 0.68, 0.18), M["plaster"], 0.018)
    for y in (3.08, 6.2):
        box("Horizontal façade reveal", (0, y, 0), (12.12, 0.07, 10.12), M["brass"], 0.008)

    # Simple internal partitions with generous openings, making the rooms legible.
    wall_x("Ground partition living / foyer", -0.42, 0.15, -1.6, 1.15, FLOOR_H - 0.15)
    wall_z("Ground kitchen / dining", -1.42, 0.15, -4.9, -0.5, FLOOR_H - 0.15)
    wall_z("Ground dining / service", 2.55, 0.15, -4.9, -2.55, FLOOR_H - 0.15)
    wall_x("Ground bath wall", -2.55, 0.15, 2.55, 4.55, FLOOR_H - 0.15)
    wall_z("Ground bath / store", 4.55, 0.15, -4.9, -0.5, FLOOR_H - 0.15)

    wall_z("First floor bedroom division", -0.35, FLOOR_H + 0.15, -4.9, 4.9, FLOOR_H - 0.15)
    wall_x("First floor bedroom division", 0.55, FLOOR_H + 0.15, -5.8, -0.35, FLOOR_H - 0.15)
    wall_x("First floor east room division", -0.65, FLOOR_H + 0.15, -0.35, 5.8, FLOOR_H - 0.15)
    wall_z("First floor suite division", 2.25, FLOOR_H + 0.15, -0.55, 4.9, FLOOR_H - 0.15)
    wall_x("First floor bath division", 2.0, FLOOR_H + 0.15, 2.25, 5.8, FLOOR_H - 0.15)

    # Front door: a named pivot is kept in the exported scene for later animation.
    pivot = empty("KNX_FRONT_DOOR_PIVOT", (2.18, 0.15, 4.93))
    box("Front entry door leaf", (0.50, 1.16, 0), (1.0, 2.28, 0.10), M["wood"], 0.018, pivot)
    box("Front entry door handle", (0.84, 1.1, 0.065), (0.035, 0.28, 0.035), M["brass"], 0.01, pivot)

    # Stair flight and rails on the east side.
    for i in range(13):
        z = 3.65 - i * 0.30
        y = 0.29 + i * 0.205
        box("Stair tread %02d" % i, (4.55, y, z), (1.2, 0.12, 0.36), M["oak_light"], 0.012)
    box("Stair stringer west", (3.95, 1.55, 1.72), (0.13, 2.8, 4.2), M["dark"], 0.012).rotation_euler[0] = math.radians(-34)
    box("Stair stringer east", (5.15, 1.55, 1.72), (0.13, 2.8, 4.2), M["dark"], 0.012).rotation_euler[0] = math.radians(-34)

    # Entry walk, terrace and understated landscape.
    box("Front terrace", (1.9, 0.18, 6.15), (5.8, 0.12, 2.1), M["stone"], 0.025)
    box("Arrival path", (1.8, 0.11, 10.1), (3.1, 0.10, 6.0), M["concrete"], 0.025)
    box("Front lawn", (-5.4, 0.015, 9.8), (5.2, 0.04, 8.0), M["soil"], 0.04)
    box("Garden lawn", (8.4, 0.015, 9.8), (6.5, 0.04, 8.0), M["soil"], 0.04)
    for x, z, h in ((-8.4, 7.0, 4.0), (10.3, 8.2, 4.8), (-8.0, -3.4, 3.6)):
        cylinder("Tree trunk", (x, h / 2, z), 0.16, h, M["wood"], 12)
        sphere("Tree crown", (x, h + 0.65, z), (1.6, 1.5, 1.6), M["leaf"], 14, 9)


# -------------------------------- furniture --------------------------------

def sofa(name, x, z, width, depth, y=0.18):
    box(name + " base", (x, y + 0.24, z), (width, 0.45, depth), M["fabric"], 0.09)
    box(name + " back", (x, y + 0.72, z - depth * 0.43), (width, 0.72, 0.24), M["fabric"], 0.08)
    for side in (-1, 1):
        box(name + " arm", (x + side * (width / 2 - 0.10), y + 0.48, z), (0.22, 0.55, depth), M["fabric"], 0.07)
    for i in range(3):
        xx = x + (i - 1) * width * 0.27
        box(name + " seat cushion", (xx, y + 0.49, z + 0.02), (width * 0.29, 0.16, depth * 0.63), M["linen"], 0.045)


def table(name, x, z, width, depth, top_y, mat=None, leg_mat=None):
    mat = mat or M["wood"]
    leg_mat = leg_mat or M["dark"]
    thickness = 0.10
    box(name + " top", (x, top_y, z), (width, thickness, depth), mat, 0.025)
    leg_h = top_y - thickness / 2
    for dx in (-1, 1):
        for dz in (-1, 1):
            box(name + " leg", (x + dx * (width / 2 - 0.08), leg_h / 2, z + dz * (depth / 2 - 0.08)), (0.075, leg_h, 0.075), leg_mat, 0.012)


def chair(name, x, z, y=0.15, mat=None):
    mat = mat or M["oak_light"]
    box(name + " seat", (x, y + 0.47, z), (0.48, 0.10, 0.46), mat, 0.035)
    box(name + " back", (x, y + 0.78, z - 0.19), (0.46, 0.58, 0.08), mat, 0.035)
    for dx in (-0.17, 0.17):
        for dz in (-0.16, 0.16):
            box(name + " leg", (x + dx, y + 0.22, z + dz), (0.055, 0.44, 0.055), M["dark"], 0.008)


def bed(name, x, z, width, length, floor_y, cover=None):
    cover = cover or M["linen"]
    box(name + " bed base", (x, floor_y + 0.22, z), (width, 0.42, length), M["wood"], 0.035)
    box(name + " mattress", (x, floor_y + 0.48, z + 0.04), (width - 0.10, 0.20, length - 0.12), M["white"], 0.045)
    box(name + " duvet", (x, floor_y + 0.60, z + 0.25), (width - 0.14, 0.08, length * 0.56), cover, 0.035)
    box(name + " headboard", (x, floor_y + 0.78, z - length / 2 + 0.04), (width + 0.06, 1.15, 0.12), M["oak_light"], 0.04)
    for dx in (-0.23, 0.23):
        box(name + " pillow", (x + dx, floor_y + 0.64, z - length * 0.30), (width * 0.30, 0.12, 0.44), M["white"], 0.055)


def wardrobe(name, x, z, width, floor_y):
    box(name + " carcass", (x, floor_y + 1.15, z), (width, 2.3, 0.65), M["oak_light"], 0.028)
    for i in range(1, 3):
        dx = -width / 2 + width * i / 3
        box(name + " door reveal", (x + dx, floor_y + 1.15, z - 0.34), (0.018, 2.15, 0.02), M["wood"], 0.003)
    for dx in (-width * 0.18, width * 0.18):
        cylinder(name + " pull", (x + dx, floor_y + 1.16, z - 0.38), 0.018, 0.06, M["brass"], 10, (math.pi / 2, 0, 0))


def side_table(name, x, z, floor_y):
    box(name + " top", (x, floor_y + 0.52, z), (0.55, 0.09, 0.50), M["wood"], 0.035)
    box(name + " body", (x, floor_y + 0.27, z), (0.45, 0.45, 0.40), M["oak_light"], 0.025)
    box(name + " drawer line", (x, floor_y + 0.38, z - 0.205), (0.35, 0.018, 0.012), M["brass"], 0.002)


def plant(name, x, z, y=0.15, scale=1.0):
    cylinder(name + " planter", (x, y + 0.24 * scale, z), 0.28 * scale, 0.46 * scale, M["stone"], 20)
    for i, ang in enumerate((0.0, 1.2, 2.4, 3.6, 4.8)):
        px = x + math.cos(ang) * 0.17 * scale
        pz = z + math.sin(ang) * 0.17 * scale
        stem = cylinder(name + " stem", (px, y + 0.78 * scale, pz), 0.025 * scale, 0.95 * scale, M["leaf"], 8)
        stem.rotation_euler[1] = math.sin(ang) * 0.22
        sphere(name + " leaf", (px + math.cos(ang) * 0.15 * scale, y + 1.18 * scale, pz + math.sin(ang) * 0.15 * scale), (0.15 * scale, 0.42 * scale, 0.12 * scale), M["leaf"], 12, 8)


def furnish_ground():
    # Living salon, ground floor (open-plan, front-west).
    box("Living room rug", (-3.75, 0.185, 2.2), (3.9, 0.04, 3.15), M["rug"], 0.025)
    sofa("Living sofa", -3.8, 1.15, 3.15, 1.0, 0.18)
    sofa("Accent loveseat", -4.8, 3.05, 1.85, 0.86, 0.18)
    table("Living coffee table", -3.5, 2.1, 1.4, 0.82, 0.62, M["oak_light"])
    box("Media console", (-5.64, 0.52, 0.6), (0.28, 0.64, 2.3), M["oak_light"], 0.025)
    box("Television", (-5.43, 1.38, 0.6), (0.06, 1.15, 1.95), M["black"], 0.015)
    plant("Living indoor plant", -5.1, 4.05, 0.15, 0.85)

    # Dining table and six chairs.
    table("Dining table", 0.4, -2.35, 2.45, 1.2, 0.95, M["oak_light"])
    for x in (-0.35, 0.42, 1.18):
        chair("Dining chair", x, -3.15, 0.15)
        chair("Dining chair", x, -1.55, 0.15)
    cylinder("Dining pendant canopy", (0.4, 2.98, -2.35), 0.07, 0.05, M["dark"], 16)
    cylinder("Dining pendant stem", (0.4, 2.45, -2.35), 0.018, 1.0, M["brass"], 10)
    sphere("Dining pendant shade", (0.4, 1.98, -2.35), (0.24, 0.12, 0.24), M["dark"])
    sphere("Dining pendant diffuser", (0.4, 1.86, -2.35), (0.16, 0.045, 0.16), M["warm_light"])

    # Contemporary L-kitchen and island.
    for x in (-4.9, -3.9, -2.9):
        box("Kitchen lower cabinet", (x, 0.62, -4.58), (0.92, 0.82, 0.70), M["oak_light"], 0.025)
        box("Kitchen upper cabinet", (x, 2.18, -4.68), (0.92, 0.72, 0.52), M["interior"], 0.025)
        box("Kitchen cabinet pull", (x + 0.32, 0.72, -4.20), (0.035, 0.23, 0.035), M["brass"], 0.008)
    box("Kitchen countertop", (-3.9, 1.10, -4.52), (3.15, 0.09, 0.84), M["stone"], 0.025)
    box("Backsplash", (-3.9, 1.68, -4.96), (3.15, 0.76, 0.06), M["stone"], 0.008)
    box("Kitchen island", (-2.35, 0.72, -2.35), (1.15, 1.0, 2.3), M["interior"], 0.035)
    box("Kitchen island stone top", (-2.35, 1.25, -2.35), (1.3, 0.10, 2.45), M["stone"], 0.025)
    for z in (-3.0, -2.0):
        chair("Kitchen stool", -1.4, z, 0.15, M["dark"])
    box("Refrigerator", (-5.34, 1.15, -2.4), (0.88, 2.05, 0.82), M["white"], 0.035)
    box("Fridge handle", (-4.88, 1.28, -2.4), (0.035, 0.54, 0.035), M["brass"], 0.008)

    # Entry console and common bath fixtures.
    box("Foyer console", (2.35, 0.63, 3.15), (1.25, 0.12, 0.42), M["oak_light"], 0.025)
    box("Foyer console leg", (2.35, 0.36, 3.15), (0.10, 0.52, 0.10), M["dark"], 0.012)
    box("Foyer mirror", (2.35, 1.65, 4.78), (0.82, 1.15, 0.04), M["brass"], 0.035)
    cylinder("Common bath basin", (3.55, 0.84, -3.65), 0.37, 0.13, M["white"], 24)
    cylinder("Common bath pedestal", (3.55, 0.47, -3.65), 0.11, 0.62, M["white"], 18)
    box("Common bath vanity", (3.55, 0.58, -4.45), (1.35, 0.78, 0.56), M["oak_light"], 0.04)
    box("Common bath mirror", (3.55, 1.55, -4.86), (1.05, 0.95, 0.035), M["glass"], 0.025)
    box("Common bath shower tray", (3.4, 0.24, -2.95), (1.35, 0.10, 1.1), M["white"], 0.025)
    box("Common bath shower screen", (2.72, 1.18, -2.95), (0.035, 1.8, 1.05), M["glass"], 0.003)
    box("Common bath toilet", (4.15, 0.35, -3.55), (0.42, 0.58, 0.60), M["white"], 0.09)


def furnish_first():
    y = FLOOR_H + 0.14
    # Master suite, west/rear.
    box("Master bedroom rug", (-3.2, y + 0.025, -2.0), (4.2, 0.035, 4.5), M["rug"], 0.02)
    bed("Master king bed", -3.2, -2.15, 2.0, 2.55, y, M["sage"])
    side_table("Master nightstand left", -4.55, -2.1, y)
    side_table("Master nightstand right", -1.85, -2.1, y)
    wardrobe("Master wardrobe", -4.9, 0.35, 1.6, y)
    box("Master lounge chair", (-4.85, y + 0.48, -0.1), (0.85, 0.82, 0.78), M["fabric"], 0.10)

    # Bedroom 2, east/rear.
    bed("Bedroom two bed", 3.65, -2.55, 1.35, 2.2, y, M["linen"])
    side_table("Bedroom two nightstand", 4.75, -2.55, y)
    wardrobe("Bedroom two wardrobe", 5.05, 0.05, 1.1, y)
    box("Bedroom two desk", (3.65, y + 0.76, -4.35), (1.55, 0.10, 0.65), M["oak_light"], 0.025)
    chair("Bedroom two task chair", 3.65, -3.77, y, M["dark"])

    # Bedroom 3, west/front.
    bed("Bedroom three single bed", -3.4, 2.62, 1.25, 2.1, y, M["linen"])
    side_table("Bedroom three nightstand", -4.35, 2.62, y)
    wardrobe("Bedroom three wardrobe", -5.0, 4.25, 1.25, y)
    box("Bedroom three desk", (-1.95, y + 0.76, 3.9), (1.45, 0.10, 0.62), M["oak_light"], 0.025)
    chair("Bedroom three task chair", -1.95, 3.27, y, M["dark"])

    # Landing and compact bath suite.
    box("First floor landing bench", (0.95, y + 0.28, 2.6), (1.65, 0.48, 0.52), M["fabric"], 0.08)
    box("First bath vanity", (4.0, y + 0.58, 1.35), (1.55, 0.78, 0.56), M["oak_light"], 0.04)
    cylinder("First bath basin", (4.0, y + 1.02, 1.35), 0.36, 0.12, M["white"], 24)
    box("First bath mirror", (4.0, y + 1.68, 1.03), (1.12, 1.0, 0.04), M["glass"], 0.02)
    box("First bath shower tray", (5.12, y + 0.12, 3.25), (1.1, 0.10, 1.2), M["white"], 0.02)
    box("First bath shower glass", (4.56, y + 1.0, 3.25), (0.035, 1.65, 1.18), M["glass"], 0.002)


# ------------------------------ KNX details --------------------------------

def ceiling_light(name, x, z, floor_y):
    y = floor_y + FLOOR_H - 0.06
    cylinder("KNX fixture " + name, (x, y, z), 0.18, 0.045, M["dark"], 24)
    cylinder("KNX diffuser " + name, (x, y - 0.03, z), 0.135, 0.025, M["warm_light"], 24)
    # Empty node gives the frontend a stable automation handle after GLB import.
    empty("KNX_LIGHT_" + name.upper().replace(" ", "_"), (x, y - 0.15, z))


def wall_switch(name, x, y, z, facing="front"):
    if facing == "front":
        dims = (0.15, 0.22, 0.035)
        loc = (x, y, z)
    else:
        dims = (0.035, 0.22, 0.15)
        loc = (x, y, z)
    box("KNX wall plate " + name, loc, dims, M["white"], 0.012)
    led_loc = (loc[0], loc[1] + 0.06, loc[2] - 0.021) if facing == "front" else (loc[0] + 0.021, loc[1] + 0.06, loc[2])
    sphere("KNX status LED " + name, led_loc, (0.018, 0.018, 0.018), M["green"], 10, 6)
    empty("KNX_SWITCH_" + name.upper().replace(" ", "_"), loc)


def curtains(name, x, z, width, sill, head, floor_y, wall="front"):
    y0 = floor_y + sill
    h = head - sill
    rail_y = floor_y + head + 0.08
    if wall == "front":
        box("Curtain rail " + name, (x, rail_y, z - 0.09), (width + 0.35, 0.035, 0.045), M["dark"], 0.008)
        for side in (-1, 1):
            panel = box("KNX_CURTAIN_" + name.upper() + ("_L" if side < 0 else "_R"), (x + side * width * 0.32, y0 + h / 2, z - 0.08), (width * 0.34, h, 0.07), M["linen"], 0.008)
            empty("KNX_CURTAIN_TRACK_" + name.upper() + ("_L" if side < 0 else "_R"), panel.location)
    else:
        box("Curtain rail " + name, (x - 0.09, rail_y, z), (0.045, 0.035, width + 0.35), M["dark"], 0.008)
        for side in (-1, 1):
            box("KNX_CURTAIN_" + name.upper() + ("_L" if side < 0 else "_R"), (x - 0.08, y0 + h / 2, z + side * width * 0.32), (0.07, h, width * 0.34), M["linen"], 0.008)


def knx_layer():
    # Ceiling fixtures by room; switches and status indicators at ergonomic height.
    ground = [("living", -3.5, 2.25), ("dining", 0.4, -2.35), ("kitchen", -4.0, -3.4), ("foyer", 2.5, 2.6), ("bath", 3.7, -3.6)]
    first = [("master", -3.2, -2.0), ("bed2", 3.6, -2.4), ("bed3", -3.2, 2.7), ("landing", 0.9, 2.3)]
    for name, x, z in ground:
        ceiling_light(name, x, z, 0.15)
    for name, x, z in first:
        ceiling_light(name, x, z, FLOOR_H + 0.14)

    for name, x, y, z, face in (
        ("living", -1.6, 1.35, 3.85, "front"),
        ("dining", 1.5, 1.35, -0.50, "front"),
        ("kitchen", -5.82, 1.35, -1.1, "side"),
        ("foyer", 1.65, 1.35, 3.6, "front"),
        ("master", -0.5, FLOOR_H + 1.35, -0.2, "front"),
        ("bedroom_2", 5.82, FLOOR_H + 1.35, -0.5, "side"),
        ("bedroom_3", -5.82, FLOOR_H + 1.35, 1.0, "side"),
    ):
        wall_switch(name, x, y, z, face)

    curtains("living", -3.9, 5.0, 2.0, 0.85, 2.45, 0.15, "front")
    curtains("master", -3.8, 4.92, 2.2, 0.82, 2.4, FLOOR_H + 0.15, "front")
    curtains("bedroom_two", 5.92, -2.9, 1.4, 0.85, 2.35, FLOOR_H + 0.15, "side")
    empty("KNX_CLIMATE_SETPOINT", (0.0, 1.45, 0.0))
    empty("KNX_AWAY_SCENE", (0.0, 0.0, 0.0))


def lighting_and_camera():
    # A camera and a soft studio light rig make the exported model immediately viewable.
    bpy.ops.object.camera_add(location=(18.5, 13.0, 22.5))
    cam = bpy.context.object
    cam.name = "SmartNest overview camera"
    direction = Vector((0.0, 3.0, 0.5)) - cam.location
    cam.rotation_euler = direction.to_track_quat("-Z", "Y").to_euler()
    cam.data.lens = 48
    bpy.context.scene.camera = cam

    bpy.ops.object.light_add(type="AREA", location=(3.0, 11.0, 8.0))
    key = bpy.context.object
    key.name = "Softbox key"
    key.data.energy = 2200
    key.data.shape = "DISK"
    key.data.size = 10
    key.rotation_euler = (math.radians(25), 0, math.radians(20))

    bpy.ops.object.light_add(type="AREA", location=(-10.0, 7.0, -5.0))
    fill = bpy.context.object
    fill.name = "Softbox fill"
    fill.data.energy = 1200
    fill.data.size = 8
    fill.rotation_euler = (math.radians(30), 0, math.radians(-35))

    world = bpy.context.scene.world
    if world:
        world.color = (0.17, 0.19, 0.22)
        world.use_nodes = True
        bg = world.node_tree.nodes.get("Background")
        if bg:
            bg.inputs["Color"].default_value = (0.23, 0.27, 0.31, 1.0)
            bg.inputs["Strength"].default_value = 0.35

    scene = bpy.context.scene
    scene.render.resolution_x = 1600
    scene.render.resolution_y = 1000
    scene.render.resolution_percentage = 100


def export_glb(path: str):
    os.makedirs(os.path.dirname(path) or ".", exist_ok=True)
    bpy.ops.object.select_all(action="SELECT")
    bpy.ops.export_scene.gltf(
        filepath=path,
        export_format="GLB",
        use_selection=False,
        export_apply=True,
        export_extras=True,
        export_lights=False,
        export_cameras=True,
        export_draco_mesh_compression_enable=True,
        export_draco_mesh_compression_level=6,
    )


def main():
    clear_scene()
    materials()
    shell()
    furnish_ground()
    furnish_first()
    knx_layer()
    lighting_and_camera()
    path = output_path()
    export_glb(path)
    print("\nSmartNest 3BHK villa exported:", path)
    print("Named automation nodes begin with KNX_ (lights, switches, curtains, climate, door).")


if __name__ == "__main__":
    main()
