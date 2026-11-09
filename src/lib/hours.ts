/**
 * Minimal parser for the subset of OpenStreetMap `opening_hours` syntax used in our data:
 *   "Mo-Sa 09:30-19:30; Su off", "Mo 14:00-19:00; Tu-Sa 10:00-19:00", "Fr,Sa 08:45-20:00"
 * Days are indexed from Monday (0) to Sunday (6).
 */
export type Range = { open: number; close: number };
export type WeekHours = Range[][];

const DAY_CODES = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
export const DAY_SHORT = ['LUN', 'MAR', 'MER', 'JEU', 'VEN', 'SAM', 'DIM'];
const DAY_LONG = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'];

function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
}

function expandDays(spec: string): number[] {
  const days: number[] = [];
  for (const part of spec.split(',')) {
    const [from, to] = part.split('-');
    const start = DAY_CODES.indexOf(from);
    const end = to ? DAY_CODES.indexOf(to) : start;
    if (start < 0 || end < 0) continue;
    for (let d = start; d <= end; d++) days.push(d);
  }
  return days;
}

export function parseHours(spec: string): WeekHours {
  const week: WeekHours = [[], [], [], [], [], [], []];
  for (const rule of spec.split(';').map((r) => r.trim()).filter(Boolean)) {
    const [daysPart, timesPart] = rule.split(/\s+/);
    const days = expandDays(daysPart);
    const ranges =
      timesPart === 'off'
        ? []
        : timesPart.split(',').map((r) => {
            const [open, close] = r.split('-');
            return { open: toMinutes(open), close: toMinutes(close) };
          });
    for (const d of days) week[d] = ranges;
  }
  return week;
}

/** Monday-based index of the given date's weekday. */
export function weekdayIndex(date: Date): number {
  return (date.getDay() + 6) % 7;
}

/** 570 -> "9h30", 1140 -> "19h" */
export function formatMinutes(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m === 0 ? `${h}h` : `${h}h${String(m).padStart(2, '0')}`;
}

export function formatRanges(ranges: Range[]): string {
  if (ranges.length === 0) return 'Fermé';
  return ranges.map((r) => `${formatMinutes(r.open)} – ${formatMinutes(r.close)}`).join(', ');
}

export type OpenState = {
  state: 'open' | 'closed' | 'unknown';
  /** Short word for a pill: "Ouvert", "Fermé", "Horaires". */
  badge: string;
  /** What follows the pill: "jusqu’à 19h", "ouvre demain à 9h". */
  detail: string;
  /** Both together, for plain text. */
  label: string;
};

function make(state: OpenState['state'], badge: string, detail: string): OpenState {
  return { state, badge, detail, label: detail ? `${badge} · ${detail}` : badge };
}

export function openState(spec: string | null, now: Date = new Date()): OpenState {
  if (!spec) return make('unknown', 'Horaires', 'à confirmer');
  const week = parseHours(spec);
  const today = weekdayIndex(now);
  const minutes = now.getHours() * 60 + now.getMinutes();

  const current = week[today].find((r) => minutes >= r.open && minutes < r.close);
  if (current) return make('open', 'Ouvert', `jusqu’à ${formatMinutes(current.close)}`);

  const laterToday = week[today].find((r) => r.open > minutes);
  if (laterToday) return make('closed', 'Fermé', `ouvre à ${formatMinutes(laterToday.open)}`);

  for (let offset = 1; offset <= 7; offset++) {
    const day = (today + offset) % 7;
    const first = week[day][0];
    if (first) {
      const when = offset === 1 ? 'demain' : DAY_LONG[day];
      return make('closed', 'Fermé', `ouvre ${when} à ${formatMinutes(first.open)}`);
    }
  }
  return make('closed', 'Fermé', '');
}

const DAY_NAME = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

export type HoursRow = { label: string; hours: string; isToday: boolean; closed: boolean };

/** Week grouped into rows: consecutive days with the same hours share a row; today always gets its own. */
export function groupedWeek(spec: string, today: number): HoursRow[] {
  const week = parseHours(spec);
  const rows: HoursRow[] = [];
  let start = 0;
  for (let d = 1; d <= 7; d++) {
    const sameAsGroup =
      d < 7 && d !== today && start !== today && formatRanges(week[d]) === formatRanges(week[start]);
    if (sameAsGroup) continue;
    const end = d - 1;
    const name = start === end ? DAY_NAME[start] : `${DAY_NAME[start]} – ${DAY_NAME[end].toLowerCase()}`;
    rows.push({
      label: start === today ? `${name} · aujourd’hui` : name,
      hours: formatRanges(week[start]),
      isToday: start === today,
      closed: week[start].length === 0,
    });
    start = d;
  }
  return rows;
}

/** First opening and last closing minute today, or null when closed or unknown. */
export function todayBounds(spec: string | null, now: Date = new Date()): Range | null {
  if (!spec) return null;
  const ranges = parseHours(spec)[weekdayIndex(now)];
  if (ranges.length === 0) return null;
  return { open: ranges[0].open, close: ranges[ranges.length - 1].close };
}
