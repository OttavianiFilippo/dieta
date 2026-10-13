// Conversioni tra grammi del piano e unità di dispensa/spesa.
//
// Unità "base" in dispensa:
//   pz   → pezzi (anche frazionari, es. 1,7 kiwi)
//   g    → grammi
//   pack → grammi (o ml)
// Unità di spesa:
//   pz   → pezzi interi
//   g    → grammi a passi di food.step
//   pack → numero di confezioni

import { getFood } from '../data/foods.js';

const EPS = 1e-6;

export function gramsToBase(food, g) {
  if (food.unit === 'pz') return food.gpp ? g / food.gpp : 1;
  return g;
}

export function baseToGrams(food, qty) {
  if (food.unit === 'pz') return food.gpp ? qty * food.gpp : qty;
  return qty;
}

// Quanto comprare (in unità di spesa) per coprire `baseQty`.
export function baseToShop(food, baseQty) {
  if (baseQty <= EPS) return 0;
  if (food.unit === 'pz') return Math.ceil(baseQty - EPS);
  if (food.unit === 'pack') return Math.ceil(baseQty / food.pack - EPS);
  const step = food.step || 50;
  return Math.ceil(baseQty / step - EPS) * step;
}

export function shopToBase(food, shopQty) {
  if (food.unit === 'pack') return shopQty * food.pack;
  return shopQty;
}

export function shopStep(food) {
  if (food.unit === 'g') return food.step || 50;
  return 1;
}

// Grammi surgelati (passi da 100 g) → unità base
export function frozenGramsToBase(food, g) {
  return gramsToBase(food, g);
}

const trim = (n) => {
  const r = Math.round(n * 10) / 10;
  return String(r).replace('.', ',');
};

export function plural(food, n) {
  if (!food.label) return '';
  return Math.abs(n - 1) < EPS ? food.label[0] : food.label[1];
}

// Etichetta di una quantità di spesa: "2 vasetti", "150 g", "2 × pacco da 500 g"
export function fmtShop(food, shopQty) {
  if (food.unit === 'pz') return `${shopQty} ${plural(food, shopQty)}`;
  if (food.unit === 'pack') return `${shopQty} × ${food.packLabel}`;
  return `${shopQty} g`;
}

export function fmtShopNumber(food, shopQty) {
  if (food.unit === 'g') return `${shopQty} g`;
  return String(shopQty);
}

export function shopUnitLabel(food, shopQty) {
  if (food.unit === 'pz') return plural(food, shopQty);
  if (food.unit === 'pack') return shopQty === 1 ? 'conf.' : 'conf.';
  return '';
}

// Etichetta di una quantità in dispensa
export function fmtBase(food, qty) {
  if (food.unit === 'pz') {
    const n = Math.round(qty * 10) / 10;
    return `${trim(n)} ${plural(food, n)}`;
  }
  const u = food.ml ? 'ml' : 'g';
  const g = Math.round(qty);
  if (food.unit === 'pack') {
    const packs = qty / food.pack;
    const approx = packs >= 0.95 ? ` · ${trim(packs)} conf.` : '';
    return g >= 1000 && !food.ml ? `${trim(g / 1000)} kg${approx}` : `${g} ${u}${approx}`;
  }
  return g >= 1000 ? `${trim(g / 1000)} kg` : `${g} ${u}`;
}

// Passo dei pulsanti +/- in dispensa
export function pantryStep(food) {
  if (food.unit === 'pz') return 1;
  if (food.unit === 'g') return food.step || 50;
  if (food.pack >= 1000) return 100;
  if (food.pack >= 300) return 50;
  return 10;
}

// Grammi del piano → testo leggibile con pezzi indicativi ("150 g · 1 mela")
export function fmtPlanAmount(foodId, g) {
  const food = getFood(foodId);
  const u = food.ml ? 'ml' : 'g';
  if (food.unit === 'pz' && food.gpp) {
    const n = Math.max(0.5, Math.round((g / food.gpp) * 2) / 2);
    return `${g} ${u} · ${trim(n)} ${plural(food, n)}`;
  }
  return `${g} ${u}`;
}
