import { site } from '../config/site.js';

// Cleans a phone number typed by a visitor. Returns 10 digits, or '' if it is not a valid Indian mobile.
export function cleanPhone(raw) {
  let d = String(raw || '').replace(/\D/g, '');
  if (d.length === 12 && d.startsWith('91')) d = d.slice(2);
  if (d.length === 11 && d.startsWith('0')) d = d.slice(1);
  return /^[6-9]\d{9}$/.test(d) ? d : '';
}

// Sends the enquiry to your CRM / Google Sheet / Zapier webhook if `site.lead.endpoint` is set.
// With no endpoint it runs in preview mode and nothing leaves the browser.
export async function submitLead(payload) {
  const endpoint = site.lead.endpoint;
  if (!endpoint) return { ok: true, preview: true };
  try {
    await fetch(endpoint, {
      method: 'POST',
      mode: 'no-cors', // works with Google Apps Script and most webhooks
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ ...payload, project: site.name, page: location.href, at: new Date().toISOString() }),
    });
    return { ok: true, preview: false };
  } catch {
    return { ok: false, preview: false };
  }
}
