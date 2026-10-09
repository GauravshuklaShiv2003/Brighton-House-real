import { useEffect, useRef, useState } from 'react';

// Fade-and-rise on scroll. Content is visible (slightly faded) before it animates, never hidden.
export function Reveal({ as: Tag = 'div', delay = 0, className = '', children, ...rest }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    if (typeof IntersectionObserver === 'undefined') {
      el.classList.add('in');
      return undefined;
    }
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          el.classList.add('in');
          io.disconnect();
        }
      },
      { rootMargin: '0px 0px -8% 0px' }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <Tag ref={ref} className={`rv ${className}`} style={{ '--d': `${delay}ms` }} {...rest}>
      {children}
    </Tag>
  );
}

// Cards that lean slightly toward the pointer. Pure CSS variables, no re-renders.
export function Tilt({ as: Tag = 'div', className = '', max = 6, children, ...rest }) {
  const ref = useRef(null);
  const onMove = (e) => {
    if (e.pointerType && e.pointerType !== 'mouse') return;
    const el = ref.current;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    el.style.setProperty('--rx', `${(-y * max).toFixed(2)}deg`);
    el.style.setProperty('--ry', `${(x * max).toFixed(2)}deg`);
    el.style.setProperty('--gx', `${((x + 0.5) * 100).toFixed(0)}%`);
    el.style.setProperty('--gy', `${((y + 0.5) * 100).toFixed(0)}%`);
  };
  const onLeave = () => {
    const el = ref.current;
    el.style.setProperty('--rx', '0deg');
    el.style.setProperty('--ry', '0deg');
  };
  return (
    <Tag ref={ref} className={`tilt ${className}`} onPointerMove={onMove} onPointerLeave={onLeave} {...rest}>
      {children}
    </Tag>
  );
}

// Static illustration used if WebGL is unavailable
export function Skyline() {
  const blocks = [
    [8, 58, 16, 34], [28, 50, 18, 42], [50, 44, 20, 48], [74, 54, 16, 38], [94, 46, 20, 46],
    [118, 56, 16, 36], [138, 48, 18, 44], [160, 52, 20, 40], [184, 58, 14, 34], [202, 50, 18, 42],
  ];
  return (
    <svg className="skyline" viewBox="0 0 224 100" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
      <defs>
        <linearGradient id="sk" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0a1450" />
          <stop offset="0.7" stopColor="#6b5aa8" />
          <stop offset="1" stopColor="#ffa366" />
        </linearGradient>
      </defs>
      <rect width="224" height="100" fill="url(#sk)" />
      <circle cx="170" cy="62" r="9" fill="#ffd18a" opacity=".85" />
      {blocks.map(([x, y, w, h], i) => (
        <g key={i}>
          <rect x={x} y={y} width={w} height={h} fill="#eee7da" />
          <rect x={x} y={y} width={w} height="2" fill="#c9ccd6" />
          {Array.from({ length: Math.floor(h / 7) }).map((_, r) =>
            [0, 1, 2].map((c) => (
              <rect key={`${r}${c}`} x={x + 2.2 + c * (w / 3.2)} y={y + 4 + r * 6.5} width={w / 6} height="3" fill={(i + r + c) % 3 ? '#24347c' : '#ffc76b'} />
            ))
          )}
        </g>
      ))}
      <rect x="0" y="92" width="224" height="8" fill="#2b2f3e" />
    </svg>
  );
}

// 3D "buffer" screen: floors of the tower fill in as the model loads
export function Loader({ target, onDone }) {
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);
  const targetRef = useRef(target);
  targetRef.current = target;

  // Ease towards the real progress. The loop stops by itself once the screen is dismissed.
  useEffect(() => {
    const start = performance.now();
    let raf = 0, p = 0, finished = false;
    const hard = setTimeout(() => finish(), 7000); // safety net
    function finish() {
      if (finished) return;
      finished = true;
      setProgress(1);
      setDone(true);
      onDone?.();
    }
    function tick() {
      const t = targetRef.current;
      p += (t - p) * 0.12;
      if (Math.abs(t - p) < 0.003) p = t;
      setProgress(p);
      if (p >= 0.995 && performance.now() - start > 900) return finish();
      raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(raf); clearTimeout(hard); };
  }, [onDone]);

  const floors = 5;
  const filled = Math.min(floors, Math.floor(progress * (floors + 1.05)));
  return (
    <div className={`loader ${done ? 'is-done' : ''}`} role="status" aria-live="polite" aria-hidden={done}>
      <div className="loader__inner">
        <svg className="loader__tower" viewBox="0 0 140 150" aria-hidden="true">
          <rect x="14" y="128" width="112" height="6" rx="2" fill="#243070" />
          <rect x="24" y="106" width="92" height="22" fill="#10184a" />
          {[30, 54, 78, 102].map((x) => (
            <rect key={x} x={x} y="106" width="6" height="22" fill="#4a5ab0" />
          ))}
          {Array.from({ length: floors }).map((_, i) => {
            const y = 84 - i * 22;
            const on = i < filled;
            return (
              <g key={i} className={on ? 'on' : ''}>
                <rect x="24" y={y} width="92" height="20" rx="2" className="loader__floor" />
                {[0, 1, 2, 3, 4].map((w) => (
                  <rect key={w} x={31 + w * 17} y={y + 5} width="9" height="10" rx="1" className="loader__win" />
                ))}
              </g>
            );
          })}
          <rect x="22" y="-2" width="96" height="4" rx="2" fill="#243070" transform="translate(0 4)" />
          <circle cx="104" cy="14" r="7" fill="#FFB020" opacity={filled >= floors ? 1 : 0.25} />
        </svg>
        <div className="loader__name">Brighton House</div>
        <div className="loader__bar"><span style={{ transform: `scaleX(${Math.max(0.02, progress)})` }} /></div>
        <div className="loader__meta">
          <span>Building the 3D model</span>
          <span>{Math.round(progress * 100)}%</span>
        </div>
      </div>
    </div>
  );
}

// Decorative, blurred "plan" drawings for the gated plan cards (not real plans)
export function MasterPlanArt() {
  return (
    <svg viewBox="0 0 320 200" className="planart" aria-hidden="true">
      <rect x="6" y="6" width="308" height="188" rx="10" fill="#f4f6ff" stroke="#9fb0ff" />
      <ellipse cx="160" cy="100" rx="58" ry="40" fill="#bfe3c6" stroke="#4a9a62" />
      {[[26, 22], [88, 22], [200, 22], [262, 22], [26, 140], [88, 140], [200, 140], [262, 140], [24, 82], [264, 82]].map(([x, y], i) => (
        <rect key={i} x={x} y={y} width="40" height="38" rx="3" fill="#dfe6ff" stroke="#1B3BE0" />
      ))}
      <path d="M160 194v-40M20 70h280" stroke="#9aa3c8" strokeDasharray="4 4" />
    </svg>
  );
}

export function UnitPlanArt() {
  return (
    <svg viewBox="0 0 320 200" className="planart" aria-hidden="true">
      <rect x="6" y="6" width="308" height="188" rx="10" fill="#f4f6ff" stroke="#9fb0ff" />
      <path d="M30 30h260v140H30z M30 90h110v80 M140 30v60h150 M200 90v80 M90 30v60" fill="none" stroke="#1B3BE0" strokeWidth="2" />
      <path d="M70 90v8M180 90v8M200 130h8M140 60h8" stroke="#ffb020" strokeWidth="4" />
      <circle cx="245" cy="60" r="14" fill="none" stroke="#4a9a62" strokeWidth="2" />
    </svg>
  );
}
