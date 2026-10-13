// Tabelle "Gruppi alimentari e sostituzioni" (Luigi Pasini).
// Regola: grammi sostituto = grammi originale × R.
// In caso di discrepanza tra testo e tabella del PDF vale la tabella.

export const CATEGORIES = {
  cereali_colazione: 'Cereali da colazione (non muesli)',
  quinoa: 'Grano saraceno e quinoa',
  mais_fiocchi: 'Fiocchi di mais',
  mais_scatola: 'Mais in scatola',
  pane: 'Pane',
  sostituti_pane: 'Sostituti del pane',
  pasta: 'Pasta, couscous, farro, orzo',
  riso: 'Riso',
  patate: 'Patate',
  forno_dolci: 'Prodotti da forno dolci',
  dolci_forno: 'Dolci da forno',
  frutta_fresca: 'Frutta fresca',
  frutta_essiccata: 'Frutta essiccata',
  frutta_guscio: 'Frutta secca in guscio',
  succo: 'Succo di frutta 100%',
  verdura: 'Verdura e ortaggi (crudi o cotti)',
  carni_bianche: 'Carni bianche',
  carni_rosse: 'Carni rosse',
  pesce: 'Pesce e crostacei',
  legumi: 'Legumi secchi',
  latticini_freschi: 'Latticini freschi',
  latte: 'Latte',
  yogurt: 'Yogurt',
  kefir: 'Kefir',
  olio: 'Olii vegetali',
};

// Per ogni gruppo di partenza: le sostituzioni ammesse.
// to: gruppo di arrivo ('same' = stesso gruppo), r: rapporto R,
// plus: secondo alimento da aggiungere (es. legumi → carne + pane).
export const TABLE = {
  cereali_colazione: [
    { to: 'pane', r: 1.5 },
    { to: 'sostituti_pane', r: 1 },
    { to: 'mais_fiocchi', r: 1 },
  ],
  quinoa: [
    { to: 'same', r: 1 },
    { to: 'pasta', r: 1 },
  ],
  mais_fiocchi: [
    { to: 'sostituti_pane', r: 1 },
    { to: 'cereali_colazione', r: 1 },
    { to: 'pane', r: 1.5 },
  ],
  mais_scatola: [
    { to: 'riso', r: 0.3 },
    { to: 'patate', r: 1.4 },
  ],
  pane: [
    { to: 'pasta', r: 0.8 },
    { to: 'sostituti_pane', r: 0.7 },
    { to: 'riso', r: 0.6 },
    { to: 'patate', r: 2.4 },
  ],
  pasta: [
    { to: 'same', r: 1 },
    { to: 'pane', r: 1.3 },
    { to: 'riso', r: 0.75 },
    { to: 'patate', r: 3 },
  ],
  patate: [
    { to: 'riso', r: 0.25 },
    { to: 'mais_scatola', r: 0.7 },
    { to: 'pane', r: 0.4 },
  ],
  forno_dolci: [
    { to: 'sostituti_pane', r: 1.3 },
    { to: 'cereali_colazione', r: 1.3 },
  ],
  riso: [
    { to: 'mais_scatola', r: 3 },
    { to: 'patate', r: 4 },
    { to: 'pane', r: 1.6 },
  ],
  sostituti_pane: [
    { to: 'same', r: 1 },
    { to: 'pane', r: 1.5 },
    { to: 'cereali_colazione', r: 1 },
  ],
  frutta_essiccata: [
    { to: 'same', r: 1 },
    { to: 'frutta_fresca', r: 5 },
  ],
  frutta_fresca: [
    { to: 'same', r: 1 },
    { to: 'frutta_essiccata', r: 0.2 },
    { to: 'succo', r: 1 },
  ],
  frutta_guscio: [{ to: 'same', r: 1 }],
  succo: [{ to: 'frutta_fresca', r: 1 }],
  verdura: [{ to: 'same', r: 1 }],
  carni_bianche: [
    { to: 'same', r: 1 },
    { to: 'pesce', r: 1.5 },
    { to: 'carni_rosse', r: 1 },
  ],
  carni_rosse: [
    { to: 'same', r: 1 },
    { to: 'carni_bianche', r: 1 },
    { to: 'pesce', r: 1.5 },
  ],
  legumi: [
    { to: 'same', r: 1 },
    { to: 'carni_bianche', r: 1, plus: { food: 'pane', r: 0.7 } },
    { to: 'carni_rosse', r: 1, plus: { food: 'pane', r: 0.7 } },
  ],
  pesce: [
    { to: 'same', r: 1 },
    { to: 'carni_bianche', r: 0.65 },
    { to: 'carni_rosse', r: 0.65 },
  ],
  latticini_freschi: [{ to: 'same', r: 1 }],
  latte: [
    { to: 'yogurt', r: 1 },
    { to: 'kefir', r: 1 },
  ],
  yogurt: [
    { to: 'latte', r: 1 },
    { to: 'kefir', r: 1 },
  ],
  dolci_forno: [{ to: 'same', r: 1 }],
  olio: [{ to: 'same', r: 1 }],
};

// Note del nutrizionista mostrate quando si sceglie una sostituzione.
// Chiave: "da>a" oppure "da>*" (qualsiasi destinazione) oppure "*>a".
export const NOTES = {
  'pesce>carni_bianche': 'La sostituzione del pesce con la carne vale solo dal punto di vista proteico: il pesce porta omega-3 che la carne non ha.',
  'pesce>carni_rosse': 'La sostituzione del pesce con la carne vale solo dal punto di vista proteico: il pesce porta omega-3 che la carne non ha.',
  'pasta>riso': 'Il riso non è un vero sostituto della pasta: ha più carboidrati e meno proteine e fibre. Indicato con carne o pesce.',
  'legumi>carni_bianche': 'I legumi sono da privilegiare come fonte proteica principale.',
  'legumi>carni_rosse': 'I legumi sono da privilegiare come fonte proteica principale.',
  'verdura>*': 'La verdura si può aumentare a piacere, mantenendo invariata la quantità di olio.',
  'olio>*': "Preferire sempre l'olio extravergine d'oliva.",
  '*>carni_rosse': 'Tra le carni preferire quelle magre (filetto di vitello, petto di pollo).',
};
