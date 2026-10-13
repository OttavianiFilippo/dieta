// Schermata "Dispensa": cosa hai in casa, modificabile a mano.

import { REPARTI, getFood } from '../data/foods.js';
import { stockOf, frozenOf, setStock } from '../engine/pantry.js';
import { upcomingNeeds } from '../engine/shopping.js';
import { fmtBase, pantryStep } from '../engine/units.js';
import { relativeLabel } from '../engine/dates.js';
import { esc, icon, stepper } from '../ui.js';

const EPS = 1e-6;

function coverage(entries, stock, todayKey) {
  if (!entries || !entries.length) return { text: 'non serve nei prossimi 7 giorni', cls: 'muted' };
  let cum = 0;
  for (const e of entries) {
    cum += e.qty;
    if (cum > stock + EPS) return { text: `manca da ${relativeLabel(e.dateKey, todayKey)} ${e.meal.toLowerCase()}`, cls: 'warn' };
  }
  return { text: 'basta per i prossimi 7 giorni', cls: 'ok' };
}

export function renderPantry(ctx) {
  const { state, now, todayKey } = ctx;
  const ids = Object.keys(state.pantry);
  const needs = upcomingNeeds(state, now, 7);

  const sections = REPARTI.map((r) => {
    const foods = ids.map(getFood).filter((f) => f.reparto === r.id).sort((a, b) => a.name.localeCompare(b.name, 'it'));
    if (!foods.length) return '';
    return `<section class="card card-list">
      <h3 class="card-title">${esc(r.name)}</h3>
      ${foods.map((f) => {
        const qty = stockOf(state, f.id);
        const frozen = frozenOf(state, f.id);
        const cov = coverage(needs[f.id], qty, todayKey);
        return `<div class="pantry-row ${qty <= EPS ? 'is-empty' : ''}">
          <div class="pantry-info">
            <span class="shop-name">${esc(f.name)}</span>
            <span class="pantry-qty">${frozen > EPS
              ? qty - frozen > EPS
                ? `${esc(fmtBase(f, qty))}, di cui ${icon('snow', 'icon-sm')}${esc(fmtBase(f, frozen))} surgelato`
                : `${icon('snow', 'icon-sm')}${esc(fmtBase(f, qty))} surgelato`
              : esc(fmtBase(f, qty))}</span>
            <span class="pantry-cov ${cov.cls}">${esc(cov.text)}</span>
          </div>
          <div class="pantry-ctrl">
            ${stepper({ action: 'pantry-step', id: f.id, value: '', minusDisabled: qty <= EPS })}
            <button type="button" class="icon-btn trash-btn" data-action="pantry-remove" data-id="${f.id}" aria-label="Elimina ${esc(f.name)}">${icon('trash')}</button>
          </div>
        </div>`;
      }).join('')}
    </section>`;
  }).join('');

  return `
    <div class="page-intro">
      <h2>Dispensa</h2>
      <p class="muted">Quello che hai in casa secondo l'app. Dopo l'orario di ogni pasto, quello che c'era nel piano viene scalato da solo. Se qualcosa non torna, correggi qui.</p>
    </div>
    <button type="button" class="btn btn-outline btn-block" data-action="open-add">${icon('plus', 'icon-sm')}Aggiungi alimento</button>
    ${ids.length ? sections : `<section class="card empty">${icon('pantry', 'icon-lg')}<h3>La dispensa è vuota</h3><p class="muted">Si riempie quando confermi la spesa. Se hai già qualcosa in casa, aggiungilo con il pulsante qui sopra.</p></section>`}
  `;
}

export const pantryActions = {
  'pantry-step': (el, ctx) => {
    const f = getFood(el.dataset.id);
    const step = pantryStep(f) * Number(el.dataset.delta);
    const cur = stockOf(ctx.state, f.id);
    ctx.commit((s) => setStock(s, f.id, Math.max(0, cur + step)));
  },
  'open-add': (el, ctx) => ctx.openSheet({ type: 'add' }),
  'pantry-remove': (el, ctx) => ctx.openSheet({ type: 'confirm-remove', id: el.dataset.id }),
};
