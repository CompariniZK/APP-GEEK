import { RELEASES } from '@/data/releases';
import { daysUntil, parseLocalDate } from '@/lib/format';
import type { FranchiseId, Release } from '@/lib/types';

export type DatedRelease = Release & { day: Date | null; days: number | null };

/** Every release for a game (or all games), dated first (by date), undated last. */
export function allReleases(now: Date = new Date(), franchise: FranchiseId | 'all' = 'all'): DatedRelease[] {
  return RELEASES.filter((r) => franchise === 'all' || r.franchise === franchise)
    .map((r) => {
      const day = r.date ? parseLocalDate(r.date) : null;
      return { ...r, day, days: day ? daysUntil(day, now) : null };
    })
    .sort((a, b) => {
      if (a.day && b.day) return a.day.getTime() - b.day.getTime();
      return a.day ? -1 : b.day ? 1 : 0;
    });
}

/** Releases from two weeks ago onward, dated first (by date), undated last. */
export function datedReleases(now: Date = new Date(), franchise: FranchiseId | 'all' = 'all'): DatedRelease[] {
  return allReleases(now, franchise).filter((r) => r.days === null || r.days >= -14);
}

export function nextRelease(now: Date = new Date(), franchise: FranchiseId | 'all' = 'all'): DatedRelease | undefined {
  return datedReleases(now, franchise).find((r) => r.days !== null && r.days >= 0);
}
