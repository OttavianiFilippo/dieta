// Piano alimentare V1 — Schema Dietetico del 12/10/26 (Luigi Pasini, Biologo Nutrizionista).
//
// Voce del pasto:
//   food   alimento base (sostituibile), g grammi del piano, kcal, m misura pratica, note
//   name   nome del piatto se diverso dall'alimento (piatti composti)
//   extra  ingredienti aggiuntivi per spesa/dispensa (es. 1 barattolo di condimento)
// Nei piatti composti i grammi sono della pasta, il condimento è 1 barattolo a porzione.

const yogurtMuesliSucco = [
  { food: 'yogurt0', g: 125, kcal: 45, m: '1 vasetto' },
  { food: 'muesli', g: 30, kcal: 131, m: '2-3 cucchiai' },
  { food: 'succo', g: 150, kcal: 99, m: '1 bicchiere' },
];

const colazione = { id: 'colazione', name: 'Colazione', time: '08:00', kcal: 275, water: 0.5, items: yogurtMuesliSucco };

const spuntinoMelaNoci = (time) => ({
  id: 'spuntino1', name: 'Spuntino mattina', time, kcal: 125, water: 0.3,
  items: [
    { food: 'mela', g: 150, kcal: 69, m: '1 frutto medio' },
    { food: 'noci', g: 8, kcal: 56, m: '2 noci' },
  ],
});

const acquaMeal = (id, name, time) => ({
  id, name, time, kcal: 0, water: 0.3,
  items: [{ food: 'acqua', g: 250, m: '1/2 borraccia' }],
});

const merendaBanana = {
  id: 'merenda', name: 'Merenda', time: '17:00', kcal: 336, water: 0.3,
  items: [
    { food: 'banana', g: 150, kcal: 115, m: '1 frutto medio' },
    { food: 'nocciole', g: 5, kcal: 34, m: '5-6 nocciole' },
    { food: 'biscottiFC', g: 40, kcal: 188, m: '4 biscotti' },
  ],
};

const postCenaCioccolato = {
  id: 'postcena', name: 'Post-cena', time: '22:00', kcal: 365, water: 0.4,
  items: [
    { food: 'yogurtGreco', g: 150, kcal: 77, m: '1 vasetto grande' },
    { food: 'cioccolato', g: 10, kcal: 53, m: '3-4 scacchetti', note: 'Anche in gocce' },
    { food: 'biscottiInt', g: 54, kcal: 236, m: '6 biscotti' },
  ],
};

const postCenaMeleSecche = {
  id: 'postcena', name: 'Post-cena', time: '22:00', kcal: 348, water: 0.4,
  items: [
    { food: 'yogurtGreco', g: 150, kcal: 77, m: '1 vasetto grande' },
    { food: 'muesli', g: 30, kcal: 131, m: '2-3 cucchiai' },
    { food: 'meleSecche', g: 45, kcal: 107, m: '1/2 confezione' },
    { food: 'nocciole', g: 5, kcal: 34, m: '5-6 nocciole' },
  ],
};

export const SHAKER_RECIPE = {
  title: 'Integratore POST-proteico (shaker da 0,5 L)',
  when: 'Nei 30 minuti subito dopo l’allenamento di pesi',
  lines: [
    'Proteine vegetali vaniglia in polvere (BuonFood): 20 g = 2 misurini (15 g di proteine)',
    'Succo ananas/albicocca 100%: 200 ml (o quello che preferisci)',
    'Sale da cucina: 0,5 g (1 pizzico abbondante)',
    'Acqua: 300 ml',
  ],
  alt: 'In alternativa: proteine NAMED Sport al cacao, 2 misurini in 500 ml di acqua, 2 misurini di zucchero di canna al posto del succo, 1 pizzico abbondante di sale.',
};

const supplementiPalestra = {
  id: 'supplementi', name: 'Supplementi', time: null, consumeAt: '19:00', label: 'Pre, durante e post allenamento',
  kcal: 270, water: 0.5, shaker: true,
  items: [
    { food: 'succo', g: 150, kcal: 99, m: '1 brick', note: 'Nei 30 min prima' },
    { food: 'acqua', g: 250, m: '1/2 borraccia', note: 'Durante: 50 ml ogni 15 min' },
    { name: 'Integratore POST-proteico 20 g', g: 500, kcal: 171, m: '1 shaker', note: 'Nei 30 min dopo',
      extra: [{ food: 'proteine', g: 20 }, { food: 'succo', g: 200 }] },
    { food: 'acqua', g: 250, m: '1/2 borraccia', note: 'Nei 60 min dopo' },
  ],
};

const days = {
  lun: {
    name: 'Lunedì', activity: 'Palestra', kcal: 2829, p: 114, f: 82, c: 392,
    meals: [
      colazione,
      spuntinoMelaNoci('10:00'),
      acquaMeal('spuntino2', 'Spuntino mattina 2', '12:00'),
      {
        id: 'pranzo', name: 'Pranzo', time: '13:00', kcal: 628, water: 0.5,
        items: [
          { food: 'olioEvo', g: 10, kcal: 90, m: '2 cucchiaini' },
          { name: 'Pasta e fagioli', food: 'pasta', g: 120, kcal: 502, m: '1 piatto', extra: [{ food: 'fagioliBarattolo', pz: 1 }] },
          { food: 'fagiolini', g: 150, kcal: 36, m: '1 piatto' },
        ],
      },
      acquaMeal('spuntino3', 'Spuntino pomeriggio', '14:30'),
      merendaBanana,
      {
        id: 'cena', name: 'Cena', time: '21:00', kcal: 830, water: 0.6,
        items: [
          { food: 'olioEvo', g: 10, kcal: 90, m: '2 cucchiaini' },
          { food: 'branzino', g: 150, kcal: 146, m: '1 filetto' },
          { name: 'Patate arrosto', food: 'patata', g: 150, kcal: 228, m: '1 piatto' },
          { food: 'spinaci', g: 120, kcal: 49, m: '1 piatto', note: 'Bolliti o al vapore' },
          { food: 'pane', g: 100, kcal: 245, m: '2 fette' },
          { food: 'pera', g: 150, kcal: 72, m: '1 frutto medio' },
        ],
      },
      postCenaCioccolato,
      supplementiPalestra,
    ],
  },

  mar: {
    name: 'Martedì', activity: 'Riposo', kcal: 2599, p: 82, f: 93, c: 346,
    meals: [
      colazione,
      spuntinoMelaNoci('10:00'),
      acquaMeal('spuntino2', 'Spuntino mattina 2', '12:00'),
      {
        id: 'pranzo', name: 'Pranzo', time: '13:00', kcal: 863, water: 0.5,
        items: [
          { food: 'olioEvo', g: 5, kcal: 45, m: '1 cucchiaino' },
          { name: 'Pasta al pesto', food: 'pasta', g: 120, kcal: 630, m: '1 piatto', extra: [{ food: 'pestoBarattolo', pz: 1 }] },
          { name: 'Carote crude', food: 'carota', g: 160, kcal: 66, m: '1 piatto' },
          { food: 'pane', g: 50, kcal: 123, m: '1 fetta' },
        ],
      },
      acquaMeal('spuntino3', 'Spuntino pomeriggio', '14:30'),
      {
        id: 'merenda', name: 'Merenda', time: '17:00', kcal: 298, water: 0.3,
        items: [
          { food: 'prugna', g: 120, kcal: 54, m: '2 prugne' },
          { food: 'noci', g: 8, kcal: 56, m: '2 noci' },
          { food: 'biscottiFC', g: 40, kcal: 188, m: '4 biscotti' },
        ],
      },
      {
        id: 'cena', name: 'Cena', time: '21:00', kcal: 673, water: 0.6,
        items: [
          { food: 'norsan', g: 8, kcal: 72, m: '1 cucchiaio' },
          { food: 'uova', g: 100, kcal: 128, m: '2 uova' },
          { food: 'fagiolini', g: 150, kcal: 36, m: '1 piatto' },
          { food: 'pane', g: 150, kcal: 368, m: '3 fette' },
          { food: 'mela', g: 150, kcal: 69, m: '1 frutto medio' },
        ],
      },
      postCenaCioccolato,
    ],
  },

  mer: {
    name: 'Mercoledì', activity: 'Palestra', kcal: 2798, p: 122, f: 71, c: 415,
    meals: [
      colazione,
      spuntinoMelaNoci('10:00'),
      acquaMeal('spuntino2', 'Spuntino mattina 2', '12:00'),
      {
        id: 'pranzo', name: 'Pranzo', time: '13:00', kcal: 821, water: 0.5,
        items: [
          { food: 'olioEvo', g: 10, kcal: 90, m: '2 cucchiaini' },
          { name: 'Pasta con il tonno', food: 'pasta', g: 120, kcal: 543, m: '1 piatto', extra: [{ food: 'tonnoScatola', pz: 1 }] },
          { name: 'Carote crude', food: 'carota', g: 160, kcal: 66, m: '1 piatto' },
          { food: 'pane', g: 50, kcal: 123, m: '1 fetta' },
        ],
      },
      acquaMeal('spuntino3', 'Spuntino pomeriggio', '14:30'),
      merendaBanana,
      {
        id: 'cena', name: 'Cena', time: '21:00', kcal: 623, water: 0.6,
        items: [
          { food: 'norsan', g: 8, kcal: 72, m: '1 cucchiaio' },
          { food: 'riso', g: 120, kcal: 409, m: '1 piatto' },
          { name: 'Petto di pollo in padella', food: 'pollo', g: 100, kcal: 129, m: '2 fette' },
          { food: 'cetriolo', g: 80, kcal: 13, m: '1 cetriolo' },
        ],
      },
      postCenaMeleSecche,
      supplementiPalestra,
    ],
  },

  gio: {
    name: 'Giovedì', activity: 'Palestra', kcal: 2800, p: 108, f: 71, c: 415,
    meals: [
      colazione,
      spuntinoMelaNoci('09:00'),
      acquaMeal('spuntino2', 'Spuntino mattina 2', '11:00'),
      {
        id: 'pranzo', name: 'Pranzo', time: '13:00', kcal: 628, water: 0.5,
        items: [
          { food: 'olioEvo', g: 10, kcal: 90, m: '2 cucchiaini' },
          { name: 'Pasta e fagioli', food: 'pasta', g: 120, kcal: 502, m: '1 piatto', extra: [{ food: 'fagioliBarattolo', pz: 1 }] },
          { food: 'fagiolini', g: 150, kcal: 36, m: '1 piatto' },
        ],
      },
      acquaMeal('spuntino3', 'Spuntino pomeriggio', '14:30'),
      merendaBanana,
      {
        id: 'cena', name: 'Cena', time: '21:00', kcal: 817, water: 0.6,
        items: [
          { food: 'olioEvo', g: 10, kcal: 90, m: '2 cucchiaini' },
          { food: 'merluzzo', g: 150, kcal: 107, m: '2 filetti' },
          { name: 'Patate bollite', food: 'patata', g: 150, kcal: 111, m: '1 piatto' },
          { name: 'Carote bollite/vapore', food: 'carota', g: 150, kcal: 71, m: '1 piatto' },
          { food: 'pane', g: 150, kcal: 368, m: '3 fette' },
          { food: 'pera', g: 150, kcal: 72, m: '1 frutto medio' },
        ],
      },
      postCenaMeleSecche,
      supplementiPalestra,
    ],
  },

  ven: {
    name: 'Venerdì', activity: 'Braccia a sentimento', kcal: 2685, p: 104, f: 76, c: 385,
    meals: [
      colazione,
      {
        id: 'spuntino1', name: 'Spuntino mattina', time: '10:00', kcal: 235, water: 0.3,
        items: [
          { food: 'mela', g: 150, kcal: 69, m: '1 frutto medio' },
          { food: 'noci', g: 8, kcal: 56, m: '2 noci' },
          { food: 'barretta', g: 28, kcal: 110, m: '1 barretta' },
        ],
      },
      acquaMeal('spuntino2', 'Spuntino mattina 2', '12:00'),
      {
        id: 'pranzo', name: 'Pranzo', time: '14:00', kcal: 649, water: 0.5,
        note: 'Esempio di pranzo veloce (lezione alle 15:00)',
        items: [
          { food: 'olioEvo', g: 10, kcal: 90, m: '2 cucchiaini' },
          { name: 'Pasta al pomodoro', food: 'pasta', g: 120, kcal: 527, m: '1 piatto', extra: [{ food: 'sugoPomodoro', pz: 1 }] },
          { name: 'Carote crude', food: 'carota', g: 80, kcal: 33, m: '2 carote' },
        ],
      },
      acquaMeal('spuntino3', 'Spuntino pomeriggio', '15:00'),
      {
        id: 'merenda', name: 'Merenda', time: '17:00', kcal: 225, water: 0.3,
        items: [
          { food: 'banana', g: 150, kcal: 115, m: '1 frutto medio' },
          { food: 'barretta', g: 28, kcal: 110, m: '1 barretta' },
        ],
      },
      {
        id: 'cena', name: 'Cena', time: '21:00', kcal: 665, water: 0.6,
        items: [
          { food: 'norsan', g: 8, kcal: 72, m: '1 cucchiaio' },
          { food: 'vitello', g: 120, kcal: 128, m: '1 filetto' },
          { food: 'cicoria', g: 150, kcal: 26, m: '1 piatto', note: 'Bollita o al vapore' },
          { food: 'pane', g: 150, kcal: 368, m: '3 fette' },
          { food: 'pera', g: 150, kcal: 72, m: '1 frutto medio' },
        ],
      },
      postCenaCioccolato,
      supplementiPalestra,
    ],
  },

  sab: {
    name: 'Sabato', activity: 'Corsa 10 km a 5:30/km', kcal: 3191, p: 131, f: 106, c: 422,
    meals: [
      {
        id: 'colazione', name: 'Colazione', time: '08:00', kcal: 354, water: 0.5,
        note: '1 ora e mezza prima della corsa',
        items: [...yogurtMuesliSucco, { food: 'biscottiInt', g: 18, kcal: 79, m: '2 biscotti' }],
      },
      acquaMeal('spuntino1', 'Spuntino mattina', '10:00'),
      acquaMeal('spuntino2', 'Spuntino mattina 2', '12:00'),
      {
        id: 'pranzo', name: 'Pranzo', time: '13:00', kcal: 888, water: 0.5,
        items: [
          { food: 'olioEvo', g: 10, kcal: 90, m: '2 cucchiaini' },
          { name: 'Pasta e piselli', food: 'pasta', g: 120, kcal: 610, m: '1 piatto', extra: [{ food: 'piselliBarattolo', pz: 1 }] },
          { food: 'prosciutto', g: 80, kcal: 188, m: '4 fette' },
        ],
      },
      acquaMeal('spuntino3', 'Spuntino pomeriggio', '14:30'),
      {
        id: 'merenda', name: 'Merenda', time: '17:00', kcal: 336, water: 0.3,
        items: [
          { food: 'prugna', g: 120, kcal: 54, m: '2 prugne' },
          { food: 'noci', g: 8, kcal: 56, m: '2 noci' },
          { food: 'biscottiCioc', g: 48, kcal: 225, m: '4 biscotti' },
        ],
      },
      {
        id: 'cena', name: 'Cena', time: '21:00', kcal: 1280, water: 0.6, cheat: true,
        note: 'Pasto libero: lo gestisci tu, non entra nella spesa',
        items: [
          { food: 'pizza', g: 462, kcal: 1084, m: '1 pizza' },
          { food: 'cola', g: 500, kcal: 196, m: '2 lattine' },
        ],
      },
      {
        id: 'postcena', name: 'Post-cena', time: '22:00', kcal: 45, water: 0.4,
        note: 'Dopo la pizza',
        items: [{ food: 'yogurt0', g: 125, kcal: 45, m: '1 vasetto' }],
      },
      {
        id: 'supplementi', name: 'Supplementi', time: null, consumeAt: '11:00', label: 'Pre e post corsa',
        kcal: 288, water: 0.5,
        items: [
          { food: 'biscottiInt', g: 36, kcal: 157, m: '4 biscotti', note: 'Nei 30 min prima della corsa' },
          { name: 'Integratore POST-proteico 10 g', g: 500, kcal: 131, m: '1 shaker', note: 'Nei 30 min dopo la corsa',
            extra: [{ food: 'proteine', g: 10 }, { food: 'succo', g: 200 }] },
          { food: 'acqua', g: 500, m: '1 borraccia', note: 'Nei 60 min dopo la corsa' },
        ],
      },
    ],
  },

  dom: {
    name: 'Domenica', activity: 'Riposo', kcal: 2971, p: 116, f: 132, c: 324,
    meals: [
      colazione,
      {
        id: 'spuntino1', name: 'Spuntino mattina', time: '10:00', kcal: 120, water: 0.3,
        items: [
          { food: 'kiwi', g: 180, kcal: 86, m: '2 frutti medi' },
          { food: 'nocciole', g: 5, kcal: 34, m: '5-6 nocciole' },
        ],
      },
      acquaMeal('spuntino2', 'Spuntino mattina 2', '12:00'),
      {
        id: 'pranzo', name: 'Pranzo', time: '13:00', kcal: 901, water: 0.5,
        items: [
          { food: 'olioEvo', g: 5, kcal: 45, m: '1 cucchiaino' },
          { name: 'Pasta al ragù', food: 'pasta', g: 120, kcal: 831, m: '1 piatto', extra: [{ food: 'raguBarattolo', pz: 1 }] },
          { food: 'cicoria', g: 150, kcal: 26, m: '1 piatto', note: 'Bollita o al vapore' },
        ],
      },
      acquaMeal('spuntino3', 'Spuntino pomeriggio', '14:30'),
      {
        id: 'merenda', name: 'Merenda', time: '17:00', kcal: 593, water: 0.3,
        note: 'Altrimenti frutta',
        items: [
          { name: 'Gelato alla frutta (coppetta)', food: 'gelato', g: 200, kcal: 436, m: '1/2 confezione' },
          { food: 'biscottiInt', g: 36, kcal: 157, m: '4 biscotti' },
        ],
      },
      {
        id: 'cena', name: 'Cena', time: '21:00', kcal: 874, water: 0.6,
        items: [
          { food: 'norsan', g: 8, kcal: 72, m: '1 cucchiaio' },
          { food: 'mozzarella', g: 125, kcal: 316, m: '1 confezione' },
          { food: 'spinaci', g: 120, kcal: 49, m: '1 piatto', note: 'Bolliti o al vapore' },
          { food: 'pane', g: 150, kcal: 368, m: '3 fette' },
          { food: 'mela', g: 150, kcal: 69, m: '1 frutto medio' },
        ],
      },
      {
        id: 'postcena', name: 'Post-cena', time: '22:00', kcal: 208, water: 0.4,
        items: [
          { food: 'yogurtGreco', g: 150, kcal: 77, m: '1 vasetto grande' },
          { food: 'muesli', g: 30, kcal: 131, m: '2-3 cucchiai' },
        ],
      },
    ],
  },
};

export const PLAN_V1 = {
  id: 'v1',
  title: 'Piano V1',
  date: '12/10/2026',
  author: 'Luigi Pasini, Biologo Nutrizionista',
  // Ordine di default: indice 0 = lunedì … 6 = domenica
  order: ['lun', 'mar', 'mer', 'gio', 'ven', 'sab', 'dom'],
  days,
  shaker: SHAKER_RECIPE,
  tips: [
    'Bere almeno 3-3,5 L di acqua al giorno; 2-3 bicchieri appena alzato.',
    'Dopo l’allenamento: acqua pari a 1,5 volte il peso perso (1 kg perso → 1,5 L).',
    'Verdure sempre, a pranzo e a cena (frutta e verdura 500-700 g al giorno).',
    'Limitare il sale: sostituirlo con spezie, aromi, limone, aceto.',
    'Legumi 3-4 volte a settimana, sempre accompagnati da cereali.',
    'Pesce 2-3 volte a settimana; olio Norsan nei giorni senza pesce.',
    'Yogurt e fermentati 2-6 volte al giorno.',
    'Cotture semplici (vapore, forno, bollitura), olio a crudo.',
    'Limone su carne e pesce per assorbire meglio il ferro.',
    'Caffè fino a 2-4 tazzine al giorno.',
  ],
};
