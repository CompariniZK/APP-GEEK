import { SymbolView } from 'expo-symbols';
import type { ComponentProps } from 'react';
import type { ColorValue } from 'react-native';

type SymbolName = ComponentProps<typeof SymbolView>['name'];

/** SF Symbol on iOS, Material Symbol on Android. */
export function Icon({ name, size = 20, color }: { name: SymbolName; size?: number; color: ColorValue }) {
  return <SymbolView name={name} size={size} tintColor={color} weight="semibold" />;
}
