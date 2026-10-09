import { useEffect, useState } from 'react';

export function useInView(ref, { rootMargin = '0px', threshold = 0 } = {}) {
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    if (typeof IntersectionObserver === 'undefined') {
      setInView(true);
      return undefined;
    }
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { rootMargin, threshold });
    io.observe(el);
    return () => io.disconnect();
  }, [ref, rootMargin, threshold]);
  return inView;
}

export function useMedia(query) {
  const get = () => (typeof matchMedia === 'function' ? matchMedia(query).matches : false);
  const [matches, setMatches] = useState(get);
  useEffect(() => {
    if (typeof matchMedia !== 'function') return undefined;
    const mq = matchMedia(query);
    const on = () => setMatches(mq.matches);
    on();
    mq.addEventListener?.('change', on);
    return () => mq.removeEventListener?.('change', on);
  }, [query]);
  return matches;
}

export function usePageVisible() {
  const [v, setV] = useState(typeof document === 'undefined' ? true : !document.hidden);
  useEffect(() => {
    const on = () => setV(!document.hidden);
    document.addEventListener('visibilitychange', on);
    return () => document.removeEventListener('visibilitychange', on);
  }, []);
  return v;
}

export function useScrolled(threshold = 40) {
  const [s, setS] = useState(false);
  useEffect(() => {
    // React ignores repeat values, so this is cheap even though it runs on every scroll event.
    const on = () => setS((window.scrollY || document.documentElement.scrollTop || 0) > threshold);
    on();
    window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, [threshold]);
  return s;
}

// Highlights the nav link of the section currently on screen.
export function useActiveSection(ids) {
  const [active, setActive] = useState('');
  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return undefined;
    const seen = new Map();
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => seen.set(e.target.id, e.isIntersecting ? e.intersectionRatio : 0));
        let best = '', bestV = 0;
        seen.forEach((v, k) => { if (v > bestV) { best = k; bestV = v; } });
        setActive(best);
      },
      { rootMargin: '-35% 0px -45% 0px', threshold: [0, 0.1, 0.4, 0.8] }
    );
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) io.observe(el);
    });
    return () => io.disconnect();
  }, [ids.join('|')]);
  return active;
}
