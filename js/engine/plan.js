// Piano effettivo di una data: assegnazione dei giorni (con scambi),
// sostituzioni e pasti fuori piano.

import { PLANS, DEFAULT_PLAN_ID } from '../data/plans/index.js';
import { getFood } from '../data/foods.js';
import { weekKey, weekdayIdx, at, weekDates } from './dates.js';
import { applySub } from './subs.js';
import { gramsToBase } from './units.js';

export function activePlan(state) {
  return PLANS[state.planId] || PLANS[DEFAULT_PLAN_ID];
}

export function weekAssignment(state, wk) {
  return state.assignments[wk] ? [...state.assignments[wk]] : [...activePlan(state).order];
}

export function planDayIdFor(state, dateKey) {
  return weekAssignment(state, weekKey(dateKey))[weekdayIdx(dateKey)];
}

// Scambio: la data prende il piano `targetId`, la data che lo aveva prende il suo.
export function swapDay(state, dateKey, targetId) {
  const wk = weekKey(dateKey);
  const arr = weekAssignment(state, wk);
  const i = weekdayIdx(dateKey);
  const j = arr.indexOf(targetId);
  if (j === -1 || i === j) return;
  [arr[i], arr[j]] = [arr[j], arr[i]];
  const def = activePlan(state).order;
  if (arr.every((id, k) => id === def[k])) delete state.assignments[wk];
  else state.assignments[wk] = arr;
}

export function resetWeek(state, wk) {
  delete state.assignments[wk];
}

export function isDayOff(state, dateKey) {
  return !!state.offPlan.days[dateKey];
}

export function isMealOff(state, dateKey, mealId) {
  return isDayOff(state, dateKey) || !!state.offPlan.meals[`${dateKey}|${mealId}`];
}

export function slotKey(dateKey, planDayId, mealId, idx) {
  return `${dateKey}|${planDayId}|${mealId}|${idx}`;
}

function resolveItem(state, item, ctx) {
  const base = { ...item, idx: ctx.idx, slotKey: slotKey(ctx.dateKey, ctx.planDayId, ctx.mealId, ctx.idx) };
  if (!item.food) return base;
  let sub = state.subs.slot[base.slotKey];
  let scope = 'slot';
  if (!sub) {
    sub = state.subs.week[ctx.wk] && state.subs.week[ctx.wk][item.food];
    scope = 'week';
  }
  if (!sub) {
    sub = state.subs.always[item.food];
    scope = 'always';
  }
  if (!sub) return base;
  return { ...applySub(item, sub), idx: ctx.idx, slotKey: base.slotKey, subScope: scope };
}

export function effectiveDay(state, dateKey) {
  const plan = activePlan(state);
  const planDayId = planDayIdFor(state, dateKey);
  const day = plan.days[planDayId];
  const wk = weekKey(dateKey);
  const dayOff = isDayOff(state, dateKey);
  const meals = day.meals.map((meal) => ({
    ...meal,
    off: isMealOff(state, dateKey, meal.id),
    items: meal.items.map((item, idx) => resolveItem(state, item, { dateKey, planDayId, wk, mealId: meal.id, idx })),
  }));
  return { dateKey, planDayId, day, meals, off: dayOff };
}

export function mealTime(dateKey, meal) {
  return at(dateKey, meal.time || meal.consumeAt || '19:00');
}

// Ingredienti (in unità base di dispensa) di una voce
export function itemIngredients(item) {
  const list = [];
  if (item.food) list.push({ food: item.food, g: item.g });
  for (const e of item.extra || []) list.push(e);
  const out = [];
  for (const x of list) {
    const f = getFood(x.food);
    if (f.noShop) continue;
    out.push({ food: x.food, qty: x.pz != null ? x.pz : gramsToBase(f, x.g) });
  }
  return out;
}

export function mealIngredients(meal) {
  if (meal.off) return [];
  return meal.items.flatMap(itemIngredients);
}

// Tutti gli alimenti acquistabili del piano attivo (senza sostituzioni)
export function planFoodIds(state) {
  const ids = new Set();
  for (const day of Object.values(activePlan(state).days)) {
    for (const meal of day.meals) {
      for (const it of meal.items) {
        for (const ing of itemIngredients(it)) ids.add(ing.food);
      }
    }
  }
  return [...ids];
}

export function weekDays(state, wk) {
  return weekDates(wk).map((d) => effectiveDay(state, d));
}
