// Mobilni izbornik
const toggle = document.querySelector('.nav-toggle');
const nav = document.getElementById('main-nav');
if (toggle && nav) {
  toggle.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    toggle.setAttribute('aria-expanded', open);
  });
}
document.querySelectorAll('.dropdown > button').forEach(b =>
  b.addEventListener('click', () => b.parentElement.classList.toggle('open')));

// "Postavke kolačića": otvara Googleov CMP (Privacy & messaging) ako je uključen u AdSenseu.
document.querySelectorAll('[data-cookie-settings]').forEach(a => a.addEventListener('click', e => {
  e.preventDefault();
  window.googlefc = window.googlefc || {};
  window.googlefc.callbackQueue = window.googlefc.callbackQueue || [];
  if (window.googlefc.showRevocationMessage) window.googlefc.showRevocationMessage();
  else window.googlefc.callbackQueue.push(() => window.googlefc.showRevocationMessage());
}));

// Pretraga
const q = document.getElementById('q');
if (q && window.SEARCH_INDEX) {
  const out = document.getElementById('results');
  const count = document.getElementById('search-count');
  const norm = s => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd');
  const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
  const run = () => {
    const terms = norm(q.value).split(/\s+/).filter(Boolean);
    if (!terms.length) { out.innerHTML = ''; count.textContent = ''; return; }
    const hits = window.SEARCH_INDEX
      .map(p => ({ p, s: terms.reduce((n, t) => n + (norm(p.t).includes(t) ? 3 : 0) + (norm(p.d + ' ' + p.c).includes(t) ? 1 : 0), 0) }))
      .filter(h => h.s >= terms.length).sort((a, b) => b.s - a.s);
    count.textContent = hits.length ? `Pronađeno: ${hits.length}` : 'Nema rezultata. Pokušajte s drugim pojmom.';
    out.innerHTML = hits.slice(0, 50).map(({ p }) =>
      `<a href="${p.u}"><span class="kicker">${esc(p.c)}</span><strong>${esc(p.t)}</strong><p>${esc(p.d)}</p></a>`).join('');
    history.replaceState(null, '', '?q=' + encodeURIComponent(q.value));
  };
  q.value = new URLSearchParams(location.search).get('q') || '';
  q.addEventListener('input', run);
  run();
  q.focus();
}
