uniform float uTime;
uniform float uPower;
uniform float uScale;
uniform vec3 uColor;
varying vec2 vUv;
varying vec3 vWorld;

void main() {
  float travel = fract(vUv.x * uScale - uTime * 0.55);
  float pulse = smoothstep(0.0, 0.08, travel) * (1.0 - smoothstep(0.08, 0.32, travel));
  float core = 0.35 + 0.65 * pulse;
  float edge = 1.0 - abs(vUv.y - 0.5) * 2.0;
  float glow = core * mix(0.55, 1.0, edge) * uPower;
  gl_FragColor = vec4(uColor * glow * 3.2, glow);
}
