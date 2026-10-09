import { useState } from 'react';
import { site, homes, plates } from '../config/site.js';
import { priceLac, sqft } from '../lib/format.js';
import { Icon } from './Icons.jsx';
import { useLead } from './Lead.jsx';
import { Reveal, Tilt, MasterPlanArt, UnitPlanArt } from './Misc.jsx';

function FloorPlate({ units, type }) {
  const rows = { 3: [2, 1], 4: [2, 2], 6: [3, 3] }[units] || [units, 0];
  const letters = 'ABCDEF';
  let idx = 0;
  const cells = [];
  rows.forEach((n, r) => {
    for (let i = 0; i < n; i++) {
      const w = 360 / n;
      const x = 20 + i * w;
      const y = r === 0 ? 20 : 148;
      cells.push(
        <g key={`${r}-${i}`}>
          <rect className="plate__unit" x={x + 3} y={y + 3} width={w - 6} height={79} rx="6" />
          <rect className="plate__balcony" x={x + w / 2 - 22} y={r === 0 ? 12 : 230} width="44" height="8" rx="2" />
          <text className="plate__label" x={x + w / 2} y={y + 44} textAnchor="middle">Home {letters[idx]}</text>
        </g>
      );
      idx++;
    }
  });
  return (
    <svg className="plate" viewBox="0 0 400 250" role="img" aria-label={`Typical floor with ${units} homes around a central lift and stair core`}>
      <rect className="plate__shell" x="16" y="16" width="368" height="218" rx="10" />
      {cells}
      <rect className="plate__core" x="20" y="105" width="360" height="40" />
      <rect className="plate__lift" x="168" y="108" width="64" height="34" rx="4" />
      <text className="plate__label plate__label--core" x="200" y="129" textAnchor="middle">Lift + stairs</text>
    </svg>
  );
}

export function Homes() {
  const { open } = useLead();
  const [tab, setTab] = useState('3bhk');
  const [plate, setPlate] = useState('galaxy');
  const cur = homes[tab];
  const minArea = Math.min(...cur.sizes.map((s) => s.area));
  const maxArea = Math.max(...cur.sizes.map((s) => s.area));
  const pl = plates.find((p) => p.id === plate);

  return (
    <section id="homes" className="section section--paper after-cut">
      <div className="wrap">
        <Reveal className="section__head">
          <p className="eyebrow">The homes</p>
          <h2>Space to breathe. Room to grow.</h2>
          <p className="section__sub">2 and 3 BHK homes, from 900 to 1,650 sq ft. Pick a size to see where it is found and what it costs.</p>
        </Reveal>

        <div className="homes">
          <Reveal className="homes__main">
            <div className="tabs" role="tablist" aria-label="Home type">
              {Object.entries(homes).map(([k, h]) => (
                <button key={k} role="tab" aria-selected={tab === k} className={tab === k ? 'is-on' : ''} onClick={() => setTab(k)}>
                  {h.label}
                </button>
              ))}
            </div>
            <div className="homes__summary">
              <div>
                <span className="mono">Starting from</span>
                <b className="homes__from">₹{priceLac(minArea)} Lac*</b>
              </div>
              <div>
                <span className="mono">Sizes</span>
                <b>{sqft(minArea)} to {sqft(maxArea)} sq ft</b>
              </div>
              <div>
                <span className="mono">Homes</span>
                <b>{tab === '2bhk' ? 85 : 100}</b>
              </div>
            </div>
            <div className="sizes">
              {cur.sizes.map((s) => (
                <Tilt key={`${tab}-${s.area}`} className="size">
                  <div className="size__top">
                    <b>{sqft(s.area)}</b>
                    <span>sq ft</span>
                  </div>
                  <p className="size__type">{cur.label} · {s.towers}</p>
                  <p className="size__price">₹{priceLac(s.area)} Lac* <small>onwards</small></p>
                  <button className="link-btn" onClick={() => open('price')}>
                    Get exact price <Icon name="arrow" size={16} />
                  </button>
                </Tilt>
              ))}
            </div>
            <p className="note">{site.pricing.note}</p>
          </Reveal>

          <Reveal delay={120} className="homes__plate">
            <div className="panel">
              <p className="eyebrow">Inside a tower</p>
              <h3>One floor, one lift core.</h3>
              <p className="panel__sub">Each tower has ground-floor parking and five floors of homes. Choose a tower type to see how many homes share a floor.</p>
              <div className="chips" role="tablist" aria-label="Tower type">
                {plates.map((p) => (
                  <button key={p.id} role="tab" aria-selected={plate === p.id} className={plate === p.id ? 'is-on' : ''} onClick={() => setPlate(p.id)}>
                    {p.label}
                  </button>
                ))}
              </div>
              <FloorPlate units={pl.units} type={pl.type} />
              <div className="plate__meta">
                <span><b>{pl.units}</b> homes per floor</span>
                <span><b>5</b> floors of homes</span>
                <span><b>{pl.type}</b></span>
              </div>
              <p className="note">Schematic only, not to scale. Detailed plans are shared on request.</p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

export function Plans() {
  const { open } = useLead();
  return (
    <section id="plans" className="section section--white after-cut">
      <div className="wrap">
        <Reveal className="section__head">
          <p className="eyebrow">Plans</p>
          <h2>See the plans before you visit.</h2>
          <p className="section__sub">Master plan, unit plans and a clear price sheet. Share your number and we will send them across.</p>
        </Reveal>
        <div className="plans">
          {[
            { t: 'Master plan', s: 'How the ten towers, park and entry fit together.', art: <MasterPlanArt />, i: 'plans' },
            { t: 'Unit plans', s: 'Room-by-room layouts for every 2 and 3 BHK home.', art: <UnitPlanArt />, i: 'plans' },
          ].map((p, i) => (
            <Reveal key={p.t} delay={i * 100}>
              <button className="plancard" onClick={() => open(p.i)}>
                <span className="plancard__art">{p.art}</span>
                <span className="plancard__veil"><Icon name="lock" size={20} /> Request {p.t.toLowerCase()}</span>
                <span className="plancard__body">
                  <b>{p.t}</b>
                  <span>{p.s}</span>
                  <em>Get it free <Icon name="arrow" size={16} /></em>
                </span>
              </button>
            </Reveal>
          ))}
        </div>
        <p className="note note--center">Preview drawings are illustrative. Actual plans are shared on request.</p>
      </div>
    </section>
  );
}
