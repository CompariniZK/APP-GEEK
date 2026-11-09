import { StyleSheet, View } from 'react-native';

import { Icon } from '@/components/icon';
import { Txt } from '@/components/txt';
import { Radius, type Palette } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { formatAgo, LIMIT_LABEL, QUEUE_LABEL, STOCK_LABEL } from '@/lib/format';
import type { Report, StockLevel } from '@/lib/types';

export type StockTone = { solid: string; tint: string; ink: string };

export function stockTone(theme: Palette, stock: StockLevel | undefined): StockTone {
  if (stock === 'beaucoup') return { solid: theme.good, tint: theme.goodTint, ink: theme.goodInk };
  if (stock === 'peu') return { solid: theme.warn, tint: theme.warnTint, ink: theme.warnInk };
  if (stock === 'epuise') return { solid: theme.out, tint: theme.outTint, ink: theme.outInk };
  return { solid: theme.inkFaint, tint: theme.chip, ink: theme.inkSoft };
}

export function stockColor(theme: Palette, stock: StockLevel | undefined): string {
  return stockTone(theme, stock).solid;
}

const STOCK_ICON = {
  beaucoup: { ios: 'checkmark', android: 'check' },
  peu: { ios: 'exclamationmark', android: 'priority_high' },
  epuise: { ios: 'xmark', android: 'close' },
  none: { ios: 'questionmark', android: 'question_mark' },
} as const;

const BARS: Record<StockLevel, number> = { beaucoup: 3, peu: 1, epuise: 0 };

/** Signal-strength style bars: how much stock is left. */
export function SignalBars({ stock, color }: { stock: StockLevel; color: string }) {
  const theme = useTheme();
  return (
    <View style={styles.bars} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      {[8, 13, 18].map((h, i) => (
        <View key={h} style={[styles.bar, { height: h, backgroundColor: i < BARS[stock] ? color : theme.rule }]} />
      ))}
    </View>
  );
}

/** The one big status block: stock level and how fresh the information is. */
export function StatusCard({ report, now }: { report: Report | null; now: number }) {
  const theme = useTheme();
  const tone = stockTone(theme, report?.stock);
  const icon = STOCK_ICON[report?.stock ?? 'none'];

  return (
    <View style={[styles.card, { backgroundColor: tone.tint }]}>
      <View style={[styles.iconCircle, { backgroundColor: tone.solid }]}>
        <Icon name={icon} size={20} color="#FFFFFF" />
      </View>
      <View style={styles.cardText}>
        <Txt variant="title" size={20} style={{ color: tone.ink }}>
          {report ? STOCK_LABEL[report.stock] : 'Pas d’info récente'}
        </Txt>
        <Txt variant="small" size={13.5} style={{ color: tone.ink, opacity: 0.85 }}>
          {report ? `Signalé ${formatAgo(report.createdAt, now)}` : 'Personne n’a signalé depuis 3 h'}
        </Txt>
      </View>
      {report ? <SignalBars stock={report.stock} color={tone.solid} /> : null}
    </View>
  );
}

/** One quiet line under the status: queue and purchase limit. */
export function Facts({ report }: { report: Report }) {
  const theme = useTheme();
  return (
    <View style={styles.facts}>
      <View style={styles.fact}>
        <Icon name={{ ios: 'person.2.fill', android: 'group' }} size={16} color={theme.inkSoft} />
        <Txt variant="bodyStrong" tone="soft" style={{ color: theme.ink }}>
          {QUEUE_LABEL[report.queue]}
        </Txt>
      </View>
      <View style={[styles.dot, { backgroundColor: theme.inkFaint }]} />
      <View style={styles.fact}>
        <Icon name={{ ios: 'bag.fill', android: 'shopping_bag' }} size={15} color={theme.inkSoft} />
        <Txt variant="bodyStrong" style={{ color: report.limit === 'inconnue' ? theme.inkSoft : theme.ink }}>
          {LIMIT_LABEL[report.limit]}
        </Txt>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: Radius.card,
  },
  iconCircle: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  cardText: { flex: 1, gap: 1 },
  bars: { flexDirection: 'row', alignItems: 'flex-end', gap: 3 },
  bar: { width: 5, borderRadius: 2 },
  facts: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 4 },
  fact: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  dot: { width: 4, height: 4, borderRadius: 2 },
});
