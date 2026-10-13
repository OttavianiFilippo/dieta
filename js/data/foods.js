// Catalogo alimenti.
//
// unit:  'pz'   → si conta a pezzi (gpp = grammi per pezzo, label = [singolare, plurale])
//        'g'    → si conta in grammi, +/- a passi di `step` (default 50)
//        'pack' → si compra a confezioni da `pack` grammi (o ml se ml: true)
// shelf: 'breve' (compra a ridosso: 2 giorni) | 'media' (4 giorni) | 'lunga' (7 giorni)
// frozen: si può comprare surgelato
// cats:  gruppi della tabella sostituzioni a cui appartiene
// tags:  'pesce' | 'legumi' | 'uova' → usati dai controlli settimanali
// noShop: non va mai in lista spesa (acqua, sgarri, sale)

export const REPARTI = [
  { id: 'frutta-verdura', name: 'Frutta e verdura' },
  { id: 'carne-pesce', name: 'Carne e pesce' },
  { id: 'latticini-uova', name: 'Latticini e uova' },
  { id: 'pane-cereali', name: 'Pane, pasta e cereali' },
  { id: 'scatolame', name: 'Barattoli e scatolame' },
  { id: 'colazione-snack', name: 'Colazione e snack' },
  { id: 'condimenti', name: 'Olio e condimenti' },
  { id: 'surgelati', name: 'Surgelati' },
  { id: 'integratori', name: 'Integratori' },
];

const F = {};
function food(id, def) {
  F[id] = { id, step: 50, cats: [], tags: [], ...def };
}

// ---------- Alimenti del piano ----------
food('yogurt0', { name: 'Yogurt 0% grassi', reparto: 'latticini-uova', unit: 'pz', gpp: 125, label: ['vasetto', 'vasetti'], shelf: 'lunga', cats: ['yogurt'] });
food('yogurtGreco', { name: 'Yogurt greco 0% grassi', reparto: 'latticini-uova', unit: 'pz', gpp: 150, label: ['vasetto grande', 'vasetti grandi'], shelf: 'lunga', cats: ['yogurt'] });
food('muesli', { name: 'Muesli ai cereali', reparto: 'colazione-snack', unit: 'pack', pack: 375, packLabel: 'confezione da 375 g', shelf: 'lunga' });
food('succo', { name: 'Succo di frutta 100%', reparto: 'colazione-snack', unit: 'pack', pack: 1000, ml: true, packLabel: 'brick da 1 L', shelf: 'lunga', cats: ['succo'] });
food('mela', { name: 'Mela', reparto: 'frutta-verdura', unit: 'pz', gpp: 150, label: ['mela', 'mele'], shelf: 'media', cats: ['frutta_fresca'] });
food('pera', { name: 'Pera', reparto: 'frutta-verdura', unit: 'pz', gpp: 150, label: ['pera', 'pere'], shelf: 'media', cats: ['frutta_fresca'] });
food('banana', { name: 'Banana', reparto: 'frutta-verdura', unit: 'pz', gpp: 150, label: ['banana', 'banane'], shelf: 'media', cats: ['frutta_fresca'] });
food('prugna', { name: 'Prugne fresche', reparto: 'frutta-verdura', unit: 'pz', gpp: 60, label: ['prugna', 'prugne'], shelf: 'media', cats: ['frutta_fresca'] });
food('kiwi', { name: 'Kiwi', reparto: 'frutta-verdura', unit: 'pz', gpp: 90, label: ['kiwi', 'kiwi'], shelf: 'media', cats: ['frutta_fresca'] });
food('noci', { name: 'Noci sgusciate', reparto: 'colazione-snack', unit: 'pack', pack: 200, packLabel: 'busta da 200 g', shelf: 'lunga', cats: ['frutta_guscio'] });
food('nocciole', { name: 'Nocciole sgusciate', reparto: 'colazione-snack', unit: 'pack', pack: 100, packLabel: 'busta da 100 g', shelf: 'lunga', cats: ['frutta_guscio'] });
food('olioEvo', { name: "Olio extravergine d'oliva", reparto: 'condimenti', unit: 'pack', pack: 1000, ml: true, packLabel: 'bottiglia da 1 L', shelf: 'lunga', cats: ['olio'] });
food('norsan', { name: 'Olio Omega-3 Total (Norsan)', reparto: 'integratori', unit: 'pack', pack: 200, ml: true, packLabel: 'flacone da 200 ml', shelf: 'lunga' });
food('pasta', { name: 'Pasta', reparto: 'pane-cereali', unit: 'pack', pack: 500, packLabel: 'pacco da 500 g', shelf: 'lunga', cats: ['pasta'] });
food('fagioliBarattolo', { name: 'Fagioli in barattolo', reparto: 'scatolame', unit: 'pz', label: ['barattolo', 'barattoli'], shelf: 'lunga', tags: ['legumi'] });
food('piselliBarattolo', { name: 'Piselli in barattolo', reparto: 'scatolame', unit: 'pz', label: ['barattolo', 'barattoli'], shelf: 'lunga', tags: ['legumi'] });
food('pestoBarattolo', { name: 'Pesto in barattolo', reparto: 'scatolame', unit: 'pz', label: ['barattolo', 'barattoli'], shelf: 'lunga' });
food('raguBarattolo', { name: 'Ragù in barattolo', reparto: 'scatolame', unit: 'pz', label: ['barattolo', 'barattoli'], shelf: 'lunga' });
food('sugoPomodoro', { name: 'Sugo al pomodoro in barattolo', reparto: 'scatolame', unit: 'pz', label: ['barattolo', 'barattoli'], shelf: 'lunga' });
food('tonnoScatola', { name: 'Tonno in scatola', reparto: 'scatolame', unit: 'pz', label: ['scatoletta', 'scatolette'], shelf: 'lunga' });
food('fagiolini', { name: 'Fagiolini', reparto: 'frutta-verdura', unit: 'g', shelf: 'media', frozen: true, cats: ['verdura'] });
food('spinaci', { name: 'Spinaci', reparto: 'frutta-verdura', unit: 'g', shelf: 'media', frozen: true, cats: ['verdura'] });
food('cicoria', { name: 'Cicoria', reparto: 'frutta-verdura', unit: 'g', shelf: 'media', frozen: true, cats: ['verdura'] });
food('carota', { name: 'Carote', reparto: 'frutta-verdura', unit: 'pz', gpp: 40, label: ['carota', 'carote'], shelf: 'media', frozen: true, cats: ['verdura'] });
food('cetriolo', { name: 'Cetriolo', reparto: 'frutta-verdura', unit: 'pz', gpp: 80, label: ['cetriolo', 'cetrioli'], shelf: 'media', cats: ['verdura'] });
food('patata', { name: 'Patate', reparto: 'frutta-verdura', unit: 'pz', gpp: 150, label: ['patata', 'patate'], shelf: 'lunga', cats: ['patate'] });
food('biscottiFC', { name: 'Biscotti frutta e cereali', reparto: 'colazione-snack', unit: 'pack', pack: 300, packLabel: 'confezione da 300 g', shelf: 'lunga', cats: ['forno_dolci', 'dolci_forno'] });
food('biscottiInt', { name: 'Biscotti integrali', reparto: 'colazione-snack', unit: 'pack', pack: 350, packLabel: 'confezione da 350 g', shelf: 'lunga', cats: ['forno_dolci', 'dolci_forno'] });
food('biscottiCioc', { name: 'Biscotti al cioccolato', reparto: 'colazione-snack', unit: 'pack', pack: 350, packLabel: 'confezione da 350 g', shelf: 'lunga', cats: ['forno_dolci', 'dolci_forno'] });
food('branzino', { name: 'Branzino (filetti)', reparto: 'carne-pesce', unit: 'g', shelf: 'breve', frozen: true, cats: ['pesce'], tags: ['pesce'] });
food('merluzzo', { name: 'Merluzzo (filetti)', reparto: 'carne-pesce', unit: 'g', shelf: 'breve', frozen: true, cats: ['pesce'], tags: ['pesce'] });
food('pollo', { name: 'Petto di pollo', reparto: 'carne-pesce', unit: 'g', shelf: 'breve', cats: ['carni_bianche'] });
food('vitello', { name: 'Filetto di vitello', reparto: 'carne-pesce', unit: 'g', shelf: 'breve', cats: ['carni_rosse'] });
food('prosciutto', { name: 'Prosciutto crudo (o speck)', reparto: 'carne-pesce', unit: 'g', shelf: 'breve' });
food('pane', { name: 'Pane integrale', reparto: 'pane-cereali', unit: 'g', shelf: 'media', cats: ['pane'] });
food('uova', { name: 'Uova', reparto: 'latticini-uova', unit: 'pz', gpp: 50, label: ['uovo', 'uova'], shelf: 'lunga', tags: ['uova'] });
food('riso', { name: 'Riso integrale', reparto: 'pane-cereali', unit: 'pack', pack: 1000, packLabel: 'pacco da 1 kg', shelf: 'lunga', cats: ['riso'] });
food('meleSecche', { name: 'Mele essiccate', reparto: 'colazione-snack', unit: 'pack', pack: 90, packLabel: 'confezione da 90 g', shelf: 'lunga', cats: ['frutta_essiccata'] });
food('cioccolato', { name: 'Cioccolato al latte/fondente', reparto: 'colazione-snack', unit: 'pack', pack: 100, packLabel: 'tavoletta da 100 g', shelf: 'lunga' });
food('barretta', { name: 'Barretta ai cereali (Coop)', reparto: 'colazione-snack', unit: 'pz', gpp: 28, label: ['barretta', 'barrette'], shelf: 'lunga' });
food('mozzarella', { name: 'Mozzarella', reparto: 'latticini-uova', unit: 'pz', gpp: 125, label: ['mozzarella', 'mozzarelle'], shelf: 'breve', cats: ['latticini_freschi'] });
food('gelato', { name: 'Gelato alla frutta', reparto: 'surgelati', unit: 'pack', pack: 400, packLabel: 'confezione da 400 g', shelf: 'lunga' });
food('proteine', { name: 'Proteine vegetali in polvere (vaniglia)', reparto: 'integratori', unit: 'pack', pack: 500, packLabel: 'confezione da 500 g', shelf: 'lunga' });
food('acqua', { name: 'Acqua', noShop: true });
food('pizza', { name: 'Pizza margherita', noShop: true });
food('cola', { name: 'Bevanda tipo Cola', noShop: true });

// ---------- Alimenti disponibili come sostituti ----------
// Cereali e derivati
food('paneComune', { name: 'Pane comune', reparto: 'pane-cereali', unit: 'g', shelf: 'media', cats: ['pane'] });
food('paneSegale', { name: 'Pane di segale', reparto: 'pane-cereali', unit: 'g', shelf: 'media', cats: ['pane'] });
food('fetteBiscottate', { name: 'Fette biscottate integrali', reparto: 'colazione-snack', unit: 'pack', pack: 300, packLabel: 'confezione da 300 g', shelf: 'lunga', cats: ['sostituti_pane'] });
food('gallette', { name: 'Gallette di riso', reparto: 'pane-cereali', unit: 'pack', pack: 130, packLabel: 'confezione da 130 g', shelf: 'lunga', cats: ['sostituti_pane'] });
food('crackers', { name: 'Crackers integrali', reparto: 'pane-cereali', unit: 'pack', pack: 250, packLabel: 'confezione da 250 g', shelf: 'lunga', cats: ['sostituti_pane'] });
food('fiocchiAvena', { name: "Fiocchi d'avena", reparto: 'colazione-snack', unit: 'pack', pack: 500, packLabel: 'confezione da 500 g', shelf: 'lunga', cats: ['cereali_colazione'] });
food('farroSoffiato', { name: 'Farro soffiato', reparto: 'colazione-snack', unit: 'pack', pack: 250, packLabel: 'confezione da 250 g', shelf: 'lunga', cats: ['cereali_colazione'] });
food('cornFlakes', { name: 'Fiocchi di mais (corn flakes)', reparto: 'colazione-snack', unit: 'pack', pack: 375, packLabel: 'confezione da 375 g', shelf: 'lunga', cats: ['mais_fiocchi'] });
food('pastaIntegrale', { name: 'Pasta integrale', reparto: 'pane-cereali', unit: 'pack', pack: 500, packLabel: 'pacco da 500 g', shelf: 'lunga', cats: ['pasta'] });
food('couscous', { name: 'Couscous', reparto: 'pane-cereali', unit: 'pack', pack: 500, packLabel: 'confezione da 500 g', shelf: 'lunga', cats: ['pasta'] });
food('farro', { name: 'Farro', reparto: 'pane-cereali', unit: 'pack', pack: 500, packLabel: 'confezione da 500 g', shelf: 'lunga', cats: ['pasta'] });
food('orzo', { name: 'Orzo', reparto: 'pane-cereali', unit: 'pack', pack: 500, packLabel: 'confezione da 500 g', shelf: 'lunga', cats: ['pasta'] });
food('risoBianco', { name: 'Riso', reparto: 'pane-cereali', unit: 'pack', pack: 1000, packLabel: 'pacco da 1 kg', shelf: 'lunga', cats: ['riso'] });
food('risoBasmati', { name: 'Riso basmati', reparto: 'pane-cereali', unit: 'pack', pack: 1000, packLabel: 'pacco da 1 kg', shelf: 'lunga', cats: ['riso'] });
food('quinoa', { name: 'Quinoa', reparto: 'pane-cereali', unit: 'pack', pack: 500, packLabel: 'confezione da 500 g', shelf: 'lunga', cats: ['quinoa'] });
food('granoSaraceno', { name: 'Grano saraceno', reparto: 'pane-cereali', unit: 'pack', pack: 500, packLabel: 'confezione da 500 g', shelf: 'lunga', cats: ['quinoa'] });
food('maisScatola', { name: 'Mais in scatola', reparto: 'scatolame', unit: 'pz', gpp: 140, label: ['lattina', 'lattine'], shelf: 'lunga', cats: ['mais_scatola'] });
food('brioche', { name: 'Brioche vuota', reparto: 'colazione-snack', unit: 'pz', gpp: 40, label: ['brioche', 'brioche'], shelf: 'lunga', cats: ['forno_dolci'] });
food('plumcake', { name: 'Plumcake', reparto: 'colazione-snack', unit: 'pz', gpp: 35, label: ['plumcake', 'plumcake'], shelf: 'lunga', cats: ['dolci_forno'] });
// Frutta
food('arancia', { name: 'Arancia', reparto: 'frutta-verdura', unit: 'pz', gpp: 200, label: ['arancia', 'arance'], shelf: 'media', cats: ['frutta_fresca'] });
food('mandarino', { name: 'Mandarini', reparto: 'frutta-verdura', unit: 'pz', gpp: 80, label: ['mandarino', 'mandarini'], shelf: 'media', cats: ['frutta_fresca'] });
food('pesca', { name: 'Pesca', reparto: 'frutta-verdura', unit: 'pz', gpp: 150, label: ['pesca', 'pesche'], shelf: 'media', cats: ['frutta_fresca'] });
food('albicocca', { name: 'Albicocche', reparto: 'frutta-verdura', unit: 'pz', gpp: 50, label: ['albicocca', 'albicocche'], shelf: 'media', cats: ['frutta_fresca'] });
food('fragole', { name: 'Fragole', reparto: 'frutta-verdura', unit: 'g', shelf: 'breve', cats: ['frutta_fresca'] });
food('uva', { name: 'Uva', reparto: 'frutta-verdura', unit: 'g', shelf: 'media', cats: ['frutta_fresca'] });
food('albicoccheSecche', { name: 'Albicocche secche', reparto: 'colazione-snack', unit: 'pack', pack: 200, packLabel: 'confezione da 200 g', shelf: 'lunga', cats: ['frutta_essiccata'] });
food('prugneSecche', { name: 'Prugne secche', reparto: 'colazione-snack', unit: 'pack', pack: 200, packLabel: 'confezione da 200 g', shelf: 'lunga', cats: ['frutta_essiccata'] });
food('uvetta', { name: 'Uvetta', reparto: 'colazione-snack', unit: 'pack', pack: 200, packLabel: 'confezione da 200 g', shelf: 'lunga', cats: ['frutta_essiccata'] });
food('mandorle', { name: 'Mandorle', reparto: 'colazione-snack', unit: 'pack', pack: 200, packLabel: 'busta da 200 g', shelf: 'lunga', cats: ['frutta_guscio'] });
food('anacardi', { name: 'Anacardi', reparto: 'colazione-snack', unit: 'pack', pack: 150, packLabel: 'busta da 150 g', shelf: 'lunga', cats: ['frutta_guscio'] });
food('pistacchi', { name: 'Pistacchi sgusciati', reparto: 'colazione-snack', unit: 'pack', pack: 100, packLabel: 'busta da 100 g', shelf: 'lunga', cats: ['frutta_guscio'] });
// Verdura
food('zucchina', { name: 'Zucchine', reparto: 'frutta-verdura', unit: 'pz', gpp: 150, label: ['zucchina', 'zucchine'], shelf: 'media', frozen: true, cats: ['verdura'] });
food('broccoli', { name: 'Broccoli', reparto: 'frutta-verdura', unit: 'g', shelf: 'media', frozen: true, cats: ['verdura'] });
food('cavolfiore', { name: 'Cavolfiore', reparto: 'frutta-verdura', unit: 'g', shelf: 'media', frozen: true, cats: ['verdura'] });
food('bietole', { name: 'Bietole', reparto: 'frutta-verdura', unit: 'g', shelf: 'media', frozen: true, cats: ['verdura'] });
food('insalata', { name: 'Insalata', reparto: 'frutta-verdura', unit: 'g', shelf: 'media', cats: ['verdura'] });
food('pomodoro', { name: 'Pomodori', reparto: 'frutta-verdura', unit: 'pz', gpp: 100, label: ['pomodoro', 'pomodori'], shelf: 'media', cats: ['verdura'] });
food('finocchio', { name: 'Finocchi', reparto: 'frutta-verdura', unit: 'pz', gpp: 200, label: ['finocchio', 'finocchi'], shelf: 'media', cats: ['verdura'] });
food('peperone', { name: 'Peperoni', reparto: 'frutta-verdura', unit: 'pz', gpp: 150, label: ['peperone', 'peperoni'], shelf: 'media', frozen: true, cats: ['verdura'] });
food('melanzana', { name: 'Melanzane', reparto: 'frutta-verdura', unit: 'pz', gpp: 250, label: ['melanzana', 'melanzane'], shelf: 'media', frozen: true, cats: ['verdura'] });
// Carne e pesce
food('tacchino', { name: 'Petto di tacchino', reparto: 'carne-pesce', unit: 'g', shelf: 'breve', cats: ['carni_bianche'] });
food('coniglio', { name: 'Coniglio', reparto: 'carne-pesce', unit: 'g', shelf: 'breve', cats: ['carni_bianche'] });
food('manzo', { name: 'Manzo magro (fesa)', reparto: 'carne-pesce', unit: 'g', shelf: 'breve', cats: ['carni_rosse'] });
food('lonza', { name: 'Lonza di maiale', reparto: 'carne-pesce', unit: 'g', shelf: 'breve', cats: ['carni_rosse'] });
food('orata', { name: 'Orata (filetti)', reparto: 'carne-pesce', unit: 'g', shelf: 'breve', frozen: true, cats: ['pesce'], tags: ['pesce'] });
food('salmone', { name: 'Salmone', reparto: 'carne-pesce', unit: 'g', shelf: 'breve', frozen: true, cats: ['pesce'], tags: ['pesce'] });
food('platessa', { name: 'Platessa (filetti)', reparto: 'carne-pesce', unit: 'g', shelf: 'breve', frozen: true, cats: ['pesce'], tags: ['pesce'] });
food('gamberi', { name: 'Gamberi', reparto: 'carne-pesce', unit: 'g', shelf: 'breve', frozen: true, cats: ['pesce'], tags: ['pesce'] });
food('lenticchie', { name: 'Lenticchie secche', reparto: 'pane-cereali', unit: 'pack', pack: 500, packLabel: 'confezione da 500 g', shelf: 'lunga', cats: ['legumi'], tags: ['legumi'] });
food('ceci', { name: 'Ceci secchi', reparto: 'pane-cereali', unit: 'pack', pack: 500, packLabel: 'confezione da 500 g', shelf: 'lunga', cats: ['legumi'], tags: ['legumi'] });
food('fagioliSecchi', { name: 'Fagioli secchi', reparto: 'pane-cereali', unit: 'pack', pack: 500, packLabel: 'confezione da 500 g', shelf: 'lunga', cats: ['legumi'], tags: ['legumi'] });
// Latte e derivati
food('ricotta', { name: 'Ricotta', reparto: 'latticini-uova', unit: 'pack', pack: 250, packLabel: 'confezione da 250 g', shelf: 'breve', cats: ['latticini_freschi'] });
food('stracchino', { name: 'Stracchino', reparto: 'latticini-uova', unit: 'pack', pack: 100, packLabel: 'confezione da 100 g', shelf: 'breve', cats: ['latticini_freschi'] });
food('latte', { name: 'Latte intero', reparto: 'latticini-uova', unit: 'pack', pack: 1000, ml: true, packLabel: 'bottiglia da 1 L', shelf: 'media', cats: ['latte'] });
food('kefir', { name: 'Kefir di latte', reparto: 'latticini-uova', unit: 'pack', pack: 500, ml: true, packLabel: 'bottiglia da 500 ml', shelf: 'media', cats: ['kefir'] });
// Condimenti
food('olioSemi', { name: 'Olio di semi (arachide/mais/girasole)', reparto: 'condimenti', unit: 'pack', pack: 1000, ml: true, packLabel: 'bottiglia da 1 L', shelf: 'lunga', cats: ['olio'] });

export const FOODS = F;

export function getFood(id) {
  const f = F[id];
  if (!f) throw new Error(`Alimento sconosciuto: ${id}`);
  return f;
}
