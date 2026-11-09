import * as Haptics from 'expo-haptics';
import { Pressable, StyleSheet, View } from 'react-native';

import { Icon } from '@/components/icon';
import { Txt } from '@/components/txt';
import { Radius } from '@/constants/theme';
import { getFranchise } from '@/data/franchises';
import type { DatedRelease } from '@/data/upcoming';
import { useIsDark, useTheme } from '@/hooks/use-theme';
import { monthTitle } from '@/lib/format';
import { weekdayIndex } from '@/lib/hours';

const WEEKDAYS = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

type Props = {
  month: Date;
  /** Releases to mark (only those in `month` are used). */
  releases: DatedRelease[];
  today: Date;
  selectedDay: number | null;
  onSelectDay: (day: number | null) => void;
  onPrev: () => void;
  onNext: () => void;
};

/**
 * Month grid, Monday first. Release days are coloured circles in the game's colour:
 * filled when the date is confirmed, dashed when it is only estimated. Today has a ring.
 * Several games on the same day get one small dot per game under the number.
 */
export function ReleaseCalendar({ month, releases, today, selectedDay, onSelectDay, onPrev, onNext }: Props) {
  const theme = useTheme();
  const dark = useIsDark();

  const year = month.getFullYear();
  const m = month.getMonth();
  const offset = weekdayIndex(new Date(year, m, 1));
  const daysInMonth = new Date(year, m + 1, 0).getDate();
  const cells: (number | null)[] = [
    ...Array.from({ length: offset }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const inMonth = releases.filter((r) => r.day && r.day.getFullYear() === year && r.day.getMonth() === m);
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();

  return (
    <View style={[styles.card, { backgroundColor: theme.paperRaised }]}>
      <View style={styles.header}>
        <View style={styles.flex}>
          <Txt variant="title" size={21}>
            {monthTitle(month)}
          </Txt>
          <Txt variant="caption" tone="soft">
            {inMonth.length === 0
              ? 'Aucune sortie ce mois-ci'
              : `${inMonth.length} sortie${inMonth.length > 1 ? 's' : ''} ce mois-ci`}
          </Txt>
        </View>
        <Pressable accessibilityLabel="Mois précédent" onPress={onPrev} hitSlop={6} style={[styles.navButton, { backgroundColor: theme.chip }]}>
          <Icon name={{ ios: 'chevron.left', android: 'chevron_left' }} size={14} color={theme.ink} />
        </Pressable>
        <Pressable accessibilityLabel="Mois suivant" onPress={onNext} hitSlop={6} style={[styles.navButton, { backgroundColor: theme.chip }]}>
          <Icon name={{ ios: 'chevron.right', android: 'chevron_right' }} size={14} color={theme.ink} />
        </Pressable>
      </View>

      <View style={styles.grid}>
        {WEEKDAYS.map((d, i) => (
          <View key={`wd-${i}`} style={styles.weekday}>
            <Txt variant="caption" size={12} tone={i >= 5 ? 'soft' : 'faint'}>
              {d}
            </Txt>
          </View>
        ))}

        {cells.map((day, i) => {
          if (day === null) return <View key={`empty-${i}`} style={styles.cell} />;
          const date = new Date(year, m, day);
          const onDay = inMonth.filter((r) => r.day!.getDate() === day);
          const isToday = date.getTime() === startOfToday;
          const isPast = date.getTime() < startOfToday;
          const isSelected = selectedDay === day;
          const first = onDay[0];
          const fr = first ? getFranchise(first.franchise) : null;
          const confirmed = onDay.some((r) => r.confirmed);
          const games = [...new Set(onDay.map((r) => r.franchise))].map((id) => getFranchise(id));

          const circle = fr
            ? confirmed
              ? { backgroundColor: fr.color, borderColor: fr.color, borderStyle: 'solid' as const }
              : { backgroundColor: dark ? fr.tintDark : fr.tint, borderColor: fr.color, borderStyle: 'dashed' as const }
            : isToday
              ? { backgroundColor: 'transparent', borderColor: theme.ink, borderStyle: 'solid' as const }
              : { backgroundColor: 'transparent', borderColor: 'transparent', borderStyle: 'solid' as const };
          const textColor = fr && confirmed ? fr.onColor : theme.ink;

          return (
            <Pressable
              key={`d-${day}`}
              disabled={onDay.length === 0}
              accessibilityLabel={onDay.length ? `${day}, ${onDay.length} sortie${onDay.length > 1 ? 's' : ''}` : undefined}
              onPress={() => {
                Haptics.selectionAsync().catch(() => {});
                onSelectDay(isSelected ? null : day);
              }}
              style={[styles.cell, isPast && !fr && { opacity: 0.4 }, isPast && fr && { opacity: 0.6 }]}>
              <View style={[styles.ring, { borderColor: isSelected ? theme.signal : 'transparent' }]}>
                <View style={[styles.circle, circle]}>
                  <Txt
                    variant={fr || isToday ? 'heading' : 'body'}
                    size={15}
                    style={{ color: textColor, lineHeight: 18 }}>
                    {day}
                  </Txt>
                </View>
              </View>
              <View style={styles.dots}>
                {games.length > 1 || (games.length === 1 && onDay.length > 1)
                  ? onDay.slice(0, 4).map((r) => (
                      <View key={r.id} style={[styles.dot, { backgroundColor: getFranchise(r.franchise).color }]} />
                    ))
                  : null}
              </View>
            </Pressable>
          );
        })}
      </View>

      <View style={[styles.legend, { borderColor: theme.chip }]}>
        <Legend label="Confirmé" swatch={<View style={[styles.legendDot, { backgroundColor: theme.ink }]} />} />
        <Legend
          label="Estimé"
          swatch={<View style={[styles.legendDot, { borderWidth: 1.5, borderStyle: 'dashed', borderColor: theme.ink }]} />}
        />
        <Legend
          label="Aujourd’hui"
          swatch={<View style={[styles.legendDot, { borderWidth: 1.5, borderColor: theme.ink }]} />}
        />
      </View>
    </View>
  );
}

function Legend({ label, swatch }: { label: string; swatch: React.ReactNode }) {
  return (
    <View style={styles.legendItem}>
      {swatch}
      <Txt variant="caption" size={12} tone="soft">
        {label}
      </Txt>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 24, paddingHorizontal: 10, paddingTop: 16, paddingBottom: 12 },
  flex: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 8, marginBottom: 10 },
  navButton: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  weekday: { width: '14.2857%', alignItems: 'center', paddingVertical: 6 },
  cell: { width: '14.2857%', height: 52, alignItems: 'center', paddingTop: 2 },
  ring: { borderRadius: 22, borderWidth: 2, padding: 1.5 },
  circle: { width: 36, height: 36, borderRadius: 18, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  dots: { flexDirection: 'row', gap: 2, height: 6, marginTop: 1 },
  dot: { width: 5, height: 5, borderRadius: 3 },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    borderTopWidth: 1,
    marginTop: 6,
    paddingTop: 10,
    marginHorizontal: 8,
  },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 12, height: 12, borderRadius: Radius.pill },
});
