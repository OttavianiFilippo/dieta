// Impostazioni: piano, backup, azzeramento.

import { PLANS } from '../data/plans/index.js';
import { activePlan } from '../engine/plan.js';
import { exportBackup, parseBackup, defaultState } from '../store.js';
import { toKey, fmtShort } from '../engine/dates.js';
import { esc, icon } from '../ui.js';

export const APP_VERSION = '1.0.0';

export function renderSettings(ctx) {
  const { state } = ctx;
  const plan = activePlan(state);
  const plans = Object.values(PLANS);
  const lastBackup = state.lastBackup ? fmtShort(toKey(new Date(state.lastBackup))) : 'mai';
  return `
    <div class="page-intro">
      <h2>Impostazioni</h2>
    </div>

    <section class="card">
      <h3 class="card-title">Piano alimentare</h3>
      <p><strong>${esc(plan.title)}</strong> · ${esc(plan.date)}</p>
      <p class="muted small">${esc(plan.author)}</p>
      ${plans.length > 1 ? `<div class="segmented">${plans.map((p) => `<button type="button" class="${p.id === plan.id ? 'is-on' : ''}" data-action="set-plan" data-plan="${p.id}">${esc(p.title)}</button>`).join('')}</div>` : ''}
      <p class="muted small">Alla prossima visita caricheremo il nuovo piano qui: la dispensa e lo storico restano.</p>
    </section>

    <section class="card">
      <h3 class="card-title">Backup dei dati</h3>
      <p class="muted small">I dati restano solo su questo telefono. Esporta un backup ogni tanto e salvalo su iCloud Drive: se cambi telefono o cancelli l'app, lo reimporti. Ultimo backup: ${esc(lastBackup)}.</p>
      <div class="btn-row">
        <button type="button" class="btn btn-outline" data-action="backup-export">${icon('download', 'icon-sm')}Esporta</button>
        <label class="btn btn-outline">${icon('upload', 'icon-sm')}Importa<input type="file" accept="application/json,.json" data-input="backup-import" hidden></label>
      </div>
    </section>

    <section class="card">
      <h3 class="card-title">Azzera</h3>
      <p class="muted small">Cancella dispensa, spese, sostituzioni e scambi. Il piano resta.</p>
      <button type="button" class="btn btn-danger" data-action="reset-all">Cancella tutti i dati</button>
    </section>

    <p class="footnote">Dieta · versione ${APP_VERSION}</p>
  `;
}

async function shareOrDownload(text, filename) {
  const blob = new Blob([text], { type: 'application/json' });
  const file = new File([blob], filename, { type: 'application/json' });
  if (navigator.canShare && navigator.canShare({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: filename });
      return true;
    } catch (e) {
      if (e && e.name === 'AbortError') return false;
    }
  }
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
  return true;
}

export const settingsActions = {
  'set-plan': (el, ctx) => {
    ctx.commit((s) => { s.planId = el.dataset.plan; });
    ctx.toast('Piano cambiato');
  },
  'backup-export': async (el, ctx) => {
    const text = exportBackup(ctx.state);
    const ok = await shareOrDownload(text, `dieta-backup-${toKey(new Date())}.json`);
    if (ok) {
      ctx.commit((s) => { s.lastBackup = new Date().toISOString(); });
      ctx.toast('Backup esportato');
    }
  },
  'reset-all': (el, ctx) => {
    if (!window.confirm('Cancellare tutti i dati? Dispensa, spese, sostituzioni e scambi andranno persi.')) return;
    if (!window.confirm('Sicuro? Non si può annullare.')) return;
    ctx.replaceState(defaultState());
    ctx.toast('Dati cancellati');
  },
};

export async function importBackupFile(file, ctx) {
  try {
    const text = await file.text();
    const state = parseBackup(text);
    if (!window.confirm('Importare questo backup? I dati attuali verranno sostituiti.')) return;
    ctx.replaceState(state);
    ctx.toast('Backup importato');
  } catch (e) {
    window.alert(`Impossibile importare: ${e.message}`);
  }
}
