// Schermata "Spesa": checklist con quantità, opzione surgelato e conferma.

import { REPARTI } from '../data/foods.js';
import { shoppingList, upcomingFresh, draftFor, updateDraft, confirmShopping, alreadyHave, pruneDraft } from '../engine/shopping.js';
import { relativeLabel, toKey, fmtShort, diffDays } from '../engine/dates.js';
import { shopStep, shopUnitLabel, fmtShop } from '../engine/units.js';
import { getFood } from '../data/foods.js';
import { esc, icon, stepper } from '../ui.js';

function reasons(item, todayKey) {
  const seen = [];
  for (const n of item.needs) {
    const label = `${relativeLabel(n.dateKey, todayKey)} ${n.meal.toLowerCase()}`;
    if (!seen.includes(label)) seen.push(label);
  }
  const shown = seen.slice(0, 3).join(', ');
  return seen.length > 3 ? `${shown} e altri ${seen.length - 3}` : shown;
}

function renderRow(item, ctx) {
  const f = item.food;
  const d = draftFor(ctx.state, item);
  const frozenMode = d.frozen && f.frozen;
  const qtyStepper = frozenMode
    ? stepper({ action: 'shop-frozen-qty', id: f.id, value: d.frozenG, label: ' g', min: 100 })
    : stepper({ action: 'shop-qty', id: f.id, value: d.qty, label: f.unit === 'g' ? ' g' : ` ${shopUnitLabel(f, d.qty)}`, min: 0 });
  const packHint = f.unit === 'pack' && !frozenMode ? `<span class="row-hint">${esc(f.packLabel)}</span>` : '';
  return `<div class="shop-row ${d.checked ? 'is-checked' : ''}">
    <button type="button" class="check-btn" data-action="shop-check" data-id="${f.id}" aria-pressed="${d.checked}" aria-label="Comprato">${icon('check')}</button>
    <div class="shop-info">
      <span class="shop-name">${esc(f.name)}</span>
      <span class="shop-reason">Serve ${esc(reasons(item, ctx.todayKey))}</span>
      ${packHint}
      <div class="shop-actions">
        ${f.frozen ? `<div class="segmented segmented-sm">
          <button type="button" class="${frozenMode ? '' : 'is-on'}" data-action="shop-mode" data-id="${f.id}" data-frozen="0">Fresco</button>
          <button type="button" class="${frozenMode ? 'is-on' : ''}" data-action="shop-mode" data-id="${f.id}" data-frozen="1">${icon('snow', 'icon-sm')}Surgelato</button>
        </div>` : ''}
        <button type="button" class="link-btn muted" data-action="shop-have" data-id="${f.id}">Ce l'ho già</button>
      </div>
    </div>
    <div class="shop-qty">${qtyStepper}</div>
  </div>`;
}

export function renderShop(ctx) {
  const { state, now, todayKey, ui } = ctx;
  const list = shoppingList(state, now);
  ctx.cache.shopList = list;
  const checked = list.filter((i) => draftFor(state, i).checked).length;
  const fresh = upcomingFresh(state, now, new Set(list.map((i) => i.food.id)));

  const sections = REPARTI.map((r) => {
    const items = list.filter((i) => i.food.reparto === r.id);
    if (!items.length) return '';
    return `<section class="card card-list shop-section">
      <h3 class="card-title">${esc(r.name)}</h3>
      ${items.map((i) => renderRow(i, ctx)).join('')}
    </section>`;
  }).join('');

  const empty = !list.length
    ? `<section class="card empty">${icon('check', 'icon-lg')}<h3>Hai tutto quello che serve</h3><p class="muted">Per i prossimi giorni la dispensa copre il piano. Ricontrolla tra qualche giorno.</p></section>`
    : '';

  const freshHtml = fresh.length
    ? `<section class="card card-list">
        <h3 class="card-title">Freschi in arrivo</h3>
        <p class="muted small">Da comprare a ridosso del giorno: entreranno nella lista il giorno prima.</p>
        ${fresh.map((x) => `<div class="fresh-row">
          <span>${esc(x.food.name)}<small>${esc(relativeLabel(x.need.dateKey, todayKey))} · ${esc(x.need.meal.toLowerCase())}</small></span>
          <em>da ${esc(diffDays(todayKey, x.buyFrom) <= 0 ? 'oggi' : fmtShort(x.buyFrom))}</em>
        </div>`).join('')}
      </section>`
    : '';

  const history = state.purchases.length
    ? `<section class="card">
        <button type="button" class="collapse-head" data-action="toggle-history">
          <h3 class="card-title">Storico spese</h3>${icon(ui.historyOpen ? 'minus' : 'plus')}
        </button>
        ${ui.historyOpen ? state.purchases.slice(0, 15).map((p) => {
          const d = new Date(p.at);
          return `<div class="history">
            <strong>${esc(fmtShort(toKey(d)))} · ${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}</strong>
            <ul>${p.items.map((it) => `<li>${esc(getFood(it.food).name)} <span class="muted">${esc(it.label)}</span></li>`).join('')}</ul>
          </div>`;
        }).join('') : ''}
      </section>`
    : '';

  return `
    <div class="page-intro">
      <h2>Lista della spesa</h2>
      <p class="muted">${list.length ? `${list.length} ${list.length === 1 ? 'articolo' : 'articoli'} per i prossimi giorni. Spunta quello che compri e conferma alla fine.` : 'Niente da comprare per ora.'}</p>
    </div>
    ${empty}
    ${sections}
    ${freshHtml}
    ${history}
    ${list.length ? `<div class="sticky-cta">
      <button type="button" class="btn btn-primary btn-block" data-action="shop-confirm" ${checked ? '' : 'disabled'}>
        ${checked ? `Conferma spesa (${checked})` : 'Spunta quello che hai comprato'}
      </button>
    </div>` : ''}
  `;
}

function findItem(ctx, id) {
  return (ctx.cache.shopList || []).find((i) => i.food.id === id);
}

export const shopActions = {
  'shop-check': (el, ctx) => {
    const item = findItem(ctx, el.dataset.id);
    if (!item) return;
    const d = draftFor(ctx.state, item);
    ctx.commit((s) => updateDraft(s, item.food.id, { checked: !d.checked }));
  },
  'shop-qty': (el, ctx) => {
    const item = findItem(ctx, el.dataset.id);
    if (!item) return;
    const d = draftFor(ctx.state, item);
    const next = Math.max(0, d.qty + Number(el.dataset.delta) * shopStep(item.food));
    ctx.commit((s) => updateDraft(s, item.food.id, { qty: next }));
  },
  'shop-frozen-qty': (el, ctx) => {
    const item = findItem(ctx, el.dataset.id);
    if (!item) return;
    const d = draftFor(ctx.state, item);
    const next = Math.max(100, d.frozenG + Number(el.dataset.delta) * 100);
    ctx.commit((s) => updateDraft(s, item.food.id, { frozenG: next }));
  },
  'shop-mode': (el, ctx) => {
    const item = findItem(ctx, el.dataset.id);
    if (!item) return;
    const frozen = el.dataset.frozen === '1';
    ctx.commit((s) => updateDraft(s, item.food.id, { frozen }));
  },
  'shop-have': (el, ctx) => {
    const item = findItem(ctx, el.dataset.id);
    if (!item) return;
    ctx.commit((s) => alreadyHave(s, item));
    ctx.toast(`${item.food.name}: segnato in dispensa`);
  },
  'toggle-history': (el, ctx) => ctx.setUi({ historyOpen: !ctx.ui.historyOpen }),
  'shop-confirm': (el, ctx) => {
    const list = ctx.cache.shopList || [];
    const checked = list.filter((i) => draftFor(ctx.state, i).checked);
    if (!checked.length) return;
    const summary = checked.map((i) => {
      const d = draftFor(ctx.state, i);
      return `• ${i.food.name}: ${d.frozen && i.food.frozen ? `${d.frozenG} g surgelato` : fmtShop(i.food, d.qty)}`;
    }).join('\n');
    if (!window.confirm(`Confermi la spesa?\n\n${summary}`)) return;
    let n = 0;
    ctx.commit((s) => {
      n = confirmShopping(s, ctx.now, list);
      pruneDraft(s, shoppingList(s, ctx.now));
    });
    ctx.toast(`Spesa registrata: ${n} ${n === 1 ? 'articolo' : 'articoli'} in dispensa`);
  },
};
