import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { DEFAULT_FRANCHISE, getFranchise, isFranchiseId } from '@/data/franchises';
import type { Franchise, FranchiseId } from '@/lib/types';

/** The card game the fan is currently hunting. Remembered between launches. */
const KEY = 'radargeek/franchise/v1';

type FranchiseState = { franchise: Franchise; setFranchise: (id: FranchiseId) => void };

const FranchiseContext = createContext<FranchiseState | null>(null);

export function FranchiseProvider({ children }: { children: ReactNode }) {
  const [id, setId] = useState<FranchiseId>(DEFAULT_FRANCHISE);

  useEffect(() => {
    AsyncStorage.getItem(KEY)
      .then((saved) => {
        if (isFranchiseId(saved)) setId(saved);
      })
      .catch(() => {});
  }, []);

  const setFranchise = useCallback((next: FranchiseId) => {
    setId(next);
    AsyncStorage.setItem(KEY, next).catch(() => {});
  }, []);

  const value = useMemo(() => ({ franchise: getFranchise(id), setFranchise }), [id, setFranchise]);
  return <FranchiseContext.Provider value={value}>{children}</FranchiseContext.Provider>;
}

export function useFranchise(): FranchiseState {
  const ctx = useContext(FranchiseContext);
  if (!ctx) throw new Error('useFranchise must be used inside <FranchiseProvider>');
  return ctx;
}
