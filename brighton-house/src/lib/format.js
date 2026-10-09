import { site, homes } from '../config/site.js';

// Price in whole lakhs for a given area, at the base rate.
export function priceLac(area) {
  return Math.round((area * site.pricing.ratePerSqft) / 100000);
}

export function sqft(n) {
  return n.toLocaleString('en-IN');
}

// "From" prices shown in the hero, FAQ and cards.
export function fromPrices() {
  const min = (key) => Math.min(...homes[key].sizes.map((s) => s.area));
  return { from2: priceLac(min('2bhk')), from3: priceLac(min('3bhk')) };
}

export function waLink(text) {
  const n = site.contact.whatsapp;
  if (!n) return '';
  return `https://wa.me/${n}?text=${encodeURIComponent(text)}`;
}

export function telLink() {
  return site.contact.phone ? `tel:${site.contact.phone}` : '';
}
