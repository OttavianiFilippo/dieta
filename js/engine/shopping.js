// Lista della spesa.
//
// Per ogni alimento guardo il fabbisogno dei prossimi giorni (finestra in base alla durata):
//   lunga  → guarda 7 giorni, propone se la scorta copre meno di 4 giorni (o è a zero)
//   media  → guarda 4 giorni, propone se copre meno di 2 giorni (o è a zero)
//   breve  → guarda 2 giorni (oggi e domani): il fresco si compra a ridosso
// Quando propone, la quantità copre tutta la finestra.

import { FOODS, REPARTI, getFood } from '../data/foods.js';
import { toKey, addDays } from './dates.js';
import { effectiveDay, mealTime, mealIngredients } from './plan.js';
import { stockOf, addStock } from './pantry.js';
import { baseToShop, shopToBase, gramsToBase, fmtShop } from './units.js';

const EPS = 1e-6;
export const WINDOWS = {
  lunga: { look: 7, low: 4 },
  media: { look: 4, low: 2 },
  breve: { look: 2, low: 2 },
};

// Fabbisogni futuri: foodId → [{ dateKey, offset, meal, qty }]
export function upcomingNeeds(state, now, days = 7) {
  const today = toKey(now);
  const needs = {};
  for (let offset = 0; offset < days; offset++) {
    const key = addDays(today, offset);
    const day = effectiveDay(state, key);
    for (const meal of day.meals) {
      if (meal.off || mealTime(key, meal) <= now) continue;
      for (const ing of mealIngredients(meal)) {
        (needs[ing.food] ||= []).push({ dateKey: key, offset, meal: meal.name, qty: ing.qty });
      }
    }
  }
  return needs;
}

// Giorni coperti dalla scorta: offset del primo fabbisogno non coperto (Infinity se tutto coperto)
function coveredDays(entries, stock) {
  let cum = 0;
  for (const e of entries) {
    cum += e.qty;
    if (cum > stock + EPS) return e.offset;
  }
  return Infinity;
}

const repartoOrder = Object.fromEntries(REPARTI.map((r, i) => [r.id, i]));

export function shoppingList(state, now) {
  const needs = upcomingNeeds(state, now, 7);
  const items = [];
  for (const [id, all] of Object.entries(needs)) {
    const food = getFood(id);
    const w = WINDOWS[food.shelf] || WINDOWS.lunga;
    const entries = all.filter((e) => e.offset < w.look);
    if (!entries.length) continue;
    const stock = stockOf(state, id);
    const cover = coveredDays(entries, stock);
    if (cover === Infinity) continue;
    if (!(cover < w.low || stock <= EPS)) continue;
    const need = entries.reduce((s, e) => s + e.qty, 0);
    const buyBase = need - stock;
    const suggested = baseToShop(food, buyBase);
    if (suggested <= 0) continue;
    const uncovered = [];
    let cum = 0;
    for (const e of entries) {
      cum += e.qty;
      if (cum > stock + EPS) uncovered.push(e);
    }
    items.push({ food, suggested, buyBase, needs: uncovered, firstNeed: uncovered[0] });
  }
  items.sort((a, b) =>
    (repartoOrder[a.food.reparto] ?? 99) - (repartoOrder[b.food.reparto] ?? 99) ||
    a.food.name.localeCompare(b.food.name, 'it'));
  return items;
}

// Freschi in arrivo (oltre la finestra di oggi): da comprare il giorno prima
export function upcomingFresh(state, now, listIds) {
  const needs = upcomingNeeds(state, now, 7);
  const out = [];
  for (const [id, entries] of Object.entries(needs)) {
    const food = getFood(id);
    if (food.shelf !== 'breve' || listIds.has(id)) continue;
    const stock = stockOf(state, id);
    let cum = 0;
    for (const e of entries) {
      cum += e.qty;
      if (cum > stock + EPS) {
        out.push({ food, need: e, buyFrom: addDays(e.dateKey, -1) });
        break;
      }
    }
  }
  out.sort((a, b) => (a.need.dateKey < b.need.dateKey ? -1 : a.need.dateKey > b.need.dateKey ? 1 : 0));
  return out;
}

// Stato della bozza (spunte e quantità mentre sei al supermercato)
export function draftFor(state, item) {
  const d = state.shopDraft[item.food.id] || {};
  return {
    checked: !!d.checked,
    qty: d.qty ?? item.suggested,
    frozen: !!d.frozen,
    frozenG: d.frozenG ?? Math.max(100, Math.ceil(gramsNeeded(item) / 100) * 100),
  };
}

function gramsNeeded(item) {
  const f = item.food;
  return f.unit === 'pz' && f.gpp ? item.buyBase * f.gpp : item.buyBase;
}

export function updateDraft(state, foodId, patch) {
  state.shopDraft[foodId] = { ...(state.shopDraft[foodId] || {}), ...patch };
}

// Conferma: le voci spuntate entrano in dispensa e nello storico.
export function confirmShopping(state, now, list) {
  const bought = [];
  for (const item of list) {
    const d = draftFor(state, item);
    if (!d.checked) continue;
    const f = item.food;
    if (d.frozen && f.frozen) {
      addStock(state, f.id, gramsToBase(f, d.frozenG), true);
      bought.push({ food: f.id, label: `${d.frozenG} g surgelato` });
    } else {
      if (d.qty <= 0) continue;
      addStock(state, f.id, shopToBase(f, d.qty));
      bought.push({ food: f.id, label: fmtShop(f, d.qty) });
    }
    delete state.shopDraft[f.id];
  }
  if (bought.length) state.purchases.unshift({ at: now.toISOString(), items: bought });
  state.purchases = state.purchases.slice(0, 60);
  return bought.length;
}

// "Ce l'ho già": la scorta copre il fabbisogno, la voce sparisce.
export function alreadyHave(state, item) {
  addStock(state, item.food.id, item.buyBase);
  delete state.shopDraft[item.food.id];
}

export function pruneDraft(state, list) {
  const ids = new Set(list.map((i) => i.food.id));
  for (const id of Object.keys(state.shopDraft)) if (!ids.has(id)) delete state.shopDraft[id];
}

export function allFoods() {
  return Object.values(FOODS).filter((f) => !f.noShop);
}
