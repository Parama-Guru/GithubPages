varying vec3 vColor;
varying float vHalo;

void main() {
  vec2 point = gl_PointCoord * 2.0 - 1.0;
  float r2 = dot(point, point);
  if (r2 > 1.0) discard;
  float soft = 1.0 - r2;
  // Motes are small round specks; a halo falls off more gently from its centre.
  float shape = mix(soft * soft, soft * soft * soft * (0.35 + 0.65 * exp(-r2 * 6.0)), vHalo);
  gl_FragColor = vec4(vColor * shape, 1.0);
  #include <colorspace_fragment>
}
