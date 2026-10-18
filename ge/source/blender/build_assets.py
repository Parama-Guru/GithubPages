"""Generate the detailed electrical equipment models for the website.

Run: blender --background --factory-startup --python blender/build_assets.py -- <output_dir>
Every model is built from code so it can be regenerated and reviewed.
"""

import math
import os
import sys

import bpy
import bmesh
from mathutils import Vector

OUT = sys.argv[sys.argv.index("--") + 1] if "--" in sys.argv else os.path.join(os.path.dirname(__file__), "out")
os.makedirs(OUT, exist_ok=True)


def reset():
    bpy.ops.object.select_all(action="SELECT")
    bpy.ops.object.delete()
    for block in (bpy.data.meshes, bpy.data.materials, bpy.data.curves, bpy.data.images, bpy.data.actions):
        for item in list(block):
            block.remove(item)


def material(name, color, metallic=0.0, roughness=0.5, emission=None, strength=0.0):
    mat = bpy.data.materials.get(name) or bpy.data.materials.new(name)
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes["Principled BSDF"]
    bsdf.inputs["Base Color"].default_value = (*color, 1.0)
    bsdf.inputs["Metallic"].default_value = metallic
    bsdf.inputs["Roughness"].default_value = roughness
    if emission:
        bsdf.inputs["Emission Color"].default_value = (*emission, 1.0)
        bsdf.inputs["Emission Strength"].default_value = strength
    return mat


def finish(obj, mat, bevel=0.0, segments=2, smooth=True):
    obj.data.materials.clear()
    obj.data.materials.append(mat)
    if bevel > 0:
        mod = obj.modifiers.new("Bevel", "BEVEL")
        mod.width = bevel
        mod.segments = segments
        mod.limit_method = "ANGLE"
    bpy.context.view_layer.objects.active = obj
    for mod in list(obj.modifiers):
        bpy.ops.object.modifier_apply(modifier=mod.name)
    if smooth:
        bpy.ops.object.shade_smooth_by_angle(angle=math.radians(35))
    return obj


def box(name, size, location, mat, bevel=0.0):
    bpy.ops.mesh.primitive_cube_add(size=1, location=location)
    obj = bpy.context.object
    obj.name = name
    obj.scale = size
    bpy.ops.object.transform_apply(scale=True)
    return finish(obj, mat, bevel)


def cylinder(name, radius, depth, location, mat, vertices=32, rotation=(0, 0, 0), bevel=0.0):
    bpy.ops.mesh.primitive_cylinder_add(vertices=vertices, radius=radius, depth=depth, location=location, rotation=rotation)
    obj = bpy.context.object
    obj.name = name
    return finish(obj, mat, bevel)


def lathe(name, profile, location, mat, steps=40):
    mesh = bpy.data.meshes.new(name)
    bm = bmesh.new()
    verts = [bm.verts.new((r, 0, z)) for r, z in profile]
    for a, b in zip(verts, verts[1:]):
        bm.edges.new((a, b))
    bmesh.ops.spin(bm, geom=bm.verts[:] + bm.edges[:], cent=(0, 0, 0), axis=(0, 0, 1), angle=math.tau, steps=steps, use_duplicate=False)
    bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=1e-4)
    bm.to_mesh(mesh)
    bm.free()
    obj = bpy.data.objects.new(name, mesh)
    bpy.context.collection.objects.link(obj)
    obj.location = location
    return finish(obj, mat)


def set_origin(obj, point):
    cursor = bpy.context.scene.cursor
    previous = cursor.location.copy()
    cursor.location = point
    bpy.ops.object.select_all(action="DESELECT")
    obj.select_set(True)
    bpy.context.view_layer.objects.active = obj
    bpy.ops.object.origin_set(type="ORIGIN_CURSOR")
    cursor.location = previous


def join(name, objects):
    bpy.ops.object.select_all(action="DESELECT")
    for obj in objects:
        obj.select_set(True)
    bpy.context.view_layer.objects.active = objects[0]
    bpy.ops.object.join()
    joined = bpy.context.object
    joined.name = name
    return joined


def parent(child, parent_obj):
    child.parent = parent_obj
    child.matrix_parent_inverse = parent_obj.matrix_world.inverted()


def export(filename, animated=False):
    path = os.path.join(OUT, filename)
    bpy.ops.export_scene.gltf(
        filepath=path,
        export_format="GLB",
        export_apply=True,
        export_yup=True,
        export_cameras=False,
        export_lights=False,
        export_extras=False,
        export_animations=animated,
        export_animation_mode="SCENE",
        export_force_sampling=True,
        export_materials="EXPORT",
    )
    print("exported", path)


def occlusion_group():
    group = bpy.data.node_groups.get("glTF Material Output")
    if group:
        return group
    group = bpy.data.node_groups.new("glTF Material Output", "ShaderNodeTree")
    group.interface.new_socket("Occlusion", in_out="INPUT", socket_type="NodeSocketFloat")
    return group


def bake_ao(objects, name, size=512, samples=48):
    scene = bpy.context.scene
    scene.render.engine = "CYCLES"
    scene.cycles.device = "CPU"
    scene.cycles.samples = samples
    scene.render.bake.margin = 6
    bpy.ops.mesh.primitive_plane_add(size=40, location=(0, 0, 0))
    ground = bpy.context.object
    bpy.ops.object.select_all(action="DESELECT")
    for obj in objects:
        obj.select_set(True)
    bpy.context.view_layer.objects.active = objects[0]
    bpy.ops.object.mode_set(mode="EDIT")
    bpy.ops.mesh.select_all(action="SELECT")
    bpy.ops.uv.smart_project(angle_limit=math.radians(66), island_margin=0.012)
    bpy.ops.object.mode_set(mode="OBJECT")
    image = bpy.data.images.new(f"{name}_ao", size, size, alpha=False)
    image.colorspace_settings.name = "Non-Color"
    materials = {slot.material for obj in objects for slot in obj.material_slots if slot.material}
    for mat in materials:
        node = mat.node_tree.nodes.new("ShaderNodeTexImage")
        node.image = image
        mat.node_tree.nodes.active = node
    bpy.ops.object.bake(type="AO")
    group = occlusion_group()
    for mat in materials:
        tree = mat.node_tree
        node = tree.nodes.active
        split = tree.nodes.new("ShaderNodeSeparateColor")
        tree.links.new(node.outputs["Color"], split.inputs["Color"])
        output = tree.nodes.new("ShaderNodeGroup")
        output.node_tree = group
        tree.links.new(split.outputs["Red"], output.inputs["Occlusion"])
    image.file_format = "PNG"
    image.pack()
    bpy.data.objects.remove(ground, do_unlink=True)
    print("baked ambient occlusion", name)


def keyframes(obj, path, values, frames):
    for value, frame in zip(values, frames):
        setattr(obj, path, value)
        obj.keyframe_insert(data_path=path, frame=frame)


def timeline(name, end):
    scene = bpy.context.scene
    scene.name = name
    scene.frame_start = 0
    scene.frame_end = end
    scene.render.fps = 50


def palette():
    return {
        "enamel": material("PanelEnamel", (0.62, 0.66, 0.68), 0.15, 0.42),
        "enamel_dark": material("PanelDark", (0.16, 0.19, 0.22), 0.3, 0.5),
        "steel": material("Steel", (0.55, 0.57, 0.6), 0.9, 0.32),
        "black": material("Rubber", (0.03, 0.03, 0.035), 0.0, 0.7),
        "copper": material("Copper", (0.86, 0.45, 0.24), 1.0, 0.28),
        "porcelain": material("Porcelain", (0.55, 0.32, 0.22), 0.0, 0.18),
        "glass": material("GlassInsulator", (0.42, 0.72, 0.7), 0.0, 0.08),
        "tank": material("TankPaint", (0.33, 0.39, 0.38), 0.25, 0.45),
        "galvanised": material("Galvanised", (0.62, 0.64, 0.66), 0.85, 0.45),
        "lamp_red": material("LampRed", (0.5, 0.05, 0.03), 0.0, 0.3, (1.0, 0.12, 0.05), 6.0),
        "lamp_green": material("LampGreen", (0.05, 0.4, 0.12), 0.0, 0.3, (0.15, 1.0, 0.35), 6.0),
        "lamp_amber": material("LampAmber", (0.5, 0.3, 0.02), 0.0, 0.3, (1.0, 0.6, 0.08), 6.0),
        "display": material("MeterGlass", (0.02, 0.05, 0.06), 0.0, 0.1, (0.2, 0.75, 1.0), 2.5),
        "warning": material("WarningYellow", (0.95, 0.68, 0.06), 0.0, 0.5),
        "pane": glass_material(),
    }


def glass_material():
    mat = material("DoorGlass", (0.66, 0.83, 0.9), 0.0, 0.04)
    bsdf = mat.node_tree.nodes["Principled BSDF"]
    bsdf.inputs["Alpha"].default_value = 0.18
    for attribute, value in (("surface_render_method", "BLENDED"), ("blend_method", "BLEND")):
        try:
            setattr(mat, attribute, value)
        except (AttributeError, TypeError):
            pass
    return mat


def switchgear():
    reset()
    m = palette()
    w, h, d = 0.8, 2.2, 0.8
    body = box("Cabinet", (w, d, h), (0, 0, h / 2 + 0.1), m["enamel"], 0.012)
    plinth = box("Plinth", (w, d * 0.96, 0.1), (0, 0, 0.05), m["black"], 0.004)
    roof = box("Roof", (w + 0.02, d + 0.02, 0.04), (0, 0, h + 0.12), m["enamel_dark"], 0.006)
    vents = [box(f"Vent{i}", (w * 0.5, 0.01, 0.012), (0, -d / 2 - 0.004, h - 0.05 - i * 0.035), m["enamel_dark"]) for i in range(5)]
    frame = join("Cabinet", [body, plinth, roof, *vents])

    interior = box("Interior", (w - 0.08, 0.02, h - 0.16), (0, -d / 2 + 0.06, h / 2 + 0.1), m["enamel_dark"])
    busbars = [box(f"Busbar{i}", (0.03, 0.01, h - 0.5), (-0.18 + i * 0.18, -d / 2 + 0.08, h / 2 + 0.25), m["copper"], 0.002) for i in range(3)]
    inner = join("Busbars", busbars)
    parent(interior, frame)
    parent(inner, frame)

    breaker_parts = [
        box("BreakerBody", (w - 0.2, 0.34, 0.42), (0, -d / 2 + 0.24, 0.62), m["enamel_dark"], 0.01),
        box("BreakerFace", (w - 0.24, 0.02, 0.36), (0, -d / 2 + 0.06, 0.62), m["steel"], 0.004),
        cylinder("BreakerKnob", 0.035, 0.04, (0.12, -d / 2 + 0.04, 0.66), m["black"], 24, (math.pi / 2, 0, 0)),
        box("BreakerFlag", (0.08, 0.012, 0.04), (-0.12, -d / 2 + 0.048, 0.7), m["lamp_green"]),
    ]
    breaker = join("Breaker", breaker_parts)
    set_origin(breaker, (0, -d / 2 + 0.24, 0.62))
    parent(breaker, frame)

    door_parts = [
        box("DoorLeaf", (w - 0.02, 0.025, h - 0.06), (0, -d / 2 - 0.013, h / 2 + 0.1), m["enamel"], 0.01),
        box("DoorWindow", (w * 0.42, 0.006, 0.22), (0.04, -d / 2 - 0.028, h - 0.36), m["display"]),
        box("Handle", (0.03, 0.05, 0.22), (w / 2 - 0.09, -d / 2 - 0.05, h / 2 + 0.08), m["steel"], 0.006),
        cylinder("LampRed", 0.022, 0.03, (-0.2, -d / 2 - 0.035, h - 0.14), m["lamp_red"], 20, (math.pi / 2, 0, 0)),
        cylinder("LampGreen", 0.022, 0.03, (-0.12, -d / 2 - 0.035, h - 0.14), m["lamp_green"], 20, (math.pi / 2, 0, 0)),
        cylinder("LampAmber", 0.022, 0.03, (-0.04, -d / 2 - 0.035, h - 0.14), m["lamp_amber"], 20, (math.pi / 2, 0, 0)),
        box("Meter", (0.16, 0.012, 0.11), (0.2, -d / 2 - 0.03, h - 0.14), m["display"]),
        box("Warning", (0.14, 0.004, 0.12), (0, -d / 2 - 0.028, 0.42), m["warning"]),
    ]
    door = join("Door", door_parts)
    set_origin(door, (-w / 2 + 0.01, -d / 2 - 0.013, h / 2 + 0.1))
    parent(door, frame)
    bake_ao([frame, interior, inner, breaker, door], "switchgear")
    timeline("Open", 100)
    keyframes(door, "rotation_euler", [(0, 0, 0), (0, 0, -1.85)], [0, 55])
    home = breaker.location.copy()
    keyframes(breaker, "location", [home, home, (home.x, home.y - 0.42, home.z)], [0, 40, 100])
    export("switchgear.glb", animated=True)


def entrance():
    reset()
    m = palette()
    height = 3.0
    leaves = []
    for name, sign in (("DoorLeft", 1), ("DoorRight", -1)):
        hinge = -sign * 1.6
        parts = [
            box(f"{name}Stile", (0.06, 0.06, height - 0.04), (hinge + sign * 0.03, 0.05, height / 2), m["steel"], 0.006),
            box(f"{name}Edge", (0.06, 0.06, height - 0.04), (hinge + sign * 1.55, 0.05, height / 2), m["steel"], 0.006),
            box(f"{name}Head", (1.58, 0.06, 0.06), (hinge + sign * 0.79, 0.05, height - 0.03), m["steel"], 0.006),
            box(f"{name}Kick", (1.58, 0.06, 0.12), (hinge + sign * 0.79, 0.05, 0.06), m["steel"], 0.006),
            box(f"{name}Glass", (1.5, 0.02, height - 0.18), (hinge + sign * 0.79, 0.05, height / 2 + 0.03), m["pane"]),
            box(f"{name}Handle", (0.04, 0.06, 1.1), (hinge + sign * 1.32, -0.03, 1.15), m["copper"], 0.008),
        ]
        leaf = join(name, parts)
        set_origin(leaf, (hinge, 0.05, 0))
        leaves.append((leaf, sign))
    timeline("Open", 100)
    for leaf, sign in leaves:
        keyframes(leaf, "rotation_euler", [(0, 0, 0), (0, 0, sign * 1.42)], [0, 100])
        for fcurve in leaf.animation_data.action.fcurves:
            for point in fcurve.keyframe_points:
                point.interpolation = "LINEAR"
    export("entrance.glb", animated=True)


def insulator_string(name, sheds, mat, cap):
    parts = []
    pitch = 0.16
    for i in range(sheds):
        z = -i * pitch
        parts.append(lathe(f"Shed{i}", [(0.0, z + 0.035), (0.05, z + 0.03), (0.13, z), (0.14, z - 0.012), (0.12, z - 0.02), (0.06, z - 0.01), (0.03, z - 0.05), (0.0, z - 0.06)], (0, 0, 0), mat, 22))
        parts.append(cylinder(f"Pin{i}", 0.018, 0.06, (0, 0, z + 0.06), cap, 12))
    parts.append(cylinder("TopCap", 0.035, 0.12, (0, 0, 0.12), cap, 16))
    return join(name, parts)


def transformer():
    reset()
    m = palette()
    tank = box("Tank", (2.4, 1.5, 2.0), (0, 0, 1.25), m["tank"], 0.05)
    lid = box("Lid", (2.5, 1.6, 0.08), (0, 0, 2.29), m["tank"], 0.02)
    skid = box("Skid", (2.7, 1.7, 0.2), (0, 0, 0.1), m["enamel_dark"], 0.02)
    fins = []
    for side in (-1, 1):
        for i in range(10):
            fins.append(box(f"Fin{side}{i}", (0.03, 0.42, 1.55), (-1.0 + i * 0.22, side * 0.97, 1.2), m["tank"], 0.006))
    headers = [cylinder(f"Header{s}{k}", 0.05, 2.3, (0, s * 0.97, z), m["tank"], 16, (0, math.pi / 2, 0)) for s in (-1, 1) for k, z in enumerate((0.42, 1.98))]
    conservator = cylinder("Conservator", 0.3, 1.8, (0, -0.35, 3.0), m["tank"], 32, (0, math.pi / 2, 0), 0.02)
    legs = [box(f"ConsLeg{i}", (0.06, 0.06, 0.62), (x, -0.35, 2.6), m["steel"]) for i, x in enumerate((-0.6, 0.6))]
    body = join("Transformer", [tank, lid, skid, *fins, *headers, conservator, *legs])
    bushings = []
    for i, x in enumerate((-0.7, 0, 0.7)):
        b = insulator_string(f"HV{i}", 7, m["porcelain"], m["steel"])
        b.location = (x, 0.35, 3.45)
        bpy.ops.object.select_all(action="DESELECT")
        b.select_set(True)
        bpy.context.view_layer.objects.active = b
        bpy.ops.object.transform_apply(location=True)
        terminal = cylinder(f"HVTerm{i}", 0.04, 0.16, (x, 0.35, 3.62), m["copper"], 16)
        bushings.extend([b, terminal])
    for i, x in enumerate((-0.6, -0.2, 0.2, 0.6)):
        bushings.append(cylinder(f"LV{i}", 0.06, 0.42, (x, -0.55, 2.5), m["porcelain"], 20))
        bushings.append(cylinder(f"LVTerm{i}", 0.03, 0.12, (x, -0.55, 2.75), m["copper"], 12))
    hv = join("Bushings", bushings)
    parent(hv, body)
    bake_ao([body, hv], "transformer", 512)
    export("transformer.glb")


def insulator_asset():
    reset()
    m = palette()
    string = insulator_string("InsulatorString", 9, m["glass"], m["galvanised"])
    clamp = box("Clamp", (0.08, 0.05, 0.1), (0, 0, -9 * 0.16 - 0.04), m["galvanised"], 0.01)
    joined = join("InsulatorString", [string, clamp])
    bake_ao([joined], "insulator", 256)
    export("insulator.glb")


def lattice_tower():
    reset()
    m = palette()
    members = []
    height = 24.0
    levels = 12

    def width_at(z):
        return 3.2 - (z / height) * 2.2

    def member(a, b, r=0.045):
        a, b = Vector(a), Vector(b)
        mid = (a + b) / 2
        direction = b - a
        bpy.ops.mesh.primitive_cylinder_add(vertices=6, radius=r, depth=direction.length, location=mid)
        obj = bpy.context.object
        obj.rotation_mode = "QUATERNION"
        obj.rotation_quaternion = direction.to_track_quat("Z", "Y")
        members.append(obj)

    for i in range(levels):
        z0 = i * height / levels
        z1 = (i + 1) * height / levels
        w0 = width_at(z0) / 2
        w1 = width_at(z1) / 2
        corners0 = [(-w0, -w0, z0), (w0, -w0, z0), (w0, w0, z0), (-w0, w0, z0)]
        corners1 = [(-w1, -w1, z1), (w1, -w1, z1), (w1, w1, z1), (-w1, w1, z1)]
        for k in range(4):
            member(corners0[k], corners1[k], 0.07)
            member(corners1[k], corners1[(k + 1) % 4], 0.035)
            member(corners0[k], corners1[(k + 1) % 4], 0.03)
            member(corners0[(k + 1) % 4], corners1[k], 0.03)
    for z, span in ((18.0, 6.5), (21.5, 5.0)):
        member((-span, 0, z), (span, 0, z), 0.08)
        member((-span, 0, z), (0, 0, z + 1.6), 0.04)
        member((span, 0, z), (0, 0, z + 1.6), 0.04)
    member((0, 0, height), (0, 0, height + 2.0), 0.06)
    tower = join("Tower", members)
    finish(tower, m["galvanised"], smooth=False)
    export("tower.glb")


switchgear()
entrance()
transformer()
insulator_asset()
lattice_tower()
