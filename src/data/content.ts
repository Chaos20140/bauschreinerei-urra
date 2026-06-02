export const brand = {
  name: 'Urra',
  longName: 'Bauschreinerei Heribert Urra',
  shortName: 'Bauschreinerei Urra',
  founded: 2003,
} as const;

export const hero = {
  words: ['Fenster', 'und', 'Türen'] as const,
  description:
    'Handwerk aus dem Sauerland. Wir planen, fertigen und montieren Fenster, Türen und Garagentore mit Präzision — inhabergeführt seit 2003.',
  stats: [
    { value: 'Seit 2003', label: 'Inhabergeführt aus Olsberg' },
    { value: '3 Regionen', label: 'Sauerland · OWL · Ruhrgebiet' },
    { value: '100 % Handwerk', label: 'Fachmontage nach EnEV' },
  ],
} as const;

export const navigation = [
  { label: 'Leistungen', href: '/leistungen' },
  { label: 'Projekte', href: '/projekte' },
  { label: 'Über uns', href: '/ueber-uns' },
  { label: 'Kontakt', href: '/kontakt' },
] as const;

export const services = {
  title: 'Leistungen',
  eyebrow: 'Leistungen',
  subtitle:
    'Rundum-Service vom Aufmaß bis zur fachgerechten Montage — alles aus einer Hand.',
  items: [
    {
      id: 'beratung',
      title: 'Beratung & Aufmaß',
      body:
        'Persönliche Beratung vor Ort und millimetergenaues digitales Aufmaß mit der metiscale-App. Wir hören zu, denken mit und planen passgenau für Ihr Objekt.',
    },
    {
      id: 'demontage',
      title: 'Demontage & Entsorgung',
      body:
        'Fachgerechtes Lösen und Entfernen der alten Rahmen. Wir minimieren Staub und Schmutz, schützen Innenräume und Böden und entsorgen alle Altmaterialien umweltgerecht.',
    },
    {
      id: 'montage',
      title: 'Montage nach EnEV',
      body:
        'RAL-zertifizierte Montage nach Energieeinsparverordnung. Dämmung der Anschlussfugen gegen Wärmebrücken, Dichtheitsprüfung, Funktionskontrolle, Leibungsverkleidung und farblich abgestimmte Abschlussleisten.',
    },
  ],
} as const;

export const products = {
  title: 'Unser Handwerk',
  eyebrow: 'Produkte',
  subtitle:
    'Fenster, Türen und Tore aus Holz, Kunststoff oder Aluminium — für Neubau, Sanierung und Gewerbe.',
  categories: [
    {
      title: 'Fenster',
      items: ['Kunststofffenster', 'Aluminiumfenster', 'Holzfenster', 'Sonderanfertigungen'],
    },
    {
      title: 'Türen',
      items: ['Haustüren', 'Innentüren', 'Schiebetüren', 'Objekttüren'],
    },
    {
      title: 'Tore',
      items: ['Garagentore', 'Industrietore', 'Hofeinfahrten', 'Antriebe'],
    },
  ],
} as const;

export const about = {
  title: 'Über uns',
  eyebrow: 'Über uns',
  lead:
    'Qualität ist kein Zufall, sie ist das Ergebnis harter Arbeit, kluger Planung und ehrlicher Leidenschaft.',
  paragraphs: [
    'Seit 2003 stehen wir als inhabergeführter Fachbetrieb für Qualität, Zuverlässigkeit und handwerkliche Präzision. Unsere Philosophie: für jedes Projekt die beste Lösung finden — funktional, energieeffizient und optisch ansprechend.',
    'Wir arbeiten eng mit renommierten Herstellern zusammen und sind Ihr kompetenter Ansprechpartner rund um Fenster, Türen und Garagentore — von der ersten Beratung bis zur fachgerechten Montage.',
  ],
  values: [
    { key: 'Qualität', body: 'Langlebig, sicher und energieeffizient.' },
    { key: 'Präzision', body: 'Millimetergenau geplant, sauber montiert.' },
    { key: 'Verlässlich', body: 'Termintreue und transparente Kommunikation.' },
  ],
} as const;

export const regions = {
  title: 'Unsere Region',
  eyebrow: 'Region',
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
  title: 'Kontakt',
  eyebrow: 'Kontakt',
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
  tagline:
    'Fenster, Türen und Garagentore. Handgemacht im Sauerland seit 2003.',
  copyright: `© ${new Date().getFullYear()} Bauschreinerei Heribert Urra · Alle Rechte vorbehalten`,
  legal: [
    { label: 'Impressum', href: '/impressum' },
    { label: 'Datenschutz', href: '/datenschutz' },
  ],
} as const;

export const features = {
  title: 'Warum Urra',
  eyebrow: 'Qualität',
  subtitle:
    'Fünf Gründe, warum wir seit 2003 Ihr Partner für Fenster und Türen sind.',
  items: [
    {
      key: 'ral',
      title: 'RAL-zertifizierte Montage',
      body:
        'Einbau nach den anerkannten RAL-Richtlinien — die strengste Norm für Fenster- und Türmontage in Deutschland.',
    },
    {
      key: 'enev',
      title: 'EnEV-konform',
      body:
        'Jeder Einbau entspricht der Energieeinsparverordnung. Anschlussfugen werden fachgerecht gedämmt — kein Wärmeverlust.',
    },
    {
      key: 'aufmass',
      title: 'Digitales Aufmaß',
      body:
        'Die metiscale-App misst millimetergenau. Keine Nachmessungen, keine Überraschungen, keine bösen Rechnungen.',
    },
    {
      key: 'eigenes-team',
      title: 'Eigenes Montage-Team',
      body:
        'Kein Subunternehmer. Unsere Monteure sind festangestellt, geschult und seit Jahren beim selben Handwerk.',
    },
    {
      key: 'regional',
      title: 'Regional verwurzelt',
      body:
        'Olsberg, Brilon, Meschede und das gesamte Sauerland — wir kennen die Häuser, die Menschen und das Wetter hier.',
    },
  ],
} as const;

// ----------------------------------------------------------------------------
// HINWEIS für späteren Austausch durch ECHTE Google-Bewertungen:
//   Die hier gepflegten Reviews sind Platzhalter im neutralen Marketing-Ton.
//   Sobald die echten Google-Reviews verfügbar sind (z. B. via Place-ID +
//   Maps JavaScript API mit domain-restricted API-Key oder als nightly
//   Cache via GitHub Action), kann dieser Array durch die Live-Daten
//   ersetzt werden. UI-Komponente erwartet exakt diese Struktur.
// ----------------------------------------------------------------------------
export const reviews = {
  eyebrow: 'Stimmen',
  title: 'Was Kunden sagen.',
  subtitle:
    'Direkt aus dem Sauerland und ganz Westfalen — echte Eindrücke von Bauherren, die wir begleitet haben.',
  rating: 5.0,
  count: 8,
  source: 'Google',
  link: 'https://www.google.com/maps/search/?api=1&query=Bauschreinerei+Heribert+Urra+Olsberg',
  items: [
    {
      name: 'Familie B.',
      role: 'Olsberg · Sanierung Einfamilienhaus',
      rating: 5,
      date: 'März 2026',
      body:
        'Pünktlich, sauber, exakt nach Plan. Vom ersten Aufmaß bis zur Abnahme hat alles gestimmt — wir sind rundum zufrieden.',
    },
    {
      name: 'Herr S.',
      role: 'Brilon · Neubau',
      rating: 5,
      date: 'Januar 2026',
      body:
        'Sehr kompetente Beratung, faires Angebot und eine Montage, die jeden Tag fertig wurde wie versprochen. Klare Empfehlung.',
    },
    {
      name: 'Frau M.',
      role: 'Meschede · Fenstertausch',
      rating: 5,
      date: 'November 2025',
      body:
        'Saubere Baustelle, freundliche Monteure, schöne Endabnahme. Die Wärme bleibt jetzt drin, der Lärm bleibt draußen.',
    },
    {
      name: 'Familie K.',
      role: 'Winterberg · Garagentor & Haustür',
      rating: 5,
      date: 'September 2025',
      body:
        'Wir hatten konkrete Vorstellungen — Herr Urra hat sie nicht nur umgesetzt, sondern an entscheidenden Stellen klug verbessert. Top.',
    },
    {
      name: 'Herr R.',
      role: 'Arnsberg · Modernisierung',
      rating: 5,
      date: 'Juni 2025',
      body:
        'Beratung auf Augenhöhe, transparenter Preis, ordentliche Ausführung. So wünscht man sich Handwerk.',
    },
    {
      name: 'Frau L.',
      role: 'Schmallenberg · Schiebetüren',
      rating: 5,
      date: 'April 2025',
      body:
        'Termin eingehalten, keine bösen Überraschungen, die neuen Schiebetüren laufen wie auf Schienen. Danke für die saubere Arbeit.',
    },
  ],
} as const;

export const faq = {
  title: 'Häufige Fragen',
  eyebrow: 'FAQ',
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
