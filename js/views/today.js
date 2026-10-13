// Schermata "Oggi": il piano del giorno selezionato.

import { getFood } from '../data/foods.js';
import { effectiveDay, mealTime, activePlan } from '../engine/plan.js';
import { addDays, fmtLong, diffDays, relativeLabel } from '../engine/dates.js';
import { fmtPlanAmount } from '../engine/units.js';
import { hasSubstitutions } from '../engine/subs.js';
import { setMealOff, setDayOff } from '../engine/pantry.js';
import { esc, icon, fmtTime } from '../ui.js';

function itemName(item) {
  if (item.name) return item.name;
  return item.food ? getFood(item.food).name : '';
}

function itemAmount(item) {
  if (!item.food) return `${item.g} ml`;
  // Alimento sostituito: la misura del PDF non vale più, mostro i pezzi indicativi
  if (item.orig) return fmtPlanAmount(item.food, item.g);
  return `${item.g} ${getFood(item.food).ml ? 'ml' : 'g'}`;
}

function subLine(item) {
  if (!item.orig) return '';
  const orig = getFood(item.orig.food).name;
  const dish = item.name ? ` (${getFood(item.food).name} al posto di ${orig.toLowerCase()})` : '';
  const scope = { slot: 'solo oggi', week: 'questa settimana', always: 'sempre' }[item.subScope];
  const plus = (item.extra || []).filter((e) => e.fromSub).map((e) => ` + ${getFood(e.food).name.toLowerCase()} ${e.g} g`).join('');
  return `<div class="item-sub">${icon('swap')}<span>Invece di ${esc(orig)} ${item.orig.g} g${esc(dish)}${esc(plus)} · ${scope}</span></div>`;
}

function renderItem(item, meal, ctx, editable) {
  const food = item.food ? getFood(item.food) : null;
  const water = food && food.id === 'acqua';
  const canSub = editable && !!item.food && !meal.cheat && (hasSubstitutions(item.orig ? item.orig.food : item.food) || item.orig);
  const tag = canSub ? 'button' : 'div';
  const attrs = canSub ? `type="button" data-action="open-item" data-meal="${esc(meal.id)}" data-idx="${item.idx}"` : '';
  return `<${tag} class="item ${water ? 'item-water' : ''} ${item.orig ? 'is-sub' : ''} ${canSub ? 'is-tappable' : ''}" ${attrs}>
    <div class="item-main">
      <span class="item-name">${water ? icon('drop', 'icon-sm') : ''}${esc(itemName(item))}</span>
      <span class="item-qty">${esc(water ? `${item.g} ml` : itemAmount(item))}</span>
    </div>
    <div class="item-meta">
      ${item.m && !item.orig ? `<span>${esc(item.m)}</span>` : ''}
      ${item.note ? `<span class="item-note">${esc(item.note)}</span>` : ''}
      ${canSub ? `<span class="item-swap">${icon('swap', 'icon-sm')}Sostituisci</span>` : ''}
    </div>
    ${subLine(item)}
  </${tag}>`;
}

function renderMeal(meal, day, ctx, flags) {
  const { isToday, isPast, nextId } = flags;
  const passed = isPast || (isToday && mealTime(day.dateKey, meal) <= ctx.now);
  const isWaterOnly = meal.items.every((it) => it.food === 'acqua');
  const editable = !isPast;
  const status = meal.off
    ? `<span class="badge badge-off">Fuori piano</span>`
    : meal.id === nextId
      ? `<span class="badge badge-next">Prossimo</span>`
      : passed
        ? `<span class="badge badge-done">${icon('check', 'icon-sm')}Fatto</span>`
        : '';
  const time = meal.time ? fmtTime(meal.time) : meal.label;
  const expanded = ctx.ui.expanded[`${day.dateKey}|${meal.id}`];
  if ((passed || isWaterOnly) && !expanded) {
    const summary = meal.items.map((it) => itemName(it)).join(' · ');
    return `<button type="button" class="meal meal-compact card ${meal.off ? 'is-off' : ''} ${passed && !meal.off ? 'is-passed' : ''} ${isWaterOnly ? 'is-water' : ''}" data-action="toggle-meal" data-meal="${esc(meal.id)}">
      <div class="meal-compact-main">
        <span class="meal-compact-title"><strong>${esc(meal.name)}</strong><span class="meal-time">${esc(time)}</span></span>
        <span class="meal-compact-items">${isWaterOnly ? icon('drop', 'icon-sm') : ''}${esc(summary)}</span>
      </div>
      ${status}
    </button>`;
  }
  const collapse = passed || isWaterOnly
    ? `<button type="button" class="link-btn muted" data-action="toggle-meal" data-meal="${esc(meal.id)}">Riduci</button>`
    : '';
  const shaker = meal.shaker && !meal.off
    ? `<button type="button" class="link-btn" data-action="toggle-shaker" data-meal="${esc(meal.id)}">${icon('shaker', 'icon-sm')}${ctx.ui.shakerOpen ? 'Nascondi ricetta shaker' : 'Ricetta shaker'}</button>
       ${ctx.ui.shakerOpen ? renderShaker(ctx) : ''}`
    : '';
  const offBtn = editable && !day.off && !isWaterOnly && !meal.cheat
    ? `<button type="button" class="link-btn muted" data-action="toggle-meal-off" data-meal="${esc(meal.id)}">${icon(meal.off ? 'undo' : 'off', 'icon-sm')}${meal.off ? 'Rimetti nel piano' : 'Segna fuori piano'}</button>`
    : '';
  return `<section class="meal card ${meal.off ? 'is-off' : ''} ${meal.id === nextId ? 'is-next' : ''} ${passed && !meal.off ? 'is-passed' : ''} ${isWaterOnly ? 'is-water' : ''} ${meal.cheat ? 'is-cheat' : ''}">
    <header class="meal-head">
      <div class="meal-title">
        <h3>${esc(meal.name)}</h3>
        <span class="meal-time">${icon('clock', 'icon-sm')}${esc(time)}</span>
      </div>
      <div class="meal-right">
        ${meal.kcal ? `<span class="meal-kcal">${meal.kcal} kcal</span>` : ''}
        ${status}
      </div>
    </header>
    ${meal.note ? `<p class="meal-note">${esc(meal.note)}</p>` : ''}
    <div class="items">${meal.items.map((it) => renderItem(it, meal, ctx, editable && !meal.off)).join('')}</div>
    ${shaker || offBtn || collapse ? `<footer class="meal-foot">${shaker}${offBtn}${collapse}</footer>` : ''}
  </section>`;
}

function renderShaker(ctx) {
  const r = activePlan(ctx.state).shaker;
  if (!r) return '';
  return `<div class="shaker">
    <strong>${esc(r.title)}</strong>
    <p class="muted">${esc(r.when)}</p>
    <ul>${r.lines.map((l) => `<li>${esc(l)}</li>`).join('')}</ul>
    <p class="muted small">${esc(r.alt)}</p>
  </div>`;
}

export function renderToday(ctx) {
  const { state, ui, todayKey, now } = ctx;
  const dateKey = ui.date;
  const day = effectiveDay(state, dateKey);
  const d = day.day;
  const diff = diffDays(todayKey, dateKey);
  const isToday = diff === 0;
  const isPast = diff < 0;
  const swapped = day.planDayId !== activePlan(state).order[weekdayOf(dateKey)];

  let nextId = null;
  if (isToday && !day.off) {
    const next = day.meals.find((m) => !m.off && m.time && mealTime(dateKey, m) > now && !m.items.every((it) => it.food === 'acqua'));
    nextId = next ? next.id : null;
  }

  const dayOffBanner = day.off
    ? `<div class="banner banner-off">${icon('off')}<div><strong>Giorno fuori piano</strong><p>Questi pasti non vengono scalati dalla dispensa né messi nella spesa.</p></div>
        ${isPast ? '' : `<button type="button" class="btn btn-small" data-action="toggle-day-off">Rimetti nel piano</button>`}</div>`
    : '';

  return `
    <div class="day-nav">
      <button type="button" class="icon-btn" data-action="day-prev" aria-label="Giorno precedente">${icon('left')}</button>
      <div class="day-nav-title">
        <span class="eyebrow">${esc(relativeLabel(dateKey, todayKey))}</span>
        <strong>${esc(cap(fmtLong(dateKey)))}</strong>
      </div>
      <button type="button" class="icon-btn" data-action="day-next" aria-label="Giorno successivo">${icon('right')}</button>
    </div>
    ${!isToday ? `<button type="button" class="chip chip-center" data-action="day-today">Torna a oggi</button>` : ''}

    <section class="card day-card">
      <div class="day-plan">
        <div>
          <span class="eyebrow">Piano ${swapped ? '· scambiato' : ''}</span>
          <h2>${esc(d.name)} · ${esc(d.activity)}</h2>
        </div>
        ${isPast ? '' : `<button type="button" class="btn btn-small btn-outline" data-action="open-swap" data-date="${dateKey}">${icon('swap', 'icon-sm')}Cambia</button>`}
      </div>
      <div class="macros">
        <div><span>Kcal</span><strong>${d.kcal}</strong></div>
        <div><span>Proteine</span><strong>${d.p} g</strong></div>
        <div><span>Grassi</span><strong>${d.f} g</strong></div>
        <div><span>Carboidrati</span><strong>${d.c} g</strong></div>
      </div>
      ${!day.off && !isPast ? `<button type="button" class="link-btn muted" data-action="toggle-day-off">${icon('off', 'icon-sm')}Segna tutto il giorno fuori piano</button>` : ''}
    </section>
    ${dayOffBanner}
    ${day.meals.map((m) => renderMeal(m, day, ctx, { isToday, isPast, nextId })).join('')}
    <p class="footnote">Tocca un alimento per sostituirlo con le tabelle del nutrizionista.</p>
  `;
}

function weekdayOf(dateKey) {
  const [y, m, dd] = dateKey.split('-').map(Number);
  return (new Date(y, m - 1, dd).getDay() + 6) % 7;
}

function cap(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export const todayActions = {
  'day-prev': (el, ctx) => ctx.setUi({ date: addDays(ctx.ui.date, -1) }),
  'day-next': (el, ctx) => ctx.setUi({ date: addDays(ctx.ui.date, 1) }),
  'day-today': (el, ctx) => ctx.setUi({ date: ctx.todayKey }),
  'toggle-shaker': (el, ctx) => ctx.setUi({ shakerOpen: !ctx.ui.shakerOpen }),
  'toggle-meal': (el, ctx) => {
    const k = `${ctx.ui.date}|${el.dataset.meal}`;
    ctx.setUi({ expanded: { ...ctx.ui.expanded, [k]: !ctx.ui.expanded[k] } });
  },
  'toggle-meal-off': (el, ctx) => {
    const dateKey = ctx.ui.date;
    const mealId = el.dataset.meal;
    const off = !!ctx.state.offPlan.meals[`${dateKey}|${mealId}`];
    ctx.commit((s) => setMealOff(s, dateKey, mealId, !off));
    ctx.toast(off ? 'Pasto rimesso nel piano' : 'Pasto segnato fuori piano');
  },
  'toggle-day-off': (el, ctx) => {
    const dateKey = ctx.ui.date;
    const off = !!ctx.state.offPlan.days[dateKey];
    ctx.commit((s) => setDayOff(s, dateKey, !off));
    ctx.toast(off ? 'Giorno rimesso nel piano' : 'Giorno segnato fuori piano');
  },
  'open-item': (el, ctx) => ctx.openSheet({ type: 'item', dateKey: ctx.ui.date, mealId: el.dataset.meal, idx: Number(el.dataset.idx) }),
  'open-swap': (el, ctx) => ctx.openSheet({ type: 'swap', dateKey: el.dataset.date }),
};
