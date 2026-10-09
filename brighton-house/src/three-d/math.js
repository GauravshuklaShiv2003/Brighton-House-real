// Tiny column-major 4x4 matrix helpers (WebGL layout). No dependencies.
export const DEG = Math.PI / 180;

export function mat4Perspective(fovy, aspect, near, far, offX = 0, offY = 0) {
  const f = 1 / Math.tan(fovy / 2);
  const nf = 1 / (near - far);
  // offX / offY shift the projected scene in NDC (used to push the 3D model to one side of the hero)
  return new Float32Array([
    f / aspect, 0, 0, 0,
    0, f, 0, 0,
    -offX, -offY, (far + near) * nf, -1,
    0, 0, 2 * far * near * nf, 0,
  ]);
}

export function mat4LookAt(e, t, up = [0, 1, 0]) {
  let zx = e[0] - t[0], zy = e[1] - t[1], zz = e[2] - t[2];
  let l = Math.hypot(zx, zy, zz) || 1;
  zx /= l; zy /= l; zz /= l;
  let xx = up[1] * zz - up[2] * zy;
  let xy = up[2] * zx - up[0] * zz;
  let xz = up[0] * zy - up[1] * zx;
  l = Math.hypot(xx, xy, xz) || 1;
  xx /= l; xy /= l; xz /= l;
  const yx = zy * xz - zz * xy;
  const yy = zz * xx - zx * xz;
  const yz = zx * xy - zy * xx;
  return new Float32Array([
    xx, yx, zx, 0,
    xy, yy, zy, 0,
    xz, yz, zz, 0,
    -(xx * e[0] + xy * e[1] + xz * e[2]),
    -(yx * e[0] + yy * e[1] + yz * e[2]),
    -(zx * e[0] + zy * e[1] + zz * e[2]),
    1,
  ]);
}

export function mat4Mul(a, b) {
  const o = new Float32Array(16);
  for (let c = 0; c < 4; c++) {
    for (let r = 0; r < 4; r++) {
      let s = 0;
      for (let k = 0; k < 4; k++) s += a[k * 4 + r] * b[c * 4 + k];
      o[c * 4 + r] = s;
    }
  }
  return o;
}

// Project a world point to CSS pixels. Returns null if behind the camera.
export function project(vp, p, w, h) {
  const x = vp[0] * p[0] + vp[4] * p[1] + vp[8] * p[2] + vp[12];
  const y = vp[1] * p[0] + vp[5] * p[1] + vp[9] * p[2] + vp[13];
  const z = vp[2] * p[0] + vp[6] * p[1] + vp[10] * p[2] + vp[14];
  const cw = vp[3] * p[0] + vp[7] * p[1] + vp[11] * p[2] + vp[15];
  if (cw <= 0.01) return null;
  const nx = x / cw, ny = y / cw, nz = z / cw;
  return { x: (nx * 0.5 + 0.5) * w, y: (1 - (ny * 0.5 + 0.5)) * h, depth: nz, w: cw };
}

export const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
export const lerp = (a, b, t) => a + (b - a) * t;
export function angleDelta(from, to) {
  let d = (to - from) % 360;
  if (d > 180) d -= 360;
  if (d < -180) d += 360;
  return d;
}

// Ray vs axis-aligned box. Returns distance or -1.
export function rayBox(o, d, min, max) {
  let tmin = -Infinity, tmax = Infinity;
  for (let i = 0; i < 3; i++) {
    if (Math.abs(d[i]) < 1e-8) {
      if (o[i] < min[i] || o[i] > max[i]) return -1;
    } else {
      let t1 = (min[i] - o[i]) / d[i];
      let t2 = (max[i] - o[i]) / d[i];
      if (t1 > t2) { const t = t1; t1 = t2; t2 = t; }
      tmin = Math.max(tmin, t1);
      tmax = Math.min(tmax, t2);
      if (tmin > tmax) return -1;
    }
  }
  return tmax < 0 ? -1 : Math.max(tmin, 0);
}
