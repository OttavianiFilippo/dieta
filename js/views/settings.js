// Impostazioni: piano, backup, azzeramento.

import { PLANS } from '../data/plans/index.js';
import { activePlan } from '../engine/plan.js';
import { exportBackup, parseBackup, defaultState } from '../store.js';
import { toKey, fmtShort, fmtDayMonth } from '../engine/dates.js';
import { isPaused, neverStarted, currentPause, pauseDiet, resumeDiet } from '../engine/pantry.js';
import { esc, icon } from '../ui.js';

export const APP_VERSION = '1.1.0';

export function renderSettings(ctx) {
  const { state } = ctx;
  const plan = activePlan(state);
  const plans = Object.values(PLANS);
  const lastBackup = state.lastBackup ? fmtShort(toKey(new Date(state.lastBackup))) : 'mai';
  return `
    <div class="page-intro">
      <h2>Impostazioni</h2>
    </div>

    ${renderDietState(state)}

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

function renderDietState(state) {
  const paused = isPaused(state);
  const never = neverStarted(state);
  const since = (iso) => fmtDayMonth(toKey(new Date(iso)));
  const last = state.pauses[state.pauses.length - 1];
  let title, text, btn;
  if (never) {
    title = 'Dieta non ancora avviata';
    text = 'Vedi il piano e puoi preparare la spesa, ma i pasti non vengono scalati dalla dispensa. Avviala quando vuoi iniziare davvero.';
    btn = `<button type="button" class="btn btn-primary btn-block" data-action="diet-resume">${icon('play', 'icon-sm')}Avvia la dieta</button>`;
  } else if (paused) {
    title = `In pausa dal ${since(currentPause(state).from)}`;
    text = 'I giorni passano ma la dispensa non viene scalata. Quando ricominci, premi Riprendi.';
    btn = `<button type="button" class="btn btn-primary btn-block" data-action="diet-resume">${icon('play', 'icon-sm')}Riprendi la dieta</button>`;
  } else {
    title = `Attiva dal ${since(last && last.to ? last.to : state.createdAt)}`;
    text = 'Dopo l\u2019orario di ogni pasto, quello che c\u2019era nel piano viene scalato dalla dispensa. Se vai in vacanza o non puoi seguire la dieta, metti in pausa.';
    btn = `<button type="button" class="btn btn-outline btn-block" data-action="diet-pause">${icon('pause', 'icon-sm')}Metti in pausa</button>`;
  }
  return `<section class="card diet-state ${paused ? 'is-paused' : 'is-active'}">
    <h3 class="card-title">Stato della dieta</h3>
    <p><strong>${esc(title)}</strong></p>
    <p class="muted small">${text}</p>
    ${btn}
  </section>`;
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
  'diet-resume': (el, ctx) => {
    const first = neverStarted(ctx.state);
    ctx.commit((s) => resumeDiet(s, ctx.now));
    ctx.toast(first ? 'Dieta avviata: da ora i pasti vengono scalati' : 'Dieta ripresa');
  },
  'diet-pause': (el, ctx) => {
    ctx.commit((s) => pauseDiet(s, ctx.now));
    ctx.toast('Dieta in pausa: la dispensa non viene scalata');
  },
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
