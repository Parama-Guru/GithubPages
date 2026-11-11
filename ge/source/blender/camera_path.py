"""Camera path for the scroll journey, authored in Blender.

Seed (creates blender/camera_path.blend from the JSON once):
  blender --background --factory-startup --python blender/camera_path.py -- seed src/world/camera-path.json blender/camera_path.blend
Export (after editing the empties in Blender):
  blender --background blender/camera_path.blend --python blender/camera_path.py -- export src/world/camera-path.json

Empties "key.NNN" are camera positions and "key.NNN.target" their look-at points; custom
properties hold the chapter, the chapter-local time and the field of view. "route.<id>.<n>"
empties are the start and end poses of each dedicated page. Blender is Z-up; the website is Y-up.
"""

import json
import sys

import bpy

args = sys.argv[sys.argv.index("--") + 1 :]
mode = args[0]


def to_blender(v):
    return (v[0], -v[2], v[1])


def to_web(v):
    return [round(v[0], 3), round(v[2], 3), round(-v[1], 3)]


def empty(name, location, display, size, collection):
    obj = bpy.data.objects.new(name, None)
    obj.empty_display_type = display
    obj.empty_display_size = size
    obj.location = location
    collection.objects.link(obj)
    return obj


def seed(source, target):
    bpy.ops.wm.read_factory_settings(use_empty=True)
    data = json.load(open(source, encoding="utf-8"))
    scene = bpy.context.scene
    journey = bpy.data.collections.new("Journey")
    routes = bpy.data.collections.new("Routes")
    scene.collection.children.link(journey)
    scene.collection.children.link(routes)
    points = []
    for index, key in enumerate(data["journey"]):
        name = f"key.{index:03d}"
        obj = empty(name, to_blender(key["position"]), "ARROWS", 0.6, journey)
        obj["chapter"] = key["chapter"]
        obj["t"] = key["t"]
        obj["fov"] = key["fov"]
        empty(f"{name}.target", to_blender(key["target"]), "SPHERE", 0.2, journey)
        points.append(to_blender(key["position"]))
    curve = bpy.data.curves.new("JourneyPath", "CURVE")
    curve.dimensions = "3D"
    spline = curve.splines.new("POLY")
    spline.points.add(len(points) - 1)
    for point, location in zip(spline.points, points):
        point.co = (*location, 1.0)
    journey.objects.link(bpy.data.objects.new("JourneyPath", curve))
    for route_id, poses in data["routes"].items():
        for index, pose in enumerate(poses):
            name = f"route.{route_id}.{index}"
            obj = empty(name, to_blender(pose["position"]), "ARROWS", 0.5, routes)
            obj["fov"] = pose["fov"]
            empty(f"{name}.target", to_blender(pose["target"]), "SPHERE", 0.15, routes)
    bpy.ops.wm.save_as_mainfile(filepath=target, compress=True)
    print("seeded", target)


def export(target):
    objects = {obj.name: obj for obj in bpy.data.objects}
    keys = sorted(name for name in objects if name.startswith("key.") and not name.endswith(".target"))
    journey = []
    for name in keys:
        obj = objects[name]
        journey.append(
            {
                "chapter": int(obj["chapter"]),
                "t": round(float(obj["t"]), 4),
                "position": to_web(obj.matrix_world.translation),
                "target": to_web(objects[f"{name}.target"].matrix_world.translation),
                "fov": float(obj["fov"]),
            }
        )
    routes = {}
    for name in sorted(n for n in objects if n.startswith("route.") and not n.endswith(".target")):
        route_id, index = name[len("route.") :].rsplit(".", 1)
        obj = objects[name]
        pose = {"position": to_web(obj.matrix_world.translation), "target": to_web(objects[f"{name}.target"].matrix_world.translation), "fov": float(obj["fov"])}
        routes.setdefault(route_id, [None, None])[int(index)] = pose
    with open(target, "w", encoding="utf-8") as handle:
        json.dump({"journey": journey, "routes": routes}, handle, indent=1)
        handle.write("\n")
    print("exported", target, len(journey), "keys", len(routes), "routes")


if mode == "seed":
    seed(args[1], args[2])
elif mode == "export":
    export(args[1])
