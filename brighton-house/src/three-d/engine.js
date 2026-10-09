// A small purpose-built WebGL renderer for the Brighton House site model.
// No 3D library needed: everything (sky, windows, shadows, camera, picking) lives in this folder.
import { mat4Perspective, mat4LookAt, mat4Mul, project, clamp, lerp, angleDelta, rayBox, DEG } from './math.js';
import { VERT, FRAG, SKY_VERT, SKY_FRAG } from './shaders.js';
import { getSceneData } from './scene.js';
import { TIMES, toVec, fromVec } from './times.js';
import { STRIDE } from './geometry.js';

export const VIEWS = {
  hero: { az: -28, pol: 71, r: 275, t: [0, 6, 4] },
  aerial: { az: -32, pol: 54, r: 235, t: [0, 4, 0] },
  entry: { az: -8, pol: 82, r: 100, t: [-4, 8, 50] },
  park: { az: 42, pol: 66, r: 72, t: [-2, 3, -2] },
  roofs: { az: 152, pol: 48, r: 130, t: [0, 14, 10] },
};

export async function createEngine(canvas, opts = {}) {
  const {
    mode = 'explorer', // 'hero' (auto-orbit + pointer parallax) or 'explorer' (drag, tap to select)
    time = 'day',
    view = 'aerial',
    quality = 'high',
    onProgress,
    onSelect,
    onHover,
    onLost,
  } = opts;

  const gl =
    canvas.getContext('webgl', { antialias: true, alpha: false, stencil: true, powerPreference: 'high-performance' }) ||
    canvas.getContext('experimental-webgl', { antialias: true, alpha: false, stencil: true });
  if (!gl) throw new Error('WebGL is not available');

  const data = await getSceneData(onProgress);

  // ---------- GL setup ----------
  const compile = (type, src) => {
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error('Shader error: ' + gl.getShaderInfoLog(s));
    return s;
  };
  const makeProgram = (vs, fs, attribs) => {
    const p = gl.createProgram();
    gl.attachShader(p, compile(gl.VERTEX_SHADER, vs));
    gl.attachShader(p, compile(gl.FRAGMENT_SHADER, fs));
    attribs.forEach((a, i) => gl.bindAttribLocation(p, i, a));
    gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error('Link error: ' + gl.getProgramInfoLog(p));
    const cache = {};
    p.u = (n) => (n in cache ? cache[n] : (cache[n] = gl.getUniformLocation(p, n)));
    return p;
  };
  const main = makeProgram(VERT, FRAG, ['aPos', 'aNor', 'aCol', 'aKind']);
  const sky = makeProgram(SKY_VERT, SKY_FRAG, ['aP']);

  const upload = (arr) => {
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, arr, gl.STATIC_DRAW);
    return { buf, count: arr.length / STRIDE };
  };
  const skyBuf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, skyBuf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);

  const groundMesh = upload(data.ground);
  const propsMesh = upload(data.props);
  const towers = data.towers.map((t) => ({
    ...t,
    mesh: upload(t.data),
    decalMesh: t.decal ? upload(t.decal) : null,
    sel: 0,
    dim: 0,
    hov: 0,
  }));

  const bindMesh = (m) => {
    gl.bindBuffer(gl.ARRAY_BUFFER, m.buf);
    const s = STRIDE * 4;
    gl.vertexAttribPointer(0, 3, gl.FLOAT, false, s, 0);
    gl.vertexAttribPointer(1, 3, gl.FLOAT, false, s, 12);
    gl.vertexAttribPointer(2, 3, gl.FLOAT, false, s, 24);
    gl.vertexAttribPointer(3, 1, gl.FLOAT, false, s, 36);
  };
  const drawMesh = (m) => {
    bindMesh(m);
    gl.drawArrays(gl.TRIANGLES, 0, m.count);
  };

  // ---------- state ----------
  const reduceMotion = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
  const v0 = VIEWS[mode === 'hero' ? 'hero' : view] || VIEWS.aerial;
  const cam = { az: v0.az, pol: v0.pol, r: v0.r, t: [...v0.t] };
  const tgt = { az: v0.az, pol: v0.pol, r: v0.r, t: [...v0.t] };
  let timeNow = toVec(TIMES[time] || TIMES.day);
  let timeTgt = [...timeNow];
  let family = null;
  let hoverId = null;
  let labels = [];
  let autoRotate = mode === 'hero' && !reduceMotion;
  let offX = 0, offXTgt = 0;
  let par = { x: 0, y: 0 }, parT = { x: 0, y: 0 };
  let scroll = 0;
  let W = 1, H = 1, cssW = 1, cssH = 1, dpr = 1;
  let lastUser = -1e9;
  let lastCam = null;
  let active = false, raf = 0, last = 0, clock = 0, destroyed = false;
  let slowFrames = 0, frameCount = 0, dprCap = quality === 'low' ? 1.25 : 2;

  function resize() {
    const rect = canvas.getBoundingClientRect();
    cssW = Math.max(1, rect.width);
    cssH = Math.max(1, rect.height);
    dpr = Math.min(window.devicePixelRatio || 1, dprCap);
    const maxPx = 2.6e6;
    if (cssW * cssH * dpr * dpr > maxPx) dpr = Math.sqrt(maxPx / (cssW * cssH));
    const w = Math.round(cssW * dpr), h = Math.round(cssH * dpr);
    if (w !== W || h !== H || canvas.width !== w) {
      W = w; H = h;
      canvas.width = W;
      canvas.height = H;
    }
    if (!active) draw(clock);
  }

  // ---------- frame ----------
  function update(dt) {
    clock += dt;
    const k = 1 - Math.exp(-dt * (mode === 'hero' ? 2.6 : 4.5));
    cam.az += angleDelta(cam.az, tgt.az) * k;
    cam.pol += (tgt.pol - cam.pol) * k;
    cam.r += (tgt.r - cam.r) * k;
    for (let i = 0; i < 3; i++) cam.t[i] += (tgt.t[i] - cam.t[i]) * k;
    offX += (offXTgt - offX) * (1 - Math.exp(-dt * 3));
    par.x += (parT.x - par.x) * (1 - Math.exp(-dt * 3));
    par.y += (parT.y - par.y) * (1 - Math.exp(-dt * 3));
    const kt = 1 - Math.exp(-dt * 2.2);
    for (let i = 0; i < timeNow.length; i++) timeNow[i] += (timeTgt[i] - timeNow[i]) * kt;

    if (mode === 'explorer' && !reduceMotion && performance.now() - lastUser > 6000) tgt.az += dt * 2.2;

    const k2 = 1 - Math.exp(-dt * 8);
    for (const t of towers) {
      const selT = family && t.family === family ? 1 : 0;
      t.sel += (selT - t.sel) * k2;
      t.dim += ((family && !selT ? 1 : 0) - t.dim) * k2;
      t.hov += ((hoverId === t.id ? 1 : 0) - t.hov) * k2;
    }

    // Slow-device guard: if the first second is choppy, lower resolution once.
    frameCount++;
    if (frameCount > 8 && frameCount < 90) {
      if (dt > 0.034) slowFrames++;
      if (frameCount === 89 && slowFrames > 40 && dprCap > 1) {
        dprCap = 1;
        resize();
      }
    }
  }

  function camera() {
    let az = cam.az, pol = cam.pol, r = cam.r;
    if (mode === 'hero') {
      if (autoRotate) az += 22 * Math.sin(clock * 0.1);
      az += par.x * 7;
      pol += par.y * 3.5 - scroll * 7;
      r *= 1 + scroll * 0.2;
    }
    const sp = Math.sin(pol * DEG), cp = Math.cos(pol * DEG);
    const eye = [
      cam.t[0] + r * sp * Math.sin(az * DEG),
      cam.t[1] + r * cp,
      cam.t[2] + r * sp * Math.cos(az * DEG),
    ];
    return { eye, target: cam.t };
  }

  function draw(t) {
    if (destroyed || gl.isContextLost()) return;
    const aspect = W / H;
    // Keep the horizontal field of view generous on tall (phone) canvases
    const fovy = Math.min(64 * DEG, Math.max(36 * DEG, 2 * Math.atan((Math.tan(18 * DEG) * 1.55) / aspect)));
    const { eye, target } = camera();
    const proj = mat4Perspective(fovy, aspect, 1, 4000, offX, 0);
    const view = mat4LookAt(eye, target);
    const vp = mat4Mul(proj, view);

    // camera basis (for sky + picking)
    let fx = target[0] - eye[0], fy = target[1] - eye[1], fz = target[2] - eye[2];
    const fl = Math.hypot(fx, fy, fz);
    fx /= fl; fy /= fl; fz /= fl;
    let rx = fz, ry = 0, rz = -fx; // fwd x up(0,1,0) = (fz, 0, -fx)
    const rl = Math.hypot(rx, rz) || 1;
    rx /= rl; rz /= rl;
    const ux = ry * fz - rz * fy, uy = rz * fx - rx * fz, uz = rx * fy - ry * fx;
    const tanY = Math.tan(fovy / 2);
    lastCam = { eye, fwd: [fx, fy, fz], right: [rx, ry, rz], up: [ux, uy, uz], tanY, aspect, vp };

    const L = fromVec(timeNow);
    const sEl = L.sunEl * DEG, sAz = L.sunAz * DEG;
    const sun = [Math.cos(sEl) * Math.sin(sAz), Math.sin(sEl), Math.cos(sEl) * Math.cos(sAz)];
    const shEl = Math.max(L.sunEl, 22) * DEG;
    const shDir = [Math.cos(shEl) * Math.sin(sAz), Math.sin(shEl), Math.cos(shEl) * Math.cos(sAz)];

    gl.viewport(0, 0, W, H);
    gl.clearColor(L.hor[0], L.hor[1], L.hor[2], 1);
    gl.clearStencil(0);
    gl.disable(gl.BLEND);
    gl.depthMask(true);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT | gl.STENCIL_BUFFER_BIT);

    // --- sky ---
    gl.disable(gl.DEPTH_TEST);
    for (let i = 1; i < 4; i++) gl.disableVertexAttribArray(i);
    gl.useProgram(sky);
    gl.bindBuffer(gl.ARRAY_BUFFER, skyBuf);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    gl.uniform3f(sky.u('uRight'), rx, ry, rz);
    gl.uniform3f(sky.u('uUpV'), ux, uy, uz);
    gl.uniform3f(sky.u('uFwd'), fx, fy, fz);
    gl.uniform2f(sky.u('uTan'), tanY * aspect, tanY);
    gl.uniform2f(sky.u('uOff'), offX, 0);
    gl.uniform3fv(sky.u('uTop'), L.top);
    gl.uniform3fv(sky.u('uMid'), L.mid);
    gl.uniform3fv(sky.u('uHor'), L.hor);
    gl.uniform3fv(sky.u('uSunDir'), sun);
    gl.uniform3fv(sky.u('uSunCol'), L.sunCol);
    gl.uniform1f(sky.u('uNight'), L.night);
    gl.drawArrays(gl.TRIANGLES, 0, 3);

    // --- world ---
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    for (let i = 0; i < 4; i++) gl.enableVertexAttribArray(i);
    gl.useProgram(main);
    gl.uniformMatrix4fv(main.u('uVP'), false, vp);
    gl.uniform3fv(main.u('uCam'), eye);
    gl.uniform3fv(main.u('uSunDir'), sun);
    gl.uniform3fv(main.u('uSunCol'), L.sunCol);
    gl.uniform3fv(main.u('uAmb'), L.amb);
    gl.uniform3fv(main.u('uGnd'), L.gnd);
    gl.uniform3fv(main.u('uFogCol'), L.hor);
    gl.uniform1f(main.u('uFogDen'), L.fog);
    gl.uniform1f(main.u('uTime'), t);
    gl.uniform1f(main.u('uNight'), L.night);
    gl.uniform3fv(main.u('uShadowDir'), shDir);
    gl.uniform1f(main.u('uShadowY'), 0.09);
    gl.uniform3fv(main.u('uGlowCol'), [0.36, 0.52, 1.0]);

    const setObj = (off, tint, lit, dim, glow) => {
      gl.uniform3fv(main.u('uOffset'), off);
      gl.uniform3fv(main.u('uTint'), tint);
      gl.uniform1f(main.u('uLit'), lit);
      gl.uniform1f(main.u('uDim'), dim);
      gl.uniform1f(main.u('uGlow'), glow);
    };
    const ZERO = [0, 0, 0], ONE = [1, 1, 1];
    gl.uniform1f(main.u('uMode'), 0);
    setObj(ZERO, ONE, 0, 0, 0);
    drawMesh(groundMesh);
    drawMesh(propsMesh);

    const readyLit = clamp(L.night * 1.25, 0, 1);
    const otherLit = clamp(L.night * 0.28, 0, 1);
    for (const tw of towers) {
      const s = tw.sel;
      const tint = [lerp(1, 1.05, s), lerp(1, 1.05, s), lerp(1, 1.12, s)];
      setObj(tw.pos, tint, tw.ready ? readyLit : otherLit, tw.dim, s * 0.9 + tw.hov * 0.55);
      drawMesh(tw.mesh);
    }

    // --- planar shadows (stencil keeps overlaps from doubling up) ---
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.depthMask(false);
    gl.enable(gl.STENCIL_TEST);
    gl.stencilFunc(gl.NOTEQUAL, 1, 0xff);
    gl.stencilOp(gl.KEEP, gl.KEEP, gl.REPLACE);
    gl.uniform1f(main.u('uMode'), 1);
    gl.uniform4f(main.u('uDecal'), 0.03, 0.05, 0.16, L.shadow);
    setObj(ZERO, ONE, 0, 0, 0);
    drawMesh(propsMesh);
    for (const tw of towers) {
      gl.uniform3fv(main.u('uOffset'), tw.pos);
      drawMesh(tw.mesh);
    }
    gl.disable(gl.STENCIL_TEST);

    // --- "ready to move in" glow under finished towers ---
    gl.uniform1f(main.u('uMode'), 2);
    gl.uniform4f(main.u('uDecal'), 1.0, 0.69, 0.13, 0.42);
    gl.uniform3fv(main.u('uOffset'), ZERO);
    for (const tw of towers) if (tw.decalMesh) drawMesh(tw.decalMesh);

    gl.depthMask(true);
    gl.disable(gl.BLEND);

    positionLabels(vp);
  }

  function positionLabels(vp) {
    if (!labels.length) return;
    for (const l of labels) {
      const tw = towers.find((x) => x.id === l.id) || (l.id === 'roundabout' ? { anchor: data.roundabout } : null);
      if (!tw || !l.el) continue;
      const p = project(vp, tw.anchor, cssW, cssH);
      if (!p || p.x < -60 || p.x > cssW + 60 || p.y < -30 || p.y > cssH + 30) {
        l.el.style.visibility = 'hidden';
        continue;
      }
      l.el.style.visibility = 'visible';
      l.el.style.transform = `translate3d(${p.x.toFixed(1)}px, ${p.y.toFixed(1)}px, 0) translate(-50%, -100%)`;
      l.el.style.zIndex = String(Math.round(1000 - p.depth * 500));
    }
  }

  // ---------- picking ----------
  function pickAt(clientX, clientY) {
    if (!lastCam) return null;
    const rect = canvas.getBoundingClientRect();
    const nx = ((clientX - rect.left) / rect.width) * 2 - 1;
    const ny = 1 - ((clientY - rect.top) / rect.height) * 2;
    const { eye, fwd, right, up, tanY, aspect } = lastCam;
    const px = (nx - offX) * tanY * aspect, py = ny * tanY;
    let d = [fwd[0] + right[0] * px + up[0] * py, fwd[1] + right[1] * px + up[1] * py, fwd[2] + right[2] * px + up[2] * py];
    const dl = Math.hypot(d[0], d[1], d[2]);
    d = [d[0] / dl, d[1] / dl, d[2] / dl];
    let best = null, bestT = Infinity;
    for (const tw of towers) {
      const hit = rayBox(eye, d, tw.min, tw.max);
      if (hit >= 0 && hit < bestT) { bestT = hit; best = tw; }
    }
    return best ? best.id : null;
  }

  // ---------- pointer input (explorer) ----------
  let drag = null;
  const onDown = (e) => {
    if (mode !== 'explorer') return;
    drag = { id: e.pointerId, x: e.clientX, y: e.clientY, sx: e.clientX, sy: e.clientY, moved: false, type: e.pointerType };
    lastUser = performance.now();
  };
  const onMove = (e) => {
    if (mode !== 'explorer') return;
    if (drag && e.pointerId === drag.id) {
      const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
      if (!drag.moved && Math.hypot(e.clientX - drag.sx, e.clientY - drag.sy) < 6) return;
      if (!drag.moved) canvas.setPointerCapture?.(e.pointerId);
      drag.moved = true;
      tgt.az -= dx * 0.32;
      if (drag.type !== 'touch') tgt.pol = clamp(tgt.pol - dy * 0.22, 25, 86);
      drag.x = e.clientX;
      drag.y = e.clientY;
      canvas.style.cursor = 'grabbing';
      lastUser = performance.now();
      if (!active) requestOnce();
      return;
    }
    if (e.pointerType === 'mouse') {
      const id = pickAt(e.clientX, e.clientY);
      if (id !== hoverId) {
        hoverId = id;
        canvas.style.cursor = id ? 'pointer' : 'grab';
        onHover?.(id);
      }
    }
  };
  const onUp = (e) => {
    if (!drag || e.pointerId !== drag.id) return;
    const moved = drag.moved;
    drag = null;
    canvas.style.cursor = '';
    if (!moved) onSelect?.(pickAt(e.clientX, e.clientY));
  };
  const onCancel = () => { drag = null; canvas.style.cursor = ''; };
  const onLeave = () => { if (hoverId) { hoverId = null; onHover?.(null); } };
  canvas.addEventListener('pointerdown', onDown);
  canvas.addEventListener('pointermove', onMove);
  canvas.addEventListener('pointerup', onUp);
  canvas.addEventListener('pointercancel', onCancel);
  canvas.addEventListener('pointerleave', onLeave);
  const lostHandler = (e) => { e.preventDefault(); onLost?.(); };
  canvas.addEventListener('webglcontextlost', lostHandler);

  // ---------- loop ----------
  function loop(now) {
    raf = requestAnimationFrame(loop);
    const dt = Math.min(0.05, Math.max(0.001, (now - last) / 1000 || 0.016));
    last = now;
    update(dt);
    draw(clock);
  }
  function requestOnce() {
    requestAnimationFrame((now) => {
      if (destroyed || active) return;
      update(0.03);
      draw(clock);
    });
  }

  resize();
  update(0.016);
  draw(0);

  const api = {
    resize,
    setActive(a) {
      if (destroyed || a === active) return;
      active = a;
      if (a) {
        last = performance.now();
        raf = requestAnimationFrame(loop);
      } else {
        cancelAnimationFrame(raf);
      }
    },
    setTime(name) {
      if (TIMES[name]) timeTgt = toVec(TIMES[name]);
      if (!active) requestOnce();
    },
    setFamily(f) {
      family = f || null;
      if (!active) requestOnce();
    },
    setView(name) {
      const v = VIEWS[name];
      if (!v) return;
      tgt.az = v.az; tgt.pol = v.pol; tgt.r = v.r; tgt.t = [...v.t];
      lastUser = performance.now();
      if (!active) requestOnce();
    },
    zoom(f) {
      tgt.r = clamp(tgt.r * f, 45, 340);
      lastUser = performance.now();
      if (!active) requestOnce();
    },
    setViewOffset(x) { offXTgt = x; if (!active) { offX = x; draw(clock); } },
    setParallax(x, y) { parT = { x, y }; },
    setScroll(p) { scroll = clamp(p, 0, 1); },
    setAutoRotate(v) { autoRotate = v && !reduceMotion; },
    setLabels(list) { labels = list || []; if (!active) requestOnce(); },
    pickAt,
    towers: towers.map((t) => ({ id: t.id, name: t.name, family: t.family, ready: t.ready })),
    destroy() {
      destroyed = true;
      active = false;
      cancelAnimationFrame(raf);
      canvas.removeEventListener('pointerdown', onDown);
      canvas.removeEventListener('pointermove', onMove);
      canvas.removeEventListener('pointerup', onUp);
      canvas.removeEventListener('pointercancel', onCancel);
      canvas.removeEventListener('pointerleave', onLeave);
      canvas.removeEventListener('webglcontextlost', lostHandler);
      gl.getExtension('WEBGL_lose_context')?.loseContext();
    },
  };
  return api;
}
