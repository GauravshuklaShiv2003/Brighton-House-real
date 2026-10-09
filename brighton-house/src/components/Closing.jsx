import { useMemo, useState } from 'react';
import { site, buildFaq } from '../config/site.js';
import { fromPrices, telLink, waLink } from '../lib/format.js';
import { Icon, LogoMark } from './Icons.jsx';
import { LeadForm, useLead } from './Lead.jsx';
import { Reveal } from './Misc.jsx';

export function Developer() {
  const d = site.developer;
  if (!d.story) return null;
  return (
    <section id="developer" className="section section--paper">
      <div className="wrap dev">
        <Reveal>
          <p className="eyebrow">The developer</p>
          <h2>{d.name}</h2>
          <p className="lead">{d.story}</p>
        </Reveal>
        {d.facts.length > 0 && (
          <Reveal className="stats stats--dev" delay={100}>
            {d.facts.map((f) => (<div key={f.label}><b>{f.value}</b><span>{f.label}</span></div>))}
          </Reveal>
        )}
      </div>
    </section>
  );
}

export function Faq() {
  const price = fromPrices();
  const items = useMemo(() => buildFaq(price), [price.from2, price.from3]);
  const [open, setOpen] = useState(0);
  const { open: openLead } = useLead();
  return (
    <section id="faq" className="section section--paper">
      <div className="wrap faq">
        <Reveal className="faq__head">
          <p className="eyebrow">Questions</p>
          <h2>Things buyers ask us.</h2>
          <p className="section__sub">Something not here? Ask us directly.</p>
          <button className="btn btn--blue" onClick={() => openLead('callback')}>Request a call back</button>
        </Reveal>
        <Reveal delay={80} className="faq__list">
          {items.map((it, i) => (
            <div key={it.q} className={`faq__item ${open === i ? 'is-open' : ''}`}>
              <h3>
                <button id={`faq-q-${i}`} aria-expanded={open === i} aria-controls={`faq-a-${i}`} onClick={() => setOpen(open === i ? -1 : i)}>
                  <span>{it.q}</span>
                  <Icon name={open === i ? 'minus' : 'plus'} size={20} />
                </button>
              </h3>
              <div className="faq__a" id={`faq-a-${i}`} role="region" aria-labelledby={`faq-q-${i}`}>
                <div><p>{it.a}</p></div>
              </div>
            </div>
          ))}
        </Reveal>
      </div>
    </section>
  );
}

export function FinalCta() {
  const wa = waLink(`Hi, I would like to visit ${site.name}.`);
  const tel = telLink();
  return (
    <section id="enquire" className="final cut-top">
      <div className="wrap final__grid">
        <Reveal className="final__copy">
          <p className="eyebrow eyebrow--light">Next step</p>
          <h2>Ready to step up?</h2>
          <p className="final__lead">Book a visit to the ready towers. See the home, the park and the neighbourhood in one trip. No pressure, no fine print.</p>
          <ol className="steps">
            <li><b>1</b><span>Share your details</span></li>
            <li><b>2</b><span>We call to confirm a time</span></li>
            <li><b>3</b><span>Walk through a ready home</span></li>
          </ol>
          {(wa || tel) && (
            <div className="final__alt">
              {wa && <a className="btn btn--ghost" href={wa} target="_blank" rel="noreferrer"><Icon name="whatsapp" size={19} /> WhatsApp us</a>}
              {tel && <a className="btn btn--ghost" href={tel}><Icon name="phone" size={19} /> {site.contact.phoneDisplay || 'Call us'}</a>}
            </div>
          )}
        </Reveal>
        <Reveal delay={120} className="final__form">
          <div className="formcard">
            <h3>Book a site visit</h3>
            <p>Takes under a minute.</p>
            <LeadForm intent="visit" idPrefix="main" />
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export function Footer() {
  const r = site.rera;
  return (
    <footer className="footer">
      <div className="wrap footer__grid">
        <div>
          <div className="footer__brand"><LogoMark size={38} /><b>{site.name}</b></div>
          <p>{site.address.line}</p>
          <p>Developed by <b>{site.developer.name}</b></p>
          <p className="footer__rera">
            {r.number ? <>UP RERA Reg. No. <b>{r.number}</b> · <a href={r.website} target="_blank" rel="noreferrer">{r.website.replace('https://', '')}</a></> : 'UP RERA registration details available on request.'}
          </p>
        </div>
        <div className="footer__legal">
          <p>
            Disclaimer: Images, 3D models, plans and specifications are indicative and for illustration only. They do not form part of any offer or contract. Prices, availability and amenities are subject to change without notice. Travel times are approximate, and metro, rail and highway projects mentioned are upcoming or proposed and depend on completion by the relevant authorities. Please confirm all details with our sales team before booking.
          </p>
          <p>© {new Date().getFullYear()} {site.developer.name}. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

export function StickyBar() {
  const { open, isOpen } = useLead();
  const wa = waLink(`Hi, I would like to visit ${site.name}.`);
  const tel = telLink();
  return (
    <div className={`sticky ${isOpen ? 'is-hidden' : ''}`}>
      <button className="btn btn--sun sticky__main" onClick={() => open('visit')}>Book a site visit</button>
      {wa ? (
        <a className="sticky__icon" href={wa} target="_blank" rel="noreferrer" aria-label="WhatsApp"><Icon name="whatsapp" size={22} /></a>
      ) : (
        <button className="sticky__icon" onClick={() => open('brochure')} aria-label="Get brochure"><Icon name="download" size={22} /></button>
      )}
      {tel ? (
        <a className="sticky__icon" href={tel} aria-label="Call us"><Icon name="phone" size={22} /></a>
      ) : (
        <button className="sticky__icon" onClick={() => open('callback')} aria-label="Request a call back"><Icon name="phone" size={22} /></button>
      )}
    </div>
  );
}
