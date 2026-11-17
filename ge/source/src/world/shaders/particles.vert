// Three kinds of particle in one draw call, all animated here from fixed seeds (no per-particle work on the CPU):
// 0 dust motes inside the building, wrapped into a box that travels with the camera and lit by the nearest lamps and
//   light shafts; 1 ionised motes rising around the yard's insulators; 2 the soft corona halo on each insulator.
uniform float uTime;
uniform vec3 uBox;
uniform float uDust;
uniform vec3 uLightPosition[6];
uniform vec3 uLightColor[6];
uniform vec4 uShaftApex[4];
uniform vec4 uShaftAxis[4];
uniform vec3 uShaftColor[4];
uniform vec3 uEmitters[6];
uniform float uCorona;
uniform float uPixels;
uniform vec3 uDustTint;
uniform vec3 uMoteTint;
attribute vec2 aKind;
varying vec3 vColor;
varying float vHalo;

vec3 lamps(vec3 p) {
  vec3 light = vec3(0.0);
  for (int i = 0; i < 6; i++) {
    vec3 d = p - uLightPosition[i];
    light += uLightColor[i] * exp(-dot(d, d) * 0.14);
  }
  for (int i = 0; i < 4; i++) {
    vec3 v = p - uShaftApex[i].xyz;
    float along = dot(v, uShaftAxis[i].xyz);
    float t = along / max(uShaftApex[i].w, 0.001);
    if (t > 0.02 && t < 1.0) {
      float radius = along * uShaftAxis[i].w + 0.06;
      float radial = length(v - uShaftAxis[i].xyz * along);
      light += uShaftColor[i] * (1.0 - smoothstep(radius * 0.45, radius, radial)) * (1.0 - t);
    }
  }
  return light;
}

void main() {
  vec3 world;
  float size;
  if (aKind.x < 0.5) {
    vec3 drift = vec3(sin(uTime * 0.071 + aKind.y * 40.0), sin(uTime * 0.053 + position.x * 31.0) * 0.6 - uTime * 0.018, cos(uTime * 0.062 + position.z * 29.0)) * 0.35;
    vec3 cell = fract((position * uBox + drift - cameraPosition) / uBox + 0.5) - 0.5;
    world = cameraPosition + cell * uBox;
    vec3 edge = smoothstep(0.5, 0.36, abs(cell));
    // Only inside the building (between the entrance and the yard door, within the widest room).
    float inside = step(world.z, -0.4) * step(-109.8, world.z) * step(abs(world.x), 6.8) * step(0.05, world.y);
    vColor = (uDustTint * 0.004 + uDustTint * lamps(world)) * (edge.x * edge.y * edge.z * inside * uDust);
    size = 0.008 + aKind.y * 0.012;
  } else if (aKind.x < 1.5) {
    int source = int(position.x * 5.999);
    float life = fract(uTime * (0.09 + position.y * 0.05) + position.z);
    float angle = position.y * 6.2832 + uTime * 0.21;
    world = uEmitters[source] + vec3(cos(angle), 0.0, sin(angle)) * (0.1 + life * 0.32) + vec3(0.0, -0.3 + life * 1.05, 0.0);
    vColor = uMoteTint * (sin(life * 3.14159) * uCorona * 1.4);
    size = 0.06;
  } else {
    int source = int(position.x * 5.999);
    float phase = position.y * 6.2832;
    // A slow breathing glow (its components run below 1 Hz), never a flash.
    float breath = 0.82 + 0.18 * sin(uTime * 2.1 + phase) * sin(uTime * 3.3 + phase * 1.7);
    world = uEmitters[source];
    vColor = uMoteTint * (breath * uCorona * 1.1);
    size = 1.3;
  }
  vec4 view = viewMatrix * vec4(world, 1.0);
  gl_Position = projectionMatrix * view;
  float pixels = size * uPixels / max(-view.z, 0.1);
  gl_PointSize = clamp(pixels, 1.0, 96.0);
  // Motes smaller than a pixel dim by their area instead of shrinking; none drift right in front of the lens.
  vColor *= min(pixels * pixels, 1.0) * smoothstep(0.9, 2.6, -view.z);
  vHalo = step(1.5, aKind.x);
  if (dot(vColor, vColor) < 1e-7) gl_Position = vec4(2.0, 2.0, 2.0, 1.0);
}
