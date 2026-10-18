uniform vec3 uTop;
uniform vec3 uHorizon;
uniform vec3 uGlow;
uniform vec3 uGlowDirection;
uniform float uStars;
varying vec3 vDirection;

float hash(vec3 p) {
  p = fract(p * 0.3183099 + 0.1);
  p *= 17.0;
  return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
}

void main() {
  vec3 direction = normalize(vDirection);
  float height = clamp(direction.y, -0.2, 1.0);
  vec3 color = mix(uHorizon, uTop, smoothstep(-0.02, 0.55, height));
  float glow = pow(max(dot(direction, normalize(uGlowDirection)), 0.0), 12.0) * 0.55;
  color += uGlow * glow * smoothstep(0.16, -0.02, height);
  vec3 cell = floor(direction * 420.0);
  float star = step(0.9975, hash(cell)) * smoothstep(0.12, 0.6, height) * uStars;
  color += vec3(star) * 0.9;
  gl_FragColor = vec4(color, 1.0);
}
