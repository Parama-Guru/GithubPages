uniform vec4 uFeed[8];
uniform vec4 uFlow[8];
attribute vec4 aRoute;
attribute vec3 aColor;
varying vec4 vFeed;
varying vec4 vFlow;
varying vec3 vColor;
varying vec3 vNormal;
varying vec3 vView;
varying vec3 vRoute;

void main() {
  int feed = int(aRoute.x + 0.5);
  vFeed = uFeed[feed];
  vFlow = uFlow[feed];
  vColor = aColor;
  vRoute = aRoute.yzw;
  vec4 world = modelMatrix * vec4(position, 1.0);
  vNormal = mat3(modelMatrix) * normal;
  vView = cameraPosition - world.xyz;
  // A feed that is switched off collapses outside the clip volume, so it costs no fragments.
  gl_Position = vFeed.x + vFeed.z > 0.001 ? projectionMatrix * viewMatrix * world : vec4(2.0, 2.0, 2.0, 1.0);
}
