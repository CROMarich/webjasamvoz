// Postavke stranice. Prije objave popunite sva polja označena s TODO.
module.exports = {
  name: 'JaSamVozač',
  tagline: 'Vodiči i vijesti za vozače u Hrvatskoj',

  // TODO: stvarna domena, bez kose crte na kraju. Koristi se za canonical, sitemap i Open Graph.
  url: 'https://www.jasamvozac.hr',

  // TODO: AdSense ID izdavača, npr. 'ca-pub-1234567890123456'.
  // Dok je prazno, AdSense skripta, ads.txt i oglasni blokovi se ne generiraju.
  adsenseClient: '',
  // Neobavezno: ID-ovi oglasnih jedinica iz AdSense sučelja. Ako su prazni, koriste se automatski oglasi.
  adSlots: { inArticle: '', sidebar: '' },

  // Podaci izdavača (impresum i kontakt).
  publisher: {
    owner: 'Gama Events',
    address: 'Vladimira Nazora 34/1, 10410 Velika Gorica',
    oib: '34383862260',
    editor: 'Matija Mar',
  },
  email: 'kontakt@jasamvozac.hr',
  founded: 2026,

  // Autori. Članak bira autora poljem "author: <ključ>" u metapodacima; bez njega se koristi defaultAuthor.
  // Google i čitatelji vjeruju stvarnoj osobi s provjerljivim iskustvom, pa ovdje upišite istinite podatke.
  defaultAuthor: 'matija',
  authors: {
    matija: {
      name: 'Matija Mar',
      role: 'Urednik, programer i zaljubljenik u automobile',
      photo: '', // bez fotografije prikazuju se inicijali
      short: 'Programer po struci i vozač s više od 500.000 prijeđenih kilometara bez prometne nezgode. Uređuje JaSamVozač.',
      bio: '<p>Matija Mar po struci je programer, a automobili su mu najveća strast. Vlasnik je više automobila i do sada prešao više od 500.000 kilometara bez prometne nezgode.</p><p>JaSamVozač je pokrenuo kako bi na jednom mjestu skupio praktične informacije koje vozači u Hrvatskoj inače traže po forumima, službenim stranicama i Narodnim novinama: od autoškole i propisa do uvoza, održavanja i električnih automobila.</p><p>Propise, pristojbe i cijene u člancima provjerava u službenim izvorima i navodi ih na kraju teksta. Ako primijetite pogrešku ili imate prijedlog teme, pišite mu putem stranice <a href="../kontakt.html">Kontakt</a>.</p>',
      sameAs: [], // neobavezno: poveznice na LinkedIn, Facebook ili Instagram profil
    },
  },
};
