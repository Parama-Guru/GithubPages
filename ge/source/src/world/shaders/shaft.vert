uniform float uGroup[8];
attribute vec4 aShaft;
attribute vec3 aColor;
varying vec3 vWorld;
varying vec3 vNormal;
varying vec3 vColor;
varying float vAlong;
varying float vFalloff;

void main() {
  // The cone is a unit cylinder hanging from its apex (y = 0) to its base (y = -1), narrowed towards the fixture.
  float along = -position.y;
  float taper = mix(aShaft.y, 1.0, along);
  mat4 model = modelMatrix * instanceMatrix;
  vec4 world = model * vec4(position.x * taper, position.y, position.z * taper, 1.0);
  vWorld = world.xyz;
  vNormal = mat3(model) * normal;
  vAlong = along;
  vFalloff = aShaft.z;
  float power = uGroup[int(aShaft.x + 0.5)];
  vColor = aColor * power;
  // Shafts of rooms out of view collapse outside the clip volume, so they cost no fragments.
  gl_Position = power > 0.001 ? projectionMatrix * viewMatrix * world : vec4(2.0, 2.0, 2.0, 1.0);
}
