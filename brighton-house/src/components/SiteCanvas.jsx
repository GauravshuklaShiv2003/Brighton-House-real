import { useEffect, useImperativeHandle, useRef, useState } from 'react';
import { createEngine } from '../three-d/engine.js';
import { useInView, usePageVisible } from '../hooks/hooks.js';
import { Icon } from './Icons.jsx';

const lowEnd = () =>
  typeof navigator !== 'undefined' &&
  ((navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4) || (navigator.deviceMemory && navigator.deviceMemory <= 3));

// React wrapper around the WebGL engine. Handles lazy start, pausing off-screen, resize and fallbacks.
export default function SiteCanvas({
  ref,
  mode = 'explorer',
  time = 'day',
  view = 'aerial',
  family = null,
  offsetX = 0,
  tags = null, // [{ id, text, ready, family, plain }]
  activeFamily = null,
  lazy = false,
  onSelect,
  onTag,
  onProgress,
  onReady,
  onFail,
  fallback = null,
  className = '',
  children,
}) {
  const wrap = useRef(null);
  const canvas = useRef(null);
  const engineRef = useRef(null);
  const tagEls = useRef({});
  const [failed, setFailed] = useState(false);
  const [ready, setReady] = useState(false);
  const inView = useInView(wrap, { rootMargin: '250px 0px' });
  const visible = usePageVisible();
  const [started, setStarted] = useState(!lazy);
  const cb = useRef({});
  cb.current = { onSelect, onProgress, onReady, onFail };
  const initial = useRef({ time, view, offsetX });

  useEffect(() => {
    if (lazy && inView) setStarted(true);
  }, [lazy, inView]);

  useImperativeHandle(ref, () => ({
    zoom: (f) => engineRef.current?.zoom(f),
  }));

  useEffect(() => {
    if (!started || !canvas.current) return undefined;
    let dead = false, ro = null, eng = null;
    createEngine(canvas.current, {
      mode,
      time: initial.current.time,
      view: initial.current.view,
      quality: lowEnd() ? 'low' : 'high',
      onProgress: (p) => cb.current.onProgress?.(p),
      onSelect: (id) => cb.current.onSelect?.(id),
      onLost: () => { setFailed(true); cb.current.onFail?.(); },
    })
      .then((e) => {
        if (dead) { e.destroy(); return; }
        eng = e;
        engineRef.current = e;
        e.setViewOffset(initial.current.offsetX);
        ro = new ResizeObserver(() => e.resize());
        ro.observe(wrap.current);
        setReady(true);
        cb.current.onReady?.();
      })
      .catch((err) => {
        console.warn('3D view unavailable, showing the illustration instead.', err);
        if (!dead) { setFailed(true); cb.current.onFail?.(); }
      });
    return () => {
      dead = true;
      ro?.disconnect();
      eng?.destroy();
      engineRef.current = null;
      setReady(false);
    };
  }, [started, mode]);

  useEffect(() => { engineRef.current?.setTime(time); }, [time, ready]);
  useEffect(() => { engineRef.current?.setFamily(family); }, [family, ready]);
  useEffect(() => { engineRef.current?.setView(view); }, [view, ready]);
  useEffect(() => { engineRef.current?.setViewOffset(offsetX); }, [offsetX, ready]);
  useEffect(() => { engineRef.current?.setActive(inView && visible); }, [inView, visible, ready]);

  // Floating tower name tags follow their towers on screen
  useEffect(() => {
    if (!ready || !tags) return;
    engineRef.current?.setLabels(tags.map((t) => ({ id: t.id, el: tagEls.current[t.id] })));
  }, [ready, tags]);

  // Hero only: gentle pointer parallax and scroll-driven camera lift
  useEffect(() => {
    if (mode !== 'hero' || !ready) return undefined;
    const onMove = (e) => {
      if (e.pointerType && e.pointerType !== 'mouse') return;
      engineRef.current?.setParallax((e.clientX / innerWidth - 0.5) * 2, (e.clientY / innerHeight - 0.5) * 2);
    };
    const onScroll = () => {
      const r = wrap.current?.getBoundingClientRect();
      if (r) engineRef.current?.setScroll(Math.min(1, Math.max(0, -r.top / Math.max(1, r.height))));
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('scroll', onScroll);
    };
  }, [mode, ready]);

  return (
    <div ref={wrap} className={`sitecanvas sitecanvas--${mode} ${className}`} data-ready={ready} data-failed={failed}>
      {!failed && <canvas ref={canvas} className="sitecanvas__gl" aria-hidden="true" />}
      {failed && fallback}
      {!failed && !ready && started && lazy && (
        <div className="sitecanvas__boot"><Icon name="cube" size={22} /> Loading 3D model…</div>
      )}
      {tags && !failed && (
        <div className="sitecanvas__tags">
          {tags.map((t) =>
            t.plain ? (
              <span key={t.id} ref={(el) => { tagEls.current[t.id] = el; }} className="tag tag--plain">{t.text}</span>
            ) : (
              <button
                key={t.id}
                ref={(el) => { tagEls.current[t.id] = el; }}
                className={`tag ${t.ready ? 'tag--ready' : ''} ${activeFamily && t.family !== activeFamily ? 'is-dim' : ''} ${activeFamily && t.family === activeFamily ? 'is-active' : ''}`}
                onClick={() => onTag?.(t.id)}
                aria-label={`${t.text}${t.ready ? ', ready to move in' : ''}`}
              >
                {t.ready && <i className="tag__dot" />}
                {t.text}
              </button>
            )
          )}
        </div>
      )}
      {children}
    </div>
  );
}
