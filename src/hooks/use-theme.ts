import { Colors, type Palette } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export function useTheme(): Palette {
  const scheme = useColorScheme();
  return Colors[scheme === 'dark' ? 'dark' : 'light'];
}

export function useIsDark(): boolean {
  return useColorScheme() === 'dark';
}
