import { StyleSheet, View } from 'react-native';

import { Txt } from '@/components/txt';
import { useTheme } from '@/hooks/use-theme';

/** Several stores too close to tell apart: a small stack of cards with a count. */
export function ClusterPin({ count }: { count: number }) {
  const theme = useTheme();
  const card = { backgroundColor: theme.signal, borderColor: theme.paperRaised };
  return (
    <View style={styles.hitbox}>
      <View style={[styles.card, card, { transform: [{ rotate: '-12deg' }], left: 8 }]} />
      <View style={[styles.card, card, { transform: [{ rotate: '8deg' }], left: 15 }]} />
      <View style={[styles.badge, { backgroundColor: theme.ink, borderColor: theme.paperRaised }]}>
        <Txt variant="caption" size={11.5} style={{ color: theme.paper }}>
          {count}
        </Txt>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  hitbox: { width: 52, height: 52 },
  card: { position: 'absolute', top: 12, width: 22, height: 30, borderRadius: 4, borderWidth: 2 },
  badge: {
    position: 'absolute',
    right: 2,
    top: 4,
    minWidth: 22,
    height: 22,
    paddingHorizontal: 5,
    borderRadius: 11,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
