// Enquiry form (client-side validation) + footer content.
export function initContact(brand, products, industries) {
  const chips = document.querySelector('.chips');
  chips.insertAdjacentHTML('beforeend', industries.map((i) => `<label class="chip"><input type="checkbox" name="industry" value="${i.name}"><span>${i.name}</span></label>`).join(''));

  const form = document.getElementById('contactForm');
  const status = form.querySelector('.form__status');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    let ok = true;
    form.querySelectorAll('[required]').forEach((f) => {
      const valid = f.value.trim() && (f.type !== 'email' || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.value));
      f.closest('.field').classList.toggle('is-invalid', !valid);
      if (!valid && ok) { f.focus(); ok = false; }
    });
    if (!ok) { status.textContent = 'Please complete the highlighted fields.'; return; }
    // No backend is wired yet — hook your CRM / form endpoint here.
    const btn = form.querySelector('.form__submit span');
    btn.textContent = 'Sending…';
    setTimeout(() => {
      btn.textContent = 'Get quote now';
      status.textContent = 'Thank you — our team will get back to you shortly with a quote.';
      form.reset();
    }, 900);
  });
  form.addEventListener('input', (e) => e.target.closest('.field')?.classList.remove('is-invalid'));

  // footer is now a shared static partial; these only run if the old hooks exist
  const fp = document.getElementById('footProducts');
  if (fp) fp.innerHTML = products.map((p) => `<li><a href="#products">${p.code} · ${p.name}</a></li>`).join('');
  const fc = document.querySelector('.footer__contact');
  if (fc) fc.innerHTML = `<li><a href="mailto:${brand.email}">${brand.email}</a></li><li><a href="tel:${brand.phone.replace(/[^+\d]/g, '')}">${brand.phone}</a></li><li>${brand.office}</li>`;
  const ff = document.querySelector('.footer__factory');
  if (ff) ff.innerHTML = `<li>${brand.factory}</li>`;
  document.querySelectorAll('#year, [data-year]').forEach((y) => { y.textContent = new Date().getFullYear(); });
}
