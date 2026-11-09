import { StyleSheet, View } from 'react-native';

import { Txt } from '@/components/txt';
import type { Franchise } from '@/lib/types';

/** Small rounded square in the game's colour with its abbreviation (PKM, YGO, OP…). */
export function FranchiseBadge({ franchise, size = 28 }: { franchise: Franchise; size?: number }) {
  const fontSize = franchise.short.length > 2 ? size * 0.34 : size * 0.42;
  return (
    <View
      style={[
        styles.badge,
        { width: size, height: size, borderRadius: size * 0.3, backgroundColor: franchise.color },
      ]}>
      <Txt variant="title" size={fontSize} style={{ color: franchise.onColor, lineHeight: fontSize * 1.1 }}>
        {franchise.short}
      </Txt>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { alignItems: 'center', justifyContent: 'center' },
});
