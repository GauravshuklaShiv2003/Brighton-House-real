import { useEffect, useRef, useState } from 'react';
import { amenityGroups, dayMoments, site } from '../config/site.js';
import { Icon } from './Icons.jsx';
import { useLead } from './Lead.jsx';
import { Reveal, Tilt } from './Misc.jsx';

export function Amenities() {
  const { open } = useLead();
  const [tab, setTab] = useState('all');
  const scroller = useRef(null);
  const groups = tab === 'all' ? amenityGroups : amenityGroups.filter((g) => g.id === tab);
  const items = groups.flatMap((g) => g.items.map((it) => ({ ...it, group: g.id, groupLabel: g.label })));

  useEffect(() => {
    scroller.current?.scrollTo({ left: 0 });
  }, [tab]);
  const nudge = (dir) => {
    const el = scroller.current;
    if (el) el.scrollBy({ left: dir * Math.min(420, el.clientWidth * 0.8), behavior: 'smooth' });
  };

  return (
    <section id="amenities" className="section section--white">
      <div className="wrap">
        <Reveal className="section__head section__head--split">
          <div>
            <p className="eyebrow">Amenities</p>
            <h2>Beyond four walls.</h2>
            <p className="section__sub">Spaces for wellness, connection and peace of mind. Something for every member of the family.</p>
          </div>
          <div className="arrows" aria-label="Scroll amenities">
            <button onClick={() => nudge(-1)} aria-label="Previous"><Icon name="arrowLeft" size={20} /></button>
            <button onClick={() => nudge(1)} aria-label="Next"><Icon name="arrow" size={20} /></button>
          </div>
        </Reveal>
        <div className="chips" role="tablist" aria-label="Amenity type">
          <button role="tab" aria-selected={tab === 'all'} className={tab === 'all' ? 'is-on' : ''} onClick={() => setTab('all')}>All</button>
          {amenityGroups.map((g) => (
            <button key={g.id} role="tab" aria-selected={tab === g.id} className={tab === g.id ? 'is-on' : ''} onClick={() => setTab(g.id)}>{g.label}</button>
          ))}
        </div>
      </div>
      <div className="scroller" ref={scroller} tabIndex={0} aria-label="Amenity cards, scroll sideways">
        {items.map((a) => (
          <Tilt key={a.id} className={`amen amen--${a.group}`} max={5}>
            <div className="amen__art">
              <span className="amen__ring amen__ring--1" />
              <span className="amen__ring amen__ring--2" />
              <span className="amen__icon"><Icon name={a.icon} size={34} strokeWidth={1.5} /></span>
              <span className="amen__group">{a.groupLabel}</span>
            </div>
            <div className="amen__body">
              <h3>{a.title}</h3>
              <span className="amen__fact">{a.fact}</span>
              <p>{a.text}</p>
            </div>
          </Tilt>
        ))}
      </div>
      <div className="wrap">
        <div className="center">
          <button className="btn btn--blue" onClick={() => open('brochure')}>
            <Icon name="download" size={18} /> Get the full amenities list
          </button>
        </div>
      </div>
    </section>
  );
}

function DayDial({ index }) {
  const m = dayMoments[index];
  const t = index / (dayMoments.length - 1);
  const x = 200 - 165 * Math.cos(t * Math.PI);
  const y = 176 - 128 * Math.sin(t * Math.PI);
  const night = m.tod === 'night';
  return (
    <div className={`dial dial--${m.tod}`}>
      <svg viewBox="0 0 400 230" role="img" aria-label={`${m.time}: ${m.title}`}>
        <defs>
          <linearGradient id="dialsky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="var(--sky-a)" />
            <stop offset="1" stopColor="var(--sky-b)" />
          </linearGradient>
        </defs>
        <rect width="400" height="230" rx="22" fill="url(#dialsky)" />
        {night && [[60, 40], [120, 24], [300, 36], [340, 70], [250, 20], [30, 90]].map(([sx, sy], i) => <circle key={i} cx={sx} cy={sy} r="1.6" fill="#fff" opacity=".8" />)}
        <path d="M35 176 A165 128 0 0 1 365 176" fill="none" stroke="rgba(255,255,255,.35)" strokeDasharray="3 7" />
        <g className="dial__sun" style={{ transform: `translate(${x}px, ${y}px)` }}>
          {night ? (
            <path d="M8 -4 A10 10 0 1 1 -4 -8 A8 8 0 0 0 8 -4z" fill="#EAF0FF" />
          ) : (
            <>
              <circle r="22" fill="#FFB020" opacity=".25" />
              <circle r="12" fill="#FFB020" />
            </>
          )}
        </g>
        <g fill="rgba(8,14,50,.92)">
          {[40, 90, 140, 190, 240, 290].map((bx, i) => (
            <rect key={bx} x={bx} y={176 - (i % 3 === 1 ? 36 : 28)} width="40" height={(i % 3 === 1 ? 36 : 28) + 54} />
          ))}
        </g>
        <g fill="#ffcf7a" opacity={night || m.tod === 'dusk' ? 0.95 : 0.25}>
          {[50, 62, 100, 112, 150, 162, 200, 212, 250, 262, 300, 312].map((wx, i) => (
            <rect key={wx} x={wx} y={158 + (i % 2) * 14} width="6" height="7" />
          ))}
        </g>
        <rect x="0" y="208" width="400" height="22" fill="rgba(5,9,34,.9)" />
      </svg>
    </div>
  );
}

export function Life() {
  const { open } = useLead();
  const [active, setActive] = useState(0);
  const refs = useRef([]);
  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return undefined;
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(Number(e.target.dataset.i))),
      { rootMargin: '-42% 0px -42% 0px' }
    );
    refs.current.forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <section id="life" className="section section--paper">
      <div className="wrap life">
        <div className="life__sticky">
          <Reveal>
            <p className="eyebrow">Life at {site.name}</p>
            <h2>What does an ordinary day feel like here?</h2>
            <p className="section__sub">Scroll through a day in the community.</p>
          </Reveal>
          <DayDial index={active} />
          <div className="life__now" aria-live="polite">
            <span className="mono">{dayMoments[active].time}</span>
            <b>{dayMoments[active].amenity}</b>
          </div>
        </div>
        <ol className="moments">
          {dayMoments.map((m, i) => (
            <li key={m.time} ref={(el) => (refs.current[i] = el)} data-i={i} className={i === active ? 'is-active' : ''}>
              <span className="moments__time">{m.time}</span>
              <h3>{m.title}</h3>
              <p>{m.text}</p>
              <span className="pill pill--soft">{m.amenity}</span>
            </li>
          ))}
          <li className="moments__cta">
            <button className="btn btn--blue" onClick={() => open('visit')}>See it for yourself <Icon name="arrow" size={18} /></button>
          </li>
        </ol>
      </div>
    </section>
  );
}
