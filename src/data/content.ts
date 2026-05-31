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
      body: 'fachgerechtes lösen und entfernen der alten rahmen. minimierung von staub und schmutz, schutz von innenräumen und böden, umweltgerechte entsorgung der altmaterialien.',
    },
    {
      id: 'montage',
      number: '03',
      title: 'montage nach enev',
      body: 'ral-zertifizierte montage nach energieeinsparverordnung. dämmung der anschlussfugen gegen wärmebrücken, dichtheitsprüfung, funktionskontrolle, leibungsverkleidung und farblich abgestimmte abschlussleisten.',
    },
  ],
} as const;

export const features = {
  title: 'warum urra',
  subtitle: 'fünf gründe, warum wir seit 2003 ihr partner für fenster und türen sind.',
  items: [
    {
      key: 'ral',
      title: 'ral-zertifizierte montage',
      body: 'einbau nach den anerkannten ral-richtlinien — die strengste norm für fenster- und türmontage in deutschland.',
    },
    {
      key: 'enev',
      title: 'enev-konform',
      body: 'jeder einbau entspricht der energieeinsparverordnung. anschlussfugen werden fachgerecht gedämmt — kein wärmeverlust.',
    },
    {
      key: 'aufmass',
      title: 'digitales aufmaß',
      body: 'metiscale-app misst millimetergenau. keine nachmessungen, keine überraschungen, keine bösen rechnungen.',
    },
    {
      key: 'eigenes-team',
      title: 'eigenes montage-team',
      body: 'kein subunternehmer. unsere monteure sind festangestellt, geschult und seit jahren beim selben handwerk.',
    },
    {
      key: 'regional',
      title: 'regional verwurzelt',
      body: 'olsberg, brilon, meschede und das gesamte sauerland — wir kennen die häuser, die menschen und das wetter hier.',
    },
  ],
} as const;

export const faq = {
  title: 'häufige fragen',
  subtitle: 'was kunden uns am häufigsten fragen — kurz und ehrlich beantwortet.',
  items: [
    {
      q: 'wie lange dauert ein typischer fenster-austausch?',
      a: 'für ein einzelnes fenster rechnen wir mit 1–2 stunden inklusive demontage, montage und endabnahme. ein komplett-haus mit 8–12 fenstern dauert in der regel 2–3 werktage.',
    },
    {
      q: 'müssen wir während der montage zuhause sein?',
      a: 'mindestens eine ansprechperson vor ort ist hilfreich, aber nicht zwingend. wir können auch nach absprache mit schlüsselübergabe arbeiten — sauberkeit und ordnung garantiert.',
    },
    {
      q: 'übernehmt ihr auch die entsorgung der alten fenster?',
      a: 'ja, immer. fachgerechte demontage, abtransport und umweltgerechte entsorgung sind im angebot enthalten. sie müssen nichts organisieren.',
    },
    {
      q: 'welche materialien empfehlt ihr für welches objekt?',
      a: 'kunststoff für die meisten neubauten und sanierungen — preis-leistung top. aluminium für schlanke ansichten und großformate. holz oder holz-alu für historisch geprägte oder besonders hochwertige objekte. wir beraten ergebnisoffen.',
    },
    {
      q: 'wie schnell bekomme ich ein angebot?',
      a: 'nach dem aufmaß-termin innerhalb von 3–5 werktagen. transparent, mit allen leistungen aufgeschlüsselt, ohne versteckte kosten.',
    },
    {
      q: 'gibt es eine garantie auf montage und produkte?',
      a: 'auf unsere montage-leistung 5 jahre. auf die produkte greift die jeweilige herstellergarantie — meist 5–10 jahre, je nach element. details zu jedem auftrag im angebot.',
    },
    {
      q: 'in welchem umkreis seid ihr unterwegs?',
      a: 'unser kerngebiet ist olsberg, brilon, meschede und das sauerland. zusätzlich bedienen wir das gesamte ostwestfalen-lippe und ruhrgebiet — anfragen darüber hinaus auf nachfrage.',
    },
    {
      q: 'macht ihr auch sonderanfertigungen?',
      a: 'ja. ob bogenfenster für altbauten, übergroße schiebetüren oder spezielle objekttüren für gewerbeprojekte — wir planen und realisieren maßanfertigungen mit unseren herstellerpartnern.',
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
