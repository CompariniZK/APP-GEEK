import * as Haptics from 'expo-haptics';
import { Pressable, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';

import { Txt } from '@/components/txt';
import { Radius } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type Props = {
  label: string;
  onPress: () => void;
  kind?: 'primary' | 'soft';
  style?: StyleProp<ViewStyle>;
};

export function Button({ label, onPress, kind = 'primary', style }: Props) {
  const theme = useTheme();
  const primary = kind === 'primary';
  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => {
        Haptics.selectionAsync().catch(() => {});
        onPress();
      }}
      style={({ pressed }) => [
        styles.base,
        { backgroundColor: primary ? theme.signal : theme.chip },
        pressed && { opacity: 0.8, transform: [{ scale: 0.985 }] },
        style,
      ]}>
      <Txt variant="heading" size={17} tone={primary ? 'onSignal' : 'ink'}>
        {label}
      </Txt>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    height: 52,
    paddingHorizontal: 20,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
