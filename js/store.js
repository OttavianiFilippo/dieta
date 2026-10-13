// Stato dell'app, salvato nel telefono (localStorage).

import { DEFAULT_PLAN_ID, PLANS } from './data/plans/index.js';
import { FOODS } from './data/foods.js';

const KEY = 'dieta-app';
export const SCHEMA = 1;

export function defaultState() {
  return {
    schema: SCHEMA,
    planId: DEFAULT_PLAN_ID,
    createdAt: new Date().toISOString(),
    lastProcessed: null,
    pantry: {}, // foodId → { qty, frozen }
    assignments: {}, // lunedì "YYYY-MM-DD" → [planDayId × 7]
    subs: { slot: {}, week: {}, always: {} },
    offPlan: { days: {}, meals: {} },
    shopDraft: {}, // foodId → { checked, qty, frozen, frozenG }
    purchases: [], // [{ at, items: [{ food, label }] }]
    // Periodi di pausa: i pasti in questi periodi non vengono scalati. Si parte in pausa.
    pauses: [{ from: '2000-01-01T00:00:00.000Z', to: null, initial: true }],
  };
}

function normalize(s) {
  const d = defaultState();
  const out = { ...d, ...s };
  out.subs = { ...d.subs, ...(s.subs || {}) };
  out.offPlan = { ...d.offPlan, ...(s.offPlan || {}) };
  if (!Array.isArray(s.pauses)) out.pauses = [{ from: '2000-01-01T00:00:00.000Z', to: null, initial: true }];
  if (!PLANS[out.planId]) out.planId = DEFAULT_PLAN_ID;
  // Rimuove alimenti non più presenti nel catalogo
  for (const id of Object.keys(out.pantry)) if (!FOODS[id]) delete out.pantry[id];
  for (const id of Object.keys(out.shopDraft)) if (!FOODS[id]) delete out.shopDraft[id];
  return out;
}

export function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return normalize(JSON.parse(raw));
  } catch (e) {
    console.warn('Impossibile leggere i dati salvati', e);
  }
  return defaultState();
}

export function save(state) {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
    return true;
  } catch (e) {
    console.warn('Impossibile salvare', e);
    return false;
  }
}

export function exportBackup(state) {
  return JSON.stringify({ app: 'dieta', exportedAt: new Date().toISOString(), state }, null, 2);
}

export function parseBackup(text) {
  const data = JSON.parse(text);
  if (!data || data.app !== 'dieta' || !data.state) throw new Error('Il file non è un backup di questa app.');
  return normalize(data.state);
}

export function clearAll() {
  try {
    localStorage.removeItem(KEY);
  } catch (e) {
    /* ignora */
  }
}
