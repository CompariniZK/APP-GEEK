import type { FranchiseId, Store, StoreKind } from '@/lib/types';

type StoreInput = Omit<Store, 'franchises'> & { franchises?: FranchiseId[] };

/**
 * Which card games a kind of store usually sells. This is an ESTIMATE used until the
 * community confirms each store's range; the app labels it "à confirmer".
 */
const RANGE_BY_KIND: Record<StoreKind, FranchiseId[]> = {
  specialiste: ['pokemon', 'yugioh', 'onepiece', 'dbs', 'digimon'],
  culture: ['pokemon', 'yugioh', 'onepiece', 'dbs'],
  'jeux-video': ['pokemon', 'yugioh', 'onepiece'],
  jouets: ['pokemon', 'yugioh'],
  'grande-surface': ['pokemon', 'yugioh'],
};

/**
 * Stores in La Roche-sur-Yon likely to sell trading cards.
 * Positions and opening hours come from OpenStreetMap (© OpenStreetMap contributors, ODbL),
 * fetched on 2026-11-08. Hours marked null were missing in OpenStreetMap and must be checked on site.
 */
const RAW_STORES: StoreInput[] = [
  {
    id: 'sortileges',
    name: 'Sortilèges',
    kind: 'specialiste',
    address: '2 rue des Halles, 85000 La Roche-sur-Yon',
    latitude: 46.6691,
    longitude: -1.42575,
    hours: 'Mo 14:00-19:00; Tu-Sa 10:00-19:00; Su off',
    note: 'Boutique de jeux : cartes à collectionner et tournois.',
  },
  {
    id: 'fnac',
    name: 'Fnac',
    kind: 'culture',
    address: 'Rue Philippe Lebon, 85000 La Roche-sur-Yon',
    latitude: 46.70004,
    longitude: -1.43228,
    hours: 'Mo-Sa 09:30-19:30; Su off',
  },
  {
    id: 'cultura',
    name: 'Cultura',
    kind: 'culture',
    address: '55 rue Volta, 85000 La Roche-sur-Yon',
    latitude: 46.6962,
    longitude: -1.43183,
    // cultura.com store page, Bonial, Mappy (checked 2026-11-11)
    hours: 'Mo-Sa 09:00-20:00; Su off',
    approxLocation: true,
  },
  {
    id: 'micromania',
    name: 'Micromania',
    kind: 'jeux-video',
    address: 'Centre commercial Les Flâneries, 85000 La Roche-sur-Yon',
    latitude: 46.69777,
    longitude: -1.43312,
    hours: 'Mo-Sa 09:30-19:30; Su off',
  },
  {
    id: 'king-jouet',
    name: 'King Jouet',
    kind: 'jouets',
    address: '24 rue des Flâneries, 85000 La Roche-sur-Yon',
    latitude: 46.69934,
    longitude: -1.43238,
    // king-jouet.com store page (checked 2026-11-11)
    hours: 'Mo-Sa 09:30-19:30; Su off',
  },
  {
    id: 'joueclub',
    name: 'JouéClub',
    kind: 'jouets',
    address: null,
    latitude: 46.64505,
    longitude: -1.43718,
    hours: null,
  },
  {
    id: 'leclerc-culturel-sud',
    name: 'Espace culturel E.Leclerc',
    kind: 'culture',
    address: null,
    latitude: 46.64956,
    longitude: -1.43745,
    // Bonial listing (checked 2026-11-11), to confirm on site
    hours: 'Mo-Sa 08:45-20:00; Su off',
  },
  {
    id: 'leclerc-sud',
    name: 'E.Leclerc (sud)',
    kind: 'grande-surface',
    address: null,
    latitude: 46.64867,
    longitude: -1.43795,
    hours: 'Mo-Th 08:45-19:30; Fr,Sa 08:45-20:00; Su off',
  },
  {
    id: 'leclerc-est',
    name: 'E.Leclerc (est)',
    kind: 'grande-surface',
    address: null,
    latitude: 46.67192,
    longitude: -1.40599,
    hours: 'Mo-Th 08:45-19:30; Fr,Sa 08:45-20:00; Su off',
  },
  {
    id: 'hyper-u',
    name: 'Hyper U',
    kind: 'grande-surface',
    address: null,
    latitude: 46.70238,
    longitude: -1.43179,
    hours: 'Mo-Sa 09:00-20:00; Su off',
  },
  {
    id: 'carrefour',
    name: 'Carrefour',
    kind: 'grande-surface',
    address: null,
    latitude: 46.6662,
    longitude: -1.45285,
    hours: 'Mo-Sa 08:30-20:30; Su 08:30-12:45',
  },
  {
    id: 'super-u',
    name: 'Super U',
    kind: 'grande-surface',
    address: null,
    latitude: 46.66641,
    longitude: -1.4081,
    hours: 'Mo-Sa 08:30-20:00; Su 09:00-12:45',
  },
  {
    id: 'intermarche',
    name: 'Intermarché Super',
    kind: 'grande-surface',
    address: null,
    latitude: 46.68258,
    longitude: -1.43914,
    hours: 'Mo-Sa 09:00-20:00; Su 09:00-12:45',
  },
];

export const STORES: Store[] = RAW_STORES.map((s) => ({ ...s, franchises: s.franchises ?? RANGE_BY_KIND[s.kind] }));

export function storesFor(franchise: FranchiseId): Store[] {
  return STORES.filter((s) => s.franchises.includes(franchise));
}

export const CITY_NAME = 'La Roche-sur-Yon';

export const CITY_REGION = {
  latitude: 46.6745,
  longitude: -1.4290,
  latitudeDelta: 0.075,
  longitudeDelta: 0.075,
};

export function findStore(id: string | undefined): Store | undefined {
  return STORES.find((s) => s.id === id);
}
