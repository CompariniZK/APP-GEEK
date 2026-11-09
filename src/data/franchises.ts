import type { Franchise, FranchiseId } from '@/lib/types';

/**
 * Card games covered by RadarGeek. Names are used only to say which cards a store sells;
 * no logos or official artwork, each game just gets its own colour and the abbreviation fans use.
 */
export const FRANCHISES: Franchise[] = [
  { id: 'pokemon', name: 'Pokémon', short: 'PKM', color: '#F2B705', onColor: '#16140F', tint: '#FBF0C9', tintDark: '#3A2F0B' },
  { id: 'yugioh', name: 'Yu-Gi-Oh!', short: 'YGO', color: '#5B3FA8', onColor: '#FFFFFF', tint: '#E9E3F6', tintDark: '#2A2142' },
  { id: 'onepiece', name: 'One Piece', short: 'OP', color: '#1F6FB2', onColor: '#FFFFFF', tint: '#DCE9F5', tintDark: '#14283B' },
  { id: 'dbs', name: 'Dragon Ball Super', short: 'DBS', color: '#F07C1A', onColor: '#16140F', tint: '#FCE6D3', tintDark: '#3B2410' },
  { id: 'digimon', name: 'Digimon', short: 'DCG', color: '#138A8A', onColor: '#FFFFFF', tint: '#D7EEEE', tintDark: '#113131' },
];

export const DEFAULT_FRANCHISE: FranchiseId = 'pokemon';

export function getFranchise(id: FranchiseId | string | undefined | null): Franchise {
  return FRANCHISES.find((f) => f.id === id) ?? FRANCHISES[0];
}

export function isFranchiseId(value: unknown): value is FranchiseId {
  return FRANCHISES.some((f) => f.id === value);
}
