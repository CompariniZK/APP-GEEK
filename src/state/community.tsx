import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { AppState } from 'react-native';

import { isFranchiseId } from '@/data/franchises';
import { FRESH_MS } from '@/lib/format';
import { ensureSession, REPORT_COLUMNS, rowToReport, supabase, type ReportRow } from '@/lib/supabase';
import type { FranchiseId, NewReport, Report } from '@/lib/types';

/**
 * Community state (reports + favourites).
 *
 * Online mode (Supabase configured): reports are shared by every fan and arrive live.
 * Local mode (no .env yet): reports stay on this phone, like the first prototype.
 * Favourites are always kept on the phone.
 */
const LOCAL_REPORTS_KEY = 'radargeek/reports/v2';
const ONLINE_CACHE_KEY = 'radargeek/reports-cache/v1';
const FAVORITES_KEY = 'radargeek/favorites/v1';
// Keys from the Pokémon-only prototype ("Booster Radar"), migrated once on first launch.
const LEGACY_REPORTS_KEY = 'booster-radar/reports/v1';
const LEGACY_FAVORITES_KEY = 'booster-radar/favorites/v1';
const KEEP_MS = 7 * 24 * 60 * 60 * 1000;

export type Connection = 'local' | 'connecting' | 'online' | 'offline';

/** Why sending a report failed, so the report screen can say something useful. */
export class ReportError extends Error {
  constructor(public reason: 'rate_limited' | 'auth' | 'network') {
    super(reason);
  }
}

type CommunityState = {
  ready: boolean;
  connection: Connection;
  reports: Report[];
  favorites: string[];
  /** Throws a ReportError when the report could not be saved. */
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

async function loadLocalReports(): Promise<Report[]> {
  const current = await readJson<Report[]>(LOCAL_REPORTS_KEY);
  if (current) return current;
  // The prototype only knew Pokémon: older reports are Pokémon reports.
  const legacy = await readJson<Omit<Report, 'franchise'>[]>(LEGACY_REPORTS_KEY);
  return (legacy ?? []).map((r) => ({ ...r, franchise: 'pokemon' as const }));
}

function freshOnly(reports: Report[]): Report[] {
  const cutoff = Date.now() - KEEP_MS;
  return reports.filter((r) => r.createdAt > cutoff && isFranchiseId(r.franchise));
}

/** Adds reports not already present (realtime and our own insert can deliver the same one). */
function mergeReports(prev: Report[], incoming: Report[]): Report[] {
  const seen = new Set(prev.map((r) => r.id));
  const added = incoming.filter((r) => !seen.has(r.id));
  return added.length ? [...added, ...prev] : prev;
}

async function fetchOnlineReports(): Promise<Report[] | null> {
  if (!supabase) return null;
  const since = new Date(Date.now() - KEEP_MS).toISOString();
  const { data, error } = await supabase
    .from('reports')
    .select(REPORT_COLUMNS)
    .gte('created_at', since)
    .order('created_at', { ascending: false })
    .limit(2000);
  if (error || !data) return null;
  return (data as ReportRow[]).map(rowToReport).filter((r): r is Report => r !== null);
}

export function CommunityProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [connection, setConnection] = useState<Connection>(supabase ? 'connecting' : 'local');
  const [reports, setReports] = useState<Report[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);

  // Favourites: always local.
  useEffect(() => {
    readJson<string[]>(FAVORITES_KEY)
      .then(async (f) => f ?? (await readJson<string[]>(LEGACY_FAVORITES_KEY)) ?? [])
      .then(setFavorites);
  }, []);

  // Reports: local mode.
  useEffect(() => {
    if (supabase) return;
    loadLocalReports().then((stored) => {
      setReports(freshOnly(stored));
      setReady(true);
    });
  }, []);

  // Reports: online mode — cached copy first, then the server, then live updates.
  useEffect(() => {
    const client = supabase;
    if (!client) return;
    let cancelled = false;

    const refresh = async () => {
      const online = await fetchOnlineReports();
      if (cancelled) return;
      if (online) {
        setReports(online);
        setConnection('online');
        AsyncStorage.setItem(ONLINE_CACHE_KEY, JSON.stringify(online)).catch(() => {});
      } else {
        setConnection('offline');
      }
    };

    (async () => {
      const cached = await readJson<Report[]>(ONLINE_CACHE_KEY);
      if (!cancelled && cached) setReports(freshOnly(cached));
      setReady(true);
      await ensureSession();
      await refresh();
    })();

    const channel = client
      .channel('reports-live')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'reports' }, (payload) => {
        const report = rowToReport(payload.new as ReportRow);
        if (report) setReports((prev) => mergeReports(prev, [report]));
      })
      .subscribe();

    // Catch up on anything missed while the app was in the background.
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') refresh();
    });

    return () => {
      cancelled = true;
      sub.remove();
      client.removeChannel(channel);
    };
  }, []);

  const addReport = useCallback(async (input: NewReport) => {
    if (!supabase) {
      const report: Report = {
        ...input,
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        createdAt: Date.now(),
      };
      setReports((prev) => {
        const next = [report, ...prev];
        AsyncStorage.setItem(LOCAL_REPORTS_KEY, JSON.stringify(next)).catch(() => {});
        return next;
      });
      return;
    }

    if (!(await ensureSession())) throw new ReportError('auth');
    const { data, error } = await supabase
      .from('reports')
      .insert({
        store_id: input.storeId,
        franchise: input.franchise,
        stock: input.stock,
        queue: input.queue,
        purchase_limit: input.limit,
      })
      .select(REPORT_COLUMNS)
      .single();
    if (error) {
      if (error.message.includes('rate_limited')) throw new ReportError('rate_limited');
      throw new ReportError('network');
    }
    const report = rowToReport(data as ReportRow);
    if (report) setReports((prev) => mergeReports(prev, [report]));
    setConnection('online');
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
      connection,
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
  }, [ready, connection, reports, favorites, addReport, toggleFavorite]);

  return <CommunityContext.Provider value={value}>{children}</CommunityContext.Provider>;
}

export function useCommunity(): CommunityState {
  const ctx = useContext(CommunityContext);
  if (!ctx) throw new Error('useCommunity must be used inside <CommunityProvider>');
  return ctx;
}
