// Date in formato locale "YYYY-MM-DD". La settimana parte dal lunedì.

const pad = (n) => String(n).padStart(2, '0');

export function toKey(d) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function fromKey(key) {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function addDays(key, n) {
  const d = fromKey(key);
  d.setDate(d.getDate() + n);
  return toKey(d);
}

// 0 = lunedì … 6 = domenica
export function weekdayIdx(key) {
  return (fromKey(key).getDay() + 6) % 7;
}

export function weekKey(key) {
  return addDays(key, -weekdayIdx(key));
}

export function weekDates(wk) {
  return Array.from({ length: 7 }, (_, i) => addDays(wk, i));
}

export function diffDays(a, b) {
  return Math.round((fromKey(b) - fromKey(a)) / 86400000);
}

// Data + "HH:MM" → Date
export function at(key, hhmm) {
  const d = fromKey(key);
  const [h, m] = hhmm.split(':').map(Number);
  d.setHours(h, m, 0, 0);
  return d;
}

const GIORNI = ['lunedì', 'martedì', 'mercoledì', 'giovedì', 'venerdì', 'sabato', 'domenica'];
const GIORNI_BREVI = ['lun', 'mar', 'mer', 'gio', 'ven', 'sab', 'dom'];
const MESI = ['gennaio', 'febbraio', 'marzo', 'aprile', 'maggio', 'giugno', 'luglio', 'agosto', 'settembre', 'ottobre', 'novembre', 'dicembre'];

export function fmtLong(key) {
  const d = fromKey(key);
  return `${GIORNI[weekdayIdx(key)]} ${d.getDate()} ${MESI[d.getMonth()]}`;
}

export function fmtShort(key) {
  const d = fromKey(key);
  return `${GIORNI_BREVI[weekdayIdx(key)]} ${d.getDate()}`;
}

export function fmtDayMonth(key) {
  const d = fromKey(key);
  return `${d.getDate()} ${MESI[d.getMonth()]}`;
}

export function weekdayName(key) {
  return GIORNI[weekdayIdx(key)];
}

export function relativeLabel(key, todayKey) {
  const n = diffDays(todayKey, key);
  if (n === 0) return 'oggi';
  if (n === 1) return 'domani';
  if (n === -1) return 'ieri';
  return fmtShort(key);
}
