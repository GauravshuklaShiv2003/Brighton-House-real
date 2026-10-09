import { useState } from 'react';
import { site, facts, reasons, towers, families } from '../config/site.js';
import { fromPrices, sqft, telLink } from '../lib/format.js';
import { useActiveSection, useMedia, useScrolled } from '../hooks/hooks.js';
import { Icon, LogoMark } from './Icons.jsx';
import { useLead } from './Lead.jsx';
import SiteCanvas from './SiteCanvas.jsx';
import { Reveal, Tilt, Skyline } from './Misc.jsx';

const NAV = [
  ['overview', 'Overview'],
  ['homes', 'Homes'],
  ['explore', '3D Model'],
  ['amenities', 'Amenities'],
  ['location', 'Location'],
  ['faq', 'FAQ'],
];

export function Header() {
  const scrolled = useScrolled(40);
  const [menu, setMenu] = useState(false);
  const active = useActiveSection(NAV.map((n) => n[0]));
  const { open } = useLead();
  const tel = telLink();
  const go = () => setMenu(false);
  return (
    <header className={`header ${scrolled || menu ? 'is-solid' : ''}`}>
      <div className="wrap header__row">
        <a className="brand" href="#top" onClick={go} aria-label={`${site.name}, back to top`}>
          <LogoMark />
          <span className="brand__text">
            <b>{site.name}</b>
            <small>Surajpur, Greater Noida</small>
          </span>
        </a>
        <nav className="nav" aria-label="Sections">
          {NAV.map(([id, label]) => (
            <a key={id} href={`#${id}`} className={active === id ? 'is-active' : ''}>{label}</a>
          ))}
        </nav>
        <div className="header__cta">
          {tel && (
            <a className="header__tel" href={tel}>
              <Icon name="phone" size={18} /> {site.contact.phoneDisplay || 'Call us'}
            </a>
          )}
          <button className="btn btn--sun btn--sm" onClick={() => open('visit')}>Book a site visit</button>
          <button className="menu-btn" onClick={() => setMenu((m) => !m)} aria-expanded={menu} aria-label={menu ? 'Close menu' : 'Open menu'}>
            <Icon name={menu ? 'close' : 'menu'} size={22} />
          </button>
        </div>
      </div>
      <div className={`mobile-menu ${menu ? 'is-open' : ''}`}>
        <nav className="wrap" aria-label="Sections (mobile)">
          {NAV.map(([id, label]) => (
            <a key={id} href={`#${id}`} onClick={go}>{label}<Icon name="arrow" size={18} /></a>
          ))}
          <button className="btn btn--sun btn--block" onClick={() => { go(); open('brochure'); }}>Get the brochure</button>
        </nav>
      </div>
    </header>
  );
}

export function Hero({ onProgress, onReady, onFail }) {
  const { open } = useLead();
  const wide = useMedia('(min-width: 900px)');
  const price = fromPrices();
  return (
    <section className="hero" id="top">
      <SiteCanvas
        mode="hero"
        time="dusk"
        offsetX={wide ? 0.34 : 0}
        onProgress={onProgress}
        onReady={onReady}
        onFail={onFail}
        fallback={<Skyline />}
        className="hero__stage"
      >
        <div className="hero__legend" aria-hidden="true">
          <span><i className="dot dot--sun" /> Ready to move in</span>
          <span>Schematic 3D model</span>
        </div>
      </SiteCanvas>
      <div className="hero__shade" />
      <div className="wrap hero__inner">
        <div className="hero__copy">
          <div className="hero__col hero__col--top">
            <p className="hero__badge"><i className="dot dot--sun" /> {facts.readyTowers} towers ready to move in</p>
            <h1>
              Upscale living.
              <br />
              <em>Thoughtfully priced.</em>
            </h1>
            <p className="hero__sub">
              {site.name} is a low-rise community of 2 and 3 BHK homes in {site.address.area}, Greater Noida. {facts.readyHomes} homes are finished and ready for you to walk through.
            </p>
          </div>
          <div className="hero__col hero__col--act">
            <div className="hero__ctas">
              <button className="btn btn--sun btn--lg" onClick={() => open('visit')}>
                Book a site visit <Icon name="arrow" size={20} />
              </button>
              <button className="btn btn--ghost btn--lg" onClick={() => open('brochure')}>
                <Icon name="download" size={19} /> Get brochure
              </button>
            </div>
            <ul className="hero__chips">
              <li>{facts.floors} low-rise</li>
              <li>{facts.homes} homes · {facts.towers} towers</li>
              <li>Smart homes by Tata Power EZ Home</li>
            </ul>
          </div>
        </div>
      </div>
      <div className="wrap">
        <dl className="hero__facts">
          <div><dt>2 BHK · 900 to 1,275 sq ft</dt><dd>From ₹{price.from2} Lac*</dd></div>
          <div><dt>3 BHK · 1,150 to 1,650 sq ft</dt><dd>From ₹{price.from3} Lac*</dd></div>
          <div><dt>Ready to move in</dt><dd>{facts.readyHomes} homes</dd></div>
          <div><dt>Location</dt><dd>{site.address.area}, Greater Noida</dd></div>
        </dl>
        <p className="hero__note">{site.pricing.note}</p>
      </div>
    </section>
  );
}

export function Intro() {
  return (
    <section id="overview" className="section section--paper cut-top">
      <div className="wrap intro">
        <Reveal>
          <p className="eyebrow">What is {site.name}?</p>
          <h2>A home that reflects your progress.</h2>
        </Reveal>
        <Reveal delay={100} className="intro__body">
          <p className="lead">
            {site.name} is a community of {facts.homes} homes in {facts.towers} low-rise towers, set around a landscaped central park in {site.address.area}, Greater Noida.
          </p>
          <p>
            Every tower has parking on the ground floor and five floors of homes above it, so the buildings stay close to human scale. Homes are 2 and 3 BHK, from 900 to 1,650 sq ft.
          </p>
          <p>
            It is made for families who have outgrown ordinary housing, but do not want to pay for luxury they will not use.
          </p>
        </Reveal>
        <Reveal delay={160} className="stats">
          <div><b>{facts.homes}</b><span>Homes</span></div>
          <div><b>{facts.towers}</b><span>Low-rise towers</span></div>
          <div><b>{facts.floors}</b><span>Ground + 5 floors</span></div>
          <div><b>{facts.readyHomes}</b><span>Ready to move in</span></div>
        </Reveal>
      </div>
    </section>
  );
}

export function Why() {
  return (
    <section id="why" className="section section--white">
      <div className="wrap">
        <Reveal className="section__head">
          <p className="eyebrow">Why {site.name}</p>
          <h2>Designed for better everyday living.</h2>
          <p className="section__sub">Six reasons families choose to look closer.</p>
        </Reveal>
        <div className="why">
          {reasons.map((r, i) => (
            <Reveal key={r.title} delay={(i % 3) * 80}>
              <Tilt className="why__card">
                <span className="why__icon"><Icon name={r.icon} size={26} /></span>
                <h3>{r.title}</h3>
                <p>{r.text}</p>
              </Tilt>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

const READY = towers.filter((t) => t.ready);
export function ReadyBand() {
  const { open } = useLead();
  const fam = Object.fromEntries(families.map((f) => [f.id, f]));
  return (
    <section id="ready" className="ready cut-both">
      <div className="wrap ready__grid">
        <Reveal>
          <p className="eyebrow eyebrow--light">Ready to move in</p>
          <h2>Own now. Move now.</h2>
          <p className="ready__lead">
            {READY.map((t) => t.name).slice(0, 3).join(', ')} and {READY[3].name} are finished. See the building, the park and the floor you would live on, then decide at your own pace.
          </p>
          <button className="btn btn--sun btn--lg" onClick={() => open('visit')}>
            Book a site visit <Icon name="arrow" size={20} />
          </button>
        </Reveal>
        <div className="ready__towers">
          {READY.map((t, i) => (
            <Reveal key={t.id} delay={i * 80}>
              <div className="rtile">
                <span className="rtile__tag"><i className="dot dot--sun" /> Ready</span>
                <b>{t.name}</b>
                <span>{fam[t.family].type} · {fam[t.family].sizes.replace(' to ', '–').replace(' sq ft', '')} sq ft</span>
                <small>15 homes</small>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
