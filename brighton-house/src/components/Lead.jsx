import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { site } from '../config/site.js';
import { cleanPhone, submitLead } from '../lib/lead.js';
import { waLink } from '../lib/format.js';
import { Icon } from './Icons.jsx';

const LeadCtx = createContext({ open: () => {} });
export const useLead = () => useContext(LeadCtx);

const INTENTS = {
  visit: { title: 'Book a site visit', sub: 'Choose a time that suits you. Our team will call to confirm.', cta: 'Book my visit' },
  brochure: { title: 'Get the brochure', sub: 'Share your details and we will send it across.', cta: 'Send me the brochure' },
  plans: { title: 'Get floor plans & price sheet', sub: 'Detailed plans are shared with every enquiry.', cta: 'Send me the plans' },
  price: { title: 'Get exact pricing', sub: 'Tell us what you are looking for and we will share a clear quote.', cta: 'Get my quote' },
  callback: { title: 'Request a call back', sub: 'We will call you at the time you choose.', cta: 'Request call back' },
};

export function LeadProvider({ children }) {
  const [state, setState] = useState({ open: false, intent: 'visit' });
  const open = useCallback((intent = 'visit') => setState({ open: true, intent }), []);
  const close = useCallback(() => setState((s) => ({ ...s, open: false })), []);
  return (
    <LeadCtx.Provider value={{ open, close, isOpen: state.open }}>
      {children}
      <LeadDrawer open={state.open} intent={state.intent} onClose={close} />
    </LeadCtx.Provider>
  );
}

function LeadDrawer({ open, intent, onClose }) {
  const panel = useRef(null);
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    const prev = document.documentElement.style.overflow;
    document.documentElement.style.overflow = 'hidden';
    const t = setTimeout(() => panel.current?.querySelector('input')?.focus(), 350);
    return () => {
      window.removeEventListener('keydown', onKey);
      document.documentElement.style.overflow = prev;
      clearTimeout(t);
    };
  }, [open, onClose]);

  const meta = INTENTS[intent] || INTENTS.visit;
  return (
    <div className={`drawer ${open ? 'is-open' : ''}`} aria-hidden={!open}>
      <div className="drawer__scrim" onClick={onClose} />
      <aside className="drawer__panel" ref={panel} role="dialog" aria-modal="true" aria-label={meta.title}>
        <button className="drawer__close" onClick={onClose} aria-label="Close">
          <Icon name="close" size={20} />
        </button>
        <p className="eyebrow">{site.name}</p>
        <h2 className="drawer__title">{meta.title}</h2>
        <p className="drawer__sub">{meta.sub}</p>
        {open && <LeadForm intent={intent} idPrefix="d" />}
      </aside>
    </div>
  );
}

export function LeadForm({ intent = 'visit', idPrefix = 'f', tone = 'light' }) {
  const meta = INTENTS[intent] || INTENTS.visit;
  const [v, setV] = useState({ name: '', phone: '', email: '', config: 'Not sure yet', slot: '', consent: true });
  const [err, setErr] = useState({});
  const [state, setState] = useState('idle'); // idle | sending | done | fail
  const [preview, setPreview] = useState(false);
  const set = (k) => (e) => setV((p) => ({ ...p, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));
  const wantsSlot = intent === 'visit' || intent === 'callback';

  async function onSubmit(e) {
    e.preventDefault();
    const errors = {};
    if (v.name.trim().length < 2) errors.name = 'Please enter your name.';
    const phone = cleanPhone(v.phone);
    if (!phone) errors.phone = 'Enter a 10-digit mobile number.';
    if (v.email && !/^\S+@\S+\.\S+$/.test(v.email)) errors.email = 'This email does not look right.';
    if (!v.consent) errors.consent = 'We need your permission to contact you.';
    setErr(errors);
    if (Object.keys(errors).length) return;
    setState('sending');
    const res = await submitLead({ intent, name: v.name.trim(), phone: '+91' + phone, email: v.email.trim(), config: v.config, slot: v.slot });
    setPreview(!!res.preview);
    setState(res.ok ? 'done' : 'fail');
  }

  if (state === 'done') {
    return (
      <div className={`form-done form-done--${tone}`} role="status">
        <span className="form-done__tick"><Icon name="check" size={26} strokeWidth={2.2} /></span>
        <h3>Thank you, {v.name.trim().split(' ')[0]}.</h3>
        {preview ? (
          <p>
            This is a preview, so nothing was sent yet. Once a lead endpoint is connected in <code>src/config/site.js</code>, every enquiry will reach your team.
          </p>
        ) : (
          <p>We have your details. Our team will call you shortly{v.slot ? `, ${v.slot.toLowerCase()}` : ''}.</p>
        )}
        {intent === 'brochure' && site.lead.brochureUrl && (
          <a className="btn btn--sun" href={site.lead.brochureUrl} target="_blank" rel="noreferrer">
            <Icon name="download" size={18} /> Download brochure
          </a>
        )}
      </div>
    );
  }

  const id = (n) => `${idPrefix}-${n}`;
  return (
    <form className={`form form--${tone}`} onSubmit={onSubmit} noValidate>
      <div className="field">
        <label htmlFor={id('name')}>Full name</label>
        <input id={id('name')} name="name" autoComplete="name" value={v.name} onChange={set('name')} placeholder="Your name" aria-invalid={!!err.name} />
        {err.name && <span className="field__err">{err.name}</span>}
      </div>
      <div className="field">
        <label htmlFor={id('phone')}>Mobile number</label>
        <div className="phone">
          <span className="phone__cc">+91</span>
          <input id={id('phone')} name="phone" type="tel" inputMode="numeric" autoComplete="tel-national" value={v.phone} onChange={set('phone')} placeholder="98765 43210" aria-invalid={!!err.phone} />
        </div>
        {err.phone && <span className="field__err">{err.phone}</span>}
      </div>
      <div className="field">
        <label htmlFor={id('email')}>Email <span className="opt">optional</span></label>
        <input id={id('email')} name="email" type="email" autoComplete="email" value={v.email} onChange={set('email')} placeholder="you@email.com" aria-invalid={!!err.email} />
        {err.email && <span className="field__err">{err.email}</span>}
      </div>
      <fieldset className="field">
        <legend>I am looking for</legend>
        <div className="seg">
          {['2 BHK', '3 BHK', 'Not sure yet'].map((o) => (
            <label key={o} className={v.config === o ? 'is-on' : ''}>
              <input type="radio" name={id('config')} checked={v.config === o} onChange={() => setV((p) => ({ ...p, config: o }))} />
              {o}
            </label>
          ))}
        </div>
      </fieldset>
      {wantsSlot && (
        <fieldset className="field">
          <legend>Best time <span className="opt">optional</span></legend>
          <div className="seg">
            {['Morning', 'Afternoon', 'Evening'].map((o) => (
              <label key={o} className={v.slot === o ? 'is-on' : ''}>
                <input type="radio" name={id('slot')} checked={v.slot === o} onChange={() => setV((p) => ({ ...p, slot: p.slot === o ? '' : o }))} onClick={() => v.slot === o && setV((p) => ({ ...p, slot: '' }))} />
                {o}
              </label>
            ))}
          </div>
        </fieldset>
      )}
      <label className="consent">
        <input type="checkbox" checked={v.consent} onChange={set('consent')} />
        <span>I agree to be contacted about {site.name} by call, WhatsApp or email.</span>
      </label>
      {err.consent && <span className="field__err">{err.consent}</span>}
      <button className="btn btn--sun btn--block" type="submit" disabled={state === 'sending'}>
        {state === 'sending' ? 'Sending…' : meta.cta}
        <Icon name="arrow" size={18} />
      </button>
      {state === 'fail' && <p className="field__err">Something went wrong. Please try again, or message us on WhatsApp.</p>}
      {waLink(`Hi, I am interested in ${site.name}.`) && (
        <a className="form__wa" href={waLink(`Hi, I am interested in ${site.name}.`)} target="_blank" rel="noreferrer">
          <Icon name="whatsapp" size={18} /> Prefer WhatsApp? Chat with us
        </a>
      )}
    </form>
  );
}
