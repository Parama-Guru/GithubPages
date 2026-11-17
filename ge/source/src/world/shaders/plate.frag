uniform sampler2D uMap;
varying vec2 vUv;
varying vec3 vTint;

void main() {
  gl_FragColor = vec4(texture2D(uMap, vUv).rgb * vTint, 1.0);
  #include <colorspace_fragment>
}
