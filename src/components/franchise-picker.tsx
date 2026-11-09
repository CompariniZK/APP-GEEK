import * as Haptics from 'expo-haptics';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SvgXml } from 'react-native-svg';

import { Icon } from '@/components/icon';
import { Txt } from '@/components/txt';
import { Radius } from '@/constants/theme';
import { FRANCHISE_ART } from '@/data/franchise-art';
import { FRANCHISES } from '@/data/franchises';
import { useIsDark, useTheme } from '@/hooks/use-theme';
import type { FranchiseId } from '@/lib/types';
import { useFranchise } from '@/state/franchise';

/**
 * The game selector: a row of little cards, one per game, in the game's colour.
 * The chosen one stands up straight and gets a dark frame; the others lean slightly,
 * like cards spread on a table.
 */
export function FranchiseCards() {
  const theme = useTheme();
  const { franchise, setFranchise } = useFranchise();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.cardsRow}
      style={styles.cardsScroll}>
      {FRANCHISES.map((f, i) => {
        const selected = f.id === franchise.id;
        return (
          <Pressable
            key={f.id}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            accessibilityLabel={`Cartes ${f.name}`}
            onPress={() => {
              Haptics.selectionAsync().catch(() => {});
              setFranchise(f.id);
            }}
            style={[
              styles.card,
              {
                backgroundColor: f.color,
                // Light frame on every card, like a real trading card; the chosen one is lifted.
                borderColor: theme.paperRaised,
                transform: selected
                  ? [{ translateY: -8 }]
                  : [{ rotate: i % 2 === 0 ? '-3deg' : '3deg' }, { scale: 0.94 }],
                shadowOpacity: selected ? 0.35 : 0.2,
              },
            ]}>
            <View style={[styles.frame, { borderColor: f.onColor === '#FFFFFF' ? 'rgba(255,255,255,0.35)' : 'rgba(22,20,15,0.18)' }]}>
              <View style={StyleSheet.absoluteFill} pointerEvents="none">
                <SvgXml xml={FRANCHISE_ART[f.id]} width="100%" height="100%" />
              </View>
              <Txt variant="title" size={15} numberOfLines={1} style={{ color: f.onColor }}>
                {f.short}
              </Txt>
              <Txt variant="caption" size={11.5} numberOfLines={2} style={{ color: f.onColor }}>
                {f.name}
              </Txt>
            </View>
            {selected ? (
              <View style={[styles.check, { backgroundColor: theme.signal, borderColor: theme.paperRaised }]}>
                <Icon name={{ ios: 'checkmark', android: 'check' }} size={11} color="#FFFFFF" />
              </View>
            ) : null}
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

/** Compact list used on the map: pick a game from a floating panel. */
export function FranchiseList({ onPicked }: { onPicked: (id: FranchiseId) => void }) {
  const theme = useTheme();
  const dark = useIsDark();
  const { franchise, setFranchise } = useFranchise();
  return (
    <View style={[styles.panel, { backgroundColor: theme.paperRaised }]}>
      {FRANCHISES.map((f) => {
        const selected = f.id === franchise.id;
        return (
          <Pressable
            key={f.id}
            onPress={() => {
              Haptics.selectionAsync().catch(() => {});
              setFranchise(f.id);
              onPicked(f.id);
            }}
            style={({ pressed }) => [
              styles.panelRow,
              selected && { backgroundColor: dark ? f.tintDark : f.tint },
              pressed && { opacity: 0.7 },
            ]}>
            <View style={[styles.panelBadge, { backgroundColor: f.color }]}>
              <Txt variant="caption" size={10.5} style={{ color: f.onColor }}>
                {f.short}
              </Txt>
            </View>
            <Txt variant="bodyStrong" style={styles.panelName}>
              {f.name}
            </Txt>
            {selected ? <Icon name={{ ios: 'checkmark', android: 'check' }} size={14} color={theme.ink} /> : null}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  cardsScroll: { flexGrow: 0 },
  cardsRow: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 12, gap: 10 },
  card: {
    width: 104,
    height: 136,
    borderRadius: 16,
    borderWidth: 3,
    padding: 4,
    shadowColor: '#000000',
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  frame: {
    flex: 1,
    borderRadius: 11,
    borderWidth: 1,
    paddingHorizontal: 7,
    paddingVertical: 6,
    justifyContent: 'space-between',
    overflow: 'hidden',
  },
  check: {
    position: 'absolute',
    top: -9,
    right: -9,
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  panel: {
    borderRadius: Radius.card,
    padding: 6,
    shadowColor: '#16140F',
    shadowOpacity: 0.18,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  panelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 14,
  },
  panelBadge: { width: 34, height: 26, borderRadius: 7, alignItems: 'center', justifyContent: 'center' },
  panelName: { flex: 1 },
});
