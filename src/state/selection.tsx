import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

import type { LatLng } from '@/lib/geo';

/**
 * Which store is selected on the map, whether its sheet is open, and the user's position.
 * Shared between the map (under the sheet) and the store sheet, so tapping another pin
 * while the sheet is open swaps its content instead of stacking a second sheet.
 */
type SelectionState = {
  selectedId: string | null;
  select: (id: string | null) => void;
  sheetOpen: boolean;
  setSheetOpen: (open: boolean) => void;
  userLocation: LatLng | null;
  setUserLocation: (location: LatLng | null) => void;
};

const SelectionContext = createContext<SelectionState | null>(null);

export function SelectionProvider({ children }: { children: ReactNode }) {
  const [selectedId, select] = useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [userLocation, setUserLocation] = useState<LatLng | null>(null);

  const value = useMemo(
    () => ({ selectedId, select, sheetOpen, setSheetOpen, userLocation, setUserLocation }),
    [selectedId, sheetOpen, userLocation],
  );
  return <SelectionContext.Provider value={value}>{children}</SelectionContext.Provider>;
}

export function useSelection(): SelectionState {
  const ctx = useContext(SelectionContext);
  if (!ctx) throw new Error('useSelection must be used inside <SelectionProvider>');
  return ctx;
}
