import type { Release } from '@/lib/types';

/**
 * Card-game release calendar for France, compiled on 2026-11-09 from fan calendars and,
 * where noted, official publisher pages. "confirmed: false" means sources disagree or the
 * publisher has not confirmed the date. One Piece, Dragon Ball Super and Digimon are sold
 * in English in Europe; their dates are the worldwide English release.
 */
export const RELEASES: Release[] = [
  // Pokémon (sources: tcg-actu.fr, lebooster.fr)
  {
    id: 'pkm-me06',
    franchise: 'pokemon',
    date: '2026-11-06',
    title: 'Méga-Évolution — Règne Delta (ME06)',
    type: 'Extension',
    confirmed: true,
    note: 'Boosters, display, Coffret Dresseur d’élite (55,99 €), tripack.',
  },
  {
    id: 'pkm-upc-soiree',
    franchise: 'pokemon',
    date: '2026-11-06',
    title: 'Collection Ultra-Premium 30ᵉ Anniversaire « Soirée » (Noctali-ex)',
    type: 'Coffret',
    confirmed: false,
    note: '229,99 € selon les calendriers de fans.',
  },
  {
    id: 'pkm-deck-ligue-amphinobi',
    franchise: 'pokemon',
    date: '2026-11-13',
    title: 'Deck Combat de Ligue Méga-Amphinobi-ex',
    type: 'Deck',
    confirmed: false,
    note: '24,99 €.',
  },
  {
    id: 'pkm-collections-autocollant',
    franchise: 'pokemon',
    date: '2026-11-13',
    title: 'Collections autocollant 30ᵉ Anniversaire (Lucario, Noadkoko d’Alola)',
    type: 'Collection',
    confirmed: false,
    note: '19,99 € chacune.',
  },
  {
    id: 'pkm-blisters-me06',
    franchise: 'pokemon',
    date: '2026-11-13',
    title: 'Boosters Règne Delta sous blister',
    type: 'Boosters',
    confirmed: false,
  },
  {
    id: 'pkm-upc-journee',
    franchise: 'pokemon',
    date: '2026-11-27',
    title: 'Collection Ultra-Premium 30ᵉ Anniversaire « Journée » (Mentali-ex)',
    type: 'Coffret',
    confirmed: false,
    note: '229,99 €. Certaines sources annonçaient le 6 novembre.',
  },
  {
    id: 'pkm-figurine-mewtwo',
    franchise: 'pokemon',
    date: '2026-11-27',
    title: 'Collection avec figurine Mewtwo 30ᵉ Anniversaire',
    type: 'Collection',
    confirmed: false,
    note: '37,99 €.',
  },
  {
    id: 'pkm-tournoi-rayquaza',
    franchise: 'pokemon',
    date: '2027-02-12',
    title: 'Collection Tournoi Premium Méga-Rayquaza-ex',
    type: 'Collection',
    confirmed: false,
    note: 'Date française incertaine : 31 janvier ou 12 février.',
  },
  {
    id: 'pkm-aura-seeker-fr',
    franchise: 'pokemon',
    date: null,
    period: 'Début 2027',
    title: 'Version française de « Aura Seeker » (nom à venir)',
    type: 'Extension',
    confirmed: false,
    note: 'Sortie anglaise annoncée le 5 février 2027 (Flowing Fists).',
  },

  // Yu-Gi-Oh! (sources: maisondubooster.com, jeudecarte.net, lorenzone.fr)
  {
    id: 'ygo-magnificent-maestros',
    franchise: 'yugioh',
    date: '2026-11-12',
    title: 'Les Maîtres Fantastiques (Magnificent Maestros)',
    type: 'Collection',
    confirmed: false,
    note: 'Dans la lignée des Monstres Fantastiques.',
  },
  {
    id: 'ygo-glorious-victors',
    franchise: 'yugioh',
    date: '2026-12-03',
    title: 'Glorious Victors',
    type: 'Boosters',
    confirmed: false,
    note: 'Booster de 60 cartes. Certaines sources disent le 4 décembre.',
  },

  // One Piece Card Game (source: rarix.be)
  {
    id: 'op-18',
    franchise: 'onepiece',
    date: '2026-11-20',
    title: 'OP-18 — The Dominance of God',
    type: 'Extension',
    confirmed: false,
    note: 'Sortie mondiale simultanée (la veille du Japon).',
  },

  // Dragon Ball Super Fusion World (sources: dbs-cardgame.com, icv2.com, grailborne.com.au)
  {
    id: 'dbs-fb12',
    franchise: 'dbs',
    date: '2026-12-18',
    title: 'FB-12 — Reach the God',
    type: 'Extension',
    confirmed: true,
    note: 'Version anglaise, page produit officielle Bandai.',
  },
  {
    id: 'dbs-st02',
    franchise: 'dbs',
    date: '2027-01-15',
    title: 'Story Booster 02 (ST-02)',
    type: 'Boosters',
    confirmed: false,
  },
  {
    id: 'dbs-fb13',
    franchise: 'dbs',
    date: '2027-03-03',
    title: 'FB-13 — booster du 3ᵉ anniversaire',
    type: 'Extension',
    confirmed: false,
    note: 'Le 3 ou le 12 mars selon les sources.',
  },

  // Digimon Card Game (sources: official English X account and product pages)
  {
    id: 'dcg-bt27',
    franchise: 'digimon',
    date: '2026-12-11',
    title: 'BT-27 — Booster Ignition of X',
    type: 'Extension',
    confirmed: true,
    note: 'Avant-première le 4 décembre. Version anglaise.',
  },
  {
    id: 'dcg-ex14',
    franchise: 'digimon',
    date: '2027-01-23',
    title: 'EX-14 — Extra Booster Malevolent VII',
    type: 'Boosters',
    confirmed: true,
  },
  {
    id: 'dcg-bt30',
    franchise: 'digimon',
    date: null,
    period: 'Août 2027',
    title: 'BT-30 — booster des 30 ans du V-Pet',
    type: 'Extension',
    confirmed: true,
    note: 'Mois annoncé par Bandai, jour à venir.',
  },
];
