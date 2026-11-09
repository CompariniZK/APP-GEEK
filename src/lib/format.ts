import type { PurchaseLimit, QueueLevel, StockLevel, StoreKind } from '@/lib/types';

/** A report older than this no longer counts as the store's current situation. */
export const FRESH_MS = 3 * 60 * 60 * 1000;

export const KIND_LABEL: Record<StoreKind, string> = {
  specialiste: 'Boutique spécialisée',
  culture: 'Culture & loisirs',
  jouets: 'Magasin de jouets',
  'jeux-video': 'Jeux vidéo',
  'grande-surface': 'Grande surface',
};

export const STOCK_LABEL: Record<StockLevel, string> = {
  beaucoup: 'En stock',
  peu: 'Presque plus',
  epuise: 'Épuisé',
};

export const QUEUE_LABEL: Record<QueueLevel, string> = {
  aucune: 'Pas de file',
  petite: 'Petite file',
  longue: 'Longue file',
};

export const QUEUE_DETAIL: Record<QueueLevel, string> = {
  aucune: 'On entre directement',
  petite: 'Moins de 10 personnes',
  longue: '10 personnes ou plus',
};

export const LIMIT_LABEL: Record<PurchaseLimit, string> = {
  aucune: 'Pas de limite',
  '1': '1 par client',
  '2': '2 par client',
  '3+': '3+ par client',
  inconnue: 'Limite inconnue',
};

export function formatAgo(timestamp: number, now: number): string {
  const minutes = Math.floor((now - timestamp) / 60000);
  if (minutes < 1) return 'à l’instant';
  if (minutes < 60) return `il y a ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `il y a ${hours} h`;
  return `il y a ${Math.floor(hours / 24)} j`;
}

export function formatClock(timestamp: number): string {
  const d = new Date(timestamp);
  return `${d.getHours()}h${String(d.getMinutes()).padStart(2, '0')}`;
}

const MONTHS_SHORT = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];
const MONTHS_LONG = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
];

/** Parses "YYYY-MM-DD" as a local date (not UTC). */
export function parseLocalDate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function monthShort(date: Date): string {
  return MONTHS_SHORT[date.getMonth()];
}

export function monthName(date: Date): string {
  return MONTHS_LONG[date.getMonth()].toLowerCase();
}

const WEEKDAYS_LONG = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];

/** "Vendredi 13 novembre" */
export function longDate(date: Date): string {
  const text = `${WEEKDAYS_LONG[date.getDay()]} ${date.getDate()} ${monthName(date)}`;
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function sameMonth(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
}

export function monthTitle(date: Date): string {
  return `${MONTHS_LONG[date.getMonth()]} ${date.getFullYear()}`;
}

/** Whole days from today to the given date (negative when in the past). */
export function daysUntil(date: Date, now: Date = new Date()): number {
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((date.getTime() - start.getTime()) / 86400000);
}

/** French countdown notation: "J-5", "Jour J", "Sorti". */
export function countdownLabel(days: number): string {
  if (days > 0) return `J-${days}`;
  if (days === 0) return 'Jour J';
  return 'Sorti';
}
