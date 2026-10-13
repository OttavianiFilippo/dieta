// Motore delle sostituzioni: grammi sostituto = grammi originale × R.

import { FOODS, getFood } from '../data/foods.js';
import { CATEGORIES, TABLE, NOTES } from '../data/substitutions.js';

export function scale(g, r) {
  const v = g * r;
  if (v < 20) return Math.max(1, Math.round(v));
  return Math.round(v / 5) * 5;
}

function noteFor(fromCat, toCat) {
  return NOTES[`${fromCat}>${toCat}`] || NOTES[`${fromCat}>*`] || NOTES[`*>${toCat}`] || null;
}

// Gruppi di sostituti ammessi per un alimento (dalla tabella).
export function substitutionOptions(foodId, g) {
  const food = getFood(foodId);
  const groups = [];
  const seen = new Set();
  for (const cat of food.cats) {
    for (const row of TABLE[cat] || []) {
      const toCat = row.to === 'same' ? cat : row.to;
      const key = `${toCat}|${row.r}|${row.plus ? row.plus.food : ''}`;
      if (seen.has(key)) continue;
      seen.add(key);
      const foods = Object.values(FOODS).filter((f) => f.cats.includes(toCat) && f.id !== foodId);
      if (!foods.length) continue;
      groups.push({
        fromCat: cat,
        toCat,
        label: row.to === 'same' ? `Stesso gruppo (${CATEGORIES[toCat]})` : CATEGORIES[toCat],
        r: row.r,
        plus: row.plus || null,
        grams: scale(g, row.r),
        plusGrams: row.plus ? scale(g, row.plus.r) : null,
        note: noteFor(cat, toCat),
        foods,
      });
    }
  }
  return groups;
}

export function hasSubstitutions(foodId) {
  if (!foodId) return false;
  return substitutionOptions(foodId, 100).length > 0;
}

// Record salvato nello stato
export function makeSub(fromFood, toFood, group) {
  return {
    from: fromFood,
    to: toFood,
    r: group.r,
    fromCat: group.fromCat,
    toCat: group.toCat,
    plus: group.plus || null,
  };
}

// Applica una sostituzione a una voce del piano.
export function applySub(item, sub) {
  const dish = !!(item.extra && item.extra.length); // piatto composto: si cambia solo la base
  const extra = [...(item.extra || [])];
  if (sub.plus) extra.push({ food: sub.plus.food, g: scale(item.g, sub.plus.r), fromSub: true });
  return {
    ...item,
    name: dish ? item.name : undefined,
    food: sub.to,
    g: scale(item.g, sub.r),
    extra,
    orig: { food: item.food, g: item.g, name: item.name },
    sub,
  };
}
