"""Render the switchgear and transformer from a GLB folder for one theme.

Run: blender --background --factory-startup --python blender/theme_preview.py -- <models_dir> <out.png> <theme>
"""

import math
import os
import sys

import bpy

models, out, theme = sys.argv[sys.argv.index("--") + 1 :]
backgrounds = {"light": (0.86, 0.9, 0.95), "copper": (0.02, 0.025, 0.035), "signal": (0.015, 0.06, 0.065)}

bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene
scene.render.engine = "BLENDER_EEVEE_NEXT" if "BLENDER_EEVEE_NEXT" in [e.identifier for e in bpy.types.RenderSettings.bl_rna.properties["engine"].enum_items] else "BLENDER_EEVEE"
scene.render.resolution_x = 960
scene.render.resolution_y = 600
scene.render.film_transparent = False
world = bpy.data.worlds.new("World")
scene.world = world
world.use_nodes = True
world.node_tree.nodes["Background"].inputs["Color"].default_value = (*backgrounds[theme], 1)
world.node_tree.nodes["Background"].inputs["Strength"].default_value = 0.6

for name, location, rotation in (("switchgear.glb", (-0.9, 0, 0), math.radians(-30)), ("transformer.glb", (1.6, 0.6, 0), math.radians(25))):
    bpy.ops.import_scene.gltf(filepath=os.path.join(models, name))
    for obj in bpy.context.selected_objects:
        if obj.parent is None:
            obj.location = location
            obj.rotation_euler[2] = rotation
            if name == "transformer.glb":
                obj.scale = (0.55, 0.55, 0.55)

bpy.ops.mesh.primitive_plane_add(size=20)
floor = bpy.context.object
floor_material = bpy.data.materials.new("Floor")
floor_material.use_nodes = True
floor_material.node_tree.nodes["Principled BSDF"].inputs["Base Color"].default_value = (*backgrounds[theme], 1)
floor.data.materials.append(floor_material)

for location, energy in (((3, -4, 5), 900), ((-4, -3, 3), 400)):
    light = bpy.data.objects.new("Light", bpy.data.lights.new("Light", "AREA"))
    light.data.energy = energy
    light.data.size = 3
    light.location = location
    light.rotation_euler = (math.radians(55), 0, math.atan2(location[0], -location[1]))
    scene.collection.objects.link(light)

camera = bpy.data.objects.new("Camera", bpy.data.cameras.new("Camera"))
camera.location = (0.4, -5.6, 1.9)
camera.rotation_euler = (math.radians(80), 0, 0)
scene.collection.objects.link(camera)
scene.camera = camera
scene.render.filepath = out
bpy.ops.render.render(write_still=True)
print("rendered", out)
