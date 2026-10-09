import { useMemo, useRef, useState } from 'react';
import { towers, families, facts } from '../config/site.js';
import { Icon } from './Icons.jsx';
import { useLead } from './Lead.jsx';
import SiteCanvas from './SiteCanvas.jsx';
import { Reveal, Skyline } from './Misc.jsx';

const VIEW_OPTS = [
  ['aerial', 'Aerial'],
  ['entry', 'Entry'],
  ['park', 'Park'],
  ['roofs', 'Rooftops'],
];
const TIME_OPTS = [
  ['dawn', 'Dawn', 'sunrise'],
  ['day', 'Day', 'sun'],
  ['dusk', 'Dusk', 'sunset'],
  ['night', 'Night', 'moon'],
];

export function Explorer() {
  const { open } = useLead();
  const [family, setFamily] = useState(null);
  const [view, setView] = useState('aerial');
  const [time, setTime] = useState('day');
  const canvas = useRef(null);

  const tags = useMemo(
    () => [
      ...towers.map((t) => ({ id: t.id, text: t.name, ready: t.ready, family: t.family })),
      { id: 'roundabout', text: 'Surajpur Roundabout', plain: true },
    ],
    []
  );

  const pickFamily = (f) => setFamily((cur) => (cur === f ? null : f));
  const onSelect = (id) => {
    if (!id) return setFamily(null);
    const t = towers.find((x) => x.id === id);
    if (t) pickFamily(t.family);
  };
  const fam = families.find((f) => f.id === family);
  const famTowers = fam ? towers.filter((t) => t.family === fam.id) : [];

  return (
    <section id="explore" className="section section--night cut-both">
      <div className="wrap">
        <Reveal className="section__head section__head--light">
          <p className="eyebrow eyebrow--light">Explore in 3D</p>
          <h2>Walk the whole site from here.</h2>
          <p className="section__sub">Drag to look around. Tap a tower to see the homes inside it. Switch to evening to see which towers are ready to move in.</p>
        </Reveal>

        <Reveal delay={80}>
          <SiteCanvas
            ref={canvas}
            mode="explorer"
            lazy
            time={time}
            view={view}
            family={family}
            tags={tags}
            activeFamily={family}
            onSelect={onSelect}
            onTag={(id) => onSelect(id)}
            fallback={<Skyline />}
            className="explorer__stage"
          >
            <div className="explorer__bar explorer__bar--top">
              <div className="chips chips--glass" role="group" aria-label="Camera view">
                {VIEW_OPTS.map(([k, l]) => (
                  <button key={k} className={view === k ? 'is-on' : ''} onClick={() => setView(k)}>{l}</button>
                ))}
              </div>
              <div className="chips chips--glass chips--icons" role="group" aria-label="Time of day">
                {TIME_OPTS.map(([k, l, ic]) => (
                  <button key={k} className={time === k ? 'is-on' : ''} onClick={() => setTime(k)} aria-label={l} title={l}>
                    <Icon name={ic} size={17} /><span>{l}</span>
                  </button>
                ))}
              </div>
            </div>
            <div className="explorer__zoom">
              <button onClick={() => canvas.current?.zoom(0.8)} aria-label="Zoom in"><Icon name="plus" size={18} /></button>
              <button onClick={() => canvas.current?.zoom(1.25)} aria-label="Zoom out"><Icon name="minus" size={18} /></button>
            </div>
            <div className="explorer__legend">
              <span><i className="dot dot--sun" /> Ready to move in</span>
              <span>Drag to rotate</span>
            </div>
          </SiteCanvas>
        </Reveal>

        <div className="explorer__info">
          <div className="chips chips--dark" role="group" aria-label="Tower type">
            <button className={!family ? 'is-on' : ''} onClick={() => setFamily(null)}>All towers</button>
            {families.map((f) => (
              <button key={f.id} className={family === f.id ? 'is-on' : ''} onClick={() => pickFamily(f.id)}>{f.name}</button>
            ))}
          </div>
          <div className="infocard" aria-live="polite">
            {fam ? (
              <>
                <div className="infocard__head">
                  <h3>{fam.name} towers</h3>
                  <span className="pill">{fam.type}</span>
                </div>
                <p>{fam.blurb}</p>
                <dl>
                  <div><dt>Sizes</dt><dd>{fam.sizes}</dd></div>
                  <div><dt>Layout</dt><dd>{fam.perFloor}</dd></div>
                  <div><dt>Towers</dt><dd>{famTowers.map((t) => (<span key={t.id} className={`tchip ${t.ready ? 'tchip--ready' : ''}`}>{t.name}{t.ready ? ' · Ready' : ''}</span>))}</dd></div>
                </dl>
                <button className="btn btn--sun" onClick={() => open('price')}>Get {fam.name} pricing <Icon name="arrow" size={18} /></button>
              </>
            ) : (
              <>
                <div className="infocard__head"><h3>{facts.towers} towers, {facts.homes} homes</h3><span className="pill">{facts.floors}</span></div>
                <p>Four towers are finished and ready to move in: Galaxy 1, Galaxy 2, Jupiter 1 and Jupiter 2. Tap any tower, or pick a type above, to see what is inside.</p>
                <button className="btn btn--sun" onClick={() => open('visit')}>Visit the ready towers <Icon name="arrow" size={18} /></button>
              </>
            )}
          </div>
        </div>
        <p className="note note--light">Schematic 3D model for orientation. Tower positions, landscaping and surroundings are illustrative, not to scale, and are not the approved site plan.</p>
      </div>
    </section>
  );
}
