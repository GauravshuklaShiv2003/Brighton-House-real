import { useState } from 'react';
import { site, connectivity } from '../config/site.js';
import { Icon } from './Icons.jsx';
import { useLead } from './Lead.jsx';
import { Reveal } from './Misc.jsx';

const fmt = (m) => (m >= 60 ? `${Math.floor(m / 60)} hr${m % 60 ? ` ${m % 60} min` : ''}` : `${m} min`);

function Ladder({ items, kind }) {
  const max = 80;
  return (
    <ul className={`ladder ladder--${kind}`}>
      {items.map((i) => (
        <li key={`${kind}-${i.name}`}>
          <span className="ladder__name">
            {i.name}
            {i.tag && <em>{i.tag}</em>}
          </span>
          <span className="ladder__bar" aria-hidden="true"><i style={{ '--w': `${Math.max(7, (i.min / max) * 100)}%` }} /></span>
          <span className="ladder__min">{fmt(i.min)}</span>
        </li>
      ))}
    </ul>
  );
}

export function Location() {
  const { open } = useLead();
  const [tab, setTab] = useState('road');
  return (
    <section id="location" className="section section--white">
      <div className="wrap">
        <Reveal className="section__head">
          <p className="eyebrow">Location</p>
          <h2>Connected to everywhere that matters.</h2>
          <p className="section__sub">{site.address.line}. Where Greater Noida meets the rest of NCR.</p>
        </Reveal>

        <Reveal className="route" aria-label="Brighton House, Surajpur, Greater Noida, NCR">
          {[site.name, site.address.area, 'Greater Noida', 'NCR'].map((p, i, a) => (
            <span key={p} className="route__stop">
              <b>{p}</b>
              {i < a.length - 1 && <Icon name="arrow" size={18} />}
            </span>
          ))}
        </Reveal>

        <div className="loc">
          <Reveal className="loc__left">
            <div className="panel panel--blue">
              <span className="panel__icon"><Icon name="pin" size={24} /></span>
              <h3>How to reach us</h3>
              <p>{site.address.approach}</p>
              <address>{site.address.line}</address>
              <a className="btn btn--sun" href={site.address.mapsUrl} target="_blank" rel="noreferrer">
                Open in Google Maps <Icon name="external" size={17} />
              </a>
            </div>
            <div className="future">
              {connectivity.future.map((f) => (
                <div key={f.title} className="future__card">
                  <span className="pill pill--sun">{f.tag}</span>
                  <h4>{f.title}</h4>
                  <p>{f.text}</p>
                </div>
              ))}
            </div>
          </Reveal>

          <Reveal delay={100} className="loc__right">
            <div className="tabs tabs--wide" role="tablist" aria-label="Travel mode">
              <button role="tab" aria-selected={tab === 'road'} className={tab === 'road' ? 'is-on' : ''} onClick={() => setTab('road')}>
                <Icon name="road" size={18} /> By road
              </button>
              <button role="tab" aria-selected={tab === 'rail'} className={tab === 'rail' ? 'is-on' : ''} onClick={() => setTab('rail')}>
                <Icon name="train" size={18} /> Metro & rail
              </button>
            </div>
            <p className="ladder__title mono">
              {tab === 'road' ? 'Travel time from Brighton House' : 'Travel time from Surajpur · upcoming links'}
            </p>
            {tab === 'road' ? <Ladder items={connectivity.road} kind="road" /> : <Ladder items={connectivity.rail} kind="rail" />}
            <p className="note">{connectivity.disclaimer}</p>
            <button className="btn btn--blue" onClick={() => open('visit')}>
              Visit and see the drive <Icon name="arrow" size={18} />
            </button>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
