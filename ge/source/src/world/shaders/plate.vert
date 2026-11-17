// Client logo plates drawn as one instanced mesh: each instance shows its cell of the shared logo atlas, tinted by
// its own reveal level (the gallery lights the plates in turn as the visitor walks in).
attribute vec4 aCell;
attribute vec3 aTint;
varying vec2 vUv;
varying vec3 vTint;

void main() {
  vUv = uv * aCell.xy + aCell.zw;
  vTint = aTint;
  gl_Position = projectionMatrix * modelViewMatrix * instanceMatrix * vec4(position, 1.0);
}
