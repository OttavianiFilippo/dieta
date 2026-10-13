// Controlli settimanali (dai suggerimenti del nutrizionista).

import { getFood } from '../data/foods.js';
import { weekDays } from './plan.js';

function mealHasTag(meal, tag) {
  return meal.items.some((it) => {
    const foods = [it.food, ...(it.extra || []).map((e) => e.food)].filter(Boolean);
    return foods.some((id) => getFood(id).tags.includes(tag));
  });
}

export function weekChecks(state, wk) {
  let pesce = 0;
  let legumi = 0;
  let uova = 0;
  for (const day of weekDays(state, wk)) {
    for (const meal of day.meals) {
      if (meal.off) continue;
      if (mealHasTag(meal, 'pesce')) pesce++;
      if (mealHasTag(meal, 'legumi')) legumi++;
      for (const it of meal.items) {
        if (it.food === 'uova') uova += Math.round(it.g / getFood('uova').gpp);
      }
    }
  }
  return [
    { id: 'pesce', label: 'Pesce', value: pesce, unit: pesce === 1 ? 'volta' : 'volte', target: '2-3 volte', ok: pesce >= 2,
      hint: pesce < 2 ? 'Sotto il consigliato: valuta l’olio Norsan nei giorni senza pesce.' : null },
    { id: 'legumi', label: 'Legumi', value: legumi, unit: legumi === 1 ? 'volta' : 'volte', target: '3-4 volte', ok: legumi >= 3,
      hint: legumi < 3 ? 'Sotto il consigliato (3-4 volte, sempre con un cereale).' : null },
    { id: 'uova', label: 'Uova', value: uova, unit: uova === 1 ? 'uovo' : 'uova', target: 'max 2-3', ok: uova <= 3,
      hint: uova > 3 ? 'Sopra il limite consigliato di 2-3 uova a settimana.' : null },
  ];
}
