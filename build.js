// Generira cijelu statičku stranicu iz content/ i pages/.
// Pokretanje: node build.js
const fs = require('fs');
const path = require('path');
const SITE = require('./site.config');
const { illustrate } = require('./illustrations');
// Društvene mreže ne prikazuju SVG, pa iz ilustracija radimo PNG za og:image (ako je paket instaliran).
let Resvg = null;
try { ({ Resvg } = require('@resvg/resvg-js')); } catch { console.warn('Paket @resvg/resvg-js nije instaliran, og:image se preskače (npm install).'); }

const ROOT = __dirname;
const CONTENT = path.join(ROOT, 'content');
const PAGES = path.join(ROOT, 'pages');
const BLOG = path.join(ROOT, 'blog');
const CATDIR = path.join(ROOT, 'kategorija');

// Redoslijed određuje navigaciju; "more" kategorije idu u padajući izbornik "Više".
const CATEGORIES = [
  { name: 'Vijesti', color: '#c2410c' },
  { name: 'Električna vozila', color: '#047857' },
  { name: 'Autoškola', color: '#1d4ed8' },
  { name: 'Vožnja', color: '#7c3aed' },
  { name: 'Održavanje', color: '#475569' },
  { name: 'Kupnja i prodaja', color: '#b45309' },
  { name: 'Uvoz i dokumenti', color: '#0e7490', more: true },
  { name: 'Oprema', color: '#be123c', more: true },
  { name: 'Bicikli', color: '#4d7c0f', more: true },
  { name: 'Zanimljivosti', color: '#9333ea', more: true },
];
const MONTHS = ['siječnja', 'veljače', 'ožujka', 'travnja', 'svibnja', 'lipnja', 'srpnja', 'kolovoza', 'rujna', 'listopada', 'studenoga', 'prosinca'];

const slugify = s => s.toLowerCase().replace(/<[^>]+>/g, '').normalize('NFD').replace(/[̀-ͯ]/g, '')
  .replace(/đ/g, 'd').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const esc = s => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
const strip = s => s.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
const fmtDate = d => `${d.getDate()}. ${MONTHS[d.getMonth()]} ${d.getFullYear()}.`;
const iso = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const cat = name => CATEGORIES.find(c => c.name === name);
const catUrl = name => `kategorija/${slugify(name)}.html`;

// ---------- učitavanje članaka ----------

function parse(file) {
  const raw = fs.readFileSync(file, 'utf8');
  const m = raw.match(/^<!--([\s\S]*?)-->\s*([\s\S]*)$/);
  if (!m) throw new Error(`Nedostaju metapodaci: ${file}`);
  const meta = {};
  for (const line of m[1].split('\n')) {
    const i = line.indexOf(':');
    if (i > 0) meta[line.slice(0, i).trim()] = line.slice(i + 1).trim();
  }
  if (!cat(meta.category)) throw new Error(`Nepoznata kategorija "${meta.category}": ${file}`);
  // "publish" je datum objave na portalu; članak s datumom u budućnosti se ne objavljuje dok taj dan ne dođe.
  const day = s => new Date(s + 'T00:00:00');
  const date = meta.publish ? day(meta.publish) : meta.date ? day(meta.date) : fs.statSync(file).mtime;
  const updated = meta.updated ? day(meta.updated) : date;
  const author = SITE.authors[meta.author || SITE.defaultAuthor];
  if (!author) throw new Error(`Nepoznat autor "${meta.author}": ${file}`);
  const [srcName, srcUrl] = (meta.source || '').split('|').map(s => s.trim());
  const body = withToc(cleanBody(m[2].trim()), meta.category !== 'Vijesti');
  return {
    slug: path.basename(file, '.html'), ...meta, body, date, updated, srcName, srcUrl, author,
    authorSlug: meta.author || SITE.defaultAuthor,
    news: meta.category === 'Vijesti',
    words: strip(body).split(' ').length,
  };
}

// Emoji u tekstu odaju šablonu, pa ih uklanjamo i iz starih datoteka.
function cleanBody(body) {
  return body.replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}]\s?/gu, '');
}

// Sadržaj se uvijek generira iz h2 naslova, pa ne može zaostati za tekstom.
function withToc(body, wantToc) {
  body = body.replace(/<nav class="toc">[\s\S]*?<\/nav>\s*/, '');
  const items = [];
  body = body.replace(/<h2(?: id="([^"]*)")?>([\s\S]*?)<\/h2>/g, (_, id, text) => {
    text = text.replace(/^\d+\.\s*/, '');
    id = id || slugify(text);
    items.push(`<li><a href="#${id}">${text}</a></li>`);
    return `<h2 id="${id}">${text}</h2>`;
  });
  if (!wantToc || items.length < 4) return body;
  const toc = `<nav class="toc" aria-label="Sadržaj članka"><strong>U ovom članku</strong><ol>${items.join('')}</ol></nav>`;
  return body.startsWith('<p class="lead">') ? body.replace('</p>', `</p>\n${toc}`) : `${toc}\n${body}`;
}

const allPosts = fs.readdirSync(CONTENT).filter(f => f.endsWith('.html')).map(f => parse(path.join(CONTENT, f)));
const NOW = new Date();
const posts = allPosts.filter(p => p.date <= NOW);
const scheduled = allPosts.filter(p => p.date > NOW).sort((a, b) => a.date - b.date);
// Poveznica na članak koji još nije objavljen postaje običan tekst dok taj članak ne izađe.
const pending = new Set(scheduled.map(p => p.slug));
for (const p of posts) p.body = p.body.replace(/<a href="([\w-]+)\.html">([\s\S]*?)<\/a>/g, (m, slug, text) => pending.has(slug) ? text : m);
posts.sort((a, b) => b.date - a.date || a.title.localeCompare(b.title, 'hr'));
// Članci bez vlastite fotografije dobivaju generiranu ilustraciju.
const IMG = path.join(ROOT, 'images', 'ilustracije');
fs.mkdirSync(IMG, { recursive: true });
const OG = path.join(ROOT, 'images', 'og');
fs.mkdirSync(OG, { recursive: true });
for (const d of [IMG, OG]) for (const f of fs.readdirSync(d)) fs.rmSync(path.join(d, f));
for (const p of posts.filter(p => !p.image)) {
  fs.writeFileSync(path.join(IMG, `${p.slug}.svg`), illustrate(p, cat(p.category).color));
  p.image = `images/ilustracije/${p.slug}.svg`;
  p.imageAlt = `Ilustracija: ${p.title}`;
  if (Resvg) {
    const svg = fs.readFileSync(path.join(IMG, `${p.slug}.svg`), 'utf8');
    fs.writeFileSync(path.join(OG, `${p.slug}.png`), new Resvg(svg, { fitTo: { mode: 'width', value: 1200 } }).render().asPng());
    p.ogImage = `images/og/${p.slug}.png`;
  }
}
const news = posts.filter(p => p.news);
const guides = posts.filter(p => !p.news).sort((a, b) => b.updated - a.updated || a.title.localeCompare(b.title, 'hr'));

// ---------- dijelovi stranice ----------

const ads = !!SITE.adsenseClient;
function adSlot(kind) {
  if (!ads) return '';
  const slot = SITE.adSlots[kind];
  if (!slot) return ''; // bez ID-a jedinice oglase postavljaju automatski oglasi
  return `<div class="ad" aria-label="Oglas"><span>Oglas</span><ins class="adsbygoogle" style="display:block" data-ad-client="${SITE.adsenseClient}" data-ad-slot="${slot}" data-ad-format="auto" data-full-width-responsive="true"></ins><script>(adsbygoogle=window.adsbygoogle||[]).push({});</script></div>`;
}

const logo = `<svg class="logo-mark" viewBox="0 0 32 32" aria-hidden="true"><circle cx="16" cy="16" r="13" fill="none" stroke="currentColor" stroke-width="3"/><circle cx="16" cy="16" r="3.2" fill="currentColor"/><path d="M4 15h9M19 15h9M16 19v9" stroke="currentColor" stroke-width="3"/></svg>`;

function header(p) {
  const main = CATEGORIES.filter(c => !c.more);
  const more = CATEGORIES.filter(c => c.more);
  const today = new Date();
  return `<div class="topbar"><div class="container">
    <span>${fmtDate(today)}</span>
    <nav aria-label="Pomoćna navigacija"><a href="${p}o-nama.html">O nama</a><a href="${p}impresum.html">Impresum</a><a href="${p}kontakt.html">Kontakt</a></nav>
  </div></div>
  <header class="site-header"><div class="container">
    <a href="${p}index.html" class="logo">${logo}<span>JaSam<b>Vozač</b></span></a>
    <button class="nav-toggle" aria-expanded="false" aria-controls="main-nav" aria-label="Izbornik"><span></span><span></span><span></span></button>
    <nav class="nav" id="main-nav" aria-label="Glavna navigacija">
      <a href="${p}index.html">Naslovnica</a>
      ${main.map(c => `<a href="${p}${catUrl(c.name)}">${c.name}</a>`).join('\n      ')}
      <div class="dropdown"><button aria-haspopup="true">Više</button><div class="menu">
        ${more.map(c => `<a href="${p}${catUrl(c.name)}">${c.name}</a>`).join('')}
        <a href="${p}svi-clanci.html">Svi članci</a>
      </div></div>
      <a href="${p}pretraga.html" class="search-link" aria-label="Pretraga"><svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5" fill="none" stroke="currentColor" stroke-width="2.2"/><path d="M15.5 15.5 21 21" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg></a>
    </nav>
  </div></header>`;
}

function footer(p) {
  return `<footer class="site-footer"><div class="container">
    <div class="footer-grid">
      <div><a href="${p}index.html" class="logo">${logo}<span>JaSam<b>Vozač</b></span></a>
        <p>${SITE.tagline}. Pišemo o autoškoli, propisima, održavanju, kupnji vozila i električnoj mobilnosti.</p></div>
      <div><h4>Rubrike</h4>${CATEGORIES.slice(0, 5).map(c => `<a href="${p}${catUrl(c.name)}">${c.name}</a>`).join('')}</div>
      <div><h4>Još</h4>${CATEGORIES.slice(5).map(c => `<a href="${p}${catUrl(c.name)}">${c.name}</a>`).join('')}<a href="${p}svi-clanci.html">Svi članci</a></div>
      <div><h4>O stranici</h4><a href="${p}o-nama.html">O nama</a><a href="${p}impresum.html">Impresum</a><a href="${p}kontakt.html">Kontakt</a><a href="${p}pravila-privatnosti.html">Pravila privatnosti</a><a href="${p}kolacici.html">Kolačići</a><a href="${p}uvjeti-koristenja.html">Uvjeti korištenja</a><a href="${p}odricanje-odgovornosti.html">Odricanje odgovornosti</a><a href="#" data-cookie-settings>Postavke kolačića</a></div>
    </div>
    <div class="footer-bottom">© ${SITE.founded} ${SITE.name}. Sva prava pridržana. Sadržaj je informativne naravi i ne zamjenjuje službene izvore ni stručni savjet.</div>
  </div></footer>`;
}

function page({ title, description, rel, body, prefix, type = 'website', jsonld = [], noindex = false, extraHead = '', image = '' }) {
  const canonical = `${SITE.url}/${rel}`.replace(/\/index\.html$/, '/');
  const ld = jsonld.map(o => `<script type="application/ld+json">${JSON.stringify(o)}</script>`).join('\n  ');
  return `<!DOCTYPE html>
<html lang="hr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(description)}">
  ${noindex ? '<meta name="robots" content="noindex, follow">' : '<meta name="robots" content="index, follow, max-image-preview:large">'}
  <link rel="canonical" href="${canonical}">
  <meta property="og:site_name" content="${SITE.name}">
  <meta property="og:locale" content="hr_HR">
  <meta property="og:type" content="${type}">
  <meta property="og:title" content="${esc(title)}">
  <meta property="og:description" content="${esc(description)}">
  <meta property="og:url" content="${canonical}">
  <meta name="twitter:card" content="summary_large_image">${image ? `
  <meta property="og:image" content="${SITE.url}/${image}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="675">
  <meta name="twitter:image" content="${SITE.url}/${image}">` : ""}
  <meta name="theme-color" content="#0f172a">
  <link rel="icon" href="${prefix}favicon.svg" type="image/svg+xml">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Source+Serif+4:opsz,wght@8..60,600;8..60,700&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="${prefix}css/style.css">
  ${ads ? `<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${SITE.adsenseClient}" crossorigin="anonymous"></script>` : ''}
  ${ld}${extraHead}
</head>
<body>
  <a class="skip" href="#main">Preskoči na sadržaj</a>
  ${header(prefix)}
  <main id="main">
  ${body}
  </main>
  ${footer(prefix)}
  <script src="${prefix}js/site.js" defer></script>
</body>
</html>
`;
}

function thumb(p, prefix, big = false) {
  const c = cat(p.category);
  const h = [...p.slug].reduce((n, ch) => (n * 31 + ch.charCodeAt(0)) >>> 0, 7);
  const vary = `;--a:${100 + h % 80}deg;--x:${-30 + h % 50}%;--y:${-45 + (h >> 3) % 50}%;--s:${45 + (h >> 5) % 40}%;--h:${(h >> 7) % 24 - 12}deg`;
  const inner = p.image
    ? `<img src="${prefix}${p.image}" alt="${esc(p.imageAlt || p.title)}" loading="lazy">`
    : (big ? `<span class="ph-label">${p.category}</span>` : '');
  return `<div class="thumb${big ? ' big' : ''}${p.image ? '' : ' ph'}" style="--c:${c.color}${p.image ? '' : vary}">${inner}</div>`;
}

function card(p, prefix, opts = {}) {
  const meta = p.news ? `<time datetime="${iso(p.date)}">${fmtDate(p.date)}</time>` : `<span>${p.readtime || Math.ceil(p.words / 200)} min čitanja</span>`;
  return `<article class="card${opts.compact ? ' compact' : ''}">
      <a href="${prefix}blog/${p.slug}.html" class="card-link">
        ${opts.compact ? '' : thumb(p, prefix, opts.big)}
        <div class="card-body">
          <span class="kicker" style="--c:${cat(p.category).color}">${p.category}</span>
          <h3>${p.title}</h3>
          ${opts.noDesc ? '' : `<p>${p.description}</p>`}
          <span class="meta">${meta}</span>
        </div>
      </a>
    </article>`;
}

// Fotografija autora ako postoji, inače inicijali.
const avatar = (a, prefix) => a.photo
  ? `<img class="avatar" src="${prefix}${a.photo}" alt="${esc(a.name)}" width="72" height="72">`
  : `<span class="avatar">${a.name.split(/\s+/).map(w => w[0]).join('').slice(0, 2)}</span>`;

const breadcrumbLd = items => ({
  '@context': 'https://schema.org', '@type': 'BreadcrumbList',
  itemListElement: items.map(([name, url], i) => ({ '@type': 'ListItem', position: i + 1, name, item: `${SITE.url}/${url}` })),
});
const orgLd = {
  '@context': 'https://schema.org', '@type': 'Organization', name: SITE.name, url: SITE.url + '/',
  logo: `${SITE.url}/favicon.svg`, email: SITE.email,
};

// ---------- izlaz ----------

// Prazni sadržaj umjesto brisanja mape (na Windowsu mapa može biti zaključana).
for (const dir of [BLOG, CATDIR, path.join(ROOT, 'autor')]) {
  fs.mkdirSync(dir, { recursive: true });
  for (const f of fs.readdirSync(dir)) fs.rmSync(path.join(dir, f), { recursive: true, force: true });
}
const write = (rel, html) => fs.writeFileSync(path.join(ROOT, rel), html);
const sitemap = [];

// Članci
for (const p of posts) {
  const c = cat(p.category);
  const sameCat = posts.filter(o => o.category === p.category && o.slug !== p.slug);
  const related = (p.news ? sameCat.slice(0, 4) : sameCat.sort((a, b) => a.title.localeCompare(b.title, 'hr')).slice(0, 4));
  const latestNews = news.filter(n => n.slug !== p.slug).slice(0, 5);
  const shareUrl = encodeURIComponent(`${SITE.url}/blog/${p.slug}.html`);
  const dateLine = `Objavljeno <time datetime="${iso(p.date)}">${fmtDate(p.date)}</time>`
    + (iso(p.updated) > iso(p.date) ? `</span><span>Ažurirano <time datetime="${iso(p.updated)}">${fmtDate(p.updated)}</time>` : '');
  // Oglas u sredini teksta: nakon otprilike trećine odlomaka.
  let body = p.body;
  if (ads) {
    const paras = [...body.matchAll(/<\/p>/g)];
    if (paras.length > 6) { const at = paras[Math.floor(paras.length / 3)].index + 4; body = body.slice(0, at) + adSlot('inArticle') + body.slice(at); }
  }
  const source = p.srcUrl ? `<p class="source">Izvor: <a href="${p.srcUrl}" rel="nofollow noopener" target="_blank">${p.srcName}</a></p>` : '';
  const html = `<div class="container article-layout">
    <article class="article">
      <nav class="breadcrumb" aria-label="Putanja"><a href="../index.html">Naslovnica</a><span>/</span><a href="../${catUrl(p.category)}">${p.category}</a></nav>
      <span class="kicker" style="--c:${c.color}">${p.category}</span>
      <h1>${p.title}</h1>
      <div class="byline">
        <a class="author" href="../autor/${p.authorSlug}.html">${p.author.name}</a>
        <span>${dateLine}</span>
        ${p.news ? '' : `<span>${p.readtime || Math.ceil(p.words / 200)} min čitanja</span>`}
      </div>
      ${p.image ? thumb(p, '../', true) : ''}
      <div class="prose">
      ${body}
      ${source}
      </div>
      <div class="share">Podijeli:
        <a href="https://www.facebook.com/sharer/sharer.php?u=${shareUrl}" target="_blank" rel="noopener">Facebook</a>
        <a href="https://wa.me/?text=${shareUrl}" target="_blank" rel="noopener">WhatsApp</a>
        <a href="https://x.com/intent/post?url=${shareUrl}" target="_blank" rel="noopener">X</a>
        <a href="mailto:?subject=${encodeURIComponent(p.title)}&body=${shareUrl}">E-mail</a>
      </div>
      ${p.news ? '' : `<p class="note">Članak je informativne naravi. Propisi, pristojbe i cijene mijenjaju se, pa prije odluke provjerite podatke kod nadležne institucije. Uočili ste pogrešku? <a href="../kontakt.html">Javite nam</a>.</p>`}
      <aside class="author-box">
        ${avatar(p.author, '../')}
        <div><span class="kicker">Autor</span><a href="../autor/${p.authorSlug}.html"><strong>${p.author.name}</strong></a><span class="role">${p.author.role}</span><p>${p.author.short}</p></div>
      </aside>
      ${related.length ? `<section class="related"><h2>Pročitajte i</h2><div class="grid small">${related.map(r => card(r, '../', { noDesc: true })).join('')}</div></section>` : ''}
    </article>
    <aside class="sidebar">
      ${adSlot('sidebar')}
      <div class="widget"><h3>Najnovije vijesti</h3>${latestNews.map(n => `<a href="${n.slug}.html" class="wlink"><span>${n.title}</span><time datetime="${iso(n.date)}">${fmtDate(n.date)}</time></a>`).join('')}</div>
      <div class="widget"><h3>Rubrike</h3><div class="chips">${CATEGORIES.map(k => `<a href="../${catUrl(k.name)}" style="--c:${k.color}">${k.name}</a>`).join('')}</div></div>
    </aside>
  </div>`;
  const ld = [{
    '@context': 'https://schema.org', '@type': p.news ? 'NewsArticle' : 'Article',
    headline: p.title, description: p.description, inLanguage: 'hr',
    datePublished: p.date.toISOString(), dateModified: p.updated.toISOString(),
    author: { '@type': 'Person', name: p.author.name, jobTitle: p.author.role, url: `${SITE.url}/autor/${p.authorSlug}.html` },
    publisher: orgLd, mainEntityOfPage: `${SITE.url}/blog/${p.slug}.html`,
  }, breadcrumbLd([['Naslovnica', ''], [p.category, catUrl(p.category)], [p.title, `blog/${p.slug}.html`]])];
  const faq = [...p.body.matchAll(/<details><summary>([\s\S]*?)<\/summary>\s*<p>([\s\S]*?)<\/p><\/details>/g)];
  if (faq.length) ld.push({ '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faq.map(([, q, a]) => ({ '@type': 'Question', name: strip(q), acceptedAnswer: { '@type': 'Answer', text: strip(a) } })) });
  write(`blog/${p.slug}.html`, page({ title: `${p.title} | ${SITE.name}`, description: p.description, rel: `blog/${p.slug}.html`, body: html, prefix: '../', type: 'article', jsonld: ld, image: p.ogImage || (/.(jpe?g|png|webp)$/i.test(p.image) ? p.image : ''),
    extraHead: `\n  <meta property="article:published_time" content="${p.date.toISOString()}">\n  <meta property="article:modified_time" content="${p.updated.toISOString()}">\n  <meta property="article:section" content="${p.category}">` }));
  sitemap.push([`blog/${p.slug}.html`, p.updated]);
}

// Kategorije
for (const c of CATEGORIES) {
  const list = c.name === 'Vijesti' ? news : guides.filter(p => p.category === c.name).sort((a, b) => a.title.localeCompare(b.title, 'hr'));
  if (!list.length) continue;
  const rel = catUrl(c.name);
  const intro = {
    'Vijesti': 'Aktualnosti iz svijeta automobila, propisa i prometa, s naglaskom na ono što je važno vozačima u Hrvatskoj.',
    'Električna vozila': 'Punjenje, domet, baterije, poticaji i kupnja električnih i hibridnih vozila.',
    'Autoškola': 'Upis, obuka, ispiti i poligonske radnje. Sve što kandidat treba znati do vozačke dozvole.',
    'Vožnja': 'Prometna pravila, raskrižja, sigurna vožnja i situacije na cesti.',
    'Održavanje': 'Gume, filtri, senzori i kvarovi: kako prepoznati problem i kada ići majstoru.',
    'Kupnja i prodaja': 'Odabir automobila, osiguranje, pregled rabljenog vozila i prodaja.',
    'Uvoz i dokumenti': 'Uvoz iz EU, PPMV, registracija, prijepis i ostala papirologija.',
    'Oprema': 'Kamere, punjači, starteri, pumpe i druga oprema za automobil.',
    'Bicikli': 'Bicikli i e-bicikli, kacige, svjetla, lokoti i oprema.',
    'Zanimljivosti': 'Povijest automobila, legendarni modeli, veliki promašaji i priče iz automobilske industrije.',
  }[c.name];
  const html = `<div class="container">
    <header class="cat-head" style="--c:${c.color}"><nav class="breadcrumb"><a href="../index.html">Naslovnica</a><span>/</span>${c.name}</nav><h1>${c.name}</h1><p>${intro}</p><span class="count">${list.length} ${list.length % 10 === 1 && list.length % 100 !== 11 ? 'članak' : 'članaka'}</span></header>
    <div class="grid">${list.map(p => card(p, '../')).join('')}</div>
  </div>`;
  write(rel, page({ title: `${c.name} | ${SITE.name}`, description: intro, rel, body: html, prefix: '../', jsonld: [breadcrumbLd([['Naslovnica', ''], [c.name, rel]])] }));
  sitemap.push([rel, list[0].updated]);
}

// Naslovnica
{
  const [lead, ...restNews] = news;
  const sections = CATEGORIES.filter(c => c.name !== 'Vijesti').map(c => {
    const list = guides.filter(p => p.category === c.name).slice(0, 4);
    if (!list.length) return '';
    return `<section class="section"><div class="section-head" style="--c:${c.color}"><h2>${c.name}</h2><a href="${catUrl(c.name)}">Sve iz rubrike →</a></div>
      <div class="grid four">${list.map(p => card(p, '', { noDesc: true })).join('')}</div></section>`;
  }).join('\n');
  const popular = ['kako-poloziti-vozacki-ispit-iz-prve', 'ppmv', 'uvoz-rabljenog-automobila-iz-eu-postupak-i-troskovi', 'poticaji-za-kupnju-elektricnih-vozila', 'prijenos-vlasnistva-prijepis-vozila', 'cijena-autoskole', 'registracija-i-tehnicki-pregled-vozila']
    .map(s => posts.find(p => p.slug === s)).filter(Boolean);
  const html = `<div class="container">
    <h1 class="sr-only">${SITE.name}: ${SITE.tagline}</h1>
    ${lead ? `<section class="hero-grid">
      <div class="hero-main">${card(lead, '', { big: true })}</div>
      <div class="hero-side"><h2 class="side-title">Najnovije</h2>${restNews.slice(0, 5).map(p => card(p, '', { compact: true, noDesc: true })).join('')}<a class="more" href="${catUrl('Vijesti')}">Sve vijesti →</a></div>
    </section>` : ''}
    <section class="section"><div class="section-head" style="--c:${cat('Vijesti').color}"><h2>Vijesti</h2><a href="${catUrl('Vijesti')}">Sve vijesti →</a></div>
      <div class="grid four">${restNews.slice(5, 13).map(p => card(p, '', { noDesc: true })).join('')}</div></section>
    <section class="popular"><h2>Najčitaniji vodiči</h2><ol>${popular.map(p => `<li><a href="blog/${p.slug}.html">${p.title}</a></li>`).join('')}</ol></section>
    ${sections}
  </div>`;
  write('index.html', page({ title: `${SITE.name} | ${SITE.tagline}`, description: 'Vijesti i praktični vodiči za vozače u Hrvatskoj: autoškola, propisi, održavanje, uvoz i registracija vozila, kupnja automobila i električna vozila.', rel: 'index.html', body: html, prefix: '',
    jsonld: [orgLd, { '@context': 'https://schema.org', '@type': 'WebSite', name: SITE.name, url: SITE.url + '/', inLanguage: 'hr', potentialAction: { '@type': 'SearchAction', target: `${SITE.url}/pretraga.html?q={q}`, 'query-input': 'required name=q' } }] }));
  sitemap.unshift(['', posts[0].date]);
}

// Svi članci (arhiva) i pretraga
{
  const byCat = CATEGORIES.map(c => {
    const list = posts.filter(p => p.category === c.name).sort((a, b) => a.title.localeCompare(b.title, 'hr'));
    return list.length ? `<section class="archive"><h2><a href="${catUrl(c.name)}">${c.name}</a></h2><ul>${list.map(p => `<li><a href="blog/${p.slug}.html">${p.title}</a></li>`).join('')}</ul></section>` : '';
  }).join('');
  write('svi-clanci.html', page({ title: `Svi članci | ${SITE.name}`, description: 'Popis svih objavljenih članaka, vodiča i vijesti na portalu JaSamVozač, razvrstan po rubrikama.', rel: 'svi-clanci.html', prefix: '',
    body: `<div class="container narrow"><h1 class="page-title">Svi članci</h1><div class="archive-grid">${byCat}</div></div>` }));
  sitemap.push(['svi-clanci.html', posts[0].updated]);

  fs.mkdirSync(path.join(ROOT, 'js'), { recursive: true });
  const idx = posts.map(p => ({ u: `blog/${p.slug}.html`, t: p.title, d: p.description, c: p.category }));
  fs.writeFileSync(path.join(ROOT, 'js', 'search-index.js'), `window.SEARCH_INDEX=${JSON.stringify(idx)};`);
  write('pretraga.html', page({ title: `Pretraga | ${SITE.name}`, description: 'Pretražite članke i vijesti.', rel: 'pretraga.html', prefix: '', noindex: true,
    body: `<div class="container narrow"><h1 class="page-title">Pretraga</h1>
      <form class="search-form" role="search" onsubmit="return false"><input id="q" type="search" placeholder="Npr. PPMV, kružni tok, punjenje…" autocomplete="off" aria-label="Pojam za pretragu"></form>
      <p id="search-count" class="muted"></p><div id="results" class="results"></div></div>
      <script src="js/search-index.js"></script>` }));
}

// Statične stranice iz pages/*.html (isti format metapodataka: title, description)
for (const f of fs.readdirSync(PAGES).filter(f => f.endsWith('.html'))) {
  const raw = fs.readFileSync(path.join(PAGES, f), 'utf8');
  const m = raw.match(/^<!--([\s\S]*?)-->\s*([\s\S]*)$/);
  const meta = Object.fromEntries(m[1].split('\n').filter(l => l.includes(':')).map(l => [l.slice(0, l.indexOf(':')).trim(), l.slice(l.indexOf(':') + 1).trim()]));
  const vars = { ...SITE.publisher, email: SITE.email, name: SITE.name, url: SITE.url, updated: fmtDate(fs.statSync(path.join(PAGES, f)).mtime), count: posts.length };
  const body = m[2].replace(/\{\{(\w+)\}\}/g, (_, k) => vars[k] ?? '');
  write(f, page({ title: `${meta.title} | ${SITE.name}`, description: meta.description, rel: f, prefix: '',
    body: `<div class="container narrow"><article class="prose static"><h1 class="page-title">${meta.title}</h1>${body}</article></div>` }));
  sitemap.push([f, fs.statSync(path.join(PAGES, f)).mtime]);
}

// Stranice autora
for (const [slug, a] of Object.entries(SITE.authors)) {
  const list = posts.filter(p => p.authorSlug === slug);
  const rel = `autor/${slug}.html`;
  const html = `<div class="container narrow">
    <header class="author-head">${avatar(a, '../')}<div><h1 class="page-title">${a.name}</h1><p class="role">${a.role}</p></div></header>
    <div class="prose static">${a.bio}</div>
    ${list.length ? `<h2 class="list-title">Članci (${list.length})</h2><div class="grid">${list.slice(0, 60).map(p => card(p, '../', { noDesc: true })).join('')}</div>` : ''}
  </div>`;
  write(rel, page({ title: `${a.name} | ${SITE.name}`, description: `${a.name}, ${a.role}. ${a.short}`, rel, body: html, prefix: '../',
    jsonld: [{ '@context': 'https://schema.org', '@type': 'ProfilePage', mainEntity: { '@type': 'Person', name: a.name, jobTitle: a.role, description: a.short, worksFor: orgLd, ...(a.sameAs?.length ? { sameAs: a.sameAs } : {}) } }] }));
  sitemap.push([rel, list[0]?.updated || NOW]);
}

// 404
write('404.html', page({ title: `Stranica nije pronađena | ${SITE.name}`, description: 'Stranica nije pronađena.', rel: '404.html', prefix: '/', noindex: true,
  body: `<div class="container narrow center"><h1 class="page-title">Stranica nije pronađena</h1><p>Poveznica je možda zastarjela ili je članak premješten.</p><p><a class="btn" href="/index.html">Na naslovnicu</a> <a class="btn ghost" href="/pretraga.html">Pretraga</a></p></div>` }));

// SEO i AdSense datoteke
fs.writeFileSync(path.join(ROOT, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemap.map(([u, d]) => `  <url><loc>${SITE.url}/${u}</loc><lastmod>${iso(d)}</lastmod></url>`).join('\n')}
</urlset>
`);
// CNAME za GitHub Pages s vlastitom domenom
fs.writeFileSync(path.join(ROOT, 'CNAME'), new URL(SITE.url).hostname + '\n');
fs.writeFileSync(path.join(ROOT, 'robots.txt'), `User-agent: *\nAllow: /\nDisallow: /pretraga.html\n\nSitemap: ${SITE.url}/sitemap.xml\n`);
if (ads) fs.writeFileSync(path.join(ROOT, 'ads.txt'), `google.com, ${SITE.adsenseClient.replace('ca-', '')}, DIRECT, f08c47fec0942fa0\n`);
else fs.rmSync(path.join(ROOT, 'ads.txt'), { force: true });

console.log(`Objavljeno: ${posts.length} članaka (${news.length} vijesti), ${CATEGORIES.length} rubrika.${ads ? '' : ' AdSense ID nije postavljen.'}`);
if (scheduled.length) console.log(`Na čekanju: ${scheduled.length} članaka. Sljedeći ${iso(scheduled[0].date)}: ${scheduled[0].title}. Zadnji ${iso(scheduled.at(-1).date)}.`);

// Provjera prije prijave na AdSense: upozori na podatke koji još nedostaju.
{
  const warn = [];
  const scan = (o, p = '') => Object.entries(o).forEach(([k, v]) => typeof v === 'string' ? /TODO/.test(v) && warn.push(`${p}${k} sadrži TODO`) : v && typeof v === 'object' && !Array.isArray(v) && scan(v, `${p}${k}.`));
  scan(SITE);
  if (!/\d{5}/.test(SITE.publisher.address)) warn.push('publisher.address nema poštanski broj i grad');
  if (!SITE.adsenseClient) warn.push('adsenseClient nije postavljen (AdSense kod i ads.txt se ne generiraju)');
  for (const [k, a] of Object.entries(SITE.authors)) {
    if (/\.\s*$/.test(a.name) || a.name.split(' ').length < 2) warn.push(`authors.${k}.name nije puno ime i prezime`);
    if (strip(a.bio).split(' ').length < 40) warn.push(`authors.${k}.bio je kraća od 40 riječi`);
  }
  if (warn.length) console.log('\nPrije prijave na AdSense:\n' + warn.map(w => ' - ' + w).join('\n'));
}
