// GLSL ES 1.00 shaders (works on every WebGL1 / WebGL2 device).

export const VERT = `
attribute vec3 aPos;
attribute vec3 aNor;
attribute vec3 aCol;
attribute float aKind;
uniform mat4 uVP;
uniform vec3 uOffset;
uniform vec3 uShadowDir;   // direction towards the sun, used to flatten geometry into a shadow
uniform float uShadowY;
uniform float uMode;       // 0 normal, 1 shadow, 2 decal
varying vec3 vWorld;
varying vec3 vNor;
varying vec3 vCol;
varying float vKind;
void main() {
  vec3 w = aPos + uOffset;
  if (uMode > 0.5 && uMode < 1.5) {
    float t = (w.y - uShadowY) / uShadowDir.y;
    w = vec3(w.x - uShadowDir.x * t, uShadowY, w.z - uShadowDir.z * t);
  }
  vWorld = w;
  vNor = aNor;
  vCol = aCol;
  vKind = aKind;
  gl_Position = uVP * vec4(w, 1.0);
}
`;

export const FRAG = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
varying vec3 vWorld;
varying vec3 vNor;
varying vec3 vCol;
varying float vKind;
uniform vec3 uCam;
uniform vec3 uSunDir;
uniform vec3 uSunCol;
uniform vec3 uAmb;
uniform vec3 uGnd;
uniform vec3 uFogCol;
uniform float uFogDen;
uniform vec3 uTint;
uniform float uLit;
uniform float uDim;
uniform float uGlow;
uniform vec3 uGlowCol;
uniform float uTime;
uniform float uNight;
uniform float uMode;
uniform vec4 uDecal;

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float vnoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
             mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);
}

void main() {
  float dist = length(uCam - vWorld);
  float fog = 1.0 - exp(-pow(dist * uFogDen, 2.0));

  if (uMode > 1.5) {
    float pulse = 0.65 + 0.35 * sin(uTime * 2.2);
    gl_FragColor = vec4(uDecal.rgb, uDecal.a * pulse * (1.0 - fog));
    return;
  }
  if (uMode > 0.5) {
    gl_FragColor = vec4(uDecal.rgb, uDecal.a * (1.0 - fog));
    return;
  }

  vec3 n = normalize(vNor);
  vec3 albedo = vCol;
  vec3 emissive = vec3(0.0);

  if (vKind > 0.5 && vKind < 1.5) {
    // Building facade: procedural window grid (floor height 3.1, ground storey 3.4)
    if (abs(n.y) < 0.5) {
      float along = abs(n.x) > abs(n.z) ? vWorld.z : vWorld.x;
      vec2 cell = vec2(along / 3.2, (vWorld.y - 3.4) / 3.1);
      vec2 id = floor(cell);
      vec2 f = fract(cell);
      float inBody = step(0.0, cell.y) * (1.0 - step(5.0, cell.y));
      float win = step(0.15, f.x) * step(f.x, 0.85) * step(0.2, f.y) * step(f.y, 0.8) * inBody;
      float h = hash(id + n.xz * 7.0);
      float h2 = hash(id * 1.7 + n.xz * 3.0 + 11.0);
      vec3 glass = mix(vec3(0.16, 0.25, 0.4), vec3(0.5, 0.66, 0.86), f.y) * (0.8 + 0.4 * h);
      glass = mix(glass, uAmb * vec3(0.9, 1.0, 1.1), 0.35) * (1.0 - 0.55 * uNight);
      float isLit = step(0.4, h2);
      float twinkle = 0.88 + 0.12 * sin(uTime * 0.8 + h2 * 40.0);
      emissive = vec3(1.0, 0.76, 0.42) * isLit * uLit * 1.5 * twinkle * win;
      albedo = mix(albedo, glass * (1.0 - 0.7 * isLit * uLit), win);
    }
  } else if (vKind > 2.5 && vKind < 3.5) {
    float nz = vnoise(vWorld.xz * 0.2) * 0.5 + vnoise(vWorld.xz * 1.4) * 0.5;
    albedo *= 0.9 + 0.18 * nz;
  } else if (vKind > 4.5) {
    emissive = vCol * (0.2 + uNight * 1.8);
  }

  float ndl = max(dot(n, uSunDir), 0.0);
  vec3 hemi = mix(uGnd, uAmb, n.y * 0.5 + 0.5);
  float ao = mix(0.72, 1.0, smoothstep(0.0, 5.0, vWorld.y));
  ao = mix(1.0, ao, step(abs(n.y), 0.5)); // only darken walls near the ground, not the ground itself
  vec3 col = albedo * (hemi * 0.64 + uSunCol * ndl * 0.74) * ao;
  col *= uTint;
  col += emissive;

  float lum = dot(col, vec3(0.3, 0.59, 0.11));
  col = mix(col, mix(vec3(lum), uFogCol, 0.35), uDim * 0.62);

  vec3 V = normalize(uCam - vWorld);
  float rim = pow(1.0 - max(dot(n, V), 0.0), 2.5);
  col += uGlowCol * uGlow * (0.08 + 0.5 * rim);

  col = mix(col, uFogCol, fog);
  gl_FragColor = vec4(col, 1.0);
}
`;

export const SKY_VERT = `
attribute vec2 aP;
varying vec2 vNdc;
void main() {
  vNdc = aP;
  gl_Position = vec4(aP, 0.9999, 1.0);
}
`;

export const SKY_FRAG = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
varying vec2 vNdc;
uniform vec3 uRight;
uniform vec3 uUpV;
uniform vec3 uFwd;
uniform vec2 uTan;
uniform vec2 uOff;
uniform vec3 uTop;
uniform vec3 uMid;
uniform vec3 uHor;
uniform vec3 uSunDir;
uniform vec3 uSunCol;
uniform float uNight;
float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
void main() {
  vec2 p = vNdc - uOff;
  vec3 dir = normalize(uFwd + uRight * (p.x * uTan.x) + uUpV * (p.y * uTan.y));
  float t = dir.y;
  vec3 col = mix(uHor, uMid, smoothstep(-0.02, 0.22, t));
  col = mix(col, uTop, smoothstep(0.15, 0.85, t));
  if (t < 0.0) col = uHor;
  float s = max(dot(dir, uSunDir), 0.0);
  float disc = mix(pow(s, 220.0) * 1.3, pow(s, 700.0) * 1.1, uNight);
  col += uSunCol * (disc + pow(s, 10.0) * 0.32 * (1.0 - uNight * 0.6));
  vec2 sp = dir.xz / (abs(dir.y) + 0.35) * 70.0;
  float star = step(0.9972, hash(floor(sp))) * smoothstep(0.08, 0.5, t) * uNight * uNight;
  col += vec3(star);
  col += (hash(gl_FragCoord.xy) - 0.5) / 255.0 * 1.5;
  gl_FragColor = vec4(col, 1.0);
}
`;
