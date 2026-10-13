// Pannelli dal basso: sostituzione alimento, cambio giornata, aggiunta in dispensa.

import { getFood, REPARTI } from '../data/foods.js';
import { effectiveDay, activePlan, weekAssignment, swapDay } from '../engine/plan.js';
import { weekKey, weekDates, weekdayIdx, fmtShort, diffDays } from '../engine/dates.js';
import { substitutionOptions, makeSub } from '../engine/subs.js';
import { withConsumptionDelta, addStock } from '../engine/pantry.js';
import { fmtPlanAmount, pantryStep } from '../engine/units.js';
import { allFoods } from '../engine/shopping.js';
import { esc, icon } from '../ui.js';

const SCOPES = [
  { id: 'slot', label: 'Solo questo pasto' },
  { id: 'week', label: 'Tutta la settimana' },
  { id: 'always', label: 'Sempre' },
];

function findItem(state, sheet) {
  const day = effectiveDay(state, sheet.dateKey);
  const meal = day.meals.find((m) => m.id === sheet.mealId);
  return { day, meal, item: meal && meal.items[sheet.idx] };
}

// ---------- Sostituzione ----------
function renderItemSheet(ctx, sheet) {
  const { meal, item } = findItem(ctx.state, sheet);
  if (!item) return '<p>Alimento non trovato.</p>';
  const baseFood = item.orig ? item.orig.food : item.food;
  const baseG = item.orig ? item.orig.g : item.g;
  const base = getFood(baseFood);
  const groups = substitutionOptions(baseFood, baseG);
  const sel = sheet.pick;

  const current = item.orig
    ? `<div class="banner banner-sub">${icon('swap')}<div><strong>Ora: ${esc(getFood(item.food).name)} ${item.g} g</strong>
         <p>${{ slot: 'Solo in questo pasto', week: 'Per tutta questa settimana', always: 'Sempre, in tutte le settimane' }[item.subScope]}</p></div>
         <button type="button" class="btn btn-small btn-outline" data-action="sub-reset">Ripristina</button></div>`
    : '';

  const list = groups.length
    ? groups.map((g, gi) => `
      <div class="sub-group">
        <div class="sub-group-head">
          <strong>${esc(g.label)}</strong>
          <span class="sub-ratio">× ${String(g.r).replace('.', ',')} → ${g.grams} g${g.plus ? ` + ${esc(getFood(g.plus.food).name.toLowerCase())} ${g.plusGrams} g` : ''}</span>
        </div>
        ${g.note ? `<p class="sub-note">${icon('info', 'icon-sm')}${esc(g.note)}</p>` : ''}
        <div class="chips">
          ${g.foods.map((f) => `<button type="button" class="chip ${sel && sel.group === gi && sel.food === f.id ? 'is-on' : ''}" data-action="sub-pick" data-group="${gi}" data-food="${f.id}">${esc(f.name)}</button>`).join('')}
        </div>
      </div>`).join('')
    : `<p class="muted">Per questo alimento non ci sono sostituzioni nella tabella del nutrizionista.</p>`;

  let footer = '';
  if (sel && groups[sel.group]) {
    const g = groups[sel.group];
    const to = getFood(sel.food);
    const scope = sheet.scope || 'slot';
    const scopeHint = {
      slot: `Solo ${meal.name.toLowerCase()} di questo giorno.`,
      week: `Tutti i pasti con ${base.name.toLowerCase()} di questa settimana.`,
      always: `Tutti i pasti con ${base.name.toLowerCase()}, da ora in poi.`,
    }[scope];
    footer = `<div class="sheet-foot">
      <div class="sub-summary">
        <span>${esc(base.name)} ${baseG} g</span>${icon('right', 'icon-sm')}
        <strong>${esc(to.name)} ${esc(fmtPlanAmount(to.id, g.grams))}${g.plus ? ` + ${esc(getFood(g.plus.food).name.toLowerCase())} ${g.plusGrams} g` : ''}</strong>
      </div>
      <div class="segmented">
        ${SCOPES.map((s) => `<button type="button" class="${scope === s.id ? 'is-on' : ''}" data-action="sub-scope" data-scope="${s.id}">${s.label}</button>`).join('')}
      </div>
      <p class="muted small">${esc(scopeHint)}</p>
      <button type="button" class="btn btn-primary btn-block" data-action="sub-apply">Conferma sostituzione</button>
    </div>`;
  }

  return `
    <div class="sheet-head">
      <div>
        <span class="eyebrow">${esc(meal.name)}</span>
        <h2>${esc(base.name)}</h2>
        <p class="muted">Nel piano: ${esc(fmtPlanAmount(baseFood, baseG))}${item.m && !item.orig ? ` · ${esc(item.m)}` : ''}</p>
      </div>
      <button type="button" class="icon-btn" data-action="close-sheet" aria-label="Chiudi">${icon('close')}</button>
    </div>
    ${current}
    <div class="sheet-body">${list}</div>
    ${footer}`;
}

function datesForScope(dateKey, scope) {
  return scope === 'slot' ? [dateKey] : weekDates(weekKey(dateKey));
}

const itemActions = {
  'sub-pick': (el, ctx) => ctx.updateSheet({ pick: { group: Number(el.dataset.group), food: el.dataset.food } }),
  'sub-scope': (el, ctx) => ctx.updateSheet({ scope: el.dataset.scope }),
  'sub-apply': (el, ctx) => {
    const sheet = ctx.ui.sheet;
    const { item } = findItem(ctx.state, sheet);
    const baseFood = item.orig ? item.orig.food : item.food;
    const baseG = item.orig ? item.orig.g : item.g;
    const group = substitutionOptions(baseFood, baseG)[sheet.pick.group];
    const sub = makeSub(baseFood, sheet.pick.food, group);
    const scope = sheet.scope || 'slot';
    const wk = weekKey(sheet.dateKey);
    ctx.commit((s) => {
      withConsumptionDelta(s, datesForScope(sheet.dateKey, scope), () => {
        if (scope === 'slot') s.subs.slot[item.slotKey] = sub;
        else if (scope === 'week') (s.subs.week[wk] ||= {})[baseFood] = sub;
        else s.subs.always[baseFood] = sub;
      });
    });
    ctx.closeSheet();
    ctx.toast('Sostituzione salvata');
  },
  'sub-reset': (el, ctx) => {
    const sheet = ctx.ui.sheet;
    const { item } = findItem(ctx.state, sheet);
    const baseFood = item.orig.food;
    const wk = weekKey(sheet.dateKey);
    ctx.commit((s) => {
      withConsumptionDelta(s, datesForScope(sheet.dateKey, item.subScope), () => {
        if (item.subScope === 'slot') delete s.subs.slot[item.slotKey];
        else if (item.subScope === 'week') {
          delete s.subs.week[wk][baseFood];
          if (!Object.keys(s.subs.week[wk]).length) delete s.subs.week[wk];
        } else delete s.subs.always[baseFood];
      });
    });
    ctx.closeSheet();
    ctx.toast('Ripristinato l’alimento del piano');
  },
};

// ---------- Cambio giornata ----------
function renderSwapSheet(ctx, sheet) {
  const { state, todayKey } = ctx;
  const plan = activePlan(state);
  const wk = weekKey(sheet.dateKey);
  const arr = weekAssignment(state, wk);
  const dates = weekDates(wk);
  const current = arr[weekdayIdx(sheet.dateKey)];
  const rows = plan.order.map((pid) => {
    const d = plan.days[pid];
    const holder = dates[arr.indexOf(pid)];
    const isCurrent = pid === current;
    const holderPast = diffDays(todayKey, holder) < 0;
    const disabled = !isCurrent && holderPast;
    const where = isCurrent ? 'questo giorno' : holderPast ? `già usato ${fmtShort(holder)}` : `ora su ${fmtShort(holder)}`;
    return `<button type="button" class="swap-row ${isCurrent ? 'is-on' : ''}" data-action="swap-pick" data-plan="${pid}" ${disabled || isCurrent ? 'disabled' : ''}>
      <div><strong>${esc(d.name)}</strong><span>${esc(d.activity)} · ${d.kcal} kcal</span></div>
      <small>${esc(where)}</small>
    </button>`;
  }).join('');
  return `
    <div class="sheet-head">
      <div>
        <span class="eyebrow">${esc(fmtShort(sheet.dateKey))}</span>
        <h2>Che giornata è?</h2>
        <p class="muted">Scegli il piano da usare. Il giorno che lo aveva prende il piano di questo giorno, così la settimana resta completa.</p>
      </div>
      <button type="button" class="icon-btn" data-action="close-sheet" aria-label="Chiudi">${icon('close')}</button>
    </div>
    <div class="sheet-body swap-list">${rows}</div>`;
}

const swapActions = {
  'swap-pick': (el, ctx) => {
    const dateKey = ctx.ui.sheet.dateKey;
    const pid = el.dataset.plan;
    const wk = weekKey(dateKey);
    const holder = weekDates(wk)[weekAssignment(ctx.state, wk).indexOf(pid)];
    ctx.commit((s) => withConsumptionDelta(s, [dateKey, holder], () => swapDay(s, dateKey, pid)));
    ctx.closeSheet();
    ctx.toast(`Scambiato con ${fmtShort(holder)}`);
  },
};

// ---------- Aggiungi in dispensa ----------
export function renderAddList(ctx) {
  const q = (ctx.ui.pantryQuery || '').trim().toLowerCase();
  const foods = allFoods()
    .filter((f) => !q || f.name.toLowerCase().includes(q))
    .sort((a, b) => a.name.localeCompare(b.name, 'it'));
  if (!foods.length) return '<p class="muted">Nessun alimento trovato.</p>';
  return foods.map((f) => {
    const what = f.unit === 'pz' ? `+1 ${f.label[0]}` : f.unit === 'pack' ? `+1 ${f.packLabel}` : `+${pantryStep(f)} g`;
    return `<button type="button" class="add-row" data-action="pantry-add" data-id="${f.id}">
      <span>${esc(f.name)}<small>${esc(REPARTI.find((r) => r.id === f.reparto)?.name || '')}</small></span>
      <em>${esc(what)}</em>
    </button>`;
  }).join('');
}

function renderAddSheet(ctx) {
  return `
    <div class="sheet-head">
      <div>
        <h2>Aggiungi in dispensa</h2>
        <p class="muted">Quello che hai già in casa. Poi regoli la quantità con − e +.</p>
      </div>
      <button type="button" class="icon-btn" data-action="close-sheet" aria-label="Chiudi">${icon('close')}</button>
    </div>
    <label class="search">${icon('search')}<input type="search" placeholder="Cerca alimento" value="${esc(ctx.ui.pantryQuery || '')}" data-input="pantry-query" autocomplete="off"></label>
    <div class="sheet-body add-list" id="add-list">${renderAddList(ctx)}</div>`;
}

const addActions = {
  'pantry-add': (el, ctx) => {
    const f = getFood(el.dataset.id);
    const qty = f.unit === 'pack' ? f.pack : pantryStep(f);
    ctx.commit((s) => addStock(s, f.id, qty));
    ctx.toast(`${f.name}: aggiunto`);
  },
};

export function renderSheet(ctx) {
  const sheet = ctx.ui.sheet;
  if (!sheet) return '';
  if (sheet.type === 'item') return renderItemSheet(ctx, sheet);
  if (sheet.type === 'swap') return renderSwapSheet(ctx, sheet);
  if (sheet.type === 'add') return renderAddSheet(ctx, sheet);
  return '';
}

export const sheetActions = { ...itemActions, ...swapActions, ...addActions };
