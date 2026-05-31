export const brand = {
  name: 'urra',
  longName: 'Bauschreinerei Urra',
  founded: 2003,
} as const;

export const hero = {
  words: ['fenster', 'und', 'türen'] as const,
  description:
    'Handwerk aus dem Sauerland. Wir planen, fertigen und montieren Fenster, Türen und Garagentore mit Präzision — inhabergeführt seit 2003.',
  stats: [
    { value: 'seit 2003', label: 'Inhabergeführt aus Olsberg' },
    { value: '3 regionen', label: 'Sauerland · OWL · Ruhrgebiet' },
    { value: '100% handwerk', label: 'Fachmontage nach EnEV' },
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
  subtitle:
    'Rundum-Service vom Aufmaß bis zur fachgerechten Montage — alles aus einer Hand.',
  items: [
    {
      id: 'beratung',
      number: '01',
      title: 'beratung & aufmaß',
      body:
        'Persönliche Beratung vor Ort und millimetergenaues digitales Aufmaß mit der metiscale-App. Wir hören zu, denken mit und planen passgenau für Ihr Objekt.',
    },
    {
      id: 'demontage',
      number: '02',
      title: 'demontage & entsorgung',
      body:
        'Fachgerechtes Lösen und Entfernen der alten Rahmen. Wir minimieren Staub und Schmutz, schützen Innenräume und Böden und entsorgen alle Altmaterialien umweltgerecht.',
    },
    {
      id: 'montage',
      number: '03',
      title: 'montage nach enev',
      body:
        'RAL-zertifizierte Montage nach Energieeinsparverordnung. Dämmung der Anschlussfugen gegen Wärmebrücken, Dichtheitsprüfung, Funktionskontrolle, Leibungsverkleidung und farblich abgestimmte Abschlussleisten.',
    },
  ],
} as const;

export const products = {
  title: 'unser handwerk',
  subtitle:
    'Fenster, Türen und Tore aus Holz, Kunststoff oder Aluminium — für Neubau, Sanierung und Gewerbe.',
  categories: [
    {
      title: 'fenster',
      items: ['Kunststofffenster', 'Aluminiumfenster', 'Holzfenster', 'Sonderanfertigungen'],
    },
    {
      title: 'türen',
      items: ['Haustüren', 'Innentüren', 'Schiebetüren', 'Objekttüren'],
    },
    {
      title: 'tore',
      items: ['Garagentore', 'Industrietore', 'Hofeinfahrten', 'Antriebe'],
    },
  ],
} as const;

export const about = {
  title: 'über uns',
  lead:
    'Qualität ist kein Zufall, sie ist das Ergebnis harter Arbeit, kluger Planung und ehrlicher Leidenschaft.',
  paragraphs: [
    'Seit 2003 stehen wir als inhabergeführter Fachbetrieb für Qualität, Zuverlässigkeit und handwerkliche Präzision. Unsere Philosophie: für jedes Projekt die beste Lösung finden — funktional, energieeffizient und optisch ansprechend.',
    'Wir arbeiten eng mit renommierten Herstellern zusammen und sind Ihr kompetenter Ansprechpartner rund um Fenster, Türen und Garagentore — von der ersten Beratung bis zur fachgerechten Montage.',
  ],
  values: [
    { key: 'qualität', body: 'Langlebig, sicher und energieeffizient.' },
    { key: 'präzision', body: 'Millimetergenau geplant, sauber montiert.' },
    { key: 'verlässlich', body: 'Termintreue und transparente Kommunikation.' },
  ],
} as const;

export const regions = {
  title: 'unsere region',
  subtitle: 'Wir sind im gesamten Westfalen unterwegs.',
  areas: [
    {
      key: 'Sauerland',
      cities: [
        'Arnsberg',
        'Meschede',
        'Brilon',
        'Winterberg',
        'Schmallenberg',
        'Olpe',
        'Lüdenscheid',
        'Iserlohn',
      ],
    },
    {
      key: 'Ostwestfalen-Lippe',
      cities: [
        'Bielefeld',
        'Gütersloh',
        'Herford',
        'Paderborn',
        'Detmold',
        'Höxter',
        'Minden-Lübbecke',
      ],
    },
    {
      key: 'Ruhrgebiet',
      cities: [
        'Dortmund',
        'Hagen',
        'Bochum',
        'Essen',
        'Gelsenkirchen',
        'Herne',
        'Duisburg',
        'Recklinghausen',
      ],
    },
  ],
} as const;

export const contact = {
  title: 'kontakt',
  lead: 'Lassen Sie uns über Ihr Projekt sprechen.',
  address: {
    street: 'Am Ochsenberg 13',
    zip: '59939',
    city: 'Olsberg',
  },
  phone: { display: '+49 160 99116995', href: 'tel:+4916099116995' },
  email: { display: 'h.urra@bauschreinerei-urra.de', href: 'mailto:h.urra@bauschreinerei-urra.de' },
  cta: 'Termin anfragen',
} as const;

export const footer = {
  tagline: 'Fenster, Türen und Garagentore. Handgemacht im Sauerland seit 2003.',
  copyright: `© ${new Date().getFullYear()} Bauschreinerei Urra · Alle Rechte vorbehalten`,
  legal: [
    { label: 'impressum', href: '#impressum' },
    { label: 'datenschutz', href: '#datenschutz' },
  ],
} as const;

export const features = {
  title: 'warum urra',
  subtitle:
    'Fünf Gründe, warum wir seit 2003 Ihr Partner für Fenster und Türen sind.',
  items: [
    {
      key: 'ral',
      title: 'ral-zertifizierte montage',
      body:
        'Einbau nach den anerkannten RAL-Richtlinien — die strengste Norm für Fenster- und Türmontage in Deutschland.',
    },
    {
      key: 'enev',
      title: 'enev-konform',
      body:
        'Jeder Einbau entspricht der Energieeinsparverordnung. Anschlussfugen werden fachgerecht gedämmt — kein Wärmeverlust.',
    },
    {
      key: 'aufmass',
      title: 'digitales aufmaß',
      body:
        'Die metiscale-App misst millimetergenau. Keine Nachmessungen, keine Überraschungen, keine bösen Rechnungen.',
    },
    {
      key: 'eigenes-team',
      title: 'eigenes montage-team',
      body:
        'Kein Subunternehmer. Unsere Monteure sind festangestellt, geschult und seit Jahren beim selben Handwerk.',
    },
    {
      key: 'regional',
      title: 'regional verwurzelt',
      body:
        'Olsberg, Brilon, Meschede und das gesamte Sauerland — wir kennen die Häuser, die Menschen und das Wetter hier.',
    },
  ],
} as const;

export const faq = {
  title: 'häufige fragen',
  subtitle:
    'Was Kunden uns am häufigsten fragen — kurz und ehrlich beantwortet.',
  items: [
    {
      q: 'Wie lange dauert ein typischer Fenster-Austausch?',
      a:
        'Für ein einzelnes Fenster rechnen wir mit 1–2 Stunden inklusive Demontage, Montage und Endabnahme. Ein komplettes Haus mit 8–12 Fenstern dauert in der Regel 2–3 Werktage.',
    },
    {
      q: 'Müssen wir während der Montage zuhause sein?',
      a:
        'Mindestens eine Ansprechperson vor Ort ist hilfreich, aber nicht zwingend. Wir können auch nach Absprache mit Schlüsselübergabe arbeiten — Sauberkeit und Ordnung garantiert.',
    },
    {
      q: 'Übernehmt ihr auch die Entsorgung der alten Fenster?',
      a:
        'Ja, immer. Fachgerechte Demontage, Abtransport und umweltgerechte Entsorgung sind im Angebot enthalten. Sie müssen nichts organisieren.',
    },
    {
      q: 'Welche Materialien empfehlt ihr für welches Objekt?',
      a:
        'Kunststoff für die meisten Neubauten und Sanierungen — Preis-Leistung top. Aluminium für schlanke Ansichten und Großformate. Holz oder Holz-Alu für historisch geprägte oder besonders hochwertige Objekte. Wir beraten ergebnisoffen.',
    },
    {
      q: 'Wie schnell bekomme ich ein Angebot?',
      a:
        'Nach dem Aufmaß-Termin innerhalb von 3–5 Werktagen. Transparent, mit allen Leistungen aufgeschlüsselt, ohne versteckte Kosten.',
    },
    {
      q: 'Gibt es eine Garantie auf Montage und Produkte?',
      a:
        'Auf unsere Montage-Leistung gewähren wir 5 Jahre Garantie. Auf die Produkte greift die jeweilige Herstellergarantie — meist 5–10 Jahre, je nach Element. Details zu jedem Auftrag im Angebot.',
    },
    {
      q: 'In welchem Umkreis seid ihr unterwegs?',
      a:
        'Unser Kerngebiet ist Olsberg, Brilon, Meschede und das Sauerland. Zusätzlich bedienen wir das gesamte Ostwestfalen-Lippe und das Ruhrgebiet — Anfragen darüber hinaus auf Nachfrage.',
    },
    {
      q: 'Macht ihr auch Sonderanfertigungen?',
      a:
        'Ja. Ob Bogenfenster für Altbauten, übergroße Schiebetüren oder spezielle Objekttüren für Gewerbeprojekte — wir planen und realisieren Maßanfertigungen mit unseren Herstellerpartnern.',
    },
  ],
} as const;
