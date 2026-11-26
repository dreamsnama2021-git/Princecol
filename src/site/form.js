// Enquiry forms: validation, honeypot spam check, loading / success / error states.
// Delivery: POST to `formEndpoint` (src/data/site.js) when configured. Until the client
// approves an endpoint, it opens a pre-filled email to the company instead — it never
// shows a "sent" message for something that was not sent.
import { brand, formEndpoint } from '../data/site.js';

const RULES = {
  name: (v) => (v.trim().length >= 2 ? '' : 'Please enter your full name.'),
  email: (v) => (/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) ? '' : 'Please enter a valid email address.'),
  phone: (v) => (v.replace(/[^\d]/g, '').length >= 10 ? '' : 'Please enter a phone number with at least 10 digits.'),
  message: (v) => (v.trim().length >= 10 ? '' : 'Please tell us a little more (at least 10 characters).'),
};

function setError(field, msg) {
  const wrap = field.closest('.field');
  if (!wrap) return;
  wrap.classList.toggle('is-invalid', !!msg);
  field.setAttribute('aria-invalid', msg ? 'true' : 'false');
  const err = wrap.querySelector('.field__err');
  if (err) { err.textContent = msg; if (!err.id) err.id = `${field.id}-err`; field.setAttribute('aria-describedby', err.id); }
}

function validate(form) {
  let first = null;
  for (const [name, rule] of Object.entries(RULES)) {
    const f = form.elements[name];
    if (!f) continue;
    const msg = rule(f.value);
    setError(f, msg);
    if (msg && !first) first = f;
  }
  return first;
}

function mailtoFor(data) {
  const subject = `Enquiry${data.product ? ` — ${data.product}` : ''} from ${data.name}`;
  const body = [
    `Name: ${data.name}`, `Company: ${data.company || '-'}`, `Email: ${data.email}`, `Phone: ${data.phone}`,
    `Product: ${data.product || 'Not sure yet'}`, `Industry: ${data.industry || '-'}`, '', data.message,
    '', `Sent from: ${location.href}`,
  ].join('\n');
  return `mailto:${brand.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export function initForms() {
  document.querySelectorAll('form[data-enquiry]').forEach((form) => {
    const status = form.querySelector('.eform__status');
    const btn = form.querySelector('.eform__submit');
    const label = btn?.querySelector('span');
    const idle = label?.textContent;
    const started = Date.now();

    form.querySelectorAll('input, textarea').forEach((f) => f.addEventListener('blur', () => {
      if (RULES[f.name] && f.value) setError(f, RULES[f.name](f.value));
    }));
    form.addEventListener('input', (e) => { if (e.target.closest('.is-invalid') && RULES[e.target.name]) setError(e.target, RULES[e.target.name](e.target.value)); });

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      form.classList.remove('is-sent', 'is-error');
      const bad = validate(form);
      if (bad) { status.textContent = 'Please correct the highlighted fields.'; bad.focus(); return; }

      const data = Object.fromEntries(new FormData(form).entries());
      // spam: filled honeypot or a sub-3-second submit → silently stop
      if (data.website || Date.now() - started < 3000) { status.textContent = 'Please wait a moment and try again.'; return; }
      delete data.website;

      btn.disabled = true; form.classList.add('is-loading');
      label.textContent = 'Sending…'; status.textContent = '';

      if (!formEndpoint) {
        // no approved backend yet → hand the enquiry to the visitor's email app, honestly
        window.location.href = mailtoFor(data);
        btn.disabled = false; form.classList.remove('is-loading'); label.textContent = idle;
        status.innerHTML = `Your email app should open with this enquiry ready to send to <a href="mailto:${brand.email}">${brand.email}</a>. If it doesn’t, call <a href="tel:${brand.phones[0].replace(/[^+\d]/g, '')}">${brand.phones[0]}</a>.`;
        return;
      }

      try {
        const res = await fetch(formEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({ ...data, page: location.pathname, _subject: `Website enquiry${data.product ? ` — ${data.product}` : ''}` }),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        form.classList.add('is-sent');
        status.textContent = 'Thank you — your enquiry has been sent. Our team will get back to you shortly.';
        form.reset();
      } catch (err) {
        form.classList.add('is-error');
        status.innerHTML = `Sorry, the enquiry could not be sent (${err.message}). Please email <a href="${mailtoFor(data)}">${brand.email}</a> or call ${brand.phones[0]}.`;
      } finally {
        btn.disabled = false; form.classList.remove('is-loading'); label.textContent = idle;
      }
    });
  });
}
