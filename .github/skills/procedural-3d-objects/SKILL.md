---
name: procedural-3d-objects
description: "Use when building 3D environments and objects in code with Three.js (rooms, corridors, facades, equipment, signage, light effects) without large downloads: world-scaled UVs, room and doorway builders, seeded canvas textures, live canvas labels, shared material libraries, light pools and contact shadows, custom GLSL effects, instancing, static batching and a constant light rig."
---

# Procedural 3D Objects

Build the world from small reusable helpers and shared materials, then batch it. Most of the detail should come from composition, light and texture — not polygon count.

## Kit helpers (write once per project)

- `boxGeometry(w, h, d, tile)` that rewrites UVs per face by real size, so one texture repeat = `tile` metres on every face.
- `plane(material, w, h, position, rotation, tile)`, `cylinder(...)`, `placed(geometry, position, rotation)` (bakes the transform) and `merged(material, parts)` using `mergeGeometries`.
- `room({ width, height, near, far, strips })` → floor, ceiling, walls and ceiling light strips; `partition(z, width, height, opening)` → wall with a framed, lit doorway so the camera can pass.
- `pool(position, size)` → additive radial decal for light on floors; `contactShadow(...)` → radial dark decal under objects. These replace real shadows cheaply.
- `framed(texture, w, h, …, backlit)` → picture/lightbox with frame.

## Textures from code

- Seed a tiny PRNG so textures are identical every load. Concrete grain, floor tiles, wall panel seams, asphalt, gravel and radial glows are 256–512 px canvases → zero download.
- Cache textures by key; set `colorSpace = SRGBColorSpace` for colour maps and anisotropy 8.
- Labels (plaques, screens, signs, org boards) are `CanvasTexture`s with a `redraw()`; redraw only when the shown value changes, and load fonts first (`document.fonts.load`).
- Images (logos, photos) go through `TextureLoader`; letterbox logos onto a white canvas for consistent lightboxes.

## Materials

- One shared library created once (`MeshStandardMaterial` for physical surfaces, `MeshBasicMaterial` with `toneMapped: false` and colour > 1 for emissive strips/screens so bloom picks them up).
- Give glass `depthWrite: false`, low opacity and high `envMapIntensity`; use a `RoomEnvironment` PMREM for reflections.
- Custom `ShaderMaterial` only where it explains something (e.g. energy pulses along conductors: `fract(uv.x * scale − time)` with additive blending), with its power driven by a scene cue.

## Performance rules learned the hard way

- **Static batching:** after a zone is built, merge its direct-child meshes that share a material (skip instanced, animated, clickable and shared-GLB meshes). This cut draw calls from 132 to under 100 in a real build.
- **Instancing:** for repeated GLB objects, create one `InstancedMesh` per primitive with `transform × primitive.matrixWorld`; keep a separate non-instanced copy for the one you animate.
- **Constant light count:** a fixed pool of point lights reassigned by distance each frame — adding/removing lights recompiles shaders and stutters.
- Mark GLB clone meshes `userData.shared = true` so zone disposal never frees shared geometry.
- Watch overlaps: a lightbox face placed inside its frame box renders black; a screen wall placed across a doorway gets flown through. Check geometry against the camera path.

## Verification

- Screenshot every zone at its hold and mid-travel; inspect for black faces, z-fighting, clipped subjects and objects blocking doorways.
- Read `renderer.info` (set `info.autoReset = false` and reset once per frame when using post-processing, otherwise only the last pass is counted).
