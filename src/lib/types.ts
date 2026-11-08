export type StoreKind = 'specialiste' | 'culture' | 'jouets' | 'jeux-video' | 'grande-surface';

export type Store = {
  id: string;
  name: string;
  kind: StoreKind;
  address: string | null;
  latitude: number;
  longitude: number;
  /** Opening hours in OpenStreetMap syntax (e.g. "Mo-Sa 09:30-19:30; Su off"), or null if unknown. */
  hours: string | null;
  /** True when the pin position is only approximate and still needs checking on site. */
  approxLocation?: boolean;
  note?: string;
};

export type StockLevel = 'beaucoup' | 'peu' | 'epuise';
export type QueueLevel = 'aucune' | 'petite' | 'longue';
export type PurchaseLimit = 'aucune' | '1' | '2' | '3+' | 'inconnue';

export type Report = {
  id: string;
  storeId: string;
  stock: StockLevel;
  queue: QueueLevel;
  limit: PurchaseLimit;
  createdAt: number;
};

export type NewReport = Omit<Report, 'id' | 'createdAt'>;

export type ReleaseType = 'Extension' | 'Coffret' | 'Deck' | 'Collection' | 'Boosters';

export type Release = {
  id: string;
  /** ISO date (YYYY-MM-DD), or null when only a vague period is known. */
  date: string | null;
  /** Shown instead of the date when `date` is null (e.g. "Début 2027"). */
  period?: string;
  title: string;
  type: ReleaseType;
  confirmed: boolean;
  note?: string;
};
