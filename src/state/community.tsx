import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { isFranchiseId } from '@/data/franchises';
import { FRESH_MS } from '@/lib/format';
import type { FranchiseId, NewReport, Report } from '@/lib/types';

/**
 * Community state (reports + favourites).
 * For now everything lives on the phone (AsyncStorage). The public API of this
 * provider is what the online (Supabase) version will implement later, so screens won't change.
 */
const REPORTS_KEY = 'radargeek/reports/v2';
const FAVORITES_KEY = 'radargeek/favorites/v1';
// Keys from the Pokémon-only prototype ("Booster Radar"), migrated once on first launch.
const LEGACY_REPORTS_KEY = 'booster-radar/reports/v1';
const LEGACY_FAVORITES_KEY = 'booster-radar/favorites/v1';
const KEEP_MS = 7 * 24 * 60 * 60 * 1000;

type CommunityState = {
  ready: boolean;
  reports: Report[];
  favorites: string[];
  addReport: (report: NewReport) => Promise<void>;
  toggleFavorite: (storeId: string) => void;
  isFavorite: (storeId: string) => boolean;
  /** Reports for a store, newest first; all games unless `franchise` is given. */
  reportsFor: (storeId: string, franchise?: FranchiseId) => Report[];
  /** Latest report for this store and game if it is still fresh, otherwise null. */
  currentReport: (storeId: string, franchise: FranchiseId, now: number) => Report | null;
  /** Newest reports for a game across all stores, within the last 24 h. */
  recentReports: (franchise: FranchiseId, now: number, limit?: number) => Report[];
};

const CommunityContext = createContext<CommunityState | null>(null);

async function readJson<T>(key: string): Promise<T | null> {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

async function loadReports(): Promise<Report[]> {
  const current = await readJson<Report[]>(REPORTS_KEY);
  if (current) return current;
  // The prototype only knew Pokémon: older reports are Pokémon reports.
  const legacy = await readJson<Omit<Report, 'franchise'>[]>(LEGACY_REPORTS_KEY);
  return (legacy ?? []).map((r) => ({ ...r, franchise: 'pokemon' as const }));
}

export function CommunityProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [reports, setReports] = useState<Report[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    (async () => {
      const [storedReports, storedFavorites] = await Promise.all([
        loadReports(),
        readJson<string[]>(FAVORITES_KEY).then(async (f) => f ?? (await readJson<string[]>(LEGACY_FAVORITES_KEY)) ?? []),
      ]);
      const cutoff = Date.now() - KEEP_MS;
      setReports(storedReports.filter((r) => r.createdAt > cutoff && isFranchiseId(r.franchise)));
      setFavorites(storedFavorites);
      setReady(true);
    })();
  }, []);

  const addReport = useCallback(async (input: NewReport) => {
    const report: Report = {
      ...input,
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      createdAt: Date.now(),
    };
    setReports((prev) => {
      const next = [report, ...prev];
      AsyncStorage.setItem(REPORTS_KEY, JSON.stringify(next)).catch(() => {});
      return next;
    });
  }, []);

  const toggleFavorite = useCallback((storeId: string) => {
    setFavorites((prev) => {
      const next = prev.includes(storeId) ? prev.filter((id) => id !== storeId) : [...prev, storeId];
      AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(next)).catch(() => {});
      return next;
    });
  }, []);

  const value = useMemo<CommunityState>(() => {
    const sorted = [...reports].sort((a, b) => b.createdAt - a.createdAt);
    const reportsFor = (storeId: string, franchise?: FranchiseId) =>
      sorted.filter((r) => r.storeId === storeId && (!franchise || r.franchise === franchise));
    return {
      ready,
      reports,
      favorites,
      addReport,
      toggleFavorite,
      isFavorite: (storeId) => favorites.includes(storeId),
      reportsFor,
      currentReport: (storeId, franchise, now) => {
        const latest = reportsFor(storeId, franchise)[0];
        return latest && now - latest.createdAt < FRESH_MS ? latest : null;
      },
      recentReports: (franchise, now, limit = 5) =>
        sorted.filter((r) => r.franchise === franchise && now - r.createdAt < 24 * 60 * 60 * 1000).slice(0, limit),
    };
  }, [ready, reports, favorites, addReport, toggleFavorite]);

  return <CommunityContext.Provider value={value}>{children}</CommunityContext.Provider>;
}

export function useCommunity(): CommunityState {
  const ctx = useContext(CommunityContext);
  if (!ctx) throw new Error('useCommunity must be used inside <CommunityProvider>');
  return ctx;
}
