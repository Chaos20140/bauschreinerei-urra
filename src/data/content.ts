export const brand = {
  name: 'urra',
  longName: 'bauschreinerei urra',
  founded: 2003,
} as const;

export const hero = {
  words: ['fenster', 'und', 'türen'] as const,
  description:
    'handwerk aus dem sauerland. wir planen, fertigen und montieren fenster, türen und garagentore mit präzision seit 2003.',
  stats: [
    { value: 'seit 2003', label: 'inhabergeführt aus olsberg' },
    { value: '3 regionen', label: 'sauerland · owl · ruhrgebiet' },
    { value: '100% handwerk', label: 'fachmontage nach enev' },
  ],
} as const;

export const navigation = [
  { label: 'leistungen', href: '/leistungen' },
  { label: 'projekte', href: '/projekte' },
  { label: 'über uns', href: '/ueber-uns' },
  { label: 'kontakt', href: '/kontakt' },
] as const;

export const services = {
  title: 'leistungen',
  subtitle: 'rundum-service vom aufmaß bis zur fachgerechten montage.',
  items: [
    {
      id: 'beratung',
      number: '01',
      title: 'beratung & aufmaß',
      body: 'persönliche beratung vor ort und millimetergenaues digitales aufmaß mit der metiscale-app. wir hören zu, denken mit und planen passgenau für ihr objekt.',
    },
    {
      id: 'demontage',
      number: '02',
      title: 'demontage & entsorgung',
      body: 'fachgerechte demontage der alten elemente inklusive sauberer abtransport und entsorgung. saubere baustelle, transparente abwicklung.',
    },
    {
      id: 'montage',
      number: '03',
      title: 'montage nach enev',
      body: 'ral-zertifizierte montage nach energetischen baustandards. fenster, haustüren, schiebetüren und garagentore – energieeffizient, sicher und langlebig.',
    },
  ],
} as const;

export const products = {
  title: 'unser handwerk',
  subtitle: 'fenster, türen und tore – aus holz, kunststoff oder aluminium.',
  categories: [
    { title: 'fenster', items: ['kunststofffenster', 'aluminiumfenster', 'holzfenster', 'sonderanfertigungen'] },
    { title: 'türen', items: ['haustüren', 'innentüren', 'schiebetüren', 'objekttüren'] },
    { title: 'tore', items: ['garagentore', 'industrietore', 'hofeinfahrten', 'antriebe'] },
  ],
} as const;

export const about = {
  title: 'über uns',
  lead: 'qualität ist kein zufall, sie ist das ergebnis harter arbeit, kluger planung und ehrlicher leidenschaft.',
  paragraphs: [
    'seit 2003 stehen wir als inhabergeführter fachbetrieb für qualität, zuverlässigkeit und handwerkliche präzision. unsere philosophie: für jedes projekt die beste lösung finden – funktional, energieeffizient und optisch ansprechend.',
    'wir arbeiten eng mit renommierten herstellern zusammen und sind ihr kompetenter ansprechpartner rund um fenster, türen und garagentore – von der ersten beratung bis zur fachgerechten montage.',
  ],
  values: [
    { key: 'qualität', body: 'langlebig, sicher und energieeffizient.' },
    { key: 'präzision', body: 'millimetergenau geplant, sauber montiert.' },
    { key: 'verlässlich', body: 'terminTreue und transparente kommunikation.' },
  ],
} as const;

export const regions = {
  title: 'unsere region',
  subtitle: 'wir sind unterwegs im gesamten westfalen.',
  areas: [
    {
      key: 'sauerland',
      cities: ['arnsberg', 'meschede', 'brilon', 'winterberg', 'schmallenberg', 'olpe', 'lüdenscheid', 'iserlohn'],
    },
    {
      key: 'ostwestfalen-lippe',
      cities: ['bielefeld', 'gütersloh', 'herford', 'paderborn', 'detmold', 'höxter', 'minden-lübbecke'],
    },
    {
      key: 'ruhrgebiet',
      cities: ['dortmund', 'hagen', 'bochum', 'essen', 'gelsenkirchen', 'herne', 'duisburg', 'recklinghausen'],
    },
  ],
} as const;

export const contact = {
  title: 'kontakt',
  lead: 'lassen sie uns über ihr projekt sprechen.',
  address: {
    street: 'Am Ochsenberg 13',
    zip: '59939',
    city: 'Olsberg',
  },
  phone: { display: '+49 160 99116995', href: 'tel:+4916099116995' },
  email: { display: 'h.urra@bauschreinerei-urra.de', href: 'mailto:h.urra@bauschreinerei-urra.de' },
  cta: 'termin anfragen',
} as const;

export const footer = {
  tagline: 'fenster, türen und garagentore. handgemacht im sauerland seit 2003.',
  copyright: `© ${new Date().getFullYear()} bauschreinerei urra · alle rechte vorbehalten`,
  legal: [
    { label: 'impressum', href: '#impressum' },
    { label: 'datenschutz', href: '#datenschutz' },
  ],
} as const;
