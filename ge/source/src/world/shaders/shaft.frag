// A soft cone of light in hazy air: brightest along its axis as seen from the camera, fading towards its silhouette,
// its far end and the camera, with slow drifting haze. Drawn additively, so overlapping front and back faces add depth.
uniform float uTime;
varying vec3 vWorld;
varying vec3 vNormal;
varying vec3 vColor;
varying float vAlong;
varying float vFalloff;

float hash(vec3 p) {
  p = fract(p * 0.3183099 + 0.1);
  p *= 17.0;
  return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
}

float noise(vec3 x) {
  vec3 i = floor(x);
  vec3 f = fract(x);
  f = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(mix(hash(i), hash(i + vec3(1.0, 0.0, 0.0)), f.x), mix(hash(i + vec3(0.0, 1.0, 0.0)), hash(i + vec3(1.0, 1.0, 0.0)), f.x), f.y),
    mix(mix(hash(i + vec3(0.0, 0.0, 1.0)), hash(i + vec3(1.0, 0.0, 1.0)), f.x), mix(hash(i + vec3(0.0, 1.0, 1.0)), hash(i + vec3(1.0, 1.0, 1.0)), f.x), f.y),
    f.z
  );
}

void main() {
  vec3 toCamera = cameraPosition - vWorld;
  float distance = length(toCamera);
  float facing = abs(dot(normalize(vNormal), toCamera / distance));
  float edge = facing * facing * facing;
  float along = smoothstep(0.0, 0.12, vAlong) * pow(1.0 - vAlong, vFalloff);
  float haze = 0.6 + 0.6 * noise(vWorld * vec3(1.3, 0.45, 1.3) + vec3(0.0, uTime * 0.16, uTime * 0.06));
  float near = smoothstep(0.6, 3.2, distance);
  gl_FragColor = vec4(vColor * (edge * along * haze * near), 1.0);
  #include <colorspace_fragment>
}
