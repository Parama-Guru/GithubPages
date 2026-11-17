uniform vec3 uTop;
uniform vec3 uHorizon;
uniform vec3 uGlow;
uniform vec3 uGlowDirection;
uniform float uStars;
uniform float uTime;
uniform float uClouds;
uniform vec3 uCloudLight;
uniform vec3 uCloudShade;
varying vec3 vDirection;

#ifndef CLOUD_OCTAVES
#define CLOUD_OCTAVES 5
#endif

float hash(vec3 p) {
  p = fract(p * 0.3183099 + 0.1);
  p *= 17.0;
  return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
}

float hash2(vec2 p) {
  vec3 q = fract(vec3(p.xyx) * 0.1031);
  q += dot(q, q.yzx + 33.33);
  return fract((q.x + q.y) * q.z);
}

float noise2(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash2(i), hash2(i + vec2(1.0, 0.0)), u.x), mix(hash2(i + vec2(0.0, 1.0)), hash2(i + vec2(1.0, 1.0)), u.x), u.y);
}

float fbm(vec2 p) {
  float sum = 0.0;
  float amplitude = 0.5;
  for (int i = 0; i < CLOUD_OCTAVES; i++) {
    sum += amplitude * noise2(p);
    p = p * 2.03 + vec2(17.1, 9.2);
    amplitude *= 0.5;
  }
  return sum;
}

void main() {
  vec3 direction = normalize(vDirection);
  float height = clamp(direction.y, -0.2, 1.0);
  vec3 color = mix(uHorizon, uTop, smoothstep(0.0, 0.32, height));
  vec3 sunward = normalize(uGlowDirection);
  float glow = pow(max(dot(direction, sunward), 0.0), 12.0) * 0.55;
  color += uGlow * glow * smoothstep(0.16, -0.02, height);
  // A thin layer of fair-weather cloud drifting slowly across the sky: noise on a plane above the camera, so the clouds
  // crowd towards the horizon, warm where they face the low sun.
  if (uClouds > 0.0 && direction.y > 0.005) {
    vec2 plane = direction.xz / (direction.y + 0.1);
    vec2 drift = vec2(uTime * 0.011, uTime * 0.004);
    float shape = fbm(plane * 0.55 + drift);
    float cover = smoothstep(0.4, 0.68, shape);
    float band = smoothstep(0.012, 0.16, direction.y) * (1.0 - 0.5 * smoothstep(0.45, 1.0, direction.y));
    float lit = clamp(0.5 + (shape - 0.45) * 2.0 + 0.5 * pow(max(dot(direction, sunward), 0.0), 3.0), 0.0, 1.0);
    color = mix(color, mix(uCloudShade, uCloudLight, lit), cover * band * uClouds);
  }
  vec3 cell = floor(direction * 420.0);
  float star = step(0.9975, hash(cell)) * smoothstep(0.12, 0.6, height) * uStars;
  color += vec3(star) * 0.9;
  gl_FragColor = vec4(color, 1.0);
}
