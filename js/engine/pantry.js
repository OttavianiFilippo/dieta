// Dispensa virtuale: acquisti in entrata, pasti consumati in uscita.

import { toKey, addDays, weekDates, weekKey } from './dates.js';
import { effectiveDay, mealTime, mealIngredients } from './plan.js';

const EPS = 1e-6;

export function stockOf(state, id) {
  const p = state.pantry[id];
  return p ? p.qty + p.frozen : 0;
}

export function frozenOf(state, id) {
  const p = state.pantry[id];
  return p ? p.frozen : 0;
}

function entry(state, id) {
  if (!state.pantry[id]) state.pantry[id] = { qty: 0, frozen: 0 };
  return state.pantry[id];
}

// Gli alimenti restano in dispensa anche a zero: li elimina solo l'utente.
function clamp(state, id) {
  const p = state.pantry[id];
  if (!p) return;
  if (p.qty < EPS) p.qty = 0;
  if (p.frozen < EPS) p.frozen = 0;
}

export function removeFood(state, id) {
  delete state.pantry[id];
}

export function addStock(state, id, qty, frozen = false) {
  if (qty <= 0) return;
  const p = entry(state, id);
  if (frozen) p.frozen += qty;
  else p.qty += qty;
}

// Scala prima il fresco (che scade), poi il surgelato.
export function deductStock(state, id, qty) {
  const p = state.pantry[id];
  if (!p || qty <= 0) return;
  const fromFresh = Math.min(p.qty, qty);
  p.qty -= fromFresh;
  p.frozen = Math.max(0, p.frozen - (qty - fromFresh));
  clamp(state, id);
}

// Modifica manuale del totale
export function setStock(state, id, total) {
  entry(state, id);
  const cur = stockOf(state, id);
  if (total > cur) addStock(state, id, total - cur);
  else deductStock(state, id, cur - total);
}

// Scala dalla dispensa i pasti il cui orario è passato dall'ultimo controllo.
export function processConsumption(state, now) {
  if (!state.lastProcessed) {
    state.lastProcessed = now.toISOString();
    return 0;
  }
  let last = new Date(state.lastProcessed);
  if (now <= last) return 0;
  const minStart = new Date(now.getTime() - 60 * 86400000);
  if (last < minStart) last = minStart;
  let count = 0;
  const endKey = toKey(now);
  for (let key = toKey(last); key <= endKey; key = addDays(key, 1)) {
    const day = effectiveDay(state, key);
    for (const meal of day.meals) {
      const t = mealTime(key, meal);
      if (t > last && t <= now && !meal.off) {
        for (const ing of mealIngredients(meal)) deductStock(state, ing.food, ing.qty);
        count++;
      }
    }
  }
  state.lastProcessed = now.toISOString();
  return count;
}

// Quanto risulta già consumato (pasti già scalati) nelle date indicate
function consumedMap(state, dateKeys) {
  const map = {};
  if (!state.lastProcessed) return map;
  const last = new Date(state.lastProcessed);
  for (const key of dateKeys) {
    const day = effectiveDay(state, key);
    for (const meal of day.meals) {
      if (mealTime(key, meal) > last) continue;
      for (const ing of mealIngredients(meal)) map[ing.food] = (map[ing.food] || 0) + ing.qty;
    }
  }
  return map;
}

// Esegue una modifica al piano (fuori piano, scambio, sostituzione) e
// riallinea la dispensa per i pasti già scalati nelle date coinvolte.
export function withConsumptionDelta(state, dateKeys, mutate) {
  const before = consumedMap(state, dateKeys);
  mutate();
  const after = consumedMap(state, dateKeys);
  const ids = new Set([...Object.keys(before), ...Object.keys(after)]);
  for (const id of ids) {
    const delta = (after[id] || 0) - (before[id] || 0);
    if (delta > EPS) deductStock(state, id, delta);
    else if (delta < -EPS) addStock(state, id, -delta);
  }
}

export function setMealOff(state, dateKey, mealId, off) {
  withConsumptionDelta(state, [dateKey], () => {
    const k = `${dateKey}|${mealId}`;
    if (off) state.offPlan.meals[k] = true;
    else delete state.offPlan.meals[k];
  });
}

export function setDayOff(state, dateKey, off) {
  withConsumptionDelta(state, [dateKey], () => {
    if (off) state.offPlan.days[dateKey] = true;
    else delete state.offPlan.days[dateKey];
  });
}

export function datesOfWeekOf(dateKey) {
  return weekDates(weekKey(dateKey));
}
