import { StyleSheet, View } from 'react-native';

import { stockColor } from '@/components/situation';
import { Txt } from '@/components/txt';
import { useTheme } from '@/hooks/use-theme';
import { formatMinutes, todayBounds } from '@/lib/hours';
import type { Report } from '@/lib/types';

/** Today's reports as dots on the store's opening-hours track, with a "now" marker. */
export function Timeline({ reports, hours, now }: { reports: Report[]; hours: string | null; now: number }) {
  const theme = useTheme();
  const today = new Date(now);
  const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
  const todays = reports.filter((r) => r.createdAt >= startOfDay);
  const bounds = todayBounds(hours, today) ?? { open: 8 * 60, close: 20 * 60 };
  const span = bounds.close - bounds.open;
  const pos = (minute: number) => `${Math.min(100, Math.max(0, ((minute - bounds.open) / span) * 100))}%` as const;
  const nowMinute = today.getHours() * 60 + today.getMinutes();
  const nowInside = nowMinute >= bounds.open && nowMinute <= bounds.close;

  return (
    <View style={styles.wrap}>
      <View style={styles.track}>
        <View style={[styles.line, { backgroundColor: theme.chip }]} />
        {nowInside ? <View style={[styles.line, { backgroundColor: theme.rule, width: pos(nowMinute) }]} /> : null}
        {todays.map((r) => {
          const d = new Date(r.createdAt);
          return (
            <View
              key={r.id}
              style={[
                styles.dot,
                { left: pos(d.getHours() * 60 + d.getMinutes()), backgroundColor: stockColor(theme, r.stock), borderColor: theme.paperRaised },
              ]}
            />
          );
        })}
        {nowInside ? <View style={[styles.now, { left: pos(nowMinute), backgroundColor: theme.signal }]} /> : null}
      </View>
      <View style={styles.labels}>
        <Txt variant="caption" tone="soft">
          {formatMinutes(bounds.open)}
        </Txt>
        {nowInside ? (
          <Txt variant="caption" tone="signal">
            maintenant
          </Txt>
        ) : null}
        <Txt variant="caption" tone="soft">
          {formatMinutes(bounds.close)}
        </Txt>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 6 },
  track: { height: 22, justifyContent: 'center' },
  line: { position: 'absolute', left: 0, right: 0, height: 6, borderRadius: 3 },
  dot: { position: 'absolute', width: 14, height: 14, marginLeft: -7, borderRadius: 7, borderWidth: 2 },
  now: { position: 'absolute', width: 2, height: 22, marginLeft: -1, borderRadius: 1 },
  labels: { flexDirection: 'row', justifyContent: 'space-between' },
});
