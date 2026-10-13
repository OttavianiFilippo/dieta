// Test del motore: node --test tests/
import test from 'node:test';
import assert from 'node:assert/strict';

import { FOODS, getFood } from '../js/data/foods.js';
import { PLAN_V1 } from '../js/data/plans/v1.js';
import { defaultState } from '../js/store.js';
import { effectiveDay, swapDay, planDayIdFor, mealIngredients } from '../js/engine/plan.js';
import { substitutionOptions, makeSub, scale } from '../js/engine/subs.js';
import { processConsumption, stockOf, addStock, setMealOff, withConsumptionDelta } from '../js/engine/pantry.js';
import { shoppingList, confirmShopping, updateDraft, upcomingFresh } from '../js/engine/shopping.js';
import { weekChecks } from '../js/engine/checks.js';
import { weekKey } from '../js/engine/dates.js';

const MON = '2026-10-12'; // lunedì

function freshState() {
  const s = defaultState();
  globalThis.localStorage = undefined;
  return s;
}

test('il piano usa solo alimenti del catalogo', () => {
  for (const day of Object.values(PLAN_V1.days)) {
    for (const meal of day.meals) {
      for (const it of meal.items) {
        if (it.food) assert.ok(FOODS[it.food], `manca ${it.food}`);
        for (const e of it.extra || []) assert.ok(FOODS[e.food], `manca ${e.food}`);
      }
    }
  }
});

test('le kcal degli alimenti tornano con i totali di pasto e giorno del PDF', () => {
  for (const [id, day] of Object.entries(PLAN_V1.days)) {
    let dayKcal = 0;
    for (const meal of day.meals) {
      const sum = meal.items.reduce((s, it) => s + (it.kcal || 0), 0);
      assert.ok(Math.abs(sum - meal.kcal) <= 2, `${id}/${meal.id}: voci ${sum} vs pasto ${meal.kcal}`);
      dayKcal += meal.kcal;
    }
    assert.ok(Math.abs(dayKcal - day.kcal) <= 3, `${id}: pasti ${dayKcal} vs giorno ${day.kcal}`);
  }
});

test('sostituzioni secondo la tabella', () => {
  assert.equal(scale(150, 0.65), 100); // pesce → carne
  assert.equal(scale(120, 0.75), 90); // pasta → riso
  assert.equal(scale(150, 0.2), 30); // frutta fresca → essiccata
  const opts = substitutionOptions('merluzzo', 150);
  const carne = opts.find((g) => g.toCat === 'carni_bianche');
  assert.equal(carne.grams, 100);
  assert.ok(carne.note.includes('proteico'));
  assert.deepEqual(substitutionOptions('muesli', 30), []); // fuori tabella
  assert.deepEqual(substitutionOptions('norsan', 8), []);
});

test('sostituzione settimanale applicata a tutte le occorrenze della settimana', () => {
  const s = freshState();
  const g = substitutionOptions('mela', 150).find((x) => x.toCat === 'frutta_fresca');
  s.subs.week[weekKey(MON)] = { mela: makeSub('mela', 'arancia', g) };
  const mon = effectiveDay(s, MON);
  const sp = mon.meals.find((m) => m.id === 'spuntino1');
  assert.equal(sp.items[0].food, 'arancia');
  assert.equal(sp.items[0].orig.food, 'mela');
  const nextMon = effectiveDay(s, '2026-10-19');
  assert.equal(nextMon.meals.find((m) => m.id === 'spuntino1').items[0].food, 'mela');
});

test('piatto composto: si sostituisce la base, il barattolo resta', () => {
  const s = freshState();
  const g = substitutionOptions('pasta', 120).find((x) => x.toCat === 'riso');
  s.subs.always.pasta = makeSub('pasta', 'riso', g);
  const pranzo = effectiveDay(s, MON).meals.find((m) => m.id === 'pranzo');
  const dish = pranzo.items[1];
  assert.equal(dish.name, 'Pasta e fagioli');
  assert.equal(dish.food, 'riso');
  assert.equal(dish.g, 90);
  const ings = mealIngredients(pranzo);
  assert.ok(ings.some((i) => i.food === 'fagioliBarattolo' && i.qty === 1));
});

test('scambio giorni: la settimana resta completa', () => {
  const s = freshState();
  swapDay(s, '2026-10-13', 'lun'); // martedì diventa palestra
  assert.equal(planDayIdFor(s, '2026-10-13'), 'lun');
  assert.equal(planDayIdFor(s, '2026-10-12'), 'mar');
  swapDay(s, '2026-10-13', 'mar');
  assert.equal(s.assignments[MON], undefined); // tornato al default
});

test('prima spesa con dispensa vuota: lunedì mattina', () => {
  const s = freshState();
  const now = new Date(2026, 9, 12, 7, 0);
  const list = shoppingList(s, now);
  const byId = Object.fromEntries(list.map((i) => [i.food.id, i]));
  // Freschi solo per oggi e domani
  assert.ok(byId.branzino, 'branzino di lunedì');
  assert.equal(byId.branzino.suggested, 150);
  assert.ok(!byId.merluzzo, 'il merluzzo di giovedì non va comprato lunedì');
  assert.ok(!byId.vitello);
  assert.ok(!byId.mozzarella);
  // Lunga conservazione: tutta la settimana
  assert.equal(byId.yogurt0.suggested, 8); // 7 colazioni + post-pizza
  assert.equal(byId.yogurtGreco.suggested, 6);
  assert.equal(byId.pasta.suggested, 2); // 6 × 120 g = 720 g → 2 pacchi da 500
  assert.equal(byId.fagioliBarattolo.suggested, 2);
  assert.ok(byId.gelato, 'il gelato di domenica entra nella spesa settimanale');
  assert.ok(!byId.pizza && !byId.cola && !byId.acqua);
  // Freschi in arrivo
  const fresh = upcomingFresh(s, now, new Set(list.map((i) => i.food.id)));
  const merluzzo = fresh.find((f) => f.food.id === 'merluzzo');
  assert.equal(merluzzo.buyFrom, '2026-10-14'); // da mercoledì
});

test('conferma spesa e consumo automatico', () => {
  const s = freshState();
  const t0 = new Date(2026, 9, 12, 7, 0);
  processConsumption(s, t0); // primo avvio: nessun consumo
  const list = shoppingList(s, t0);
  for (const it of list) updateDraft(s, it.food.id, { checked: true });
  confirmShopping(s, t0, list);
  assert.equal(stockOf(s, 'yogurt0'), 8);
  assert.equal(s.purchases.length, 1);
  // Dopo la colazione delle 8
  processConsumption(s, new Date(2026, 9, 12, 8, 30));
  assert.equal(stockOf(s, 'yogurt0'), 7);
  // Fine giornata: branzino consumato
  processConsumption(s, new Date(2026, 9, 12, 23, 0));
  assert.equal(stockOf(s, 'branzino'), 0);
  // La lista non ripropone le cose già coperte
  const after = shoppingList(s, new Date(2026, 9, 12, 23, 0));
  assert.ok(!after.find((i) => i.food.id === 'yogurt0'));
});

test('pasto fuori piano dopo il consumo: la dispensa viene ricaricata', () => {
  const s = freshState();
  processConsumption(s, new Date(2026, 9, 12, 7, 0));
  addStock(s, 'banana', 3);
  processConsumption(s, new Date(2026, 9, 12, 18, 0));
  assert.equal(stockOf(s, 'banana'), 2);
  setMealOff(s, MON, 'merenda', true);
  assert.equal(stockOf(s, 'banana'), 3);
  setMealOff(s, MON, 'merenda', false);
  assert.equal(stockOf(s, 'banana'), 2);
});

test('surgelato: la scorta copre più settimane', () => {
  const s = freshState();
  const now = new Date(2026, 9, 14, 9, 0); // mercoledì
  processConsumption(s, now);
  const list = shoppingList(s, now);
  const merluzzo = list.find((i) => i.food.id === 'merluzzo');
  assert.ok(merluzzo, 'mercoledì propone il merluzzo di giovedì');
  updateDraft(s, 'merluzzo', { checked: true, frozen: true, frozenG: 600 });
  confirmShopping(s, now, list);
  assert.equal(stockOf(s, 'merluzzo'), 600);
  // Tre settimane dopo, il mercoledì, non serve ancora ricomprarlo
  const later = new Date(2026, 9, 28, 9, 0);
  processConsumption(s, later);
  assert.equal(stockOf(s, 'merluzzo'), 300); // 600 − giovedì 15 e 22 ottobre (2 × 150)
  assert.ok(!shoppingList(s, later).find((i) => i.food.id === 'merluzzo'));
});

test('controlli settimanali del piano base', () => {
  const s = freshState();
  const checks = Object.fromEntries(weekChecks(s, MON).map((c) => [c.id, c]));
  assert.equal(checks.pesce.value, 2);
  assert.equal(checks.legumi.value, 3);
  assert.equal(checks.uova.value, 2);
});

test('alimenti a pezzi usano le misure del nutrizionista', () => {
  assert.equal(getFood('mela').gpp, 150);
  assert.equal(getFood('kiwi').gpp * 2, 180);
  assert.equal(getFood('prugna').gpp * 2, 120);
  assert.equal(getFood('cetriolo').gpp, 80);
});

test('backup: esporta e reimporta lo stesso stato', async () => {
  const { exportBackup, parseBackup } = await import('../js/store.js');
  const s = freshState();
  addStock(s, 'pasta', 500);
  s.assignments[MON] = ['mar', 'lun', 'mer', 'gio', 'ven', 'sab', 'dom'];
  const back = parseBackup(exportBackup(s));
  assert.equal(stockOf(back, 'pasta'), 500);
  assert.deepEqual(back.assignments, s.assignments);
  assert.throws(() => parseBackup('{"ciao":1}'));
});

test('giorno fuori piano: niente spesa per quel giorno', async () => {
  const { setDayOff } = await import('../js/engine/pantry.js');
  const s = freshState();
  const now = new Date(2026, 9, 12, 7, 0);
  processConsumption(s, now);
  setDayOff(s, MON, true);
  const list = shoppingList(s, now);
  assert.ok(!list.find((i) => i.food.id === 'branzino'), 'il branzino di lunedì non serve più');
});
