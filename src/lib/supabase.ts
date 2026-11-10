import 'react-native-url-polyfill/auto';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { AppState } from 'react-native';

import { isFranchiseId } from '@/data/franchises';
import type { PurchaseLimit, QueueLevel, Report, StockLevel } from '@/lib/types';

/**
 * Supabase client, or null when the project isn't configured yet (no .env):
 * the app then keeps working in local mode, with reports stored on the phone only.
 * Only the PUBLIC key belongs in the app; security comes from the rules in supabase/schema.sql.
 */
const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const key = process.env.EXPO_PUBLIC_SUPABASE_KEY;
const configured = Boolean(url && key && !url.includes('YOUR-PROJECT'));

export const supabase: SupabaseClient | null = configured
  ? createClient(url!, key!, {
      auth: { storage: AsyncStorage, autoRefreshToken: true, persistSession: true, detectSessionInUrl: false },
    })
  : null;

if (supabase) {
  // Refresh the session only while the app is on screen (recommended for React Native).
  AppState.addEventListener('change', (state) => {
    if (state === 'active') supabase.auth.startAutoRefresh();
    else supabase.auth.stopAutoRefresh();
  });
}

export const REPORT_COLUMNS = 'id, store_id, franchise, stock, queue, purchase_limit, created_at';

export type ReportRow = {
  id: string;
  store_id: string;
  franchise: string;
  stock: string;
  queue: string;
  purchase_limit: string;
  created_at: string;
};

const STOCKS: StockLevel[] = ['beaucoup', 'peu', 'epuise'];
const QUEUES: QueueLevel[] = ['aucune', 'petite', 'longue'];
const LIMITS: PurchaseLimit[] = ['aucune', '1', '2', '3+', 'inconnue'];

/** Database row → app report; null if the row holds a value this version doesn't know. */
export function rowToReport(row: ReportRow): Report | null {
  if (
    !isFranchiseId(row.franchise) ||
    !STOCKS.includes(row.stock as StockLevel) ||
    !QUEUES.includes(row.queue as QueueLevel) ||
    !LIMITS.includes(row.purchase_limit as PurchaseLimit)
  ) {
    return null;
  }
  return {
    id: row.id,
    storeId: row.store_id,
    franchise: row.franchise,
    stock: row.stock as StockLevel,
    queue: row.queue as QueueLevel,
    limit: row.purchase_limit as PurchaseLimit,
    createdAt: new Date(row.created_at).getTime(),
  };
}

/** Makes sure this phone has an (anonymous) session; returns false if it can't get one. */
export async function ensureSession(): Promise<boolean> {
  if (!supabase) return false;
  const { data } = await supabase.auth.getSession();
  if (data.session) return true;
  const { error } = await supabase.auth.signInAnonymously();
  return !error;
}
