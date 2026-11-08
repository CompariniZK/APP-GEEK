import type { Release } from '@/lib/types';

/**
 * French TCG release calendar, compiled on 2026-11-08 from fan calendars
 * (tcg-actu.fr, lebooster.fr). "confirmed: false" means sources disagree or the
 * publisher has not confirmed the French date yet.
 */
export const RELEASES: Release[] = [
  {
    id: 'me06',
    date: '2026-11-06',
    title: 'Méga-Évolution — Règne Delta (ME06)',
    type: 'Extension',
    confirmed: true,
    note: 'Boosters, display, Coffret Dresseur d’élite (55,99 €), tripack.',
  },
  {
    id: 'upc-soiree',
    date: '2026-11-06',
    title: 'Collection Ultra-Premium 30ᵉ Anniversaire « Soirée » (Noctali-ex)',
    type: 'Coffret',
    confirmed: false,
    note: '229,99 € selon les calendriers de fans.',
  },
  {
    id: 'deck-ligue-amphinobi',
    date: '2026-11-13',
    title: 'Deck Combat de Ligue Méga-Amphinobi-ex',
    type: 'Deck',
    confirmed: false,
    note: '24,99 €.',
  },
  {
    id: 'collections-autocollant',
    date: '2026-11-13',
    title: 'Collections autocollant 30ᵉ Anniversaire (Lucario, Noadkoko d’Alola)',
    type: 'Collection',
    confirmed: false,
    note: '19,99 € chacune.',
  },
  {
    id: 'blisters-me06',
    date: '2026-11-13',
    title: 'Boosters Règne Delta sous blister',
    type: 'Boosters',
    confirmed: false,
  },
  {
    id: 'upc-journee',
    date: '2026-11-27',
    title: 'Collection Ultra-Premium 30ᵉ Anniversaire « Journée » (Mentali-ex)',
    type: 'Coffret',
    confirmed: false,
    note: '229,99 €. Certaines sources annonçaient le 6 novembre.',
  },
  {
    id: 'figurine-mewtwo',
    date: '2026-11-27',
    title: 'Collection avec figurine Mewtwo 30ᵉ Anniversaire',
    type: 'Collection',
    confirmed: false,
    note: '37,99 €.',
  },
  {
    id: 'tournoi-rayquaza',
    date: '2027-02-12',
    title: 'Collection Tournoi Premium Méga-Rayquaza-ex',
    type: 'Collection',
    confirmed: false,
    note: 'Date française incertaine : 31 janvier ou 12 février.',
  },
  {
    id: 'aura-seeker-fr',
    date: null,
    period: 'Début 2027',
    title: 'Version française de « Aura Seeker » (nom à venir)',
    type: 'Extension',
    confirmed: false,
    note: 'Sortie anglaise annoncée le 5 février 2027 (Flowing Fists).',
  },
];
