// Schermata "Settimana": giorni con il piano assegnato e controlli settimanali.

import { activePlan, weekAssignment, isDayOff, resetWeek } from '../engine/plan.js';
import { weekDates, addDays, fmtShort, fmtDayMonth, diffDays, weekKey } from '../engine/dates.js';
import { weekChecks } from '../engine/checks.js';
import { withConsumptionDelta } from '../engine/pantry.js';
import { esc, icon } from '../ui.js';

export function renderWeek(ctx) {
  const { state, ui, todayKey } = ctx;
  const wk = ui.week;
  const plan = activePlan(state);
  const arr = weekAssignment(state, wk);
  const dates = weekDates(wk);
  const swapped = !!state.assignments[wk];
  const isCurrent = wk === weekKey(todayKey);
  const checks = weekChecks(state, wk);

  const rows = dates.map((d, i) => {
    const pid = arr[i];
    const day = plan.days[pid];
    const diff = diffDays(todayKey, d);
    const off = isDayOff(state, d);
    const moved = pid !== plan.order[i];
    return `<div class="week-row ${diff === 0 ? 'is-today' : ''} ${diff < 0 ? 'is-past' : ''}">
      <button type="button" class="week-day" data-action="week-open-day" data-date="${d}">
        <span class="week-date">${esc(fmtShort(d))}</span>
        <span class="week-plan">
          <strong>${esc(day.activity)}</strong>
          <small>Piano: ${esc(day.name)} · ${day.kcal} kcal</small>
          ${diff === 0 || moved || off ? `<span class="week-badges">
            ${diff === 0 ? '<span class="badge badge-next">Oggi</span>' : ''}
            ${moved ? '<span class="badge">Scambiato</span>' : ''}
            ${off ? '<span class="badge badge-off">Fuori piano</span>' : ''}
          </span>` : ''}
        </span>
      </button>
      ${diff < 0 ? '' : `<button type="button" class="icon-btn" data-action="open-swap" data-date="${d}" aria-label="Cambia giornata">${icon('swap')}</button>`}
    </div>`;
  }).join('');

  return `
    <div class="day-nav">
      <button type="button" class="icon-btn" data-action="week-prev" aria-label="Settimana precedente">${icon('left')}</button>
      <div class="day-nav-title">
        <span class="eyebrow">${isCurrent ? 'questa settimana' : 'settimana'}</span>
        <strong>${esc(fmtDayMonth(dates[0]))} – ${esc(fmtDayMonth(dates[6]))}</strong>
      </div>
      <button type="button" class="icon-btn" data-action="week-next" aria-label="Settimana successiva">${icon('right')}</button>
    </div>
    ${!isCurrent ? `<button type="button" class="chip chip-center" data-action="week-current">Torna a questa settimana</button>` : ''}

    <section class="card">
      <h3 class="card-title">Controlli della settimana</h3>
      <div class="checks">
        ${checks.map((c) => `<div class="check ${c.ok ? 'is-ok' : 'is-warn'}">
          <span class="check-label">${esc(c.label)}</span>
          <strong>${c.value} <small>${esc(c.unit)}</small></strong>
          <span class="check-target">${esc(c.target)}</span>
        </div>`).join('')}
      </div>
      ${checks.filter((c) => c.hint).map((c) => `<p class="hint">${icon('info', 'icon-sm')}${esc(c.hint)}</p>`).join('')}
    </section>

    <section class="card card-list">
      <div class="card-title-row">
        <h3 class="card-title">Giorni</h3>
        ${swapped ? `<button type="button" class="link-btn" data-action="week-reset">${icon('undo', 'icon-sm')}Ordine originale</button>` : ''}
      </div>
      ${rows}
    </section>

    <section class="card">
      <button type="button" class="collapse-head" data-action="toggle-tips">
        <h3 class="card-title">Consigli del nutrizionista</h3>${icon(ui.tipsOpen ? 'minus' : 'plus')}
      </button>
      ${ui.tipsOpen ? `<ul class="tips">${plan.tips.map((t) => `<li>${esc(t)}</li>`).join('')}</ul>` : ''}
    </section>
  `;
}

export const weekActions = {
  'week-prev': (el, ctx) => ctx.setUi({ week: addDays(ctx.ui.week, -7) }),
  'week-next': (el, ctx) => ctx.setUi({ week: addDays(ctx.ui.week, 7) }),
  'week-current': (el, ctx) => ctx.setUi({ week: weekKey(ctx.todayKey) }),
  'week-open-day': (el, ctx) => ctx.setUi({ tab: 'today', date: el.dataset.date }),
  'toggle-tips': (el, ctx) => ctx.setUi({ tipsOpen: !ctx.ui.tipsOpen }),
  'week-reset': (el, ctx) => {
    const wk = ctx.ui.week;
    const arr = weekAssignment(ctx.state, wk);
    const order = activePlan(ctx.state).order;
    const dates = weekDates(wk);
    // Non si toccano i giorni passati
    const pastChanged = dates.some((d, i) => diffDays(ctx.todayKey, d) < 0 && arr[i] !== order[i]);
    if (pastChanged) {
      ctx.toast('Alcuni giorni passati sono scambiati: cambia i singoli giorni.');
      return;
    }
    ctx.commit((s) => withConsumptionDelta(s, dates, () => resetWeek(s, wk)));
    ctx.toast('Ripristinato l’ordine originale');
  },
};
