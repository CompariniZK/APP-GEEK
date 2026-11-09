import { StyleSheet, View } from 'react-native';

import { stockColor } from '@/components/situation';
import { useTheme } from '@/hooks/use-theme';
import type { StockLevel } from '@/lib/types';

/**
 * Map marker shaped like a trading card: red card, light frame,
 * and a status pip in the middle (green / amber / grey, or empty when no fresh info).
 */
export function StorePin({ stock, selected, tilt }: { stock?: StockLevel; selected: boolean; tilt: number }) {
  const theme = useTheme();
  const scale = selected ? 1.3 : 1;
  return (
    <View style={styles.hitbox}>
      <View
        style={[
          styles.card,
          {
            backgroundColor: theme.signal,
            borderColor: selected ? theme.ink : theme.paperRaised,
            transform: [{ rotate: `${tilt}deg` }, { scale }],
          },
        ]}>
        <View style={[styles.frame, { borderColor: 'rgba(255,255,255,0.55)' }]}>
          <View
            style={[
              styles.pip,
              stock
                ? { backgroundColor: stockColor(theme, stock), borderColor: theme.paperRaised }
                : { backgroundColor: 'transparent', borderColor: theme.paperRaised },
            ]}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  hitbox: { width: 44, height: 50, alignItems: 'center', justifyContent: 'center' },
  card: {
    width: 24,
    height: 32,
    borderRadius: 4,
    borderWidth: 2,
    padding: 2,
  },
  frame: {
    flex: 1,
    borderRadius: 2,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pip: { width: 10, height: 10, borderRadius: 5, borderWidth: 2 },
});
