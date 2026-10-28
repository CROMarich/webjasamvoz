// Raspoređuje datume objave (polje "publish") za članke koji ga još nemaju.
// Pokretanje: node schedule.js [početni-datum] [vodiča-pri-pokretanju] [vodiča-dnevno]
// Primjer:   node schedule.js 2026-10-28 25 2
// Vijesti: 6 odmah, zatim 2 dnevno. Postojeća polja "publish" se ne mijenjaju.
const fs = require('fs');
const path = require('path');
const DIR = path.join(__dirname, 'content');
const [start = new Date().toISOString().slice(0, 10), launch = 25, perDay = 2] = process.argv.slice(2);
const addDays = (d, n) => { const x = new Date(d + 'T12:00:00'); x.setDate(x.getDate() + n); return x.toISOString().slice(0, 10); };

const items = fs.readdirSync(DIR).filter(f => f.endsWith('.html')).map(f => {
  const raw = fs.readFileSync(path.join(DIR, f), 'utf8');
  const meta = raw.match(/^<!--([\s\S]*?)-->/)[1];
  return { f, raw, cat: (meta.match(/category:\s*(.+)/) || [])[1].trim(), has: /\npublish:/.test(meta), date: (meta.match(/\ndate:\s*(.+)/) || [])[1] };
}).filter(i => !i.has);

// Za pokretanje: najvažniji vodiči prvi, zatim rubrike naizmjence da portal od prvog dana djeluje cjelovito.
const FIRST = ['kako-poloziti-vozacki-ispit-iz-prve', 'cijena-autoskole', 'ppmv', 'uvoz-rabljenog-automobila-iz-eu-postupak-i-troskovi',
  'registracija-i-tehnicki-pregled-vozila', 'prijenos-vlasnistva-prijepis-vozila', 'poticaji-za-kupnju-elektricnih-vozila',
  'punjenje-elektricnih-automobila-kod-kuce', 'kategorije-vozila', 'kruzni-tok-rotor', 'lampica-motora-check-engine', 'kasko-osiguranje'];
const guides = items.filter(i => i.cat !== 'Vijesti');
const byCat = {};
for (const g of guides.filter(g => !FIRST.includes(g.f.replace('.html', '')))) (byCat[g.cat] ||= []).push(g);
const rr = [];
for (let added = true; added;) { added = false; for (const list of Object.values(byCat)) if (list.length) { rr.push(list.shift()); added = true; } }
const ordered = [...FIRST.map(s => guides.find(g => g.f === s + '.html')).filter(Boolean), ...rr];

const out = [];
ordered.forEach((g, i) => out.push([g, i < launch ? start : addDays(start, 1 + Math.floor((i - launch) / perDay))]));
const news = items.filter(i => i.cat === 'Vijesti').sort((a, b) => (b.date || '').localeCompare(a.date || ''));
news.forEach((n, i) => out.push([n, i < 6 ? start : addDays(start, 1 + Math.floor((i - 6) / 2))]));

for (const [it, d] of out) {
  // Vijest dobiva datum objave na portalu; datum izvornog članka ostaje u polju "date".
  fs.writeFileSync(path.join(DIR, it.f), it.raw.replace(/^<!--\n?/, `<!--\npublish: ${d}\n`));
}
const last = out.map(o => o[1]).sort().at(-1);
console.log(`Raspoređeno ${out.length} članaka: ${out.filter(o => o[1] === start).length} na dan ${start}, zadnji ${last}.`);
