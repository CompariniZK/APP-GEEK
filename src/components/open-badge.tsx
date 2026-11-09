import { StyleSheet, View } from 'react-native';

import { Txt } from '@/components/txt';
import { useTheme } from '@/hooks/use-theme';
import { openState } from '@/lib/hours';

/** "[Ouvert] jusqu’à 19h · 450 m" */
export function OpenBadge({ hours, now, extra }: { hours: string | null; now: number; extra?: string | null }) {
  const theme = useTheme();
  const { state, badge, detail } = openState(hours, new Date(now));
  const pill =
    state === 'open'
      ? { bg: theme.goodTint, fg: theme.goodInk }
      : state === 'closed'
        ? { bg: theme.signalTint, fg: theme.signal }
        : { bg: theme.chip, fg: theme.inkSoft };
  const rest = [detail, extra].filter(Boolean).join(' · ');

  return (
    <View style={styles.row}>
      <View style={[styles.pill, { backgroundColor: pill.bg }]}>
        <Txt variant="caption" style={{ color: pill.fg }}>
          {badge}
        </Txt>
      </View>
      {rest ? (
        <Txt variant="small" tone="soft" numberOfLines={1} style={styles.rest}>
          {rest}
        </Txt>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  pill: { paddingHorizontal: 9, paddingVertical: 3, borderRadius: 10 },
  rest: { flexShrink: 1 },
});
