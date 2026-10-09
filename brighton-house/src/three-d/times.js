// Time-of-day looks. The engine blends smoothly between these.
// az = compass-ish angle of the sun measured from +Z (south) towards +X.
export const TIMES = {
  dawn: {
    top: [0.2, 0.28, 0.58], mid: [0.6, 0.54, 0.76], hor: [1.0, 0.76, 0.58],
    sunEl: 14, sunAz: 62, sunCol: [1.0, 0.74, 0.5],
    amb: [0.52, 0.56, 0.74], gnd: [0.4, 0.36, 0.36],
    night: 0.2, fog: 0.0015, shadow: 0.26,
  },
  day: {
    top: [0.27, 0.5, 0.94], mid: [0.6, 0.77, 1.0], hor: [0.88, 0.94, 1.0],
    sunEl: 50, sunAz: 28, sunCol: [1.0, 0.96, 0.88],
    amb: [0.62, 0.7, 0.9], gnd: [0.44, 0.45, 0.42],
    night: 0, fog: 0.0013, shadow: 0.28,
  },
  dusk: {
    top: [0.06, 0.1, 0.36], mid: [0.34, 0.3, 0.62], hor: [1.0, 0.64, 0.4],
    sunEl: 10, sunAz: -56, sunCol: [1.0, 0.58, 0.3],
    amb: [0.4, 0.44, 0.7], gnd: [0.34, 0.28, 0.32],
    night: 0.62, fog: 0.0016, shadow: 0.3,
  },
  night: {
    top: [0.02, 0.03, 0.11], mid: [0.05, 0.08, 0.22], hor: [0.13, 0.17, 0.36],
    sunEl: 42, sunAz: -35, sunCol: [0.34, 0.44, 0.85],
    amb: [0.18, 0.22, 0.42], gnd: [0.1, 0.11, 0.2],
    night: 1, fog: 0.0016, shadow: 0.14,
  },
};

// Flatten a look into a number array so it can be lerped.
export function toVec(t) {
  return [
    ...t.top, ...t.mid, ...t.hor, t.sunEl, t.sunAz, ...t.sunCol,
    ...t.amb, ...t.gnd, t.night, t.fog, t.shadow,
  ];
}

export function fromVec(v) {
  return {
    top: v.slice(0, 3), mid: v.slice(3, 6), hor: v.slice(6, 9),
    sunEl: v[9], sunAz: v[10], sunCol: v.slice(11, 14),
    amb: v.slice(14, 17), gnd: v.slice(17, 20),
    night: v[20], fog: v[21], shadow: v[22],
  };
}
