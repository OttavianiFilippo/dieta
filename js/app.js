// Avvio dell'app, navigazione e gestione eventi.

import { load, save } from './store.js';
import { toKey, weekKey } from './engine/dates.js';
import { processConsumption } from './engine/pantry.js';
import { renderToday, todayActions } from './views/today.js';
import { renderWeek, weekActions } from './views/week.js';
import { renderShop, shopActions } from './views/shop.js';
import { renderPantry, pantryActions } from './views/pantry.js';
import { renderSettings, settingsActions, importBackupFile } from './views/settings.js';
import { renderSheet, renderAddList, sheetActions } from './views/sheets.js';
import { icon } from './ui.js';

// Per le prove: ?now=2026-10-12T07:30 simula data e ora
const nowOverride = new URLSearchParams(location.search).get('now');
const clockOffset = nowOverride ? new Date(nowOverride).getTime() - Date.now() : 0;
const currentTime = () => new Date(Date.now() + clockOffset);

let state = load();
const initialToday = toKey(currentTime());
const ui = {
  tab: 'today',
  date: initialToday,
  week: weekKey(initialToday),
  sheet: null,
  shakerOpen: false,
  tipsOpen: false,
  historyOpen: false,
  pantryQuery: '',
  expanded: {},
};
let lastToday = initialToday;
const cache = {};

const TABS = [
  { id: 'today', label: 'Oggi', icon: 'today' },
  { id: 'week', label: 'Settimana', icon: 'week' },
  { id: 'shop', label: 'Spesa', icon: 'shop' },
  { id: 'pantry', label: 'Dispensa', icon: 'pantry' },
];

const VIEWS = {
  today: { title: 'Oggi', render: renderToday },
  week: { title: 'Settimana', render: renderWeek },
  shop: { title: 'Spesa', render: renderShop },
  pantry: { title: 'Dispensa', render: renderPantry },
  settings: { title: 'Impostazioni', render: renderSettings },
};

const ACTIONS = {
  ...todayActions,
  ...weekActions,
  ...shopActions,
  ...pantryActions,
  ...settingsActions,
  ...sheetActions,
  'close-sheet': (el, c) => c.closeSheet(),
  'open-settings': (el, c) => c.setUi({ tab: 'settings' }),
  'go-back': (el, c) => c.setUi({ tab: c.ui.prevTab || 'today' }),
};

const $view = document.getElementById('view');
const $title = document.getElementById('title');
const $tabbar = document.getElementById('tabbar');
const $sheetRoot = document.getElementById('sheet-root');
const $toast = document.getElementById('toast');
const $topLeft = document.getElementById('top-left');

function ctx() {
  const now = currentTime();
  return {
    state,
    ui,
    now,
    todayKey: toKey(now),
    cache,
    commit(mutator) {
      mutator(state);
      save(state);
      render();
    },
    replaceState(next) {
      state = next;
      processConsumption(state, currentTime());
      save(state);
      ui.sheet = null;
      render();
    },
    setUi(patch) {
      if (patch.tab && patch.tab !== ui.tab) {
        ui.prevTab = ui.tab === 'settings' ? ui.prevTab : ui.tab;
        window.scrollTo(0, 0);
      }
      Object.assign(ui, patch);
      render();
    },
    openSheet(sheet) {
      ui.sheet = sheet;
      if (sheet.type === 'add') ui.pantryQuery = '';
      render();
    },
    updateSheet(patch) {
      ui.sheet = { ...ui.sheet, ...patch };
      render();
    },
    closeSheet() {
      ui.sheet = null;
      render();
    },
    toast,
  };
}

let toastTimer;
function toast(msg) {
  $toast.textContent = msg;
  $toast.classList.add('is-on');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => $toast.classList.remove('is-on'), 2400);
}

function render() {
  const c = ctx();
  const view = VIEWS[ui.tab] || VIEWS.today;
  $title.textContent = view.title;
  $topLeft.innerHTML = ui.tab === 'settings'
    ? `<button type="button" class="icon-btn" data-action="go-back" aria-label="Indietro">${icon('back')}</button>`
    : '';
  $view.innerHTML = view.render(c);
  $tabbar.innerHTML = TABS.map((t) => `<button type="button" class="tab ${ui.tab === t.id ? 'is-on' : ''}" data-action="tab" data-tab="${t.id}" aria-label="${t.label}">${icon(t.icon)}<span>${t.label}</span></button>`).join('');
  renderSheetLayer(c);
}

function renderSheetLayer(c) {
  if (!ui.sheet) {
    if ($sheetRoot.firstChild) {
      $sheetRoot.innerHTML = '';
      document.body.classList.remove('sheet-open');
    }
    return;
  }
  const html = renderSheet(c);
  const existing = $sheetRoot.querySelector('.sheet-panel');
  if (existing) {
    const scroll = existing.scrollTop;
    existing.innerHTML = html;
    existing.scrollTop = scroll;
  } else {
    $sheetRoot.innerHTML = `<div class="sheet-backdrop" data-action="close-sheet"></div><div class="sheet-panel" role="dialog" aria-modal="true">${html}</div>`;
    document.body.classList.add('sheet-open');
  }
}

ACTIONS.tab = (el, c) => {
  const tab = el.dataset.tab;
  if (tab === 'today' && ui.tab === 'today') c.setUi({ date: c.todayKey });
  else if (tab === 'week' && ui.tab === 'week') c.setUi({ week: weekKey(c.todayKey) });
  else c.setUi({ tab });
};

document.addEventListener('click', (e) => {
  const el = e.target.closest('[data-action]');
  if (!el || el.disabled) return;
  const fn = ACTIONS[el.dataset.action];
  if (!fn) return;
  e.preventDefault();
  fn(el, ctx());
});

document.addEventListener('input', (e) => {
  const el = e.target;
  if (el.dataset.input === 'pantry-query') {
    ui.pantryQuery = el.value;
    const list = document.getElementById('add-list');
    if (list) list.innerHTML = renderAddList(ctx());
  }
});

document.addEventListener('change', (e) => {
  const el = e.target;
  if (el.dataset.input === 'backup-import' && el.files && el.files[0]) {
    importBackupFile(el.files[0], ctx());
    el.value = '';
  }
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && ui.sheet) ctx().closeSheet();
});

// Aggiorna la dispensa (pasti passati) e, se è cambiato il giorno, riporta su oggi.
function tick() {
  const now = currentTime();
  const today = toKey(now);
  const consumed = processConsumption(state, now);
  if (consumed) save(state);
  if (today !== lastToday) {
    if (ui.date === lastToday) ui.date = today;
    if (ui.week === weekKey(lastToday)) ui.week = weekKey(today);
    lastToday = today;
  }
  if (!ui.sheet) render();
}

document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') tick();
});
setInterval(tick, 60 * 1000);

processConsumption(state, currentTime());
save(state);
render();

if ('serviceWorker' in navigator && location.protocol !== 'file:' && !nowOverride) {
  navigator.serviceWorker.register('./sw.js').catch((e) => console.warn('Service worker non registrato', e));
}
