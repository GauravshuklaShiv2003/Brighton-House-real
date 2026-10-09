// Minimal mesh builder. Every vertex = position(3) normal(3) colour(3) kind(1).
// "kind" tells the shader what the surface is:
//   0 flat   1 building facade (procedural windows)   3 ground (subtle noise)   5 lamp (glows at night)

export const STRIDE = 10;

export function hex(h) {
  const n = parseInt(h.slice(1), 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

export class Mesh {
  constructor() {
    this.v = [];
  }

  vert(p, n, c, k) {
    this.v.push(p[0], p[1], p[2], n[0], n[1], n[2], c[0], c[1], c[2], k);
  }

  quad(a, b, c, d, n, col, k) {
    this.vert(a, n, col, k); this.vert(b, n, col, k); this.vert(c, n, col, k);
    this.vert(a, n, col, k); this.vert(c, n, col, k); this.vert(d, n, col, k);
  }

  // Axis-aligned box centred at (cx,cy,cz). o.top overrides the roof colour.
  box(cx, cy, cz, sx, sy, sz, col, k = 0, o = {}) {
    const x0 = cx - sx / 2, x1 = cx + sx / 2;
    const y0 = cy - sy / 2, y1 = cy + sy / 2;
    const z0 = cz - sz / 2, z1 = cz + sz / 2;
    this.quad([x0, y1, z0], [x0, y1, z1], [x1, y1, z1], [x1, y1, z0], [0, 1, 0], o.top || col, o.topKind ?? k);
    if (!o.noBottom) this.quad([x0, y0, z0], [x1, y0, z0], [x1, y0, z1], [x0, y0, z1], [0, -1, 0], col, k);
    this.quad([x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1], [0, 0, 1], col, k);
    this.quad([x1, y0, z0], [x0, y0, z0], [x0, y1, z0], [x1, y1, z0], [0, 0, -1], col, k);
    this.quad([x1, y0, z1], [x1, y0, z0], [x1, y1, z0], [x1, y1, z1], [1, 0, 0], col, k);
    this.quad([x0, y0, z0], [x0, y0, z1], [x0, y1, z1], [x0, y1, z0], [-1, 0, 0], col, k);
  }

  // Flat rectangle on the ground plane (top face only).
  rect(x0, z0, x1, z1, y, col, k = 0) {
    this.quad([x0, y, z0], [x0, y, z1], [x1, y, z1], [x1, y, z0], [0, 1, 0], col, k);
  }

  ellipse(cx, cz, rx, rz, y, col, k = 0, seg = 48) {
    for (let i = 0; i < seg; i++) {
      const a0 = (i / seg) * Math.PI * 2;
      const a1 = ((i + 1) / seg) * Math.PI * 2;
      this.vert([cx, y, cz], [0, 1, 0], col, k);
      this.vert([cx + Math.cos(a0) * rx, y, cz + Math.sin(a0) * rz], [0, 1, 0], col, k);
      this.vert([cx + Math.cos(a1) * rx, y, cz + Math.sin(a1) * rz], [0, 1, 0], col, k);
    }
  }

  ring(cx, cz, rx0, rz0, rx1, rz1, y, col, k = 0, seg = 64) {
    for (let i = 0; i < seg; i++) {
      const a0 = (i / seg) * Math.PI * 2;
      const a1 = ((i + 1) / seg) * Math.PI * 2;
      const c0 = Math.cos(a0), s0 = Math.sin(a0), c1 = Math.cos(a1), s1 = Math.sin(a1);
      this.quad(
        [cx + c0 * rx0, y, cz + s0 * rz0],
        [cx + c0 * rx1, y, cz + s0 * rz1],
        [cx + c1 * rx1, y, cz + s1 * rz1],
        [cx + c1 * rx0, y, cz + s1 * rz0],
        [0, 1, 0], col, k
      );
    }
  }

  // Low-poly cone (tree canopy). Base centre (cx,cy,cz), apex at cy+h.
  cone(cx, cy, cz, r, h, sides, col, k = 0) {
    const len = Math.hypot(h, r);
    for (let i = 0; i < sides; i++) {
      const a0 = (i / sides) * Math.PI * 2;
      const a1 = ((i + 1) / sides) * Math.PI * 2;
      const am = (a0 + a1) / 2;
      const n = [(Math.cos(am) * h) / len, r / len, (Math.sin(am) * h) / len];
      this.vert([cx + Math.cos(a0) * r, cy, cz + Math.sin(a0) * r], n, col, k);
      this.vert([cx + Math.cos(a1) * r, cy, cz + Math.sin(a1) * r], n, col, k);
      this.vert([cx, cy + h, cz], n, col, k);
    }
  }

  cyl(cx, cy, cz, r, h, sides, col, k = 0) {
    for (let i = 0; i < sides; i++) {
      const a0 = (i / sides) * Math.PI * 2;
      const a1 = ((i + 1) / sides) * Math.PI * 2;
      const am = (a0 + a1) / 2;
      const n = [Math.cos(am), 0, Math.sin(am)];
      const p0 = [cx + Math.cos(a0) * r, cy, cz + Math.sin(a0) * r];
      const p1 = [cx + Math.cos(a1) * r, cy, cz + Math.sin(a1) * r];
      this.quad(p0, p1, [p1[0], cy + h, p1[2]], [p0[0], cy + h, p0[2]], n, col, k);
      this.vert([cx, cy + h, cz], [0, 1, 0], col, k);
      this.vert([p0[0], cy + h, p0[2]], [0, 1, 0], col, k);
      this.vert([p1[0], cy + h, p1[2]], [0, 1, 0], col, k);
    }
  }

  build() {
    return new Float32Array(this.v);
  }
}

// Small seeded random so the model looks the same on every load.
export function rng(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
