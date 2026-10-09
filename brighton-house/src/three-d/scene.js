// Builds the Brighton House site model: 10 low-rise towers (ground + 5 floors) around a central park.
// SCHEMATIC ONLY. Tower positions are for orientation and are not the approved site plan.
import { Mesh, hex, rng } from './geometry.js';
import { towers as towerMeta } from '../config/site.js';

const GROUND_H = 3.4; // parking storey
const FLOOR_H = 3.1;
const FLOORS = 5;
export const TOP = GROUND_H + FLOORS * FLOOR_H; // 18.9 m

// Footprints (metres) and positions. z+ is the front (entry side).
const LAYOUT = {
  'jupiter-1': { x: -58, z: 44, w: 22, d: 18.5 },
  'jupiter-2': { x: -30, z: 44, w: 22, d: 18.5 },
  'galaxy-1': { x: 22, z: 44, w: 25, d: 20 },
  'galaxy-2': { x: 52, z: 44, w: 25, d: 20 },
  'venus-1': { x: -66, z: -8, w: 25, d: 20 },
  'venus-2': { x: -66, z: 20, w: 21, d: 18 },
  'galaxy-3': { x: -14, z: -50, w: 25, d: 20 },
  'jupiter-3': { x: 14, z: -50, w: 22, d: 18.5 },
  'orbit-1': { x: 66, z: -34, w: 23, d: 36 },
  'orbit-2': { x: 66, z: 4, w: 23, d: 36 },
};

// Adjoining towers joined by rooftop decks
const BRIDGES = [
  ['jupiter-1', 'jupiter-2'],
  ['galaxy-1', 'galaxy-2'],
  ['galaxy-3', 'jupiter-3'],
  ['venus-1', 'venus-2'],
  ['orbit-1', 'orbit-2'],
];

const FAMILY_ACCENT = {
  galaxy: '#1B3BE0',
  jupiter: '#2F6BFF',
  orbit: '#0F2A9E',
  venus: '#4C80FF',
};

const C = {
  wall: hex('#F0EADF'),
  roof: hex('#C9CCD6'),
  concrete: hex('#DAD8D2'),
  dark: hex('#171A28'),
  glassRail: hex('#B9D4F2'),
  plate: hex('#CFCBC2'),
  ground: hex('#8FA37F'),
  lawn: hex('#6FB06A'),
  path: hex('#E4D7BC'),
  road: hex('#2B2F3E'),
  roadLine: hex('#E8E8EC'),
  wallLow: hex('#E7E1D6'),
  wood: hex('#B98A5C'),
  water: hex('#5FA8E8'),
  amber: hex('#FFB020'),
  trunk: hex('#6B4A32'),
  greens: [hex('#3D8F52'), hex('#4FA45E'), hex('#2F7A49'), hex('#69B167'), hex('#2E8B6A')],
  city: [hex('#B8C2D6'), hex('#C7CFDF'), hex('#AEB9CF'), hex('#D3D7E2'), hex('#BFC6D6')],
  lamp: hex('#FFD58A'),
  play: [hex('#F26B4F'), hex('#2FB5A5'), hex('#FFC04D'), hex('#5B7CFF')],
};

function buildTower(meta, L) {
  const m = new Mesh();
  const { w, d } = L;
  const accent = hex(FAMILY_ACCENT[meta.family]);
  const longAlongX = w >= d;

  // Parking storey: dark recess, slab, columns
  m.box(0, (GROUND_H - 0.35) / 2, 0, w - 1.8, GROUND_H - 0.35, d - 1.8, C.dark, 0);
  m.box(0, GROUND_H - 0.18, 0, w, 0.36, d, C.concrete, 0);
  const nx = Math.max(3, Math.round(w / 5) + 1);
  const nz = Math.max(3, Math.round(d / 5) + 1);
  for (let i = 0; i < nx; i++) {
    const x = -w / 2 + 0.45 + (i * (w - 0.9)) / (nx - 1);
    m.box(x, (GROUND_H - 0.35) / 2, -d / 2 + 0.45, 0.8, GROUND_H - 0.35, 0.8, C.concrete, 0);
    m.box(x, (GROUND_H - 0.35) / 2, d / 2 - 0.45, 0.8, GROUND_H - 0.35, 0.8, C.concrete, 0);
  }
  for (let i = 1; i < nz - 1; i++) {
    const z = -d / 2 + 0.45 + (i * (d - 0.9)) / (nz - 1);
    m.box(-w / 2 + 0.45, (GROUND_H - 0.35) / 2, z, 0.8, GROUND_H - 0.35, 0.8, C.concrete, 0);
    m.box(w / 2 - 0.45, (GROUND_H - 0.35) / 2, z, 0.8, GROUND_H - 0.35, 0.8, C.concrete, 0);
  }

  // Main body: kind 1 = facade with procedural windows
  m.box(0, (GROUND_H + TOP) / 2, 0, w, TOP - GROUND_H, d, C.wall, 1, { top: C.roof, topKind: 0, noBottom: true });

  // Parapet ring
  const pH = 0.9, pT = 0.35;
  m.box(0, TOP + pH / 2, d / 2 - pT / 2, w, pH, pT, C.concrete, 0);
  m.box(0, TOP + pH / 2, -d / 2 + pT / 2, w, pH, pT, C.concrete, 0);
  m.box(w / 2 - pT / 2, TOP + pH / 2, 0, pT, pH, d - 2 * pT, C.concrete, 0);
  m.box(-w / 2 + pT / 2, TOP + pH / 2, 0, pT, pH, d - 2 * pT, C.concrete, 0);

  // Brand-blue vertical bands (stair / lift cladding) on the two long faces
  const bandW = 3.4, bandD = 0.55;
  const bandPos = (longAlongX ? w : d) * 0.18;
  if (longAlongX) {
    m.box(bandPos, (GROUND_H + TOP) / 2, d / 2 + bandD / 2, bandW, TOP - GROUND_H, bandD, accent, 0);
    m.box(-bandPos, (GROUND_H + TOP) / 2, -d / 2 - bandD / 2, bandW, TOP - GROUND_H, bandD, accent, 0);
  } else {
    m.box(w / 2 + bandD / 2, (GROUND_H + TOP) / 2, bandPos, bandD, TOP - GROUND_H, bandW, accent, 0);
    m.box(-w / 2 - bandD / 2, (GROUND_H + TOP) / 2, -bandPos, bandD, TOP - GROUND_H, bandW, accent, 0);
  }

  // Balconies on the long faces, one row per floor
  const L1 = longAlongX ? w : d;
  const nb = Math.max(2, Math.round(L1 / 9));
  for (let f = 0; f < FLOORS; f++) {
    const y = GROUND_H + f * FLOOR_H + 0.15;
    for (let i = 0; i < nb; i++) {
      const t = -L1 / 2 + ((i + 0.5) * L1) / nb + (longAlongX ? 0 : 0);
      if (Math.abs(t - bandPos) < 3.2 || Math.abs(t + bandPos) < 3.2) continue; // keep clear of the bands
      for (const side of [1, -1]) {
        if (longAlongX) {
          const z = side * (d / 2 + 0.7);
          m.box(t, y, z, 4.4, 0.3, 1.5, C.concrete, 0);
          m.box(t, y + 0.65, side * (d / 2 + 1.4), 4.4, 0.95, 0.1, C.glassRail, 0);
        } else {
          const x = side * (w / 2 + 0.7);
          m.box(x, y, t, 1.5, 0.3, 4.4, C.concrete, 0);
          m.box(side * (w / 2 + 1.4), y + 0.65, t, 0.1, 0.95, 4.4, C.glassRail, 0);
        }
      }
    }
  }

  // Roof details: lift core, tank, garden patch, deck
  m.box(w * 0.22, TOP + 1.4, -d * 0.18, 4.6, 2.8, 4.6, C.wall, 0, { top: C.roof });
  m.cyl(-w * 0.28, TOP, -d * 0.2, 1.2, 2.2, 10, hex('#9AA3B8'), 0);
  m.box(-w * 0.16, TOP + 0.08, d * 0.17, w * 0.34, 0.16, d * 0.26, C.lawn, 3);
  m.box(w * 0.2, TOP + 0.06, d * 0.22, w * 0.2, 0.12, d * 0.18, C.wood, 0);

  return m;
}

function treeAt(m, x, z, s, rand) {
  const g1 = C.greens[Math.floor(rand() * C.greens.length)];
  const g2 = C.greens[Math.floor(rand() * C.greens.length)];
  m.box(x, 1.0 * s, z, 0.5 * s, 2.0 * s, 0.5 * s, C.trunk, 0, { noBottom: true });
  m.cone(x, 1.5 * s, z, 2.7 * s, 3.8 * s, 7, g1, 0);
  m.cone(x, 3.5 * s, z, 2.0 * s, 3.2 * s, 7, g2, 0);
}

function buildGround() {
  const m = new Mesh();
  const rand = rng(11);
  // Wide surrounding ground, campus plate, lawns, paths, roads
  m.rect(-1800, -1800, 1800, 1800, 0, C.ground, 3);
  m.rect(-92, -66, 90, 66, 0.03, C.plate, 3);

  // Front approach road + public road + side roads
  m.rect(-9, 66, 0, 90, 0.04, C.road, 0);
  m.rect(-260, 84, 260, 98, 0.04, C.road, 0);
  m.rect(-108, -84, -98, 98, 0.04, C.road, 0);
  m.rect(98, -84, 108, 98, 0.04, C.road, 0);
  m.rect(-108, -84, 108, -74, 0.04, C.road, 0);
  for (let x = -250; x < 250; x += 11) m.rect(x, 90.8, x + 5, 91.3, 0.05, C.roadLine, 0);
  // Roundabout at the east end of the front road (schematic)
  m.ring(150, 91, 9, 9, 24, 24, 0.045, C.road, 0, 40);
  m.ellipse(150, 91, 9, 9, 0.05, C.lawn, 3, 32);
  m.rect(110, 84, 128, 98, 0.04, C.road, 0);

  // Park: lawn, ring path, cross paths, plaza
  const pcx = -2, pcz = -2;
  m.ellipse(pcx, pcz, 30, 22, 0.05, C.lawn, 3, 64);
  m.ring(pcx, pcz, 30, 22, 32.4, 24.4, 0.06, C.path, 0, 64);
  m.rect(pcx - 30, pcz - 1.6, pcx + 30, pcz + 1.6, 0.07, C.path, 0);
  m.rect(pcx - 1.6, pcz - 22, pcx + 1.6, pcz + 22, 0.07, C.path, 0);
  m.ellipse(pcx, pcz, 7, 7, 0.08, C.path, 0, 32);
  m.ellipse(pcx, pcz, 3.6, 3.6, 0.09, C.water, 0, 28);
  // Entry spine from gate to park
  m.rect(-6.2, 22, -2.8, 66, 0.07, C.path, 0);
  // Play pads and senior-garden terrace (schematic)
  for (let i = 0; i < 4; i++) m.rect(-24 + (i % 2) * 4.2, 6 + Math.floor(i / 2) * 4.2, -20.2 + (i % 2) * 4.2, 9.8 + Math.floor(i / 2) * 4.2, 0.08, C.play[i], 0);
  m.rect(14, 6, 24, 14, 0.08, C.path, 0);
  return m;
}

function buildProps(rand) {
  const m = new Mesh();
  const rects = Object.values(LAYOUT).map((L) => ({ x0: L.x - L.w / 2 - 5, x1: L.x + L.w / 2 + 5, z0: L.z - L.d / 2 - 5, z1: L.z + L.d / 2 + 5 }));
  const blocked = (x, z) => rects.some((r) => x > r.x0 && x < r.x1 && z > r.z0 && z < r.z1);
  const onPath = (x, z) =>
    (Math.abs(x + 2) < 3 && Math.abs(z + 2) < 24) ||
    (Math.abs(z + 2) < 3 && Math.abs(x + 2) < 32) ||
    (x > -8 && x < 1 && z > 20) ||
    (Math.hypot((x + 2) / 8, (z + 2) / 8) < 1);

  // Compound wall with a gap for the gate
  const wallH = 2.0, wallT = 0.5;
  m.box(0, wallH / 2, -66, 182, wallH, wallT, C.wallLow, 0);
  m.box(-91.75, wallH / 2, 0, wallT, wallH, 132, C.wallLow, 0);
  m.box(89.75, wallH / 2, 0, wallT, wallH, 132, C.wallLow, 0);
  m.box(-50.5, wallH / 2, 66, 83, wallH, wallT, C.wallLow, 0);
  m.box(45, wallH / 2, 66, 90, wallH, wallT, C.wallLow, 0);

  // Gate: pillars, beam, gatehouse, boom barrier
  m.box(-9.4, 2.2, 66, 1.6, 4.4, 1.6, C.wall, 0);
  m.box(0.4, 2.2, 66, 1.6, 4.4, 1.6, C.wall, 0);
  m.box(-4.5, 4.7, 66, 11.2, 0.7, 1.4, hex('#1B3BE0'), 0);
  m.box(3.8, 1.4, 62.5, 3.2, 2.8, 3.4, C.wall, 0, { top: C.roof });
  m.box(-4.5, 1.15, 63, 5, 0.18, 0.18, C.amber, 0);

  // Community centre / clubhouse pavilion in the park (schematic)
  m.box(-2, 2.4, -17, 17, 4.8, 8.5, C.wall, 0, { top: C.roof });
  m.box(-2, 4.95, -17, 19, 0.3, 10.5, C.wood, 0);
  m.box(-2, 1.9, -12.6, 13, 3.2, 0.2, C.glassRail, 0);
  // Pergola (senior garden)
  for (const [px, pz] of [[14.5, 6.5], [23.5, 6.5], [14.5, 13.5], [23.5, 13.5]]) m.box(px, 1.5, pz, 0.35, 3, 0.35, C.wood, 0);
  m.box(19, 3.1, 10, 10.5, 0.25, 8.5, C.wood, 0);

  // Rooftop bridge decks between adjoining towers
  for (const [a, b] of BRIDGES) {
    const A = LAYOUT[a], B = LAYOUT[b];
    const y = TOP - 0.2;
    if (Math.abs(A.z - B.z) < 1) {
      const left = A.x < B.x ? A : B, right = A.x < B.x ? B : A;
      const x0 = left.x + left.w / 2 - 0.4, x1 = right.x - right.w / 2 + 0.4;
      m.box((x0 + x1) / 2, y, A.z, x1 - x0, 0.45, 8, C.wood, 0);
      m.box((x0 + x1) / 2, y + 0.4, A.z - 3.6, x1 - x0, 0.5, 0.9, C.lawn, 3);
      m.box((x0 + x1) / 2, y + 0.4, A.z + 3.6, x1 - x0, 0.5, 0.9, C.lawn, 3);
    } else {
      const lo = A.z < B.z ? A : B, hi = A.z < B.z ? B : A;
      const z0 = lo.z + lo.d / 2 - 0.4, z1 = hi.z - hi.d / 2 + 0.4;
      m.box(A.x, y, (z0 + z1) / 2, 8, 0.45, z1 - z0, C.wood, 0);
      m.box(A.x - 3.6, y + 0.4, (z0 + z1) / 2, 0.9, 0.5, z1 - z0, C.lawn, 3);
      m.box(A.x + 3.6, y + 0.4, (z0 + z1) / 2, 0.9, 0.5, z1 - z0, C.lawn, 3);
    }
  }

  // Trees: park ring, scattered in the park, along walls, between towers, roadside
  for (let i = 0; i < 26; i++) {
    const a = (i / 26) * Math.PI * 2;
    const x = -2 + Math.cos(a) * 35.4, z = -2 + Math.sin(a) * 27.4;
    if (!blocked(x, z) && !(x > -9 && x < 1 && z > 20)) treeAt(m, x, z, 0.9 + rand() * 0.45, rand);
  }
  for (let i = 0; i < 46; i++) {
    const a = rand() * Math.PI * 2, r = Math.sqrt(rand());
    const x = -2 + Math.cos(a) * 27 * r, z = -2 + Math.sin(a) * 19 * r;
    if (onPath(x, z) || (x > -26 && x < -14 && z > 4 && z < 16) || (x > 12 && x < 26 && z > 4 && z < 16) || (z < -10 && z > -23 && x > -13 && x < 9)) continue;
    treeAt(m, x, z, 0.8 + rand() * 0.55, rand);
  }
  for (let i = 0; i < 120; i++) {
    const x = -88 + rand() * 176, z = -62 + rand() * 124;
    if (blocked(x, z) || onPath(x, z) || Math.hypot((x + 2) / 36, (z + 2) / 28) < 1) continue;
    treeAt(m, x, z, 0.7 + rand() * 0.5, rand);
  }
  for (let x = -250; x < 250; x += 16) {
    if (Math.abs(x - 150) < 40) continue;
    treeAt(m, x + rand() * 4, 101.5, 0.9 + rand() * 0.3, rand);
  }
  treeAt(m, 150, 91, 1.3, rand);

  // Lamp posts (glow at dusk and night)
  for (let i = 0; i < 20; i++) {
    const a = (i / 20) * Math.PI * 2;
    const x = -2 + Math.cos(a) * 33.6, z = -2 + Math.sin(a) * 25.6;
    if (!blocked(x, z) && !(x > -9 && x < 1 && z > 20)) {
      m.box(x, 1.75, z, 0.2, 3.5, 0.2, C.dark, 0);
      m.box(x, 3.7, z, 0.7, 0.45, 0.7, C.lamp, 5);
    }
  }
  for (let z = 26; z < 64; z += 8) {
    for (const x of [-7.4, -1.6]) {
      m.box(x, 1.75, z, 0.2, 3.5, 0.2, C.dark, 0);
      m.box(x, 3.7, z, 0.7, 0.45, 0.7, C.lamp, 5);
    }
  }

  // Distant neighbourhood: muted blocks for scale and context
  for (let i = 0; i < 90; i++) {
    const a = rand() * Math.PI * 2;
    const r = 150 + rand() * 520;
    const x = Math.cos(a) * r * 1.25, z = Math.sin(a) * r;
    if (z > 80 && z < 105) continue;
    if (Math.abs(x) < 125 && z > -90 && z < 105) continue;
    const bw = 12 + rand() * 24, bd = 12 + rand() * 24, bh = 9 + rand() * 34;
    const col = C.city[Math.floor(rand() * C.city.length)];
    m.box(x, bh / 2, z, bw, bh, bd, col, 1, { top: C.roof, topKind: 0, noBottom: true });
  }
  return m;
}

function buildDecal(L) {
  const m = new Mesh();
  m.rect(L.x - L.w / 2 - 3, L.z - L.d / 2 - 3, L.x + L.w / 2 + 3, L.z + L.d / 2 + 3, 0.12, C.amber, 0);
  return m;
}

let cache = null;

const tick = () => new Promise((r) => setTimeout(r, 0));

// Builds all geometry once (shared by every canvas on the page).
// onProgress(0..1) is called as each stage completes, which drives the 3D loader.
export function getSceneData(onProgress = () => {}) {
  if (!cache) {
    cache = (async () => {
      const rand = rng(7);
      const report = (p) => onProgress(p);
      report(0.02);
      await tick();
      const ground = buildGround().build();
      report(0.2);
      await tick();
      const props = buildProps(rand).build();
      report(0.4);
      await tick();
      const list = [];
      let i = 0;
      for (const meta of towerMeta) {
        const L = LAYOUT[meta.id];
        const data = buildTower(meta, L).build();
        list.push({
          id: meta.id,
          name: meta.name,
          family: meta.family,
          ready: meta.ready,
          pos: [L.x, 0, L.z],
          size: [L.w, L.d],
          data,
          decal: meta.ready ? buildDecal(L).build() : null,
          min: [L.x - L.w / 2, 0, L.z - L.d / 2],
          max: [L.x + L.w / 2, TOP + 3, L.z + L.d / 2],
          anchor: [L.x, TOP + 4, L.z],
        });
        i++;
        report(0.4 + (i / towerMeta.length) * 0.5);
        await tick();
      }
      report(0.92);
      return { ground, props, towers: list, roundabout: [150, 14, 91] };
    })();
  }
  return cache;
}
