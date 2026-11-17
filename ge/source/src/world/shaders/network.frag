// Current on a conductor: a faint steady glow plus comets that run along the route (vRoute.x, metres from its source).
// uFeed: power, reach (metres energised), boost and its front (a power-up running along the route).
// uFlow: travel (metres, integrated on the CPU so a change of speed never jumps), spacing, base glow, comet length.
varying vec4 vFeed;
varying vec4 vFlow;
varying vec3 vColor;
varying vec3 vNormal;
varying vec3 vView;
varying vec3 vRoute;

void main() {
  float dist = vRoute.x;
  float reach = 1.0 - smoothstep(vFeed.y - 0.8, vFeed.y, dist);
  float boosted = 1.0 - smoothstep(vFeed.w - 1.2, vFeed.w, dist);
  float power = vFeed.x * reach + vFeed.z * boosted;
  if (power <= 0.002) discard;
  // Ribbons fade towards their edges; tubes towards their silhouette.
  float facing = abs(dot(normalize(vNormal), normalize(vView)));
  float profile = mix(1.0 - vRoute.y * vRoute.y, facing * sqrt(facing), vRoute.z);
  float phase = fract((dist - vFlow.x) / vFlow.y);
  float comet = smoothstep(1.0 - vFlow.w, 0.92, phase) * (1.0 - smoothstep(0.92, 0.985, phase));
  // The front of a power-up is a little brighter while it travels.
  float front = vFeed.z * smoothstep(vFeed.w - 2.4, vFeed.w - 0.4, dist) * boosted;
  float glow = ((vFlow.z + 2.2 * comet * comet) * power + 1.4 * front) * profile;
  gl_FragColor = vec4(vColor * glow, 1.0);
  #include <colorspace_fragment>
}
